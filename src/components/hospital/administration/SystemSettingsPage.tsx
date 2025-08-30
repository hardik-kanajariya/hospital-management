import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard';
import { httpService } from '@/services/HttpService';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import {
    WrenchIcon,
    FloppyDiskIcon,
    ArrowClockwiseIcon,
    ArrowLeftIcon,
    ShieldIcon,
    GearIcon,
    ChartBarIcon,
    CheckCircleIcon,
    WarningIcon,
    InfoIcon
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function SystemSettingsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const { updateSystemSettings } = useSuperAdminDashboard();

    const [settings, setSettings] = useState({
        // General Settings
        hospitalName: '',
        hospitalAddress: '',
        hospitalPhone: '',
        hospitalEmail: '',

        // System Settings
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        backupFrequency: 'daily',
        enableAuditLog: true,
        enableNotifications: true,
        enableEmailAlerts: true,
        autoBackupTime: '02:00',
        maintenanceMode: false,

        // Security Settings
        passwordMinLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        enableTwoFactor: false,
        lockoutDuration: 15,
        sessionIdleTimeout: 30,
        maxFileUploadSize: 10, // MB

        // Performance Settings
        cacheEnabled: true,
        databaseOptimization: true,
        enableCompression: true,
        maxConcurrentUsers: 100,
        apiTimeout: 30,
        enableApiRateLimiting: true,
        maxRequestsPerMinute: 100,
        enableCDN: false,
    });

    const [originalSettings, setOriginalSettings] = useState(settings);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Load current settings on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Track changes
    useEffect(() => {
        const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
        setHasChanges(hasChanged);
    }, [settings, originalSettings]);

    const loadSettings = async () => {
        setInitialLoading(true);
        try {
            const response = await httpService.get(API_ENDPOINTS.HOSPITAL.SETTINGS);
            if (response.success) {
                const loadedSettings = {
                    ...settings,
                    ...response.data
                };
                setSettings(loadedSettings);
                setOriginalSettings(loadedSettings);
                toast.success('Settings loaded successfully');
            } else {
                toast.error('Failed to load settings');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            toast.error('Error loading settings');
        } finally {
            setInitialLoading(false);
        }
    };

    const validateSettings = (): boolean => {
        const errors: Record<string, string> = {};

        // General Settings Validation
        if (!settings.hospitalName.trim()) {
            errors.hospitalName = 'Hospital name is required';
        }
        if (!settings.hospitalEmail.trim()) {
            errors.hospitalEmail = 'Hospital email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.hospitalEmail)) {
            errors.hospitalEmail = 'Please enter a valid email address';
        }
        if (!settings.hospitalPhone.trim()) {
            errors.hospitalPhone = 'Hospital phone number is required';
        }

        // System Settings Validation
        if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
            errors.sessionTimeout = 'Session timeout must be between 5 and 480 minutes';
        }
        if (settings.maxLoginAttempts < 1 || settings.maxLoginAttempts > 10) {
            errors.maxLoginAttempts = 'Max login attempts must be between 1 and 10';
        }

        // Security Settings Validation
        if (settings.passwordMinLength < 6 || settings.passwordMinLength > 32) {
            errors.passwordMinLength = 'Password length must be between 6 and 32 characters';
        }
        if (settings.lockoutDuration < 1 || settings.lockoutDuration > 60) {
            errors.lockoutDuration = 'Lockout duration must be between 1 and 60 minutes';
        }
        if (settings.maxFileUploadSize < 1 || settings.maxFileUploadSize > 100) {
            errors.maxFileUploadSize = 'File upload size must be between 1 and 100 MB';
        }

        // Performance Settings Validation
        if (settings.maxConcurrentUsers < 10 || settings.maxConcurrentUsers > 1000) {
            errors.maxConcurrentUsers = 'Max concurrent users must be between 10 and 1000';
        }
        if (settings.apiTimeout < 10 || settings.apiTimeout > 120) {
            errors.apiTimeout = 'API timeout must be between 10 and 120 seconds';
        }
        if (settings.maxRequestsPerMinute < 10 || settings.maxRequestsPerMinute > 1000) {
            errors.maxRequestsPerMinute = 'Max requests per minute must be between 10 and 1000';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSettingChange = (key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        
        // Clear validation error for this field if it exists
        if (validationErrors[key]) {
            setValidationErrors(prev => {
                const { [key]: removed, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleSave = async () => {
        if (!validateSettings()) {
            toast.error('Please fix the validation errors before saving');
            return;
        }

        setLoading(true);
        try {
            const result = await updateSystemSettings(settings);
            if (result.success) {
                setOriginalSettings({ ...settings });
                setHasChanges(false);
                toast.success('System settings updated successfully');
            } else {
                toast.error(result.message || 'Failed to update system settings');
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update system settings');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to their original values?')) {
            setSettings({ ...originalSettings });
            setValidationErrors({});
            setHasChanges(false);
            toast.success('Settings reset to original values');
        }
    };

    const handleResetToDefaults = () => {
        if (confirm('Are you sure you want to reset all settings to default values? This will overwrite all current settings.')) {
            const defaultSettings = {
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
                autoBackupTime: '02:00',
                maintenanceMode: false,
                passwordMinLength: 8,
                requireSpecialChars: true,
                requireNumbers: true,
                requireUppercase: true,
                enableTwoFactor: false,
                lockoutDuration: 15,
                sessionIdleTimeout: 30,
                maxFileUploadSize: 10,
                cacheEnabled: true,
                databaseOptimization: true,
                enableCompression: true,
                maxConcurrentUsers: 100,
                apiTimeout: 30,
                enableApiRateLimiting: true,
                maxRequestsPerMinute: 100,
                enableCDN: false,
            };
            setSettings(defaultSettings);
            setValidationErrors({});
            toast.success('Settings reset to default values');
        }
    };

    const getFieldError = (fieldName: string) => {
        return validationErrors[fieldName];
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <ArrowClockwiseIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading system settings...</p>
                </div>
            </div>
        );
    }

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
                            {hasChanges && (
                                <Badge variant="secondary" className="ml-2">
                                    <InfoIcon className="h-3 w-3 mr-1" />
                                    Unsaved Changes
                                </Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground">
                            Configure system-wide settings and preferences
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleReset}
                        disabled={!hasChanges}
                    >
                        <ArrowClockwiseIcon className="h-4 w-4 mr-2" />
                        Reset Changes
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleResetToDefaults}
                    >
                        Reset to Defaults
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={loading || !hasChanges}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
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

            {/* Validation Errors Alert */}
            {Object.keys(validationErrors).length > 0 && (
                <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                    <WarningIcon className="h-4 w-4" />
                    <AlertDescription>
                        Please fix the following errors:
                        <ul className="list-disc list-inside mt-2">
                            {Object.entries(validationErrors).map(([field, error]) => (
                                <li key={field} className="text-sm">{error}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

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
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hospitalName">
                                        Hospital Name *
                                    </Label>
                                    <Input
                                        id="hospitalName"
                                        value={settings.hospitalName}
                                        onChange={(e) => handleSettingChange('hospitalName', e.target.value)}
                                        className={getFieldError('hospitalName') ? 'border-destructive' : ''}
                                        placeholder="Enter hospital name"
                                    />
                                    {getFieldError('hospitalName') && (
                                        <p className="text-sm text-destructive">{getFieldError('hospitalName')}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hospitalPhone">
                                        Phone Number *
                                    </Label>
                                    <Input
                                        id="hospitalPhone"
                                        value={settings.hospitalPhone}
                                        onChange={(e) => handleSettingChange('hospitalPhone', e.target.value)}
                                        className={getFieldError('hospitalPhone') ? 'border-destructive' : ''}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                    {getFieldError('hospitalPhone') && (
                                        <p className="text-sm text-destructive">{getFieldError('hospitalPhone')}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hospitalAddress">
                                    Address
                                </Label>
                                <Textarea
                                    id="hospitalAddress"
                                    value={settings.hospitalAddress}
                                    onChange={(e) => handleSettingChange('hospitalAddress', e.target.value)}
                                    placeholder="Enter complete hospital address"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hospitalEmail">
                                    Email Address *
                                </Label>
                                <Input
                                    id="hospitalEmail"
                                    type="email"
                                    value={settings.hospitalEmail}
                                    onChange={(e) => handleSettingChange('hospitalEmail', e.target.value)}
                                    className={getFieldError('hospitalEmail') ? 'border-destructive' : ''}
                                    placeholder="admin@hospital.com"
                                />
                                {getFieldError('hospitalEmail') && (
                                    <p className="text-sm text-destructive">{getFieldError('hospitalEmail')}</p>
                                )}
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
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sessionTimeout">
                                            Session Timeout (minutes) *
                                        </Label>
                                        <Input
                                            id="sessionTimeout"
                                            type="number"
                                            min="5"
                                            max="480"
                                            value={settings.sessionTimeout}
                                            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value) || 30)}
                                            className={getFieldError('sessionTimeout') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('sessionTimeout') && (
                                            <p className="text-sm text-destructive">{getFieldError('sessionTimeout')}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">Range: 5-480 minutes</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxLoginAttempts">
                                            Max Login Attempts *
                                        </Label>
                                        <Input
                                            id="maxLoginAttempts"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={settings.maxLoginAttempts}
                                            onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
                                            className={getFieldError('maxLoginAttempts') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('maxLoginAttempts') && (
                                            <p className="text-sm text-destructive">{getFieldError('maxLoginAttempts')}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">Range: 1-10 attempts</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="backupFrequency">
                                            Backup Frequency
                                        </Label>
                                        <Select 
                                            value={settings.backupFrequency} 
                                            onValueChange={(value) => handleSettingChange('backupFrequency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hourly">Every Hour</SelectItem>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="autoBackupTime">
                                            Auto Backup Time
                                        </Label>
                                        <Input
                                            id="autoBackupTime"
                                            type="time"
                                            value={settings.autoBackupTime}
                                            onChange={(e) => handleSettingChange('autoBackupTime', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Daily backup time (if daily frequency)</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Audit Log</Label>
                                            <div className="text-sm text-muted-foreground">Track all system activities and user actions</div>
                                        </div>
                                        <Switch
                                            checked={settings.enableAuditLog}
                                            onCheckedChange={(checked) => handleSettingChange('enableAuditLog', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Notifications</Label>
                                            <div className="text-sm text-muted-foreground">System-wide notifications for all users</div>
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

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Maintenance Mode</Label>
                                            <div className="text-sm text-muted-foreground">
                                                Temporarily disable system access for maintenance
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={settings.maintenanceMode}
                                                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                                            />
                                            {settings.maintenanceMode && (
                                                <Badge variant="destructive">
                                                    <WarningIcon className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
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
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="passwordMinLength">
                                            Minimum Password Length *
                                        </Label>
                                        <Input
                                            id="passwordMinLength"
                                            type="number"
                                            min="6"
                                            max="32"
                                            value={settings.passwordMinLength}
                                            onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value) || 8)}
                                            className={getFieldError('passwordMinLength') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('passwordMinLength') && (
                                            <p className="text-sm text-destructive">{getFieldError('passwordMinLength')}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">Range: 6-32 characters</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lockoutDuration">
                                            Lockout Duration (minutes) *
                                        </Label>
                                        <Input
                                            id="lockoutDuration"
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={settings.lockoutDuration}
                                            onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e.target.value) || 15)}
                                            className={getFieldError('lockoutDuration') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('lockoutDuration') && (
                                            <p className="text-sm text-destructive">{getFieldError('lockoutDuration')}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">Range: 1-60 minutes</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sessionIdleTimeout">
                                            Session Idle Timeout (minutes)
                                        </Label>
                                        <Input
                                            id="sessionIdleTimeout"
                                            type="number"
                                            min="5"
                                            max="120"
                                            value={settings.sessionIdleTimeout}
                                            onChange={(e) => handleSettingChange('sessionIdleTimeout', parseInt(e.target.value) || 30)}
                                        />
                                        <p className="text-xs text-muted-foreground">Range: 5-120 minutes</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxFileUploadSize">
                                            Max File Upload Size (MB) *
                                        </Label>
                                        <Input
                                            id="maxFileUploadSize"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={settings.maxFileUploadSize}
                                            onChange={(e) => handleSettingChange('maxFileUploadSize', parseInt(e.target.value) || 10)}
                                            className={getFieldError('maxFileUploadSize') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('maxFileUploadSize') && (
                                            <p className="text-sm text-destructive">{getFieldError('maxFileUploadSize')}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">Range: 1-100 MB</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Require Special Characters</Label>
                                            <div className="text-sm text-muted-foreground">Passwords must contain special characters (!@#$%^&*)</div>
                                        </div>
                                        <Switch
                                            checked={settings.requireSpecialChars}
                                            onCheckedChange={(checked) => handleSettingChange('requireSpecialChars', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Require Numbers</Label>
                                            <div className="text-sm text-muted-foreground">Passwords must contain numeric characters (0-9)</div>
                                        </div>
                                        <Switch
                                            checked={settings.requireNumbers}
                                            onCheckedChange={(checked) => handleSettingChange('requireNumbers', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Require Uppercase Letters</Label>
                                            <div className="text-sm text-muted-foreground">Passwords must contain uppercase letters (A-Z)</div>
                                        </div>
                                        <Switch
                                            checked={settings.requireUppercase}
                                            onCheckedChange={(checked) => handleSettingChange('requireUppercase', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Two-Factor Authentication</Label>
                                            <div className="text-sm text-muted-foreground">
                                                Require 2FA for all users (recommended for production)
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={settings.enableTwoFactor}
                                                onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
                                            />
                                            {settings.enableTwoFactor && (
                                                <Badge variant="default">
                                                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                    Enabled
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
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
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxConcurrentUsers">
                                            Max Concurrent Users *
                                        </Label>
                                        <Input
                                            id="maxConcurrentUsers"
                                            type="number"
                                            min="10"
                                            max="1000"
                                            value={settings.maxConcurrentUsers}
                                            onChange={(e) => handleSettingChange('maxConcurrentUsers', parseInt(e.target.value) || 100)}
                                            className={getFieldError('maxConcurrentUsers') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('maxConcurrentUsers') && (
                                            <p className="text-sm text-destructive">{getFieldError('maxConcurrentUsers')}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">Range: 10-1000 users</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apiTimeout">
                                            API Timeout (seconds) *
                                        </Label>
                                        <Input
                                            id="apiTimeout"
                                            type="number"
                                            min="10"
                                            max="120"
                                            value={settings.apiTimeout}
                                            onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value) || 30)}
                                            className={getFieldError('apiTimeout') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('apiTimeout') && (
                                            <p className="text-sm text-destructive">{getFieldError('apiTimeout')}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">Range: 10-120 seconds</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxRequestsPerMinute">
                                        Max Requests Per Minute *
                                    </Label>
                                    <Input
                                        id="maxRequestsPerMinute"
                                        type="number"
                                        min="10"
                                        max="1000"
                                        value={settings.maxRequestsPerMinute}
                                        onChange={(e) => handleSettingChange('maxRequestsPerMinute', parseInt(e.target.value) || 100)}
                                        className={getFieldError('maxRequestsPerMinute') ? 'border-destructive' : ''}
                                    />
                                    {getFieldError('maxRequestsPerMinute') && (
                                        <p className="text-sm text-destructive">{getFieldError('maxRequestsPerMinute')}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Rate limiting for API requests (10-1000 requests/minute)</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Caching</Label>
                                            <div className="text-sm text-muted-foreground">Cache frequently accessed data to improve performance</div>
                                        </div>
                                        <Switch
                                            checked={settings.cacheEnabled}
                                            onCheckedChange={(checked) => handleSettingChange('cacheEnabled', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Database Optimization</Label>
                                            <div className="text-sm text-muted-foreground">Enable automatic database query optimization</div>
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

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable CDN</Label>
                                            <div className="text-sm text-muted-foreground">
                                                Use Content Delivery Network for static assets
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={settings.enableCDN}
                                                onCheckedChange={(checked) => handleSettingChange('enableCDN', checked)}
                                            />
                                            {settings.enableCDN && (
                                                <Badge variant="outline">
                                                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Summary */}
                                <Alert>
                                    <InfoIcon className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="space-y-1">
                                            <p className="font-medium">Performance Configuration Summary:</p>
                                            <ul className="text-sm space-y-1">
                                                <li>• Concurrent Users: {settings.maxConcurrentUsers}</li>
                                                <li>• API Timeout: {settings.apiTimeout}s</li>
                                                <li>• Rate Limit: {settings.maxRequestsPerMinute} req/min</li>
                                                <li>• Caching: {settings.cacheEnabled ? 'Enabled' : 'Disabled'}</li>
                                                <li>• Compression: {settings.enableCompression ? 'Enabled' : 'Disabled'}</li>
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
