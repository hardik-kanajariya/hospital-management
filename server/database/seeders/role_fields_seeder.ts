import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import RoleFieldService from '#services/role_field_service'

export default class extends BaseSeeder {
    async run() {
        const roleFieldService = new RoleFieldService()

        // System roles with their field templates
        const systemRoles = [
            {
                name: 'doctor',
                displayName: 'Doctor',
                description: 'Medical practitioner with access to patient management and medical records',
                accessLevel: 3,
                fields: [
                    {
                        fieldName: 'doctorId',
                        fieldLabel: 'Doctor ID',
                        fieldType: 'text',
                        isRequired: true,
                        sortOrder: 1,
                        validationRules: { pattern: '^DOC[0-9]{4}$' },
                        isSystemField: true
                    },
                    {
                        fieldName: 'specialization',
                        fieldLabel: 'Medical Specialization',
                        fieldType: 'select',
                        isRequired: true,
                        sortOrder: 2,
                        fieldOptions: {
                            masterDataCategory: 'specializations'
                        },
                        isSystemField: true
                    },
                    {
                        fieldName: 'qualification',
                        fieldLabel: 'Medical Qualification',
                        fieldType: 'text',
                        isRequired: true,
                        sortOrder: 3,
                        description: 'Primary medical degree (e.g., MBBS, MD)',
                        isSystemField: true
                    },
                    {
                        fieldName: 'licenseNumber',
                        fieldLabel: 'Medical License Number',
                        fieldType: 'text',
                        isRequired: true,
                        sortOrder: 4,
                        isSystemField: true
                    },
                    {
                        fieldName: 'yearsExperience',
                        fieldLabel: 'Years of Experience',
                        fieldType: 'number',
                        isRequired: true,
                        sortOrder: 5,
                        validationRules: { min: 0, max: 50 },
                        isSystemField: true
                    },
                    {
                        fieldName: 'consultationFee',
                        fieldLabel: 'Consultation Fee',
                        fieldType: 'decimal',
                        isRequired: true,
                        sortOrder: 6,
                        validationRules: { min: 0 },
                        isSystemField: true
                    },
                    {
                        fieldName: 'availableHours',
                        fieldLabel: 'Available Hours',
                        fieldType: 'textarea',
                        isRequired: false,
                        sortOrder: 7,
                        description: 'Doctor available timing (e.g., Mon-Fri: 9AM-5PM)',
                        isSystemField: true
                    },
                    {
                        fieldName: 'education',
                        fieldLabel: 'Additional Education',
                        fieldType: 'textarea',
                        isRequired: false,
                        sortOrder: 8,
                        description: 'Additional qualifications, certifications, fellowships',
                        isSystemField: true
                    }
                ]
            },
            {
                name: 'nurse',
                displayName: 'Nurse',
                description: 'Nursing staff with patient care responsibilities',
                accessLevel: 2,
                fields: [
                    {
                        fieldName: 'nurseId',
                        fieldLabel: 'Nurse ID',
                        fieldType: 'text',
                        isRequired: true,
                        sortOrder: 1,
                        validationRules: { pattern: '^NUR[0-9]{4}$' },
                        isSystemField: true
                    },
                    {
                        fieldName: 'ward',
                        fieldLabel: 'Assigned Ward',
                        fieldType: 'select',
                        isRequired: true,
                        sortOrder: 2,
                        fieldOptions: {
                            masterDataCategory: 'departments'
                        },
                        isSystemField: true
                    },
                    {
                        fieldName: 'shift',
                        fieldLabel: 'Work Shift',
                        fieldType: 'select',
                        isRequired: true,
                        sortOrder: 3,
                        fieldOptions: {
                            masterDataCategory: 'work_shifts'
                        },
                        isSystemField: true
                    },
                    {
                        fieldName: 'certifications',
                        fieldLabel: 'Nursing Certifications',
                        fieldType: 'multi_select',
                        isRequired: false,
                        sortOrder: 4,
                        fieldOptions: {
                            masterDataCategory: 'nursing_certifications'
                        },
                        isSystemField: true
                    },
                    {
                        fieldName: 'yearsExperience',
                        fieldLabel: 'Years of Experience',
                        fieldType: 'number',
                        isRequired: true,
                        sortOrder: 5,
                        validationRules: { min: 0, max: 40 },
                        isSystemField: true
                    }
                ]
            },
            {
                name: 'receptionist',
                displayName: 'Receptionist',
                description: 'Front desk staff managing appointments and patient registration',
                accessLevel: 1,
                fields: [
                    {
                        fieldName: 'employeeId',
                        fieldLabel: 'Employee ID',
                        fieldType: 'text',
                        isRequired: true,
                        sortOrder: 1,
                        validationRules: { pattern: '^RCP[0-9]{4}$' },
                        isSystemField: true
                    },
                    {
                        fieldName: 'department',
                        fieldLabel: 'Department',
                        fieldType: 'select',
                        isRequired: true,
                        sortOrder: 2,
                        fieldOptions: {
                            options: [
                                { value: 'front_desk', label: 'Front Desk' },
                                { value: 'appointment', label: 'Appointment Scheduling' },
                                { value: 'billing', label: 'Billing & Insurance' },
                                { value: 'registration', label: 'Patient Registration' }
                            ]
                        },
                        isSystemField: true
                    },
                    {
                        fieldName: 'languages',
                        fieldLabel: 'Languages Spoken',
                        fieldType: 'multi_select',
                        isRequired: false,
                        sortOrder: 3,
                        fieldOptions: {
                            masterDataCategory: 'languages'
                        },
                        isSystemField: true
                    }
                ]
            },
            {
                name: 'pharmacist',
                displayName: 'Pharmacist',
                description: 'Licensed pharmacist managing medications and prescriptions',
                accessLevel: 2,
                fields: [
                    {
                        fieldName: 'pharmacistId',
                        fieldLabel: 'Pharmacist ID',
                        fieldType: 'text',
                        isRequired: true,
                        sortOrder: 1,
                        validationRules: { pattern: '^PHR[0-9]{4}$' },
                        isSystemField: true
                    },
                    {
                        fieldName: 'licenseNumber',
                        fieldLabel: 'Pharmacy License Number',
                        fieldType: 'text',
                        isRequired: true,
                        sortOrder: 2,
                        isSystemField: true
                    },
                    {
                        fieldName: 'specialization',
                        fieldLabel: 'Pharmacy Specialization',
                        fieldType: 'select',
                        isRequired: false,
                        sortOrder: 3,
                        fieldOptions: {
                            masterDataCategory: 'pharmacy_specializations'
                        },
                        isSystemField: true
                    }
                ]
            },
            {
                name: 'lab_technician',
                displayName: 'Lab Technician',
                description: 'Laboratory staff managing tests and sample analysis',
                accessLevel: 2,
                fields: [
                    {
                        fieldName: 'technicianId',
                        fieldLabel: 'Lab Technician ID',
                        fieldType: 'text',
                        isRequired: true,
                        sortOrder: 1,
                        validationRules: { pattern: '^LAB[0-9]{4}$' },
                        isSystemField: true
                    },
                    {
                        fieldName: 'labSection',
                        fieldLabel: 'Lab Section',
                        fieldType: 'select',
                        isRequired: true,
                        sortOrder: 2,
                        fieldOptions: {
                            masterDataCategory: 'lab_sections'
                        },
                        isSystemField: true
                    },
                    {
                        fieldName: 'certifications',
                        fieldLabel: 'Lab Certifications',
                        fieldType: 'multi_select',
                        isRequired: false,
                        sortOrder: 3,
                        fieldOptions: {
                            masterDataCategory: 'lab_certifications'
                        },
                        isSystemField: true
                    }
                ]
            }
        ]

        // Process each system role
        for (const roleTemplate of systemRoles) {
            console.log(`Processing ${roleTemplate.displayName} role...`)

            // Find or create role
            let role = await Role.query().where('name', roleTemplate.name).first()

            if (!role) {
                const { v4: uuid } = await import('uuid')
                role = await Role.create({
                    id: uuid(),
                    name: roleTemplate.name,
                    displayName: roleTemplate.displayName,
                    description: roleTemplate.description,
                    accessLevel: roleTemplate.accessLevel,
                    isActive: true,
                    isSystemRole: true // Mark as system role
                })
                console.log(`✅ Created ${roleTemplate.displayName} role`)
            } else {
                // Update isSystemRole flag for existing roles
                await role.merge({ isSystemRole: true }).save()
                console.log(`ℹ️ Updated ${roleTemplate.displayName} role (marked as system role)`)
            }

            // Check if role fields already exist
            const existingFields = await roleFieldService.getRoleFields(role.id)

            if (existingFields.length === 0) {
                // Create role fields
                await roleFieldService.createRoleFieldsFromTemplate(role.id, roleTemplate.fields)
                console.log(`✅ ${roleTemplate.displayName} role fields created successfully`)
            } else {
                console.log(`ℹ️ ${roleTemplate.displayName} role fields already exist`)
            }
        }

        console.log('🎉 All system roles and their fields have been processed!')
    }
}
