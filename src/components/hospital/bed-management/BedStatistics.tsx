import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Bed,
    Users,
    Building2,
    Activity,
    TrendingUp,
    Calendar
} from "lucide-react";
import { useBedApi } from "@/hooks/useBedApi";
import { useRoomApi } from "@/hooks/useRoomApi";
import { useAdmissionApi } from "@/hooks/useAdmissionApi";
import {
    BedStatistics as BedStatsType,
    RoomStatistics as RoomStatsType,
    AdmissionStatistics as AdmissionStatsType
} from "@/types/bedManagement";

const BedStatistics: React.FC = () => {
    const { getBedStatistics } = useBedApi();
    const { getRoomStatistics } = useRoomApi();
    const { getAdmissionStatistics } = useAdmissionApi();

    const [bedStats, setBedStats] = useState<BedStatsType | null>(null);
    const [roomStats, setRoomStats] = useState<RoomStatsType | null>(null);
    const [admissionStats, setAdmissionStats] = useState<AdmissionStatsType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllStatistics();
    }, []);

    const loadAllStatistics = async () => {
        setLoading(true);
        try {
            const [bedData, roomData, admissionData] = await Promise.all([
                getBedStatistics(),
                getRoomStatistics(),
                getAdmissionStatistics()
            ]);

            setBedStats(bedData);
            setRoomStats(roomData);
            setAdmissionStats(admissionData);
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Bed Statistics */}
                {bedStats && (
                    <>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Beds</p>
                                        <p className="text-3xl font-bold">{bedStats.total_beds}</p>
                                    </div>
                                    <Bed className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Available Beds</p>
                                        <p className="text-3xl font-bold text-green-600">{bedStats.available_beds}</p>
                                        <p className="text-xs text-gray-500">
                                            {bedStats.total_beds > 0 && `${((bedStats.available_beds / bedStats.total_beds) * 100).toFixed(1)}%`}
                                        </p>
                                    </div>
                                    <Bed className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Occupied Beds</p>
                                        <p className="text-3xl font-bold text-red-600">{bedStats.occupied_beds}</p>
                                        <p className="text-xs text-gray-500">
                                            {bedStats.total_beds > 0 && `${((bedStats.occupied_beds / bedStats.total_beds) * 100).toFixed(1)}%`}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                                        <p className="text-3xl font-bold">{bedStats.occupancy_rate.toFixed(1)}%</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${bedStats.occupancy_rate}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Activity className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Room Statistics */}
            {roomStats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Room Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{roomStats.total_rooms}</p>
                                <p className="text-sm text-gray-600">Total Rooms</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{roomStats.available_rooms}</p>
                                <p className="text-sm text-gray-600">Available</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{roomStats.occupied_rooms}</p>
                                <p className="text-sm text-gray-600">Occupied</p>
                            </div>
                        </div>

                        {/* Rooms by Type */}
                        {roomStats.rooms_by_type && roomStats.rooms_by_type.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-medium mb-3">Rooms by Type</h4>
                                <div className="space-y-2">
                                    {roomStats.rooms_by_type.map((type, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm">{type.type}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{type.available}/{type.total}</Badge>
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${type.total > 0 ? (type.occupied / type.total) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rooms by Floor */}
                        {roomStats.rooms_by_floor && roomStats.rooms_by_floor.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-medium mb-3">Rooms by Floor</h4>
                                <div className="space-y-2">
                                    {roomStats.rooms_by_floor.map((floor, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm">Floor {floor.floor}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{floor.available}/{floor.total}</Badge>
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${floor.total > 0 ? (floor.occupied / floor.total) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Admission Statistics */}
            {admissionStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Today's Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">New Admissions</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {admissionStats.today_admissions}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Discharges</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {admissionStats.today_discharges}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Active Admissions</span>
                                    <span className="text-2xl font-bold text-orange-600">
                                        {admissionStats.active_admissions}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Avg. Length of Stay</span>
                                    <span className="text-2xl font-bold">
                                        {admissionStats.average_length_of_stay.toFixed(1)} days
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Admission Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Admissions by Type */}
                            {admissionStats.admissions_by_type && admissionStats.admissions_by_type.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="font-medium">By Type</h4>
                                    {admissionStats.admissions_by_type.map((type, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm">{type.type}</span>
                                            <Badge variant="outline">{type.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Beds by Type */}
            {bedStats && bedStats.beds_by_type && bedStats.beds_by_type.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bed className="h-5 w-5" />
                            Bed Distribution by Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {bedStats.beds_by_type.map((type, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <h4 className="font-medium mb-2">{type.type}</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Total:</span>
                                            <span className="font-medium">{type.total}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Available:</span>
                                            <span className="font-medium text-green-600">{type.available}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Occupied:</span>
                                            <span className="font-medium text-red-600">{type.occupied}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${type.total > 0 ? (type.occupied / type.total) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BedStatistics;
