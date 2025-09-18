import { useState } from "react";
import { 
  Book, 
  Users, 
  UserCheck, 
  Car, 
  BarChart3, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Eye, 
  EyeOff,
  ChevronRight,
  ChevronDown,
  Home,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  FileText,
  Shield,
  ToggleLeft,
  ToggleRight,
  Archive,
  Printer,
  MousePointer,
  RefreshCw,
  Copy,
  ExternalLink,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  roles: string[];
}

const IconButton = ({ icon, label, variant = "default" }: { icon: React.ReactNode; label: string; variant?: "default" | "success" | "danger" | "warning" }) => {
  const baseClasses = "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium";
  const variants = {
    default: "bg-gray-100 text-gray-700 border border-gray-300",
    success: "bg-green-100 text-green-700 border border-green-300",
    danger: "bg-red-100 text-red-700 border border-red-300",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-300"
  };
  
  return (
    <span className={`${baseClasses} ${variants[variant]}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
};

const StepCard = ({ step, title, description, visual }: { step: number; title: string; description: string; visual?: React.ReactNode }) => (
  <Card className="mb-4 sm:mb-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
    <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-gray-50/80 to-white rounded-t-xl">
      <CardTitle className="flex items-center gap-3 sm:gap-4 text-lg sm:text-xl">
        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-white font-bold text-xs sm:text-sm">{step}</span>
        </div>
        <span className="text-gray-900 font-semibold text-sm sm:text-base lg:text-lg">{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-3 sm:pt-4">
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">{description}</p>
      {visual && (
        <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/50 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200/60 shadow-inner overflow-x-auto">
          {visual}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function UserManual({ isOpen, onClose }: UserManualProps) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["dashboard"]));


  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
    setActiveSection(sectionId);
  };



  const sections: Section[] = [
    {
      id: "dashboard",
      title: "Dashboard Overview",
      icon: <Home className="w-4 h-4" />,
      roles: ["admin", "manager", "staff"],
      content: (
        <div className="space-y-6">
          <div>
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <div className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                </div>
                <span className="text-base sm:text-xl lg:text-2xl">Understanding Your Dashboard</span>
              </h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                The dashboard is your central hub for managing leads and monitoring performance. Here's what you'll see:
              </p>
            </div>
          </div>

          <StepCard
            step={1}
            title="Statistics Cards"
            description="View key metrics at a glance including total leads, conversion rates, and recent activity."
            visual={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-blue-600">Total Leads</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-900">247</p>
                    </div>
                    <Users className="w-6 sm:w-8 h-6 sm:h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-green-600">Converted</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-900">89</p>
                    </div>
                    <CheckCircle className="w-6 sm:w-8 h-6 sm:h-8 text-green-500" />
                  </div>
                </div>
              </div>
            }
          />

          <StepCard
            step={2}
            title="Quick Actions"
            description="Access frequently used functions directly from the dashboard."
            visual={
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                <IconButton icon={<Plus className="w-3 sm:w-4 h-3 sm:h-4" />} label="Add Lead" variant="success" />
                <IconButton icon={<Download className="w-3 sm:w-4 h-3 sm:h-4" />} label="Export Data" variant="default" />
                <IconButton icon={<BarChart3 className="w-3 sm:w-4 h-3 sm:h-4" />} label="View Analytics" variant="default" />
              </div>
            }
          />

          <StepCard
            step={3}
            title="Recent Leads Table"
            description="View and manage your most recent leads with quick action buttons."
            visual={
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                    <span>Customer</span>
                    <span>Vehicle</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="grid grid-cols-4 gap-4 items-center text-sm">
                    <span>John Smith</span>
                    <span>Toyota Camry</span>
                    <Badge variant="outline" className="w-fit">New</Badge>
                    <div className="flex gap-2">
                      <IconButton icon={<Eye className="w-3 h-3" />} label="View" variant="default" />
                      <IconButton icon={<Edit className="w-3 h-3" />} label="Edit" variant="default" />
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      )
    },
    {
      id: "leads",
      title: "Lead Management",
      icon: <Users className="w-4 h-4" />,
      roles: ["admin", "manager", "staff"],
      content: (
        <div className="space-y-6">
          <div>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                Managing Customer Leads
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Master the complete lead management workflow from creation to conversion with all available system features.
              </p>
            </div>
          </div>

          <StepCard
            step={1}
            title="Creating a New Lead"
            description="Add new customer inquiries with comprehensive details including contact information, rental preferences, and special requirements."
            visual={
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <IconButton icon={<Plus className="w-4 h-4" />} label="Add New Lead" variant="success" />
                  <span className="text-sm text-gray-600">← Click this button to start</span>
                </div>
                <div className="bg-white border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Name *</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">Ahmed Al-Rashid</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email *</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">ahmed@example.com</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone *</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">+974 5555 1234</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location *</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">Doha</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vehicle Type *</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">SUV</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vehicle Model</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">Toyota Prado</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Rental Start Date *</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">2024-01-15</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Rental End Date *</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">2024-01-22</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Special Requirements</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">Need GPS navigation and child seat</div>
                  </div>
                </div>
              </div>
            }
          />

          <StepCard
            step={2}
            title="Quick Status Updates"
            description="Update lead status instantly by clicking on the status badge in the leads table - no need to open the full edit form."
            visual={
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Click any status badge to change it:</p>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Ahmed Al-Rashid</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">New ↓</Badge>
                      <MousePointer className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                    Status options: New → Contacted → Converted / Declined
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">New</Badge>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Contacted</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Converted</Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">Declined</Badge>
                </div>
              </div>
            }
          />

          <StepCard
            step={3}
            title="Quick Source Type Updates"
            description="Track lead sources by clicking on the source type in the table to update how the customer found you."
            visual={
              <div className="space-y-4">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Lead Source Tracking</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded cursor-pointer hover:bg-blue-200">Website ↓</span>
                      <MousePointer className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded text-center">Website</div>
                  <div className="bg-green-50 p-2 rounded text-center">Phone</div>
                  <div className="bg-purple-50 p-2 rounded text-center">Email</div>
                  <div className="bg-pink-50 p-2 rounded text-center">Social Media</div>
                  <div className="bg-orange-50 p-2 rounded text-center">Referral</div>
                  <div className="bg-yellow-50 p-2 rounded text-center">Walk In</div>
                  <div className="bg-indigo-50 p-2 rounded text-center">Partner</div>
                  <div className="bg-red-50 p-2 rounded text-center">Advertisement</div>
                  <div className="bg-gray-50 p-2 rounded text-center">Other</div>
                </div>
              </div>
            }
          />

          <StepCard
            step={4}
            title="Advanced Filtering & Search"
            description="Use powerful filters to find specific leads quickly. Combine multiple filters for precise results."
            visual={
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 p-2 border rounded bg-gray-50 text-sm flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Search by name, email, phone, or location...</span>
                  </div>
                  <IconButton icon={<Filter className="w-4 h-4" />} label="Advanced Filters" variant="default" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">Basic Filters</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select className="p-2 border rounded bg-gray-50 text-sm">
                        <option>All Status</option>
                        <option>New</option>
                        <option>Contacted</option>
                        <option>Converted</option>
                        <option>Declined</option>
                      </select>
                      <select className="p-2 border rounded bg-gray-50 text-sm">
                        <option>All Vehicles</option>
                        <option>SUV</option>
                        <option>Sedan</option>
                        <option>Hatchback</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">Advanced Filters</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select className="p-2 border rounded bg-gray-50 text-sm">
                        <option>All Locations</option>
                        <option>Doha</option>
                        <option>Al Rayyan</option>
                        <option>Al Wakrah</option>
                      </select>
                      <select className="p-2 border rounded bg-gray-50 text-sm">
                        <option>All Dates</option>
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Pro Tip:</strong> Use multiple filters together to find exactly what you need. Results update instantly as you change filters.
                  </p>
                </div>
              </div>
            }
          />

          <StepCard
            step={5}
            title="Bulk Operations"
            description="Select multiple leads to perform batch operations like status updates, archiving, or deletion."
            visual={
              <div className="space-y-4">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" checked />
                      <span className="text-sm font-medium">3 leads selected</span>
                    </div>
                    <div className="flex gap-2">
                      <IconButton icon={<Phone className="w-3 h-3" />} label="Mark Contacted" variant="warning" />
                      <IconButton icon={<Archive className="w-3 h-3" />} label="Archive" variant="default" />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" checked />
                      <span>Ahmed Al-Rashid - SUV Rental</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" checked />
                      <span>Sarah Johnson - Sedan Rental</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" checked />
                      <span>Mohammed Ali - Luxury Car</span>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Bulk Actions Available:</strong> Update Status, Archive, Delete, Export Selected
                  </p>
                </div>
              </div>
            }
          />

          <StepCard
            step={6}
            title="Lead Actions & Management"
            description="Each lead has multiple action buttons for comprehensive management including view, edit, print, archive, and delete."
            visual={
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b text-sm font-medium">Available Actions</div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Ahmed Al-Rashid</span>
                      <div className="flex gap-1">
                        <IconButton icon={<Eye className="w-3 h-3" />} label="" variant="default" />
                        <IconButton icon={<Edit className="w-3 h-3" />} label="" variant="default" />
                        <IconButton icon={<Printer className="w-3 h-3" />} label="" variant="default" />
                        <IconButton icon={<Archive className="w-3 h-3" />} label="" variant="warning" />
                        <IconButton icon={<Trash2 className="w-3 h-3" />} label="" variant="danger" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span><strong>View:</strong> See all lead details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-green-600" />
                      <span><strong>Edit:</strong> Modify lead information</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-purple-600" />
                      <span><strong>Print:</strong> Generate lead report</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-orange-600" />
                      <span><strong>Archive:</strong> Move to archived</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span><strong>Delete:</strong> Permanently remove</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          <StepCard
            step={7}
            title="Archive Management"
            description="Toggle between active and archived leads. Archived leads are hidden from main view but can be restored when needed."
            visual={
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">Active Leads</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Archived Leads</button>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Archive Benefits:</span>
                    <Archive className="w-4 h-4 text-orange-500" />
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Keep old leads without cluttering active view</li>
                    <li>• Maintain historical data for reporting</li>
                    <li>• Easily restore if customer returns</li>
                    <li>• Clean up dashboard while preserving records</li>
                  </ul>
                </div>
              </div>
            }
          />

          <StepCard
            step={8}
            title="Export & Reporting"
            description="Generate detailed reports and export lead data in various formats for analysis and external use."
            visual={
              <div className="space-y-4">
                <div className="flex gap-3">
                  <IconButton icon={<Download className="w-4 h-4" />} label="Export Report" variant="default" />
                  <IconButton icon={<FileText className="w-4 h-4" />} label="Print Report" variant="default" />
                </div>
                <div className="border rounded-lg p-3">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Export Options:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-green-50 p-2 rounded">✓ Excel Spreadsheet</div>
                    <div className="bg-blue-50 p-2 rounded">✓ PDF Report</div>
                    <div className="bg-purple-50 p-2 rounded">✓ CSV Data</div>
                    <div className="bg-orange-50 p-2 rounded">✓ Filtered Results</div>
                  </div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-800">
                    <strong>Smart Export:</strong> Your current filters are automatically applied to exports, so you get exactly the data you need.
                  </p>
                </div>
              </div>
            }
          />

          <StepCard
            step={9}
            title="Real-time Updates & Notifications"
            description="The system provides instant feedback and updates as you work with leads, ensuring data accuracy and smooth workflow."
            visual={
              <div className="space-y-4">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Real-time Features:</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span>Instant status updates without page refresh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-blue-500" />
                      <span>Live search results as you type</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span>Automatic statistics updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-purple-500" />
                      <span>Success/error notifications for all actions</span>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Performance Tip:</strong> The system optimizes data loading and updates automatically, so you always see the most current information.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      )
    },
    {
      id: "vehicles",
      title: "Vehicle Management",
      icon: <Car className="w-4 h-4" />,
      roles: ["admin"],
      content: (
        <div className="space-y-6">
          <div>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                Managing Vehicle Inventory
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Configure your vehicle fleet including types, makes, models, and individual vehicle plates.
              </p>
            </div>
          </div>

          <StepCard
            step={1}
            title="Vehicle Hierarchy"
            description="Understand the structure: Types → Makes → Models → Plates"
            visual={
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded text-blue-800 text-sm font-medium">SUV</div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div className="bg-green-100 p-2 rounded text-green-800 text-sm font-medium">Toyota</div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div className="bg-yellow-100 p-2 rounded text-yellow-800 text-sm font-medium">Prado 2024</div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div className="bg-purple-100 p-2 rounded text-purple-800 text-sm font-medium">ABC-123</div>
                </div>
                <p className="text-sm text-gray-600">Type → Make → Model → Plate Number</p>
              </div>
            }
          />

          <StepCard
            step={2}
            title="Adding Vehicle Components"
            description="Add new vehicle types, makes, models, and plates to expand your fleet."
            visual={
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Vehicle Types</h4>
                      <IconButton icon={<Plus className="w-3 h-3" />} label="Add Type" variant="success" />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>• SUV</div>
                      <div>• Sedan</div>
                      <div>• Hatchback</div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Vehicle Makes</h4>
                      <IconButton icon={<Plus className="w-3 h-3" />} label="Add Make" variant="success" />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>• Toyota</div>
                      <div>• Honda</div>
                      <div>• Nissan</div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          <StepCard
            step={3}
            title="Status Management"
            description="Control vehicle availability using active/inactive status toggles."
            visual={
              <div className="space-y-3">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b text-sm font-medium">Vehicle Status Controls</div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Toyota Camry 2024</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                        <IconButton icon={<ToggleRight className="w-4 h-4" />} label="" variant="success" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Honda Civic 2023</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700">Inactive</Badge>
                        <IconButton icon={<ToggleLeft className="w-4 h-4" />} label="" variant="danger" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Inactive vehicles won't appear in lead creation forms but remain visible in management.
                  </p>
                </div>
              </div>
            }
          />

          <StepCard
            step={4}
            title="Bulk Upload"
            description="Import multiple vehicles at once using Excel templates."
            visual={
              <div className="space-y-3">
                <div className="flex gap-3">
                  <IconButton icon={<Download className="w-4 h-4" />} label="Download Template" variant="default" />
                  <IconButton icon={<Upload className="w-4 h-4" />} label="Bulk Upload" variant="success" />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Process:</strong> Download template → Fill with your data → Upload Excel file → Review results
                  </p>
                </div>
              </div>
            }
          />
        </div>
      )
    },
    {
      id: "users",
      title: "User Management",
      icon: <UserCheck className="w-4 h-4" />,
      roles: ["admin"],
      content: (
        <div className="space-y-6">
          <div>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                Managing System Users
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Create and manage user accounts for staff and managers with appropriate permissions.
              </p>
            </div>
          </div>

          <StepCard
            step={1}
            title="User Roles Explained"
            description="Understand the different user roles and their permissions."
            visual={
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-red-50 text-red-700">Admin</Badge>
                      <Shield className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-sm text-gray-600">Full system access, manage users, vehicles, branches, and all settings.</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">Manager</Badge>
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-600">Manage leads within their branch, view analytics, export data.</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Staff</Badge>
                      <UserCheck className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600">Create and manage leads, limited to own leads or branch leads based on settings.</p>
                  </div>
                </div>
              </div>
            }
          />

          <StepCard
            step={2}
            title="Creating New Users"
            description="Add new staff members or managers to the system."
            visual={
              <div className="space-y-3">
                <IconButton icon={<Plus className="w-4 h-4" />} label="Add New User" variant="success" />
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">Sarah</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">Johnson</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">sarah@qmobility.com</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">Staff</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          <StepCard
            step={3}
            title="User Status Management"
            description="Activate or deactivate user accounts as needed."
            visual={
              <div className="space-y-3">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b text-sm font-medium">User Status Controls</div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Sarah Johnson</span>
                        <span className="text-xs text-gray-500 ml-2">Staff</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                        <IconButton icon={<ToggleRight className="w-4 h-4" />} label="" variant="success" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      )
    },
    {
      id: "analytics",
      title: "Analytics & Reports",
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ["admin", "manager"],
      content: (
        <div className="space-y-6">
          <div>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                Understanding Analytics
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Monitor business performance with comprehensive analytics and reporting tools.
              </p>
            </div>
          </div>

          <StepCard
            step={1}
            title="Key Performance Indicators"
            description="Track important metrics that matter to your business."
            visual={
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-blue-900">24.5%</p>
                      <p className="text-xs text-blue-600">↑ 3.2% from last month</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-green-900">2.4h</p>
                      <p className="text-xs text-green-600">↓ 0.8h improvement</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            }
          />

          <StepCard
            step={2}
            title="Exporting Reports"
            description="Generate and download detailed reports for analysis."
            visual={
              <div className="space-y-3">
                <div className="flex gap-3">
                  <IconButton icon={<Download className="w-4 h-4" />} label="Export Analytics" variant="default" />
                  <IconButton icon={<FileText className="w-4 h-4" />} label="Lead Report" variant="default" />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-sm text-gray-700 mb-2"><strong>Export Options:</strong></p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Business Overview & KPIs</li>
                    <li>• Branch Performance Analysis</li>
                    <li>• Staff Performance Metrics</li>
                    <li>• Vehicle Demand Analysis</li>
                    <li>• Monthly Trends & Forecasting</li>
                  </ul>
                </div>
              </div>
            }
          />

          <StepCard
            step={3}
            title="Time Period Selection"
            description="Analyze data for different time periods to identify trends."
            visual={
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">1 Month</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">3 Months</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">6 Months</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">1 Year</button>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Compare different periods to identify seasonal trends and growth patterns.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      )
    },
    {
      id: "settings",
      title: "Account Settings",
      icon: <Settings className="w-4 h-4" />,
      roles: ["admin", "manager", "staff"],
      content: (
        <div className="space-y-6">
          <div>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                Managing Your Account
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Update your profile information, change passwords, and configure personal preferences.
              </p>
            </div>
          </div>

          <StepCard
            step={1}
            title="Profile Information"
            description="Keep your personal information up to date."
            visual={
              <div className="bg-white border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">John</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">Smith</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">john.smith@qmobility.com</div>
                </div>
                <div className="flex gap-2">
                  <IconButton icon={<Edit className="w-4 h-4" />} label="Edit Profile" variant="default" />
                </div>
              </div>
            }
          />

          <StepCard
            step={2}
            title="Password Security"
            description="Change your password regularly to maintain account security."
            visual={
              <div className="space-y-3">
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">••••••••</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <div className="mt-1 p-2 border rounded bg-gray-50 text-sm">••••••••</div>
                  </div>
                  <IconButton icon={<Shield className="w-4 h-4" />} label="Update Password" variant="warning" />
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Security Tip:</strong> Use a strong password with at least 8 characters, including numbers and symbols.
                  </p>
                </div>
              </div>
            }
          />

          <StepCard
            step={3}
            title="Logout & Session Management"
            description="Safely logout when finished or when using shared computers."
            visual={
              <div className="space-y-3">
                <IconButton icon={<XCircle className="w-4 h-4" />} label="Logout" variant="danger" />
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    <strong>Important:</strong> Always logout when using shared or public computers to protect your account.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      )
    }
  ];

  const userRole = (user as any)?.role || "staff";
  const filteredSections = sections.filter(section => section.roles.includes(userRole));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl lg:max-w-7xl max-h-[95vh] p-0 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Book className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Q-Mobility User Manual</div>
                <DialogDescription className="text-sm sm:text-base text-gray-600 font-normal mt-1">
                  Complete guide for {userRole === "admin" ? "administrators" : userRole === "manager" ? "managers" : "staff members"}
                </DialogDescription>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-white">
          {/* Sidebar */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gradient-to-b from-gray-50/80 to-white">
            <div className="p-3 sm:p-4 lg:p-6">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Navigation</h3>
              <ScrollArea className="h-32 sm:h-40 lg:h-[calc(95vh-200px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1 sm:gap-2 lg:space-y-1">
                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex flex-col lg:flex-row items-center lg:gap-3 p-2 sm:p-3 lg:p-4 rounded-lg lg:rounded-xl text-center lg:text-left transition-all duration-200 group ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 border border-blue-200 shadow-sm"
                          : "hover:bg-gray-100/80 text-gray-700 hover:shadow-sm"
                      }`}
                    >
                      <div className={`w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 rounded-md lg:rounded-lg flex items-center justify-center transition-colors mb-1 lg:mb-0 ${
                        activeSection === section.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                      }`}>
                        {section.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-xs sm:text-sm block truncate">{section.title}</span>
                      </div>
                      <ChevronRight className={`hidden lg:block w-4 h-4 transition-transform duration-200 ${
                        activeSection === section.id ? "rotate-90" : ""
                      }`} />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white">
            <div className="p-4 sm:p-6 lg:p-8">
              <ScrollArea className="h-[50vh] sm:h-[60vh] lg:h-[calc(95vh-200px)]">
                <div className="max-w-full lg:max-w-4xl">
                  {filteredSections.find(s => s.id === activeSection)?.content}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}