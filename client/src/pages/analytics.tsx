import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Users, Car, Calendar, MapPin, Building, Award,
  DollarSign, Clock, Target, Activity, ArrowUpRight, ArrowDownRight, ArrowLeft, Download, RefreshCw
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalLeads: number;
    newLeads: number;
    convertedLeads: number;
    conversionRate: number;
    averageResponseTime: number;
    monthlyGrowth: number;
  };
  leadsByStatus: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  leadsByVehicleType: Array<{
    name: string;
    value: number;
  }>;
  leadsByLocation: Array<{
    name: string;
    value: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    leads: number;
    conversions: number;
    conversionRate: number;
  }>;
  conversionFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  topPerformers: Array<{
    metric: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
  }>;
  branchPerformance: Array<{
    branchName: string;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    recentLeads: number;
  }>;
  vehicleAnalysis: Array<{
    vehicleType: string;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
  }>;
  leadSources: Array<{
    name: string;
    value: number;
    conversionRate: number;
  }>;
  businessInsights: {
    topPerformingBranch: string;
    topPerformingVehicle: string;
    leadGrowth: number;
    totalActiveLeads: number;
  };
  staffPerformance: Array<{
    staffId: string;
    staffName: string;
    branchName: string;
    capturedLeads: number;
    contactedLeads: number;
    convertedLeads: number;
    contactRate: number;
    conversionRate: number;
    averageResponseTime: number;
    type: 'staff' | 'branch_staff';
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("6m");
  const [activeTab, setActiveTab] = useState("overview");

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
      return;
    }
  }, [user, authLoading, toast]);

  const { data: analyticsData, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: [`/api/analytics/${selectedPeriod}`],
    staleTime: 0, // Always refetch to get latest response time data
    gcTime: 0, // Don't cache to ensure fresh data (renamed from cacheTime in v5)
    retry: false,
    enabled: !!user,
  });

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

      {/* Modern Header */}
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
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Lead performance insights and metrics</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" className="h-8 sm:h-10 lg:h-11 px-2 sm:px-3 lg:px-4 rounded-xl hover:bg-gray-100/80 transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <ArrowLeft className="h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-10">
        {/* Modern Analytics Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 lg:mb-12">
          <div className="mb-4 sm:mb-6 lg:mb-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Performance Metrics</h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Data insights and lead analytics</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32 sm:w-36 lg:w-40 h-8 sm:h-10 lg:h-12 rounded-xl border-gray-200/80 bg-white/60 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="12m">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 rounded-xl border-gray-200/80 bg-white/60 hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-xs sm:text-sm"
            >
              <RefreshCw className={`mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button 
              onClick={() => {
                window.open(`/api/analytics/export?period=${selectedPeriod}`, '_blank');
                // Show toast notification about what's included in the export
                toast({
                  title: "Report Downloading",
                  description: "Excel report includes business overview, branch performance, vehicle analysis, lead sources, staff performance metrics, and monthly trends.",
                  duration: 5000,
                });
              }}
              className="h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 text-xs sm:text-sm"
            >
              <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
              <span className="hidden lg:inline">Export Complete Report</span>
              <span className="lg:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Modern Key Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12">
          {isLoading ? (
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
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Users className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Total Leads</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      {analyticsData?.overview.totalLeads || 0}
                    </p>
                    <div className="mt-2 sm:mt-3 lg:mt-4">
                      <Badge variant="secondary" className="text-xs bg-blue-100/80 text-blue-800">
                        +{analyticsData?.overview.newLeads || 0} new this month
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Target className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Conversion Rate</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      {analyticsData?.overview.conversionRate || 0}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Avg Response Time</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      {analyticsData?.overview.averageResponseTime || 0}h
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Activity className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Active Leads</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      {(analyticsData?.overview.totalLeads || 0) - (analyticsData?.overview.convertedLeads || 0)}
                    </p>
                    <div className="mt-2 sm:mt-3 lg:mt-4">
                      <Badge variant="secondary" className="text-xs bg-yellow-100/80 text-yellow-800">
                        {analyticsData?.overview.newLeads || 0} new this month
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 group">
                <CardContent className="p-3 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 sm:w-10 lg:w-14 h-8 sm:h-10 lg:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="text-white" size={16} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Lead Growth</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      {analyticsData?.businessInsights?.leadGrowth || 0}%
                    </p>
                    <div className="mt-2 sm:mt-3 lg:mt-4">
                      <Badge variant="secondary" className="text-xs bg-purple-100/80 text-purple-800">
                        Month over month
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Advanced Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 p-1 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Overview</TabsTrigger>
            <TabsTrigger value="sources" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Sources</TabsTrigger>
            <TabsTrigger value="branches" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Branches</TabsTrigger>
            <TabsTrigger value="vehicles" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Vehicles</TabsTrigger>
            <TabsTrigger value="staff" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Staff</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Trends</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Status Distribution */}
              <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Lead Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.leadsByStatus || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(analyticsData?.leadsByStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

              {/* Vehicle Type Demand */}
              <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Vehicle Type Demand</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData?.leadsByVehicleType || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Trends */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Monthly Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="leads" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Total Leads"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Conversions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Top Locations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(analyticsData?.leadsByLocation || []).slice(0, 6).map((location, index) => (
                    <div key={location.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                        <span className="text-sm text-gray-700">{location.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{location.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel & Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(analyticsData?.conversionFunnel || []).map((stage, index) => (
                    <div key={stage.stage} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                        <span className="text-sm text-gray-500">{stage.count} ({stage.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(analyticsData?.topPerformers || []).map((kpi, index) => (
                    <div key={kpi.metric} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{kpi.metric}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">{kpi.value}</span>
                        <div className={`flex items-center text-xs ${
                          kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {kpi.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {kpi.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
          </TabsContent>

          {/* Lead Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Source Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Lead Source Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analyticsData?.leadSources || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {(analyticsData?.leadSources || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Source Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Source Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analyticsData?.leadSources || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="conversionRate" fill="#00C49F" name="Conversion Rate %" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Source Analysis Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Detailed Source Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(analyticsData?.leadSources || []).map((source, index) => (
                      <div key={source.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <span className="text-xs font-semibold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{source.name}</h3>
                            <p className="text-sm text-gray-500">{source.value} total leads</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{source.conversionRate}%</p>
                              <p className="text-xs text-gray-500">Conversion Rate</p>
                            </div>
                            <Badge variant={source.conversionRate > 15 ? "default" : "secondary"}>
                              {source.conversionRate > 15 ? "High Performing" : "Standard"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branch Performance Tab */}
          <TabsContent value="branches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Branch Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(analyticsData?.branchPerformance || []).map((branch, index) => (
                      <div key={branch.branchName} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <span className="text-xs font-semibold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{branch.branchName}</h3>
                            <p className="text-sm text-gray-500">{branch.totalLeads} total leads</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{branch.conversionRate}%</p>
                              <p className="text-xs text-gray-500">Conversion</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-600">{branch.recentLeads}</p>
                              <p className="text-xs text-gray-500">Recent Leads</p>
                            </div>
                            <Badge variant={branch.recentLeads > 10 ? "default" : "secondary"}>
                              {branch.recentLeads} recent
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicle Analysis Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(analyticsData?.vehicleAnalysis || []).map((vehicle, index) => (
                        <div key={vehicle.vehicleType} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{vehicle.vehicleType}</h3>
                              <p className="text-sm text-gray-500">{vehicle.totalLeads} inquiries</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">{vehicle.conversionRate}%</p>
                              <p className="text-sm text-blue-600">{vehicle.convertedLeads} converted</p>
                            </div>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${vehicle.conversionRate}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Lead Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analyticsData?.leadSources || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {(analyticsData?.leadSources || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Performance Tab */}
          <TabsContent value="staff" className="space-y-6">
            {/* Staff Performance Overview Cards */}
            {analyticsData?.staffPerformance && analyticsData.staffPerformance.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Total Staff</p>
                        <p className="text-2xl font-bold text-blue-800">
                          {analyticsData.staffPerformance.length}
                        </p>
                        <p className="text-xs text-blue-600">Active performers</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">Total Leads Captured</p>
                        <p className="text-2xl font-bold text-green-800">
                          {analyticsData.staffPerformance.reduce((sum, s) => sum + s.capturedLeads, 0)}
                        </p>
                        <p className="text-xs text-green-600">By all staff</p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">Avg Conversion Rate</p>
                        <p className="text-2xl font-bold text-purple-800">
                          {Math.round(analyticsData.staffPerformance.reduce((sum, s) => sum + s.conversionRate, 0) / analyticsData.staffPerformance.length)}%
                        </p>
                        <p className="text-xs text-purple-600">Team average</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-900">Avg Response Time</p>
                        <p className="text-2xl font-bold text-orange-800">
                          {Math.round(analyticsData.staffPerformance
                            .filter(s => s.averageResponseTime > 0)
                            .reduce((sum, s) => sum + s.averageResponseTime, 0) / 
                            analyticsData.staffPerformance.filter(s => s.averageResponseTime > 0).length * 10) / 10 || 0}h
                        </p>
                        <p className="text-xs text-orange-600">Team average</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Individual Staff Performance Analysis
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive performance tracking with lead capture, contact rates, conversions, and response times
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : analyticsData?.staffPerformance && analyticsData.staffPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {/* Performance Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Top Performer</p>
                            <p className="text-lg font-bold text-blue-800">
                              {analyticsData.staffPerformance[0]?.staffName || 'N/A'}
                            </p>
                            <p className="text-xs text-blue-600">
                              {analyticsData.staffPerformance[0]?.conversionRate || 0}% conversion rate
                            </p>
                          </div>
                          <Award className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">Most Active</p>
                            <p className="text-lg font-bold text-green-800">
                              {analyticsData.staffPerformance.reduce((prev, current) => 
                                (prev.capturedLeads > current.capturedLeads) ? prev : current
                              )?.staffName || 'N/A'}
                            </p>
                            <p className="text-xs text-green-600">
                              {Math.max(...analyticsData.staffPerformance.map(s => s.capturedLeads))} leads captured
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-900">Fastest Response</p>
                            <p className="text-lg font-bold text-orange-800">
                              {analyticsData.staffPerformance
                                .filter(s => s.averageResponseTime > 0)
                                .reduce((prev, current) => 
                                  (prev.averageResponseTime < current.averageResponseTime) ? prev : current, 
                                  analyticsData.staffPerformance[0]
                                )?.staffName || 'N/A'}
                            </p>
                            <p className="text-xs text-orange-600">
                              {Math.min(...analyticsData.staffPerformance
                                .filter(s => s.averageResponseTime > 0)
                                .map(s => s.averageResponseTime)
                              )}h avg response
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    {/* Staff Performance Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base font-semibold text-gray-900">Lead Capture Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analyticsData.staffPerformance.slice(0, 10)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="staffName" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                fontSize={12}
                              />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="capturedLeads" fill="#3B82F6" name="Leads Captured" />
                              <Bar dataKey="convertedLeads" fill="#10B981" name="Converted" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base font-semibold text-gray-900">Conversion Rate Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analyticsData.staffPerformance.slice(0, 10)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="staffName" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                fontSize={12}
                              />
                              <YAxis />
                              <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                              <Bar dataKey="conversionRate" fill="#8B5CF6" name="Conversion Rate %" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Staff Performance Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left p-4 font-semibold text-gray-900">Staff Member</th>
                            <th className="text-left p-4 font-semibold text-gray-900">Branch</th>
                            <th className="text-center p-4 font-semibold text-gray-900">Leads Captured</th>
                            <th className="text-center p-4 font-semibold text-gray-900">Contacted</th>
                            <th className="text-center p-4 font-semibold text-gray-900">Converted</th>
                            <th className="text-center p-4 font-semibold text-gray-900">Contact Rate</th>
                            <th className="text-center p-4 font-semibold text-gray-900">Conversion Rate</th>
                            <th className="text-center p-4 font-semibold text-gray-900">Avg Response</th>
                            <th className="text-center p-4 font-semibold text-gray-900">Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.staffPerformance.map((staff, index) => (
                            <tr key={staff.staffId} className={`border-b border-gray-100 hover:bg-gray-50 ${index === 0 ? 'bg-blue-50/50' : ''}`}>
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                                    index === 1 ? 'bg-gray-100 text-gray-800' : 
                                    index === 2 ? 'bg-orange-100 text-orange-800' : 
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    #{index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{staff.staffName}</p>
                                    <p className="text-xs text-gray-500 capitalize">{staff.type.replace('_', ' ')}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-gray-700">{staff.branchName}</td>
                              <td className="p-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {staff.capturedLeads}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {staff.contactedLeads}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {staff.convertedLeads}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-semibold text-gray-900">{staff.contactRate}%</span>
                                  <div className="w-12 bg-gray-200 rounded-full h-1.5 mt-1">
                                    <div 
                                      className={`h-1.5 rounded-full transition-all duration-300 ${
                                        staff.contactRate >= 80 ? 'bg-green-500' : 
                                        staff.contactRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${Math.min(staff.contactRate, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-semibold text-gray-900">{staff.conversionRate}%</span>
                                  <div className="w-12 bg-gray-200 rounded-full h-1.5 mt-1">
                                    <div 
                                      className={`h-1.5 rounded-full transition-all duration-300 ${
                                        staff.conversionRate >= 30 ? 'bg-green-500' : 
                                        staff.conversionRate >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${Math.min(staff.conversionRate, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`text-sm font-medium ${
                                  staff.averageResponseTime <= 1 ? 'text-green-600' : 
                                  staff.averageResponseTime <= 4 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {staff.averageResponseTime > 0 ? `${staff.averageResponseTime}h` : 'N/A'}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <Badge variant={
                                  staff.conversionRate >= 25 ? "default" :
                                  staff.conversionRate >= 15 ? "secondary" : "destructive"
                                }>
                                  {staff.conversionRate >= 25 ? 'Excellent' :
                                   staff.conversionRate >= 15 ? 'Good' : 'Needs Improvement'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Performance Data Available</h3>
                    <p className="text-gray-500 mb-4">
                      Staff performance analytics will display here once team members begin capturing and managing leads.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                      <h4 className="font-medium text-blue-900 mb-2">How Staff Performance Works:</h4>
                      <ul className="text-sm text-blue-700 space-y-1 text-left">
                        <li>• Track individual lead capture rates</li>
                        <li>• Monitor contact and conversion performance</li>
                        <li>• Measure response times and efficiency</li>
                        <li>• Compare staff performance rankings</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Lead & Conversion Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData?.monthlyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="leads" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        name="Total Leads"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="conversions" 
                        stackId="2"
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        name="Conversions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Best Branch</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analyticsData?.businessInsights?.topPerformingBranch || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Most Popular Vehicle</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analyticsData?.businessInsights?.topPerformingVehicle || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lead Growth</p>
                      <p className="text-lg font-semibold text-green-600">
                        {analyticsData?.businessInsights?.leadGrowth || 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Business Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Market Expansion Opportunity</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Consider expanding fleet in {analyticsData?.businessInsights?.topPerformingBranch || 'top-performing areas'} 
                        based on high conversion rates and demand.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Conversion Optimization</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Focus on {analyticsData?.businessInsights?.topPerformingVehicle || 'high-demand vehicles'} 
                        to maximize conversion rates and customer satisfaction.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900">Process Improvement</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Response time averaging {analyticsData?.overview.averageResponseTime || 0}h. 
                        Target faster responses to improve conversion rates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}