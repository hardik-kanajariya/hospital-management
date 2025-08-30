import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard';
import {
    WrenchIcon,
    FloppyDiskIcon,
    ArrowClockwiseIcon,
    ArrowLeftIcon,
    ShieldIcon,
    GearIcon,
    ChartBarIcon
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function SystemSettingsPage() {
    const navigate = useNavigate();
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
        databaseOptimization: true,
        enableCompression: true,
        maxConcurrentUsers: 100,
        apiTimeout: 30,
        enableApiRateLimiting: true,
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
            await updateSystemSettings(settings);
            toast.success('System settings updated successfully');
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update system settings');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            setSettings({
                hospitalName: 'City General Hospital',
                hospitalAddress: '123 Medical Center Dr, Healthcare City',
                hospitalPhone: '+1 (555) 123-4567',
                hospitalEmail: 'admin@citygeneralhospital.com',
                sessionTimeout: 30,
                maxLoginAttempts: 5,
                backupFrequency: 'daily',
                enableAuditLog: true,
                enableNotifications: true,
                enableEmailAlerts: true,
                passwordMinLength: 8,
                requireSpecialChars: true,
                requireNumbers: true,
                enableTwoFactor: false,
                lockoutDuration: 15,
                cacheEnabled: true,
                databaseOptimization: true,
                enableCompression: true,
                maxConcurrentUsers: 100,
                apiTimeout: 30,
                enableApiRateLimiting: true,
            });
            toast.success('Settings reset to default values');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <WrenchIcon className="h-8 w-8 text-orange-600" />
                            System Settings
                        </h1>
                        <p className="text-muted-foreground">
                            Configure system-wide settings and preferences
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleReset}>
                        <ArrowClockwiseIcon className="h-4 w-4 mr-2" />
                        Reset to Default
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
            </div>

            {/* Settings Content */}
            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid grid-cols-4 w-full max-w-lg">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GearIcon className="h-5 w-5" />
                                Hospital Information
                            </CardTitle>
                            <CardDescription>
                                Basic hospital information and contact details
                            </CardDescription>
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

                <TabsContent value="system" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GearIcon className="h-5 w-5" />
                                System Configuration
                            </CardTitle>
                            <CardDescription>
                                General system behavior and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
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

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Enable Audit Log</Label>
                                        <div className="text-sm text-muted-foreground">Track all system activities</div>
                                    </div>
                                    <Switch
                                        checked={settings.enableAuditLog}
                                        onCheckedChange={(checked) => handleSettingChange('enableAuditLog', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Enable Notifications</Label>
                                        <div className="text-sm text-muted-foreground">System-wide notifications</div>
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

                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldIcon className="h-5 w-5" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>
                                Configure security policies and authentication requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
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

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Require Special Characters</Label>
                                        <div className="text-sm text-muted-foreground">Passwords must contain special characters</div>
                                    </div>
                                    <Switch
                                        checked={settings.requireSpecialChars}
                                        onCheckedChange={(checked) => handleSettingChange('requireSpecialChars', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Require Numbers</Label>
                                        <div className="text-sm text-muted-foreground">Passwords must contain numbers</div>
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

                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ChartBarIcon className="h-5 w-5" />
                                Performance Settings
                            </CardTitle>
                            <CardDescription>
                                Optimize system performance and resource usage
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxConcurrentUsers">Max Concurrent Users</Label>
                                        <Input
                                            id="maxConcurrentUsers"
                                            type="number"
                                            value={settings.maxConcurrentUsers}
                                            onChange={(e) => handleSettingChange('maxConcurrentUsers', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
                                        <Input
                                            id="apiTimeout"
                                            type="number"
                                            value={settings.apiTimeout}
                                            onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

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

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Enable API Rate Limiting</Label>
                                        <div className="text-sm text-muted-foreground">Prevent API abuse with rate limiting</div>
                                    </div>
                                    <Switch
                                        checked={settings.enableApiRateLimiting}
                                        onCheckedChange={(checked) => handleSettingChange('enableApiRateLimiting', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
