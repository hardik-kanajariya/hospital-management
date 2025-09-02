# Inventory Module - Complete Development Task List (Revised)

## Current State Analysis

### Already Implemented:
1. **Database**:
   - `inventories` table exists (migration: `1756454740808_create_inventories_table.ts`)
   - Inventory model with comprehensive fields including:
     - Basic info (name, description, category)
     - Stock management (quantity, minimum stock level)
     - Financial (unit price)
     - Tracking (batch number, expiry date)
     - Supplier info and location
   - Master data seeders include inventory categories and statuses

2. **Backend**:
   - InventoriesController with full CRUD operations
   - Stock update functionality
   - Low stock alerts
   - Inventory summary/statistics
   - Validators for create and update operations

3. **Frontend**:
   - InventoryManagement, CreateInventoryItem, EditInventoryItem components
   - useInventoryApi hook
   - Basic inventory listing and management UI

### Missing Components:
1. **Database**:
   - No inventory transactions/audit table
   - No purchase orders table
   - No suppliers table
   - No inventory categories as separate table (using master data)
   - No stock movement history

2. **Backend**:
   - No automated reorder system
   - No expiry tracking and alerts
   - No batch tracking for medicines
   - No integration with billing/pharmacy
   - No inventory valuation methods (FIFO/LIFO)

3. **Frontend**:
   - No barcode scanning support
   - No stock movement visualization
   - No purchase order management
   - No supplier management interface
   - No inventory analytics dashboard

## Phase 1: Enhanced Database Schema

### Task 1.1: Create Suppliers Table Migration
Create migration for suppliers management:
- id (primary key)
- supplier_code (unique, auto-generated)
- name (required)
- contact_person
- email
- phone
- address (JSON)
- gst_number
- payment_terms (from master data)
- credit_limit
- current_balance
- status (active/inactive)
- notes
- created_by, updated_by
- created_at, updated_at

### Task 1.2: Create Purchase Orders Table Migration
Create migration for purchase order management:
- id (primary key)
- po_number (unique, auto-generated)
- supplier_id (foreign key)
- order_date
- expected_delivery_date
- actual_delivery_date
- status (draft/approved/received/cancelled)
- total_amount
- tax_amount
- discount_amount
- net_amount
- payment_status (pending/partial/paid)
- notes
- approved_by (foreign key to users)
- received_by (foreign key to users)
- created_by, updated_by
- created_at, updated_at

### Task 1.3: Create Purchase Order Items Table Migration
Create migration for PO line items:
- id (primary key)
- purchase_order_id (foreign key)
- inventory_id (foreign key)
- quantity_ordered
- quantity_received
- unit_price
- tax_percentage
- discount_amount
- total_amount
- notes
- created_at, updated_at

### Task 1.4: Create Inventory Transactions Table Migration
Create migration for tracking all inventory movements:
- id (primary key)
- transaction_number (unique, auto-generated)
- inventory_id (foreign key)
- transaction_type (in/out/adjustment/transfer/return)
- transaction_date
- quantity (positive for in, negative for out)
- balance_after_transaction
- unit_price
- total_value
- reference_type (purchase_order/bill/adjustment/transfer)
- reference_id (polymorphic reference)
- department_id (for department transfers)
- reason (for adjustments)
- batch_number
- expiry_date
- notes
- created_by
- created_at, updated_at

### Task 1.5: Create Inventory Batches Table Migration
Create migration for batch tracking:
- id (primary key)
- inventory_id (foreign key)
- batch_number (unique with inventory_id)
- manufacture_date
- expiry_date
- quantity_received
- quantity_available
- quantity_reserved
- supplier_id (foreign key)
- purchase_order_id (foreign key)
- unit_cost
- mrp (maximum retail price)
- status (active/expired/recalled)
- created_at, updated_at

### Task 1.6: Update Existing Tables
Update inventories table to add:
- reorder_point (trigger for auto reorder)
- reorder_quantity
- preferred_supplier_id (foreign key)
- storage_conditions (text)
- is_consumable (boolean)
- is_drug (boolean)
- drug_schedule (for controlled substances)
- hsn_code (for tax purposes)

Update bills table to link with inventory transactions
Update master_data to add:
- Payment terms
- Storage conditions
- Drug schedules
- Inventory adjustment reasons

## Phase 2: Backend Models & Business Logic

### Task 2.1: Create Supplier Model
Define Sequelize model with:
- Associations: hasMany purchase_orders, hasMany inventories (as preferred_supplier)
- Computed fields: total_purchases, pending_payments
- Methods: getActiveItems(), getTransactionHistory()

### Task 2.2: Create PurchaseOrder Model
Define model with:
- Associations: belongsTo supplier, hasMany purchase_order_items, belongsTo approved_by/received_by
- Computed fields: item_count, pending_items
- Methods: approve(), receive(), generateGRN()
- Hooks: Auto-generate PO number, update supplier balance

### Task 2.3: Create InventoryTransaction Model
Define model with:
- Associations: belongsTo inventory, belongsTo created_by, polymorphic reference
- Methods: validateTransaction(), updateInventoryBalance()
- Hooks: Update inventory quantity on create, prevent deletion

### Task 2.4: Create InventoryBatch Model
Define model with:
- Associations: belongsTo inventory, belongsTo supplier, hasMany transactions
- Computed fields: days_to_expiry, is_expired
- Methods: reserve(), release(), checkExpiry()
- Scopes: active, expiring_soon, expired

### Task 2.5: Update Inventory Model
Add new associations and methods:
- belongsTo preferred_supplier
- hasMany batches, transactions, purchase_order_items
- Methods: checkLowStock(), getAvailableBatches(), calculateValue()
- Virtual fields: total_value, expiring_batches_count

## Phase 3: Advanced Backend Controllers

### Task 3.1: Create Suppliers Controller
Implement endpoints:
- GET /api/suppliers (with pagination, search by name/code)
- GET /api/suppliers/:id (with purchase history)
- POST /api/suppliers (create with validation)
- PUT /api/suppliers/:id (update)
- DELETE /api/suppliers/:id (soft delete if no active POs)
- GET /api/suppliers/:id/items (supplied items history)
- GET /api/suppliers/:id/transactions (payment history)

### Task 3.2: Create Purchase Orders Controller
Implement endpoints:
- GET /api/purchase-orders (filter by status, supplier, date range)
- GET /api/purchase-orders/:id (with items and supplier details)
- POST /api/purchase-orders (create draft)
- PUT /api/purchase-orders/:id (update draft only)
- POST /api/purchase-orders/:id/approve (with role check)
- POST /api/purchase-orders/:id/receive (goods receipt with batch creation)
- POST /api/purchase-orders/:id/cancel
- GET /api/purchase-orders/:id/print (PDF generation)

### Task 3.3: Enhance Inventories Controller
Add new endpoints:
- POST /api/inventories/:id/adjust (stock adjustment with reason)
- POST /api/inventories/:id/transfer (department transfer)
- GET /api/inventories/:id/transactions (movement history)
- GET /api/inventories/:id/batches (batch details)
- GET /api/inventories/expiring (items expiring within X days)
- GET /api/inventories/reorder (items below reorder point)
- POST /api/inventories/bulk-update (for stocktaking)
- GET /api/inventories/valuation (stock valuation report)

### Task 3.4: Create Inventory Transactions Controller
Implement endpoints:
- GET /api/inventory-transactions (with extensive filters)
- GET /api/inventory-transactions/summary (by type, department)
- POST /api/inventory-transactions/issue (for patient billing)
- POST /api/inventory-transactions/return (return to inventory)
- GET /api/inventory-transactions/export (Excel/PDF export)

### Task 3.5: Create Batch Management Controller
Implement endpoints:
- GET /api/batches (filter by expiry, supplier)
- GET /api/batches/expiring (alert dashboard)
- PUT /api/batches/:id/recall (mark as recalled)
- GET /api/batches/movement (batch-wise movement report)

## Phase 4: Business Rules & Automation

### Task 4.1: Implement Stock Management Rules
- Automatic low stock alerts when quantity < minimum_stock_level
- Prevent negative stock (configurable override for emergency)
- FIFO batch selection for consumables
- Batch expiry validation before issue
- Reserved quantity management for pending bills

### Task 4.2: Purchase Order Workflow
- Multi-level approval based on amount
- Automatic PO generation for items below reorder point
- Partial receipt handling
- Quality check integration (optional step)
- Automatic inventory update on goods receipt
- Three-way matching (PO, GRN, Invoice)

### Task 4.3: Expiry Management
- Daily cron job for expiry alerts
- Configurable alert periods (30, 60, 90 days)
- Auto-update batch status on expiry
- Prevent issue of expired items
- Generate expiry reports

### Task 4.4: Integration Rules
- Link inventory issue with patient billing
- Automatic stock deduction on bill generation
- Department-wise consumption tracking
- Integration with pharmacy module
- Cost center allocation

### Task 4.5: Audit & Compliance
- Track all inventory movements with user details
- Implement stock adjustment approval workflow
- Generate audit trails for compliance
- Support for narcotic drug registers
- Batch recall management

## Phase 5: Frontend Development

### Task 5.1: Create Supplier Management UI
- Supplier listing with search and filters
- Create/Edit supplier forms with validation
- Supplier detail view with purchase history
- Payment tracking interface
- Supplier performance analytics

### Task 5.2: Purchase Order Management
- PO listing with status filters
- Create PO with item search and selection
- Approval workflow UI
- Goods receipt interface with batch entry
- Print/Email PO functionality
- PO vs GRN reconciliation

### Task 5.3: Enhanced Inventory Management
- Add batch-wise stock view
- Implement barcode scanning support
- Stock adjustment interface with approval
- Department transfer request/approval
- Expiry alert dashboard
- Reorder suggestion interface

### Task 5.4: Advanced Search & Filters
- Multi-parameter search (name, category, supplier, batch)
- Quick filters for critical items
- Saved search preferences
- Advanced filter builder
- Export filtered results

### Task 5.5: Stock Movement Interface
- Visual stock movement timeline
- Transaction history with filters
- Batch tracking view
- Department-wise consumption
- Return/adjustment forms

## Phase 6: Analytics & Reporting

### Task 6.1: Inventory Dashboard
- Real-time stock levels by category
- Value analysis (ABC classification)
- Expiry timeline chart
- Low stock alerts widget
- Recent transactions feed
- Department consumption trends

### Task 6.2: Financial Reports
- Stock valuation by different methods
- Purchase analysis by supplier
- Price variation reports
- Dead stock identification
- Inventory turnover ratio
- Category-wise spend analysis

### Task 6.3: Operational Reports
- Stock movement report
- Expiry report with batch details
- Reorder report with suggestions
- Consumption pattern analysis
- Supplier performance report
- Audit trail report

### Task 6.4: Predictive Analytics
- Consumption forecasting
- Seasonal trend analysis
- Optimal reorder point calculation
- Supplier reliability scoring
- Stock-out risk assessment

## Phase 7: Mobile & Hardware Integration

### Task 7.1: Mobile Application Features
- Stock inquiry by barcode scan
- Quick stock adjustment
- Goods receipt on mobile
- Stock transfer requests
- Expiry alerts on mobile
- Offline capability with sync

### Task 7.2: Barcode/RFID Integration
- Generate and print barcode labels
- Barcode scanner integration
- RFID tag support (optional)
- Quick search by scan
- Batch identification by barcode
- Location tracking

### Task 7.3: Hardware Integration
- Weighing scale integration
- Temperature monitoring for cold storage
- Label printer configuration
- SMS/Email alert configuration
- Integration with pharmacy robots (if applicable)

## Phase 8: Role-Based Access Control

### Task 8.1: Define Permissions
- inventory.view, inventory.create, inventory.update, inventory.delete
- inventory.adjust, inventory.transfer
- purchase_order.create, purchase_order.approve, purchase_order.receive
- supplier.manage
- reports.inventory_view, reports.financial_view
- settings.inventory_manage

### Task 8.2: Role Configuration
- **Pharmacist**: Full inventory access, create PO, no approval
- **Store Manager**: All permissions including approval
- **Nurse**: View and issue items only
- **Doctor**: View inventory, special requisitions
- **Accounts**: View reports, manage suppliers
- **Admin**: Full access

### Task 8.3: Department-Based Access
- Restrict inventory view by department
- Department-specific item catalogs
- Inter-department transfer workflows
- Department consumption budgets
- Approval hierarchies by department

## Phase 9: Advanced Features

### Task 9.1: Automated Reordering
- Configure reorder rules by item
- Seasonal adjustment factors
- Automatic PO generation
- Vendor selection algorithm
- Budget constraint checking
- Approval workflow integration

### Task 9.2: Quality Management
- Incoming inspection checklist
- Quality parameter tracking
- Rejection and return workflow
- Vendor rating based on quality
- Batch-wise quality records
- Certificate management

### Task 9.3: Integration Features
- HL7/FHIR for inventory data exchange
- Integration with external suppliers
- EDI for purchase orders
- Insurance formulary checking
- Government reporting compliance
- ERP system integration

### Task 9.4: Advanced Inventory Features
- Kit/Bundle management
- Substitute item configuration
- Consignment inventory tracking
- Multi-location inventory
- Serial number tracking
- Warranty management

## Phase 10: Performance & Security

### Task 10.1: Performance Optimization
- Implement caching for frequently accessed data
- Optimize batch queries
- Index optimization for search
- Archival strategy for old transactions
- Report generation optimization
- Background job processing

### Task 10.2: Security Measures
- Encryption for sensitive supplier data
- Audit logging for all transactions
- Role-based data masking
- API rate limiting
- Session management
- Data backup strategies

### Task 10.3: Compliance & Standards
- GMP compliance for pharmaceuticals
- FDA regulations adherence
- Local drug control compliance
- Tax compliance (GST/VAT)
- Medical device tracking
- Hazardous material handling

This comprehensive roadmap transforms the basic inventory module into a full-featured, enterprise-grade inventory management system suitable for hospitals of any size, with advanced features for compliance, automation, and integration with other hospital systems.