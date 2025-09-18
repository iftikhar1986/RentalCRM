import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface PrivacySetting {
  id: string;
  settingKey: string;
  isEnabled: boolean;
  description: string;
}

interface AdminPrivacyControlsProps {
  userRole?: string;
}

export function AdminPrivacyControls({ userRole }: AdminPrivacyControlsProps) {
  const { toast } = useToast();

  // Fetch current privacy settings
  const { data: privacySettings, isLoading } = useQuery<PrivacySetting[]>({
    queryKey: ["/api/privacy-settings"],
    retry: false,
  });

  // Update privacy setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      return await apiRequest("PATCH", `/api/privacy-settings/${id}`, { isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/privacy-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      toast({
        title: "Privacy Setting Updated",
        description: "Lead visibility rules have been updated successfully.",
      });
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
        description: "Failed to update privacy setting",
        variant: "destructive",
      });
    },
  });

  const handleTogglePrivacy = (id: string, currentState: boolean) => {
    updateSettingMutation.mutate({ id, isEnabled: !currentState });
  };

  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group settings by category
  const managerSettings = privacySettings?.filter(s => s.settingKey.includes('manager')) || [];
  const staffSettings = privacySettings?.filter(s => s.settingKey.includes('staff')) || [];
  const adminSettings = privacySettings?.filter(s => s.settingKey.includes('admin')) || [];
  const generalSettings = privacySettings?.filter(s => !s.settingKey.includes('manager') && !s.settingKey.includes('staff') && !s.settingKey.includes('admin')) || [];

  const getSettingDisplayName = (settingKey: string) => {
    const displayNames: Record<string, string> = {
      'manager_branch_isolation': 'Branch Isolation',
      'manager_all_leads_access': 'Access All Leads',
      'manager_cross_branch_reports': 'Cross-Branch Reports',
      'staff_own_leads_only': 'Own Leads Only',
      'staff_branch_leads_access': 'Branch Leads Access',
      'staff_edit_permissions': 'Edit Permissions',
      'global_lead_visibility': 'Global Lead Visibility',
      'anonymize_customer_data': 'Anonymize Customer Data',
      'hide_contact_details': 'Hide Contact Details',
      'restrict_lead_deletion': 'Restrict Lead Deletion',
      'audit_trail_logging': 'Audit Trail Logging',
      'data_export_restrictions': 'Data Export Restrictions',
      'admin_leads_visible_to_all': 'Admin Leads Visible to All'
    };
    return displayNames[settingKey] || settingKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (userRole !== 'admin') {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Privacy Settings
        </h3>
        <p className="text-gray-600 mb-4">
          Privacy settings are managed by system administrators.
        </p>
        <p className="text-sm text-gray-500">
          Contact your administrator if you have privacy concerns or need to update your data preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Access Controls */}
      <Card className="bg-white border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span>Admin Access Controls</span>
          </CardTitle>
          <p className="text-sm text-gray-500">
            Configure admin-created lead visibility across all branches and staff
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminSettings.length > 0 ? (
              adminSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {getSettingDisplayName(setting.settingKey)}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${setting.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {setting.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={setting.isEnabled}
                      onCheckedChange={() => handleTogglePrivacy(setting.id, setting.isEnabled)}
                      disabled={updateSettingMutation.isPending}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No admin-specific privacy settings configured</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manager Access Controls */}
      <Card className="bg-white border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Manager Access Controls</span>
          </CardTitle>
          <p className="text-sm text-gray-500">
            Configure what managers can access and view
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {managerSettings.length > 0 ? (
              managerSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {getSettingDisplayName(setting.settingKey)}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${setting.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {setting.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={setting.isEnabled}
                      onCheckedChange={() => handleTogglePrivacy(setting.id, setting.isEnabled)}
                      disabled={updateSettingMutation.isPending}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No manager-specific privacy settings configured</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff Access Controls */}
      <Card className="bg-white border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Staff Access Controls</span>
          </CardTitle>
          <p className="text-sm text-gray-500">
            Configure what staff members can access and modify
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffSettings.length > 0 ? (
              staffSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {getSettingDisplayName(setting.settingKey)}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${setting.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {setting.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={setting.isEnabled}
                      onCheckedChange={() => handleTogglePrivacy(setting.id, setting.isEnabled)}
                      disabled={updateSettingMutation.isPending}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No staff-specific privacy settings configured</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* General Privacy Settings */}
      {generalSettings.length > 0 && (
        <Card className="bg-white border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span>General Privacy Settings</span>
            </CardTitle>
            <p className="text-sm text-gray-500">
              Global privacy and data protection settings
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generalSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {getSettingDisplayName(setting.settingKey)}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${setting.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {setting.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={setting.isEnabled}
                      onCheckedChange={() => handleTogglePrivacy(setting.id, setting.isEnabled)}
                      disabled={updateSettingMutation.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {privacySettings?.length === 0 && (
        <Card className="bg-white border border-gray-100">
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Privacy Settings</h3>
            <p className="text-gray-500">Privacy settings will appear here once configured by the system.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}