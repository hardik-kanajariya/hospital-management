import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    FileTextIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilSimpleIcon,
    CalendarIcon,
    UserIcon,
    StethoscopeIcon
} from '@phosphor-icons/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useMedicalRecordApi } from '@/hooks/useMedicalRecordApi'
import { usePatientApi } from '@/hooks/usePatientApi'

interface MedicalRecord {
    id: string
    record_id: string
    patient_id: string
    doctor_id: string
    visit_date: string
    diagnosis: string
    treatment: string
    notes?: string
    created_at: string
    updated_at: string
    patient?: {
        id: string
        name: string
        patient_id: string
    }
    doctor?: {
        id: string
        name: string
        specialization: string
    }
}

export default function MedicalRecordsList() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const patientId = searchParams.get('patientId')

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPatient, setSelectedPatient] = useState<string>(patientId || 'all-patients')
    const [selectedDoctor, setSelectedDoctor] = useState<string>('all-doctors')
    const [dateRange, setDateRange] = useState<string>('all-dates')

    const { patients } = usePatientApi()
    const {
        medicalRecords,
        loading,
        fetchMedicalRecords,
        fetchPatientMedicalHistory,
        searchMedicalRecords
    } = useMedicalRecordApi()

    // Debug logging
    useEffect(() => {
        console.log('🏥 MedicalRecordsList state:', {
            medicalRecords,
            loading,
            patientId,
            selectedPatient,
            recordsCount: medicalRecords?.length
        });
    }, [medicalRecords, loading, patientId, selectedPatient])

    // Update selected patient when patientId changes
    useEffect(() => {
        if (patientId) {
            setSelectedPatient(patientId)
        }
    }, [patientId])

    // Fetch medical records
    useEffect(() => {
        if (patientId) {
            // Fetch specific patient's medical history
            fetchPatientMedicalHistory(patientId)
        } else {
            // Fetch all medical records
            fetchMedicalRecords()
        }
    }, [patientId, fetchMedicalRecords, fetchPatientMedicalHistory])

    // Search and filter records
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Convert placeholder values to empty for API calls
            const actualSelectedPatient = selectedPatient === 'all-patients' ? '' : selectedPatient
            const actualSelectedDoctor = selectedDoctor === 'all-doctors' ? '' : selectedDoctor
            const actualDateRange = dateRange === 'all-dates' ? '' : dateRange

            if (searchTerm || actualSelectedPatient || actualSelectedDoctor || actualDateRange) {
                const params: any = {}

                if (searchTerm) params.search = searchTerm
                if (actualSelectedPatient) params.patientId = actualSelectedPatient
                if (actualSelectedDoctor) params.doctorId = actualSelectedDoctor

                if (actualDateRange) {
                    const today = new Date()
                    let dateFrom = new Date()

                    switch (actualDateRange) {
                        case 'today':
                            dateFrom.setHours(0, 0, 0, 0)
                            params.dateFrom = dateFrom.toISOString().split('T')[0]
                            break
                        case 'week':
                            dateFrom.setDate(today.getDate() - 7)
                            params.dateFrom = dateFrom.toISOString().split('T')[0]
                            break
                        case 'month':
                            dateFrom.setMonth(today.getMonth() - 1)
                            params.dateFrom = dateFrom.toISOString().split('T')[0]
                            break
                    }
                }

                if (actualSelectedPatient && !searchTerm && !actualSelectedDoctor && !actualDateRange) {
                    // If only patient is selected, use patient history endpoint
                    fetchPatientMedicalHistory(actualSelectedPatient)
                } else {
                    // Use general search/filter endpoint
                    fetchMedicalRecords(params)
                }
            } else {
                // No filters, fetch all records
                if (patientId) {
                    fetchPatientMedicalHistory(patientId)
                } else {
                    fetchMedicalRecords()
                }
            }
        }, 300) // Debounce search

        return () => clearTimeout(timeoutId)
    }, [searchTerm, selectedPatient, selectedDoctor, dateRange, patientId, fetchMedicalRecords, fetchPatientMedicalHistory])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading medical records...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileTextIcon className="w-6 h-6 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Medical Records</h1>
                        <p className="text-muted-foreground">
                            {patientId ? 'Patient Medical History' : 'Manage all medical records'}
                        </p>
                    </div>
                </div>
                <Button onClick={() => navigate('/medical-records/create')}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Medical Record
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters & Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Input
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Patients" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all-patients">All Patients</SelectItem>
                                {patients.filter(patient => patient.id && patient.id.trim() !== '').map(patient => (
                                    <SelectItem key={patient.id} value={patient.id}>
                                        {patient.name} ({patient.patient_id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Doctors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all-doctors">All Doctors</SelectItem>
                                {/* This would be populated with actual doctors */}
                                <SelectItem value="doctor_1">Dr. Smith</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all-dates">All Dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Records List */}
            <div className="grid gap-4">
                {medicalRecords.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <FileTextIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Medical Records Found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || (selectedPatient !== 'all-patients') || (selectedDoctor !== 'all-doctors') || (dateRange !== 'all-dates')
                                    ? 'Try adjusting your filters'
                                    : 'Start by creating a new medical record'
                                }
                            </p>
                            <Button onClick={() => navigate('/medical-records/create')}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create First Record
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    medicalRecords.map(record => (
                        <Card key={record.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <Badge variant="outline">{record.record_id}</Badge>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <CalendarIcon className="w-4 h-4" />
                                                {formatDate(record.visit_date)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <UserIcon className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">Patient</span>
                                                </div>
                                                <p className="text-sm">
                                                    {record.patient?.name} ({record.patient?.patient_id})
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <StethoscopeIcon className="w-4 h-4 text-green-500" />
                                                    <span className="font-medium">Doctor</span>
                                                </div>
                                                <p className="text-sm">
                                                    {record.doctor?.name}
                                                    {record.doctor?.specialization && (
                                                        <span className="text-muted-foreground">
                                                            {' '}• {record.doctor.specialization}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="font-medium mb-1">Diagnosis</h4>
                                            <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-1">Treatment</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {record.treatment}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/medical-records/${record.id}`)}
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/medical-records/${record.id}/edit`)}
                                        >
                                            <PencilSimpleIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
