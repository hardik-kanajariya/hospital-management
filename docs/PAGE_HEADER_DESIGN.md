# Page Header Design System

## Overview

This document explains the new unified page header system that eliminates duplicate headers and provides a consistent, professional layout across all pages.

## Problem Solved

**Before**: Each page component had its own header section, creating visual duplication with the main App.tsx header, resulting in:
- Poor visual hierarchy
- Inconsistent styling
- Wasted vertical space
- Confusing navigation

**After**: Unified header system with:
- Single source of truth for page headers in App.tsx
- Optional enhanced headers for complex pages using PageHeader component
- Consistent design language
- Better space utilization

## Main Header (App.tsx)

The main header is now enhanced with:

### Features
- **Page Icon**: Dynamically shows relevant icon for each page
- **Enhanced Typography**: Better font weights and sizing
- **Visual Hierarchy**: Clear separation between title and description
- **User Context**: Shows current user and role information
- **Date/Time**: Current date and time display
- **Responsive Design**: Adapts to different screen sizes

### Visual Elements
```tsx
// Enhanced header with gradient background
<header className="border-b bg-gradient-to-r from-card/80 to-card/60 backdrop-blur">
  <div className="flex items-center justify-between min-h-20 px-6 py-4">
    {/* Page Icon + Title */}
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl">
        <PageIcon className="w-6 h-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
        <p className="text-sm text-muted-foreground">{getPageDescription()}</p>
      </div>
    </div>
    
    {/* User Info + Actions */}
    <div className="flex items-center gap-3">
      {/* Date/Time + User Badge */}
    </div>
  </div>
</header>
```

## PageHeader Component

For pages that need additional context, statistics, or actions, use the `PageHeader` component:

### Import
```tsx
import { PageHeader } from '@/components/ui/page-header'
```

### Basic Usage
```tsx
<PageHeader
  actions={
    <Button onClick={() => navigate('/create')}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Add New Item
    </Button>
  }
/>
```

### With Statistics
```tsx
<PageHeader
  stats={[
    {
      label: 'Total Items',
      value: 150,
      icon: UsersIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'This Month',
      value: 25,
      icon: CalendarIcon,
      color: 'bg-green-100 text-green-600'
    }
  ]}
  actions={<Button>Add New</Button>}
/>
```

### With Breadcrumbs
```tsx
<PageHeader
  breadcrumbs={[
    { label: 'Patients', href: '/patients' },
    { label: 'John Doe', current: true }
  ]}
  actions={<Button>Edit Patient</Button>}
/>
```

### Complete Example
```tsx
<PageHeader
  badge={{ label: 'Beta', variant: 'secondary' }}
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Patients', href: '/patients' },
    { label: 'View Patient', current: true }
  ]}
  stats={[
    {
      label: 'Total Visits',
      value: 12,
      icon: CalendarIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Last Visit',
      value: '2 days ago',
      icon: ClockIcon,
      color: 'bg-orange-100 text-orange-600'
    }
  ]}
  actions={
    <div className="flex gap-2">
      <Button variant="outline">Print</Button>
      <Button>Edit Patient</Button>
    </div>
  }
>
  {/* Custom content can go here */}
  <div className="bg-yellow-50 p-3 rounded-lg">
    <p className="text-sm text-yellow-800">
      Patient has upcoming appointment tomorrow at 10:00 AM
    </p>
  </div>
</PageHeader>
```

## Updated Page Components

### Pages with NO duplicate headers (already correct):
- ✅ `BillingSystem` - Starts with tabs
- ✅ `InventoryManagement` - Starts with search/actions
- ✅ `LabManagement` - Starts with search/actions  
- ✅ `BedManagement` - Starts with search/actions

### Pages FIXED to remove duplicate headers:
- ✅ `PatientList` - Now uses PageHeader with stats
- ✅ `DoctorSchedule` - Removed duplicate title/description
- ✅ `MedicalRecordsList` - Removed duplicate header
- ✅ `Dashboard` - Simplified welcome message

## Design Principles

### 1. Single Source of Truth
- Page title and description are defined once in App.tsx
- Consistent across all routes
- Easier to maintain

### 2. Visual Hierarchy
```
App Header (Always Present)
├── Page Icon + Title + Description
├── User Context + Date/Time
│
PageHeader (Optional)
├── Breadcrumbs (if needed)
├── Statistics (if relevant)
├── Actions (if needed)
├── Custom Content (if required)
│
Page Content
├── Search/Filters
├── Data Tables/Cards
└── Other Content
```

### 3. Responsive Design
- Headers adapt to screen size
- Icons and text scale appropriately
- Actions stack on mobile devices

### 4. Accessibility
- Proper heading hierarchy (h1 in main header)
- Screen reader friendly
- High contrast design
- Keyboard navigation support

## Migration Guide

### For existing pages with duplicate headers:

1. **Remove the duplicate header section**:
```tsx
// REMOVE THIS:
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <SomeIcon className="w-6 h-6 text-primary" />
    <h1 className="text-2xl font-bold">Page Title</h1>
  </div>
  <Button>Action</Button>
</div>
```

2. **Move actions to PageHeader or simple action div**:
```tsx
// SIMPLE ACTIONS:
<div className="flex items-center justify-end">
  <Button>Action</Button>
</div>

// OR COMPLEX WITH STATS:
<PageHeader
  stats={[/* your stats */]}
  actions={<Button>Action</Button>}
/>
```

3. **Update page content to start with main functionality**:
```tsx
// Page should now start with:
<div className="space-y-6">
  <PageHeader /> {/* Only if needed */}
  
  {/* Main page content */}
  <Card>
    <CardContent>
      {/* Your actual functionality */}
    </CardContent>
  </Card>
</div>
```

## Best Practices

### When to use PageHeader
- ✅ Pages with statistics/metrics
- ✅ Pages with multiple actions
- ✅ Pages with breadcrumb navigation
- ✅ Pages with important contextual information

### When NOT to use PageHeader
- ❌ Simple pages with basic content
- ❌ Pages that start with tabs (tabs provide their own structure)
- ❌ Modal/dialog content
- ❌ Landing/authentication pages

### Statistics Design
- Use meaningful icons from Phosphor Icons
- Keep labels short and descriptive
- Use consistent color coding
- Show actual numbers, not just percentages

### Action Buttons
- Primary actions on the right
- Secondary actions to the left of primary
- Use consistent button styling
- Group related actions together

## Color System for Stats

```tsx
// Recommended color combinations:
const statColors = {
  primary: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600', 
  warning: 'bg-orange-100 text-orange-600',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-purple-100 text-purple-600',
  neutral: 'bg-gray-100 text-gray-600'
}
```

## Testing the New Design

1. Navigate through different pages
2. Verify no duplicate headers exist
3. Check responsive behavior on mobile
4. Ensure all actions are accessible
5. Validate visual hierarchy is clear

The new header system provides a much more professional, consistent, and user-friendly experience across the entire hospital management application.
