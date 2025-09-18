import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AccountSettings } from "@/components/account-settings";
import { LogoutConfirmationModal } from "@/components/logout-confirmation-modal";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export function UserDropdown() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    
    try {
      // Clear all cached queries immediately before making the request
      queryClient.clear();
      
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Close modal and redirect after logout
        setShowLogoutModal(false);
        window.location.replace("/");
      } else {
        // If logout fails, restore the cache and show error
        queryClient.invalidateQueries();
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive",
      });
      setShowLogoutModal(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserDisplayName = () => {
    const userObj = user as any;
    if (userObj?.firstName && userObj?.lastName) {
      return `${userObj.firstName} ${userObj.lastName}`;
    } else if (userObj?.firstName) {
      return userObj.firstName;
    } else if (userObj?.email) {
      return userObj.email;
    }
    return "User";
  };

  const getUserInitials = () => {
    const userObj = user as any;
    if (userObj?.firstName && userObj?.lastName) {
      return `${userObj.firstName[0]}${userObj.lastName[0]}`.toUpperCase();
    } else if (userObj?.firstName) {
      return userObj.firstName[0].toUpperCase();
    } else if (userObj?.email) {
      return userObj.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={`
              flex items-center hover:bg-gray-50 rounded-xl transition-all duration-200
              ${isMobile 
                ? 'space-x-0 px-2 py-2 h-10 w-10 justify-center' 
                : 'space-x-2 px-3 py-2 h-auto'
              }
            `}
          >
            <Avatar className={isMobile ? "h-7 w-7" : "h-8 w-8"}>
              <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {!isMobile && (
              <>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {getUserDisplayName()}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {(user as any)?.role || "User"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className={`
            w-56 rounded-xl border-0 shadow-lg bg-white/95 backdrop-blur-sm
            ${isMobile ? 'mr-2' : ''}
          `}
          sideOffset={8}
        >
          <div className="px-3 py-2.5">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {(user as any)?.email}
            </p>
            {isMobile && (
              <p className="text-xs text-gray-500 capitalize mt-1">
                {(user as any)?.role || "User"}
              </p>
            )}
          </div>
          
          <DropdownMenuSeparator className="bg-gray-100" />
          
          <DropdownMenuItem 
            onClick={() => setShowAccountSettings(true)}
            className="cursor-pointer rounded-lg mx-1 my-1 px-2 py-2.5 hover:bg-gray-50 focus:bg-gray-50"
          >
            <Settings className="mr-3 h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Account Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-gray-100" />
          
          <DropdownMenuItem 
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            className="cursor-pointer rounded-lg mx-1 my-1 px-2 py-2.5 hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600 disabled:opacity-50"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="text-sm">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountSettings 
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        userName={(user as any)?.firstName || (user as any)?.email?.split('@')[0] || 'User'}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}