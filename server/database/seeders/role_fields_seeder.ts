import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import RoleFieldService from '#services/role_field_service'

export default class extends BaseSeeder {
    async run() {
        const roleFieldService = new RoleFieldService()

        // Find or create doctor role
        let doctorRole = await Role.query().where('name', 'doctor').first()

        if (!doctorRole) {
            // Create doctor role if it doesn't exist
            const { v4: uuid } = await import('uuid')
            doctorRole = await Role.create({
                id: uuid(),
                name: 'doctor',
                displayName: 'Doctor',
                description: 'Medical practitioner with access to patient management and medical records',
                accessLevel: 3,
                isActive: true,
                isSystemRole: false
            })
        }

        // Check if role fields already exist
        const existingFields = await roleFieldService.getRoleFields(doctorRole.id)

        if (existingFields.length === 0) {
            // Create doctor role fields
            await roleFieldService.createDoctorRoleFields(doctorRole.id)
            console.log('✅ Doctor role fields created successfully')
        } else {
            console.log('ℹ️ Doctor role fields already exist')
        }

        // You can add more role templates here
        // Example: Create nurse role fields
        let nurseRole = await Role.query().where('name', 'nurse').first()

        if (!nurseRole) {
            const { v4: uuid } = await import('uuid')
            nurseRole = await Role.create({
                id: uuid(),
                name: 'nurse',
                displayName: 'Nurse',
                description: 'Nursing staff with patient care responsibilities',
                accessLevel: 2,
                isActive: true,
                isSystemRole: false
            })

            // Create nurse-specific fields
            const nurseFields = [
                {
                    fieldName: 'nurseId',
                    fieldLabel: 'Nurse ID',
                    fieldType: 'text',
                    isRequired: true,
                    sortOrder: 1,
                    validationRules: { pattern: '^NUR[0-9]{4}$' }
                },
                {
                    fieldName: 'ward',
                    fieldLabel: 'Assigned Ward',
                    fieldType: 'select',
                    isRequired: true,
                    sortOrder: 2,
                    fieldOptions: {
                        options: [
                            { value: 'icu', label: 'ICU' },
                            { value: 'emergency', label: 'Emergency' },
                            { value: 'general', label: 'General Ward' },
                            { value: 'pediatric', label: 'Pediatric' },
                            { value: 'maternity', label: 'Maternity' },
                            { value: 'surgery', label: 'Surgery' }
                        ]
                    }
                },
                {
                    fieldName: 'shift',
                    fieldLabel: 'Work Shift',
                    fieldType: 'select',
                    isRequired: true,
                    sortOrder: 3,
                    fieldOptions: {
                        options: [
                            { value: 'day', label: 'Day (6 AM - 2 PM)' },
                            { value: 'evening', label: 'Evening (2 PM - 10 PM)' },
                            { value: 'night', label: 'Night (10 PM - 6 AM)' },
                            { value: 'rotating', label: 'Rotating Shifts' }
                        ]
                    }
                },
                {
                    fieldName: 'certifications',
                    fieldLabel: 'Nursing Certifications',
                    fieldType: 'multi_select',
                    isRequired: false,
                    sortOrder: 4,
                    fieldOptions: {
                        options: [
                            { value: 'rn', label: 'Registered Nurse (RN)' },
                            { value: 'lpn', label: 'Licensed Practical Nurse (LPN)' },
                            { value: 'cna', label: 'Certified Nursing Assistant (CNA)' },
                            { value: 'bls', label: 'Basic Life Support (BLS)' },
                            { value: 'acls', label: 'Advanced Cardiac Life Support (ACLS)' },
                            { value: 'pals', label: 'Pediatric Advanced Life Support (PALS)' }
                        ]
                    }
                },
                {
                    fieldName: 'yearsExperience',
                    fieldLabel: 'Years of Experience',
                    fieldType: 'number',
                    isRequired: true,
                    sortOrder: 5,
                    validationRules: { min: 0, max: 40 }
                }
            ]

            await roleFieldService.createRoleFieldsFromTemplate(nurseRole.id, nurseFields)
            console.log('✅ Nurse role fields created successfully')
        }
    }
}
