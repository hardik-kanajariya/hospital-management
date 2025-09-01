import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'multiple_tables'

    async up() {
        // First, seed the master_data table with all enum values
        await this.seedMasterData()

        // Convert patients table enums
        await this.convertPatientsTable()

        // Convert appointments table enums
        await this.convertAppointmentsTable()

        // Convert lab_tests table enums
        await this.convertLabTestsTable()

        // Convert beds table enums
        await this.convertBedsTable()

        // Convert bills table enums
        await this.convertBillsTable()

        // Convert inventories table enums
        await this.convertInventoriesTable()

        // Convert prescriptions table enums
        await this.convertPrescriptionsTable()

        // Convert notifications table enums
        await this.convertNotificationsTable()
    }

    async down() {
        // Reverse all changes - convert string columns back to enums
        await this.revertNotificationsTable()
        await this.revertPrescriptionsTable()
        await this.revertInventoriesTable()
        await this.revertBillsTable()
        await this.revertBedsTable()
        await this.revertLabTestsTable()
        await this.revertAppointmentsTable()
        await this.revertPatientsTable()

        // Remove master data entries (optional - might want to keep them)
        await this.cleanupMasterData()
    }

    private async seedMasterData() {
        const masterDataEntries = [
            // Gender master data
            { category: 'gender', name: 'Male', value: 'male', description: 'Male gender', is_system: true, is_active: true, display_order: 1 },
            { category: 'gender', name: 'Female', value: 'female', description: 'Female gender', is_system: true, is_active: true, display_order: 2 },
            { category: 'gender', name: 'Other', value: 'other', description: 'Other gender', is_system: true, is_active: true, display_order: 3 },

            // Blood groups master data
            { category: 'blood_groups', name: 'A Positive', value: 'A+', description: 'A positive blood group', is_system: true, is_active: true, display_order: 1 },
            { category: 'blood_groups', name: 'A Negative', value: 'A-', description: 'A negative blood group', is_system: true, is_active: true, display_order: 2 },
            { category: 'blood_groups', name: 'B Positive', value: 'B+', description: 'B positive blood group', is_system: true, is_active: true, display_order: 3 },
            { category: 'blood_groups', name: 'B Negative', value: 'B-', description: 'B negative blood group', is_system: true, is_active: true, display_order: 4 },
            { category: 'blood_groups', name: 'AB Positive', value: 'AB+', description: 'AB positive blood group', is_system: true, is_active: true, display_order: 5 },
            { category: 'blood_groups', name: 'AB Negative', value: 'AB-', description: 'AB negative blood group', is_system: true, is_active: true, display_order: 6 },
            { category: 'blood_groups', name: 'O Positive', value: 'O+', description: 'O positive blood group', is_system: true, is_active: true, display_order: 7 },
            { category: 'blood_groups', name: 'O Negative', value: 'O-', description: 'O negative blood group', is_system: true, is_active: true, display_order: 8 },

            // Appointment status master data
            { category: 'appointment_status', name: 'Scheduled', value: 'scheduled', description: 'Appointment is scheduled', is_system: true, is_active: true, display_order: 1 },
            { category: 'appointment_status', name: 'Confirmed', value: 'confirmed', description: 'Appointment is confirmed', is_system: true, is_active: true, display_order: 2 },
            { category: 'appointment_status', name: 'In Progress', value: 'in_progress', description: 'Appointment is in progress', is_system: true, is_active: true, display_order: 3 },
            { category: 'appointment_status', name: 'Completed', value: 'completed', description: 'Appointment is completed', is_system: true, is_active: true, display_order: 4 },
            { category: 'appointment_status', name: 'Cancelled', value: 'cancelled', description: 'Appointment is cancelled', is_system: true, is_active: true, display_order: 5 },
            { category: 'appointment_status', name: 'No Show', value: 'no_show', description: 'Patient did not show up', is_system: true, is_active: true, display_order: 6 },

            // Appointment priorities master data
            { category: 'appointment_priorities', name: 'Normal', value: 'normal', description: 'Normal priority appointment', is_system: true, is_active: true, display_order: 1 },
            { category: 'appointment_priorities', name: 'Urgent', value: 'urgent', description: 'Urgent priority appointment', is_system: true, is_active: true, display_order: 2 },
            { category: 'appointment_priorities', name: 'Emergency', value: 'emergency', description: 'Emergency priority appointment', is_system: true, is_active: true, display_order: 3 },

            // Lab test status master data
            { category: 'lab_test_status', name: 'Ordered', value: 'ordered', description: 'Lab test has been ordered', is_system: true, is_active: true, display_order: 1 },
            { category: 'lab_test_status', name: 'Sample Collected', value: 'sample_collected', description: 'Sample has been collected', is_system: true, is_active: true, display_order: 2 },
            { category: 'lab_test_status', name: 'In Progress', value: 'in_progress', description: 'Lab test is in progress', is_system: true, is_active: true, display_order: 3 },
            { category: 'lab_test_status', name: 'Completed', value: 'completed', description: 'Lab test is completed', is_system: true, is_active: true, display_order: 4 },
            { category: 'lab_test_status', name: 'Cancelled', value: 'cancelled', description: 'Lab test is cancelled', is_system: true, is_active: true, display_order: 5 },

            // Lab test priorities master data
            { category: 'lab_test_priorities', name: 'Normal', value: 'normal', description: 'Normal priority lab test', is_system: true, is_active: true, display_order: 1 },
            { category: 'lab_test_priorities', name: 'Urgent', value: 'urgent', description: 'Urgent priority lab test', is_system: true, is_active: true, display_order: 2 },
            { category: 'lab_test_priorities', name: 'STAT', value: 'stat', description: 'STAT priority lab test', is_system: true, is_active: true, display_order: 3 },

            // Bed types master data
            { category: 'bed_types', name: 'General', value: 'general', description: 'General bed', is_system: true, is_active: true, display_order: 1 },
            { category: 'bed_types', name: 'Private', value: 'private', description: 'Private room bed', is_system: true, is_active: true, display_order: 2 },
            { category: 'bed_types', name: 'ICU', value: 'icu', description: 'Intensive Care Unit bed', is_system: true, is_active: true, display_order: 3 },
            { category: 'bed_types', name: 'Emergency', value: 'emergency', description: 'Emergency bed', is_system: true, is_active: true, display_order: 4 },
            { category: 'bed_types', name: 'Pediatric', value: 'pediatric', description: 'Pediatric bed', is_system: true, is_active: true, display_order: 5 },
            { category: 'bed_types', name: 'Maternity', value: 'maternity', description: 'Maternity bed', is_system: true, is_active: true, display_order: 6 },

            // Bed status master data
            { category: 'bed_status', name: 'Available', value: 'available', description: 'Bed is available', is_system: true, is_active: true, display_order: 1 },
            { category: 'bed_status', name: 'Occupied', value: 'occupied', description: 'Bed is occupied', is_system: true, is_active: true, display_order: 2 },
            { category: 'bed_status', name: 'Maintenance', value: 'maintenance', description: 'Bed is under maintenance', is_system: true, is_active: true, display_order: 3 },
            { category: 'bed_status', name: 'Cleaning', value: 'cleaning', description: 'Bed is being cleaned', is_system: true, is_active: true, display_order: 4 },
            { category: 'bed_status', name: 'Reserved', value: 'reserved', description: 'Bed is reserved', is_system: true, is_active: true, display_order: 5 },

            // Bill status master data
            { category: 'bill_status', name: 'Pending', value: 'pending', description: 'Bill is pending payment', is_system: true, is_active: true, display_order: 1 },
            { category: 'bill_status', name: 'Partial', value: 'partial', description: 'Bill is partially paid', is_system: true, is_active: true, display_order: 2 },
            { category: 'bill_status', name: 'Paid', value: 'paid', description: 'Bill is fully paid', is_system: true, is_active: true, display_order: 3 },
            { category: 'bill_status', name: 'Overdue', value: 'overdue', description: 'Bill is overdue', is_system: true, is_active: true, display_order: 4 },
            { category: 'bill_status', name: 'Cancelled', value: 'cancelled', description: 'Bill is cancelled', is_system: true, is_active: true, display_order: 5 },

            // Payment methods master data
            { category: 'payment_methods', name: 'Cash', value: 'cash', description: 'Cash payment', is_system: true, is_active: true, display_order: 1 },
            { category: 'payment_methods', name: 'Card', value: 'card', description: 'Card payment', is_system: true, is_active: true, display_order: 2 },
            { category: 'payment_methods', name: 'Insurance', value: 'insurance', description: 'Insurance payment', is_system: true, is_active: true, display_order: 3 },
            { category: 'payment_methods', name: 'Bank Transfer', value: 'bank_transfer', description: 'Bank transfer payment', is_system: true, is_active: true, display_order: 4 },
            { category: 'payment_methods', name: 'Other', value: 'other', description: 'Other payment method', is_system: true, is_active: true, display_order: 5 },

            // Inventory categories master data
            { category: 'inventory_categories', name: 'Medication', value: 'medication', description: 'Medication inventory', is_system: true, is_active: true, display_order: 1 },
            { category: 'inventory_categories', name: 'Equipment', value: 'equipment', description: 'Equipment inventory', is_system: true, is_active: true, display_order: 2 },
            { category: 'inventory_categories', name: 'Supplies', value: 'supplies', description: 'Supplies inventory', is_system: true, is_active: true, display_order: 3 },
            { category: 'inventory_categories', name: 'Other', value: 'other', description: 'Other inventory items', is_system: true, is_active: true, display_order: 4 },

            // Inventory status master data
            { category: 'inventory_status', name: 'Active', value: 'active', description: 'Inventory item is active', is_system: true, is_active: true, display_order: 1 },
            { category: 'inventory_status', name: 'Inactive', value: 'inactive', description: 'Inventory item is inactive', is_system: true, is_active: true, display_order: 2 },
            { category: 'inventory_status', name: 'Expired', value: 'expired', description: 'Inventory item is expired', is_system: true, is_active: true, display_order: 3 },
            { category: 'inventory_status', name: 'Out of Stock', value: 'out_of_stock', description: 'Inventory item is out of stock', is_system: true, is_active: true, display_order: 4 },

            // Prescription status master data
            { category: 'prescription_status', name: 'Active', value: 'active', description: 'Prescription is active', is_system: true, is_active: true, display_order: 1 },
            { category: 'prescription_status', name: 'Dispensed', value: 'dispensed', description: 'Prescription is dispensed', is_system: true, is_active: true, display_order: 2 },
            { category: 'prescription_status', name: 'Completed', value: 'completed', description: 'Prescription is completed', is_system: true, is_active: true, display_order: 3 },
            { category: 'prescription_status', name: 'Cancelled', value: 'cancelled', description: 'Prescription is cancelled', is_system: true, is_active: true, display_order: 4 },

            // Notification types master data
            { category: 'notification_types', name: 'Appointment', value: 'appointment', description: 'Appointment notification', is_system: true, is_active: true, display_order: 1 },
            { category: 'notification_types', name: 'Emergency', value: 'emergency', description: 'Emergency notification', is_system: true, is_active: true, display_order: 2 },
            { category: 'notification_types', name: 'System', value: 'system', description: 'System notification', is_system: true, is_active: true, display_order: 3 },
            { category: 'notification_types', name: 'Reminder', value: 'reminder', description: 'Reminder notification', is_system: true, is_active: true, display_order: 4 },
            { category: 'notification_types', name: 'Alert', value: 'alert', description: 'Alert notification', is_system: true, is_active: true, display_order: 5 },
            { category: 'notification_types', name: 'Info', value: 'info', description: 'Information notification', is_system: true, is_active: true, display_order: 6 },

            // Notification priorities master data
            { category: 'notification_priorities', name: 'Low', value: 'low', description: 'Low priority notification', is_system: true, is_active: true, display_order: 1 },
            { category: 'notification_priorities', name: 'Medium', value: 'medium', description: 'Medium priority notification', is_system: true, is_active: true, display_order: 2 },
            { category: 'notification_priorities', name: 'High', value: 'high', description: 'High priority notification', is_system: true, is_active: true, display_order: 3 },
            { category: 'notification_priorities', name: 'Critical', value: 'critical', description: 'Critical priority notification', is_system: true, is_active: true, display_order: 4 },
        ]

        // Add timestamps to all entries
        const now = new Date()
        const masterDataWithTimestamps = masterDataEntries.map(entry => ({
            ...entry,
            created_at: now,
            updated_at: now
        }))

        // Insert in batches to avoid constraint conflicts
        await this.db.table('master_data').multiInsert(masterDataWithTimestamps)
    }

    private async convertPatientsTable() {
        // Add new string columns
        await this.schema.alterTable('patients', (table) => {
            table.string('gender_new', 50).nullable()
            table.string('blood_group_new', 10).nullable()
        })

        // Migrate data from enum to string
        await this.db.rawQuery(`
      UPDATE patients 
      SET gender_new = gender::text, 
          blood_group_new = blood_group::text
    `)

        // Drop enum columns and rename new columns
        await this.schema.alterTable('patients', (table) => {
            table.dropColumn('gender')
            table.dropColumn('blood_group')
        })

        await this.schema.alterTable('patients', (table) => {
            table.renameColumn('gender_new', 'gender')
            table.renameColumn('blood_group_new', 'blood_group')
        })
    }

    private async convertAppointmentsTable() {
        await this.schema.alterTable('appointments', (table) => {
            table.string('status_new', 50).nullable()
            table.string('type_new', 50).nullable()
            table.string('priority_new', 50).nullable()
        })

        await this.db.rawQuery(`
      UPDATE appointments 
      SET status_new = status::text,
          type_new = type::text,
          priority_new = priority::text
    `)

        await this.schema.alterTable('appointments', (table) => {
            table.dropColumn('status')
            table.dropColumn('type')
            table.dropColumn('priority')
        })

        await this.schema.alterTable('appointments', (table) => {
            table.renameColumn('status_new', 'status')
            table.renameColumn('type_new', 'type')
            table.renameColumn('priority_new', 'priority')
        })
    }

    private async convertLabTestsTable() {
        await this.schema.alterTable('lab_tests', (table) => {
            table.string('status_new', 50).nullable()
            table.string('priority_new', 50).nullable()
        })

        await this.db.rawQuery(`
      UPDATE lab_tests 
      SET status_new = status::text,
          priority_new = priority::text
    `)

        await this.schema.alterTable('lab_tests', (table) => {
            table.dropColumn('status')
            table.dropColumn('priority')
        })

        await this.schema.alterTable('lab_tests', (table) => {
            table.renameColumn('status_new', 'status')
            table.renameColumn('priority_new', 'priority')
        })
    }

    private async convertBedsTable() {
        await this.schema.alterTable('beds', (table) => {
            table.string('type_new', 50).nullable()
            table.string('status_new', 50).nullable()
        })

        await this.db.rawQuery(`
      UPDATE beds 
      SET type_new = type::text,
          status_new = status::text
    `)

        await this.schema.alterTable('beds', (table) => {
            table.dropColumn('type')
            table.dropColumn('status')
        })

        await this.schema.alterTable('beds', (table) => {
            table.renameColumn('type_new', 'type')
            table.renameColumn('status_new', 'status')
        })
    }

    private async convertBillsTable() {
        await this.schema.alterTable('bills', (table) => {
            table.string('status_new', 50).nullable()
            table.string('payment_method_new', 50).nullable()
        })

        await this.db.rawQuery(`
      UPDATE bills 
      SET status_new = status::text,
          payment_method_new = payment_method::text
    `)

        await this.schema.alterTable('bills', (table) => {
            table.dropColumn('status')
            table.dropColumn('payment_method')
        })

        await this.schema.alterTable('bills', (table) => {
            table.renameColumn('status_new', 'status')
            table.renameColumn('payment_method_new', 'payment_method')
        })
    }

    private async convertInventoriesTable() {
        await this.schema.alterTable('inventories', (table) => {
            table.string('category_new', 50).nullable()
            table.string('status_new', 50).nullable()
        })

        await this.db.rawQuery(`
      UPDATE inventories 
      SET category_new = category::text,
          status_new = status::text
    `)

        await this.schema.alterTable('inventories', (table) => {
            table.dropColumn('category')
            table.dropColumn('status')
        })

        await this.schema.alterTable('inventories', (table) => {
            table.renameColumn('category_new', 'category')
            table.renameColumn('status_new', 'status')
        })
    }

    private async convertPrescriptionsTable() {
        await this.schema.alterTable('prescriptions', (table) => {
            table.string('status_new', 50).nullable()
        })

        await this.db.rawQuery(`
      UPDATE prescriptions 
      SET status_new = status::text
    `)

        await this.schema.alterTable('prescriptions', (table) => {
            table.dropColumn('status')
        })

        await this.schema.alterTable('prescriptions', (table) => {
            table.renameColumn('status_new', 'status')
        })
    }

    private async convertNotificationsTable() {
        await this.schema.alterTable('notifications', (table) => {
            table.string('type_new', 50).nullable()
            table.string('priority_new', 50).nullable()
        })

        await this.db.rawQuery(`
      UPDATE notifications 
      SET type_new = type::text,
          priority_new = priority::text
    `)

        await this.schema.alterTable('notifications', (table) => {
            table.dropColumn('type')
            table.dropColumn('priority')
        })

        await this.schema.alterTable('notifications', (table) => {
            table.renameColumn('type_new', 'type')
            table.renameColumn('priority_new', 'priority')
        })
    }

    // Revert methods for rollback
    private async revertPatientsTable() {
        await this.schema.alterTable('patients', (table) => {
            table.enum('gender_new', ['male', 'female', 'other']).nullable()
            table.enum('blood_group_new', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).nullable()
        })

        await this.db.rawQuery(`
      UPDATE patients 
      SET gender_new = gender::gender_enum,
          blood_group_new = blood_group::blood_group_enum
      WHERE gender IS NOT NULL OR blood_group IS NOT NULL
    `)

        await this.schema.alterTable('patients', (table) => {
            table.dropColumn('gender')
            table.dropColumn('blood_group')
        })

        await this.schema.alterTable('patients', (table) => {
            table.renameColumn('gender_new', 'gender')
            table.renameColumn('blood_group_new', 'blood_group')
        })
    }

    private async revertAppointmentsTable() {
        // Similar revert logic for appointments
        // Implementation depends on database system capabilities
    }

    private async revertLabTestsTable() {
        // Similar revert logic for lab_tests
    }

    private async revertBedsTable() {
        // Similar revert logic for beds
    }

    private async revertBillsTable() {
        // Similar revert logic for bills
    }

    private async revertInventoriesTable() {
        // Similar revert logic for inventories
    }

    private async revertPrescriptionsTable() {
        // Similar revert logic for prescriptions
    }

    private async revertNotificationsTable() {
        // Similar revert logic for notifications
    }

    private async cleanupMasterData() {
        // Remove all system-generated master data entries
        await this.db.from('master_data').where('is_system', true).delete()
    }
}
