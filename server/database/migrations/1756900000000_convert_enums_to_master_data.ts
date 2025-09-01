import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'multiple_tables'

    async up() {
        // Convert patients table enums to strings
        await this.convertPatientsEnums()

        // Convert appointments table enums to strings
        await this.convertAppointmentsEnums()

        // Convert lab_tests table enums to strings
        await this.convertLabTestsEnums()

        // Convert beds table enums to strings
        await this.convertBedsEnums()

        // Convert bills table enums to strings
        await this.convertBillsEnums()

        // Convert inventories table enums to strings
        await this.convertInventoriesEnums()

        // Convert prescriptions table enums to strings
        await this.convertPrescriptionsEnums()

        // Convert notifications table enums to strings
        await this.convertNotificationsEnums()
    }

    async down() {
        // Revert back to enums (optional - can be complex depending on data)
        await this.revertNotificationsEnums()
        await this.revertPrescriptionsEnums()
        await this.revertInventoriesEnums()
        await this.revertBillsEnums()
        await this.revertBedsEnums()
        await this.revertLabTestsEnums()
        await this.revertAppointmentsEnums()
        await this.revertPatientsEnums()
    }

    private async convertPatientsEnums() {
        await this.schema.alterTable('patients', (table) => {
            // Change gender enum to string
            table.string('gender', 50).alter()
            // Change blood_group enum to string
            table.string('blood_group', 10).nullable().alter()
        })
    }

    private async convertAppointmentsEnums() {
        await this.schema.alterTable('appointments', (table) => {
            table.string('status', 50).alter()
            table.string('type', 50).alter()
            table.string('priority', 50).alter()
        })
    }

    private async convertLabTestsEnums() {
        await this.schema.alterTable('lab_tests', (table) => {
            table.string('status', 50).alter()
            table.string('priority', 50).alter()
        })
    }

    private async convertBedsEnums() {
        await this.schema.alterTable('beds', (table) => {
            table.string('type', 50).alter()
            table.string('status', 50).alter()
        })
    }

    private async convertBillsEnums() {
        await this.schema.alterTable('bills', (table) => {
            table.string('status', 50).alter()
            table.string('payment_method', 50).alter()
        })
    }

    private async convertInventoriesEnums() {
        await this.schema.alterTable('inventories', (table) => {
            table.string('category', 50).alter()
            table.string('status', 50).alter()
        })
    }

    private async convertPrescriptionsEnums() {
        await this.schema.alterTable('prescriptions', (table) => {
            table.string('status', 50).alter()
        })
    }

    private async convertNotificationsEnums() {
        await this.schema.alterTable('notifications', (table) => {
            table.string('type', 50).alter()
            table.string('priority', 50).alter()
        })
    }

    // Revert methods (convert strings back to enums)
    private async revertPatientsEnums() {
        await this.schema.alterTable('patients', (table) => {
            table.enum('gender', ['male', 'female', 'other']).alter()
            table.enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).nullable().alter()
        })
    }

    private async revertAppointmentsEnums() {
        await this.schema.alterTable('appointments', (table) => {
            table.enum('status', ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).alter()
            table.enum('type', ['consultation', 'follow_up', 'emergency', 'surgery', 'therapy', 'checkup']).alter()
            table.enum('priority', ['normal', 'urgent', 'emergency']).alter()
        })
    }

    private async revertLabTestsEnums() {
        await this.schema.alterTable('lab_tests', (table) => {
            table.enum('status', ['ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled']).alter()
            table.enum('priority', ['normal', 'urgent', 'stat']).alter()
        })
    }

    private async revertBedsEnums() {
        await this.schema.alterTable('beds', (table) => {
            table.enum('type', ['general', 'private', 'icu', 'emergency', 'pediatric', 'maternity']).alter()
            table.enum('status', ['available', 'occupied', 'maintenance', 'cleaning', 'reserved']).alter()
        })
    }

    private async revertBillsEnums() {
        await this.schema.alterTable('bills', (table) => {
            table.enum('status', ['pending', 'partial', 'paid', 'overdue', 'cancelled']).alter()
            table.enum('payment_method', ['cash', 'card', 'insurance', 'bank_transfer', 'other']).alter()
        })
    }

    private async revertInventoriesEnums() {
        await this.schema.alterTable('inventories', (table) => {
            table.enum('category', ['medication', 'equipment', 'supplies', 'other']).alter()
            table.enum('status', ['active', 'inactive', 'expired', 'out_of_stock']).alter()
        })
    }

    private async revertPrescriptionsEnums() {
        await this.schema.alterTable('prescriptions', (table) => {
            table.enum('status', ['active', 'dispensed', 'completed', 'cancelled']).alter()
        })
    }

    private async revertNotificationsEnums() {
        await this.schema.alterTable('notifications', (table) => {
            table.enum('type', ['appointment', 'emergency', 'system', 'reminder', 'alert', 'info']).alter()
            table.enum('priority', ['low', 'medium', 'high', 'critical']).alter()
        })
    }
}
