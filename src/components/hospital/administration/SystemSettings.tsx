import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard';
import { WrenchIcon, FloppyDiskIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SystemSettingsProps {
    children: React.ReactNode;
}

export default function SystemSettings({ children }: SystemSettingsProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { updateSystemSettings } = useSuperAdminDashboard();

    const [settings, setSettings] = useState({
        // General Settings
        hospitalName: 'City General Hospital',
        hospitalAddress: '123 Medical Center Dr, Healthcare City',
        hospitalPhone: '+1 (555) 123-4567',
        hospitalEmail: 'admin@citygeneralhospital.com',

        // System Settings
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        backupFrequency: 'daily',
        enableAuditLog: true,
        enableNotifications: true,
        enableEmailAlerts: true,

        // Security Settings
        passwordMinLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        enableTwoFactor: false,
        lockoutDuration: 15,

        // Performance Settings
        cacheEnabled: true,
        maxConcurrentUsers: 100,
        databaseOptimization: true,
        enableCompression: true
    });

    const handleSettingChange = (key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await updateSystemSettings(settings);
            if (result.success) {
                setOpen(false);
                toast.success('Settings updated successfully');
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            console.error('Settings update error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <WrenchIcon className="h-5 w-5" />
                        System Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure hospital and system settings
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hospital Information</CardTitle>
                                <CardDescription>Basic hospital details and contact information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="hospitalName">Hospital Name</Label>
                                        <Input
                                            id="hospitalName"
                                            value={settings.hospitalName}
                                            onChange={(e) => handleSettingChange('hospitalName', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hospitalPhone">Phone Number</Label>
                                        <Input
                                            id="hospitalPhone"
                                            value={settings.hospitalPhone}
                                            onChange={(e) => handleSettingChange('hospitalPhone', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hospitalAddress">Address</Label>
                                    <Input
                                        id="hospitalAddress"
                                        value={settings.hospitalAddress}
                                        onChange={(e) => handleSettingChange('hospitalAddress', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hospitalEmail">Email</Label>
                                    <Input
                                        id="hospitalEmail"
                                        type="email"
                                        value={settings.hospitalEmail}
                                        onChange={(e) => handleSettingChange('hospitalEmail', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Configuration</CardTitle>
                                <CardDescription>Application behavior and operational settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                        <Input
                                            id="sessionTimeout"
                                            type="number"
                                            value={settings.sessionTimeout}
                                            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                        <Input
                                            id="maxLoginAttempts"
                                            type="number"
                                            value={settings.maxLoginAttempts}
                                            onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Audit Logging</Label>
                                            <div className="text-sm text-muted-foreground">Track system actions and changes</div>
                                        </div>
                                        <Switch
                                            checked={settings.enableAuditLog}
                                            onCheckedChange={(checked) => handleSettingChange('enableAuditLog', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Notifications</Label>
                                            <div className="text-sm text-muted-foreground">System-wide notification service</div>
                                        </div>
                                        <Switch
                                            checked={settings.enableNotifications}
                                            onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Email Alerts</Label>
                                            <div className="text-sm text-muted-foreground">Send important alerts via email</div>
                                        </div>
                                        <Switch
                                            checked={settings.enableEmailAlerts}
                                            onCheckedChange={(checked) => handleSettingChange('enableEmailAlerts', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>Password policies and authentication settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                                        <Input
                                            id="passwordMinLength"
                                            type="number"
                                            value={settings.passwordMinLength}
                                            onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                                        <Input
                                            id="lockoutDuration"
                                            type="number"
                                            value={settings.lockoutDuration}
                                            onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Require Special Characters</Label>
                                            <div className="text-sm text-muted-foreground">Password must contain special characters</div>
                                        </div>
                                        <Switch
                                            checked={settings.requireSpecialChars}
                                            onCheckedChange={(checked) => handleSettingChange('requireSpecialChars', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Require Numbers</Label>
                                            <div className="text-sm text-muted-foreground">Password must contain numeric characters</div>
                                        </div>
                                        <Switch
                                            checked={settings.requireNumbers}
                                            onCheckedChange={(checked) => handleSettingChange('requireNumbers', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Two-Factor Authentication</Label>
                                            <div className="text-sm text-muted-foreground">Require 2FA for all users</div>
                                        </div>
                                        <Switch
                                            checked={settings.enableTwoFactor}
                                            onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Settings</CardTitle>
                                <CardDescription>System optimization and performance tuning</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxConcurrentUsers">Max Concurrent Users</Label>
                                    <Input
                                        id="maxConcurrentUsers"
                                        type="number"
                                        value={settings.maxConcurrentUsers}
                                        onChange={(e) => handleSettingChange('maxConcurrentUsers', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Caching</Label>
                                            <div className="text-sm text-muted-foreground">Cache frequently accessed data</div>
                                        </div>
                                        <Switch
                                            checked={settings.cacheEnabled}
                                            onCheckedChange={(checked) => handleSettingChange('cacheEnabled', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Database Optimization</Label>
                                            <div className="text-sm text-muted-foreground">Enable automatic database optimization</div>
                                        </div>
                                        <Switch
                                            checked={settings.databaseOptimization}
                                            onCheckedChange={(checked) => handleSettingChange('databaseOptimization', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Compression</Label>
                                            <div className="text-sm text-muted-foreground">Compress API responses and static assets</div>
                                        </div>
                                        <Switch
                                            checked={settings.enableCompression}
                                            onCheckedChange={(checked) => handleSettingChange('enableCompression', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? (
                            <>
                                <ArrowClockwiseIcon className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FloppyDiskIcon className="h-4 w-4 mr-2" />
                                Save Settings
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
