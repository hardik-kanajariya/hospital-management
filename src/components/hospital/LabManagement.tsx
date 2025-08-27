import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  TestTube, 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  User,
  Calendar
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LabTest {
  id: string
  name: string
  category: string
  normalRange: string
  unit: string
  price: number
  preparationInstructions?: string
  sampleType: string
  reportTime: string // in hours
  status: 'active' | 'inactive'
}

interface LabOrder {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  tests: string[] // test IDs
  testNames: string[]
  orderDate: string
  sampleCollectionDate?: string
  status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'reported'
  priority: 'normal' | 'urgent' | 'stat'
  notes?: string
  totalAmount: number
}

interface LabResult {
  id: string
  orderId: string
  testId: string
  testName: string
  value: string
  unit: string
  normalRange: string
  status: 'normal' | 'abnormal' | 'critical'
  remarks?: string
  completedDate: string
  verifiedBy: string
}

const labTestCategories = [
  'Hematology', 'Biochemistry', 'Microbiology', 'Pathology', 
  'Radiology', 'Cardiology', 'Immunology', 'Endocrinology'
]

const sampleTypes = [
  'Blood', 'Urine', 'Stool', 'Sputum', 'CSF', 'Tissue', 'Swab'
]

const commonTests = [
  { name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 300, sampleType: 'Blood', reportTime: '4', unit: 'various' },
  { name: 'Blood Sugar (Fasting)', category: 'Biochemistry', price: 150, sampleType: 'Blood', reportTime: '2', unit: 'mg/dL' },
  { name: 'Blood Sugar (Random)', category: 'Biochemistry', price: 120, sampleType: 'Blood', reportTime: '2', unit: 'mg/dL' },
  { name: 'Lipid Profile', category: 'Biochemistry', price: 400, sampleType: 'Blood', reportTime: '6', unit: 'mg/dL' },
  { name: 'Liver Function Test (LFT)', category: 'Biochemistry', price: 450, sampleType: 'Blood', reportTime: '6', unit: 'various' },
  { name: 'Kidney Function Test (KFT)', category: 'Biochemistry', price: 400, sampleType: 'Blood', reportTime: '6', unit: 'various' },
  { name: 'Thyroid Profile', category: 'Endocrinology', price: 600, sampleType: 'Blood', reportTime: '24', unit: 'various' },
  { name: 'Urine Routine & Microscopy', category: 'Pathology', price: 200, sampleType: 'Urine', reportTime: '2', unit: 'various' },
  { name: 'ECG', category: 'Cardiology', price: 250, sampleType: 'N/A', reportTime: '1', unit: 'interpretation' },
  { name: 'Chest X-Ray', category: 'Radiology', price: 300, sampleType: 'N/A', reportTime: '2', unit: 'interpretation' }
]

export default function LabManagement() {
  const [patients] = useKV('hospital-patients', [])
  const [doctors] = useKV('hospital-doctors', [])
  const [labTests, setLabTests] = useKV<LabTest[]>('lab-tests', [])
  const [labOrders, setLabOrders] = useKV<LabOrder[]>('lab-orders', [])
  const [labResults, setLabResults] = useKV<LabResult[]>('lab-results', [])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  
  const [orderFormData, setOrderFormData] = useState<Partial<LabOrder>>({
    priority: 'normal',
    status: 'ordered'
  })
  
  const [testFormData, setTestFormData] = useState<Partial<LabTest>>({
    status: 'active'
  })

  const [resultFormData, setResultFormData] = useState<Partial<LabResult>>({
    status: 'normal'
  })

  // Initialize with common tests if empty
  useState(() => {
    if (labTests.length === 0) {
      const initialTests = commonTests.map((test, index) => ({
        id: `LT${String(index + 1).padStart(3, '0')}`,
        name: test.name,
        category: test.category,
        price: test.price,
        sampleType: test.sampleType,
        reportTime: test.reportTime,
        unit: test.unit,
        normalRange: 'As per standard ranges',
        status: 'active' as const
      }))
      setLabTests(initialTests)
    }
  })

  const handleAddTest = () => {
    if (!testFormData.name || !testFormData.category || !testFormData.price) {
      toast.error('Please fill in all required fields')
      return
    }

    const newTest: LabTest = {
      id: `LT${Date.now()}`,
      name: testFormData.name!,
      category: testFormData.category!,
      normalRange: testFormData.normalRange || 'As per standard ranges',
      unit: testFormData.unit || 'unit',
      price: Number(testFormData.price!),
      preparationInstructions: testFormData.preparationInstructions,
      sampleType: testFormData.sampleType || 'Blood',
      reportTime: testFormData.reportTime || '4',
      status: testFormData.status as 'active' | 'inactive'
    }

    setLabTests(current => [...current, newTest])
    setTestFormData({ status: 'active' })
    setIsTestDialogOpen(false)
    toast.success('Lab test added successfully')
  }

  const handleCreateOrder = () => {
    if (!orderFormData.patientId || !orderFormData.doctorId || !orderFormData.tests?.length) {
      toast.error('Please fill in all required fields')
      return
    }

    const patient = patients.find(p => p.id === orderFormData.patientId)
    const doctor = doctors.find(d => d.id === orderFormData.doctorId)
    const selectedTests = labTests.filter(test => orderFormData.tests!.includes(test.id))
    
    if (!patient || !doctor) {
      toast.error('Patient or doctor not found')
      return
    }

    const totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0)

    const newOrder: LabOrder = {
      id: `LO${Date.now()}`,
      patientId: orderFormData.patientId!,
      patientName: patient.name,
      doctorId: orderFormData.doctorId!,
      doctorName: doctor.name,
      tests: orderFormData.tests!,
      testNames: selectedTests.map(test => test.name),
      orderDate: new Date().toISOString().split('T')[0],
      status: orderFormData.status as any,
      priority: orderFormData.priority as any,
      notes: orderFormData.notes,
      totalAmount
    }

    setLabOrders(current => [...current, newOrder])
    setOrderFormData({ priority: 'normal', status: 'ordered' })
    setIsOrderDialogOpen(false)
    toast.success('Lab order created successfully')
  }

  const handleAddResult = () => {
    if (!selectedOrder || !resultFormData.testId || !resultFormData.value) {
      toast.error('Please fill in all required fields')
      return
    }

    const test = labTests.find(t => t.id === resultFormData.testId)
    if (!test) {
      toast.error('Test not found')
      return
    }

    const newResult: LabResult = {
      id: `LR${Date.now()}`,
      orderId: selectedOrder.id,
      testId: resultFormData.testId!,
      testName: test.name,
      value: resultFormData.value!,
      unit: test.unit,
      normalRange: test.normalRange,
      status: resultFormData.status as any,
      remarks: resultFormData.remarks,
      completedDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'Lab Technician' // In real app, use logged-in user
    }

    setLabResults(current => [...current, newResult])
    
    // Check if all tests for this order are completed
    const orderResults = [...labResults, newResult].filter(r => r.orderId === selectedOrder.id)
    const orderTests = selectedOrder.tests
    
    if (orderResults.length === orderTests.length) {
      // Update order status to completed
      setLabOrders(current => 
        current.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: 'completed' }
            : order
        )
      )
    }

    setResultFormData({ status: 'normal' })
    setIsResultDialogOpen(false)
    toast.success('Test result added successfully')
  }

  const updateOrderStatus = (orderId: string, newStatus: LabOrder['status']) => {
    setLabOrders(current => 
      current.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    )
    toast.success('Order status updated')
  }

  const filteredOrders = labOrders.filter(order =>
    order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.testNames.some(test => test.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const todayOrders = labOrders.filter(order => order.orderDate === new Date().toISOString().split('T')[0])
  const pendingOrders = labOrders.filter(order => !['completed', 'reported'].includes(order.status))
  const urgentOrders = labOrders.filter(order => order.priority === 'urgent' || order.priority === 'stat')

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search orders by patient, test, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Add Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lab Test</DialogTitle>
                <DialogDescription>Create a new lab test type</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="testName">Test Name *</Label>
                  <Input
                    id="testName"
                    value={testFormData.name || ''}
                    onChange={(e) => setTestFormData({...testFormData, name: e.target.value})}
                    placeholder="Enter test name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={testFormData.category} onValueChange={(value) => setTestFormData({...testFormData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {labTestCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sampleType">Sample Type</Label>
                    <Select value={testFormData.sampleType} onValueChange={(value) => setTestFormData({...testFormData, sampleType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sample type" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={testFormData.price || ''}
                      onChange={(e) => setTestFormData({...testFormData, price: Number(e.target.value)})}
                      placeholder="Price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={testFormData.unit || ''}
                      onChange={(e) => setTestFormData({...testFormData, unit: e.target.value})}
                      placeholder="mg/dL, mmol/L, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportTime">Report Time (hours)</Label>
                    <Input
                      id="reportTime"
                      value={testFormData.reportTime || ''}
                      onChange={(e) => setTestFormData({...testFormData, reportTime: e.target.value})}
                      placeholder="Hours"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="normalRange">Normal Range</Label>
                  <Input
                    id="normalRange"
                    value={testFormData.normalRange || ''}
                    onChange={(e) => setTestFormData({...testFormData, normalRange: e.target.value})}
                    placeholder="Normal range values"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preparation">Preparation Instructions</Label>
                  <Textarea
                    id="preparation"
                    value={testFormData.preparationInstructions || ''}
                    onChange={(e) => setTestFormData({...testFormData, preparationInstructions: e.target.value})}
                    placeholder="Any special preparation needed"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTest}>Add Test</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Lab Order</DialogTitle>
                <DialogDescription>Order lab tests for a patient</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient *</Label>
                    <Select value={orderFormData.patientId} onValueChange={(value) => setOrderFormData({...orderFormData, patientId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Ordering Doctor *</Label>
                    <Select value={orderFormData.doctorId} onValueChange={(value) => setOrderFormData({...orderFormData, doctorId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.status === 'active').map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Tests *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded p-3">
                    {labTests.filter(test => test.status === 'active').map((test) => (
                      <label key={test.id} className="flex items-center space-x-2 p-2 hover:bg-muted/30 rounded">
                        <input
                          type="checkbox"
                          checked={orderFormData.tests?.includes(test.id) || false}
                          onChange={(e) => {
                            const tests = orderFormData.tests || []
                            if (e.target.checked) {
                              setOrderFormData({...orderFormData, tests: [...tests, test.id]})
                            } else {
                              setOrderFormData({...orderFormData, tests: tests.filter(id => id !== test.id)})
                            }
                          }}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{test.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {test.category} • ₹{test.price} • {test.reportTime}h
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {orderFormData.tests?.length && (
                    <div className="text-sm text-muted-foreground">
                      Total: ₹{labTests.filter(test => orderFormData.tests!.includes(test.id)).reduce((sum, test) => sum + test.price, 0)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={orderFormData.priority} onValueChange={(value) => setOrderFormData({...orderFormData, priority: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="stat">STAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={orderFormData.status} onValueChange={(value) => setOrderFormData({...orderFormData, status: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="sample_collected">Sample Collected</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={orderFormData.notes || ''}
                    onChange={(e) => setOrderFormData({...orderFormData, notes: e.target.value})}
                    placeholder="Additional notes or instructions"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateOrder}>Create Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{urgentOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labTests.filter(t => t.status === 'active').length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Lab Orders</TabsTrigger>
          <TabsTrigger value="tests">Available Tests</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Orders</CardTitle>
              <CardDescription>
                {filteredOrders.length} of {labOrders.length} orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <TestTube className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No lab orders found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first lab order'}
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{order.id}</Badge>
                          <Badge variant={
                            order.status === 'completed' ? 'default' : 
                            order.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant={
                            order.priority === 'stat' ? 'destructive' :
                            order.priority === 'urgent' ? 'destructive' : 'outline'
                          }>
                            {order.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsResultDialogOpen(true)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Add Result
                          </Button>
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => updateOrderStatus(order.id, value as any)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ordered">Ordered</SelectItem>
                              <SelectItem value="sample_collected">Sample Collected</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="reported">Reported</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{order.patientName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ordered by: Dr. {order.doctorName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Date: {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Tests Ordered:</div>
                          <div className="flex flex-wrap gap-1">
                            {order.testNames.map((testName, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {testName}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            Total: ₹{order.totalAmount}
                          </div>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-3 p-2 bg-muted/30 rounded text-sm">
                          <strong>Notes:</strong> {order.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Lab Tests</CardTitle>
              <CardDescription>All lab tests available for ordering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {labTests.filter(test => test.status === 'active').map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{test.category}</Badge>
                      <span className="font-bold text-lg">₹{test.price}</span>
                    </div>
                    <h3 className="font-medium mb-2">{test.name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Sample: {test.sampleType}</div>
                      <div>Report Time: {test.reportTime} hours</div>
                      <div>Unit: {test.unit}</div>
                      <div>Normal Range: {test.normalRange}</div>
                    </div>
                    {test.preparationInstructions && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                        <strong>Preparation:</strong> {test.preparationInstructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Results</CardTitle>
              <CardDescription>All completed lab test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labResults.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No results available</h3>
                    <p className="text-muted-foreground">Lab results will appear here once tests are completed</p>
                  </div>
                ) : (
                  labResults.map((result) => {
                    const order = labOrders.find(o => o.id === result.orderId)
                    return (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{result.orderId}</Badge>
                            <Badge variant={
                              result.status === 'critical' ? 'destructive' :
                              result.status === 'abnormal' ? 'destructive' : 'default'
                            }>
                              {result.status}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                            Download Report
                          </Button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="font-medium">{result.testName}</div>
                            {order && (
                              <div className="text-sm text-muted-foreground">
                                Patient: {order.patientName}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              Completed: {new Date(result.completedDate).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold">{result.value} {result.unit}</div>
                            <div className="text-sm text-muted-foreground">
                              Normal: {result.normalRange}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Verified by: {result.verifiedBy}
                            </div>
                          </div>
                        </div>

                        {result.remarks && (
                          <div className="mt-3 p-2 bg-muted/30 rounded text-sm">
                            <strong>Remarks:</strong> {result.remarks}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Result Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Test Result</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Adding result for order ${selectedOrder.id} - ${selectedOrder.patientName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resultTest">Select Test *</Label>
              <Select value={resultFormData.testId} onValueChange={(value) => setResultFormData({...resultFormData, testId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test" />
                </SelectTrigger>
                <SelectContent>
                  {selectedOrder?.tests.map((testId) => {
                    const test = labTests.find(t => t.id === testId)
                    // Check if result already exists for this test
                    const existingResult = labResults.find(r => r.orderId === selectedOrder.id && r.testId === testId)
                    if (existingResult) return null
                    
                    return test ? (
                      <SelectItem key={test.id} value={test.id}>
                        {test.name}
                      </SelectItem>
                    ) : null
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resultValue">Result Value *</Label>
                <Input
                  id="resultValue"
                  value={resultFormData.value || ''}
                  onChange={(e) => setResultFormData({...resultFormData, value: e.target.value})}
                  placeholder="Enter result value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resultStatus">Status</Label>
                <Select value={resultFormData.status} onValueChange={(value) => setResultFormData({...resultFormData, status: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resultRemarks">Remarks</Label>
              <Textarea
                id="resultRemarks"
                value={resultFormData.remarks || ''}
                onChange={(e) => setResultFormData({...resultFormData, remarks: e.target.value})}
                placeholder="Additional remarks or observations"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddResult}>Add Result</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}