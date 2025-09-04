import { DateTime } from 'luxon'
import Patient from '#models/patient'
import PatientCommunicationPreferences from '#models/patient_communication_preferences'
import Appointment from '#models/appointment'
import PatientAllergy from '#models/patient_allergy'
import PatientMedication from '#models/patient_medication'

// TODO: These interfaces will be used for future communication features
// interface CommunicationMessage {
//     id: string
//     patientId: string
//     type: 'sms' | 'email' | 'call' | 'push_notification'
//     template: string
//     subject?: string
//     content: string
//     variables: Record<string, any>
//     scheduledFor: DateTime
//     status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read'
//     metadata: Record<string, any>
// }

// interface AppointmentReminder {
//     appointmentId: string
//     patientId: string
//     reminderTime: DateTime
//     reminderType: 'sms' | 'email' | 'call'
//     content: string
//     status: 'scheduled' | 'sent' | 'failed'
// }

interface HealthTip {
    id: string
    category: 'nutrition' | 'exercise' | 'medication' | 'preventive' | 'chronic_condition'
    title: string
    content: string
    targetConditions?: string[]
    targetAgeGroups?: string[]
    targetGender?: 'male' | 'female' | 'all'
    priority: 'low' | 'medium' | 'high'
}

interface SurveyInvitation {
    id: string
    title: string
    description: string
    surveyUrl: string
    targetCriteria: {
        ageRange?: { min: number, max: number }
        conditions?: string[]
        lastVisitWithin?: number // days
        appointmentTypes?: string[]
    }
    expiresAt: DateTime
}

export default class PatientCommunicationService {
    private readonly SMS_TEMPLATES = {
        appointment_reminder: 'Hi {patientName}, this is a reminder for your appointment on {appointmentDate} at {appointmentTime} with Dr. {doctorName}. Please reply CONFIRM to confirm or call {clinicPhone} to reschedule.',
        appointment_confirmation: 'Hello {patientName}, your appointment on {appointmentDate} at {appointmentTime} has been confirmed. If you need to make changes, please call {clinicPhone}.',
        lab_results_ready: 'Hi {patientName}, your lab results are ready for review. Please log into your patient portal or call {clinicPhone} for details.',
        prescription_ready: 'Hello {patientName}, your prescription for {medicationName} is ready for pickup at {pharmacyName}. Pharmacy phone: {pharmacyPhone}.',
        birthday_greeting: 'Happy Birthday {patientName}! 🎉 We hope you have a wonderful day. Remember to schedule your annual wellness check-up.',
        medication_refill_reminder: 'Hi {patientName}, your {medicationName} prescription will expire in {daysUntilExpiry} days. Please contact your doctor for a refill.',
        wellness_checkup: 'Hello {patientName}, it\'s time for your annual wellness check-up. Please call {clinicPhone} to schedule your appointment.'
    }

    private readonly EMAIL_TEMPLATES = {
        appointment_reminder: {
            subject: 'Appointment Reminder - {appointmentDate}',
            template: `
                <h2>Appointment Reminder</h2>
                <p>Dear {patientName},</p>
                <p>This is a friendly reminder about your upcoming appointment:</p>
                <ul>
                    <li><strong>Date:</strong> {appointmentDate}</li>
                    <li><strong>Time:</strong> {appointmentTime}</li>
                    <li><strong>Provider:</strong> Dr. {doctorName}</li>
                    <li><strong>Location:</strong> {clinicAddress}</li>
                </ul>
                <p>Please arrive 15 minutes early for check-in.</p>
                <p>If you need to reschedule, please call us at {clinicPhone}.</p>
                <p>Best regards,<br>Your Healthcare Team</p>
            `
        },
        lab_results_notification: {
            subject: 'Lab Results Available',
            template: `
                <h2>Lab Results Ready</h2>
                <p>Dear {patientName},</p>
                <p>Your recent lab results are now available for review.</p>
                <p>You can view your results by:</p>
                <ul>
                    <li>Logging into your patient portal at {portalUrl}</li>
                    <li>Calling our office at {clinicPhone}</li>
                    <li>Scheduling a follow-up appointment</li>
                </ul>
                <p>If you have any questions about your results, please don't hesitate to contact us.</p>
                <p>Best regards,<br>Your Healthcare Team</p>
            `
        },
        health_tips: {
            subject: 'Health Tip: {tipTitle}',
            template: `
                <h2>{tipTitle}</h2>
                <p>Dear {patientName},</p>
                <p>{tipContent}</p>
                <p>For more health tips and information, visit our patient portal or speak with your healthcare provider during your next visit.</p>
                <p>Stay healthy,<br>Your Healthcare Team</p>
            `
        }
    }

    private readonly HEALTH_TIPS: HealthTip[] = [
        {
            id: 'tip_001',
            category: 'medication',
            title: 'Taking Medications as Prescribed',
            content: 'Always take your medications exactly as prescribed by your doctor. Set reminders on your phone or use a pill organizer to help you remember. Never stop taking prescribed medications without consulting your healthcare provider first.',
            targetConditions: ['hypertension', 'diabetes', 'heart_disease'],
            priority: 'high'
        },
        {
            id: 'tip_002',
            category: 'nutrition',
            title: 'Heart-Healthy Eating',
            content: 'Focus on eating plenty of fruits, vegetables, whole grains, and lean proteins. Limit sodium, saturated fats, and added sugars. The Mediterranean diet is particularly beneficial for heart health.',
            targetConditions: ['heart_disease', 'hypertension', 'high_cholesterol'],
            priority: 'medium'
        },
        {
            id: 'tip_003',
            category: 'exercise',
            title: 'Daily Physical Activity',
            content: 'Aim for at least 30 minutes of moderate exercise most days of the week. This can include walking, swimming, or cycling. Always consult your doctor before starting a new exercise program.',
            targetAgeGroups: ['adult', 'senior'],
            priority: 'medium'
        },
        {
            id: 'tip_004',
            category: 'preventive',
            title: 'Regular Health Screenings',
            content: 'Stay up to date with recommended health screenings for your age and risk factors. This includes blood pressure checks, cholesterol testing, cancer screenings, and vaccinations.',
            targetAgeGroups: ['adult', 'senior'],
            priority: 'high'
        }
    ]

    /**
     * Send appointment reminders based on patient preferences
     */
    async sendAppointmentReminders(): Promise<void> {
        const tomorrow = DateTime.now().plus({ days: 1 })
        const in24Hours = DateTime.now().plus({ hours: 24 })

        // Get upcoming appointments
        const upcomingAppointments = await Appointment.query()
            .whereBetween('appointment_date_time', [tomorrow.startOf('day').toJSDate(), tomorrow.endOf('day').toJSDate()])
            .preload('patient')
            .preload('doctor')

        for (const appointment of upcomingAppointments) {
            const patient = appointment.patient

            // Get patient communication preferences
            const preferences = await PatientCommunicationPreferences.query()
                .where('patient_id', patient.id)
                .first()

            if (!preferences?.appointmentReminders) {
                continue
            }

            // Calculate reminder time
            const appointmentTime = appointment.appointmentDate
            const reminderTime = appointmentTime.minus({ hours: preferences.appointmentReminderTiming })

            // Only send if it's time for the reminder
            if (DateTime.now() >= reminderTime && DateTime.now() <= in24Hours) {
                await this.sendAppointmentReminder(appointment, preferences.appointmentReminderMethod)
            }
        }
    }

    /**
     * Send individual appointment reminder
     */
    private async sendAppointmentReminder(appointment: any, method: string): Promise<void> {
        const patient = appointment.patient
        const doctor = appointment.doctor
        const appointmentDateTime = DateTime.fromJSDate(appointment.appointmentDateTime)

        const variables = {
            patientName: patient.name,
            appointmentDate: appointmentDateTime.toFormat('MMMM dd, yyyy'),
            appointmentTime: appointmentDateTime.toFormat('h:mm a'),
            doctorName: doctor.name,
            clinicPhone: '+1-555-0123', // This should come from settings
            clinicAddress: '123 Medical Center Dr, Healthcare City, HC 12345'
        }

        switch (method) {
            case 'sms':
                await this.sendSMS(patient.phone, this.SMS_TEMPLATES.appointment_reminder, variables)
                break
            case 'email':
                if (patient.email) {
                    await this.sendEmail(
                        patient.email,
                        this.EMAIL_TEMPLATES.appointment_reminder.subject,
                        this.EMAIL_TEMPLATES.appointment_reminder.template,
                        variables
                    )
                }
                break
            case 'call':
                await this.scheduleCall(patient.phone, variables)
                break
            case 'all':
                await this.sendSMS(patient.phone, this.SMS_TEMPLATES.appointment_reminder, variables)
                if (patient.email) {
                    await this.sendEmail(
                        patient.email,
                        this.EMAIL_TEMPLATES.appointment_reminder.subject,
                        this.EMAIL_TEMPLATES.appointment_reminder.template,
                        variables
                    )
                }
                break
        }
    }

    /**
     * Send lab result notifications
     */
    async sendLabResultNotifications(patientIds: string[]): Promise<void> {
        for (const patientId of patientIds) {
            const patient = await Patient.findOrFail(patientId)
            const preferences = await PatientCommunicationPreferences.query()
                .where('patient_id', patientId)
                .first()

            if (!preferences?.labResultsNotification) {
                continue
            }

            const variables = {
                patientName: patient.name,
                clinicPhone: '+1-555-0123',
                portalUrl: 'https://patient-portal.example.com'
            }

            switch (preferences.labResultsMethod) {
                case 'sms':
                    await this.sendSMS(patient.phone, this.SMS_TEMPLATES.lab_results_ready, variables)
                    break
                case 'email':
                    if (patient.email) {
                        await this.sendEmail(
                            patient.email,
                            this.EMAIL_TEMPLATES.lab_results_notification.subject,
                            this.EMAIL_TEMPLATES.lab_results_notification.template,
                            variables
                        )
                    }
                    break
                case 'portal':
                    await this.sendPortalNotification(patientId, 'Lab results are now available for review')
                    break
            }
        }
    }

    /**
     * Send birthday greetings
     */
    async sendBirthdayGreetings(): Promise<void> {
        const today = DateTime.now()

        // Find patients with birthdays today
        const birthdayPatients = await Patient.query()
            .whereRaw("EXTRACT(month FROM date_of_birth) = ? AND EXTRACT(day FROM date_of_birth) = ?",
                [today.month, today.day])
            .preload('communicationPreferences')

        for (const patient of birthdayPatients) {
            const preferences = patient.communicationPreferences
            if (!preferences?.marketingCommunications) {
                continue
            }

            const variables = {
                patientName: patient.name,
                clinicPhone: '+1-555-0123'
            }

            // Send SMS birthday greeting
            await this.sendSMS(patient.phone, this.SMS_TEMPLATES.birthday_greeting, variables)
        }
    }

    /**
     * Send personalized health tips
     */
    async sendPersonalizedHealthTips(): Promise<void> {
        const patients = await Patient.query()
            .preload('communicationPreferences')
            .preload('allergyRecords')
            .preload('currentMedications')

        for (const patient of patients) {
            const preferences = patient.communicationPreferences
            if (!preferences?.healthTips) {
                continue
            }

            // Get patient's conditions and medications
            const conditions = this.extractPatientConditions(patient)
            const ageGroup = this.getAgeGroup(patient.dateOfBirth)

            // Find relevant health tips
            const relevantTips = this.findRelevantHealthTips(conditions, ageGroup, patient.gender)

            if (relevantTips.length > 0) {
                const tip = relevantTips[Math.floor(Math.random() * relevantTips.length)]

                const variables = {
                    patientName: patient.name,
                    tipTitle: tip.title,
                    tipContent: tip.content
                }

                if (patient.email) {
                    await this.sendEmail(
                        patient.email,
                        this.EMAIL_TEMPLATES.health_tips.subject,
                        this.EMAIL_TEMPLATES.health_tips.template,
                        variables
                    )
                }
            }
        }
    }

    /**
     * Send medication refill reminders
     */
    async sendMedicationRefillReminders(): Promise<void> {
        const medicationsNearExpiry = await PatientMedication.query()
            .where('status', 'active')
            .whereNotNull('end_date')
            .whereBetween('end_date', [
                DateTime.now().toJSDate(),
                DateTime.now().plus({ days: 7 }).toJSDate()
            ])
            .preload('patient')

        for (const medication of medicationsNearExpiry) {
            const patient = medication.patient
            const daysUntilExpiry = medication.endDate!.diff(DateTime.now(), 'days').days

            const variables = {
                patientName: patient.name,
                medicationName: medication.medicationName,
                daysUntilExpiry: Math.ceil(daysUntilExpiry)
            }

            await this.sendSMS(patient.phone, this.SMS_TEMPLATES.medication_refill_reminder, variables)
        }
    }

    /**
     * Send survey invitations
     */
    async sendSurveyInvitations(survey: SurveyInvitation): Promise<void> {
        let query = Patient.query().preload('communicationPreferences')

        // Apply survey criteria
        if (survey.targetCriteria.ageRange) {
            const minBirthDate = DateTime.now().minus({ years: survey.targetCriteria.ageRange.max })
            const maxBirthDate = DateTime.now().minus({ years: survey.targetCriteria.ageRange.min })
            query = query.whereBetween('date_of_birth', [minBirthDate.toJSDate(), maxBirthDate.toJSDate()])
        }

        const eligiblePatients = await query.exec()

        for (const patient of eligiblePatients) {
            const preferences = patient.communicationPreferences
            if (!preferences?.surveyParticipation) {
                continue
            }

            const variables = {
                patientName: patient.name,
                surveyTitle: survey.title,
                surveyDescription: survey.description,
                surveyUrl: survey.surveyUrl,
                expiresAt: survey.expiresAt.toFormat('MMMM dd, yyyy')
            }

            if (patient.email) {
                await this.sendEmail(
                    patient.email,
                    `Survey Invitation: ${survey.title}`,
                    `
                        <h2>Survey Invitation</h2>
                        <p>Dear {patientName},</p>
                        <p>We would value your feedback! Please take a few minutes to complete our survey:</p>
                        <h3>{surveyTitle}</h3>
                        <p>{surveyDescription}</p>
                        <p><a href="{surveyUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Take Survey</a></p>
                        <p>This survey expires on {expiresAt}.</p>
                        <p>Thank you for helping us improve our services!</p>
                    `,
                    variables
                )
            }
        }
    }

    /**
     * Two-way SMS communication handling
     */
    async handleIncomingSMS(from: string, message: string): Promise<string> {
        const normalizedMessage = message.toLowerCase().trim()

        // Find patient by phone number
        const patient = await Patient.query()
            .where('phone', from)
            .first()

        if (!patient) {
            return 'We could not find your record. Please contact our office at +1-555-0123 for assistance.'
        }

        // Handle common responses
        if (normalizedMessage.includes('confirm') || normalizedMessage === 'yes' || normalizedMessage === 'y') {
            return `Thank you ${patient.name}! Your appointment has been confirmed. We look forward to seeing you.`
        }

        if (normalizedMessage.includes('cancel') || normalizedMessage.includes('reschedule')) {
            return `We understand you need to make changes to your appointment. Please call our office at +1-555-0123 to reschedule.`
        }

        if (normalizedMessage.includes('stop') || normalizedMessage.includes('unsubscribe')) {
            // Update communication preferences
            await PatientCommunicationPreferences.query()
                .where('patient_id', patient.id)
                .update({ appointmentReminders: false })

            return 'You have been unsubscribed from appointment reminders. You can update your preferences in the patient portal.'
        }

        // Default response
        return 'Thank you for your message. For immediate assistance, please call our office at +1-555-0123.'
    }

    // Private helper methods
    private async sendSMS(phoneNumber: string, template: string, variables: Record<string, any>): Promise<void> {
        const message = this.replaceTemplateVariables(template, variables)

        // Here you would integrate with an SMS service like Twilio, AWS SNS, etc.
        console.log(`SMS to ${phoneNumber}: ${message}`)

        // Simulate SMS sending
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    private async sendEmail(
        email: string,
        subject: string,
        template: string,
        variables: Record<string, any>
    ): Promise<void> {
        const finalSubject = this.replaceTemplateVariables(subject, variables)
        const finalContent = this.replaceTemplateVariables(template, variables)

        // Here you would integrate with an email service like SendGrid, AWS SES, etc.
        console.log(`Email to ${email}:`)
        console.log(`Subject: ${finalSubject}`)
        console.log(`Content: ${finalContent}`)

        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    private async scheduleCall(phoneNumber: string, variables: Record<string, any>): Promise<void> {
        // Here you would integrate with a voice calling service
        console.log(`Scheduled call to ${phoneNumber} with variables:`, variables)
    }

    private async sendPortalNotification(patientId: string, message: string): Promise<void> {
        // Here you would create a notification in the patient portal
        console.log(`Portal notification for patient ${patientId}: ${message}`)
    }

    private replaceTemplateVariables(template: string, variables: Record<string, any>): string {
        let result = template
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{${key}}`, 'g'), String(value))
        }
        return result
    }

    private extractPatientConditions(patient: any): string[] {
        const conditions: string[] = []

        // Add chronic conditions
        if (patient.chronicConditions) {
            conditions.push(...patient.chronicConditions)
        }

        // Add conditions based on allergies
        if (patient.allergyRecords) {
            patient.allergyRecords.forEach((allergy: PatientAllergy) => {
                if (allergy.severity === 'severe' || allergy.severity === 'life-threatening') {
                    conditions.push('severe_allergies')
                }
            })
        }

        // Add conditions based on medications
        if (patient.currentMedications) {
            patient.currentMedications.forEach((medication: PatientMedication) => {
                const medName = medication.medicationName.toLowerCase()
                if (medName.includes('insulin') || medName.includes('metformin')) {
                    conditions.push('diabetes')
                } else if (medName.includes('lisinopril') || medName.includes('atenolol')) {
                    conditions.push('hypertension')
                } else if (medName.includes('statin') || medName.includes('lipitor')) {
                    conditions.push('high_cholesterol')
                }
            })
        }

        return conditions
    }

    private getAgeGroup(dateOfBirth: DateTime): string {
        const age = DateTime.now().diff(dateOfBirth, 'years').years

        if (age < 18) return 'pediatric'
        if (age < 65) return 'adult'
        return 'senior'
    }

    private findRelevantHealthTips(conditions: string[], ageGroup: string, gender: string): HealthTip[] {
        return this.HEALTH_TIPS.filter(tip => {
            // Check condition match
            if (tip.targetConditions) {
                const hasMatchingCondition = tip.targetConditions.some(condition =>
                    conditions.includes(condition)
                )
                if (!hasMatchingCondition) return false
            }

            // Check age group match
            if (tip.targetAgeGroups && !tip.targetAgeGroups.includes(ageGroup)) {
                return false
            }

            // Check gender match
            if (tip.targetGender && tip.targetGender !== 'all' && tip.targetGender !== gender) {
                return false
            }

            return true
        })
    }
}
