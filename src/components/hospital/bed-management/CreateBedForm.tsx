import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useBedApi } from "@/hooks/useBedApi";
import { useRoomApi } from "@/hooks/useRoomApi";
import { CreateBedFormData, Room } from "@/types/bedManagement";

interface CreateBedFormProps {
    roomId?: string; // Pre-select room if provided
    onClose: () => void;
    onSuccess: () => void;
}

// Sample data - in real app, fetch from API
const BED_TYPES = [
    { id: '1', name: 'Standard Bed', description: 'Basic hospital bed' },
    { id: '2', name: 'ICU Bed', description: 'Intensive care bed with monitoring' },
    { id: '3', name: 'Electric Bed', description: 'Adjustable electric bed' },
    { id: '4', name: 'Bariatric Bed', description: 'Heavy-duty bed for larger patients' },
    { id: '5', name: 'Pediatric Bed', description: 'Child-sized bed' }
];

const AVAILABLE_FEATURES = [
    'Electric Adjustment',
    'Side Rails',
    'IV Pole',
    'Oxygen Outlet',
    'Nurse Call System',
    'Cardiac Monitor',
    'Blood Pressure Monitor',
    'Ventilator Support',
    'Suction System',
    'Patient Entertainment System'
];

const CreateBedForm: React.FC<CreateBedFormProps> = ({ roomId, onClose, onSuccess }) => {
    const { createBed } = useBedApi();
    const { rooms, refreshRooms } = useRoomApi();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateBedFormData>({
        bed_number: '',
        room_id: roomId || '',
        bed_type_id: '',
        features: [],
        notes: ''
    });

    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        if (!rooms || rooms.length === 0) {
            refreshRooms();
        }
    }, []);

    const handleInputChange = (field: keyof CreateBedFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFeatureToggle = (feature: string) => {
        setSelectedFeatures(prev => {
            const updated = prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature];

            handleInputChange('features', updated);
            return updated;
        });
    };

    const addCustomFeature = () => {
        if (newFeature.trim() && !selectedFeatures.includes(newFeature.trim())) {
            const feature = newFeature.trim();
            setSelectedFeatures(prev => {
                const updated = [...prev, feature];
                handleInputChange('features', updated);
                return updated;
            });
            setNewFeature('');
        }
    };

    const removeFeature = (featureToRemove: string) => {
        setSelectedFeatures(prev => {
            const updated = prev.filter(f => f !== featureToRemove);
            handleInputChange('features', updated);
            return updated;
        });
    };

    const generateBedNumber = (selectedRoomId: string) => {
        if (!selectedRoomId || !rooms) return '';

        const room = rooms.find((r: Room) => r.id === selectedRoomId);
        if (!room) return '';

        // Count existing beds in this room and suggest next number
        const existingBedsInRoom = room.beds?.length || 0;
        return `${room.room_number}-${(existingBedsInRoom + 1).toString().padStart(2, '0')}`;
    };

    const handleRoomChange = (selectedRoomId: string) => {
        handleInputChange('room_id', selectedRoomId);

        // Auto-generate bed number if empty
        if (!formData.bed_number) {
            const suggestedNumber = generateBedNumber(selectedRoomId);
            if (suggestedNumber) {
                handleInputChange('bed_number', suggestedNumber);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createBed(formData);
            onSuccess();
        } catch (error) {
            console.error('Error creating bed:', error);
            // TODO: Show error toast
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        return (
            formData.bed_number.trim() !== '' &&
            formData.room_id !== '' &&
            formData.bed_type_id !== ''
        );
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Bed</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="bed_number">Bed Number *</Label>
                            <Input
                                id="bed_number"
                                value={formData.bed_number}
                                onChange={(e) => handleInputChange('bed_number', e.target.value)}
                                placeholder="e.g., R-101-01"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Auto-generated when room is selected
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="room">Room *</Label>
                            <Select
                                value={formData.room_id}
                                onValueChange={handleRoomChange}
                                disabled={!!roomId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms?.map((room: Room) => (
                                        <SelectItem key={room.id} value={room.id}>
                                            Room {room.room_number} - {room.room_type?.name} (Floor {room.floor})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {roomId && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Room pre-selected
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="bed_type">Bed Type *</Label>
                            <Select
                                value={formData.bed_type_id}
                                onValueChange={(value) => handleInputChange('bed_type_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select bed type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BED_TYPES.map((type) => (
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
                    </div>

                    {/* Room Information */}
                    {formData.room_id && rooms && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            {(() => {
                                const selectedRoom = rooms.find((r: Room) => r.id === formData.room_id);
                                return selectedRoom ? (
                                    <div>
                                        <h4 className="font-medium text-blue-900 mb-2">Room Information</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-blue-700 font-medium">Type:</span>
                                                <p className="text-blue-800">{selectedRoom.room_type?.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-blue-700 font-medium">Capacity:</span>
                                                <p className="text-blue-800">{selectedRoom.capacity} beds</p>
                                            </div>
                                            <div>
                                                <span className="text-blue-700 font-medium">Current Beds:</span>
                                                <p className="text-blue-800">{selectedRoom.beds?.length || 0}</p>
                                            </div>
                                            <div>
                                                <span className="text-blue-700 font-medium">Available Spots:</span>
                                                <p className="text-blue-800">{selectedRoom.capacity - (selectedRoom.beds?.length || 0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>
                    )}

                    {/* Features */}
                    <div>
                        <Label>Bed Features</Label>
                        <div className="space-y-3 mt-2">
                            {/* Available Features */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {AVAILABLE_FEATURES.map((feature) => (
                                    <div key={feature} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={feature}
                                            checked={selectedFeatures.includes(feature)}
                                            onCheckedChange={() => handleFeatureToggle(feature)}
                                        />
                                        <Label htmlFor={feature} className="text-sm">
                                            {feature}
                                        </Label>
                                    </div>
                                ))}
                            </div>

                            {/* Custom Feature */}
                            <div className="flex gap-2">
                                <Input
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Add custom feature"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addCustomFeature}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Selected Features */}
                            {selectedFeatures.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {selectedFeatures.map((feature) => (
                                        <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                                            {feature}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => removeFeature(feature)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Special instructions, maintenance notes, etc."
                            rows={3}
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
                            {loading ? 'Creating...' : 'Create Bed'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateBedForm;
