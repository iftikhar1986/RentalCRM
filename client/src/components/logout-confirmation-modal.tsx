import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, LogOut, X } from "lucide-react";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isLoggingOut: boolean;
}

export function LogoutConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName,
  isLoggingOut 
}: LogoutConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-md mx-4 rounded-2xl border border-gray-200/60 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ${
          mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoggingOut}
          className="absolute right-4 top-4 p-1 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 disabled:opacity-50"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <DialogHeader className="text-center space-y-6 pt-2">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/90 to-orange-600/90 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2} />
              {/* Subtle pulse effect */}
              <div className="absolute inset-0 rounded-2xl bg-amber-400/20 animate-pulse" />
              {/* Status indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-pulse" />
            </div>
          </div>

          <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">
            Confirm Logout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Content */}
          <div className="text-center space-y-4">
            <p className="text-gray-700 leading-relaxed">
              <span className="font-medium">{userName}</span>, are you sure you want to sign out of your Q-Mobility session?
            </p>
            
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-900">Security Notice</p>
                  <p className="text-xs text-amber-700 mt-1">
                    You will need to re-authenticate to access the platform again. Any unsaved changes may be lost.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoggingOut}
              className="flex-1 h-11 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <span className="font-medium">Cancel</span>
            </Button>
            
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              {isLoggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing out...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </div>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Session will be securely terminated
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}