import { useState, useEffect } from 'react'
import { useBillingApi, usePatientApi } from '@/hooks/useApiHooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ReceiptIcon, PlusIcon, MagnifyingGlassIcon, CreditCardIcon, EyeIcon, PrinterIcon, CurrencyDollarIcon, TrendUpIcon } from '@phosphor-icons/react';
import { toast } from 'sonner'
import { Bill, BillItem, Patient } from '@/types/hospital';

// Extended types for backward compatibility
interface ExtendedBill extends Bill {
  patientName?: string;
  date?: string;
  total?: number;
  dueAmount?: number;
  paymentStatus?: string;
  discount?: number;
  tax?: number;
}

interface ExtendedBillItem extends BillItem {
  rate?: number;
  amount?: number;
}

const serviceItems = [
  { description: 'General Consultation', rate: 500 },
  { description: 'Specialist Consultation', rate: 800 },
  { description: 'Emergency Consultation', rate: 1000 },
  { description: 'Follow-up Visit', rate: 300 },
  { description: 'Health Checkup', rate: 1200 },
  { description: 'Blood Test - CBC', rate: 400 },
  { description: 'Blood Sugar Test', rate: 150 },
  { description: 'X-Ray Chest', rate: 600 },
  { description: 'ECG', rate: 300 },
  { description: 'Vaccination', rate: 250 },
  { description: 'Dressing', rate: 200 },
  { description: 'Injection', rate: 100 },
  { description: 'IV Fluids', rate: 800 },
  { description: 'Minor Surgery', rate: 5000 },
  { description: 'Hospitalization (per day)', rate: 2000 }
]

const paymentMethods = [
  'Cash',
  'UPI',
  'Card',
  'Net Banking',
  'Cheque'
]

const insuranceProviders = [
  'Ayushman Bharat',
  'ESI Corporation',
  'CGHS',
  'Star Health',
  'HDFC ERGO',
  'ICICI Lombard',
  'New India Assurance',
  'United India Insurance',
  'Other'
]

export default function BillingSystem() {
  const { bills, createBill, updateBill } = useBillingApi()
  const { patients } = usePatientApi()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')

  const [newBill, setNewBill] = useState({
    patientId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    discount: 0,
    tax: 18, // GST 18%
    notes: ''
  })

  const [insuranceClaim, setInsuranceClaim] = useState({
    provider: '',
    policyNumber: '',
    claimAmount: 0,
    hasInsurance: false
  })

  const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false)

  const [billItems, setBillItems] = useState<BillItem[]>([{
    id: '1',
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    taxRate: 0,
    category: 'consultation'
  }])

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: '',
    notes: ''
  })

  const today = new Date().toISOString().split('T')[0]
  const currentMonth = new Date().toISOString().slice(0, 7)

  // Check for billing context from appointments on component mount
  useEffect(() => {
    const billingContext = localStorage.getItem('billing-context')
    if (billingContext) {
      try {
        const context = JSON.parse(billingContext)
        const patient = patients.find(p => p.id === context.patientId)

        setNewBill(prev => ({
          ...prev,
          patientId: context.patientId,
          patientName: context.patientName
        }))

        // Pre-populate insurance if patient has it
        if (patient?.insuranceInfo) {
          setInsuranceClaim({
            provider: patient.insuranceInfo.provider,
            policyNumber: patient.insuranceInfo.policyNumber,
            claimAmount: 0,
            hasInsurance: true
          })
        }

        // Add consultation service based on appointment type
        if (context.appointmentType) {
          const consultationRate = context.appointmentType === 'Emergency' ? 1000 :
            context.appointmentType === 'Specialist Consultation' ? 800 : 500
          setBillItems([{
            id: '1',
            description: context.appointmentType === 'Emergency' ? 'Emergency Consultation' :
              context.appointmentType === 'Specialist Consultation' ? 'Specialist Consultation' : 'General Consultation',
            quantity: 1,
            unitPrice: consultationRate,
            totalPrice: consultationRate,
            taxRate: 0,
            category: 'consultation'
          }])
        }

        setIsDialogOpen(true)
        localStorage.removeItem('billing-context') // Clear after use
        toast.success('Billing form pre-populated from appointment')
      } catch (error) {
        console.error('Error parsing billing context:', error)
      }
    }
  }, [patients])

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus

    let matchesDate = true
    if (filterDate === 'today') {
      matchesDate = bill.billDate === today
    } else if (filterDate === 'month') {
      matchesDate = bill.billDate.startsWith(currentMonth)
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Calculate totals
  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = (subtotal * newBill.discount) / 100
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * newBill.tax) / 100
    return taxableAmount + taxAmount
  }

  const addBillItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      taxRate: 0,
      category: 'other'
    }
    setBillItems([...billItems, newItem])
  }

  const removeBillItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id))
  }

  const updateBillItem = (id: string, field: keyof BillItem, value: any) => {
    setBillItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updated.totalPrice = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      })
    )
  }

  const handleCreateBill = async () => {
    if (!newBill.patientId || billItems.length === 0 || !billItems[0].description) {
      toast.error('Please fill in all required fields and add at least one item')
      return
    }

    const subtotal = calculateSubtotal()
    const discountAmount = (subtotal * newBill.discount) / 100
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * newBill.tax) / 100
    const total = taxableAmount + taxAmount

    const bill: Bill = {
      id: `INV${Date.now()}`,
      patientId: newBill.patientId,
      billDate: newBill.date,
      items: billItems.filter(item => item.description),
      subtotal,
      discountAmount: discountAmount,
      taxAmount: taxAmount,
      totalAmount: total,
      status: 'pending',
      paidAmount: 0,
      balanceAmount: total,
      paymentMethod: 'cash',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      insuranceClaim: insuranceClaim.hasInsurance ? {
        id: `claim-${Date.now()}`,
        claimNumber: `CLM-${Date.now()}`,
        submittedDate: new Date().toISOString(),
        status: 'submitted' as const,
        claimAmount: insuranceClaim.claimAmount,
        documents: []
      } : undefined
    }

    try {
      await createBill(bill)
      
      // Reset form
      setNewBill({
        patientId: '',
        patientName: '',
        date: new Date().toISOString().split('T')[0],
        discount: 0,
        tax: 18,
        notes: ''
      })
      setInsuranceClaim({
        provider: '',
        policyNumber: '',
        claimAmount: 0,
        hasInsurance: false
      })
      setBillItems([{
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        taxRate: 0,
        category: 'consultation'
      }])

      setIsDialogOpen(false)
      toast.success(`Bill created successfully`)
    } catch (error) {
      console.error('Failed to create bill:', error)
    }
  }

  const handlePayment = async () => {
    if (!selectedBill || !paymentData.amount || !paymentData.method) {
      toast.error('Please fill in all payment details')
      return
    }

    if (paymentData.amount > selectedBill.balanceAmount) {
      toast.error('Payment amount cannot exceed due amount')
      return
    }

    const newPaidAmount = selectedBill.paidAmount + paymentData.amount
    const newDueAmount = selectedBill.totalAmount - newPaidAmount

    let newStatus: ExtendedBill['status'] = 'partially_paid'
    if (newDueAmount === 0) {
      newStatus = 'paid'
    } else if (newPaidAmount === 0) {
      newStatus = 'pending'
    }

    try {
      await updateBill(selectedBill.id, {
        paidAmount: newPaidAmount,
        balanceAmount: newDueAmount,
        status: newStatus,
        paymentMethod: paymentData.method as Bill['paymentMethod'],
        paymentDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      setPaymentData({ amount: 0, method: '', notes: '' })
      setIsPaymentDialogOpen(false)
      toast.success(`Payment of ₹${paymentData.amount} recorded successfully`)
    } catch (error) {
      console.error('Failed to update payment:', error)
    }
  }

  const handleInsuranceClaim = async (billId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      const bill = bills.find(b => b.id === billId)
      if (bill && bill.insuranceClaim) {
        await updateBill(billId, {
          insuranceClaim: {
            ...bill.insuranceClaim,
            claimStatus: action === 'approve' ? 'approved' : 'rejected',
            approvedDate: action === 'approve' ? new Date().toISOString() : undefined,
            rejectionReason: action === 'reject' ? rejectionReason : undefined
          }
        })
        toast.success(`Insurance claim ${action}ed successfully`)
      }
    } catch (error) {
      console.error('Failed to update insurance claim:', error)
    }
  }

  const getClaimStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-blue-600">Claim Pending</Badge>
      case 'processing':
        return <Badge variant="default" className="bg-yellow-500">Processing</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Claim Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Claim Rejected</Badge>
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>
      case 'partial':
        return <Badge variant="default" className="bg-yellow-500">Partial</Badge>
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate dashboard stats
  const todayBills = bills.filter(bill => bill.billDate === today)
  const todayRevenue = todayBills.reduce((sum, bill) => sum + bill.paidAmount, 0)
  const pendingAmount = bills.reduce((sum, bill) => sum + (bill.balanceAmount || 0), 0)
  const monthlyRevenue = bills
    .filter(bill => bill.billDate.startsWith(currentMonth))
    .reduce((sum, bill) => sum + bill.paidAmount, 0)

  return (
    <div className="space-y-6">
      {/* Revenue Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {todayBills.length} bills today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month's collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground">
              All time bills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search bills by patient or invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Bill</DialogTitle>
              <DialogDescription>
                Generate a bill for patient services and treatments.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Patient Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Patient *</Label>
                  <Select
                    onValueChange={(value) => {
                      const patient = patients.find(p => p.id === value)
                      setNewBill({
                        ...newBill,
                        patientId: value,
                        patientName: `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim()
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {`${patient.firstName || ''} ${patient.lastName || ''}`.trim()} - {patient.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bill Date</Label>
                  <Input
                    type="date"
                    value={newBill.date}
                    onChange={(e) => setNewBill({ ...newBill, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Bill Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Bill Items</Label>
                  <Button variant="outline" size="sm" onClick={addBillItem}>
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {billItems.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="grid grid-cols-6 gap-4 items-end">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-sm">Description</Label>
                          <Select
                            value={item.description}
                            onValueChange={(value) => {
                              const serviceItem = serviceItems.find(s => s.description === value)
                              updateBillItem(item.id, 'description', value)
                              if (serviceItem) {
                                updateBillItem(item.id, 'unitPrice', serviceItem.rate)
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceItems.map((service) => (
                                <SelectItem key={service.description} value={service.description}>
                                  {service.description} - ₹{service.rate}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateBillItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Rate (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateBillItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Amount (₹)</Label>
                          <Input
                            type="number"
                            value={item.totalPrice}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          {billItems.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeBillItem(item.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Insurance Claim Section */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Insurance Claim</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={insuranceClaim.hasInsurance}
                        onChange={(e) => setInsuranceClaim({ ...insuranceClaim, hasInsurance: e.target.checked })}
                        className="rounded"
                      />
                      <Label className="text-sm">Has Insurance</Label>
                    </div>
                  </div>

                  {insuranceClaim.hasInsurance && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Insurance Provider *</Label>
                        <Select
                          value={insuranceClaim.provider}
                          onValueChange={(value) => setInsuranceClaim({ ...insuranceClaim, provider: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {insuranceProviders.map((provider) => (
                              <SelectItem key={provider} value={provider}>
                                {provider}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Policy Number *</Label>
                        <Input
                          value={insuranceClaim.policyNumber}
                          onChange={(e) => setInsuranceClaim({ ...insuranceClaim, policyNumber: e.target.value })}
                          placeholder="Enter policy number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Claim Amount (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={insuranceClaim.claimAmount}
                          onChange={(e) => setInsuranceClaim({ ...insuranceClaim, claimAmount: parseFloat(e.target.value) || 0 })}
                          placeholder="Amount to claim"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Bill Summary */}
              <Card className="p-4 bg-muted/50">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newBill.discount}
                        onChange={(e) => setNewBill({ ...newBill, discount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax (GST %)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newBill.tax}
                        onChange={(e) => setNewBill({ ...newBill, tax: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input
                        value={newBill.notes}
                        onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount ({newBill.discount}%):</span>
                        <span>-₹{((calculateSubtotal() * newBill.discount) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({newBill.tax}%):</span>
                        <span>₹{(((calculateSubtotal() - (calculateSubtotal() * newBill.discount) / 100) * newBill.tax) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBill}>
                Create Bill
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {filteredBills.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ReceiptIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No bills found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria' : 'Create your first bill'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <ReceiptIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{bill.patientName}</h3>
                        <Badge variant="outline">{bill.id}</Badge>
                        {getStatusBadge(bill.status || 'pending')}
                        {bill.insuranceClaim && getClaimStatusBadge(bill.insuranceClaim.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <strong>Date:</strong> {new Date(bill.billDate || '').toLocaleDateString()} •
                          <strong> Total:</strong> ₹{(bill.totalAmount || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Paid:</strong> ₹{bill.paidAmount.toLocaleString()} •
                          <strong> Due:</strong> ₹{(bill.balanceAmount || 0).toLocaleString()}
                        </p>
                        {bill.paymentMethod && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Payment Method:</strong> {bill.paymentMethod}
                          </p>
                        )}
                        {bill.insuranceClaim && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Insurance:</strong> {bill.insuranceClaim.claimNumber} •
                            <strong> Policy:</strong> {bill.insuranceClaim.claimAmount} •
                            <strong> Claim:</strong> ₹{bill.insuranceClaim.claimAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBill(bill)}
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Bill Details</DialogTitle>
                          <DialogDescription>
                            Invoice {bill.id} for {bill.patientName}
                          </DialogDescription>
                        </DialogHeader>

                        {selectedBill && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Patient</Label>
                                <p>{patients.find(p => p.id === selectedBill.patientId)?.firstName + ' ' + patients.find(p => p.id === selectedBill.patientId)?.lastName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Invoice ID</Label>
                                <p>{selectedBill.id}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                                <p>{new Date(selectedBill.billDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                <p>{getStatusBadge(selectedBill.status)}</p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Bill Items</Label>
                              <div className="space-y-2">
                                {selectedBill.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                                    <div>
                                      <p className="font-medium">{item.description}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {item.quantity} × ₹{item.unitPrice}
                                      </p>
                                    </div>
                                    <p className="font-medium">₹{item.totalPrice}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>₹{selectedBill.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Discount:</span>
                                  <span>-₹{selectedBill.discountAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax:</span>
                                  <span>₹{selectedBill.taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                  <span>Total:</span>
                                  <span>₹{selectedBill.totalAmount.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Amount Paid</Label>
                                  <p className="text-green-600 font-bold">₹{selectedBill.paidAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Amount Due</Label>
                                  <p className="text-red-600 font-bold">₹{selectedBill.balanceAmount.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {(bill.balanceAmount || 0) > 0 && (
                      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBill(bill)
                              setPaymentData({ amount: bill.balanceAmount || 0, method: '', notes: '' })
                            }}
                          >
                            <CreditCardIcon className="w-4 h-4 mr-1" />
                            Pay
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Payment</DialogTitle>
                            <DialogDescription>
                              Record payment for invoice {bill.id}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex justify-between items-center">
                                <span>Total Bill Amount:</span>
                                <span className="font-bold">₹{(bill.totalAmount || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Already Paid:</span>
                                <span className="text-green-600">₹{bill.paidAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-t pt-2">
                                <span>Amount Due:</span>
                                <span className="font-bold text-red-600">₹{(bill.balanceAmount || 0).toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Payment Amount *</Label>
                              <Input
                                type="number"
                                min="0"
                                max={bill.dueAmount}
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({
                                  ...paymentData,
                                  amount: parseFloat(e.target.value) || 0
                                })}
                                placeholder="Enter payment amount"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Payment Method *</Label>
                              <Select
                                value={paymentData.method}
                                onValueChange={(value) => setPaymentData({ ...paymentData, method: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                  {paymentMethods.map((method) => (
                                    <SelectItem key={method} value={method}>
                                      {method}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Notes</Label>
                              <Input
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                placeholder="Payment notes (optional)"
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handlePayment}>
                              Record Payment
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Button variant="outline" size="sm">
                      <PrinterIcon className="w-4 h-4 mr-1" />
                      Print
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