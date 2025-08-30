import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    ReceiptIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    UserIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    PrinterIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useBillingApi } from '@/hooks/useBillingApi'
import { usePatientApi } from '@/hooks/usePatientApi'
// import CreateBill from './CreateBill'
// import EditBill from './EditBill'
// import BillView from './BillView'

// Bill interface
interface Bill {
    id: string;
    patient_id: string;
    bill_number: string;
    bill_date: string;
    due_date?: string;
    items: Array<{
        id: string;
        description: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        category: 'consultation' | 'procedure' | 'medication' | 'lab_test' | 'room_charges' | 'other';
    }>;
    subtotal: number;
    discount_amount?: number;
    discount_percentage?: number;
    tax_amount: number;
    tax_percentage: number;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    payment_status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
    payment_method?: string;
    insurance_claim_id?: string;
    notes?: string;
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

const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00'
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount)
}

const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800 border-green-200'
        case 'partially_paid':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'pending':
            return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'overdue':
            return 'bg-red-100 text-red-800 border-red-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

export default function BillList() {
    const { bills, deleteBill, loading } = useBillingApi()
    const { patients } = usePatientApi()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
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

    // Filter bills
    const filteredBills = bills?.filter(bill => {
        const patientName = getPatientName(bill.patient_id || '')
        const matchesSearch =
            patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.notes?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || bill.payment_status === statusFilter

        const today = new Date()
        const billDate = new Date(bill.bill_date || '')
        let matchesDate = true

        if (dateFilter === 'today') {
            matchesDate = billDate.toDateString() === today.toDateString()
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = billDate >= weekAgo && billDate <= today
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDate = billDate >= monthAgo && billDate <= today
        }

        return matchesSearch && matchesStatus && matchesDate
    }) || []

    const handleDeleteBill = async () => {
        if (!selectedBill?.id) return

        try {
            await deleteBill(selectedBill.id)
            toast.success('Bill deleted successfully')
            setShowDeleteDialog(false)
            setSelectedBill(null)
        } catch (error) {
            toast.error('Failed to delete bill')
        }
    }

    const handleViewBill = (bill: Bill) => {
        setSelectedBill(bill)
        setShowViewDialog(true)
    }

    const handleEditBill = (bill: Bill) => {
        setSelectedBill(bill)
        setShowEditDialog(true)
    }

    const handlePrintBill = (bill: Bill) => {
        // TODO: Implement print functionality
        toast.info('Print functionality will be available soon')
    }

    // Calculate summary statistics
    const totalAmount = filteredBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0)
    const totalPaid = filteredBills.reduce((sum, bill) => sum + (bill.paid_amount || 0), 0)
    const totalPending = filteredBills.reduce((sum, bill) => sum + (bill.balance_amount || 0), 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading bills...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Billing & Invoices</h1>
                    <p className="text-muted-foreground">Manage patient bills and payment records</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Create Bill
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <ReceiptIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{filteredBills.length}</p>
                                <p className="text-sm text-muted-foreground">Total Bills</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-3 rounded-full">
                                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-3 rounded-full">
                                <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                                <p className="text-sm text-muted-foreground">Total Paid</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-3 rounded-full">
                                <CurrencyDollarIcon className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
                                <p className="text-sm text-muted-foreground">Total Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                                placeholder="Search by patient name, bill number, or notes..."
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
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
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

            {/* Bills Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ReceiptIcon className="w-5 h-5" />
                        Bills & Invoices ({filteredBills.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredBills.length === 0 ? (
                        <div className="text-center py-8">
                            <ReceiptIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No bills found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                                    ? 'Try adjusting your search criteria'
                                    : 'Create your first bill to get started'
                                }
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create Bill
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bill Number</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Paid Amount</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBills.map((bill) => (
                                    <TableRow key={bill.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <ReceiptIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{bill.bill_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                <span>{getPatientName(bill.patient_id || '')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-sm">{formatDate(bill.bill_date)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(bill.total_amount)}
                                        </TableCell>
                                        <TableCell className="text-green-600">
                                            {formatCurrency(bill.paid_amount)}
                                        </TableCell>
                                        <TableCell className={bill.balance_amount > 0 ? 'text-orange-600' : 'text-green-600'}>
                                            {formatCurrency(bill.balance_amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPaymentStatusColor(bill.payment_status || '')}>
                                                {bill.payment_status || 'Pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handlePrintBill(bill)}
                                                    title="Print Bill"
                                                >
                                                    <PrinterIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewBill(bill)}
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditBill(bill)}
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedBill(bill)
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

            {/* Create Bill Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Bill</DialogTitle>
                        <DialogDescription>
                            Generate a new bill for patient services
                        </DialogDescription>
                    </DialogHeader>
                    {/* TODO: Add CreateBill component */}
                    <div className="p-4 text-center text-muted-foreground">
                        Create Bill form will be available soon
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Bill Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Bill</DialogTitle>
                        <DialogDescription>
                            Update bill information and payment details
                        </DialogDescription>
                    </DialogHeader>
                    {/* TODO: Add EditBill component */}
                    <div className="p-4 text-center text-muted-foreground">
                        Edit Bill form will be available soon
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Bill Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Bill Details</DialogTitle>
                        <DialogDescription>
                            View complete bill information and payment history
                        </DialogDescription>
                    </DialogHeader>
                    {/* TODO: Add BillView component */}
                    <div className="p-4 text-center text-muted-foreground">
                        Bill details view will be available soon
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Bill</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this bill? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteBill}>
                            Delete Bill
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
