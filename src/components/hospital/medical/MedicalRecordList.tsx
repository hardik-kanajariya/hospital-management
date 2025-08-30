import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    FileTextIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    UserIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    StethoscopeIcon,
    CalendarIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { usePatientApi } from '@/hooks/usePatientApi'
import { useMedicalRecordApi } from '@/hooks/useMedicalRecordApi'
// import CreateMedicalRecord from './CreateMedicalRecord'
// import EditMedicalRecord from './EditMedicalRecord'
// import MedicalRecordView from './MedicalRecordView'

// Medical Record interface
interface MedicalRecord {
    id: string;
    patient_id: string;
    doctor_id: string;
    doctor_name?: string;
    visit_date: string;
    chief_complaint: string;
    present_illness?: string;
    physical_examination?: string;
    diagnosis: string;
    treatment: string;
    prescriptions?: Array<{
        medication: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }>;
    lab_tests?: Array<{
        test_name: string;
        status: 'ordered' | 'pending' | 'completed';
        result?: string;
        notes?: string;
    }>;
    vital_signs?: {
        temperature?: string;
        blood_pressure?: string;
        heart_rate?: string;
        respiratory_rate?: string;
        oxygen_saturation?: string;
        weight?: string;
        height?: string;
    };
    follow_up_date?: string;
    notes?: string;
    status: 'active' | 'completed' | 'archived';
    created_at: string;
    updated_at: string;
}

// Utility functions for formatting
const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'Not specified'
    try {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    } catch {
        return 'Invalid date'
    }
}

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'completed':
            return 'bg-green-100 text-green-800 border-green-200'
        case 'archived':
            return 'bg-gray-100 text-gray-800 border-gray-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

export default function MedicalRecordList() {
    const { medicalRecords, deleteMedicalRecord, loading } = useMedicalRecordApi()
    const { patients } = usePatientApi()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showViewDialog, setShowViewDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Get patient name by ID
    const getPatientName = (patientId: string): string => {
        const patient = patients.find(p => p.id === patientId)
        if (!patient) return 'Unknown Patient'
        return patient.name || 'Unknown Patient'
    }

    // Filter medical records
    const filteredRecords = medicalRecords?.filter(record => {
        const patientName = getPatientName(record.patient_id || '')
        const matchesSearch =
            patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || record.status === statusFilter

        const today = new Date()
        const recordDate = new Date(record.visit_date || '')
        let matchesDate = true

        if (dateFilter === 'today') {
            matchesDate = recordDate.toDateString() === today.toDateString()
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = recordDate >= weekAgo && recordDate <= today
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDate = recordDate >= monthAgo && recordDate <= today
        }

        return matchesSearch && matchesStatus && matchesDate
    }) || []

    const handleDeleteRecord = async () => {
        if (!selectedRecord?.id) return

        try {
            await deleteMedicalRecord(selectedRecord.id)
            toast.success('Medical record deleted successfully')
            setShowDeleteDialog(false)
            setSelectedRecord(null)
        } catch (error) {
            toast.error('Failed to delete medical record')
        }
    }

    const handleViewRecord = (record: MedicalRecord) => {
        setSelectedRecord(record)
        setShowViewDialog(true)
    }

    const handleEditRecord = (record: MedicalRecord) => {
        setSelectedRecord(record)
        setShowEditDialog(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading medical records...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Medical Records</h1>
                    <p className="text-muted-foreground">Manage patient medical records and consultation notes</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Add Medical Record
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by patient, doctor, complaint, or diagnosis..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Medical Records Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileTextIcon className="w-5 h-5" />
                        Medical Records ({filteredRecords.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-8">
                            <FileTextIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No medical records found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                                    ? 'Try adjusting your search criteria'
                                    : 'Create your first medical record to get started'
                                }
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Medical Record
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Visit Date</TableHead>
                                    <TableHead>Chief Complaint</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{getPatientName(record.patient_id || '')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <StethoscopeIcon className="w-4 h-4 text-muted-foreground" />
                                                <span>{record.doctor_name || 'Not assigned'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-sm">{formatDate(record.visit_date)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-48 truncate">
                                            {record.chief_complaint || 'Not specified'}
                                        </TableCell>
                                        <TableCell className="max-w-48 truncate">
                                            {record.diagnosis || 'Pending diagnosis'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(record.status || '')}>
                                                {record.status || 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewRecord(record)}
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditRecord(record)}
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedRecord(record)
                                                        setShowDeleteDialog(true)
                                                    }}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Medical Record Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Medical Record</DialogTitle>
                        <DialogDescription>
                            Add a new medical record for patient consultation
                        </DialogDescription>
                    </DialogHeader>
                    {/* TODO: Add CreateMedicalRecord component */}
                    <div className="p-4 text-center text-muted-foreground">
                        Create Medical Record form will be available soon
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Medical Record Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Medical Record</DialogTitle>
                        <DialogDescription>
                            Update medical record information
                        </DialogDescription>
                    </DialogHeader>
                    {/* TODO: Add EditMedicalRecord component */}
                    <div className="p-4 text-center text-muted-foreground">
                        Edit Medical Record form will be available soon
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Medical Record Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Medical Record Details</DialogTitle>
                        <DialogDescription>
                            View complete medical record information
                        </DialogDescription>
                    </DialogHeader>
                    {/* TODO: Add MedicalRecordView component */}
                    <div className="p-4 text-center text-muted-foreground">
                        Medical Record details view will be available soon
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Medical Record</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this medical record? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteRecord}>
                            Delete Record
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
