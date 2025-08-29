# Dynamic Role-Based Access Control System

This document describes the new dynamic role-based access control (RBAC) system implemented in the Hospital Management System.

## Overview

The system has been upgraded from hardcoded roles to a fully dynamic role management system where:

- **Super Admins** can create and manage custom roles
- **Permissions** are granular and module-based
- **Role assignments** can be changed without code modifications
- **Access control** is enforced both on frontend and backend

## Database Schema

### New Tables

1. **roles** - Stores role definitions
   - `id` - Unique role identifier
   - `name` - System name (e.g., 'custom_doctor')
   - `display_name` - Human-readable name (e.g., 'Custom Doctor')
   - `description` - Role description
   - `access_level` - Numeric access level (1-10)
   - `is_active` - Whether role is active
   - `is_system_role` - Protected system roles

2. **permissions** - Stores available permissions
   - `id` - Unique permission identifier
   - `name` - System name (e.g., 'patients_create')
   - `display_name` - Human-readable name
   - `module` - Module/feature this permission controls
   - `description` - Permission description

3. **role_permissions** - Many-to-many relationship
   - `role_id` - References roles table
   - `permission_id` - References permissions table
   - `actions` - JSON array of allowed actions ['create', 'read', 'update', 'delete']

### Modified Tables

- **users** table:
  - `role` column removed (was enum)
  - `role_id` column added (foreign key to roles table)

## API Endpoints

### Role Management
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get specific role
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `GET /api/roles/permissions` - Get available permissions

### Permission Management
- `GET /api/permissions` - List all permissions
- `GET /api/permissions/modules` - Get permissions grouped by module
- `POST /api/permissions` - Create new permission
- `PUT /api/permissions/:id` - Update permission
- `DELETE /api/permissions/:id` - Delete permission

## Frontend Components

### Super Admin Dashboard
- **Location**: `/admin`
- **Component**: `SuperAdminDashboard`
- **Features**: 
  - Overview of system health
  - Quick actions for user/role management
  - Activity monitoring

### Role Management
- **Location**: `/admin/roles`
- **Component**: `RoleManagement`
- **Features**:
  - Create/edit/delete custom roles
  - Assign permissions to roles
  - Manage access levels
  - View role usage statistics

### User Management
- **Location**: `/admin/users`
- **Component**: `SuperAdminUserManagement`
- **Features**:
  - Create/edit/delete users
  - Assign roles to users
  - View user permissions
  - Manage user status

## Default Roles

The system comes with predefined system roles:

1. **Super Admin** (Level 10)
   - Full system access
   - Can manage roles and users
   - Protected from deletion

2. **Doctor** (Level 8)
   - Patient care permissions
   - Medical records access
   - Prescription management

3. **Nurse** (Level 5)
   - Patient care support
   - Basic medical records
   - Bed management

4. **Billing Manager** (Level 6)
   - Financial operations
   - Billing management
   - Payment processing

5. **Lab Technician** (Level 4)
   - Laboratory operations
   - Test management
   - Results reporting

6. **Pharmacist** (Level 4)
   - Inventory management
   - Prescription fulfillment
   - Drug dispensing

7. **Receptionist** (Level 3)
   - Patient registration
   - Appointment scheduling
   - Basic access

8. **Medical Store Manager** (Level 5)
   - Inventory control
   - Supply management
   - Procurement

## Permissions System

### Module-Based Permissions

Permissions are organized by modules:

- `dashboard` - Dashboard access
- `patients` - Patient management
- `appointments` - Appointment scheduling
- `medical_records` - Medical record access
- `billing` - Financial operations
- `inventory` - Supply management
- `lab_tests` - Laboratory operations
- `beds` - Bed management
- `prescriptions` - Prescription management
- `notifications` - Notification system
- `users` - User management
- `roles` - Role management

### Action Types

Each permission can have specific actions:
- `create` - Add new records
- `read` - View existing records
- `update` - Modify existing records
- `delete` - Remove records

### Special Permissions

- `*` module - Super admin wildcard (grants all permissions)

## Migration Guide

### For Existing Installations

1. **Backup your database** before running migrations
2. Run the migration script: `./setup-dynamic-roles.sh`
3. Existing users will need role assignments
4. System roles will be automatically created

### For New Installations

1. Run standard migrations
2. Default roles and permissions are automatically seeded
3. Create your first super admin user
4. Configure additional roles as needed

## Security Considerations

1. **System Roles Protection**: Default roles cannot be deleted
2. **Permission Validation**: Backend validates all permission checks
3. **Role Hierarchies**: Access levels help maintain proper hierarchies
4. **Audit Trail**: All role/permission changes should be logged

## Development Notes

### Adding New Permissions

1. Add permission to the seeder
2. Update frontend components to check new permission
3. Add backend middleware validation
4. Update role assignments as needed

### Creating Custom Roles

1. Use Super Admin dashboard
2. Select appropriate permissions
3. Set proper access level
4. Test role functionality thoroughly

### Frontend Permission Checks

```typescript
// Check module permission
const canViewPatients = hasPermission('patients', 'read');

// Check role
const isSuperAdmin = hasRole('super_admin');

// Use RoleBasedAccess component
<RoleBasedAccess requiredModule="patients" requiredAction="create">
  <CreatePatientButton />
</RoleBasedAccess>
```

### Backend Permission Checks

```typescript
// In controllers
const user = auth.getUserOrFail();
if (!(await user.hasPermission('patients', 'create'))) {
  return response.forbidden({ message: 'Insufficient permissions' });
}
```

## Troubleshooting

### Common Issues

1. **Users can't access features**: Check role assignments and permissions
2. **Migrations fail**: Ensure database backup and proper privileges
3. **Permission denied**: Verify user has correct role with required permissions
4. **Super admin locked out**: Use database access to verify role assignments

### Support Commands

```bash
# Check user roles
SELECT u.email, r.name as role_name FROM users u 
LEFT JOIN roles r ON u.role_id = r.id;

# Check role permissions
SELECT r.name as role_name, p.name as permission_name, rp.actions 
FROM roles r 
JOIN role_permissions rp ON r.id = rp.role_id 
JOIN permissions p ON rp.permission_id = p.id;
```

## Future Enhancements

1. **Role Templates**: Pre-configured role templates for common scenarios
2. **Permission Groups**: Logical grouping of related permissions
3. **Time-based Access**: Temporary role assignments
4. **Audit Logging**: Comprehensive logging of all access control changes
5. **Role Inheritance**: Hierarchical role structures
6. **Multi-tenant Support**: Organization-specific roles and permissions

## Contributing

When adding new features:

1. Define required permissions clearly
2. Add permissions to appropriate seeders
3. Implement frontend and backend checks
4. Update documentation
5. Test with different role combinations

For questions or issues, please refer to the project documentation or contact the development team.
