import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bed, 
  Users, 
  MapPin, 
  DollarSign, 
  Settings,
  Eye
} from "lucide-react";
import { Room } from "@/types/bedManagement";

interface RoomCardProps {
  room: Room;
  onView?: (room: Room) => void;
  onEdit?: (room: Room) => void;
  onManageBeds?: (room: Room) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onView,
  onEdit,
  onManageBeds
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

  const occupiedBeds = room.beds?.filter(bed => bed.status === 'occupied').length || 0;
  const totalBeds = room.beds?.length || room.capacity;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Room {room.room_number}
          </CardTitle>
          <Badge className={getStatusColor(room.status)}>
            {room.status}
          </Badge>
        </div>
        {room.room_type && (
          <p className="text-sm text-gray-600 font-medium">
            {room.room_type.name}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Room Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>Floor {room.floor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-gray-500" />
            <span>{occupiedBeds}/{totalBeds} beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Capacity: {room.capacity}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>₹{room.daily_rate}/day</span>
          </div>
        </div>

        {/* Building */}
        {room.building && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Building:</span> {room.building}
          </div>
        )}

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Amenities:</p>
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {room.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{room.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {room.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Bed Occupancy Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Bed Occupancy</span>
            <span className="font-medium">
              {Math.round((occupiedBeds / totalBeds) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(occupiedBeds / totalBeds) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(room)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          
          {onManageBeds && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageBeds(room)}
              className="flex-1"
            >
              <Bed className="h-4 w-4 mr-1" />
              Beds
            </Button>
          )}
          
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(room)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
