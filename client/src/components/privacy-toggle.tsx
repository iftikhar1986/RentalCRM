import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrivacyToggleProps {
  isPrivacyEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  userRole?: string;
}

export function PrivacyToggle({ isPrivacyEnabled, onToggle, userRole }: PrivacyToggleProps) {
  const { toast } = useToast();

  const handleToggle = () => {
    const newState = !isPrivacyEnabled;
    onToggle(newState);
    
    let description = "";
    if (newState) {
      if (userRole === "admin") {
        description = "Privacy enabled. You can still see all leads as admin.";
      } else if (userRole === "manager") {
        description = "Privacy enabled. You can see leads from your branch only.";
      } else {
        description = "Privacy enabled. You can see only your own leads.";
      }
    } else {
      description = "Privacy disabled. You can see all leads.";
    }

    toast({
      title: `Privacy ${newState ? "Enabled" : "Disabled"}`,
      description,
    });
  };

  return (
    <Button
      variant={isPrivacyEnabled ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className={`flex items-center space-x-2 ${
        isPrivacyEnabled 
          ? "bg-blue-600 hover:bg-blue-700 text-white" 
          : "border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {isPrivacyEnabled ? (
        <Shield className="h-4 w-4" />
      ) : (
        <ShieldOff className="h-4 w-4" />
      )}
      <span className="text-sm">
        Privacy {isPrivacyEnabled ? "On" : "Off"}
      </span>
    </Button>
  );
}