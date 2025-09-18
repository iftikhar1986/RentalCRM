import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Users, UserCheck, UserX, ArrowLeft, RefreshCw, Eye, EyeOff, Copy, Trash2, Edit } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type User, type InsertUser } from "@shared/schema";
import { z } from "zod";

const createUserSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "staff"]).default("staff"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const editUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "staff"]),
  isActive: z.boolean().default(true),
});

const changePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    user?: User;
  }>({ isOpen: false });

  // Password generation function
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    form.setValue('password', newPassword);
    toast({
      title: "Password Generated",
      description: "A secure password has been generated automatically",
    });
  };

  const handleCopyPassword = async () => {
    const currentPassword = form.getValues('password');
    if (!currentPassword) return;
    
    try {
      await navigator.clipboard.writeText(currentPassword);
      toast({
        title: "Success",
        description: "Password copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      });
    }
  };

  // Redirect if not admin
  useEffect(() => {
    if (currentUser && (currentUser as any).role !== "admin") {
      window.location.href = "/";
    }
  }, [currentUser]);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    retry: false,
  });

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "staff",
      password: "",
    },
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "staff",
      isActive: true,
    },
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserForm) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "User created successfully with custom password",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      setShowPassword(false);
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
        description: "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
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
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/users/${userId}`);
      // Don't try to parse JSON for 204 No Content responses
      if (response.status === 204) {
        return {};
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
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
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async (data: EditUserForm & { id: string }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PATCH", `/api/users/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
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
        description: "Failed to update user details",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/password`, { password });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
      setShowEditPassword(false);
      passwordForm.reset();
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
        description: "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const onEditSubmit = (data: EditUserForm) => {
    if (!selectedUser) return;
    editUserMutation.mutate({ ...data, id: selectedUser.id });
  };

  const onPasswordSubmit = (data: ChangePasswordForm) => {
    if (!selectedUser) return;
    changePasswordMutation.mutate({ 
      userId: selectedUser.id, 
      password: data.password 
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as "admin" | "staff",
      isActive: user.isActive === "true",
    });
    setIsEditDialogOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    passwordForm.reset({ password: "" });
    setShowEditPassword(false);
    setIsPasswordDialogOpen(true);
  };

  const handleGenerateEditPassword = () => {
    const newPassword = generateSecurePassword();
    passwordForm.setValue('password', newPassword);
    toast({
      title: "Password Generated",
      description: "A secure password has been generated automatically",
    });
  };

  const handleCopyEditPassword = async () => {
    const currentPassword = passwordForm.getValues('password');
    if (!currentPassword) return;
    
    try {
      await navigator.clipboard.writeText(currentPassword);
      toast({
        title: "Success",
        description: "Password copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      });
    }
  };



  // Check if user is the first admin (earliest created admin)
  const isFirstAdmin = (user: User) => {
    if (user.role !== 'admin') return false;
    
    const adminUsers = users.filter(u => u.role === 'admin');
    if (adminUsers.length === 0) return false;
    
    const sortedAdmins = adminUsers.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
    
    return sortedAdmins[0]?.id === user.id;
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === (currentUser as any).id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    if (isFirstAdmin(user)) {
      toast({
        title: "Access Denied",
        description: "The primary administrator account cannot be deleted for security reasons.",
        variant: "destructive",
      });
      return;
    }
    
    setDeleteDialog({ isOpen: true, user });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.user) {
      deleteUserMutation.mutate(deleteDialog.user.id);
    }
    setDeleteDialog({ isOpen: false });
  };

  const handleStatusToggle = (user: User) => {
    if (isFirstAdmin(user) && user.isActive === "true") {
      toast({
        title: "Access Denied",
        description: "The primary administrator account cannot be deactivated for security reasons.",
        variant: "destructive",
      });
      return;
    }

    const newStatus = user.isActive === "true" ? "false" : "true";
    updateStatusMutation.mutate({ userId: user.id, isActive: newStatus });
  };



  if (!currentUser || (currentUser as any).role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <UserX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need administrator privileges to access this page.</p>
          </CardContent>
        </Card>
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
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 tracking-tight truncate">User Management</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">Manage system users and permissions</p>
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
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-8 sm:h-10 px-3 sm:px-4 bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 group text-xs sm:text-sm">
                    <Plus className="mr-1 sm:mr-2 group-hover:rotate-90 transition-transform duration-300" size={14} />
                    <span className="hidden sm:inline">Add User</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@qmobility.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
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
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password (min 8 characters)" 
                                {...field} 
                                className="flex-1"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPassword(!showPassword)}
                              className="px-3"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCopyPassword}
                              disabled={!field.value}
                              className="px-3"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGeneratePassword}
                            className="w-full text-sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generate Secure Password
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setShowPassword(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createUserMutation.isPending}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
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

      <main className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {users.map((user: User) => (
            <Card key={user.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group ring-1 ring-black/5 border-l-4 border-l-black">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-semibold text-base sm:text-lg truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {user.role}
                      </Badge>
                      {isFirstAdmin(user) && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                          Protected
                        </Badge>
                      )}
                      <Badge variant={user.isActive === "true" ? "default" : "destructive"} className="text-xs">
                        {user.isActive === "true" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-1 truncate">{user.email}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Status:</span>
                      <Switch
                        checked={user.isActive === "true"}
                        onCheckedChange={() => handleStatusToggle(user)}
                        disabled={
                          updateStatusMutation.isPending || 
                          user.id === (currentUser as any).id ||
                          (isFirstAdmin(user) && user.isActive === "true")
                        }
                        className="scale-90 sm:scale-100"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {user.isActive === "true" ? (
                        <UserCheck className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
                      ) : (
                        <UserX className="h-4 sm:h-5 w-4 sm:w-5 text-red-600" />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                        title="Edit user details"
                      >
                        <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        disabled={
                          deleteUserMutation.isPending || 
                          user.id === (currentUser as any).id ||
                          isFirstAdmin(user)
                        }
                        className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                          isFirstAdmin(user) 
                            ? "border-gray-200 text-gray-400 cursor-not-allowed" 
                            : "border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                        }`}
                      >
                        <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {users.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first user account.</p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First User
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </main>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@qmobility.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this user account
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleChangePassword(selectedUser!)}
                  disabled={!selectedUser}
                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-300"
                >
                  Change Password
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={editUserMutation.isPending}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    {editUserMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            {selectedUser && (
              <p className="text-sm text-gray-600">
                Updating password for {selectedUser.firstName} {selectedUser.lastName}
              </p>
            )}
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            type={showEditPassword ? "text" : "password"}
                            placeholder="Enter new password (min 8 characters)" 
                            {...field} 
                            className="flex-1"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="px-3"
                        >
                          {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopyEditPassword}
                          disabled={!field.value}
                          className="px-3"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateEditPassword}
                        className="w-full text-sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate Secure Password
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPasswordDialogOpen(false);
                    setSelectedUser(null);
                    setShowEditPassword(false);
                    passwordForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        description="This action cannot be undone. This will permanently delete the user account and remove all associated data."
        itemName={deleteDialog.user ? `${deleteDialog.user.firstName} ${deleteDialog.user.lastName}` : undefined}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}