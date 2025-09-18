import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Shield, ArrowRight, Building, Users, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    // Just scroll to login section - we're already on the login page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center shadow-xl transform rotate-3">
                  <Car className="text-white" size={48} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="text-white" size={16} />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Q-Mobility
            </h1>
            <p className="text-xl text-gray-600 font-medium mb-2">Internal Lead Management Platform</p>
            <p className="text-gray-500">Streamlined rental car lead management for Qatar's premier mobility service</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Features Section */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Lead Management</h3>
                    <p className="text-sm text-gray-600">Comprehensive customer lead tracking and management system</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Analytics Dashboard</h3>
                    <p className="text-sm text-gray-600">Real-time insights and performance metrics</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Multi-Branch Support</h3>
                    <p className="text-sm text-gray-600">Manage operations across all Q-Mobility locations</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Login Card */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md bg-white border-0 shadow-xl shadow-black/10">
                <CardHeader className="pb-6 pt-8 px-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                      Staff Access
                    </h2>
                    <p className="text-gray-600">
                      Sign in to access your dashboard
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <Shield className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-6">
                        Secure authentication required for platform access
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleLogin}
                      className="w-full h-12 bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-black/20 font-semibold text-base transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2">
                        Sign In to Dashboard
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Button>
                    
                    <div className="text-center pt-4">
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                        <Shield size={12} />
                        <span>Protected by enterprise-grade security</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-16 space-y-2">
            <p className="text-sm text-gray-500 font-medium">
              Authorized personnel only • Qatar-based rental car management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
