import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    User,
    DollarSign,
    Calculator,
    Plus,
    Minus
} from "lucide-react";
import { format } from "date-fns";
import { useAdmissionApi } from "@/hooks/useAdmissionApi";
import { Admission, AddChargeFormData } from "@/types/bedManagement";

interface AddChargeFormProps {
    admission: Admission;
    onClose: () => void;
    onSuccess: () => void;
}

// Sample charge types - in real app, fetch from API
const CHARGE_TYPES = [
    {
        id: '1',
        name: 'Room Charge',
        category: 'Accommodation',
        default_amount: 2500,
        unit: 'per day'
    },
    {
        id: '2',
        name: 'Nursing Care',
        category: 'Nursing',
        default_amount: 1500,
        unit: 'per day'
    },
    {
        id: '3',
        name: 'Doctor Consultation',
        category: 'Medical',
        default_amount: 1000,
        unit: 'per visit'
    },
    {
        id: '4',
        name: 'Laboratory Test',
        category: 'Diagnostic',
        default_amount: 500,
        unit: 'per test'
    },
    {
        id: '5',
        name: 'Radiology - X-Ray',
        category: 'Diagnostic',
        default_amount: 800,
        unit: 'per procedure'
    },
    {
        id: '6',
        name: 'Medication',
        category: 'Pharmacy',
        default_amount: 200,
        unit: 'per dose'
    },
    {
        id: '7',
        name: 'Physiotherapy',
        category: 'Therapy',
        default_amount: 600,
        unit: 'per session'
    },
    {
        id: '8',
        name: 'Medical Supplies',
        category: 'Supplies',
        default_amount: 100,
        unit: 'per item'
    },
    {
        id: '9',
        name: 'Emergency Charges',
        category: 'Emergency',
        default_amount: 5000,
        unit: 'per event'
    },
    {
        id: '10',
        name: 'Other',
        category: 'Miscellaneous',
        default_amount: 0,
        unit: 'custom'
    }
];

const AddChargeForm: React.FC<AddChargeFormProps> = ({
    admission,
    onClose,
    onSuccess
}) => {
    const { addCharge } = useAdmissionApi();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<AddChargeFormData>({
        charge_type_id: '',
        description: '',
        amount: 0,
        quantity: 1,
        notes: ''
    });

    const handleInputChange = (field: keyof AddChargeFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleChargeTypeChange = (chargeTypeId: string) => {
        const chargeType = CHARGE_TYPES.find(ct => ct.id === chargeTypeId);
        if (chargeType) {
            setFormData(prev => ({
                ...prev,
                charge_type_id: chargeTypeId,
                description: chargeType.name,
                amount: chargeType.default_amount
            }));
        }
    };

    const handleQuantityChange = (change: number) => {
        const newQuantity = Math.max(1, formData.quantity + change);
        handleInputChange('quantity', newQuantity);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addCharge(admission.id, formData);
            onSuccess();
        } catch (error) {
            console.error('Error adding charge:', error);
            // TODO: Show error toast
        } finally {
            setLoading(false);
        }
    };

    const selectedChargeType = CHARGE_TYPES.find(ct => ct.id === formData.charge_type_id);
    const totalAmount = formData.amount * formData.quantity;
    const existingCharges = admission.charges || [];
    const grandTotal = existingCharges.reduce((sum, charge) => sum + charge.total_amount, 0) + totalAmount;

    const isFormValid = () => {
        return (
            formData.charge_type_id !== '' &&
            formData.description.trim() !== '' &&
            formData.amount > 0 &&
            formData.quantity > 0
        );
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Accommodation': 'bg-blue-100 text-blue-800',
            'Nursing': 'bg-green-100 text-green-800',
            'Medical': 'bg-purple-100 text-purple-800',
            'Diagnostic': 'bg-orange-100 text-orange-800',
            'Pharmacy': 'bg-pink-100 text-pink-800',
            'Therapy': 'bg-indigo-100 text-indigo-800',
            'Supplies': 'bg-gray-100 text-gray-800',
            'Emergency': 'bg-red-100 text-red-800',
            'Miscellaneous': 'bg-yellow-100 text-yellow-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Charge</DialogTitle>
                </DialogHeader>

                {/* Patient and Admission Summary */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-blue-800">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">
                                        {admission.patient?.first_name} {admission.patient?.last_name}
                                    </span>
                                </div>
                                <div className="text-blue-700 text-sm">
                                    Room {admission.room?.room_number} - Bed {admission.bed?.bed_number}
                                </div>
                                <div className="text-blue-700 text-sm">
                                    Admitted: {format(new Date(admission.admission_date), 'dd MMM yyyy')}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="font-medium">Current Total</span>
                                </div>
                                <div className="text-blue-900 font-bold text-lg">
                                    ₹{existingCharges.reduce((sum, charge) => sum + charge.total_amount, 0).toLocaleString()}
                                </div>
                                <div className="text-blue-700 text-sm">
                                    {existingCharges.length} charge(s)
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Charge Type Selection */}
                    <div>
                        <Label htmlFor="charge_type">Charge Type *</Label>
                        <Select
                            value={formData.charge_type_id}
                            onValueChange={handleChargeTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select charge type" />
                            </SelectTrigger>
                            <SelectContent>
                                {CHARGE_TYPES.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        <div className="flex items-center justify-between w-full">
                                            <div>
                                                <div className="font-medium">{type.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    ₹{type.default_amount} {type.unit}
                                                </div>
                                            </div>
                                            <Badge className={getCategoryColor(type.category)}>
                                                {type.category}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected Charge Type Info */}
                    {selectedChargeType && (
                        <Card className="bg-gray-50 border-gray-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">{selectedChargeType.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            Category: {selectedChargeType.category}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Standard rate: ₹{selectedChargeType.default_amount} {selectedChargeType.unit}
                                        </p>
                                    </div>
                                    <Badge className={getCategoryColor(selectedChargeType.category)}>
                                        {selectedChargeType.category}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Charge description..."
                            required
                        />
                    </div>

                    {/* Amount and Quantity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="amount">Unit Amount (₹) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="quantity">Quantity *</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={formData.quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                                    className="text-center"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Calculation Summary */}
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Calculator className="h-5 w-5 text-green-600" />
                                <h4 className="font-medium text-green-900">Charge Calculation</h4>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-green-800">Unit Amount:</span>
                                    <span className="font-medium">₹{formData.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-800">Quantity:</span>
                                    <span className="font-medium">{formData.quantity}</span>
                                </div>
                                <div className="flex justify-between border-t border-green-200 pt-2">
                                    <span className="text-green-800 font-medium">Total Amount:</span>
                                    <span className="font-bold text-green-900">₹{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grand Total Preview */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium text-blue-900">Updated Bill Total</h4>
                                    <p className="text-sm text-blue-700">
                                        Current: ₹{existingCharges.reduce((sum, charge) => sum + charge.total_amount, 0).toLocaleString()} + New: ₹{totalAmount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-900">
                                        ₹{grandTotal.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-blue-700">
                                        {existingCharges.length + 1} total charges
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Additional notes about this charge..."
                            rows={2}
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
                            {loading ? 'Adding...' : `Add Charge (₹${totalAmount.toLocaleString()})`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddChargeForm;
