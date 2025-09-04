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
    Calendar,
    Users,
    Activity,
    Clock,
    UserPlus
} from "lucide-react";
import { useAdmissionApi } from "@/hooks/useAdmissionApi";
import { useBedApi } from "@/hooks/useBedApi";
import { useRoomApi } from "@/hooks/useRoomApi";
import { Admission, AdmissionStatistics } from "@/types/bedManagement";
import AdmissionCard from './AdmissionCard';
import AdmitPatientForm from './AdmitPatientForm';

const AdmissionManagement: React.FC = () => {
    const {
        admissions,
        loading,
        error,
        refreshAdmissions,
        getAdmissionStatistics,
        getActiveAdmissions,
        dischargePatient,
        transferPatient,
        addCharge
    } = useAdmissionApi();

    const { getAvailableBeds } = useBedApi();
    const { getAvailableRooms } = useRoomApi();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDateRange, setFilterDateRange] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showAdmitForm, setShowAdmitForm] = useState(false);
    const [showDischargeForm, setShowDischargeForm] = useState(false);
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [showChargeForm, setShowChargeForm] = useState(false);
    const [statistics, setStatistics] = useState<AdmissionStatistics | null>(null);
    const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

    useEffect(() => {
        refreshAdmissions();
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const stats = await getAdmissionStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Error loading admission statistics:', error);
        }
    };

    const filteredAdmissions = admissions?.filter((admission: Admission) => {
        const matchesSearch =
            admission.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admission.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admission.bed?.bed_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admission.room?.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admission.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || admission.status === filterStatus;

        let matchesDateRange = true;
        if (filterDateRange !== 'all') {
            const admissionDate = new Date(admission.admission_date);
            const today = new Date();

            switch (filterDateRange) {
                case 'today':
                    matchesDateRange = admissionDate.toDateString() === today.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDateRange = admissionDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    matchesDateRange = admissionDate >= monthAgo;
                    break;
            }
        }

        return matchesSearch && matchesStatus && matchesDateRange;
    }) || [];

    const handleAdmissionCreated = () => {
        setShowAdmitForm(false);
        refreshAdmissions();
        loadStatistics();
    };

    const handleViewAdmission = (admission: Admission) => {
        setSelectedAdmission(admission);
        // TODO: Open admission details modal/drawer
    };

    const handleDischargeAdmission = (admission: Admission) => {
        setSelectedAdmission(admission);
        setShowDischargeForm(true);
    };

    const handleTransferAdmission = (admission: Admission) => {
        setSelectedAdmission(admission);
        setShowTransferForm(true);
    };

    const handleAddCharge = (admission: Admission) => {
        setSelectedAdmission(admission);
        setShowChargeForm(true);
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
                    <p className="text-red-600">Error loading admissions: {error}</p>
                    <Button onClick={refreshAdmissions} className="mt-2">
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
                                    <p className="text-sm font-medium text-gray-600">Active Admissions</p>
                                    <p className="text-2xl font-bold">{statistics.active_admissions}</p>
                                </div>
                                <Activity className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Today's Admissions</p>
                                    <p className="text-2xl font-bold text-green-600">{statistics.today_admissions}</p>
                                </div>
                                <UserPlus className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Today's Discharges</p>
                                    <p className="text-2xl font-bold text-orange-600">{statistics.today_discharges}</p>
                                </div>
                                <Users className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg. Length of Stay</p>
                                    <p className="text-2xl font-bold">{statistics.average_length_of_stay.toFixed(1)} days</p>
                                </div>
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Header and Actions */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-semibold">Admission Management</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setShowAdmitForm(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Admit Patient
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
                                placeholder="Search patients, beds, diagnosis..."
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
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="discharged">Discharged</SelectItem>
                                <SelectItem value="transferred">Transferred</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
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
                            Showing {filteredAdmissions.length} of {admissions?.length || 0} admissions
                        </p>
                        {(searchTerm || filterStatus !== 'all' || filterDateRange !== 'all') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                    setFilterDateRange('all');
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Admissions Grid/List */}
            {filteredAdmissions.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No admissions found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || filterStatus !== 'all' || filterDateRange !== 'all'
                                ? 'Try adjusting your search criteria'
                                : 'Start by admitting a patient'
                            }
                        </p>
                        {!searchTerm && filterStatus === 'all' && filterDateRange === 'all' && (
                            <Button onClick={() => setShowAdmitForm(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Admit Patient
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                    {filteredAdmissions.map((admission: Admission) => (
                        <AdmissionCard
                            key={admission.id}
                            admission={admission}
                            onView={handleViewAdmission}
                            onDischarge={handleDischargeAdmission}
                            onTransfer={handleTransferAdmission}
                            onAddCharge={handleAddCharge}
                        />
                    ))}
                </div>
            )}

            {/* Admit Patient Form Modal */}
            {showAdmitForm && (
                <AdmitPatientForm
                    onClose={() => setShowAdmitForm(false)}
                    onSuccess={handleAdmissionCreated}
                />
            )}

            {/* TODO: Add other modals when components are created */}
            {/* Discharge Form */}
            {/* Transfer Form */}
            {/* Add Charge Form */}
        </div>
    );
};

export default AdmissionManagement;
