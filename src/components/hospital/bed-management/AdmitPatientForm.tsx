import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarIcon, 
  Search, 
  User, 
  Bed,
  MapPin,
  Clock,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { useAdmissionApi } from "@/hooks/useAdmissionApi";
import { useBedApi } from "@/hooks/useBedApi";
import { useRoomApi } from "@/hooks/useRoomApi";
import { AdmitPatientFormData, Bed as BedType, Room, Patient } from "@/types/bedManagement";

interface AdmitPatientFormProps {
  onClose: () => void;
  onSuccess: () => void;
  preselectedBedId?: string;
  preselectedPatientId?: string;
}

// Sample data - in real app, fetch from API
const ADMISSION_TYPES = [
  { id: 'emergency', name: 'Emergency', description: 'Emergency admission' },
  { id: 'scheduled', name: 'Scheduled', description: 'Planned admission' },
  { id: 'elective', name: 'Elective', description: 'Elective procedure' },
  { id: 'observation', name: 'Observation', description: 'Observation stay' },
  { id: 'outpatient', name: 'Outpatient', description: 'Day case procedure' }
];

const SAMPLE_PATIENTS: Patient[] = [
  { 
    id: '1', 
    first_name: 'John', 
    last_name: 'Doe', 
    email: 'john@example.com',
    phone: '+91-9876543210',
    date_of_birth: '1990-01-15',
    gender: 'male',
    created_at: '',
    updated_at: ''
  },
  { 
    id: '2', 
    first_name: 'Jane', 
    last_name: 'Smith', 
    email: 'jane@example.com',
    phone: '+91-9876543211',
    date_of_birth: '1985-06-22',
    gender: 'female',
    created_at: '',
    updated_at: ''
  }
];

const AdmitPatientForm: React.FC<AdmitPatientFormProps> = ({ 
  onClose, 
  onSuccess, 
  preselectedBedId,
  preselectedPatientId 
}) => {
  const { admitPatient } = useAdmissionApi();
  const { getAvailableBeds, beds } = useBedApi();
  const { rooms } = useRoomApi();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  const [availableBeds, setAvailableBeds] = useState<BedType[]>([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [searchBed, setSearchBed] = useState('');
  const [admissionDate, setAdmissionDate] = useState<Date>(new Date());
  const [estimatedDischargeDate, setEstimatedDischargeDate] = useState<Date | undefined>();
  
  const [formData, setFormData] = useState<AdmitPatientFormData>({
    patient_id: preselectedPatientId || '',
    bed_id: preselectedBedId || '',
    admission_type: '',
    admission_reason: '',
    diagnosis: '',
    treatment_plan: '',
    estimated_discharge_date: '',
    notes: ''
  });

  useEffect(() => {
    loadAvailableBeds();
  }, []);

  useEffect(() => {
    if (admissionDate) {
      setFormData(prev => ({
        ...prev,
        admission_date: admissionDate.toISOString()
      }));
    }
  }, [admissionDate]);

  useEffect(() => {
    if (estimatedDischargeDate) {
      setFormData(prev => ({
        ...prev,
        estimated_discharge_date: estimatedDischargeDate.toISOString()
      }));
    }
  }, [estimatedDischargeDate]);

  const loadAvailableBeds = async () => {
    try {
      const beds = await getAvailableBeds();
      setAvailableBeds(beds);
    } catch (error) {
      console.error('Error loading available beds:', error);
    }
  };

  const handleInputChange = (field: keyof AdmitPatientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredPatients = SAMPLE_PATIENTS.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.phone?.includes(searchPatient)
  );

  const filteredBeds = availableBeds.filter(bed =>
    bed.bed_number.toLowerCase().includes(searchBed.toLowerCase()) ||
    bed.room?.room_number?.toLowerCase().includes(searchBed.toLowerCase()) ||
    bed.bed_type?.name?.toLowerCase().includes(searchBed.toLowerCase())
  );

  const selectedPatient = SAMPLE_PATIENTS.find(p => p.id === formData.patient_id);
  const selectedBed = availableBeds.find(b => b.id === formData.bed_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await admitPatient(formData.patient_id, formData.bed_id, {
        admission_type: formData.admission_type,
        admission_reason: formData.admission_reason,
        diagnosis: formData.diagnosis,
        treatment_plan: formData.treatment_plan,
        estimated_discharge_date: formData.estimated_discharge_date,
        notes: formData.notes,
        admission_date: formData.admission_date || new Date().toISOString()
      });
      onSuccess();
    } catch (error) {
      console.error('Error admitting patient:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.patient_id !== '';
      case 2:
        return formData.bed_id !== '';
      case 3:
        return formData.admission_type !== '' && formData.admission_reason.trim() !== '';
      default:
        return true;
    }
  };

  const canProceed = () => {
    return isStepValid(step);
  };

  const canSubmit = () => {
    return (
      formData.patient_id !== '' &&
      formData.bed_id !== '' &&
      formData.admission_type !== '' &&
      formData.admission_reason.trim() !== ''
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Admit Patient</DialogTitle>
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              Step {step} of 3
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Patient */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Patient</h3>
                
                {/* Search Patient */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patient by name, email, or phone..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Patient List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <Card
                      key={patient.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        formData.patient_id === patient.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleInputChange('patient_id', patient.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {patient.first_name} {patient.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{patient.email}</p>
                            <p className="text-sm text-gray-600">{patient.phone}</p>
                            {patient.date_of_birth && (
                              <p className="text-xs text-gray-500">
                                DOB: {format(new Date(patient.date_of_birth), 'dd MMM yyyy')}
                              </p>
                            )}
                          </div>
                          {formData.patient_id === patient.id && (
                            <Badge className="bg-blue-600">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredPatients.length === 0 && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No patients found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select Bed */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Bed</h3>
                
                {/* Search Bed */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bed by number, room, or type..."
                    value={searchBed}
                    onChange={(e) => setSearchBed(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Bed List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredBeds.map((bed) => (
                    <Card
                      key={bed.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        formData.bed_id === bed.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleInputChange('bed_id', bed.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Bed className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Bed {bed.bed_number}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>Room {bed.room?.room_number} - Floor {bed.room?.floor}</span>
                            </div>
                            <p className="text-sm text-gray-600">{bed.bed_type?.name}</p>
                            {bed.features && bed.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {bed.features.slice(0, 2).map((feature, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                                {bed.features.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{bed.features.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          {formData.bed_id === bed.id && (
                            <Badge className="bg-blue-600">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredBeds.length === 0 && (
                  <div className="text-center py-8">
                    <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No available beds found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Admission Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Admission Details</h3>

              {/* Selected Patient and Bed Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                {selectedPatient && (
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Patient</h4>
                    <p className="text-blue-800">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </p>
                    <p className="text-sm text-blue-700">{selectedPatient.email}</p>
                  </div>
                )}
                {selectedBed && (
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Bed Assignment</h4>
                    <p className="text-blue-800">
                      Bed {selectedBed.bed_number} - Room {selectedBed.room?.room_number}
                    </p>
                    <p className="text-sm text-blue-700">
                      {selectedBed.bed_type?.name} - Floor {selectedBed.room?.floor}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Admission Type */}
                <div>
                  <Label htmlFor="admission_type">Admission Type *</Label>
                  <Select 
                    value={formData.admission_type} 
                    onValueChange={(value) => handleInputChange('admission_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select admission type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMISSION_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admission Date */}
                <div>
                  <Label>Admission Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !admissionDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {admissionDate ? format(admissionDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={admissionDate}
                        onSelect={(date) => date && setAdmissionDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Estimated Discharge Date */}
                <div>
                  <Label>Estimated Discharge Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !estimatedDischargeDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {estimatedDischargeDate ? (
                          format(estimatedDischargeDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={estimatedDischargeDate}
                        onSelect={setEstimatedDischargeDate}
                        initialFocus
                        disabled={(date) => date < admissionDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Admission Reason */}
              <div>
                <Label htmlFor="admission_reason">Admission Reason *</Label>
                <Textarea
                  id="admission_reason"
                  value={formData.admission_reason}
                  onChange={(e) => handleInputChange('admission_reason', e.target.value)}
                  placeholder="Describe the reason for admission..."
                  rows={3}
                  required
                />
              </div>

              {/* Diagnosis */}
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  placeholder="Initial diagnosis or suspected condition..."
                  rows={2}
                />
              </div>

              {/* Treatment Plan */}
              <div>
                <Label htmlFor="treatment_plan">Treatment Plan</Label>
                <Textarea
                  id="treatment_plan"
                  value={formData.treatment_plan}
                  onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                  placeholder="Planned treatment and care instructions..."
                  rows={3}
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or special instructions..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {step < 3 ? (
                <Button 
                  type="button" 
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={!canSubmit() || loading}
                >
                  {loading ? 'Admitting...' : 'Admit Patient'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdmitPatientForm;
