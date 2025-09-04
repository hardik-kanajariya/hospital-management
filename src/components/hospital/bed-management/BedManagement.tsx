import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List,
  Bed,
  Users,
  Building2,
  AlertTriangle
} from "lucide-react";
import { useBedApi } from "@/hooks/useBedApi";
import { useRoomApi } from "@/hooks/useRoomApi";
import { Bed as BedType, BedStatistics, Room } from "@/types/bedManagement";
import BedCard from './BedCard';
import CreateBedForm from './CreateBedForm';

interface BedManagementProps {
  roomId?: string; // If provided, show beds for specific room only
}

const BedManagement: React.FC<BedManagementProps> = ({ roomId }) => {
  const { 
    beds, 
    loading, 
    error, 
    refreshBeds, 
    getBedStatistics,
    getAvailableBeds,
    getBedsByRoom,
    updateBedStatus 
  } = useBedApi();

  const { rooms, refreshRooms } = useRoomApi();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>(roomId || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statistics, setStatistics] = useState<BedStatistics | null>(null);
  const [selectedBed, setSelectedBed] = useState<BedType | null>(null);

  useEffect(() => {
    if (roomId) {
      loadBedsByRoom(roomId);
    } else {
      refreshBeds();
    }
    refreshRooms();
    loadStatistics();
  }, [roomId]);

  const loadBedsByRoom = async (roomId: string) => {
    try {
      await getBedsByRoom(roomId);
    } catch (error) {
      console.error('Error loading beds by room:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getBedStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading bed statistics:', error);
    }
  };

  const filteredBeds = beds?.filter((bed: BedType) => {
    const matchesSearch = 
      bed.bed_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.room?.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.bed_type?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || bed.status === filterStatus;
    const matchesRoom = filterRoom === 'all' || bed.room_id === filterRoom;
    
    return matchesSearch && matchesStatus && matchesRoom;
  }) || [];

  const handleBedCreated = () => {
    setShowCreateForm(false);
    if (roomId) {
      loadBedsByRoom(roomId);
    } else {
      refreshBeds();
    }
    loadStatistics();
  };

  const handleViewBed = (bed: BedType) => {
    setSelectedBed(bed);
    // TODO: Open bed details modal/drawer
  };

  const handleEditBed = (bed: BedType) => {
    // TODO: Open edit bed form
    console.log('Edit bed:', bed);
  };

  const handleAssignBed = (bed: BedType) => {
    // TODO: Open patient assignment form
    console.log('Assign bed:', bed);
  };

  const handleStatusChange = async (bed: BedType, newStatus: string) => {
    try {
      await updateBedStatus(bed.id, newStatus);
      if (roomId) {
        loadBedsByRoom(roomId);
      } else {
        refreshBeds();
      }
      loadStatistics();
    } catch (error) {
      console.error('Error updating bed status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading beds: {error}</p>
          <Button onClick={() => roomId ? loadBedsByRoom(roomId) : refreshBeds()} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {!roomId && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Beds</p>
                  <p className="text-2xl font-bold">{statistics.total_beds}</p>
                </div>
                <Bed className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.available_beds}</p>
                </div>
                <Bed className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.occupied_beds}</p>
                </div>
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.maintenance_beds}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold">{statistics.occupancy_rate.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full" 
                      style={{ width: `${statistics.occupancy_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold">
              {roomId ? `Bed Management - Room ${rooms?.find((r: Room) => r.id === roomId)?.room_number || roomId}` : 'Bed Management'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Bed
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search beds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            
            {!roomId && (
              <Select value={filterRoom} onValueChange={setFilterRoom}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms?.map((room: Room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.room_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredBeds.length} of {beds?.length || 0} beds
            </p>
            {(searchTerm || filterStatus !== 'all' || (!roomId && filterRoom !== 'all')) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  if (!roomId) setFilterRoom('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Beds Grid/List */}
      {filteredBeds.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No beds found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' || (!roomId && filterRoom !== 'all')
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first bed'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (!roomId || filterRoom === 'all') && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Bed
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredBeds.map((bed: BedType) => (
            <BedCard
              key={bed.id}
              bed={bed}
              onView={handleViewBed}
              onEdit={handleEditBed}
              onAssign={handleAssignBed}
              showRoom={!roomId}
            />
          ))}
        </div>
      )}

      {/* Create Bed Form Modal */}
      {showCreateForm && (
        <CreateBedForm
          roomId={roomId}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleBedCreated}
        />
      )}
    </div>
  );
};

export default BedManagement;
