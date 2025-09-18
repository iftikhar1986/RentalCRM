import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [location] = useLocation();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Main 404 Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-12 pb-8 px-8">
            {/* Large 404 Number */}
            <div className="mb-8">
              <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-gradient-to-r from-gray-600 via-gray-800 to-black bg-clip-text leading-none">
                404
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-gray-600 to-black mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Error Message */}
            <div className="mb-8 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Page Not Found
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                The page you're looking for doesn't exist or has been moved to a new location.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="w-full sm:w-auto border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-6 py-3"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="w-full sm:w-auto border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-6 py-3"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Search className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Link href="/">
                <div className="p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="font-medium text-gray-900 mb-1">Dashboard</div>
                  <div className="text-sm text-gray-600">View leads and analytics</div>
                </div>
              </Link>
              
              <Link href="/users">
                <div className="p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="font-medium text-gray-900 mb-1">User Management</div>
                  <div className="text-sm text-gray-600">Manage system users</div>
                </div>
              </Link>
              
              <Link href="/vehicles">
                <div className="p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="font-medium text-gray-900 mb-1">Fleet Management</div>
                  <div className="text-sm text-gray-600">Manage vehicle inventory</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500">
          <p>© 2025 Q-Mobility Lead Management System</p>
        </div>
      </div>
    </div>
  );
}