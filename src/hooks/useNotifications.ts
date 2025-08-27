import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Notification } from '@/types/hospital';
import { toast } from 'sonner';

export function useNotifications() {
  const [notifications, setNotifications] = useKV<Notification[]>('notifications', []);
  const [isLoading, setIsLoading] = useState(false);

  const sendSMSNotification = async (
    phoneNumber: string,
    message: string,
    templateType: Notification['templateType']
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Simulate SMS API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const notification: Notification = {
        id: crypto.randomUUID(),
        type: 'sms',
        recipientId: phoneNumber,
        recipientType: 'patient',
        subject: getSubjectFromTemplate(templateType),
        message,
        scheduledAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        status: 'sent',
        templateType
      };

      setNotifications(prev => [...prev, notification]);
      toast.success('SMS notification sent successfully');
      
      return { success: true };
    } catch (error) {
      toast.error('Failed to send SMS notification');
      return { success: false, error: 'SMS service unavailable' };
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailNotification = async (
    email: string,
    subject: string,
    message: string,
    templateType: Notification['templateType']
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Simulate email API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const notification: Notification = {
        id: crypto.randomUUID(),
        type: 'email',
        recipientId: email,
        recipientType: 'patient',
        subject,
        message,
        scheduledAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        status: 'sent',
        templateType
      };

      setNotifications(prev => [...prev, notification]);
      toast.success('Email notification sent successfully');
      
      return { success: true };
    } catch (error) {
      toast.error('Failed to send email notification');
      return { success: false, error: 'Email service unavailable' };
    } finally {
      setIsLoading(false);
    }
  };

  const sendAppointmentReminder = async (
    patientPhone: string,
    patientEmail: string | undefined,
    appointmentDetails: {
      doctorName: string;
      date: string;
      time: string;
      patientName: string;
    }
  ) => {
    const smsMessage = `Dear ${appointmentDetails.patientName}, your appointment with Dr. ${appointmentDetails.doctorName} is scheduled for ${appointmentDetails.date} at ${appointmentDetails.time}. Please arrive 15 minutes early. MedCare Rural`;
    
    const emailMessage = `
      Dear ${appointmentDetails.patientName},
      
      This is a reminder for your upcoming appointment:
      
      Doctor: Dr. ${appointmentDetails.doctorName}
      Date: ${appointmentDetails.date}
      Time: ${appointmentDetails.time}
      
      Please arrive 15 minutes early for check-in.
      
      If you need to reschedule, please contact us at least 24 hours in advance.
      
      Best regards,
      MedCare Rural Hospital
    `;

    // Send SMS
    await sendSMSNotification(patientPhone, smsMessage, 'appointment_reminder');
    
    // Send Email if available
    if (patientEmail) {
      await sendEmailNotification(
        patientEmail,
        'Appointment Reminder - MedCare Rural',
        emailMessage,
        'appointment_reminder'
      );
    }
  };

  const sendLabResultNotification = async (
    patientPhone: string,
    patientEmail: string | undefined,
    patientName: string,
    testName: string
  ) => {
    const smsMessage = `Dear ${patientName}, your ${testName} results are ready. Please visit the hospital to collect your report. MedCare Rural`;
    
    const emailMessage = `
      Dear ${patientName},
      
      Your lab test results for ${testName} are now ready for collection.
      
      Please visit our hospital during working hours to collect your report.
      
      If you have any questions about your results, please consult with your doctor.
      
      Best regards,
      MedCare Rural Hospital
    `;

    // Send SMS
    await sendSMSNotification(patientPhone, smsMessage, 'lab_result');
    
    // Send Email if available
    if (patientEmail) {
      await sendEmailNotification(
        patientEmail,
        'Lab Results Ready - MedCare Rural',
        emailMessage,
        'lab_result'
      );
    }
  };

  const sendBillingReminder = async (
    patientPhone: string,
    patientEmail: string | undefined,
    patientName: string,
    amountDue: number,
    dueDate: string
  ) => {
    const smsMessage = `Dear ${patientName}, you have an outstanding bill of ₹${amountDue} due on ${dueDate}. Please make payment to avoid late fees. MedCare Rural`;
    
    const emailMessage = `
      Dear ${patientName},
      
      This is a reminder that you have an outstanding bill with the following details:
      
      Amount Due: ₹${amountDue}
      Due Date: ${dueDate}
      
      Please make payment at your earliest convenience to avoid late fees.
      
      For payment options or queries, please contact our billing department.
      
      Best regards,
      MedCare Rural Hospital
    `;

    // Send SMS
    await sendSMSNotification(patientPhone, smsMessage, 'billing_reminder');
    
    // Send Email if available
    if (patientEmail) {
      await sendEmailNotification(
        patientEmail,
        'Payment Reminder - MedCare Rural',
        emailMessage,
        'billing_reminder'
      );
    }
  };

  const getNotificationHistory = () => {
    return notifications.sort((a, b) => 
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  };

  return {
    notifications,
    isLoading,
    sendSMSNotification,
    sendEmailNotification,
    sendAppointmentReminder,
    sendLabResultNotification,
    sendBillingReminder,
    getNotificationHistory
  };
}

function getSubjectFromTemplate(templateType: Notification['templateType']): string {
  switch (templateType) {
    case 'appointment_reminder':
      return 'Appointment Reminder';
    case 'lab_result':
      return 'Lab Results Ready';
    case 'billing_reminder':
      return 'Payment Reminder';
    case 'prescription_ready':
      return 'Prescription Ready';
    default:
      return 'Hospital Notification';
  }
}