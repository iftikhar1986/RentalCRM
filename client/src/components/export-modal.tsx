import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, FileSpreadsheet, Filter, Users, Building2, Tag, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  branchId?: string;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  // Available options
  const statuses = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "converted", label: "Converted" },
    { value: "declined", label: "Declined" }
  ];

  const sources = [
    { value: "website", label: "Website" },
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "social_media", label: "Social Media" },
    { value: "referral", label: "Referral" },
    { value: "walk_in", label: "Walk-in" },
    { value: "partner", label: "Partner" },
    { value: "advertisement", label: "Advertisement" },
    { value: "other", label: "Other" }
  ];

  // Fetch branches and staff
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
    retry: false,
  });

  const { data: staff = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    retry: false,
  });

  // Clear all filters whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      clearAllFilters();
    }
  }, [isOpen]);

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleSourceToggle = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleBranchToggle = (branchId: string) => {
    setSelectedBranches(prev => 
      prev.includes(branchId) 
        ? prev.filter(b => b !== branchId)
        : [...prev, branchId]
    );
  };

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(s => s !== staffId)
        : [...prev, staffId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      
      selectedStatuses.forEach(status => params.append("status", status));
      selectedSources.forEach(source => params.append("source", source));
      selectedBranches.forEach(branch => params.append("branch", branch));
      selectedStaff.forEach(staff => params.append("staff", staff));

      const response = await fetch(`/api/leads/export?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Generate filename with current date and filters
      const today = format(new Date(), "yyyy-MM-dd");
      const filterSummary = [];
      if (dateFrom || dateTo) filterSummary.push("filtered-dates");
      if (selectedStatuses.length > 0) filterSummary.push("filtered-status");
      if (selectedSources.length > 0) filterSummary.push("filtered-source");
      if (selectedBranches.length > 0) filterSummary.push("filtered-branch");
      if (selectedStaff.length > 0) filterSummary.push("filtered-staff");
      
      const filterStr = filterSummary.length > 0 ? `-${filterSummary.join("-")}` : "";
      a.download = `leads-export-${today}${filterStr}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Your filtered leads report has been downloaded successfully.",
      });

      // Clear all filters after successful export
      clearAllFilters();
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export leads data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const clearAllFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedStatuses([]);
    setSelectedSources([]);
    setSelectedBranches([]);
    setSelectedStaff([]);
  };

  const hasFilters = dateFrom || dateTo || selectedStatuses.length > 0 || 
                   selectedSources.length > 0 || selectedBranches.length > 0 || 
                   selectedStaff.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Leads Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4" />
                <Label className="font-medium">Date Range</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom" className="text-sm text-gray-600">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-sm text-gray-600">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" />
                <Label className="font-medium">Lead Status</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {statuses.map(status => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={selectedStatuses.includes(status.value)}
                      onCheckedChange={() => handleStatusToggle(status.value)}
                    />
                    <Label 
                      htmlFor={`status-${status.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Source Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4" />
                <Label className="font-medium">Lead Source</Label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {sources.map(source => (
                  <div key={source.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${source.value}`}
                      checked={selectedSources.includes(source.value)}
                      onCheckedChange={() => handleSourceToggle(source.value)}
                    />
                    <Label 
                      htmlFor={`source-${source.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {source.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Branch Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4" />
                <Label className="font-medium">Branch</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {branches.map(branch => (
                  <div key={branch.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`branch-${branch.id}`}
                      checked={selectedBranches.includes(branch.id)}
                      onCheckedChange={() => handleBranchToggle(branch.id)}
                    />
                    <Label 
                      htmlFor={`branch-${branch.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {branch.name} - {branch.location}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staff Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4" />
                <Label className="font-medium">Created by Staff</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {staff.map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`staff-${user.id}`}
                      checked={selectedStaff.includes(user.id)}
                      onCheckedChange={() => handleStaffToggle(user.id)}
                    />
                    <Label 
                      htmlFor={`staff-${user.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {user.firstName} {user.lastName} ({user.role})
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasFilters && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Clear All Filters
                </Button>
              )}
              <span className="text-sm text-gray-500">
                {hasFilters ? "Filtered export" : "Export all leads"}
              </span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}