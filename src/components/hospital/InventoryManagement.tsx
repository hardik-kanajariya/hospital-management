import { useState } from 'react'
import { useKV } from '@/hooks/useLocalStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  PackageIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  WarningIcon,
  TrendDownIcon,
  PencilSimpleIcon,
  ShoppingCartIcon,
  ArchiveIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PillIcon,
  FirstAidIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner'

interface InventoryItem {
  id: string
  name: string
  category: string
  type: 'medicine' | 'supply' | 'equipment'
  quantity: number
  unit: string
  reorderLevel: number
  maxLevel: number
  costPrice: number
  sellingPrice: number
  supplier: string
  supplierContact?: string
  batchNumber?: string
  manufacturingDate?: string
  expiryDate?: string
  location: string
  description?: string
  barcode?: string
  status: 'active' | 'discontinued' | 'out_of_stock'
  lastUpdated: string
  createdAt: string
}

interface StockTransaction {
  id: string
  itemId: string
  itemName: string
  type: 'purchase' | 'issue' | 'return' | 'adjustment' | 'expired'
  quantity: number
  unitPrice?: number
  totalAmount?: number
  reason?: string
  batchNumber?: string
  expiryDate?: string
  issuedTo?: string
  date: string
  createdBy: string
  notes?: string
}

interface PurchaseOrder {
  id: string
  supplier: string
  orderDate: string
  expectedDelivery?: string
  actualDelivery?: string
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
  items: Array<{
    itemId: string
    itemName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  totalAmount: number
  notes?: string
  createdBy: string
  createdAt: string
}

const categories = {
  medicine: [
    'Antibiotics', 'Analgesics', 'Antidiabetics', 'Cardiovascular', 'Respiratory',
    'Vaccines', 'Vitamins', 'Antiseptics', 'Emergency Medicines', 'Chronic Disease'
  ],
  supply: [
    'Disposables', 'Surgical Instruments', 'Laboratory Supplies', 'First Aid',
    'Bandages & Dressings', 'IV Fluids', 'Syringes & Needles', 'PPE'
  ],
  equipment: [
    'Diagnostic Equipment', 'Monitoring Devices', 'Surgical Equipment',
    'Laboratory Equipment', 'Emergency Equipment', 'Furniture'
  ]
}

const units = ['Tablets', 'Capsules', 'Bottles', 'Vials', 'Boxes', 'Pieces', 'Kg', 'Grams', 'Liters', 'ML']

const commonSuppliers = [
  'MedSupply India', 'HealthCare Distributors', 'PharmaLink', 'MediCore Solutions',
  'Surgical Supply Co.', 'Lab Equipment Ltd.', 'Emergency Medical Supplies', 'Local Pharmacy'
]

export default function InventoryManagement() {
  const [inventory, setInventory] = useKV<InventoryItem[]>('hospital-inventory', [])
  const [transactions, setTransactions] = useKV<StockTransaction[]>('stock-transactions', [])
  const [purchaseOrders, setPurchaseOrders] = useKV<PurchaseOrder[]>('purchase-orders', [])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isPurchaseOrderDialogOpen, setIsPurchaseOrderDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const [itemFormData, setItemFormData] = useState<Partial<InventoryItem>>({
    type: 'medicine',
    quantity: 0,
    reorderLevel: 10,
    maxLevel: 100,
    status: 'active'
  })

  const [transactionFormData, setTransactionFormData] = useState<Partial<StockTransaction>>({
    type: 'purchase',
    quantity: 0,
    date: new Date().toISOString().split('T')[0]
  })

  const [purchaseOrderFormData, setPurchaseOrderFormData] = useState<Partial<PurchaseOrder>>({
    orderDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    items: [],
    totalAmount: 0
  })

  const handleAddItem = () => {
    if (!itemFormData.name || !itemFormData.category || !itemFormData.supplier) {
      toast.error('Please fill in all required fields')
      return
    }

    const newItem: InventoryItem = {
      id: `INV${Date.now()}`,
      name: itemFormData.name!,
      category: itemFormData.category!,
      type: itemFormData.type as any,
      quantity: Number(itemFormData.quantity) || 0,
      unit: itemFormData.unit || 'Pieces',
      reorderLevel: Number(itemFormData.reorderLevel) || 10,
      maxLevel: Number(itemFormData.maxLevel) || 100,
      costPrice: Number(itemFormData.costPrice) || 0,
      sellingPrice: Number(itemFormData.sellingPrice) || 0,
      supplier: itemFormData.supplier!,
      supplierContact: itemFormData.supplierContact,
      batchNumber: itemFormData.batchNumber,
      manufacturingDate: itemFormData.manufacturingDate,
      expiryDate: itemFormData.expiryDate,
      location: itemFormData.location || 'Main Store',
      description: itemFormData.description,
      barcode: itemFormData.barcode,
      status: itemFormData.status as any,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    setInventory(current => [...current, newItem])

    // Create initial stock transaction
    if (newItem.quantity > 0) {
      const initialTransaction: StockTransaction = {
        id: `TXN${Date.now()}`,
        itemId: newItem.id,
        itemName: newItem.name,
        type: 'purchase',
        quantity: newItem.quantity,
        unitPrice: newItem.costPrice,
        totalAmount: newItem.quantity * newItem.costPrice,
        reason: 'Initial stock',
        batchNumber: newItem.batchNumber,
        expiryDate: newItem.expiryDate,
        date: new Date().toISOString().split('T')[0],
        createdBy: 'Admin',
        notes: 'Initial inventory setup'
      }
      setTransactions(current => [...current, initialTransaction])
    }

    setItemFormData({
      type: 'medicine',
      quantity: 0,
      reorderLevel: 10,
      maxLevel: 100,
      status: 'active'
    })
    setIsAddDialogOpen(false)
    toast.success('Inventory item added successfully')
  }

  const handleAddTransaction = () => {
    if (!selectedItem || !transactionFormData.quantity || !transactionFormData.type) {
      toast.error('Please fill in all required fields')
      return
    }

    const quantity = Number(transactionFormData.quantity)
    const newTransaction: StockTransaction = {
      id: `TXN${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: transactionFormData.type as any,
      quantity,
      unitPrice: transactionFormData.unitPrice,
      totalAmount: transactionFormData.unitPrice ? quantity * transactionFormData.unitPrice : undefined,
      reason: transactionFormData.reason,
      batchNumber: transactionFormData.batchNumber,
      expiryDate: transactionFormData.expiryDate,
      issuedTo: transactionFormData.issuedTo,
      date: transactionFormData.date!,
      createdBy: 'Admin',
      notes: transactionFormData.notes
    }

    // Update inventory quantity
    const quantityChange =
      transactionFormData.type === 'purchase' || transactionFormData.type === 'return' ? quantity :
        transactionFormData.type === 'issue' || transactionFormData.type === 'expired' ? -quantity :
          quantity // adjustment can be positive or negative

    setInventory(current =>
      current.map(item =>
        item.id === selectedItem.id
          ? {
            ...item,
            quantity: Math.max(0, item.quantity + quantityChange),
            status: (item.quantity + quantityChange) <= 0 ? 'out_of_stock' : item.status,
            lastUpdated: new Date().toISOString()
          }
          : item
      )
    )

    setTransactions(current => [...current, newTransaction])
    setTransactionFormData({
      type: 'purchase',
      quantity: 0,
      date: new Date().toISOString().split('T')[0]
    })
    setIsTransactionDialogOpen(false)
    toast.success('Stock transaction recorded successfully')
  }

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setItemFormData(item)
    setIsEditDialogOpen(true)
  }

  const handleUpdateItem = () => {
    if (!selectedItem || !itemFormData.name) {
      toast.error('Please fill in required fields')
      return
    }

    setInventory(current =>
      current.map(item =>
        item.id === selectedItem.id
          ? {
            ...item,
            ...itemFormData,
            lastUpdated: new Date().toISOString()
          }
          : item
      )
    )

    setIsEditDialogOpen(false)
    setSelectedItem(null)
    setItemFormData({
      type: 'medicine',
      quantity: 0,
      reorderLevel: 10,
      maxLevel: 100,
      status: 'active'
    })
    toast.success('Item updated successfully')
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesType = filterType === 'all' || item.type === filterType

    return matchesSearch && matchesCategory && matchesType
  })

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel && item.status === 'active')
  const expiringItems = inventory.filter(item => {
    if (!item.expiryDate) return false
    const expiryDate = new Date(item.expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow && item.quantity > 0
  })
  const outOfStockItems = inventory.filter(item => item.quantity === 0)
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="supply">Supply</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(categories).flat().map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isPurchaseOrderDialogOpen} onOpenChange={setIsPurchaseOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingCartIcon className="h-4 w-4" />
                Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>Generate purchase order for low stock items</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This feature would create purchase orders for items below reorder level.
                  Currently {lowStockItems.length} items need restocking.
                </p>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                      <span>{item.name}</span>
                      <Badge variant="destructive">{item.quantity} remaining</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsPurchaseOrderDialogOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
                <DialogDescription>Add a new item to the hospital inventory</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input
                      value={itemFormData.name || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={itemFormData.type} onValueChange={(value) => setItemFormData({ ...itemFormData, type: value as any, category: '' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medicine">Medicine</SelectItem>
                        <SelectItem value="supply">Medical Supply</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={itemFormData.category} onValueChange={(value) => setItemFormData({ ...itemFormData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemFormData.type && categories[itemFormData.type as keyof typeof categories]?.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={itemFormData.unit} onValueChange={(value) => setItemFormData({ ...itemFormData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Current Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={itemFormData.quantity || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, quantity: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reorder Level</Label>
                    <Input
                      type="number"
                      min="0"
                      value={itemFormData.reorderLevel || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, reorderLevel: Number(e.target.value) })}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Level</Label>
                    <Input
                      type="number"
                      min="0"
                      value={itemFormData.maxLevel || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, maxLevel: Number(e.target.value) })}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={itemFormData.location || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, location: e.target.value })}
                      placeholder="Main Store"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cost Price (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemFormData.costPrice || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, costPrice: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling Price (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemFormData.sellingPrice || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, sellingPrice: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Supplier Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Supplier *</Label>
                    <Select value={itemFormData.supplier} onValueChange={(value) => setItemFormData({ ...itemFormData, supplier: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonSuppliers.map((supplier) => (
                          <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier Contact</Label>
                    <Input
                      value={itemFormData.supplierContact || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, supplierContact: e.target.value })}
                      placeholder="Phone/Email"
                    />
                  </div>
                </div>

                {/* Batch & Expiry Information */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Batch Number</Label>
                    <Input
                      value={itemFormData.batchNumber || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, batchNumber: e.target.value })}
                      placeholder="Batch number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manufacturing Date</Label>
                    <Input
                      type="date"
                      value={itemFormData.manufacturingDate || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, manufacturingDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={itemFormData.expiryDate || ''}
                      onChange={(e) => setItemFormData({ ...itemFormData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={itemFormData.description || ''}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                    placeholder="Additional details about the item"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <WarningIcon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendDownIcon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <CalendarIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                {filteredInventory.length} of {inventory.length} items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInventory.length === 0 ? (
                  <div className="text-center py-8">
                    <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No inventory items found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first inventory item'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredInventory.map((item) => (
                      <Card key={item.id} className={`hover:shadow-md transition-shadow ${item.quantity <= item.reorderLevel ? 'border-destructive' :
                          item.quantity === 0 ? 'border-destructive bg-destructive/5' : ''
                        }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium">{item.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {item.type === 'medicine' ? <PillIcon className="w-3 h-3 mr-1" /> :
                                    item.type === 'supply' ? <FirstAidIcon className="w-3 h-3 mr-1" /> :
                                      <PackageIcon className="w-3 h-3 mr-1" />}
                                  {item.category}
                                </Badge>
                                <Badge variant={
                                  item.status === 'active' ? 'default' :
                                    item.status === 'out_of_stock' ? 'destructive' : 'secondary'
                                }>
                                  {item.status?.replace('_', ' ') || 'Unknown'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedItem(item)
                                setIsTransactionDialogOpen(true)
                              }}>
                                <ArchiveIcon className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                                <PencilSimpleIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Stock:</span>
                              <span className={`font-medium ${item.quantity <= item.reorderLevel ? 'text-destructive' : ''
                                }`}>
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reorder Level:</span>
                              <span>{item.reorderLevel} {item.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Location:</span>
                              <span>{item.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span>₹{item.sellingPrice}</span>
                            </div>
                            {item.expiryDate && (
                              <div className="flex justify-between">
                                <span>Expires:</span>
                                <span className={
                                  new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                    ? 'text-yellow-600' : ''
                                }>
                                  {new Date(item.expiryDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {item.quantity <= item.reorderLevel && (
                            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                              <WarningIcon className="h-3 w-3 inline mr-1" />
                              Low stock - Reorder required
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <WarningIcon className="h-5 w-5" />
                  Low Stock Items ({lowStockItems.length})
                </CardTitle>
                <CardDescription>Items below reorder level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No low stock items</p>
                  ) : (
                    lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">{item.quantity} {item.unit}</Badge>
                          <p className="text-xs text-muted-foreground">
                            Min: {item.reorderLevel} {item.unit}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expiring Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <CalendarIcon className="h-5 w-5" />
                  Expiring Soon ({expiringItems.length})
                </CardTitle>
                <CardDescription>Items expiring within 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiringItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No items expiring soon</p>
                  ) : (
                    expiringItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Batch: {item.batchNumber || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-yellow-600">
                            {new Date(item.expiryDate!).toLocaleDateString()}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} {item.unit} in stock
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Transactions</CardTitle>
              <CardDescription>Recent stock movements and adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <ArchiveIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
                    <p className="text-muted-foreground">Stock transactions will appear here</p>
                  </div>
                ) : (
                  transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'purchase' ? 'bg-green-100 text-green-600' :
                              transaction.type === 'issue' ? 'bg-blue-100 text-blue-600' :
                                transaction.type === 'return' ? 'bg-yellow-100 text-yellow-600' :
                                  transaction.type === 'expired' ? 'bg-red-100 text-red-600' :
                                    'bg-gray-100 text-gray-600'
                            }`}>
                            {transaction.type === 'purchase' ? '+' :
                              transaction.type === 'issue' ? '-' :
                                transaction.type === 'return' ? '↺' :
                                  transaction.type === 'expired' ? '⚠' : '±'}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.itemName}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {transaction.type?.replace('_', ' ') || 'Unknown'} • {transaction.quantity || 0} units
                            </p>
                            {transaction.reason && (
                              <p className="text-xs text-muted-foreground">{transaction.reason}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          {transaction.totalAmount && (
                            <p className="text-sm text-muted-foreground">
                              ₹{transaction.totalAmount.toLocaleString()}
                            </p>
                          )}
                          {transaction.issuedTo && (
                            <p className="text-xs text-muted-foreground">
                              To: {transaction.issuedTo}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Transaction</DialogTitle>
            <DialogDescription>
              {selectedItem && `Update stock for ${selectedItem.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedItem && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedItem.name}</span>
                  <span>Current Stock: {selectedItem.quantity} {selectedItem.unit}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transaction Type *</Label>
                <Select value={transactionFormData.type} onValueChange={(value) => setTransactionFormData({ ...transactionFormData, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Purchase (Add Stock)</SelectItem>
                    <SelectItem value="issue">Issue (Remove Stock)</SelectItem>
                    <SelectItem value="return">Return (Add Stock)</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="expired">Mark as Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={transactionFormData.quantity || ''}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, quantity: Number(e.target.value) })}
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={transactionFormData.date}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price (if purchase)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={transactionFormData.unitPrice || ''}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, unitPrice: Number(e.target.value) })}
                  placeholder="Unit price"
                />
              </div>
            </div>

            {(transactionFormData.type === 'purchase' || transactionFormData.type === 'return') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Batch Number</Label>
                  <Input
                    value={transactionFormData.batchNumber || ''}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, batchNumber: e.target.value })}
                    placeholder="Batch number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={transactionFormData.expiryDate || ''}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, expiryDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            {transactionFormData.type === 'issue' && (
              <div className="space-y-2">
                <Label>Issued To</Label>
                <Input
                  value={transactionFormData.issuedTo || ''}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, issuedTo: e.target.value })}
                  placeholder="Department or person name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                value={transactionFormData.reason || ''}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, reason: e.target.value })}
                placeholder="Reason for transaction"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={transactionFormData.notes || ''}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTransaction}>Record Transaction</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update item information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  value={itemFormData.name || ''}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={itemFormData.reorderLevel || ''}
                  onChange={(e) => setItemFormData({ ...itemFormData, reorderLevel: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemFormData.costPrice || ''}
                  onChange={(e) => setItemFormData({ ...itemFormData, costPrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemFormData.sellingPrice || ''}
                  onChange={(e) => setItemFormData({ ...itemFormData, sellingPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={itemFormData.status} onValueChange={(value) => setItemFormData({ ...itemFormData, status: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateItem}>Update Item</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}