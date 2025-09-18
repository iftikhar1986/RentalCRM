import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, MapPin, Phone, Mail, User, ArrowLeft, Building, 
  Eye, EyeOff, Copy, Edit, Trash2, CheckCircle, XCircle, Pencil
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Link } from "wouter";
import type { Branch, BranchUser } from "@shared/schema";

const branchFormSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  managerName: z.string().min(1, "Manager name is required"),
  isActive: z.enum(["true", "false"]).default("true"),
});

const branchUserFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().min(1, "Role is required"),
  permissions: z.array(z.string()).default([]),
  isActive: z.enum(["true", "false"]).default("true"),
});

type BranchFormData = z.infer<typeof branchFormSchema>;
type BranchUserFormData = z.infer<typeof branchUserFormSchema>;

export default function Branches() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [branchUsers, setBranchUsers] = useState<Record<string, BranchUser[]>>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'branch' | 'user';
    item?: Branch | BranchUser;
  }>({ isOpen: false, type: 'branch' });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || (user as any).role !== "admin")) {
      toast({
        title: "Unauthorized",
        description: "You need admin access to manage branches.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      managerName: "",
      isActive: "true",
    },
  });

  const userForm = useForm<BranchUserFormData>({
    resolver: zodResolver(branchUserFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "staff",
      permissions: [],
      isActive: "true",
    },
  });

  const { data: branches, isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
    retry: false,
    enabled: !!user && (user as any).role === "admin",
  });

  const createMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      const response = await apiRequest("POST", "/api/branches", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({
        title: "Success",
        description: "Branch created successfully",
      });
      setIsModalOpen(false);
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
        description: "Failed to create branch",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BranchFormData }) => {
      const response = await apiRequest("PATCH", `/api/branches/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({
        title: "Success",
        description: "Branch updated successfully",
      });
      setIsModalOpen(false);
      form.reset();
      setSelectedBranch(null);
      setIsAddMode(false);
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
        description: "Failed to update branch",
        variant: "destructive",
      });
    },
  });

  const updateBranchStatusMutation = useMutation({
    mutationFn: async ({ branchId, isActive }: { branchId: string; isActive: string }) => {
      const response = await apiRequest("PATCH", `/api/branches/${branchId}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({
        title: "Success",
        description: "Branch status updated successfully",
      });
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
        description: "Failed to update branch status",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/branches/${id}`);
      // Don't try to parse JSON for 204 No Content responses
      if (response.status === 204) {
        return {};
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
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
        description: "Failed to delete branch",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async ({ branchId, userData }: { branchId: string; userData: BranchUserFormData }) => {
      const response = await apiRequest("POST", `/api/branches/${branchId}/users`, userData);
      return response.json();
    },
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches", branchId, "users"] });
      loadBranchUsers(branchId);
      toast({
        title: "Success",
        description: "Branch user created successfully",
      });
      setIsUserModalOpen(false);
      userForm.reset();
    },
    onError: async (error) => {
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
      
      // Try to extract user-friendly error message from response
      let errorMessage = "Failed to create branch user";
      try {
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as any).response;
          if (response && typeof response.json === 'function') {
            const errorData = await response.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
            }
          }
        }
      } catch (e) {
        // If parsing fails, use default message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteBranchUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/branch-users/${userId}`);
      // Don't try to parse JSON for 204 No Content responses
      if (response.status === 204) {
        return {};
      }
      return response.json();
    },
    onSuccess: (_, userId) => {
      // Find which branch this user belongs to and refresh that branch's user list
      Object.keys(branchUsers).forEach(branchId => {
        if (branchUsers[branchId]?.some(user => user.id === userId)) {
          queryClient.invalidateQueries({ queryKey: ["/api/branches", branchId, "users"] });
          loadBranchUsers(branchId);
        }
      });
      toast({
        title: "Success",
        description: "Branch user deleted successfully",
      });
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
        description: "Failed to delete branch user",
        variant: "destructive",
      });
    },
  });

  const handleAddBranch = () => {
    setSelectedBranch(null);
    setIsAddMode(true);
    form.reset();
    setIsModalOpen(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsAddMode(false);
    form.reset({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      email: branch.email,
      managerName: branch.managerName,
      isActive: branch.isActive as "true" | "false",
    });
    setIsModalOpen(true);
  };

  const handleCopyPassword = (password: string, branchName: string) => {
    navigator.clipboard.writeText(password);
    toast({
      title: "Password Copied",
      description: `Password for ${branchName} copied to clipboard`,
    });
  };

  const togglePasswordVisibility = (branchId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };

  const loadBranchUsers = async (branchId: string) => {
    try {
      const response = await fetch(`/api/branches/${branchId}/users`);
      if (response.ok) {
        const users = await response.json();
        setBranchUsers(prev => ({ ...prev, [branchId]: users }));
      }
    } catch (error) {
      console.error("Error loading branch users:", error);
    }
  };

  const toggleBranchExpansion = (branchId: string) => {
    if (expandedBranch === branchId) {
      setExpandedBranch(null);
    } else {
      setExpandedBranch(branchId);
      if (!branchUsers[branchId]) {
        loadBranchUsers(branchId);
      }
    }
  };

  const handleAddUser = (branch: Branch) => {
    setSelectedBranch(branch);
    userForm.reset();
    setIsUserModalOpen(true);
  };

  const handleDeleteBranchUser = (user: any) => {
    setDeleteDialog({ isOpen: true, type: 'user', item: user });
  };

  const handleDeleteBranch = (branch: Branch) => {
    setDeleteDialog({ isOpen: true, type: 'branch', item: branch });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.type === 'branch' && deleteDialog.item) {
      deleteMutation.mutate((deleteDialog.item as Branch).id);
    } else if (deleteDialog.type === 'user' && deleteDialog.item) {
      deleteBranchUserMutation.mutate((deleteDialog.item as BranchUser).id);
    }
    setDeleteDialog({ isOpen: false, type: 'branch' });
  };

  const getDeleteDialogContent = () => {
    if (deleteDialog.type === 'branch' && deleteDialog.item) {
      const branch = deleteDialog.item as Branch;
      return {
        title: 'Delete Branch',
        description: 'This action cannot be undone. This will permanently delete the branch and all associated data including staff members.',
        itemName: branch.name
      };
    } else if (deleteDialog.type === 'user' && deleteDialog.item) {
      const user = deleteDialog.item as BranchUser;
      return {
        title: 'Delete Staff Member',
        description: 'This action cannot be undone. This will permanently delete the staff member account and remove all associated data.',
        itemName: `${user.firstName} ${user.lastName}`
      };
    }
    return { title: '', description: '', itemName: undefined };
  };

  const handleBranchStatusToggle = (branchId: string, currentStatus: string) => {
    const newStatus = currentStatus === "true" ? "false" : "true";
    updateBranchStatusMutation.mutate({ branchId, isActive: newStatus });
  };

  const onSubmit = (data: BranchFormData) => {
    if (isAddMode) {
      createMutation.mutate(data);
    } else if (selectedBranch) {
      updateMutation.mutate({ id: selectedBranch.id, data });
    }
  };

  const onUserSubmit = (data: BranchUserFormData) => {
    if (selectedBranch) {
      createUserMutation.mutate({ branchId: selectedBranch.id, userData: data });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  if (!user || (user as any).role !== "admin") {
    return null;
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
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Branch Management</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Manage locations and access control</p>
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
              <Button
                onClick={handleAddBranch}
                className="h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 group text-xs sm:text-sm"
              >
                <Plus className="mr-1 sm:mr-2 lg:mr-3 group-hover:rotate-90 transition-transform duration-300" size={14} />
                <span className="hidden sm:inline">Add Branch</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Branches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : branches?.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                <Building className="mx-auto h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No branches found</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Get started by adding your first branch location.</p>
                <Button onClick={handleAddBranch} className="bg-black text-white hover:bg-gray-800 h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm">
                  <Plus className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                  Add Branch
                </Button>
              </CardContent>
            </Card>
          ) : (
            branches?.map((branch) => (
              <Card key={branch.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group ring-1 ring-black/5">
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 truncate">{branch.name}</CardTitle>
                      <div className="flex items-center mt-2">
                        <Badge 
                          variant={branch.isActive === "true" ? "default" : "secondary"}
                          className={`text-xs ${branch.isActive === "true" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {branch.isActive === "true" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Status:</span>
                        <Switch
                          checked={branch.isActive === "true"}
                          onCheckedChange={() => handleBranchStatusToggle(branch.id, branch.isActive)}
                          disabled={updateBranchStatusMutation.isPending}
                          className="scale-90 sm:scale-100"
                        />
                      </div>
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBranch(branch)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          disabled={updateMutation.isPending}
                        >
                          <Pencil className="h-3 sm:h-4 w-3 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBranch(branch)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <MapPin className="h-3 sm:h-4 w-3 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{branch.address}, {branch.city}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Phone className="h-3 sm:h-4 w-3 sm:w-4 mr-2 flex-shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Mail className="h-3 sm:h-4 w-3 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{branch.email}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <User className="h-3 sm:h-4 w-3 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{branch.managerName}</span>
                    </div>
                    
                    {/* Manager Login Credentials */}
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-md">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Manager Credentials</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Email:</span>
                          <span className="text-xs font-mono truncate ml-2">{branch.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Password:</span>
                          <div className="flex items-center space-x-1 min-w-0">
                            <span className="text-xs font-mono truncate">
                              {showPassword[branch.id] ? branch.generatedPassword : "••••••••"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                              onClick={() => togglePasswordVisibility(branch.id)}
                            >
                              {showPassword[branch.id] ? (
                                <EyeOff className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                              ) : (
                                <Eye className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                              onClick={() => handleCopyPassword(branch.generatedPassword, branch.name)}
                            >
                              <Copy className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Branch Users Management */}
                    <div className="mt-3 sm:mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900">Staff Members</h4>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddUser(branch)}
                            className="h-5 sm:h-6 px-1 sm:px-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-1" />
                            <span className="hidden sm:inline">Add Staff</span>
                            <span className="sm:hidden">Add</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBranchExpansion(branch.id)}
                            className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800"
                          >
                            {expandedBranch === branch.id ? "Hide" : "Show"}
                          </Button>
                        </div>
                      </div>
                      
                      {expandedBranch === branch.id && (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {branchUsers[branch.id]?.length > 0 ? (
                            branchUsers[branch.id].map((user) => (
                              <div key={user.id} className="p-2 bg-white rounded border text-xs">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                                    <span className="ml-2 text-gray-500">({user.role})</span>
                                  </div>
                                  <Badge 
                                    variant={user.isActive === "true" ? "default" : "secondary"}
                                    className={user.isActive === "true" ? "bg-green-100 text-green-800 text-xs" : "bg-red-100 text-red-800 text-xs"}
                                  >
                                    {user.isActive === "true" ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <div className="mt-1 text-gray-600">
                                  <div>{user.email}</div>
                                  {(user as any).permissions && (user as any).permissions.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {(user as any).permissions.map((permission: string) => (
                                        <Badge key={permission} variant="outline" className="text-xs capitalize">
                                          {permission}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1 mt-1">
                                    <span>Password:</span>
                                    <span className="font-mono">
                                      {showPassword[user.id] ? user.generatedPassword : "••••••••"}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => togglePasswordVisibility(user.id)}
                                    >
                                      {showPassword[user.id] ? (
                                        <EyeOff className="h-2 w-2" />
                                      ) : (
                                        <Eye className="h-2 w-2" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => handleCopyPassword(user.generatedPassword, user.firstName)}
                                    >
                                      <Copy className="h-2 w-2" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 text-red-600 hover:text-red-800"
                                      onClick={() => handleDeleteBranchUser(user)}
                                      disabled={deleteBranchUserMutation.isPending}
                                    >
                                      <Trash2 className="h-2 w-2" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500 text-center py-2">
                              No staff members yet. Click "Add Staff" to create users.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Branch Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {isAddMode ? "Add New Branch" : "Edit Branch"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Branch Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="focus:ring-black focus:border-black"
                            placeholder="Enter branch name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">City</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="focus:ring-black focus:border-black"
                            placeholder="Enter city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-gray-700">Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="focus:ring-black focus:border-black"
                            placeholder="Enter full address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="focus:ring-black focus:border-black"
                            placeholder="Enter phone number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            className="focus:ring-black focus:border-black"
                            placeholder="Enter email address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="managerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Manager Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="focus:ring-black focus:border-black"
                            placeholder="Enter manager name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-black focus:border-black">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    {createMutation.isPending 
                      ? "Creating..." 
                      : updateMutation.isPending 
                      ? "Updating..." 
                      : isAddMode 
                      ? "Create Branch" 
                      : "Update Branch"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add User Modal */}
        <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Add Staff Member - {selectedBranch?.name}
              </DialogTitle>
            </DialogHeader>
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                <FormField
                  control={userForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="permissions"
                  render={({ field }) => {
                    const availableModules = [
                      { id: "analytics", label: "Analytics" },
                      { id: "users", label: "Users" },
                      { id: "branches", label: "Branches" },
                      { id: "vehicles", label: "Vehicles" },
                      { id: "settings", label: "Settings" }
                    ];
                    
                    return (
                      <FormItem>
                        <FormLabel>Module Permissions</FormLabel>
                        <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg">
                          {availableModules.map((module) => (
                            <div key={module.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`branch-user-${module.id}`}
                                checked={field.value?.includes(module.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentPermissions = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentPermissions, module.id]);
                                  } else {
                                    field.onChange(currentPermissions.filter(p => p !== module.id));
                                  }
                                }}
                              />
                              <label htmlFor={`branch-user-${module.id}`} className="text-sm font-medium">
                                {module.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsUserModalOpen(false)}
                    disabled={createUserMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, type: 'branch' })}
          onConfirm={handleConfirmDelete}
          title={getDeleteDialogContent().title}
          description={getDeleteDialogContent().description}
          itemName={getDeleteDialogContent().itemName}
          isLoading={deleteMutation.isPending || deleteBranchUserMutation.isPending}
        />
      </main>
    </div>
  );
}