# Demo Accounts Configuration

This document explains how to configure and manage demo accounts in the MedCare Hospital Management System.

## Overview

The system supports dynamic demo accounts that can be enabled/disabled via environment variables and are fetched from the database rather than being hardcoded.

## Configuration

### Backend Configuration

Set the following environment variable in your server `.env` file:

```bash
SHOW_DEMO_ACCOUNTS=true  # Set to 'false' to disable demo accounts
```

### Frontend Configuration

Set the following environment variable in your root `.env` file:

```bash
VITE_SHOW_DEMO_ACCOUNTS=true  # Set to 'false' to hide demo accounts in login form
```

## Database Setup

Demo accounts are managed through the `is_for_demo_purpose` column in the users table:

- `true`: User is a demo account and will appear in the demo accounts list
- `false`: User is a production account and will not appear in demo list

## Seeder

The `system_setup_seeder.ts` handles:

1. Creating system roles and permissions
2. Setting up organizations
3. Creating production users (system admins)
4. Creating demo users (when enabled)

Demo users are only created when:
- `NODE_ENV=development` OR
- `SHOW_DEMO_ACCOUNTS=true`

### Running the Seeder

```bash
# Run all seeders
npm run db:seed

# Run only the system setup seeder
node ace db:seed --files="./database/seeders/system_setup_seeder.ts"
```

## Demo Account Management

### Adding New Demo Accounts

1. Create users with `is_for_demo_purpose: true`
2. They will automatically appear in the login form (if enabled)

### API Endpoint

```
GET /api/auth/demo-accounts
```

Returns all active demo accounts with their role information.

## Security Considerations

- Demo accounts should only be enabled in development/staging environments
- In production, set `SHOW_DEMO_ACCOUNTS=false` to disable demo functionality
- Demo accounts use the standard password `admin123` for testing purposes

## Features

- ✅ Environment-based configuration
- ✅ Dynamic loading from database
- ✅ Role-based display with access levels
- ✅ Automatic password filling
- ✅ Loading states and error handling
- ✅ Duplicate-safe seeding

## Migration

If migrating from static demo accounts:

1. Run the migration: `node ace migration:run`
2. Run the new seeder: `node ace db:seed --files="./database/seeders/system_setup_seeder.ts"`
3. Update environment variables as needed
4. Old seeders are backed up as `.backup` files
