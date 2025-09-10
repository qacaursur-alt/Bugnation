import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Save, 
  Globe, 
  Mail, 
  Shield, 
  Database,
  Server,
  Bell,
  Users,
  DollarSign
} from "lucide-react";

export default function SettingsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: systemSettings = {
    siteName: "TestCademy",
    siteDescription: "Professional Software Testing Academy",
    siteUrl: "https://testcademy.com",
    adminEmail: "admin@testcademy.com",
    supportEmail: "support@testcademy.com",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    maxFileSize: "10MB",
    sessionTimeout: "24",
    backupFrequency: "daily"
  }, isLoading: systemLoading } = useQuery({
    queryKey: ["/api/admin/settings/system"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/settings/system");
      return response.json();
    },
  });


  // Fetch email settings
  const { data: emailSettings = {
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    smtpSecure: true,
    fromName: "TestCademy",
    fromEmail: "noreply@testcademy.com",
    welcomeEmailTemplate: "Welcome to TestCademy!",
    enrollmentConfirmationTemplate: "Your enrollment has been confirmed.",
    certificateEmailTemplate: "Your certificate is ready!"
  }, isLoading: emailLoading } = useQuery({
    queryKey: ["/api/admin/settings/email"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/settings/email");
      return response.json();
    },
  });

  // Fetch security settings
  const { data: securitySettings = {
    passwordMinLength: "8",
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    sessionTimeout: "24",
    maxLoginAttempts: "5",
    lockoutDuration: "30",
    twoFactorEnabled: false,
    ipWhitelist: "",
    allowedFileTypes: "pdf,doc,docx,ppt,pptx,jpg,jpeg,png,mp4,avi"
  }, isLoading: securityLoading } = useQuery({
    queryKey: ["/api/admin/settings/security"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/settings/security");
      return response.json();
    },
  });

  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/admin/settings/system", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "System settings updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating settings", variant: "destructive" });
    },
  });

  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/admin/settings/email", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/email"] });
      toast({ title: "Email settings updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating email settings", variant: "destructive" });
    },
  });

  const updateSecuritySettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/admin/settings/security", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/security"] });
      toast({ title: "Security settings updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating security settings", variant: "destructive" });
    },
  });

  const handleSystemSave = () => {
    updateSystemSettingsMutation.mutate(editingSystemSettings);
  };

  const handleEmailSave = () => {
    updateEmailSettingsMutation.mutate(editingEmailSettings);
  };

  const handleSecuritySave = () => {
    updateSecuritySettingsMutation.mutate(editingSecuritySettings);
  };

  // Local state for editing
  const [editingSystemSettings, setEditingSystemSettings] = useState(systemSettings);
  const [editingEmailSettings, setEditingEmailSettings] = useState(emailSettings);
  const [editingSecuritySettings, setEditingSecuritySettings] = useState(securitySettings);

  // Update local state when API data changes
  React.useEffect(() => {
    setEditingSystemSettings(systemSettings);
  }, [systemSettings]);

  React.useEffect(() => {
    setEditingEmailSettings(emailSettings);
  }, [emailSettings]);

  React.useEffect(() => {
    setEditingSecuritySettings(securitySettings);
  }, [securitySettings]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">System Settings</h2>
        <p className="text-slate-600">Manage global system configuration and preferences</p>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={editingSystemSettings.siteName}
                    onChange={(e) => setEditingSystemSettings({ ...editingSystemSettings, siteName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={editingSystemSettings.siteUrl}
                    onChange={(e) => setEditingSystemSettings({ ...editingSystemSettings, siteUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={editingSystemSettings.siteDescription}
                  onChange={(e) => setEditingSystemSettings({ ...editingSystemSettings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={editingSystemSettings.adminEmail}
                    onChange={(e) => setEditingSystemSettings({ ...editingSystemSettings, adminEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={editingSystemSettings.supportEmail}
                    onChange={(e) => setEditingSystemSettings({ ...editingSystemSettings, supportEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-slate-500">Enable to show maintenance page to users</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={editingSystemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setEditingSystemSettings({ ...editingSystemSettings, maintenanceMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registrationEnabled">Allow New Registrations</Label>
                    <p className="text-sm text-slate-500">Enable user registration on the platform</p>
                  </div>
                  <Switch
                    id="registrationEnabled"
                    checked={editingSystemSettings.registrationEnabled}
                    onCheckedChange={(checked) => setEditingSystemSettings({ ...editingSystemSettings, registrationEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-slate-500">Send email notifications for system events</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={editingSystemSettings.emailNotifications}
                    onCheckedChange={(checked) => setEditingSystemSettings({ ...editingSystemSettings, emailNotifications: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSystemSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleEmailSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="passwordRequireSpecialChars">Require Special Characters</Label>
                    <p className="text-sm text-slate-500">Passwords must contain special characters</p>
                  </div>
                  <Switch
                    id="passwordRequireSpecialChars"
                    checked={securitySettings.passwordRequireSpecialChars}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, passwordRequireSpecialChars: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="passwordRequireNumbers">Require Numbers</Label>
                    <p className="text-sm text-slate-500">Passwords must contain numbers</p>
                  </div>
                  <Switch
                    id="passwordRequireNumbers"
                    checked={securitySettings.passwordRequireNumbers}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, passwordRequireNumbers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                    <p className="text-sm text-slate-500">Enable 2FA for admin accounts</p>
                  </div>
                  <Switch
                    id="twoFactorEnabled"
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={securitySettings.allowedFileTypes}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, allowedFileTypes: e.target.value })}
                  placeholder="pdf,doc,docx,ppt,pptx,jpg,jpeg,png,mp4,avi"
                />
                <p className="text-sm text-slate-500 mt-1">Comma-separated list of allowed file extensions</p>
              </div>

              <Button onClick={handleSecuritySave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
