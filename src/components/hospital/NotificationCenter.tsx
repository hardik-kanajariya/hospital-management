import { useState } from 'react';
import { useNotifications, notificationService } from '@/lib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BellIcon,
  PlusIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  TestTubeIcon,
  CreditCardIcon
} from '@phosphor-icons/react';
import { CircleAlert, Mail } from 'lucide-react';

export default function NotificationCenter() {
  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'sms' as 'sms' | 'email',
    recipient: '',
    subject: '',
    message: '',
    templateType: 'custom' as any
  });

  const handleSendNotification = async () => {
    if (!formData.recipient || !formData.message) {
      toast.error('Please fill in recipient and message');
      return;
    }

    try {
      setIsLoading(true);

      // Use the notification service's send method
      await notificationService.sendNotification({
        template: 'system',
        recipient: {
          id: 'user',
          type: 'patient',
          phone: formData.type === 'sms' ? formData.recipient : undefined,
          email: formData.type === 'email' ? formData.recipient : undefined,
          name: 'User'
        },
        variables: {
          message: formData.message,
          subject: formData.subject || 'Hospital Notification'
        },
        deliveryMethods: formData.type === 'sms' ? ['sms'] : ['email']
      });

      addNotification({
        message: `${formData.type.toUpperCase()} notification sent to ${formData.recipient}`,
        type: 'success'
      });

      // Also add a notification about the sent message
      addNotification({
        message: `Message: "${formData.message.substring(0, 50)}${formData.message.length > 50 ? '...' : ''}"`,
        type: 'info'
      });

      setIsDialogOpen(false);
      setFormData({
        type: 'sms',
        recipient: '',
        subject: '',
        message: '',
        templateType: 'custom'
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      addNotification({
        message: `Failed to send ${formData.type} notification`,
        type: 'error'
      });
      toast.error('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return <CircleAlert className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTemplateIcon = (templateType: string) => {
    switch (templateType) {
      case 'appointment_reminder':
        return <CalendarIcon className="w-4 h-4 text-blue-500" />;
      case 'lab_result':
        return <TestTubeIcon className="w-4 h-4 text-green-500" />;
      case 'billing_reminder':
        return <CreditCardIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <CircleAlert className="w-4 h-4 text-gray-500" />;
    }
  };

  // Use current notifications as history for now
  const notificationHistory = notifications;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-muted-foreground">Send and track SMS and email notifications</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>
                Send SMS or email notification to patients or staff
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recipient {formData.type === 'sms' ? 'Phone Number' : 'Email'}</Label>
                <Input
                  placeholder={formData.type === 'sms' ? 'Enter phone number' : 'Enter email address'}
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                />
              </div>

              {formData.type === 'email' && (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Enter email subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Template Type</Label>
                <Select
                  value={formData.templateType}
                  onValueChange={(value) => setFormData({ ...formData, templateType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                    <SelectItem value="lab_result">Lab Result</SelectItem>
                    <SelectItem value="billing_reminder">Billing Reminder</SelectItem>
                    <SelectItem value="prescription_ready">Prescription Ready</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Enter your message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.type === 'sms' ? `${formData.message.length}/160 characters` : 'No character limit for email'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendNotification} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Notification'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <BellIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.title?.toLowerCase().includes('sms')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.title?.toLowerCase().includes('email')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.length > 0
                ? Math.round((notifications.filter(n => n.type === 'success').length / notifications.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                Recent notifications sent to patients and staff
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
              <Button variant="outline" size="sm" onClick={clearNotifications}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationHistory.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No notifications sent</h3>
                <p className="text-muted-foreground">
                  Start by sending your first notification
                </p>
              </div>
            ) : (
              notificationHistory.map((notification) => (
                <div key={notification.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      {/* Use notification type to determine icon */}
                      {notification.type === 'success' && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                      {notification.type === 'error' && <XCircleIcon className="w-4 h-4 text-red-500" />}
                      {notification.type === 'warning' && <ClockIcon className="w-4 h-4 text-yellow-500" />}
                      {notification.type === 'info' && <CircleAlert className="w-4 h-4 text-blue-500" />}

                      {/* Determine if SMS or Email based on title/message content */}
                      {(notification.title?.toLowerCase().includes('sms') || notification.message?.toLowerCase().includes('sms')) ?
                        <PhoneIcon className="w-4 h-4 text-blue-500" /> :
                        <Mail className="w-4 h-4 text-green-500" />
                      }
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{notification.title}</h3>
                        <Badge variant={notification.type === 'success' ? 'default' :
                          notification.type === 'error' ? 'destructive' : 'secondary'}>
                          {notification.type}
                        </Badge>
                        <Badge variant="outline">
                          {notification.read ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.read ?
                      <CheckCircleIcon className="w-4 h-4 text-green-500" /> :
                      <CircleAlert className="w-4 h-4 text-gray-500" />
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}