import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
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
    isLoading, 
    sendSMSNotification, 
    sendEmailNotification,
    getNotificationHistory 
  } = useNotifications();
  
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
      if (formData.type === 'sms') {
        await sendSMSNotification(
          formData.recipient,
          formData.message,
          formData.templateType
        );
      } else {
        await sendEmailNotification(
          formData.recipient,
          formData.subject || 'Hospital Notification',
          formData.message,
          formData.templateType
        );
      }
      
      setIsDialogOpen(false);
      setFormData({
        type: 'sms',
        recipient: '',
        subject: '',
        message: '',
        templateType: 'custom'
      });
    } catch (error) {
      toast.error('Failed to send notification');
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

  const notificationHistory = getNotificationHistory();

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
                  onValueChange={(value) => setFormData({...formData, type: value as any})}
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
                  onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                />
              </div>

              {formData.type === 'email' && (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Enter email subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Template Type</Label>
                <Select 
                  value={formData.templateType} 
                  onValueChange={(value) => setFormData({...formData, templateType: value as any})}
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
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
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
              {notifications.filter(n => n.type === 'sms').length}
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
              {notifications.filter(n => n.type === 'email').length}
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
                ? Math.round((notifications.filter(n => n.status === 'sent').length / notifications.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>
            Recent notifications sent to patients and staff
          </CardDescription>
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
                      {getTemplateIcon(notification.templateType)}
                      {notification.type === 'sms' ? 
                        <PhoneIcon className="w-4 h-4 text-blue-500" /> : 
                        <Mail className="w-4 h-4 text-green-500" />
                      }
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{notification.subject}</h3>
                        <Badge variant={notification.status === 'sent' ? 'default' : 'secondary'}>
                          {notification.status}
                        </Badge>
                        <Badge variant="outline">
                          {notification.templateType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        To: {notification.recipientId}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.sentAt || notification.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(notification.status)}
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