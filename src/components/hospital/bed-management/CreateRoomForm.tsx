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
import { useRoomApi } from "@/hooks/useRoomApi";
import { CreateRoomFormData } from "@/types/bedManagement";

interface CreateRoomFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Sample data - in real app, fetch from API
const ROOM_TYPES = [
  { id: '1', name: 'Standard Ward', description: 'Basic patient room' },
  { id: '2', name: 'Private Room', description: 'Single occupancy room' },
  { id: '3', name: 'ICU', description: 'Intensive Care Unit' },
  { id: '4', name: 'Emergency Room', description: 'Emergency treatment room' },
  { id: '5', name: 'Operating Theater', description: 'Surgical room' }
];

const AVAILABLE_AMENITIES = [
  'Air Conditioning',
  'WiFi',
  'TV',
  'Private Bathroom',
  'Refrigerator',
  'Phone',
  'Reclining Chair',
  'Window View',
  'Medical Gas Supply',
  'Emergency Call System'
];

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onClose, onSuccess }) => {
  const { createRoom } = useRoomApi();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRoomFormData>({
    room_number: '',
    room_type_id: '',
    floor: 1,
    building: '',
    capacity: 1,
    amenities: [],
    daily_rate: 0,
    description: ''
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  const handleInputChange = (field: keyof CreateRoomFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => {
      const updated = prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity];
      
      handleInputChange('amenities', updated);
      return updated;
    });
  };

  const addCustomAmenity = () => {
    if (newAmenity.trim() && !selectedAmenities.includes(newAmenity.trim())) {
      const amenity = newAmenity.trim();
      setSelectedAmenities(prev => {
        const updated = [...prev, amenity];
        handleInputChange('amenities', updated);
        return updated;
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    setSelectedAmenities(prev => {
      const updated = prev.filter(a => a !== amenityToRemove);
      handleInputChange('amenities', updated);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createRoom(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating room:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.room_number.trim() !== '' &&
      formData.room_type_id !== '' &&
      formData.floor > 0 &&
      formData.capacity > 0 &&
      formData.daily_rate >= 0
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="room_number">Room Number *</Label>
              <Input
                id="room_number"
                value={formData.room_number}
                onChange={(e) => handleInputChange('room_number', e.target.value)}
                placeholder="e.g., R-101"
                required
              />
            </div>

            <div>
              <Label htmlFor="room_type">Room Type *</Label>
              <Select 
                value={formData.room_type_id} 
                onValueChange={(value) => handleInputChange('room_type_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="floor">Floor *</Label>
              <Input
                id="floor"
                type="number"
                min="1"
                value={formData.floor}
                onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div>
              <Label htmlFor="building">Building</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                placeholder="e.g., Main Building"
              />
            </div>

            <div>
              <Label htmlFor="capacity">Bed Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div>
              <Label htmlFor="daily_rate">Daily Rate (₹) *</Label>
              <Input
                id="daily_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.daily_rate}
                onChange={(e) => handleInputChange('daily_rate', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <Label>Amenities</Label>
            <div className="space-y-3 mt-2">
              {/* Available Amenities */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AVAILABLE_AMENITIES.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={selectedAmenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Custom Amenity */}
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add custom amenity"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addCustomAmenity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Amenities */}
              {selectedAmenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedAmenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                      {amenity}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeAmenity(amenity)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Room description, special features, etc."
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
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomForm;
