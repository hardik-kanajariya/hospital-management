import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Calendar, 
  MapPin, 
  FileText,
  Settings,
  Eye
} from "lucide-react";
import { Bed } from "@/types/bedManagement";

interface BedCardProps {
  bed: Bed;
  onView?: (bed: Bed) => void;
  onEdit?: (bed: Bed) => void;
  onAssign?: (bed: Bed) => void;
  showRoom?: boolean;
}

const BedCard: React.FC<BedCardProps> = ({
  bed,
  onView,
  onEdit,
  onAssign,
  showRoom = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reserved':
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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Bed {bed.bed_number}
          </CardTitle>
          <Badge className={getStatusColor(bed.status)}>
            {bed.status}
          </Badge>
        </div>
        {bed.bed_type && (
          <p className="text-sm text-gray-600 font-medium">
            {bed.bed_type.name}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Room Information */}
        {showRoom && bed.room && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>Room {bed.room.room_number} - Floor {bed.room.floor}</span>
          </div>
        )}

        {/* Current Patient */}
        {bed.status === 'occupied' && bed.current_patient && (
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                {bed.current_patient.first_name} {bed.current_patient.last_name}
              </span>
            </div>
            {bed.current_admission && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Calendar className="h-4 w-4" />
                <span>
                  Admitted: {formatDate(bed.current_admission.admission_date)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {bed.features && bed.features.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Features:</p>
            <div className="flex flex-wrap gap-1">
              {bed.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {bed.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{bed.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {bed.notes && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Notes:</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 pl-6">
              {bed.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(bed)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          
          {onAssign && bed.status === 'available' && (
            <Button
              size="sm"
              onClick={() => onAssign(bed)}
              className="flex-1"
            >
              <User className="h-4 w-4 mr-1" />
              Assign
            </Button>
          )}
          
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bed)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          Updated: {formatDate(bed.updated_at)}
        </div>
      </CardContent>
    </Card>
  );
};

export default BedCard;
