#!/bin/bash

# Hospital Management System - Dynamic Role Setup Script
# This script migrates the system from hardcoded roles to dynamic role management

echo "🏥 Hospital Management System - Dynamic Role Migration"
echo "=================================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root directory of the hospital-management project"
    exit 1
fi

echo "📁 Checking project structure..."

# Run database migrations
echo "🔄 Running database migrations..."
cd server
node ace migration:run

# Run the role and permission seeder
echo "🌱 Setting up default roles and permissions..."
node ace db:seed -- --files="role_permission_seeder.ts"

echo "✅ Migration completed successfully!"
echo ""
echo "📋 What's New:"
echo "   • Dynamic role management system"
echo "   • Configurable permissions"
echo "   • Super admin dashboard for role/user management"
echo "   • Role-based access control with granular permissions"
echo ""
echo "🚀 Next Steps:"
echo "   1. Start the server: cd server && npm run dev"
echo "   2. Start the frontend: npm run dev"
echo "   3. Login as super admin to configure roles"
echo ""
echo "🔑 Default Super Admin Access:"
echo "   • Navigate to /admin for the super admin dashboard"
echo "   • Manage roles at /admin/roles"
echo "   • Manage users at /admin/users"
echo ""
echo "⚠️  Important Notes:"
echo "   • Existing users will need to be assigned new roles"
echo "   • Default system roles are protected from deletion"
echo "   • Custom roles can be created with specific permissions"
