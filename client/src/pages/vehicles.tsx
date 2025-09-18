import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Car, Settings2, UserCheck, Gauge, ArrowLeft, Upload, FileText, Download, ToggleLeft, ToggleRight } from "lucide-react";

import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import type { 
  VehicleType, 
  VehicleMake, 
  VehicleModel, 
  VehiclePlate,
  InsertVehicleType,
  InsertVehicleMake,
  InsertVehicleModel,
  InsertVehiclePlate,
  BulkVehicleUpload
} from "@shared/schema";

interface VehicleFormProps {
  type: 'types' | 'makes' | 'models' | 'plates';
  item?: VehicleType | VehicleMake | VehicleModel | VehiclePlate;
  isOpen: boolean;
  onClose: () => void;
}

function VehicleForm({ type, item, isOpen, onClose }: VehicleFormProps) {
  const [formData, setFormData] = useState<any>({});

  // Reset form data when item changes or dialog opens/closes
  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      switch (type) {
        case 'types':
          setFormData({ name: '', description: '', isActive: true });
          break;
        case 'makes':
          setFormData({ name: '', typeId: '', isActive: true });
          break;
        case 'models':
          setFormData({ name: '', makeId: '', year: '', isActive: true });
          break;
        case 'plates':
          setFormData({ plateNumber: '', modelId: '', color: '', status: 'available', isActive: true });
          break;
        default:
          setFormData({});
      }
    }
  }, [item, type, isOpen]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicleTypes } = useQuery({
    queryKey: ["/api/vehicles/types"],
    enabled: type === 'makes' || type === 'models' || type === 'plates'
  });

  const { data: vehicleMakes } = useQuery({
    queryKey: ["/api/vehicles/makes"],
    enabled: type === 'models' || type === 'plates'
  });

  const { data: vehicleModels } = useQuery({
    queryKey: ["/api/vehicles/models"],
    enabled: type === 'plates'
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log(`${item?.id ? 'Updating' : 'Creating'} ${type} with data:`, data);
      if (item?.id) {
        const response = await apiRequest("PUT", `/api/vehicles/${type}/${item.id}`, data);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update ${type.slice(0, -1)}`);
        }
        return await response.json();
      } else {
        const response = await apiRequest("POST", `/api/vehicles/${type}`, data);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to create ${type.slice(0, -1)}`);
        }
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${type}/all`] });
      const typeNames = {
        'types': 'vehicle type',
        'makes': 'vehicle make', 
        'models': 'vehicle model',
        'plates': 'vehicle plate'
      };
      const typeName = typeNames[type as keyof typeof typeNames] || type.slice(0, -1);
      
      toast({
        title: "Great job!",
        description: `Your ${typeName} has been ${item?.id ? 'updated' : 'added to the system'} successfully.`,
      });
      handleClose();
    },
    onError: (error: any) => {
      console.error(`Error creating ${type}:`, error);
      
      // Extract clean error message from response
      let errorMessage = error.message || `Failed to ${item?.id ? 'update' : 'create'} vehicle ${type.slice(0, -1)}`;
      
      // If the error message contains HTTP status and JSON, extract just the user message
      if (errorMessage.includes('{"message":"')) {
        const match = errorMessage.match(/\{"message":"([^"]+)"\}/);
        if (match && match[1]) {
          errorMessage = match[1];
        }
      }
      
      // Remove HTTP status codes from the beginning
      errorMessage = errorMessage.replace(/^\d+:\s*/, '');
      
      toast({
        title: "Oops!",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up data before submitting
    const cleanData = { ...formData };
    
    // Convert year to number if it exists and is not empty
    if (cleanData.year && cleanData.year !== '') {
      const yearNum = parseInt(cleanData.year, 10);
      if (!isNaN(yearNum)) {
        cleanData.year = yearNum;
      } else {
        delete cleanData.year; // Remove invalid year
      }
    } else {
      delete cleanData.year; // Remove empty year field
    }
    
    console.log('Submitting clean data:', cleanData);
    mutation.mutate(cleanData);
  };

  const renderFormFields = () => {
    switch (type) {
      case 'types':
        return (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Sedan, SUV, Compact"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Brief description of the vehicle type"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">Status</Label>
                <Select 
                  value={formData.isActive ? 'true' : 'false'} 
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );
      
      case 'makes':
        return (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Make Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Toyota, BMW, Mercedes"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="typeId" className="text-right">Vehicle Type</Label>
                <Select 
                  value={formData.typeId || ''} 
                  onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(vehicleTypes as VehicleType[])?.map((typeItem: VehicleType) => (
                      <SelectItem key={typeItem.id} value={typeItem.id}>{typeItem.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">Status</Label>
                <Select 
                  value={formData.isActive ? 'true' : 'false'} 
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case 'models':
        return (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Model Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Camry, X5, C-Class"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="makeId" className="text-right">Make</Label>
                <Select 
                  value={formData.makeId || ''} 
                  onValueChange={(value) => setFormData({ ...formData, makeId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {(vehicleMakes as VehicleMake[])?.map((make: VehicleMake) => (
                      <SelectItem key={make.id} value={make.id}>{make.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="col-span-3"
                  placeholder="2024"
                  min="1900"
                  max="2030"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">Status</Label>
                <Select 
                  value={formData.isActive ? 'true' : 'false'} 
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case 'plates':
        return (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plateNumber" className="text-right">Plate Number</Label>
                <Input
                  id="plateNumber"
                  value={formData.plateNumber || ''}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                  className="col-span-3"
                  placeholder="ABC-123"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modelId" className="text-right">Model</Label>
                <Select 
                  value={formData.modelId || ''} 
                  onValueChange={(value) => setFormData({ ...formData, modelId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {(vehicleModels as VehicleModel[])?.map((model: VehicleModel) => (
                      <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">Color</Label>
                <Input
                  id="color"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., White, Black, Silver"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Rental Status</Label>
                <Select 
                  value={formData.status || 'available'} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">Active Status</Label>
                <Select 
                  value={formData.isActive ? 'true' : 'false'} 
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {item?.id ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1, -1)}
          </DialogTitle>
          <DialogDescription>
            {item?.id ? 'Update the' : 'Add a new'} vehicle {type.slice(0, -1)} details here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {renderFormFields()}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : item?.id ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VehicleTable({ type }: { type: 'types' | 'makes' | 'models' | 'plates' }) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading, error } = useQuery({
    queryKey: [`/api/vehicles/${type}/all`],
  });

  console.log(`Vehicle ${type} data:`, { items, isLoading, error });
  console.log(`API endpoint: /api/vehicles/${type}/all`);
  console.log(`Items array:`, Array.isArray(items), items?.length);

  const { data: vehicleTypes } = useQuery({
    queryKey: ["/api/vehicles/types/all"],
    enabled: type === 'models' || type === 'makes'
  });

  const { data: vehicleMakes } = useQuery({
    queryKey: ["/api/vehicles/makes/all"],
    enabled: type === 'models'
  });

  const { data: vehicleModels } = useQuery({
    queryKey: ["/api/vehicles/models/all"],
    enabled: type === 'plates'
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/vehicles/${type}/${id}`, { isActive });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update ${type.slice(0, -1)} status`);
      }
      return response.json();
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${type}/all`] });
      toast({
        title: "Success",
        description: `Vehicle ${type.slice(0, -1)} ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to update vehicle ${type.slice(0, -1)} status`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedItem(null);
    setIsFormOpen(false);
  };

  const handleToggleStatus = (item: any) => {
    toggleStatusMutation.mutate({ id: item.id, isActive: !item.isActive });
  };

  const getDisplayValue = (item: any, field: string) => {
    if (field === 'makeId' && vehicleMakes) {
      const make = (vehicleMakes as VehicleMake[]).find((m: VehicleMake) => m.id === item.makeId);
      return make?.name || item.makeName || item.makeId;
    }
    if (field === 'typeId') {
      // For models, use the typeName from the joined query
      if (item.typeName) {
        return item.typeName;
      }
      // Fallback to lookup in vehicleTypes if available
      if (vehicleTypes) {
        const typeItem = (vehicleTypes as VehicleType[]).find((t: VehicleType) => t.id === item.typeId);
        return typeItem?.name || item.typeId;
      }
      return item.typeId || '-';
    }
    if (field === 'modelId' && vehicleModels) {
      const model = (vehicleModels as VehicleModel[]).find((m: VehicleModel) => m.id === item.modelId);
      return model?.name || item.modelId;
    }
    return item[field];
  };

  const renderTableHeaders = () => {
    switch (type) {
      case 'types':
        return (
          <>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        );
      case 'makes':
        return (
          <>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        );
      case 'models':
        return (
          <>
            <TableHead>Name</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        );
      case 'plates':
        return (
          <>
            <TableHead>Plate Number</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (item: any) => {
    switch (type) {
      case 'types':
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.description || '-'}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
          </>
        );
      case 'makes':
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{getDisplayValue(item, 'typeId')}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
          </>
        );
      case 'models':
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{getDisplayValue(item, 'makeId')}</TableCell>
            <TableCell>{getDisplayValue(item, 'typeId')}</TableCell>
            <TableCell>{item.year || '-'}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
          </>
        );
      case 'plates':
        return (
          <>
            <TableCell className="font-medium">{item.plateNumber}</TableCell>
            <TableCell>{getDisplayValue(item, 'modelId')}</TableCell>
            <TableCell>{item.color || '-'}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                item.status === 'available' ? 'bg-green-100 text-green-800' :
                item.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
              </span>
            </TableCell>
          </>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </h3>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add {type.charAt(0).toUpperCase() + type.slice(1, -1)}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {renderTableHeaders()}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!items || items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={type === 'models' ? 6 : type === 'plates' ? 5 : 4} className="text-center py-8">
                <div className="text-gray-500">
                  <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No {type} found</h3>
                  <p className="text-sm">Get started by adding your first {type.slice(0, -1)}.</p>
                  <Button onClick={handleAdd} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add {type.charAt(0).toUpperCase() + type.slice(1, -1)}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            (items as any[])?.map((item: any) => (
              <TableRow key={item.id}>
                {renderTableRow(item)}
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(item)}
                      disabled={toggleStatusMutation.isPending}
                      className={item.isActive ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
                    >
                      {item.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <VehicleForm
        type={type}
        item={selectedItem}
        isOpen={isFormOpen}
        onClose={handleFormClose}
      />


    </>
  );
}

function BulkUploadDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/vehicles/bulk-upload-excel', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (response) => {
      const total = response.summary.typesCreated + response.summary.makesCreated + response.summary.modelsCreated + response.summary.platesCreated;
      toast({
        title: "Great job!",
        description: `Successfully uploaded ${total} vehicle items! Created ${response.summary.typesCreated} types, ${response.summary.makesCreated} makes, ${response.summary.modelsCreated} models, and ${response.summary.platesCreated} plates.`,
      });
      
      // Invalidate all vehicle queries
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/types/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/makes/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/models/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/plates/all"] });
      
      setIsOpen(false);
      setFile(null);
    },
    onError: (error: any) => {
      console.error("Bulk upload error:", error);
      let errorMessage = "Failed to upload vehicles. Please check your Excel file format and try again.";
      
      // Try to extract a user-friendly error message
      if (error.message && !error.message.includes("HTTP error")) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Oops!",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    bulkUploadMutation.mutate(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/vehicles/bulk-upload-template', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'vehicle_bulk_upload_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template file.",
        variant: "destructive",
      });
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Bulk Upload Vehicles
          </DialogTitle>
          <DialogDescription>
            Upload multiple vehicles at once using Excel format. Download the template first to see the required format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium mb-2 flex items-center text-blue-800">
              <Download className="h-4 w-4 mr-2" />
              Step 1: Download Template
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              Download the Excel template with sample data and fill in your vehicle information.
            </p>
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div>
            <Label htmlFor="file-upload" className="text-sm font-medium">
              Step 2: Upload Excel File
            </Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    {file ? (
                      <span className="text-green-600 font-medium">{file.name}</span>
                    ) : (
                      "Click to select Excel file (.xlsx, .xls)"
                    )}
                  </div>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Important notes:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use the provided template to ensure correct format</li>
              <li>The template includes 4 sheets: Types, Makes, Models, and Plates</li>
              <li>Fill only the sheets you need - empty sheets will be ignored</li>
              <li>For Models: Use exact Make and Type names from your data</li>
              <li>For Plates: Use exact Model names from your data</li>
              <li>Duplicate entries will be ignored (no conflicts created)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={bulkUploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={bulkUploadMutation.isPending || !file}
            className="bg-black text-white hover:bg-gray-800"
          >
            {bulkUploadMutation.isPending ? "Uploading..." : "Upload Vehicles"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function VehiclesPage() {
  const { user } = useAuth();

  if ((user as any)?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access vehicle management.</p>
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-gray-800/5 rounded-xl blur-md transform rotate-1"></div>
                <img 
                  src="https://raw.githubusercontent.com/iftikhar1986/image/eef9d1dbfef3ace5092c3dd259b075b66311ac39/logo.png" 
                  alt="Q-Mobility Logo" 
                  className="relative h-8 sm:h-10 lg:h-12 w-auto drop-shadow-sm"
                />
              </div>
              <div className="border-l border-gray-200 pl-2 sm:pl-4 lg:pl-6 flex-1 min-w-0">
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 tracking-tight truncate">Vehicle Management</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">Manage fleet inventory and specifications</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              <Link href="/">
                <Button variant="ghost" className="h-8 sm:h-10 px-2 sm:px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <ArrowLeft className="h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="hidden md:inline">Back to Dashboard</span>
                  <span className="md:hidden sm:inline">Back</span>
                </Button>
              </Link>
              

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">

      <Tabs defaultValue="types" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-sm sm:max-w-md">
            <TabsTrigger value="types" className="flex items-center text-xs sm:text-sm px-2 sm:px-4 py-2">
              <Settings2 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Types</span>
              <span className="sm:hidden">T</span>
            </TabsTrigger>
            <TabsTrigger value="makes" className="flex items-center text-xs sm:text-sm px-2 sm:px-4 py-2">
              <UserCheck className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Makes</span>
              <span className="sm:hidden">M</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center text-xs sm:text-sm px-2 sm:px-4 py-2">
              <Car className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Models</span>
              <span className="sm:hidden">Md</span>
            </TabsTrigger>
            <TabsTrigger value="plates" className="flex items-center text-xs sm:text-sm px-2 sm:px-4 py-2">
              <Gauge className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Plates</span>
              <span className="sm:hidden">P</span>
            </TabsTrigger>
          </TabsList>
          
          <BulkUploadDialog />
        </div>

        <TabsContent value="types" className="space-y-4 sm:space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 ring-1 ring-black/5">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Vehicle Types</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <VehicleTable type="types" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="makes" className="space-y-4 sm:space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 ring-1 ring-black/5">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Vehicle Makes</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <VehicleTable type="makes" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4 sm:space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 ring-1 ring-black/5">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Vehicle Models</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <VehicleTable type="models" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plates" className="space-y-4 sm:space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 ring-1 ring-black/5">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Vehicle Plates</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <VehicleTable type="plates" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}