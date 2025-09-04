import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    User,
    Bed,
    MapPin,
    ArrowRight,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useAdmissionApi } from "@/hooks/useAdmissionApi";
import { useBedApi } from "@/hooks/useBedApi";
import { Admission, TransferPatientFormData, Bed as BedType } from "@/types/bedManagement";

interface TransferPatientFormProps {
    admission: Admission;
    onClose: () => void;
    onSuccess: () => void;
}

const TRANSFER_REASONS = [
    'Medical condition requires different level of care',
    'Patient improvement - step down to lower acuity',
    'Patient deterioration - step up to higher acuity',
    'Room isolation required',
    'Patient request for private room',
    'Equipment needs not available in current room',
    'Infection control measures',
    'Bed management - optimize capacity',
    'Other'
];

const TransferPatientForm: React.FC<TransferPatientFormProps> = ({
    admission,
    onClose,
    onSuccess
}) => {
    const { transferPatient } = useAdmissionApi();
    const { getAvailableBeds } = useBedApi();

    const [loading, setLoading] = useState(false);
    const [availableBeds, setAvailableBeds] = useState<BedType[]>([]);
    const [searchBed, setSearchBed] = useState('');
    const [customReason, setCustomReason] = useState('');

    const [formData, setFormData] = useState<TransferPatientFormData>({
        new_bed_id: '',
        transfer_reason: '',
        transfer_notes: ''
    });

    useEffect(() => {
        loadAvailableBeds();
    }, []);

    const loadAvailableBeds = async () => {
        try {
            const beds = await getAvailableBeds();
            // Filter out the current bed
            const filteredBeds = beds.filter((bed: BedType) => bed.id !== admission.bed_id);
            setAvailableBeds(filteredBeds);
        } catch (error) {
            console.error('Error loading available beds:', error);
        }
    };

    const handleInputChange = (field: keyof TransferPatientFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleReasonSelect = (reason: string) => {
        handleInputChange('transfer_reason', reason);
        if (reason !== 'Other') {
            setCustomReason('');
        }
    };

    const filteredBeds = availableBeds.filter(bed =>
        bed.bed_number.toLowerCase().includes(searchBed.toLowerCase()) ||
        bed.room?.room_number?.toLowerCase().includes(searchBed.toLowerCase()) ||
        bed.bed_type?.name?.toLowerCase().includes(searchBed.toLowerCase())
    );

    const selectedBed = availableBeds.find(bed => bed.id === formData.new_bed_id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const transferData = {
                ...formData,
                transfer_reason: formData.transfer_reason === 'Other' ? customReason : formData.transfer_reason
            };

            await transferPatient(admission.id, formData.new_bed_id, transferData);
            onSuccess();
        } catch (error) {
            console.error('Error transferring patient:', error);
            // TODO: Show error toast
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        const hasNewBed = formData.new_bed_id !== '';
        const hasReason = formData.transfer_reason !== '' &&
            (formData.transfer_reason !== 'Other' || customReason.trim() !== '');
        return hasNewBed && hasReason;
    };

    // Check if transfer is to a different room type (step up/down care)
    const isLevelChange = selectedBed &&
        selectedBed.room?.room_type?.name !== admission.room?.room_type?.name;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Transfer Patient</DialogTitle>
                </DialogHeader>

                {/* Current Assignment */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <h4 className="font-medium text-blue-900 mb-3">Current Assignment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-blue-800">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">
                                        {admission.patient?.first_name} {admission.patient?.last_name}
                                    </span>
                                </div>
                                <div className="text-blue-700 text-sm mt-1">
                                    Admitted: {format(new Date(admission.admission_date), 'dd MMM yyyy, HH:mm')}
                                </div>
                                {admission.diagnosis && (
                                    <div className="text-blue-700 text-sm">
                                        <span className="font-medium">Diagnosis:</span> {admission.diagnosis}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Bed className="h-4 w-4" />
                                    <span className="font-medium">
                                        Bed {admission.bed?.bed_number}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-700 text-sm">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                        Room {admission.room?.room_number} - Floor {admission.room?.floor}
                                    </span>
                                </div>
                                <div className="text-blue-700 text-sm">
                                    <span className="font-medium">Type:</span> {admission.room?.room_type?.name}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Select New Bed */}
                    <div>
                        <Label>Select New Bed *</Label>

                        {/* Search */}
                        <div className="relative mt-2 mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search available beds..."
                                value={searchBed}
                                onChange={(e) => setSearchBed(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Available Beds */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                            {filteredBeds.length === 0 ? (
                                <div className="col-span-2 text-center py-8">
                                    <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No available beds found</p>
                                    <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                                </div>
                            ) : (
                                filteredBeds.map((bed) => (
                                    <Card
                                        key={bed.id}
                                        className={`cursor-pointer transition-all duration-200 ${formData.new_bed_id === bed.id
                                                ? 'ring-2 ring-green-500 bg-green-50'
                                                : 'hover:shadow-md'
                                            }`}
                                        onClick={() => handleInputChange('new_bed_id', bed.id)}
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
                                                    <p className="text-xs text-gray-500">{bed.room?.room_type?.name}</p>

                                                    {/* Level change indicator */}
                                                    {formData.new_bed_id === bed.id &&
                                                        bed.room?.room_type?.name !== admission.room?.room_type?.name && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs mt-1 border-orange-300 text-orange-700"
                                                            >
                                                                Level Change: {admission.room?.room_type?.name} → {bed.room?.room_type?.name}
                                                            </Badge>
                                                        )}

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
                                                {formData.new_bed_id === bed.id && (
                                                    <Badge className="bg-green-600">Selected</Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Transfer Preview */}
                    {selectedBed && (
                        <Card className="bg-gray-50 border-gray-200">
                            <CardContent className="p-4">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4" />
                                    Transfer Preview
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">From:</span>
                                        <p>Room {admission.room?.room_number} - Bed {admission.bed?.bed_number}</p>
                                        <p className="text-gray-600">{admission.room?.room_type?.name}</p>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <ArrowRight className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">To:</span>
                                        <p>Room {selectedBed.room?.room_number} - Bed {selectedBed.bed_number}</p>
                                        <p className="text-gray-600">{selectedBed.room?.room_type?.name}</p>
                                    </div>
                                </div>

                                {isLevelChange && (
                                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                                            <div>
                                                <p className="text-orange-900 text-sm font-medium">Care Level Change</p>
                                                <p className="text-orange-800 text-sm">
                                                    This transfer involves a change in care level from {admission.room?.room_type?.name} to {selectedBed.room?.room_type?.name}.
                                                    Please ensure appropriate medical orders and documentation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Transfer Reason */}
                    <div>
                        <Label>Transfer Reason *</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                            {TRANSFER_REASONS.map((reason) => (
                                <label
                                    key={reason}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.transfer_reason === reason
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="transfer_reason"
                                        value={reason}
                                        checked={formData.transfer_reason === reason}
                                        onChange={() => handleReasonSelect(reason)}
                                        className="mr-3"
                                    />
                                    <span className="text-sm">{reason}</span>
                                </label>
                            ))}
                        </div>

                        {/* Custom Reason Input */}
                        {formData.transfer_reason === 'Other' && (
                            <div className="mt-3">
                                <Label htmlFor="custom_reason">Specify Other Reason *</Label>
                                <Input
                                    id="custom_reason"
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Please specify the transfer reason..."
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {/* Transfer Notes */}
                    <div>
                        <Label htmlFor="transfer_notes">
                            Transfer Notes {isLevelChange && '*'}
                        </Label>
                        <Textarea
                            id="transfer_notes"
                            value={formData.transfer_notes}
                            onChange={(e) => handleInputChange('transfer_notes', e.target.value)}
                            placeholder={
                                isLevelChange
                                    ? "Document the medical justification for level change, new care requirements, etc..."
                                    : "Additional notes about the transfer, special requirements, etc..."
                            }
                            rows={4}
                            required={isLevelChange}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isFormValid() || loading}
                        >
                            {loading ? 'Processing...' : 'Transfer Patient'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TransferPatientForm;
