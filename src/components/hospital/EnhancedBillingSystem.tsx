import { useState } from 'react';
import { useKV, useNotifications, notificationService } from '@/lib'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  ReceiptIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  EyeIcon,
  PrinterIcon,
  FileTextIcon,
  DownloadIcon,
  XIcon,
  CalculatorIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner'
import { Bill, Patient, BillItem, InsuranceClaim } from '@/types/hospital'

// Service items for quick billing
const serviceItems = [
  { id: '1', description: 'General Consultation', rate: 500, category: 'consultation', taxRate: 0 },
  { id: '2', description: 'Specialist Consultation', rate: 800, category: 'consultation', taxRate: 0 },
  { id: '3', description: 'Blood Test - Complete', rate: 300, category: 'lab_test', taxRate: 5 },
  { id: '4', description: 'X-Ray Chest', rate: 400, category: 'procedure', taxRate: 12 },
  { id: '5', description: 'ECG', rate: 200, category: 'procedure', taxRate: 12 },
  { id: '6', description: 'Room Charges - General Ward', rate: 1000, category: 'room_charges', taxRate: 18 },
  { id: '7', description: 'Room Charges - Private Room', rate: 2500, category: 'room_charges', taxRate: 18 },
  { id: '8', description: 'Medicine - Paracetamol', rate: 50, category: 'medication', taxRate: 5 },
  { id: '9', description: 'Vaccination - COVID-19', rate: 250, category: 'procedure', taxRate: 5 },
  { id: '10', description: 'Emergency Treatment', rate: 1500, category: 'procedure', taxRate: 0 }
]

// Tax rates based on Indian GST
const taxRates = {
  'consultation': 0,
  'medication': 5,
  'lab_test': 5,
  'procedure': 12,
  'room_charges': 18,
  'other': 18
}

export default function EnhancedBillingSystem() {
  const [bills, setBills] = useKV<Bill[]>('hospital-bills', [])
  const [patients] = useKV<Patient[]>('hospital-patients', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewBillDialogOpen, setIsNewBillDialogOpen] = useState(false)
  const [isViewBillDialogOpen, setIsViewBillDialogOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [activeTab, setActiveTab] = useState('bills')
  const { addNotification } = useNotifications()

  // New bill state
  const [newBill, setNewBill] = useState({
    patientId: '',
    items: [] as BillItem[],
    discountAmount: 0,
    notes: '',
    paymentMethod: 'cash' as const,
    hasInsurance: false,
    insuranceClaim: null as InsuranceClaim | null
  })

  // Item form state
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    category: 'other' as keyof typeof taxRates
  })

  // Calculate bill totals
  const calculateBillTotals = (items: BillItem[], discountAmount: number = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const taxAmount = items.reduce((sum, item) => sum + (item.totalPrice * item.taxRate / 100), 0)
    const totalAmount = subtotal + taxAmount - discountAmount
    return { subtotal, taxAmount, totalAmount }
  }

  // Add item to bill
  const addItemToBill = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast.error('Please fill in all item details')
      return
    }

    const taxRate = taxRates[newItem.category] || 18
    const totalPrice = newItem.quantity * newItem.unitPrice

    const billItem: BillItem = {
      id: crypto.randomUUID(),
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      totalPrice,
      taxRate,
      category: newItem.category
    }

    setNewBill(prev => ({
      ...prev,
      items: [...prev.items, billItem]
    }))

    setNewItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      category: 'other'
    })
  }

  // Remove item from bill
  const removeItemFromBill = (itemId: string) => {
    setNewBill(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  // Add predefined service
  const addPredefinedService = (service: typeof serviceItems[0]) => {
    const billItem: BillItem = {
      id: crypto.randomUUID(),
      description: service.description,
      quantity: 1,
      unitPrice: service.rate,
      totalPrice: service.rate,
      taxRate: service.taxRate,
      category: service.category as any
    }

    setNewBill(prev => ({
      ...prev,
      items: [...prev.items, billItem]
    }))
  }

  // Create new bill
  const createBill = async () => {
    if (!newBill.patientId || newBill.items.length === 0) {
      toast.error('Please select a patient and add at least one item')
      return
    }

    const patient = patients.find(p => p.id === newBill.patientId)
    if (!patient) {
      toast.error('Patient not found')
      return
    }

    const { subtotal, taxAmount, totalAmount } = calculateBillTotals(newBill.items, newBill.discountAmount)

    const bill: Bill = {
      id: crypto.randomUUID(),
      patientId: newBill.patientId,
      billDate: new Date().toISOString(),
      items: newBill.items,
      subtotal,
      taxAmount,
      discountAmount: newBill.discountAmount,
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      paymentMethod: newBill.paymentMethod,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      insuranceClaim: newBill.insuranceClaim || undefined
    }

    setBills(prev => [...prev, bill])

    // Send payment reminder if enabled
    await notificationService.sendBillingReminder(
      patient.phoneNumber,
      patient.email,
      `${patient.firstName} ${patient.lastName}`,
      {
        billNumber: bill.id,
        amount: totalAmount,
        dueDate: new Date(bill.dueDate).toLocaleDateString()
      }
    )

    addNotification({
      message: `Payment reminder sent to ${patient.firstName} ${patient.lastName}`,
      type: 'success'
    });

    resetNewBill()
    setIsNewBillDialogOpen(false)
    toast.success('Bill created successfully')
  }

  // Reset new bill form
  const resetNewBill = () => {
    setNewBill({
      patientId: '',
      items: [],
      discountAmount: 0,
      notes: '',
      paymentMethod: 'cash',
      hasInsurance: false,
      insuranceClaim: null
    })
  }

  // Update payment
  const updatePayment = (billId: string, paidAmount: number, paymentMethod: string) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        const newPaidAmount = bill.paidAmount + paidAmount
        const balanceAmount = bill.totalAmount - newPaidAmount
        const status = balanceAmount <= 0 ? 'paid' : balanceAmount < bill.totalAmount ? 'partially_paid' : 'pending'

        return {
          ...bill,
          paidAmount: newPaidAmount,
          balanceAmount,
          status,
          paymentMethod: paymentMethod as any
        }
      }
      return bill
    }))

    toast.success('Payment updated successfully')
  }

  // Generate reports
  const generateDailyReport = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayBills = bills.filter(bill => bill.billDate.startsWith(today))

    const report = {
      date: today,
      totalBills: todayBills.length,
      totalRevenue: todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0),
      totalTax: todayBills.reduce((sum, bill) => sum + bill.taxAmount, 0),
      paidAmount: todayBills.reduce((sum, bill) => sum + bill.paidAmount, 0),
      pendingAmount: todayBills.reduce((sum, bill) => sum + bill.balanceAmount, 0)
    }

    // In a real application, this would generate a PDF or export to Excel
    console.log('Daily Report:', report)
    toast.success('Daily report generated')

    return report
  }

  const generateMonthlyReport = () => {
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
    const monthlyBills = bills.filter(bill => bill.billDate.startsWith(currentMonth))

    const report = {
      month: currentMonth,
      totalBills: monthlyBills.length,
      totalRevenue: monthlyBills.reduce((sum, bill) => sum + bill.totalAmount, 0),
      totalTax: monthlyBills.reduce((sum, bill) => sum + bill.taxAmount, 0),
      categoryBreakdown: Object.keys(taxRates).reduce((acc, category) => {
        const categoryItems = monthlyBills.flatMap(bill =>
          bill.items.filter(item => item.category === category)
        )
        acc[category] = categoryItems.reduce((sum, item) => sum + item.totalPrice, 0)
        return acc
      }, {} as Record<string, number>)
    }

    console.log('Monthly Report:', report)
    toast.success('Monthly report generated')

    return report
  }

  // Filter bills
  const filteredBills = bills.filter(bill => {
    const patient = patients.find(p => p.id === bill.patientId)
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''

    return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const { subtotal: newBillSubtotal, taxAmount: newBillTaxAmount, totalAmount: newBillTotalAmount } =
    calculateBillTotals(newBill.items, newBill.discountAmount)

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bills">Bills & Invoices</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          <TabsTrigger value="insurance">Insurance Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-6">
          {/* Header with Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search bills by patient name or bill ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={generateDailyReport} variant="outline">
                <FileTextIcon className="h-4 w-4 mr-2" />
                Daily Report
              </Button>

              <Dialog open={isNewBillDialogOpen} onOpenChange={setIsNewBillDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Bill
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Bill</DialogTitle>
                    <DialogDescription>
                      Add items and generate a new bill for the patient
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-6">
                    {/* Patient Selection */}
                    <div className="space-y-2">
                      <Label>Select Patient *</Label>
                      <Select value={newBill.patientId} onValueChange={(value) => setNewBill(prev => ({ ...prev, patientId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.firstName} {patient.lastName} - {patient.mrNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quick Service Selection */}
                    <div className="space-y-3">
                      <Label>Quick Add Services</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {serviceItems.map((service) => (
                          <Button
                            key={service.id}
                            variant="outline"
                            size="sm"
                            onClick={() => addPredefinedService(service)}
                            className="justify-start text-left h-auto p-3"
                          >
                            <div>
                              <p className="font-medium text-sm">{service.description}</p>
                              <p className="text-xs text-muted-foreground">₹{service.rate}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Custom Item Entry */}
                    <div className="space-y-4">
                      <Label>Add Custom Item</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={newItem.description}
                            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newItem.unitPrice}
                            onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value as any }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="consultation">Consultation (0%)</SelectItem>
                              <SelectItem value="medication">Medication (5%)</SelectItem>
                              <SelectItem value="lab_test">Lab Test (5%)</SelectItem>
                              <SelectItem value="procedure">Procedure (12%)</SelectItem>
                              <SelectItem value="room_charges">Room Charges (18%)</SelectItem>
                              <SelectItem value="other">Other (18%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={addItemToBill} variant="outline">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {/* Bill Items */}
                    {newBill.items.length > 0 && (
                      <div className="space-y-3">
                        <Label>Bill Items</Label>
                        <div className="border rounded-lg divide-y">
                          {newBill.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3">
                              <div className="flex-1">
                                <p className="font-medium">{item.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} × ₹{item.unitPrice} + {item.taxRate}% tax
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium">₹{item.totalPrice}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItemFromBill(item.id)}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discount and Totals */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Discount Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newBill.discountAmount}
                          onChange={(e) => setNewBill(prev => ({ ...prev, discountAmount: Number(e.target.value) }))}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={newBill.paymentMethod} onValueChange={(value) => setNewBill(prev => ({ ...prev, paymentMethod: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                            <SelectItem value="credit">Credit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Bill Summary */}
                    {newBill.items.length > 0 && (
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <CalculatorIcon className="h-4 w-4" />
                          Bill Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{newBillSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax Amount:</span>
                            <span>₹{newBillTaxAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-₹{newBill.discountAmount.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Total Amount:</span>
                            <span>₹{newBillTotalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={newBill.notes}
                        onChange={(e) => setNewBill(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes for this bill"
                        rows={2}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsNewBillDialogOpen(false)
                      resetNewBill()
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={createBill} disabled={newBill.items.length === 0}>
                      Create Bill
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Bills List */}
          <div className="grid gap-4">
            {filteredBills.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ReceiptIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bills found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first bill to get started'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredBills.map((bill) => {
                const patient = patients.find(p => p.id === bill.patientId)
                return (
                  <Card key={bill.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Bill #{bill.id.slice(-8)} • {new Date(bill.billDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={
                            bill.status === 'paid' ? 'default' :
                              bill.status === 'partially_paid' ? 'secondary' : 'destructive'
                          }>
                            {bill.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">₹{bill.totalAmount.toLocaleString()}</p>
                            {bill.balanceAmount > 0 && (
                              <p className="text-sm text-destructive">
                                Due: ₹{bill.balanceAmount.toLocaleString()}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBill(bill)
                                setIsViewBillDialogOpen(true)
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <PrinterIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Financial performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Today's Revenue:</span>
                    <span className="font-semibold">
                      ₹{bills.filter(b => b.billDate.startsWith(new Date().toISOString().split('T')[0]))
                        .reduce((sum, bill) => sum + bill.totalAmount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month:</span>
                    <span className="font-semibold">
                      ₹{bills.filter(b => b.billDate.startsWith(new Date().toISOString().substring(0, 7)))
                        .reduce((sum, bill) => sum + bill.totalAmount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Amount:</span>
                    <span className="font-semibold text-destructive">
                      ₹{bills.reduce((sum, bill) => sum + bill.balanceAmount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button onClick={generateDailyReport} className="w-full">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Generate Daily Report
                  </Button>
                  <Button onClick={generateMonthlyReport} variant="outline" className="w-full">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Generate Monthly Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Summary</CardTitle>
                <CardDescription>GST collection overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(taxRates).map(([category, rate]) => {
                    const categoryRevenue = bills.flatMap(bill =>
                      bill.items.filter(item => item.category === category)
                    ).reduce((sum, item) => sum + item.totalPrice, 0)

                    const categoryTax = categoryRevenue * rate / 100

                    return (
                      <div key={category} className="flex justify-between items-center">
                        <div>
                          <span className="capitalize">{category.replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground ml-2">({rate}%)</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{categoryTax.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            on ₹{categoryRevenue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Claims</CardTitle>
              <CardDescription>Manage insurance claims and reimbursements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCardIcon className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Insurance Claims Management</h3>
                <p>This feature will help you process insurance claims and track reimbursements.</p>
                <Button className="mt-4" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}