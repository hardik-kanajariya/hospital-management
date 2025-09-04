import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CalendarIcon, 
  User, 
  Bed,
  MapPin,
  Clock,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { useAdmissionApi } from "@/hooks/useAdmissionApi";
import { Admission, DischargePatientFormData } from "@/types/bedManagement";

interface DischargePatientFormProps {
  admission: Admission;
  onClose: () => void;
  onSuccess: () => void;
}

const DISCHARGE_REASONS = [
  'Treatment completed successfully',
  'Patient improved - no longer requires inpatient care',
  'Discharged to home care',
  'Transferred to another facility',
  'Patient requested discharge',
  'Against medical advice (AMA)',
  'Death',
  'Other'
];

const DischargePatientForm: React.FC<DischargePatientFormProps> = ({ 
  admission, 
  onClose, 
  onSuccess 
}) => {
  const { dischargePatient } = useAdmissionApi();
  
  const [loading, setLoading] = useState(false);
  const [dischargeDate, setDischargeDate] = useState<Date>(new Date());
  const [customReason, setCustomReason] = useState('');
  
  const [formData, setFormData] = useState<DischargePatientFormData>({
    actual_discharge_date: new Date().toISOString(),
    discharge_reason: '',
    discharge_notes: '',
    follow_up_instructions: ''
  });

  const handleInputChange = (field: keyof DischargePatientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReasonSelect = (reason: string) => {
    handleInputChange('discharge_reason', reason);
    if (reason !== 'Other') {
      setCustomReason('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dischargeData = {
        ...formData,
        actual_discharge_date: dischargeDate.toISOString(),
        discharge_reason: formData.discharge_reason === 'Other' ? customReason : formData.discharge_reason
      };

      await dischargePatient(admission.id, dischargeData);
      onSuccess();
    } catch (error) {
      console.error('Error discharging patient:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const calculateLengthOfStay = () => {
    const admissionDate = new Date(admission.admission_date);
    const diffTime = Math.abs(dischargeDate.getTime() - admissionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isFormValid = () => {
    const hasReason = formData.discharge_reason !== '' && 
      (formData.discharge_reason !== 'Other' || customReason.trim() !== '');
    return hasReason;
  };

  // Check if discharge is against medical advice
  const isAMA = formData.discharge_reason === 'Against medical advice (AMA)';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Discharge Patient</DialogTitle>
        </DialogHeader>

        {/* Patient and Admission Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Patient Information</h4>
                <div className="flex items-center gap-2 text-blue-800">
                  <User className="h-4 w-4" />
                  <span>
                    {admission.patient?.first_name} {admission.patient?.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-700 text-sm mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Room {admission.room?.room_number} - Bed {admission.bed?.bed_number}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Admission Details</h4>
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    Admitted: {format(new Date(admission.admission_date), 'dd MMM yyyy, HH:mm')}
                  </span>
                </div>
                <div className="text-blue-700 text-sm mt-1">
                  <span className="font-medium">Type:</span> {admission.admission_type}
                </div>
                <div className="text-blue-700 text-sm">
                  <span className="font-medium">Current LOS:</span> {calculateLengthOfStay()} days
                </div>
              </div>
            </div>
            
            {admission.diagnosis && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <span className="font-medium text-blue-900">Diagnosis:</span>
                <p className="text-blue-800 text-sm mt-1">{admission.diagnosis}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Discharge Date */}
          <div>
            <Label>Discharge Date & Time *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dischargeDate, "PPP 'at' HH:mm")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dischargeDate}
                  onSelect={(date) => {
                    if (date) {
                      // Preserve time when changing date
                      const newDate = new Date(date);
                      newDate.setHours(dischargeDate.getHours());
                      newDate.setMinutes(dischargeDate.getMinutes());
                      setDischargeDate(newDate);
                    }
                  }}
                  initialFocus
                  disabled={(date) => date < new Date(admission.admission_date) || date > new Date()}
                />
                <div className="p-3 border-t">
                  <Label className="text-sm">Time</Label>
                  <Input
                    type="time"
                    value={format(dischargeDate, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(dischargeDate);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setDischargeDate(newDate);
                    }}
                    className="mt-1"
                  />
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-sm text-gray-500 mt-1">
              Length of stay: {calculateLengthOfStay()} days
            </p>
          </div>

          {/* Discharge Reason */}
          <div>
            <Label>Discharge Reason *</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {DISCHARGE_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.discharge_reason === reason
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="discharge_reason"
                    value={reason}
                    checked={formData.discharge_reason === reason}
                    onChange={() => handleReasonSelect(reason)}
                    className="mr-3"
                  />
                  <span className="text-sm">{reason}</span>
                  {reason === 'Against medical advice (AMA)' && (
                    <AlertTriangle className="h-4 w-4 text-orange-500 ml-auto" />
                  )}
                </label>
              ))}
            </div>

            {/* Custom Reason Input */}
            {formData.discharge_reason === 'Other' && (
              <div className="mt-3">
                <Label htmlFor="custom_reason">Specify Other Reason *</Label>
                <Input
                  id="custom_reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify the discharge reason..."
                  required
                />
              </div>
            )}
          </div>

          {/* AMA Warning */}
          {isAMA && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">Against Medical Advice</h4>
                    <p className="text-sm text-orange-800 mt-1">
                      This discharge is against medical advice. Please ensure proper documentation 
                      and that the patient understands the risks involved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discharge Notes */}
          <div>
            <Label htmlFor="discharge_notes">
              Discharge Notes {isAMA && '*'}
            </Label>
            <Textarea
              id="discharge_notes"
              value={formData.discharge_notes}
              onChange={(e) => handleInputChange('discharge_notes', e.target.value)}
              placeholder={
                isAMA 
                  ? "Document the circumstances of AMA discharge, risks explained to patient, etc..."
                  : "Final condition, medications, restrictions, etc..."
              }
              rows={4}
              required={isAMA}
            />
          </div>

          {/* Follow-up Instructions */}
          <div>
            <Label htmlFor="follow_up_instructions">Follow-up Instructions</Label>
            <Textarea
              id="follow_up_instructions"
              value={formData.follow_up_instructions}
              onChange={(e) => handleInputChange('follow_up_instructions', e.target.value)}
              placeholder="Follow-up appointments, medication instructions, care at home, etc..."
              rows={3}
            />
          </div>

          {/* Summary */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">Discharge Summary</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Patient:</span> {admission.patient?.first_name} {admission.patient?.last_name}</p>
                <p><span className="font-medium">Admission Date:</span> {format(new Date(admission.admission_date), 'dd MMM yyyy, HH:mm')}</p>
                <p><span className="font-medium">Discharge Date:</span> {format(dischargeDate, 'dd MMM yyyy, HH:mm')}</p>
                <p><span className="font-medium">Length of Stay:</span> {calculateLengthOfStay()} days</p>
                <p><span className="font-medium">Room/Bed:</span> {admission.room?.room_number}/{admission.bed?.bed_number}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid() || loading}
              className={isAMA ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              {loading ? 'Processing...' : 'Discharge Patient'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DischargePatientForm;
