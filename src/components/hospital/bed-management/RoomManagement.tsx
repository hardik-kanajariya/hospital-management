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
    Building2,
    Bed,
    Users
} from "lucide-react";
import { useRoomApi } from "@/hooks/useRoomApi";
import { Room, RoomStatistics } from "@/types/bedManagement";
import RoomCard from './RoomCard';
import CreateRoomForm from './CreateRoomForm';

const RoomManagement: React.FC = () => {
    const {
        rooms,
        loading,
        error,
        refreshRooms,
        getRoomStatistics,
        getRoomsByType,
        getAvailableRooms
    } = useRoomApi();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterFloor, setFilterFloor] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [statistics, setStatistics] = useState<RoomStatistics | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    useEffect(() => {
        refreshRooms();
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const stats = await getRoomStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Error loading room statistics:', error);
        }
    };

    const filteredRooms = rooms?.filter((room: Room) => {
        const matchesSearch =
            room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.room_type?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.building?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
        const matchesFloor = filterFloor === 'all' || room.floor.toString() === filterFloor;

        return matchesSearch && matchesStatus && matchesFloor;
    }) || [];

    const uniqueFloors = Array.from(new Set(rooms?.map((room: Room) => room.floor) || [])).sort();

    const handleRoomCreated = () => {
        setShowCreateForm(false);
        refreshRooms();
        loadStatistics();
    };

    const handleViewRoom = (room: Room) => {
        setSelectedRoom(room);
        // TODO: Open room details modal/drawer
    };

    const handleEditRoom = (room: Room) => {
        // TODO: Open edit room form
        console.log('Edit room:', room);
    };

    const handleManageBeds = (room: Room) => {
        // TODO: Navigate to bed management for this room
        console.log('Manage beds for room:', room);
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
                    <p className="text-red-600">Error loading rooms: {error}</p>
                    <Button onClick={refreshRooms} className="mt-2">
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                                    <p className="text-2xl font-bold">{statistics.total_rooms}</p>
                                </div>
                                <Building2 className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Available</p>
                                    <p className="text-2xl font-bold text-green-600">{statistics.available_rooms}</p>
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
                                    <p className="text-2xl font-bold text-red-600">{statistics.occupied_rooms}</p>
                                </div>
                                <Users className="h-8 w-8 text-red-600" />
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
                        <CardTitle className="text-xl font-semibold">Room Management</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setShowCreateForm(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Room
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
                                placeholder="Search rooms..."
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

                        <Select value={filterFloor} onValueChange={setFilterFloor}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Floor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Floors</SelectItem>
                                {uniqueFloors.map((floor) => (
                                    <SelectItem key={floor} value={floor.toString()}>
                                        Floor {floor}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

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
                            Showing {filteredRooms.length} of {rooms?.length || 0} rooms
                        </p>
                        {(searchTerm || filterStatus !== 'all' || filterFloor !== 'all') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                    setFilterFloor('all');
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Rooms Grid/List */}
            {filteredRooms.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || filterStatus !== 'all' || filterFloor !== 'all'
                                ? 'Try adjusting your search criteria'
                                : 'Get started by creating your first room'
                            }
                        </p>
                        {!searchTerm && filterStatus === 'all' && filterFloor === 'all' && (
                            <Button onClick={() => setShowCreateForm(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Room
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                    {filteredRooms.map((room: Room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            onView={handleViewRoom}
                            onEdit={handleEditRoom}
                            onManageBeds={handleManageBeds}
                        />
                    ))}
                </div>
            )}

            {/* Create Room Form Modal */}
            {showCreateForm && (
                <CreateRoomForm
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={handleRoomCreated}
                />
            )}
        </div>
    );
};

export default RoomManagement;
