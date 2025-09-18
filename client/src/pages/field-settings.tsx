import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Settings, Edit, Save, X, Plus, Eye, EyeOff, AlertCircle, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FieldConfiguration } from "@shared/schema";

const fieldConfigSchema = z.object({
  fieldName: z.string().min(1, "Field name is required"),
  isRequired: z.boolean(),
  isVisible: z.boolean(),
  label: z.string().min(1, "Label is required"),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  fieldOrder: z.number().min(0),
});

type FieldConfigFormData = z.infer<typeof fieldConfigSchema>;

export default function FieldSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<FieldConfiguration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redirect non-admin users
  if (!authLoading && (!user || (user as any).role !== "admin")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">Admin access required to view field settings.</p>
              <Link href="/">
                <Button>Return to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: fieldConfigs, isLoading } = useQuery({
    queryKey: ["/api/field-configurations"],
    enabled: !!user && (user as any).role === "admin",
  });

  const form = useForm<FieldConfigFormData>({
    resolver: zodResolver(fieldConfigSchema),
    defaultValues: {
      fieldName: "",
      isRequired: true,
      isVisible: true,
      label: "",
      placeholder: "",
      helpText: "",
      fieldOrder: 0,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FieldConfigFormData> }) => {
      return await apiRequest("PATCH", `/api/field-configurations/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Field configuration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/field-configurations"] });
      setEditingField(null);
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
        description: "Failed to update field configuration",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FieldConfigFormData) => {
      return await apiRequest("POST", "/api/field-configurations", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Field configuration created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/field-configurations"] });
      setIsDialogOpen(false);
      form.reset();
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
        description: "Failed to create field configuration",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/field-configurations/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Field configuration deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/field-configurations"] });
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
        description: "Failed to delete field configuration",
        variant: "destructive",
      });
    },
  });

  const handleToggleRequired = (field: FieldConfiguration) => {
    updateMutation.mutate({
      id: field.id,
      data: { isRequired: !field.isRequired },
    });
  };

  const handleToggleVisible = (field: FieldConfiguration) => {
    updateMutation.mutate({
      id: field.id,
      data: { isVisible: !field.isVisible },
    });
  };

  const handleDeleteField = (fieldId: string) => {
    if (confirm("Are you sure you want to delete this field configuration? This action cannot be undone.")) {
      deleteMutation.mutate(fieldId);
    }
  };

  const onSubmit = (data: FieldConfigFormData) => {
    createMutation.mutate(data);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-gray-100/20 to-slate-100/20 rounded-full blur-3xl"></div>
      </div>

      <header className="relative bg-white/90 backdrop-blur-lg border-0 shadow-lg shadow-black/5 ring-1 ring-black/5">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-6 lg:space-x-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-gray-800/5 rounded-xl blur-md transform rotate-1"></div>
                <img 
                  src="https://raw.githubusercontent.com/iftikhar1986/image/eef9d1dbfef3ace5092c3dd259b075b66311ac39/logo.png" 
                  alt="Q-Mobility Logo" 
                  className="relative h-10 sm:h-12 lg:h-14 w-auto drop-shadow-sm"
                />
              </div>
              <div className="border-l border-gray-200 pl-3 sm:pl-6 lg:pl-8">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Field Settings</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Configure form fields and requirements</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <Link href="/">
                <Button variant="ghost" className="h-8 sm:h-10 lg:h-11 px-2 sm:px-3 lg:px-4 rounded-xl hover:bg-gray-100/80 transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <ArrowLeft className="h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 group text-xs sm:text-sm">
                    <Plus className="mr-1 sm:mr-2 lg:mr-3 group-hover:rotate-90 transition-transform duration-300" size={14} />
                    <span className="hidden sm:inline">Add Field</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Field Configuration</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fieldName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., customField" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Label</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Custom Field" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="placeholder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Placeholder Text</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Enter value..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="helpText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Help Text</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Additional information about this field" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="isRequired"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Required</FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="isVisible"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Visible</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="fieldOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field Order</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          {createMutation.isPending ? "Creating..." : "Create Field"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Field Configuration List */}
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid gap-3 sm:gap-4">
          {(fieldConfigs as FieldConfiguration[] || []).map((field) => (
            <Card key={field.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group ring-1 ring-black/5">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{field.label}</h3>
                      <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">
                          {field.fieldName}
                        </code>
                        {!field.isVisible && (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="mr-1 h-3 w-3" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {field.placeholder && (
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Placeholder: "{field.placeholder}"
                        </p>
                      )}
                      {field.helpText && (
                        <p className="text-gray-500 text-xs">{field.helpText}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:gap-6">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm text-gray-600">Required:</span>
                        <Switch
                          checked={field.isRequired || false}
                          onCheckedChange={() => handleToggleRequired(field)}
                          disabled={updateMutation.isPending}
                          className="scale-90 sm:scale-100"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm text-gray-600">Visible:</span>
                        <Switch
                          checked={field.isVisible || false}
                          onCheckedChange={() => handleToggleVisible(field)}
                          disabled={updateMutation.isPending}
                          className="scale-90 sm:scale-100"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Order: {field.fieldOrder}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteField(field.id)}
                        disabled={deleteMutation.isPending}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-900 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!fieldConfigs || (fieldConfigs as FieldConfiguration[]).length === 0) && (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <Settings className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Field Configurations</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Configure which fields appear in your lead forms and whether they're required.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-black text-white hover:bg-gray-800 text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                Add First Field
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}