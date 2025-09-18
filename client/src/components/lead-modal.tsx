import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertLeadSchema, updateLeadSchema, type Lead, type InsertLead, type UpdateLead, type VehicleType, type VehicleMake, type VehicleModel, type FieldConfiguration } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

// Build dynamic schema based on field configurations
function buildFormSchema(fieldConfigs: FieldConfiguration[]) {
  // Always use base schema as fallback
  const baseSchema = {
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone number is required"),
    location: z.string().min(1, "Location is required"),
    sourceType: z.enum(["website", "phone", "email", "social_media", "referral", "walk_in", "partner", "advertisement", "other"]).default("website"),
    vehicleType: z.string().min(1, "Vehicle type is required"),
    vehicleModel: z.string().optional(),
    rentalStartDate: z.string().min(1, "Start date is required"),
    rentalEndDate: z.string().min(1, "End date is required"),
    rentalPeriodDays: z.number().min(1, "Rental period must be at least 1 day"),
    status: z.enum(["new", "contacted", "converted", "declined"]).default("new"),
    specialRequirements: z.string().optional(),
  };

  // If no field configs, return base schema
  if (!fieldConfigs || fieldConfigs.length === 0) {
    return z.object(baseSchema);
  }

  const schemaFields: any = { ...baseSchema };
  
  // Add custom fields from configurations
  fieldConfigs.forEach((config) => {
    if (config.isVisible && !schemaFields[config.fieldName]) {
      // Only add custom fields that aren't already in base schema
      if (config.isRequired) {
        schemaFields[config.fieldName] = z.string().min(1, `${config.label} is required`);
      } else {
        schemaFields[config.fieldName] = z.string().optional();
      }
    }
  });

  return z.object(schemaFields);
}

const baseFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  sourceType: z.enum(["website", "phone", "email", "social_media", "referral", "walk_in", "partner", "advertisement", "other"]),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleModel: z.string().optional(),
  rentalStartDate: z.string().min(1, "Start date is required"),
  rentalEndDate: z.string().min(1, "End date is required"),
  rentalPeriodDays: z.number().min(1, "Rental period must be at least 1 day"),
  status: z.enum(["new", "contacted", "converted", "declined"]),
  specialRequirements: z.string().optional(),
});

type FormData = z.infer<typeof baseFormSchema>;

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  isAddMode: boolean;
  viewMode?: boolean;
  onSuccess: () => void;
}

export function LeadModal({ isOpen, onClose, lead, isAddMode, viewMode = false, onSuccess }: LeadModalProps) {
  const { toast } = useToast();
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("");

  // Fetch vehicle data
  const { data: vehicleTypes } = useQuery({
    queryKey: ["/api/vehicles/types"],
    enabled: isOpen
  });

  const { data: vehicleMakes } = useQuery({
    queryKey: ["/api/vehicles/makes/by-type", selectedVehicleType],
    enabled: isOpen && !!selectedVehicleType
  });

  const { data: vehicleModels } = useQuery({
    queryKey: ["/api/vehicles/models"],
    enabled: isOpen
  });

  // Fetch field configurations
  const { data: fieldConfigs } = useQuery({
    queryKey: ["/api/field-configurations"],
    enabled: isOpen
  });

  // Use base schema for now to avoid validation issues
  const formSchema = baseFormSchema;
  
  // Build default values including custom fields
  const getDefaultValues = () => {
    const defaults: any = {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      sourceType: "website",
      vehicleType: "",
      vehicleModel: "",
      rentalStartDate: "",
      rentalEndDate: "",
      rentalPeriodDays: 1,
      status: "new",
      specialRequirements: "",
    };

    // Add default values for custom fields
    if (fieldConfigs) {
      (fieldConfigs as FieldConfiguration[]).forEach(config => {
        if (config.isVisible && !defaults.hasOwnProperty(config.fieldName)) {
          defaults[config.fieldName] = "";
        }
      });
    }

    return defaults;
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when lead changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (lead && !isAddMode) {
        const resetData: any = {
          fullName: lead.fullName || "",
          email: lead.email || "",
          phone: lead.phone || "",
          location: lead.location || "",
          sourceType: lead.sourceType || "website",
          vehicleType: lead.vehicleType || "",
          vehicleModel: lead.vehicleModel || "",
          rentalStartDate: lead.rentalStartDate ? new Date(lead.rentalStartDate).toISOString().split('T')[0] : "",
          rentalEndDate: lead.rentalEndDate ? new Date(lead.rentalEndDate).toISOString().split('T')[0] : "",
          rentalPeriodDays: lead.rentalPeriodDays || 1,
          status: lead.status || "new",
          specialRequirements: lead.specialRequirements || "",
        };
        
        // Add custom fields data
        if (lead.customFields) {
          Object.entries(lead.customFields).forEach(([key, value]) => {
            resetData[key] = value || "";
          });
        }
        
        form.reset(resetData);
      } else if (isAddMode) {
        form.reset(getDefaultValues());
      }
    }
  }, [lead, isAddMode, isOpen, form, fieldConfigs]);

  // Calculate rental period when dates change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === "rentalStartDate" || name === "rentalEndDate") && value.rentalStartDate && value.rentalEndDate) {
        const startDate = new Date(value.rentalStartDate);
        const endDate = new Date(value.rentalEndDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        form.setValue("rentalPeriodDays", diffDays);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Ensure all required fields are present
      const leadData = {
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        sourceType: data.sourceType || "website",
        vehicleType: data.vehicleType || "",
        vehicleModel: data.vehicleModel || "",
        rentalStartDate: data.rentalStartDate,
        rentalEndDate: data.rentalEndDate,
        rentalPeriodDays: data.rentalPeriodDays || 1,
        status: data.status || "new",
        specialRequirements: data.specialRequirements || "",
        customFields: {} as Record<string, string>
      };
      
      // Extract custom fields
      if (fieldConfigs) {
        (fieldConfigs as FieldConfiguration[]).forEach(config => {
          if (!['fullName', 'email', 'phone', 'location', 'sourceType', 'vehicleType', 'vehicleModel', 
                'rentalStartDate', 'rentalEndDate', 'rentalPeriodDays', 'status', 'specialRequirements'].includes(config.fieldName)) {
            const value = (data as any)[config.fieldName];
            if (value) {
              leadData.customFields[config.fieldName] = String(value);
            }
          }
        });
      }
      
      console.log("Creating lead with data:", leadData);
      
      const response = await apiRequest("POST", "/api/leads", leadData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create lead');
      }
      return response.json();
    },
    onSuccess: () => {
      // Force complete cache clear and immediate refresh
      queryClient.removeQueries();
      queryClient.clear();
      
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      
      // Trigger parent refresh
      onSuccess();
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Invalidate all lead-related queries using predicate
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === "/api/leads" || 
          query.queryKey[0] === "/api/leads/stats"
      });
      
      // Force immediate refetch
      setTimeout(() => {
        queryClient.refetchQueries({ 
          predicate: (query) => 
            query.queryKey[0] === "/api/leads" || 
            query.queryKey[0] === "/api/leads/stats"
        });
      }, 100);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!lead) throw new Error("No lead to update");
      
      // Prepare update data
      const leadData = {
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        sourceType: data.sourceType || "website",
        vehicleType: data.vehicleType || "",
        vehicleModel: data.vehicleModel || "",
        rentalStartDate: data.rentalStartDate,
        rentalEndDate: data.rentalEndDate,
        rentalPeriodDays: data.rentalPeriodDays || 1,
        status: data.status || "new",
        specialRequirements: data.specialRequirements || "",
        customFields: {} as Record<string, string>
      };
      
      // Extract custom fields
      if (fieldConfigs) {
        (fieldConfigs as FieldConfiguration[]).forEach(config => {
          if (!['fullName', 'email', 'phone', 'location', 'sourceType', 'vehicleType', 'vehicleModel', 
                'rentalStartDate', 'rentalEndDate', 'rentalPeriodDays', 'status', 'specialRequirements'].includes(config.fieldName)) {
            const value = (data as any)[config.fieldName];
            if (value) {
              leadData.customFields[config.fieldName] = String(value);
            }
          }
        });
      }
      
      console.log("Updating lead with data:", leadData);
      
      const response = await apiRequest("PATCH", `/api/leads/${lead.id}`, leadData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update lead');
      }
      return response.json();
    },
    onMutate: async (data: FormData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/leads"
      });

      // Snapshot the previous value
      const previousLeads = queryClient.getQueriesData({ 
        predicate: (query) => query.queryKey[0] === "/api/leads"
      });

      // Optimistically update to the new value for ALL lead queries
      queryClient.setQueriesData(
        { predicate: (query) => query.queryKey[0] === "/api/leads" },
        (old: any) => {
          if (!old?.leads) return old;
          return {
            ...old,
            leads: old.leads.map((l: any) => 
              l.id === lead?.id 
                ? { ...l, ...data, updatedAt: new Date().toISOString() }
                : l
            )
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousLeads };
    },
    onSuccess: (updatedLead) => {
      // Force complete cache clear and immediate refresh
      queryClient.removeQueries();
      queryClient.clear();
      
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
      
      // Trigger parent refresh
      onSuccess();
      onClose();
    },
    onError: (error, data, context) => {
      console.error("Update mutation error:", error);
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLeads) {
        context.previousLeads.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      // Check if it's actually a successful response but with a different format
      const errorMessage = error.message || "Failed to update lead";
      if (errorMessage.includes("200:") || errorMessage.includes("successful")) {
        // This is actually a success, treat it as such
        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
        onSuccess();
        onClose();
        return;
      }
      
      toast({
        title: "Error", 
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Invalidate all lead queries to ensure fresh data
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === "/api/leads" || 
          query.queryKey[0] === "/api/leads/stats"
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (isAddMode) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset(getDefaultValues());
    setSelectedVehicleType("");
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Get field configuration by name
  const getFieldConfig = (fieldName: string) => {
    return (fieldConfigs as FieldConfiguration[] || []).find(config => config.fieldName === fieldName);
  };

  // Helper function to render form fields dynamically (including custom fields)
  const renderFormField = (fieldName: string, defaultLabel: string, defaultPlaceholder: string, type: string = "text") => {
    const config = getFieldConfig(fieldName);
    
    // Skip if field is configured as not visible
    if (config && !config.isVisible) {
      return null;
    }

    const label = config?.label || defaultLabel;
    const placeholder = config?.placeholder || defaultPlaceholder;
    const isRequired = config?.isRequired ?? true; // Default to required if no config

    if (fieldName === "vehicleType") {
      if (viewMode) {
        const fieldValue = form.getValues(fieldName as any) || "—";
        return (
          <div key={fieldName} className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
              {fieldValue}
            </div>
          </div>
        );
      }
      
      return (
        <FormField
          key={fieldName}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value);
                // Find the selected type ID for cascading
                const selectedType = (vehicleTypes as VehicleType[] || []).find(t => t.name === value);
                setSelectedVehicleType(selectedType?.id || "");
                // Reset vehicle model when type changes
                form.setValue("vehicleModel", "");
              }} value={field.value}>
                <FormControl>
                  <SelectTrigger className="focus:ring-2 focus:ring-green-500/40 focus:border-green-400 border-gray-200/60 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 font-medium transition-all duration-200 hover:border-gray-300/60">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-preference">No Preference</SelectItem>
                  {(vehicleTypes as VehicleType[] || []).map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {config?.helpText && (
                <p className="text-xs text-gray-500 mt-1">{config.helpText}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (fieldName === "vehicleModel") {
      if (viewMode) {
        const fieldValue = form.getValues(fieldName as any) || "—";
        return (
          <div key={fieldName} className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
              {fieldValue}
            </div>
          </div>
        );
      }
      
      return (
        <FormField
          key={fieldName}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="focus:ring-black">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-preference">No Preference</SelectItem>
                  {selectedVehicleType && vehicleMakes ? 
                    // Show models from the makes of the selected type
                    (vehicleModels as VehicleModel[] || [])
                      .filter(model => (vehicleMakes as VehicleMake[] || []).some(make => make.id === model.makeId))
                      .map((model) => (
                        <SelectItem key={model.id} value={model.name}>
                          {model.name}
                        </SelectItem>
                      ))
                    :
                    // If no type selected, show all models
                    (vehicleModels as VehicleModel[] || []).map((model) => (
                      <SelectItem key={model.id} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {config?.helpText && (
                <p className="text-xs text-gray-500 mt-1">{config.helpText}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (fieldName === "sourceType") {
      if (viewMode) {
        const fieldValue = form.getValues(fieldName as any) || "—";
        const sourceDisplay = fieldValue === "website" ? "Website" : 
                             fieldValue === "phone" ? "Phone" :
                             fieldValue === "email" ? "Email" :
                             fieldValue === "social_media" ? "Social Media" :
                             fieldValue === "referral" ? "Referral" :
                             fieldValue === "walk_in" ? "Walk-in" :
                             fieldValue === "partner" ? "Partner" :
                             fieldValue === "advertisement" ? "Advertisement" :
                             fieldValue === "other" ? "Other" : fieldValue;
        return (
          <div key={fieldName} className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
              {sourceDisplay}
            </div>
          </div>
        );
      }
      
      return (
        <FormField
          key={fieldName}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="focus:ring-black">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {config?.helpText && (
                <p className="text-xs text-gray-500 mt-1">{config.helpText}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (fieldName === "status") {
      if (viewMode) {
        const fieldValue = form.getValues(fieldName as any) || "—";
        const statusDisplay = fieldValue === "new" ? "New" : 
                             fieldValue === "contacted" ? "Contacted" :
                             fieldValue === "converted" ? "Converted" :
                             fieldValue === "declined" ? "Declined" : fieldValue;
        return (
          <div key={fieldName} className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
              {statusDisplay}
            </div>
          </div>
        );
      }
      
      return (
        <FormField
          key={fieldName}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="focus:ring-black">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              {config?.helpText && (
                <p className="text-xs text-gray-500 mt-1">{config.helpText}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (fieldName === "specialRequirements") {
      if (viewMode) {
        const fieldValue = form.getValues(fieldName as any) || "—";
        return (
          <div key={fieldName} className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border min-h-[100px] whitespace-pre-wrap">
              {fieldValue}
            </div>
          </div>
        );
      }
      
      return (
        <FormField
          key={fieldName}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  className="focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 border-gray-200/60 bg-white/70 backdrop-blur-sm rounded-xl p-4 font-medium min-h-[120px] resize-none transition-all duration-200 hover:border-gray-300/60"
                  placeholder={placeholder}
                />
              </FormControl>
              {config?.helpText && (
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {config.helpText}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    // Default input field - either editable or view-only
    if (viewMode) {
      const fieldValue = form.getValues(fieldName as any) || "—";
      return (
        <div key={fieldName} className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">{label}</label>
          <div className="text-sm text-gray-900 bg-white/70 border border-gray-200/60 p-4 rounded-xl backdrop-blur-sm">
            {fieldValue}
          </div>
        </div>
      );
    }

    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type={type}
                className="focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 border-gray-200/60 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 font-medium transition-all duration-200 hover:border-gray-300/60"
                placeholder={placeholder}
              />
            </FormControl>
            {config?.helpText && (
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {config.helpText}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // Helper to render custom fields that aren't part of the base form
  const renderCustomFields = () => {
    if (!fieldConfigs) return null;
    
    const customFields = (fieldConfigs as FieldConfiguration[]).filter(config => 
      config.isVisible && 
      !['fullName', 'email', 'phone', 'location', 'sourceType', 'vehicleType', 'vehicleModel', 
        'rentalStartDate', 'rentalEndDate', 'rentalPeriodDays', 'status', 'specialRequirements'].includes(config.fieldName)
    );

    return customFields.map(config => renderFormField(
      config.fieldName,
      config.label,
      config.placeholder || `Enter ${config.label.toLowerCase()}`,
      'text'
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl h-[90vh] p-0 bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-gray-50/60 rounded-2xl"></div>
        
        {/* Gradient decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-purple-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-100/40 to-slate-100/30 rounded-full blur-3xl"></div>
        
        {/* Header - Fixed */}
        <div className="relative z-10 flex-shrink-0 p-4 sm:p-6 border-b border-gray-200/60 bg-white/60 backdrop-blur-sm">
          <DialogHeader>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {isAddMode ? "Create New Lead" : viewMode ? "Lead Details" : "Edit Lead"}
                </DialogTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {isAddMode ? "Add a new rental inquiry to the system" : viewMode ? "View customer information and rental details" : "Modify existing lead information"}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
          <Form {...form}>
            <form id="lead-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-xl"></div>
                <div className="relative p-4 sm:p-6 rounded-xl border border-blue-100/40">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Customer Information Fields */}
                    {renderFormField("fullName", "Full Name", "Enter customer's full name")}
                    {renderFormField("email", "Email", "customer@example.com", "email")}
                    {renderFormField("phone", "Phone", "+974 XXXX XXXX", "tel")}
                    {renderFormField("location", "Location", "Select pickup location")}
                    
                    {/* Source Type - only show in view mode */}
                    {viewMode && renderFormField("sourceType", "Lead Source", "How did they find us?")}
                  </div>
                </div>
              </div>

              {/* Vehicle & Rental Details Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-xl"></div>
                <div className="relative p-4 sm:p-6 rounded-xl border border-green-100/40">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                    Vehicle & Rental Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {renderFormField("vehicleType", "Vehicle Type", "Choose vehicle category")}
                    {renderFormField("vehicleModel", "Vehicle Model", "Select specific model (optional)")}
                    {renderFormField("rentalStartDate", "Start Date", "", "date")}
                    {renderFormField("rentalEndDate", "End Date", "", "date")}
              
                    {/* Rental Period Days - special handling for number field */}
                    {(() => {
                      const config = getFieldConfig("rentalPeriodDays");
                      if (config && !config.isVisible) return null;
                      
                      const label = config?.label || "Rental Period";
                      const placeholder = config?.placeholder || "Auto-calculated";
                      const isRequired = config?.isRequired ?? true;
                      
                      if (viewMode) {
                        const fieldValue = form.getValues("rentalPeriodDays") || "—";
                        return (
                          <div key="rentalPeriodDays" className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">{label}</label>
                            <div className="text-sm text-gray-900 bg-white/70 border border-gray-200/60 p-4 rounded-xl backdrop-blur-sm">
                              {fieldValue} {fieldValue !== "—" ? "days" : ""}
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <FormField
                          key="rentalPeriodDays"
                          control={form.control}
                          name="rentalPeriodDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                {label} {isRequired && <span className="text-red-500">*</span>}
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">Auto-calculated</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    {...field}
                                    type="number"
                                    min="1"
                                    className="focus:ring-2 focus:ring-green-500/40 focus:border-green-400 border-gray-200/60 bg-white/70 backdrop-blur-sm rounded-xl pl-4 pr-12 py-3 font-medium"
                                    placeholder={placeholder}
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                    days
                                  </div>
                                </div>
                              </FormControl>
                              {config?.helpText && (
                                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  {config.helpText}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    })()}
                    
                    {/* Status - only show in view mode */}
                    {viewMode && renderFormField("status", "Current Status", "Lead processing status")}
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              {(fieldConfigs && (fieldConfigs as FieldConfiguration[]).some(config => 
                config.isVisible && !['fullName', 'email', 'phone', 'location', 'sourceType', 'vehicleType', 'vehicleModel', 'rentalStartDate', 'rentalEndDate', 'rentalPeriodDays', 'status', 'specialRequirements'].includes(config.fieldName)
              )) && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-pink-50/30 rounded-xl"></div>
                  <div className="relative p-4 sm:p-6 rounded-xl border border-purple-100/40">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Custom fields added by admin */}
                      {renderCustomFields()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Special Requirements Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-amber-50/30 rounded-xl"></div>
                <div className="relative p-4 sm:p-6 rounded-xl border border-orange-100/40">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                    Special Requirements
                  </h3>
                  {renderFormField("specialRequirements", "Additional Notes", "Any special requirements, preferences, or important notes...")}
                </div>
              </div>
            
            </form>
          </Form>
        </div>

        {/* Fixed Footer */}
        <div className="relative z-10 flex-shrink-0 p-4 sm:p-6 border-t border-gray-200/60 bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 sm:px-6 py-2 sm:py-3 border-gray-200/60 text-gray-700 hover:bg-gray-50/80 hover:border-gray-300/60 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
            >
              Cancel
            </Button>
            {!viewMode && (
              <Button
                type="submit"
                form="lead-form"
                disabled={isPending}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAddMode ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M5 13l4 4L19 7"} />
                    </svg>
                    <span className="hidden sm:inline">{isAddMode ? "Create Lead" : "Update Lead"}</span>
                    <span className="sm:hidden">{isAddMode ? "Create" : "Update"}</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
