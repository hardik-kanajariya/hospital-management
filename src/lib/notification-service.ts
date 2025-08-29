/**
 * Enhanced Notification Service
 * Handles all types of notifications with templates and delivery methods
 */

import { apiClient } from './api-client';
import { useAppStore } from './store';
import { toast } from 'sonner';

export interface NotificationTemplate {
    type: 'appointment_reminder' | 'lab_result' | 'billing_reminder' | 'prescription_ready' | 'emergency' | 'system';
    subject: string;
    smsTemplate: string;
    emailTemplate: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationRecipient {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: 'patient' | 'doctor' | 'staff' | 'admin';
}

export interface NotificationData {
    template: NotificationTemplate['type'];
    recipient: NotificationRecipient;
    variables?: Record<string, any>;
    scheduledFor?: Date;
    deliveryMethods?: ('sms' | 'email' | 'push' | 'in-app')[];
}

export interface NotificationHistory {
    id: string;
    templateType: NotificationTemplate['type'];
    recipientId: string;
    recipientType: string;
    subject: string;
    message: string;
    deliveryMethod: 'sms' | 'email' | 'push' | 'in-app';
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
    scheduledAt: string;
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
    error?: string;
}

class NotificationService {
    private static instance: NotificationService;
    private templates: Map<string, NotificationTemplate> = new Map();

    private constructor() {
        this.initializeTemplates();
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private initializeTemplates(): void {
        // Initialize default templates
        this.templates.set('appointment_reminder', {
            type: 'appointment_reminder',
            subject: 'Appointment Reminder - {{hospitalName}}',
            smsTemplate: 'Dear {{patientName}}, your appointment with Dr. {{doctorName}} is scheduled for {{date}} at {{time}}. Please arrive 15 minutes early. {{hospitalName}}',
            emailTemplate: `
        Dear {{patientName}},
        
        This is a reminder for your upcoming appointment:
        
        Doctor: Dr. {{doctorName}}
        Date: {{date}}
        Time: {{time}}
        Location: {{location}}
        
        Please arrive 15 minutes early for check-in.
        
        If you need to reschedule, please contact us at least 24 hours in advance.
        
        Best regards,
        {{hospitalName}}
      `,
            priority: 'medium'
        });

        this.templates.set('lab_result', {
            type: 'lab_result',
            subject: 'Lab Results Ready - {{hospitalName}}',
            smsTemplate: 'Dear {{patientName}}, your {{testName}} results are ready. Please visit the hospital to collect your report. {{hospitalName}}',
            emailTemplate: `
        Dear {{patientName}},
        
        Your lab test results for {{testName}} are now ready for collection.
        
        Please visit our hospital during working hours to collect your report:
        {{hospitalHours}}
        
        If you have any questions about your results, please consult with your doctor.
        
        Best regards,
        {{hospitalName}}
      `,
            priority: 'high'
        });

        this.templates.set('billing_reminder', {
            type: 'billing_reminder',
            subject: 'Payment Reminder - {{hospitalName}}',
            smsTemplate: 'Dear {{patientName}}, you have an outstanding bill of ₹{{amount}} due on {{dueDate}}. Please make payment to avoid late fees. {{hospitalName}}',
            emailTemplate: `
        Dear {{patientName}},
        
        This is a reminder that you have an outstanding bill with the following details:
        
        Bill Number: {{billNumber}}
        Amount Due: ₹{{amount}}
        Due Date: {{dueDate}}
        
        Please make payment at your earliest convenience to avoid late fees.
        
        For payment options or queries, please contact our billing department.
        
        Best regards,
        {{hospitalName}}
      `,
            priority: 'medium'
        });

        this.templates.set('prescription_ready', {
            type: 'prescription_ready',
            subject: 'Prescription Ready - {{hospitalName}}',
            smsTemplate: 'Dear {{patientName}}, your prescription is ready for pickup at {{hospitalName}} pharmacy. Please bring your ID.',
            emailTemplate: `
        Dear {{patientName}},
        
        Your prescription prescribed by Dr. {{doctorName}} is ready for pickup at our pharmacy.
        
        Prescription Details:
        {{prescriptionDetails}}
        
        Please bring a valid ID when collecting your medication.
        
        Pharmacy Hours: {{pharmacyHours}}
        
        Best regards,
        {{hospitalName}}
      `,
            priority: 'medium'
        });

        this.templates.set('emergency', {
            type: 'emergency',
            subject: 'Emergency Alert - {{hospitalName}}',
            smsTemplate: 'EMERGENCY: {{message}} - {{hospitalName}}',
            emailTemplate: `
        EMERGENCY ALERT
        
        {{message}}
        
        Please take immediate action as required.
        
        Time: {{timestamp}}
        Priority: CRITICAL
        
        {{hospitalName}}
        Emergency Department
      `,
            priority: 'critical'
        });

        this.templates.set('system', {
            type: 'system',
            subject: 'System Notification - {{hospitalName}}',
            smsTemplate: '{{message}} - {{hospitalName}}',
            emailTemplate: `
        {{message}}
        
        {{details}}
        
        Best regards,
        {{hospitalName}}
      `,
            priority: 'low'
        });
    }

    // Template management
    addTemplate(template: NotificationTemplate): void {
        this.templates.set(template.type, template);
    }

    getTemplate(type: string): NotificationTemplate | undefined {
        return this.templates.get(type);
    }

    // Variable substitution
    private replaceVariables(template: string, variables: Record<string, any>): string {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, String(value));
        }
        return result;
    }

    // Core notification methods
    async sendNotification(data: NotificationData): Promise<{ success: boolean; errors?: string[] }> {
        const template = this.getTemplate(data.template);
        if (!template) {
            throw new Error(`Template not found: ${data.template}`);
        }

        const variables = {
            hospitalName: 'MedCare Rural Hospital',
            hospitalHours: 'Monday-Saturday: 8:00 AM - 8:00 PM, Sunday: 10:00 AM - 6:00 PM',
            pharmacyHours: 'Monday-Saturday: 8:00 AM - 6:00 PM',
            timestamp: new Date().toLocaleString(),
            ...data.variables
        };

        const methods = data.deliveryMethods || ['sms', 'email', 'in-app'];
        const errors: string[] = [];
        let successCount = 0;

        // Send via each delivery method
        for (const method of methods) {
            try {
                switch (method) {
                    case 'sms':
                        if (data.recipient.phone) {
                            await this.sendSMS(data.recipient.phone, template, variables);
                            successCount++;
                        } else {
                            errors.push('SMS: No phone number provided');
                        }
                        break;

                    case 'email':
                        if (data.recipient.email) {
                            await this.sendEmail(data.recipient.email, template, variables);
                            successCount++;
                        } else {
                            errors.push('Email: No email address provided');
                        }
                        break;

                    case 'push':
                        await this.sendPushNotification(data.recipient.id, template, variables);
                        successCount++;
                        break;

                    case 'in-app':
                        await this.sendInAppNotification(data.recipient.id, template, variables);
                        successCount++;
                        break;
                }
            } catch (error) {
                errors.push(`${method}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return {
            success: successCount > 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    private async sendSMS(phoneNumber: string, template: NotificationTemplate, variables: Record<string, any>): Promise<void> {
        try {
            // Simulate SMS API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const message = this.replaceVariables(template.smsTemplate, variables);

            // Log the notification
            await this.logNotification({
                templateType: template.type,
                recipientId: phoneNumber,
                recipientType: 'phone',
                subject: this.replaceVariables(template.subject, variables),
                message,
                deliveryMethod: 'sms',
                status: 'sent',
                scheduledAt: new Date().toISOString(),
                sentAt: new Date().toISOString()
            });

            console.log(`SMS sent to ${phoneNumber}: ${message}`);

            // Show success toast
            toast.success('SMS notification sent successfully');
        } catch (error) {
            // Log failed notification
            await this.logNotification({
                templateType: template.type,
                recipientId: phoneNumber,
                recipientType: 'phone',
                subject: this.replaceVariables(template.subject, variables),
                message: this.replaceVariables(template.smsTemplate, variables),
                deliveryMethod: 'sms',
                status: 'failed',
                scheduledAt: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            throw new Error('SMS service unavailable');
        }
    }

    private async sendEmail(email: string, template: NotificationTemplate, variables: Record<string, any>): Promise<void> {
        try {
            // Simulate email API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const subject = this.replaceVariables(template.subject, variables);
            const message = this.replaceVariables(template.emailTemplate, variables);

            // Log the notification
            await this.logNotification({
                templateType: template.type,
                recipientId: email,
                recipientType: 'email',
                subject,
                message,
                deliveryMethod: 'email',
                status: 'sent',
                scheduledAt: new Date().toISOString(),
                sentAt: new Date().toISOString()
            });

            console.log(`Email sent to ${email}: ${subject}`);

            // Show success toast
            toast.success('Email notification sent successfully');
        } catch (error) {
            // Log failed notification
            await this.logNotification({
                templateType: template.type,
                recipientId: email,
                recipientType: 'email',
                subject: this.replaceVariables(template.subject, variables),
                message: this.replaceVariables(template.emailTemplate, variables),
                deliveryMethod: 'email',
                status: 'failed',
                scheduledAt: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            throw new Error('Email service unavailable');
        }
    }

    private async sendPushNotification(userId: string, template: NotificationTemplate, variables: Record<string, any>): Promise<void> {
        try {
            // Simulate push notification API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const subject = this.replaceVariables(template.subject, variables);
            const message = this.replaceVariables(template.smsTemplate, variables); // Use SMS template for push

            // Log the notification
            await this.logNotification({
                templateType: template.type,
                recipientId: userId,
                recipientType: 'user',
                subject,
                message,
                deliveryMethod: 'push',
                status: 'sent',
                scheduledAt: new Date().toISOString(),
                sentAt: new Date().toISOString()
            });

            console.log(`Push notification sent to ${userId}: ${subject}`);
        } catch (error) {
            throw new Error('Push notification service unavailable');
        }
    }

    private async sendInAppNotification(userId: string, template: NotificationTemplate, variables: Record<string, any>): Promise<void> {
        try {
            const subject = this.replaceVariables(template.subject, variables);
            const message = this.replaceVariables(template.smsTemplate, variables);

            // Add to app store
            useAppStore.getState().addNotification({
                type: template.priority === 'critical' ? 'error' : template.priority === 'high' ? 'warning' : 'info',
                title: subject,
                message,
                read: false
            });

            // Log the notification
            await this.logNotification({
                templateType: template.type,
                recipientId: userId,
                recipientType: 'user',
                subject,
                message,
                deliveryMethod: 'in-app',
                status: 'delivered',
                scheduledAt: new Date().toISOString(),
                sentAt: new Date().toISOString(),
                deliveredAt: new Date().toISOString()
            });

            console.log(`In-app notification sent to ${userId}: ${subject}`);
        } catch (error) {
            throw new Error('In-app notification failed');
        }
    }

    private async logNotification(notification: Omit<NotificationHistory, 'id'>): Promise<void> {
        try {
            const notificationWithId = {
                id: crypto.randomUUID(),
                ...notification
            };

            // Try to save to backend
            if (navigator.onLine) {
                await apiClient.create('/notifications', notificationWithId);
            } else {
                // Store locally for later sync
                useAppStore.getState().addOfflineAction({
                    type: 'CREATE_NOTIFICATION',
                    endpoint: '/notifications',
                    data: notificationWithId
                });
            }
        } catch (error) {
            console.warn('Failed to log notification:', error);
            // Don't throw - logging shouldn't break notification sending
        }
    }

    // Convenience methods for common notification types
    async sendAppointmentReminder(
        patientPhone: string,
        patientEmail: string | undefined,
        appointmentDetails: {
            doctorName: string;
            date: string;
            time: string;
            patientName: string;
            location?: string;
        }
    ): Promise<{ success: boolean; errors?: string[] }> {
        return this.sendNotification({
            template: 'appointment_reminder',
            recipient: {
                id: crypto.randomUUID(),
                name: appointmentDetails.patientName,
                email: patientEmail,
                phone: patientPhone,
                type: 'patient'
            },
            variables: {
                ...appointmentDetails,
                location: appointmentDetails.location || 'Main Hospital Building'
            },
            deliveryMethods: patientEmail ? ['sms', 'email', 'in-app'] : ['sms', 'in-app']
        });
    }

    async sendLabResultNotification(
        patientPhone: string,
        patientEmail: string | undefined,
        patientName: string,
        testName: string
    ): Promise<{ success: boolean; errors?: string[] }> {
        return this.sendNotification({
            template: 'lab_result',
            recipient: {
                id: crypto.randomUUID(),
                name: patientName,
                email: patientEmail,
                phone: patientPhone,
                type: 'patient'
            },
            variables: {
                patientName,
                testName
            },
            deliveryMethods: patientEmail ? ['sms', 'email', 'in-app'] : ['sms', 'in-app']
        });
    }

    async sendBillingReminder(
        patientPhone: string,
        patientEmail: string | undefined,
        patientName: string,
        billDetails: {
            billNumber: string;
            amount: number;
            dueDate: string;
        }
    ): Promise<{ success: boolean; errors?: string[] }> {
        return this.sendNotification({
            template: 'billing_reminder',
            recipient: {
                id: crypto.randomUUID(),
                name: patientName,
                email: patientEmail,
                phone: patientPhone,
                type: 'patient'
            },
            variables: {
                patientName,
                ...billDetails
            },
            deliveryMethods: patientEmail ? ['sms', 'email', 'in-app'] : ['sms', 'in-app']
        });
    }

    async sendEmergencyAlert(
        recipients: NotificationRecipient[],
        message: string
    ): Promise<{ success: boolean; errors?: string[] }> {
        const errors: string[] = [];
        let successCount = 0;

        for (const recipient of recipients) {
            try {
                const result = await this.sendNotification({
                    template: 'emergency',
                    recipient,
                    variables: { message },
                    deliveryMethods: ['sms', 'email', 'push', 'in-app']
                });

                if (result.success) {
                    successCount++;
                }
                if (result.errors) {
                    errors.push(...result.errors);
                }
            } catch (error) {
                errors.push(`Failed to send to ${recipient.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return {
            success: successCount > 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    // History and management
    async getNotificationHistory(
        recipientId?: string,
        templateType?: string,
        limit = 50
    ): Promise<NotificationHistory[]> {
        try {
            const params: any = { limit };
            if (recipientId) params.recipientId = recipientId;
            if (templateType) params.templateType = templateType;

            const result = await apiClient.getAll<NotificationHistory>('/notifications', params);
            return Array.isArray(result) ? result : result.data;
        } catch (error) {
            console.error('Failed to get notification history:', error);
            return [];
        }
    }

    async markAsRead(notificationId: string): Promise<void> {
        try {
            await apiClient.update('/notifications', notificationId, {
                status: 'read',
                readAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    // Quick notification methods (backward compatibility)
    addNotification(notification: { message: string; type: 'success' | 'error' | 'info' | 'warning' }): void {
        // Show toast
        toast[notification.type](notification.message);

        // Add to store
        useAppStore.getState().addNotification({
            type: notification.type,
            title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
            message: notification.message,
            read: false,
        });
    }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export hook for React components
export function useNotifications() {
    const store = useAppStore(state => ({
        notifications: state.notifications.notifications,
        unreadCount: state.notifications.unreadCount,
        markAsRead: state.markAsRead,
        markAllAsRead: state.markAllAsRead,
        clearNotifications: state.clearNotifications,
    }));

    return {
        ...store,
        // Service methods
        sendNotification: notificationService.sendNotification.bind(notificationService),
        sendAppointmentReminder: notificationService.sendAppointmentReminder.bind(notificationService),
        sendLabResultNotification: notificationService.sendLabResultNotification.bind(notificationService),
        sendBillingReminder: notificationService.sendBillingReminder.bind(notificationService),
        sendEmergencyAlert: notificationService.sendEmergencyAlert.bind(notificationService),
        getNotificationHistory: notificationService.getNotificationHistory.bind(notificationService),
        addNotification: notificationService.addNotification.bind(notificationService),
    };
}
