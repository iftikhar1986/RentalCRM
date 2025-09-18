import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LeadModal } from "@/components/lead-modal";
import { UserDropdown } from "@/components/user-dropdown";
import { ExportModal } from "@/components/export-modal";
import { PrintModal } from "@/components/print-modal";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import UserManual from "@/components/user-manual";
import { Car, Users, Check, Clock, X, Download, Plus, Search, Eye, Edit, Trash2, LogOut, Activity, Building, Filter, ChevronDown, ChevronUp, CalendarIcon, Archive, Phone, Settings, Printer, Book } from "lucide-react";
import { Link } from "wouter";
import type { Lead } from "@shared/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  converted: number;
  declined: number;
  pending: number;
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [privacyEnabled, setPrivacyEnabled] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintLead, setSelectedPrintLead] = useState<Lead | null>(null);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk' | 'archive';
    lead?: Lead;
    action?: string;
    count?: number;
  }>({ isOpen: false, type: 'single' });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  // Fetch lead statistics
  const { data: stats, isLoading: statsLoading } = useQuery<LeadStats>({
    queryKey: ["/api/leads/stats"],
    enabled: !!user,
  });

  // Fetch branches for filter dropdown (admin only)
  const { data: branches } = useQuery({
    queryKey: ["/api/branches"],
    enabled: !!user && (user as any)?.role === 'admin',
  });

  // Fetch branch users for assignment filter (admin and manager)
  const { data: branchUsers } = useQuery({
    queryKey: ["/api/branch-users"],
    enabled: !!user && ((user as any)?.role === 'admin' || (user as any)?.role === 'manager'),
  });

  // Fetch leads with filters
  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = useQuery<LeadsResponse>({
    queryKey: ["/api/leads", searchTerm, statusFilter, dateFilter, vehicleTypeFilter, locationFilter, branchFilter, staffFilter, startDate, endDate, currentPage, showArchived],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (dateFilter && dateFilter !== "all") {
        if (dateFilter === "custom" && startDate && endDate) {
          params.append("startDate", startDate.toISOString());
          params.append("endDate", endDate.toISOString());
        } else {
          params.append("dateRange", dateFilter);
        }
      }
      if (vehicleTypeFilter && vehicleTypeFilter !== "all") params.append("vehicleType", vehicleTypeFilter);
      if (locationFilter && locationFilter !== "all") params.append("location", locationFilter);
      if (branchFilter && branchFilter !== "all") params.append("assignedBranch", branchFilter);
      if (staffFilter && staffFilter !== "all") params.append("createdBy", staffFilter);
      params.append("archived", showArchived.toString());
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      
      const response = await fetch(`/api/leads?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!user,
  });

  // Export mutation


  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
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
        description: "Failed to delete lead",
        variant: "destructive",
      });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/leads/${id}/archive`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead archived successfully",
      });
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
        description: "Failed to archive lead",
        variant: "destructive",
      });
    },
  });

  // Bulk actions mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, leadIds, status }: { action: string; leadIds: string[]; status?: string }) => {
      await apiRequest("POST", `/api/leads/bulk-action`, {
        action,
        leadIds,
        status,
      });
    },
    onSuccess: (_, { action }) => {
      const actionText = action === "archive" ? "archived" : action === "delete" ? "deleted" : "updated";
      toast({
        title: "Success",
        description: `${selectedLeads.size} lead(s) ${actionText} successfully`,
      });
      setSelectedLeads(new Set());
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
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateFilter = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleVehicleTypeFilter = (value: string) => {
    setVehicleTypeFilter(value);
    setCurrentPage(1);
  };

  const handleLocationFilter = (value: string) => {
    setLocationFilter(value);
    setCurrentPage(1);
  };

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === leadsData?.leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leadsData?.leads.map(lead => lead.id) || []));
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
    setVehicleTypeFilter("all");
    setLocationFilter("all");
    setBranchFilter("all");
    setStaffFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsAddMode(false);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsAddMode(false);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handlePrintLead = (lead: Lead) => {
    setSelectedPrintLead(lead);
    setIsPrintModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Invalidate and refetch all lead-related data
    queryClient.invalidateQueries({ 
      predicate: (query) => 
        query.queryKey[0] === "/api/leads" || 
        query.queryKey[0] === "/api/leads/stats" ||
        (typeof query.queryKey[0] === "string" && query.queryKey[0].includes("/api/analytics"))
    });
    
    // Force immediate refetch
    setTimeout(() => {
      refetchLeads();
    }, 100);
  };

  // Quick status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/leads/${leadId}`, { status });
      return response.json();
    },
    onMutate: async ({ leadId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/leads" 
      });
      
      // Update all lead queries optimistically
      queryClient.setQueriesData(
        { predicate: (query) => query.queryKey[0] === "/api/leads" },
        (oldData: any) => {
          if (!oldData || !oldData.leads) return oldData;
          return {
            ...oldData,
            leads: oldData.leads.map((lead: Lead) => 
              lead.id === leadId 
                ? { ...lead, status: status, updatedAt: new Date().toISOString() }
                : lead
            )
          };
        }
      );
      
      // Also optimistically update stats
      queryClient.setQueryData(["/api/leads/stats"], (oldStats: any) => {
        if (!oldStats) return oldStats;
        
        // Find the current lead to know old status
        const currentLead = leadsData?.leads.find(l => l.id === leadId);
        if (!currentLead) return oldStats;
        
        const newStats = { ...oldStats };
        
        // Decrease old status count
        if (currentLead.status && newStats[currentLead.status as keyof typeof newStats]) {
          newStats[currentLead.status as keyof typeof newStats] = Math.max(0, newStats[currentLead.status as keyof typeof newStats] - 1);
        }
        
        // Increase new status count
        if (newStats[status as keyof typeof newStats] !== undefined) {
          newStats[status as keyof typeof newStats] = newStats[status as keyof typeof newStats] + 1;
        }
        
        return newStats;
      });
      
      return { leadId, oldStatus: leadsData?.leads.find(l => l.id === leadId)?.status };
    },
    onSuccess: (updatedLead) => {
      // Refetch stats to ensure accuracy in background
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === "string" && 
          query.queryKey[0].includes("/api/analytics")
      });
      // No toast for better UX - change is immediately visible
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === "/api/leads" || 
          query.queryKey[0] === "/api/leads/stats"
      });
      
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
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  });

  const handleQuickStatusUpdate = (leadId: string, newStatus: string) => {
    statusUpdateMutation.mutate({ leadId, status: newStatus });
  };

  // Quick source type update mutation
  const sourceUpdateMutation = useMutation({
    mutationFn: async ({ leadId, sourceType }: { leadId: string; sourceType: string }) => {
      const response = await apiRequest("PATCH", `/api/leads/${leadId}`, { sourceType });
      return response.json();
    },
    onMutate: async ({ leadId, sourceType }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/leads" 
      });
      
      // Update all lead queries optimistically
      queryClient.setQueriesData(
        { predicate: (query) => query.queryKey[0] === "/api/leads" },
        (oldData: any) => {
          if (!oldData || !oldData.leads) return oldData;
          return {
            ...oldData,
            leads: oldData.leads.map((lead: Lead) => 
              lead.id === leadId 
                ? { ...lead, sourceType: sourceType, updatedAt: new Date().toISOString() }
                : lead
            )
          };
        }
      );
      
      return { leadId };
    },
    onSuccess: (updatedLead) => {
      // Silently succeed - no toast for better UX
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/leads"
      });
      
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
        description: "Failed to update source type",
        variant: "destructive",
      });
    }
  });

  const handleQuickSourceUpdate = (leadId: string, newSourceType: string) => {
    sourceUpdateMutation.mutate({ leadId, sourceType: newSourceType });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-500';
      case 'contacted': return 'bg-blue-500';
      case 'converted': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAddLead = () => {
    setSelectedLead(null);
    setIsAddMode(true);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setIsAddMode(false);
    setViewMode(false);
    setIsModalOpen(false);
  };

  const handleDeleteLead = (lead: Lead) => {
    setDeleteDialog({
      isOpen: true,
      type: 'single',
      lead
    });
  };

  const handleArchiveLead = (lead: Lead) => {
    setDeleteDialog({
      isOpen: true,
      type: 'archive',
      lead
    });
  };

  const handleBulkAction = (action: string) => {
    const leadIds = Array.from(selectedLeads);
    if (leadIds.length === 0) return;

    setDeleteDialog({
      isOpen: true,
      type: 'bulk',
      action,
      count: leadIds.length
    });
  };

  const handleBulkStatusUpdate = (status: string) => {
    const leadIds = Array.from(selectedLeads);
    if (leadIds.length === 0) return;

    bulkActionMutation.mutate({ action: "updateStatus", leadIds: Array.from(selectedLeads), status });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.type === 'single' && deleteDialog.lead) {
      deleteMutation.mutate(deleteDialog.lead.id);
    } else if (deleteDialog.type === 'archive' && deleteDialog.lead) {
      archiveMutation.mutate(deleteDialog.lead.id);
    } else if (deleteDialog.type === 'bulk' && deleteDialog.action) {
      bulkActionMutation.mutate({ 
        action: deleteDialog.action, 
        leadIds: Array.from(selectedLeads) 
      });
    }
    setDeleteDialog({ isOpen: false, type: 'single' });
  };

  const getDeleteDialogContent = () => {
    if (deleteDialog.type === 'single' && deleteDialog.lead) {
      return {
        title: 'Delete Lead',
        description: 'This action cannot be undone. This will permanently delete the lead and remove all associated data.',
        itemName: deleteDialog.lead.fullName
      };
    } else if (deleteDialog.type === 'archive' && deleteDialog.lead) {
      return {
        title: 'Archive Lead',
        description: 'This will move the lead to the archived section. You can restore it later if needed.',
        itemName: deleteDialog.lead.fullName
      };
    } else if (deleteDialog.type === 'bulk') {
      const actionText = deleteDialog.action === 'archive' ? 'archive' : 'delete';
      return {
        title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Multiple Leads`,
        description: `This will ${actionText} ${deleteDialog.count} selected lead(s). ${deleteDialog.action === 'delete' ? 'This action cannot be undone.' : 'You can restore archived leads later.'}`,
        itemName: undefined
      };
    }
    return { title: '', description: '', itemName: undefined };
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      // Invalidate queries and reload
      queryClient.clear();
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
      // Still try to reload on error
      window.location.reload();
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "secondary";
      case "contacted":
        return "default";
      case "converted":
        return "default";
      case "declined":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case "new":
        return "bg-gray-100 text-gray-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "converted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    }
    
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  if (!user) {
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
              
              {/* Mobile: Show title when admin navigation is hidden */}
              <div className="sm:hidden flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Navigation - responsive layout */}
              {(user as any)?.role === "admin" && (
                <nav className="hidden sm:flex items-center gap-1 sm:gap-2 lg:gap-3">
                  <Link href="/analytics">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs sm:text-sm">
                      <div className="w-4 sm:w-5 h-4 sm:h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Activity className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-blue-600" />
                      </div>
                      <span className="hidden md:inline">Analytics</span>
                    </Button>
                  </Link>
                  <Link href="/users">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs sm:text-sm">
                      <div className="w-4 sm:w-5 h-4 sm:h-5 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-green-600" />
                      </div>
                      <span className="hidden md:inline">Users</span>
                    </Button>
                  </Link>
                  <Link href="/branches">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs sm:text-sm">
                      <div className="w-4 sm:w-5 h-4 sm:h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-purple-600" />
                      </div>
                      <span className="hidden md:inline">Branches</span>
                    </Button>
                  </Link>
                  <Link href="/vehicles">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs sm:text-sm">
                      <div className="w-4 sm:w-5 h-4 sm:h-5 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Car className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-orange-600" />
                      </div>
                      <span className="hidden md:inline">Vehicles</span>
                    </Button>
                  </Link>
                  <Link href="/field-settings">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs sm:text-sm">
                      <div className="w-4 sm:w-5 h-4 sm:h-5 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Settings className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-gray-600" />
                      </div>
                      <span className="hidden md:inline">Settings</span>
                    </Button>
                  </Link>
                </nav>
              )}
              
              {/* User Manual Button */}
              <Button
                onClick={() => setIsUserManualOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 rounded-xl bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 text-xs sm:text-sm"
              >
                <Book className="h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">User Manual</span>
                <span className="sm:hidden">Manual</span>
              </Button>
              
              {/* User Dropdown - always visible */}
              <div className="flex items-center border-l border-gray-200/80 pl-2 sm:pl-3">
                <UserDropdown />
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation - below header */}
          {(user as any)?.role === "admin" && (
            <nav className="sm:hidden mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs whitespace-nowrap">
                    <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                    Analytics
                  </Button>
                </Link>
                <Link href="/users">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs whitespace-nowrap">
                    <div className="w-4 h-4 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-2.5 w-2.5 text-green-600" />
                    </div>
                    Users
                  </Button>
                </Link>
                <Link href="/branches">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs whitespace-nowrap">
                    <div className="w-4 h-4 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="h-2.5 w-2.5 text-purple-600" />
                    </div>
                    Branches
                  </Button>
                </Link>
                <Link href="/vehicles">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs whitespace-nowrap">
                    <div className="w-4 h-4 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Car className="h-2.5 w-2.5 text-orange-600" />
                    </div>
                    Vehicles
                  </Button>
                </Link>
                <Link href="/field-settings">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-xs whitespace-nowrap">
                    <div className="w-4 h-4 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="h-2.5 w-2.5 text-gray-600" />
                    </div>
                    Settings
                  </Button>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-10">
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 sm:mb-6 lg:mb-0">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <Car className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                    {showArchived ? "Archived Leads" : "Dashboard"}
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
                    {showArchived ? "View and manage archived leads" : "Manage rental inquiries and customer leads"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
              <Button
                variant="outline"
                onClick={() => setShowArchived(!showArchived)}
                className={`h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 rounded-xl border-gray-200/80 bg-white/60 hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-xs sm:text-sm ${showArchived ? 'bg-gray-100/80 border-gray-300' : ''}`}
              >
                <Archive className="mr-1 sm:mr-2 lg:mr-3" size={14} />
                <span className="hidden sm:inline">{showArchived ? "Show Active" : "Show Archived"}</span>
                <span className="sm:hidden">{showArchived ? "Active" : "Archive"}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(true)}
                className="h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 rounded-xl border-gray-200/80 bg-white/60 hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-xs sm:text-sm"
              >
                <Download className="mr-1 sm:mr-2" size={14} />
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button
                onClick={handleAddLead}
                className="h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 group text-xs sm:text-sm"
              >
                <Plus className="mr-1 sm:mr-2 lg:mr-3 group-hover:rotate-90 transition-transform duration-300" size={14} />
                <span className="hidden sm:inline">Add Lead</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12">
          {statsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <Skeleton className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 rounded-2xl mb-2 sm:mb-3 lg:mb-4" />
                    <div className="space-y-2 sm:space-y-3">
                      <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                      <Skeleton className="h-6 sm:h-7 lg:h-8 w-8 sm:w-10 lg:w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Users className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Total Leads</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Plus className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">New</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.new || 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Contacted</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.contacted || 0}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Check className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Converted</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.converted || 0}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <X className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Declined</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.declined || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>



        {/* Modern Filters Card */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-4 sm:mb-6 lg:mb-8">
          <CardContent className="p-3 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-0">Filter Leads</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">{showAdvancedFilters ? "Hide Advanced" : "Show Advanced"}</span>
                  <span className="sm:hidden">{showAdvancedFilters ? "Hide" : "Advanced"}</span>
                  {showAdvancedFilters ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm"
                >
                  <X className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>
            
            {/* Basic Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 focus:ring-black focus:border-black"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="focus:ring-black">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={handleDateFilter}>
                <SelectTrigger className="focus:ring-black">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {/* Results Counter */}
              <div className="flex items-center text-sm text-gray-600">
                <Filter className="mr-2 h-4 w-4" />
                {leadsData ? (
                  <span>
                    Showing <span className="font-medium text-gray-900">{leadsData.leads.length}</span> of{" "}
                    <span className="font-medium text-gray-900">{leadsData.total}</span> leads
                  </span>
                ) : (
                  "Loading..."
                )}
              </div>
            </div>

            {/* Custom Date Range */}
            {dateFilter === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal focus:ring-black"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal focus:ring-black"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Select value={vehicleTypeFilter} onValueChange={handleVehicleTypeFilter}>
                    <SelectTrigger className="focus:ring-black">
                      <SelectValue placeholder="Vehicle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vehicles</SelectItem>
                      <SelectItem value="Economy">Economy</SelectItem>
                      <SelectItem value="Compact">Compact</SelectItem>
                      <SelectItem value="Mid-size">Mid-size</SelectItem>
                      <SelectItem value="Full-size">Full-size</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={locationFilter} onValueChange={handleLocationFilter}>
                    <SelectTrigger className="focus:ring-black">
                      <SelectValue placeholder="Pickup Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Doha">Doha</SelectItem>
                      <SelectItem value="Al Rayyan">Al Rayyan</SelectItem>
                      <SelectItem value="Al Wakrah">Al Wakrah</SelectItem>
                      <SelectItem value="Umm Salal">Umm Salal</SelectItem>
                      <SelectItem value="Al Khor">Al Khor</SelectItem>
                      <SelectItem value="Al Shamal">Al Shamal</SelectItem>
                      <SelectItem value="Airport">Hamad International Airport</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Branch Filter - Admin Only */}
                  {(user as any)?.role === 'admin' && (
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="focus:ring-black">
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {Array.isArray(branches) && branches.map((branch: any) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}



                  {/* Staff Performance Filter - Filter by who captured the lead */}
                  {((user as any)?.role === 'admin' || (user as any)?.role === 'manager') && (
                    <Select value={staffFilter} onValueChange={setStaffFilter}>
                      <SelectTrigger className="focus:ring-black">
                        <SelectValue placeholder="Created By Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Staff</SelectItem>
                        {Array.isArray(branchUsers) && branchUsers.map((staffUser: any) => (
                          <SelectItem key={`branch-user-${staffUser.id}`} value={`branch-user-${staffUser.id}`}>
                            {staffUser.firstName} {staffUser.lastName} (Created Leads)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modern Selection Controls */}
        {selectedLeads.size > 0 && (
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-900">
                    {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''} selected
                  </div>
                  <p className="text-sm text-blue-700">Choose an action to apply to all selected leads</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLeads(new Set())}
                  className="border-blue-300/60 text-blue-700 hover:bg-blue-50 rounded-xl"
                >
                  Clear selection
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300/60 text-blue-700 hover:bg-blue-50 rounded-xl"
                    >
                      Bulk Actions
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-xl">
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("archive")}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("delete")}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusUpdate("contacted")}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Mark as Contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusUpdate("converted")}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Converted
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusUpdate("declined")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Mark as Declined
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}

        {/* Modern Leads Table */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/60">
              <thead className="bg-gradient-to-r from-gray-50/80 to-slate-50/80 backdrop-blur-sm">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === leadsData?.leads.length && leadsData?.leads.length > 0}
                      onChange={handleSelectAll}
                      className="h-5 w-5 text-black focus:ring-black/20 border-gray-300 rounded-lg"
                    />
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Source</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Vehicle Type</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rental Period</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/40 backdrop-blur-sm divide-y divide-gray-200/40">
                {leadsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-8" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full mr-4" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : leadsData?.leads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                        <p className="text-sm">Get started by adding your first lead.</p>
                        <Button onClick={handleAddLead} className="mt-4 bg-black text-white hover:bg-gray-800">
                          <Plus className="mr-2" size={16} />
                          Add Lead
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leadsData?.leads.map((lead, index) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(currentPage - 1) * 20 + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="flex-shrink-0 h-10 w-10">
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-medium">
                              {getInitials(lead.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                            <div className="text-sm text-gray-500">{lead.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DropdownMenu key={`source-${lead.id}-${lead.sourceType}`}>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="text-sm text-gray-900 capitalize hover:bg-gray-100 px-2 py-1 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                              disabled={sourceUpdateMutation.isPending}
                            >
                              {lead.sourceType?.replace('_', ' ') || 'Website'}
                              <ChevronDown className="h-3 w-3 opacity-50" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-44 z-50">
                            <DropdownMenuItem
                              onClick={() => handleQuickSourceUpdate(lead.id, 'website')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <span className="text-sm">Website</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickSourceUpdate(lead.id, 'phone')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <span className="text-sm">Phone</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickSourceUpdate(lead.id, 'email')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <span className="text-sm">Email</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickSourceUpdate(lead.id, 'social_media')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <span className="text-sm">Social Media</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickSourceUpdate(lead.id, 'referral')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <span className="text-sm">Referral</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickSourceUpdate(lead.id, 'walk_in')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <span className="text-sm">Walk In</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickSourceUpdate(lead.id, 'partner')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <span className="text-sm">Partner</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickSourceUpdate(lead.id, 'advertisement')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <span className="text-sm">Advertisement</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickSourceUpdate(lead.id, 'other')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <span className="text-sm">Other</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.vehicleType}</div>
                        <div className="text-sm text-gray-500">{lead.vehicleModel || "Not specified"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.rentalPeriodDays} days</div>
                        <div className="text-sm text-gray-500">{formatDateRange(lead.rentalStartDate, lead.rentalEndDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DropdownMenu key={`status-${lead.id}-${lead.status}`}>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className={`${getStatusBadgeClassName(lead.status)} cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-2 border-0 outline-none focus:outline-none`}
                              disabled={statusUpdateMutation.isPending}
                            >
                              <div className="w-2 h-2 rounded-full bg-white opacity-90"></div>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                              <ChevronDown className="h-3 w-3 opacity-70" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-40 z-50">
                            <DropdownMenuItem
                              onClick={() => handleQuickStatusUpdate(lead.id, 'new')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <div className="w-2 h-2 rounded-full bg-gray-500 mr-3"></div>
                              <span className="text-sm">New</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickStatusUpdate(lead.id, 'contacted')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                              <span className="text-sm">Contacted</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickStatusUpdate(lead.id, 'converted')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                              <span className="text-sm">Converted</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleQuickStatusUpdate(lead.id, 'declined')}
                              className="cursor-pointer flex items-center px-3 py-2"
                            >
                              <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
                              <span className="text-sm">Declined</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLead(lead)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLead(lead)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintLead(lead)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Print Lead Report"
                          >
                            <Printer size={16} />
                          </Button>
                          {!showArchived && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchiveLead(lead)}
                              className="text-orange-600 hover:text-orange-900 p-1"
                              disabled={archiveMutation.isPending}
                            >
                              <Archive size={16} />
                            </Button>
                          )}
                          {(user as any)?.role === "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLead(lead)}
                              className="text-red-600 hover:text-red-900 p-1"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {leadsData && leadsData.total > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-t border-gray-200 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm font-medium text-gray-600">
                  Showing <span className="text-blue-600 font-semibold">{Math.min((currentPage - 1) * 10 + 1, leadsData.total)}</span> to <span className="text-blue-600 font-semibold">{Math.min(currentPage * 10, leadsData.total)}</span> of <span className="text-blue-600 font-semibold">{leadsData.total}</span> leads
                </div>
                {leadsData.totalPages > 1 && (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      Previous
                    </Button>
                    
                    {/* Page numbers */}
                    {(() => {
                      const totalPages = leadsData.totalPages;
                      const current = currentPage;
                      const pages = [];
                      
                      // Always show first page
                      if (totalPages > 1) pages.push(1);
                      
                      // Add dots if needed
                      if (current > 3 && totalPages > 5) pages.push('...');
                      
                      // Add current page and surrounding pages
                      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                        if (!pages.includes(i)) pages.push(i);
                      }
                      
                      // Add dots if needed
                      if (current < totalPages - 2 && totalPages > 5) pages.push('...');
                      
                      // Always show last page
                      if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
                      
                      return pages.map((page, index) => (
                        page === '...' ? (
                          <span key={`dots-${index}`} className="px-2 text-gray-400">...</span>
                        ) : (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page as number)}
                            className={currentPage === page 
                              ? "px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 border-blue-600" 
                              : "px-3 py-2 text-sm border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                            }
                          >
                            {page}
                          </Button>
                        )
                      ));
                    })()}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === leadsData.totalPages}
                      className="px-3 py-2 text-sm border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(leadsData.totalPages)}
                      disabled={currentPage === leadsData.totalPages}
                      className="px-3 py-2 text-sm border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      Last
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lead={selectedLead}
        isAddMode={isAddMode}
        viewMode={viewMode}
        onSuccess={handleModalSuccess}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        lead={selectedPrintLead}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: 'single' })}
        onConfirm={handleConfirmDelete}
        title={getDeleteDialogContent().title}
        description={getDeleteDialogContent().description}
        itemName={getDeleteDialogContent().itemName}
        isLoading={deleteMutation.isPending || archiveMutation.isPending || bulkActionMutation.isPending}
      />
      
      {/* User Manual Dialog */}
      <UserManual 
        isOpen={isUserManualOpen} 
        onClose={() => setIsUserManualOpen(false)} 
      />
    </div>
  );
}
