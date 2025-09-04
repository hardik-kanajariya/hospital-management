import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    Calendar,
    MapPin,
    FileText,
    DollarSign,
    Clock,
    ArrowRight,
    UserX
} from "lucide-react";
import { Admission } from "@/types/bedManagement";

interface AdmissionCardProps {
    admission: Admission;
    onView?: (admission: Admission) => void;
    onDischarge?: (admission: Admission) => void;
    onTransfer?: (admission: Admission) => void;
    onAddCharge?: (admission: Admission) => void;
}

const AdmissionCard: React.FC<AdmissionCardProps> = ({
    admission,
    onView,
    onDischarge,
    onTransfer,
    onAddCharge
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'discharged':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'transferred':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateLengthOfStay = () => {
        const admissionDate = new Date(admission.admission_date);
        const endDate = admission.actual_discharge_date
            ? new Date(admission.actual_discharge_date)
            : new Date();

        const diffTime = Math.abs(endDate.getTime() - admissionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const totalCharges = admission.charges?.reduce((total, charge) => total + charge.total_amount, 0) || 0;

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                        {admission.patient?.first_name} {admission.patient?.last_name}
                    </CardTitle>
                    <Badge className={getStatusColor(admission.status)}>
                        {admission.status}
                    </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                        Room {admission.room?.room_number} - Bed {admission.bed?.bed_number}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Admission Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Admitted:</span>
                        </div>
                        <p className="text-gray-600 pl-6">
                            {formatDateTime(admission.admission_date)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Length of Stay:</span>
                        </div>
                        <p className="text-gray-600 pl-6">
                            {calculateLengthOfStay()} days
                        </p>
                    </div>
                </div>

                {/* Estimated Discharge */}
                {admission.estimated_discharge_date && !admission.actual_discharge_date && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-900">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Estimated Discharge:</span>
                        </div>
                        <p className="text-blue-700 text-sm mt-1">
                            {formatDate(admission.estimated_discharge_date)}
                        </p>
                    </div>
                )}

                {/* Actual Discharge */}
                {admission.actual_discharge_date && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-900">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Discharged:</span>
                        </div>
                        <p className="text-gray-700 text-sm mt-1">
                            {formatDateTime(admission.actual_discharge_date)}
                        </p>
                    </div>
                )}

                {/* Admission Details */}
                <div className="space-y-3">
                    <div>
                        <span className="text-sm font-medium text-gray-700">Type:</span>
                        <p className="text-sm text-gray-600">{admission.admission_type}</p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-700">Reason:</span>
                        <p className="text-sm text-gray-600">{admission.admission_reason}</p>
                    </div>

                    {admission.diagnosis && (
                        <div>
                            <span className="text-sm font-medium text-gray-700">Diagnosis:</span>
                            <p className="text-sm text-gray-600 line-clamp-2">{admission.diagnosis}</p>
                        </div>
                    )}
                </div>

                {/* Charges Summary */}
                {totalCharges > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-900">Total Charges:</span>
                            </div>
                            <span className="font-bold text-green-900">₹{totalCharges.toLocaleString()}</span>
                        </div>
                        {admission.charges && admission.charges.length > 0 && (
                            <p className="text-sm text-green-700 mt-1">
                                {admission.charges.length} charge(s) recorded
                            </p>
                        )}
                    </div>
                )}

                {/* Notes */}
                {admission.notes && (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Notes:</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 pl-6">
                            {admission.notes}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                {admission.status === 'active' && (
                    <div className="flex gap-2 pt-2">
                        {onView && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onView(admission)}
                                className="flex-1"
                            >
                                View Details
                            </Button>
                        )}

                        {onAddCharge && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddCharge(admission)}
                            >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Add Charge
                            </Button>
                        )}

                        {onTransfer && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onTransfer(admission)}
                            >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                Transfer
                            </Button>
                        )}

                        {onDischarge && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDischarge(admission)}
                            >
                                <UserX className="h-4 w-4 mr-1" />
                                Discharge
                            </Button>
                        )}
                    </div>
                )}

                {/* Read-only buttons for discharged patients */}
                {admission.status !== 'active' && onView && (
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(admission)}
                            className="flex-1"
                        >
                            View Details
                        </Button>
                    </div>
                )}

                {/* Created By */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                    Created by: {admission.created_by_user?.name || 'Unknown'} • {formatDate(admission.created_at)}
                </div>
            </CardContent>
        </Card>
    );
};

export default AdmissionCard;
