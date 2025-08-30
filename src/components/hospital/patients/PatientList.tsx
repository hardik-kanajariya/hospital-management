import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom'
import {
    UsersIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSimpleIcon,
    EyeIcon,
    PhoneIcon,
    CalendarIcon,
    FunnelIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    UserIcon,
    WarningIcon,
    HeartIcon,
    ShieldIcon,
    CloudArrowUpIcon,
} from '@phosphor-icons/react';
import { usePatientApi } from '@/hooks/usePatientApi'
import { Patient, PatientSearchParams } from '@/types/patient'

export default function PatientList() {
    const navigate = useNavigate()
    const {
        patients,
        loading,
        error,
        pagination,
        fetchPatients,
        deletePatient,
        getPatientStats
    } = usePatientApi()

    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState<PatientSearchParams>({
        page: 1,
        limit: 20,
        sort_by: 'created_at',
        sort_order: 'desc'
    })
    const [showFilters, setShowFilters] = useState(false)
    const [stats, setStats] = useState<any>(null)

    // Load patient statistics
    useEffect(() => {
        getPatientStats().then(setStats).catch(console.error)
    }, [getPatientStats])

    // Apply filters and search
    const handleSearch = () => {
        const searchFilters: PatientSearchParams = {
            ...filters,
            search: searchTerm.trim() || undefined,
            page: 1
        }
        fetchPatients(searchFilters)
    }

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('')
        setFilters({
            page: 1,
            limit: 20,
            sort_by: 'created_at',
            sort_order: 'desc'
        })
        fetchPatients({
            page: 1,
            limit: 20,
            sort_by: 'created_at',
            sort_order: 'desc'
        })
    }

    // Handle pagination
    const handlePageChange = (page: number) => {
        const newFilters = { ...filters, page }
        setFilters(newFilters)
        fetchPatients(newFilters)
    }

    // Handle sort
    const handleSort = (field: 'name' | 'created_at' | 'patient_id') => {
        const newOrder: 'asc' | 'desc' = filters.sort_by === field && filters.sort_order === 'asc' ? 'desc' : 'asc'
        const newFilters = { ...filters, sort_by: field, sort_order: newOrder }
        setFilters(newFilters)
        fetchPatients(newFilters)
    }

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth: string) => {
        return Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    }

    // Handle delete patient
    const handleDelete = async (patient: Patient) => {
        if (window.confirm(`Are you sure you want to delete patient ${patient.name}? This action cannot be undone.`)) {
            try {
                await deletePatient(patient.id)
                // Refresh current page
                fetchPatients(filters)
            } catch (error) {
                console.error('Error deleting patient:', error)
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold">Patient Management</h1>
                </div>

                <Button onClick={() => navigate('/patients/create')}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add New Patient
                </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Patients</p>
                                    <p className="text-2xl font-bold">{stats.totalPatients || 0}</p>
                                </div>
                                <UsersIcon className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">New This Month</p>
                                    <p className="text-2xl font-bold">{stats.newPatientsThisMonth || 0}</p>
                                </div>
                                <CalendarIcon className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Recent Registrations</p>
                                    <p className="text-2xl font-bold">{stats.recentRegistrations || 0}</p>
                                </div>
                                <UsersIcon className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Monthly Growth</p>
                                    <p className="text-2xl font-bold">{stats.growth?.monthly || 0}%</p>
                                </div>
                                <ArrowUpIcon className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search by name, phone, patient ID, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={handleSearch}>
                                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                                <FunnelIcon className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                            <Button variant="outline" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <label className="text-sm font-medium">Gender</label>
                                    <Select
                                        value={filters.gender || ''}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value || undefined }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All</SelectItem>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Blood Group</label>
                                    <Select
                                        value={filters.blood_group || ''}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, blood_group: value || undefined }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All</SelectItem>
                                            <SelectItem value="A+">A+</SelectItem>
                                            <SelectItem value="A-">A-</SelectItem>
                                            <SelectItem value="B+">B+</SelectItem>
                                            <SelectItem value="B-">B-</SelectItem>
                                            <SelectItem value="AB+">AB+</SelectItem>
                                            <SelectItem value="AB-">AB-</SelectItem>
                                            <SelectItem value="O+">O+</SelectItem>
                                            <SelectItem value="O-">O-</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Min Age</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.age_min || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, age_min: parseInt(e.target.value) || undefined }))}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Max Age</label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={filters.age_max || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, age_max: parseInt(e.target.value) || undefined }))}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Has Allergies</label>
                                    <Select
                                        value={filters.has_allergies?.toString() || ''}
                                        onValueChange={(value) => setFilters(prev => ({
                                            ...prev,
                                            has_allergies: value === '' ? undefined : value === 'true'
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All</SelectItem>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Has Chronic Conditions</label>
                                    <Select
                                        value={filters.has_chronic_conditions?.toString() || ''}
                                        onValueChange={(value) => setFilters(prev => ({
                                            ...prev,
                                            has_chronic_conditions: value === '' ? undefined : value === 'true'
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All</SelectItem>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Patients Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Patients ({pagination.total || 0})</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Page {pagination.current_page || 1} of {pagination.last_page || 1}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p>Loading patients...</p>
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No patients found</p>
                            {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('patient_id')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Patient ID
                                                {filters.sort_by === 'patient_id' && (
                                                    filters.sort_order === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Name
                                                {filters.sort_by === 'name' && (
                                                    filters.sort_order === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Blood Group</TableHead>
                                        <TableHead>Medical Info</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.map((patient) => (
                                        <TableRow key={patient.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">{patient.patient_id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{patient.name}</p>
                                                    <p className="text-sm text-muted-foreground capitalize">{patient.gender}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="text-sm flex items-center gap-1">
                                                        <PhoneIcon className="w-3 h-3" />
                                                        {patient.phone}
                                                    </p>
                                                    {patient.email && (
                                                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {calculateAge(patient.date_of_birth)} years
                                            </TableCell>
                                            <TableCell>
                                                {patient.blood_group && (
                                                    <Badge variant="outline">{patient.blood_group}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {patient.allergies && patient.allergies.length > 0 && (
                                                        <Badge variant="outline" className="text-red-600 border-red-600">
                                                            <WarningIcon className="w-3 h-3 mr-1" />
                                                            {patient.allergies.length} allergies
                                                        </Badge>
                                                    )}
                                                    {patient.chronic_conditions && patient.chronic_conditions.length > 0 && (
                                                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                            <HeartIcon className="w-3 h-3 mr-1" />
                                                            {patient.chronic_conditions.length} conditions
                                                        </Badge>
                                                    )}
                                                    {patient.insurance_info && (
                                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                                            <ShieldIcon className="w-3 h-3 mr-1" />
                                                            Insured
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {!patient.synced && (
                                                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                            <CloudArrowUpIcon className="w-3 h-3 mr-1" />
                                                            Pending
                                                        </Badge>
                                                    )}
                                                    {patient.local_changes && (
                                                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                                                            Modified
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/patients/${patient.id}`)}
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/patients/${patient.id}/edit`)}
                                                    >
                                                        <PencilSimpleIcon className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(patient)}
                                                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                    >
                                                        <WarningIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                        {pagination.total} patients
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                        >
                                            Previous
                                        </Button>

                                        {/* Page numbers */}
                                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                            let pageNum: number;
                                            if (pagination.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.current_page >= pagination.last_page - 2) {
                                                pageNum = pagination.last_page - 4 + i;
                                            } else {
                                                pageNum = pagination.current_page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={pageNum === pagination.current_page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <WarningIcon className="w-4 h-4" />
                            <p className="text-sm">Error: {error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
