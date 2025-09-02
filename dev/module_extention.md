# Comprehensive Extension/Plugin System Development Roadmap

## Executive Summary
This roadmap outlines the development of a robust plugin architecture for the hospital management system, enabling third-party developers and healthcare organizations to extend functionality through modular plugins. The system will support various plugin types including clinical modules, integrations, reports, and UI components while maintaining security and stability.

## Plugin Architecture Overview

### Core Principles:
1. **Isolation**: Plugins run in sandboxed environments
2. **Security**: Strict permission system for data access
3. **Compatibility**: Version management and dependency resolution
4. **Performance**: Lazy loading and resource optimization
5. **Reliability**: Graceful failure handling

## Phase 1: Plugin Infrastructure (Week 1-2)

### Task 1.1: Plugin System Core Architecture

```typescript
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: 'clinical' | 'administrative' | 'financial' | 'integration' | 'reporting' | 'ui';
  permissions: PluginPermission[];
  dependencies: PluginDependency[];
  hooks: PluginHook[];
  routes?: PluginRoute[];
  menuItems?: PluginMenuItem[];
  widgets?: PluginWidget[];
  settings?: PluginSettings;
  compatibility: {
    minVersion: string;
    maxVersion: string;
    platform: string[];
  };
}

export interface PluginPermission {
  resource: string;
  actions: ('read' | 'write' | 'delete')[];
  scope?: 'own' | 'department' | 'all';
}

export class PluginSystem {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, Set<PluginHookHandler>> = new Map();
  private sandbox: PluginSandbox;

  async loadPlugin(pluginPath: string): Promise<void> {
    const manifest = await this.loadManifest(pluginPath);
    await this.validatePlugin(manifest);
    
    const plugin = new Plugin(manifest, this.sandbox);
    await plugin.initialize();
    
    this.plugins.set(manifest.id, plugin);
    this.registerHooks(plugin);
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    await plugin.cleanup();
    this.unregisterHooks(plugin);
    this.plugins.delete(pluginId);
  }

  executeHook(hookName: string, context: any): Promise<any> {
    const handlers = this.hooks.get(hookName) || new Set();
    const results = [];
    
    for (const handler of handlers) {
      try {
        const result = await handler(context);
        results.push(result);
      } catch (error) {
        console.error(`Plugin hook error: ${hookName}`, error);
      }
    }
    
    return results;
  }
}
```

### Task 1.2: Plugin Sandbox Environment

```typescript
export class PluginSandbox {
  private permissions: Map<string, PluginPermission[]> = new Map();
  
  constructor(private apiGateway: PluginAPIGateway) {}

  createContext(pluginId: string): PluginContext {
    return {
      api: this.createRestrictedAPI(pluginId),
      storage: this.createPluginStorage(pluginId),
      events: this.createEventBus(pluginId),
      ui: this.createUIBridge(pluginId),
      settings: this.createSettingsManager(pluginId)
    };
  }

  private createRestrictedAPI(pluginId: string) {
    const permissions = this.permissions.get(pluginId) || [];
    
    return new Proxy(this.apiGateway, {
      get: (target, prop: string) => {
        return (...args: any[]) => {
          // Check permissions before allowing API access
          if (!this.hasPermission(pluginId, prop, args)) {
            throw new Error(`Plugin ${pluginId} lacks permission for ${prop}`);
          }
          return target[prop](...args);
        };
      }
    });
  }

  private hasPermission(pluginId: string, resource: string, args: any[]): boolean {
    const permissions = this.permissions.get(pluginId) || [];
    return permissions.some(p => 
      p.resource === resource && 
      this.checkActionPermission(p, args)
    );
  }
}
```

### Task 1.3: Plugin Database Schema

```sql
-- Plugin Registry Tables
CREATE TABLE plugin_registry (
  id VARCHAR(36) PRIMARY KEY,
  plugin_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(20) NOT NULL,
  author VARCHAR(255),
  description TEXT,
  category VARCHAR(50),
  status ENUM('installed', 'active', 'disabled', 'error') DEFAULT 'installed',
  installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  config JSON,
  permissions JSON,
  metadata JSON
);

CREATE TABLE plugin_settings (
  id VARCHAR(36) PRIMARY KEY,
  plugin_id VARCHAR(100) NOT NULL,
  setting_key VARCHAR(255) NOT NULL,
  setting_value JSON,
  user_id INT,
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_plugin_setting (plugin_id, setting_key, user_id),
  FOREIGN KEY (plugin_id) REFERENCES plugin_registry(plugin_id) ON DELETE CASCADE
);

CREATE TABLE plugin_data_store (
  id VARCHAR(36) PRIMARY KEY,
  plugin_id VARCHAR(100) NOT NULL,
  store_key VARCHAR(255) NOT NULL,
  store_value JSON,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plugin_store (plugin_id, store_key),
  FOREIGN KEY (plugin_id) REFERENCES plugin_registry(plugin_id) ON DELETE CASCADE
);

CREATE TABLE plugin_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  plugin_id VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255),
  user_id INT,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_plugin_audit (plugin_id, created_at)
);
```

## Phase 2: Plugin API Gateway (Week 2-3)

### Task 2.1: Plugin API Interface

```typescript
export class PluginAPIGateway {
  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private medicalRecordService: MedicalRecordService,
    private billingService: BillingService,
    private notificationService: NotificationService
  ) {}

  // Patient APIs
  async getPatient(pluginId: string, patientId: string): Promise<PatientData> {
    await this.auditAccess(pluginId, 'patient.read', { patientId });
    return this.patientService.getPatient(patientId);
  }

  async searchPatients(pluginId: string, criteria: SearchCriteria): Promise<PatientData[]> {
    await this.auditAccess(pluginId, 'patient.search', criteria);
    return this.patientService.searchPatients(criteria);
  }

  // Appointment APIs
  async createAppointment(pluginId: string, data: AppointmentData): Promise<Appointment> {
    await this.auditAccess(pluginId, 'appointment.create', data);
    return this.appointmentService.createAppointment(data);
  }

  // Medical Record APIs
  async addMedicalNote(pluginId: string, patientId: string, note: MedicalNote): Promise<void> {
    await this.auditAccess(pluginId, 'medical_record.write', { patientId, note });
    return this.medicalRecordService.addNote(patientId, {
      ...note,
      source: `plugin:${pluginId}`
    });
  }

  // Notification APIs
  async sendNotification(pluginId: string, notification: NotificationData): Promise<void> {
    await this.auditAccess(pluginId, 'notification.send', notification);
    return this.notificationService.send({
      ...notification,
      source: `plugin:${pluginId}`
    });
  }

  private async auditAccess(pluginId: string, action: string, data: any): Promise<void> {
    // Log all plugin API access for security and debugging
    await PluginAuditService.log({
      plugin_id: pluginId,
      action,
      resource: action.split('.')[0],
      details: data,
      timestamp: new Date()
    });
  }
}
```

### Task 2.2: Plugin Hook System

```typescript
export interface HookContext {
  data: any;
  metadata: {
    user: User;
    timestamp: Date;
    source: string;
  };
  cancel?: boolean;
  modifiedData?: any;
}

export class HookManager {
  private hooks: Map<string, HookHandler[]> = new Map();

  // Available hooks
  static readonly HOOKS = {
    // Patient hooks
    BEFORE_PATIENT_CREATE: 'patient.before.create',
    AFTER_PATIENT_CREATE: 'patient.after.create',
    BEFORE_PATIENT_UPDATE: 'patient.before.update',
    AFTER_PATIENT_UPDATE: 'patient.after.update',
    
    // Appointment hooks
    BEFORE_APPOINTMENT_CREATE: 'appointment.before.create',
    AFTER_APPOINTMENT_CREATE: 'appointment.after.create',
    APPOINTMENT_STATUS_CHANGE: 'appointment.status.change',
    
    // Medical record hooks
    BEFORE_RECORD_CREATE: 'medical_record.before.create',
    AFTER_RECORD_CREATE: 'medical_record.after.create',
    
    // Billing hooks
    BEFORE_BILL_CREATE: 'bill.before.create',
    AFTER_PAYMENT_RECEIVED: 'bill.payment.received',
    
    // UI hooks
    DASHBOARD_WIDGET_LOAD: 'ui.dashboard.widget.load',
    MENU_ITEMS_LOAD: 'ui.menu.load',
    PATIENT_PROFILE_TAB: 'ui.patient.profile.tab'
  };

  async executeHook(hookName: string, context: HookContext): Promise<HookContext> {
    const handlers = this.hooks.get(hookName) || [];
    
    for (const handler of handlers) {
      try {
        context = await handler(context);
        
        // Allow hooks to cancel operations
        if (context.cancel) {
          break;
        }
      } catch (error) {
        console.error(`Hook execution error: ${hookName}`, error);
        // Continue with other hooks even if one fails
      }
    }
    
    return context;
  }

  registerHook(pluginId: string, hookName: string, handler: HookHandler): void {
    const wrappedHandler = async (context: HookContext) => {
      // Add plugin context
      context.metadata.source = `plugin:${pluginId}`;
      return handler(context);
    };
    
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    
    this.hooks.get(hookName)!.push(wrappedHandler);
  }
}
```

## Phase 3: Plugin UI Framework (Week 3-4)

### Task 3.1: Plugin UI Components

```typescript
import React, { Suspense, lazy } from 'react';

export interface PluginComponent {
  id: string;
  type: 'page' | 'widget' | 'modal' | 'tab';
  component: React.ComponentType<any>;
  props?: any;
  permissions?: string[];
}

export class PluginUIBridge {
  private components: Map<string, PluginComponent> = new Map();
  
  registerComponent(pluginId: string, component: PluginComponent): void {
    const componentId = `${pluginId}.${component.id}`;
    this.components.set(componentId, {
      ...component,
      component: this.wrapComponent(pluginId, component.component)
    });
  }

  private wrapComponent(pluginId: string, Component: React.ComponentType<any>) {
    return (props: any) => (
      <PluginErrorBoundary pluginId={pluginId}>
        <PluginContextProvider pluginId={pluginId}>
          <Suspense fallback={<PluginLoader />}>
            <Component {...props} />
          </Suspense>
        </PluginContextProvider>
      </PluginErrorBoundary>
    );
  }

  renderComponent(componentId: string, props?: any): React.ReactElement | null {
    const component = this.components.get(componentId);
    if (!component) return null;
    
    const Component = component.component;
    return <Component {...props} />;
  }
}

// Plugin Context Provider
export function PluginContextProvider({ pluginId, children }: any) {
  const api = usePluginAPI(pluginId);
  const settings = usePluginSettings(pluginId);
  
  return (
    <PluginContext.Provider value={{ api, settings, pluginId }}>
      {children}
    </PluginContext.Provider>
  );
}
```

### Task 3.2: Plugin Widget System

```typescript
export interface PluginWidget {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  permissions?: string[];
  refreshInterval?: number;
}

export class PluginWidgetManager {
  private widgets: Map<string, PluginWidget> = new Map();
  
  registerWidget(pluginId: string, widget: PluginWidget): void {
    const widgetId = `${pluginId}.${widget.id}`;
    this.widgets.set(widgetId, widget);
  }
  
  getAvailableWidgets(userPermissions: string[]): PluginWidget[] {
    return Array.from(this.widgets.values()).filter(widget => 
      !widget.permissions || 
      widget.permissions.every(p => userPermissions.includes(p))
    );
  }
  
  renderWidget(widgetId: string, props?: any): React.ReactElement | null {
    const widget = this.widgets.get(widgetId);
    if (!widget) return null;
    
    return (
      <WidgetContainer 
        title={widget.title}
        refreshInterval={widget.refreshInterval}
      >
        <widget.component {...props} />
      </WidgetContainer>
    );
  }
}
```

## Phase 4: Plugin Marketplace (Week 4-5)

### Task 4.1: Plugin Store Backend

```typescript
export class PluginMarketplaceService {
  async searchPlugins(criteria: SearchCriteria): Promise<PluginListing[]> {
    // Search from central plugin repository
    const response = await fetch(`${PLUGIN_REGISTRY_URL}/search`, {
      method: 'POST',
      body: JSON.stringify(criteria)
    });
    
    return response.json();
  }
  
  async getPluginDetails(pluginId: string): Promise<PluginDetails> {
    return await this.fetchFromRegistry(`/plugins/${pluginId}`);
  }
  
  async downloadPlugin(pluginId: string, version: string): Promise<Buffer> {
    // Verify plugin signature
    const signature = await this.getPluginSignature(pluginId, version);
    if (!await this.verifySignature(signature)) {
      throw new Error('Invalid plugin signature');
    }
    
    // Download plugin package
    const pluginData = await this.fetchPluginPackage(pluginId, version);
    
    // Scan for security issues
    await this.securityScan(pluginData);
    
    return pluginData;
  }
  
  async installPlugin(pluginData: Buffer): Promise<void> {
    // Extract plugin
    const extractedPath = await this.extractPlugin(pluginData);
    
    // Validate manifest
    const manifest = await this.loadManifest(extractedPath);
    await this.validateManifest(manifest);
    
    // Check dependencies
    await this.checkDependencies(manifest.dependencies);
    
    // Install to plugins directory
    await this.copyToPluginsDir(extractedPath, manifest.id);
    
    // Register in database
    await this.registerPlugin(manifest);
    
    // Run post-install hooks
    await this.runPostInstallHooks(manifest.id);
  }
}
```

### Task 4.2: Plugin Store UI

```typescript
import React, { useState, useEffect } from 'react';
import { Search, Download, Star, Shield, Clock } from 'lucide-react';

export function PluginStore() {
  const [plugins, setPlugins] = useState<PluginListing[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Plugin Marketplace</h1>
      
      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map(plugin => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </div>
    </div>
  );
}

function PluginCard({ plugin }: { plugin: PluginListing }) {
  const { installPlugin, isInstalling } = usePluginInstall();
  
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{plugin.name}</h3>
          <p className="text-sm text-gray-600">by {plugin.author}</p>
        </div>
        {plugin.verified && (
          <Shield className="w-5 h-5 text-green-500" title="Verified Plugin" />
        )}
      </div>
      
      <p className="text-sm text-gray-700 mb-4">{plugin.description}</p>
      
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4" />
          <span>{plugin.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <Download className="w-4 h-4" />
          <span>{plugin.downloads}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{plugin.lastUpdated}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => installPlugin(plugin.id)}
          disabled={isInstalling}
          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
        >
          {isInstalling ? 'Installing...' : 'Install'}
        </button>
        <button className="px-4 py-2 border rounded hover:bg-gray-50">
          Details
        </button>
      </div>
    </div>
  );
}
```

## Phase 5: Plugin Development Kit (Week 5-6)

### Task 5.1: Plugin CLI Tool

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { createPlugin } from './commands/create';
import { buildPlugin } from './commands/build';
import { testPlugin } from './commands/test';
import { publishPlugin } from './commands/publish';

const program = new Command();

program
  .name('hms-plugin')
  .description('Hospital Management System Plugin Development CLI')
  .version('1.0.0');

program
  .command('create <name>')
  .description('Create a new plugin')
  .option('-t, --template <template>', 'Plugin template', 'basic')
  .action(createPlugin);

program
  .command('build')
  .description('Build plugin for distribution')
  .option('-w, --watch', 'Watch for changes')
  .action(buildPlugin);

program
  .command('test')
  .description('Test plugin')
  .option('-c, --coverage', 'Generate coverage report')
  .action(testPlugin);

program
  .command('publish')
  .description('Publish plugin to marketplace')
  .option('-t, --tag <tag>', 'Version tag')
  .action(publishPlugin);

program.parse();
```

### Task 5.2: Plugin Template Generator

```typescript
import { Plugin, PluginContext } from '@hms/plugin-sdk';

export default class MyPlugin extends Plugin {
  async onActivate(context: PluginContext): Promise<void> {
    // Register hooks
    context.hooks.register('patient.after.create', this.onPatientCreate.bind(this));
    
    // Register UI components
    context.ui.registerWidget({
      id: 'my-widget',
      title: 'My Widget',
      component: () => import('./components/MyWidget'),
      defaultSize: { w: 4, h: 3 }
    });
    
    // Register API endpoints
    context.api.registerEndpoint({
      method: 'GET',
      path: '/my-plugin/data',
      handler: this.handleDataRequest.bind(this)
    });
    
    // Register settings
    context.settings.register({
      key: 'apiKey',
      type: 'string',
      label: 'API Key',
      encrypted: true
    });
  }
  
  async onDeactivate(): Promise<void> {
    // Cleanup resources
  }
  
  private async onPatientCreate(context: any): Promise<void> {
    // Handle patient creation
    const patient = context.data;
    console.log('New patient created:', patient.id);
  }
  
  private async handleDataRequest(req: any, res: any): Promise<void> {
    // Handle API request
    res.json({ message: 'Hello from plugin!' });
  }
}
```

### Task 5.3: Plugin SDK

```typescript
export abstract class Plugin {
  protected context: PluginContext;
  
  constructor(context: PluginContext) {
    this.context = context;
  }
  
  abstract onActivate(): Promise<void>;
  abstract onDeactivate(): Promise<void>;
  
  // Helper methods
  protected async getData(key: string): Promise<any> {
    return this.context.storage.get(key);
  }
  
  protected async setData(key: string, value: any): Promise<void> {
    return this.context.storage.set(key, value);
  }
  
  protected async callAPI(endpoint: string, options?: any): Promise<any> {
    return this.context.api.call(endpoint, options);
  }
  
  protected async showNotification(message: string, type: 'info' | 'success' | 'error' = 'info'): Promise<void> {
    return this.context.ui.showNotification({ message, type });
  }
}

export interface PluginContext {
  api: PluginAPI;
  storage: PluginStorage;
  events: PluginEventBus;
  hooks: PluginHooks;
  ui: PluginUI;
  settings: PluginSettings;
  logger: PluginLogger;
}
```

## Phase 6: Plugin Security & Permissions (Week 6)

### Task 6.1: Permission System

```typescript
export class PluginPermissionManager {
  private permissions: Map<string, Set<string>> = new Map();
  
  async requestPermission(pluginId: string, permission: string): Promise<boolean> {
    // Check if permission is already granted
    if (this.hasPermission(pluginId, permission)) {
      return true;
    }
    
    // Show permission request dialog to admin
    const granted = await this.showPermissionDialog(pluginId, permission);
    
    if (granted) {
      this.grantPermission(pluginId, permission);
      await this.savePermissions();
    }
    
    return granted;
  }
  
  hasPermission(pluginId: string, permission: string): boolean {
    const pluginPerms = this.permissions.get(pluginId);
    return pluginPerms ? pluginPerms.has(permission) : false;
  }
  
  grantPermission(pluginId: string, permission: string): void {
    if (!this.permissions.has(pluginId)) {
      this.permissions.set(pluginId, new Set());
    }
    this.permissions.get(pluginId)!.add(permission);
  }
  
  revokePermission(pluginId: string, permission: string): void {
    const pluginPerms = this.permissions.get(pluginId);
    if (pluginPerms) {
      pluginPerms.delete(permission);
    }
  }
  
  getPluginPermissions(pluginId: string): string[] {
    const pluginPerms = this.permissions.get(pluginId);
    return pluginPerms ? Array.from(pluginPerms) : [];
  }
}

// Available permissions
export const PLUGIN_PERMISSIONS = {
  // Data access
  PATIENT_READ: 'patient:read',
  PATIENT_WRITE: 'patient:write',
  APPOINTMENT_READ: 'appointment:read',
  APPOINTMENT_WRITE: 'appointment:write',
  MEDICAL_RECORD_READ: 'medical_record:read',
  MEDICAL_RECORD_WRITE: 'medical_record:write',
  BILLING_READ: 'billing:read',
  BILLING_WRITE: 'billing:write',
  
  // System access
  NOTIFICATION_SEND: 'notification:send',
  REPORT_GENERATE: 'report:generate',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  
  // UI access
  MENU_ADD: 'ui:menu:add',
  WIDGET_ADD: 'ui:widget:add',
  PAGE_ADD: 'ui:page:add',
  
  // Network access
  NETWORK_EXTERNAL: 'network:external',
  
  // Storage access
  STORAGE_UNLIMITED: 'storage:unlimited'
};
```

### Task 6.2: Plugin Sandbox Security

```typescript
export class SecurePluginSandbox {
  private resourceLimits = {
    maxMemoryMB: 100,
    maxStorageMB: 50,
    maxApiCallsPerMinute: 100,
    maxCpuPercent: 25
  };
  
  async executePluginCode(pluginId: string, code: Function, args: any[]): Promise<any> {
    // Create isolated context
    const context = this.createIsolatedContext(pluginId);
    
    // Monitor resource usage
    const monitor = this.startResourceMonitor(pluginId);
    
    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(
        () => code.apply(context, args),
        30000 // 30 second timeout
      );
      
      return result;
    } catch (error) {
      this.handlePluginError(pluginId, error);
      throw error;
    } finally {
      monitor.stop();
    }
  }
  
  private createIsolatedContext(pluginId: string): any {
    // Create restricted global object
    return {
      console: this.createSafeConsole(pluginId),
      setTimeout: this.createSafeTimer(pluginId, 'setTimeout'),
      setInterval: this.createSafeTimer(pluginId, 'setInterval'),
      fetch: this.createSafeFetch(pluginId),
      // Block dangerous globals
      eval: undefined,
      Function: undefined,
      process: undefined,
      require: undefined
    };
  }
  
  private createSafeFetch(pluginId: string) {
    return async (url: string, options?: any) => {
      // Check if plugin has network permission
      if (!this.hasPermission(pluginId, 'network:external')) {
        throw new Error('Plugin lacks network permission');
      }
      
      // Validate URL
      if (!this.isAllowedUrl(url)) {
        throw new Error('URL not allowed');
      }
      
      // Add plugin identifier to headers
      const headers = {
        ...options?.headers,
        'X-Plugin-ID': pluginId
      };
      
      return fetch(url, { ...options, headers });
    };
  }
}
```

## Phase 7: Plugin Examples (Week 7)

### Task 7.1: Clinical Decision Support Plugin

```typescript
import { Plugin, PluginContext } from '@hms/plugin-sdk';

export default class ClinicalDecisionSupportPlugin extends Plugin {
  async onActivate(context: PluginContext): Promise<void> {
    // Register medication interaction checker
    context.hooks.register('prescription.before.create', async (hookContext) => {
      const prescription = hookContext.data;
      const interactions = await this.checkDrugInteractions(prescription);
      
      if (interactions.length > 0) {
        context.ui.showAlert({
          type: 'warning',
          title: 'Drug Interactions Detected',
          message: `Found ${interactions.length} potential interactions`,
          actions: [
            { label: 'View Details', action: () => this.showInteractionDetails(interactions) },
            { label: 'Continue Anyway', action: () => {} },
            { label: 'Cancel', action: () => { hookContext.cancel = true; } }
          ]
        });
      }
      
      return hookContext;
    });
    
    // Add clinical guidelines widget
    context.ui.registerWidget({
      id: 'clinical-guidelines',
      title: 'Clinical Guidelines',
      component: () => import('./components/GuidelinesWidget'),
      defaultSize: { w: 6, h: 4 }
    });
  }
  
  private async checkDrugInteractions(prescription: any): Promise<any[]> {
    // Integration with drug interaction database
    const medications = prescription.medications;
    const patientMedications = await this.context.api.getPatientMedications(prescription.patient_id);
    
    // Check interactions
    return this.findInteractions([...medications, ...patientMedications]);
  }
}
```

### Task 7.2: Telemedicine Plugin

```typescript
export default class TelemedicinePlugin extends Plugin {
  async onActivate(context: PluginContext): Promise<void> {
    // Register video consultation page
    context.ui.registerPage({
      id: 'video-consultation',
      title: 'Video Consultation',
      path: '/consultations/video/:appointmentId',
      component: () => import('./pages/VideoConsultation'),
      menuItem: {
        label: 'Video Consultations',
        icon: 'video',
        parent: 'appointments'
      }
    });
    
    // Add video call button to appointments
    context.hooks.register('appointment.ui.actions', (hookContext) => {
      const appointment = hookContext.data;
      
      if (appointment.type === 'telemedicine') {
        hookContext.actions.push({
          label: 'Start Video Call',
          icon: 'video',
          action: () => this.startVideoCall(appointment.id)
        });
      }
      
      return hookContext;
    });
    
    // Register API endpoints
    context.api.registerEndpoint({
      method: 'POST',
      path: '/video/generate-token',
      handler: this.generateVideoToken.bind(this)
    });
  }
  
  private async startVideoCall(appointmentId: string): Promise<void> {
    const token = await this.generateVideoToken(appointmentId);
    this.context.ui.navigate(`/consultations/video/${appointmentId}?token=${token}`);
  }
}
```

## Phase 8: Plugin Management UI (Week 8)

### Task 8.1: Plugin Admin Dashboard

```typescript
export function PluginManagement() {
  const { plugins, loading } = usePlugins();
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  
  return (
    <div className="flex h-full">
      {/* Plugin List */}
      <div className="w-1/3 border-r p-4">
        <h2 className="text-xl font-bold mb-4">Installed Plugins</h2>
        <div className="space-y-2">
          {plugins.map(plugin => (
            <PluginListItem
              key={plugin.id}
              plugin={plugin}
              selected={selectedPlugin?.id === plugin.id}
              onClick={() => setSelectedPlugin(plugin)}
            />
          ))}
        </div>
      </div>
      
      {/* Plugin Details */}
      <div className="flex-1 p-6">
        {selectedPlugin ? (
          <PluginDetails 
            plugin={selectedPlugin}
            onUpdate={() => refetchPlugins()}
          />
        ) : (
          <div className="text-center text-gray-500">
            Select a plugin to view details
          </div>
        )}
      </div>
    </div>
  );
}

function PluginDetails({ plugin, onUpdate }: any) {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{plugin.name}</h1>
          <p className="text-gray-600">v{plugin.version} by {plugin.author}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => togglePlugin(plugin.id)}
            className={`px-4 py-2 rounded ${
              plugin.status === 'active' 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            }`}
          >
            {plugin.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          
          <button
            onClick={() => uninstallPlugin(plugin.id)}
            className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
          >
            Uninstall
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-6">
          {['overview', 'permissions', 'settings', 'logs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-primary-500 text-primary-500' 
                  : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <PluginOverview plugin={plugin} />}
        {activeTab === 'permissions' && <PluginPermissions plugin={plugin} />}
        {activeTab === 'settings' && <PluginSettings plugin={plugin} />}
        {activeTab === 'logs' && <PluginLogs plugin={plugin} />}
      </div>
    </div>
  );
}
```

## Implementation Priorities

### Critical Path (Must Have):
1. Plugin system core architecture
2. Sandbox security implementation
3. Basic plugin API gateway
4. Permission management
5. Plugin installation/uninstallation

### High Priority (Should Have):
1. Plugin marketplace backend
2. Hook system implementation
3. UI component registration
4. Plugin settings management
5. Basic plugin templates

### Medium Priority (Could Have):
1. Plugin store UI
2. Advanced security features
3. Resource monitoring
4. Plugin analytics
5. Developer documentation

### Low Priority (Won't Have - Phase 1):
1. Plugin monetization
2. Advanced IDE integration
3. Visual plugin builder
4. Plugin certification program
5. Enterprise plugin features

## Success Metrics

### Technical Metrics:
- Plugin load time < 500ms
- Sandbox overhead < 10%
- API response time < 100ms
- Zero security breaches
- 99.9% plugin stability

### Developer Metrics:
- Plugin development time < 1 week
- SDK adoption rate > 80%
- Documentation completeness 100%
- Developer satisfaction > 4.5/5
- Community plugins > 50 in 6 months

### Business Metrics:
- Plugin installation rate > 60%
- User engagement increase > 30%
- Feature request reduction > 40%
- Customer retention improvement > 20%
- Revenue from premium plugins

This comprehensive plugin system enables the hospital management application to be infinitely extensible while maintaining security, performance, and stability. The architecture supports various plugin types from simple UI widgets to complex clinical decision support systems.