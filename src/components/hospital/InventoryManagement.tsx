import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Plus, Search, AlertTriangle, TrendingDown, Eye, Edit } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface InventoryItem {
  id: string
  name: string
  category: string
  type: 'medicine' | 'supply' | 'equipment'
  quantity: number
  unit: string
  reorderLevel: number
  costPrice: number
  sellingPrice: number
  supplier: string
  batchNumber?: string
  expiryDate?: string
  location: string
  description?: string
  lastUpdated: string
  createdAt: string
}

const categories = {
  medicine: [
    'Antibiotics',
    'Analgesics',
    'Antidiabetics',
    'Cardiovascular',
    'Respiratory',
    'Vaccines',
    'Vitamins',
    'Antiseptics'
  ],
  supply: [
    'Disposables',
    'Surgical Instruments',
    'Laboratory Supplies',
    'First Aid',
    'Bandages & Dressings',
    'IV Fluids',
    'Oxygen',
    'Cleaning Supplies'
  ],
  equipment: [
    'Diagnostic Equipment',
    'Surgical Equipment',
    'Patient Monitoring',
    'Laboratory Equipment',
    'Emergency Equipment',
    'Furniture',
    'IT Equipment',
    'Maintenance Tools'
  ]
}

const units = [
  'Tablets',
  'Bottles',
  'Vials',
  'Boxes',
  'Pieces',
  'Strips',
  'Packets',
  'Liters',
  'Ml',
  'Kg',
  'Grams',
  'Units'
]

const locations = [
  'Main Pharmacy',
  'Emergency Store',
  'Ward Storage',
  'Laboratory',
  'Operation Theatre',
  'ICU Storage',
  'General Store',
  'Cold Storage'
]

export default function InventoryManagement() {
  const [inventory, setInventory] = useKV('hospital-inventory', [])
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isStockUpdateOpen, setIsStockUpdateOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    type: 'medicine' as const,
    quantity: 0,
    unit: '',
    reorderLevel: 0,
    costPrice: 0,
    sellingPrice: 0,
    supplier: '',
    batchNumber: '',
    expiryDate: '',
    location: '',
    description: ''
  })

  const [stockUpdate, setStockUpdate] = useState({
    type: 'add' as 'add' | 'remove',
    quantity: 0,
    reason: '',
    notes: ''
  })

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesType = filterType === 'all' || item.type === filterType
    
    let matchesStatus = true
    if (filterStatus === 'low-stock') {
      matchesStatus = item.quantity <= item.reorderLevel
    } else if (filterStatus === 'out-of-stock') {
      matchesStatus = item.quantity === 0
    } else if (filterStatus === 'expired') {
      matchesStatus = item.expiryDate ? new Date(item.expiryDate) < new Date() : false
    } else if (filterStatus === 'expiring-soon') {
      const oneMonthFromNow = new Date()
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
      matchesStatus = item.expiryDate ? new Date(item.expiryDate) <= oneMonthFromNow : false
    }
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus
  })

  // Calculate inventory stats
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel)
  const outOfStockItems = inventory.filter(item => item.quantity === 0)
  const expiredItems = inventory.filter(item => 
    item.expiryDate && new Date(item.expiryDate) < new Date()
  )
  const expiringSoonItems = inventory.filter(item => {
    if (!item.expiryDate) return false
    const oneMonthFromNow = new Date()
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
    return new Date(item.expiryDate) <= oneMonthFromNow && new Date(item.expiryDate) >= new Date()
  })

  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.unit || !newItem.location) {
      toast.error('Please fill in all required fields')
      return
    }

    const item: InventoryItem = {
      id: `INV${Date.now()}`,
      name: newItem.name,
      category: newItem.category,
      type: newItem.type,
      quantity: newItem.quantity,
      unit: newItem.unit,
      reorderLevel: newItem.reorderLevel,
      costPrice: newItem.costPrice,
      sellingPrice: newItem.sellingPrice,
      supplier: newItem.supplier,
      batchNumber: newItem.batchNumber,
      expiryDate: newItem.expiryDate,
      location: newItem.location,
      description: newItem.description,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    setInventory(currentInventory => [...currentInventory, item])
    
    // Reset form
    setNewItem({
      name: '',
      category: '',
      type: 'medicine',
      quantity: 0,
      unit: '',
      reorderLevel: 0,
      costPrice: 0,
      sellingPrice: 0,
      supplier: '',
      batchNumber: '',
      expiryDate: '',
      location: '',
      description: ''
    })
    
    setIsDialogOpen(false)
    toast.success(`Item ${item.name} added to inventory`)
  }

  const handleUpdateStock = () => {
    if (!selectedItem || stockUpdate.quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    let newQuantity = selectedItem.quantity
    if (stockUpdate.type === 'add') {
      newQuantity += stockUpdate.quantity
    } else {
      newQuantity = Math.max(0, newQuantity - stockUpdate.quantity)
    }

    setInventory(currentInventory =>
      currentInventory.map(item =>
        item.id === selectedItem.id
          ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() }
          : item
      )
    )

    setStockUpdate({ type: 'add', quantity: 0, reason: '', notes: '' })
    setIsStockUpdateOpen(false)
    toast.success(`Stock updated for ${selectedItem.name}`)
  }

  const handleUpdateItem = () => {
    if (!selectedItem) return

    setInventory(currentInventory =>
      currentInventory.map(item =>
        item.id === selectedItem.id
          ? { ...selectedItem, lastUpdated: new Date().toISOString() }
          : item
      )
    )

    setIsEditDialogOpen(false)
    toast.success('Item updated successfully')
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (item.quantity <= item.reorderLevel) {
      return <Badge variant="default" className="bg-yellow-500">Low Stock</Badge>
    } else {
      return <Badge variant="default" className="bg-green-500">In Stock</Badge>
    }
  }

  const getExpiryStatus = (item: InventoryItem) => {
    if (!item.expiryDate) return null
    
    const expiryDate = new Date(item.expiryDate)
    const today = new Date()
    const oneMonthFromNow = new Date()
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)

    if (expiryDate < today) {
      return <Badge variant="destructive">Expired</Badge>
    } else if (expiryDate <= oneMonthFromNow) {
      return <Badge variant="default" className="bg-orange-500">Expiring Soon</Badge>
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Inventory Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              ₹{totalInventoryValue.toLocaleString()} value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Require restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Need disposal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringSoonItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
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
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Add a new medicine, supply, or equipment to the inventory.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
                <TabsTrigger value="details">Additional Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Enter item name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select 
                      value={newItem.type} 
                      onValueChange={(value: any) => setNewItem({...newItem, type: value, category: ''})}
                    >
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
                    <Select 
                      value={newItem.category} 
                      onValueChange={(value) => setNewItem({...newItem, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories[newItem.type]?.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Unit *</Label>
                    <Select 
                      value={newItem.unit} 
                      onValueChange={(value) => setNewItem({...newItem, unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select 
                    value={newItem.location} 
                    onValueChange={(value) => setNewItem({...newItem, location: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Input
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                    placeholder="Supplier name"
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Initial Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reorder Level</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newItem.reorderLevel}
                      onChange={(e) => setNewItem({...newItem, reorderLevel: parseInt(e.target.value) || 0})}
                      placeholder="Minimum stock level"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cost Price (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.costPrice}
                      onChange={(e) => setNewItem({...newItem, costPrice: parseFloat(e.target.value) || 0})}
                      placeholder="Purchase price per unit"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Selling Price (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.sellingPrice}
                      onChange={(e) => setNewItem({...newItem, sellingPrice: parseFloat(e.target.value) || 0})}
                      placeholder="Selling price per unit"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Batch Number</Label>
                    <Input
                      value={newItem.batchNumber}
                      onChange={(e) => setNewItem({...newItem, batchNumber: e.target.value})}
                      placeholder="Batch/Lot number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={newItem.expiryDate}
                      onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Additional details about the item"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No inventory items found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria' : 'Add your first inventory item'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInventory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <Badge variant="outline">{item.id}</Badge>
                        <Badge variant="secondary">{item.type}</Badge>
                        {getStockStatus(item)}
                        {getExpiryStatus(item)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <strong>Category:</strong> {item.category} • 
                          <strong> Location:</strong> {item.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Quantity:</strong> {item.quantity} {item.unit} • 
                          <strong> Reorder Level:</strong> {item.reorderLevel} {item.unit}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Cost:</strong> ₹{item.costPrice} • 
                          <strong> Selling:</strong> ₹{item.sellingPrice} per {item.unit}
                        </p>
                        {item.supplier && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Supplier:</strong> {item.supplier}
                          </p>
                        )}
                        {item.expiryDate && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Expiry:</strong> {new Date(item.expiryDate).toLocaleDateString()}
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
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Item Details</DialogTitle>
                          <DialogDescription>
                            Complete information for {item.name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedItem && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Item Name</Label>
                                <p>{selectedItem.name}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Item ID</Label>
                                <p>{selectedItem.id}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                                <p className="capitalize">{selectedItem.type}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                                <p>{selectedItem.category}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Current Stock</Label>
                                <p className="font-bold">{selectedItem.quantity} {selectedItem.unit}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Reorder Level</Label>
                                <p>{selectedItem.reorderLevel} {selectedItem.unit}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Cost Price</Label>
                                <p>₹{selectedItem.costPrice} per {selectedItem.unit}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Selling Price</Label>
                                <p>₹{selectedItem.sellingPrice} per {selectedItem.unit}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                                <p>{selectedItem.location}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Supplier</Label>
                                <p>{selectedItem.supplier || 'Not specified'}</p>
                              </div>
                              {selectedItem.batchNumber && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Batch Number</Label>
                                  <p>{selectedItem.batchNumber}</p>
                                </div>
                              )}
                              {selectedItem.expiryDate && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Expiry Date</Label>
                                  <p>{new Date(selectedItem.expiryDate).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                            
                            {selectedItem.description && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                <p className="mt-1">{selectedItem.description}</p>
                              </div>
                            )}
                            
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                              <p className="mt-1">{new Date(selectedItem.lastUpdated).toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isStockUpdateOpen} onOpenChange={setIsStockUpdateOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          Update Stock
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Stock</DialogTitle>
                          <DialogDescription>
                            Add or remove stock for {item.name}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex justify-between items-center">
                              <span>Current Stock:</span>
                              <span className="font-bold">{item.quantity} {item.unit}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Reorder Level:</span>
                              <span>{item.reorderLevel} {item.unit}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Action</Label>
                            <Select 
                              value={stockUpdate.type} 
                              onValueChange={(value: any) => setStockUpdate({...stockUpdate, type: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="add">Add Stock</SelectItem>
                                <SelectItem value="remove">Remove Stock</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={stockUpdate.quantity}
                              onChange={(e) => setStockUpdate({
                                ...stockUpdate, 
                                quantity: parseInt(e.target.value) || 0
                              })}
                              placeholder="Enter quantity"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Reason</Label>
                            <Select 
                              value={stockUpdate.reason} 
                              onValueChange={(value) => setStockUpdate({...stockUpdate, reason: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                {stockUpdate.type === 'add' ? (
                                  <>
                                    <SelectItem value="purchase">New Purchase</SelectItem>
                                    <SelectItem value="return">Patient Return</SelectItem>
                                    <SelectItem value="transfer">Transfer In</SelectItem>
                                    <SelectItem value="correction">Stock Correction</SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="dispensed">Dispensed to Patient</SelectItem>
                                    <SelectItem value="expired">Expired Items</SelectItem>
                                    <SelectItem value="damaged">Damaged Items</SelectItem>
                                    <SelectItem value="transfer">Transfer Out</SelectItem>
                                    <SelectItem value="correction">Stock Correction</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                              value={stockUpdate.notes}
                              onChange={(e) => setStockUpdate({...stockUpdate, notes: e.target.value})}
                              placeholder="Additional notes (optional)"
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsStockUpdateOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateStock}>
                            Update Stock
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Item</DialogTitle>
                          <DialogDescription>
                            Update item information for {item.name}
                          </DialogDescription>
                        </DialogHeader>

                        {selectedItem && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Item Name</Label>
                                <Input
                                  value={selectedItem.name}
                                  onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Reorder Level</Label>
                                <Input
                                  type="number"
                                  value={selectedItem.reorderLevel}
                                  onChange={(e) => setSelectedItem({
                                    ...selectedItem, 
                                    reorderLevel: parseInt(e.target.value) || 0
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Cost Price (₹)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={selectedItem.costPrice}
                                  onChange={(e) => setSelectedItem({
                                    ...selectedItem, 
                                    costPrice: parseFloat(e.target.value) || 0
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Selling Price (₹)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={selectedItem.sellingPrice}
                                  onChange={(e) => setSelectedItem({
                                    ...selectedItem, 
                                    sellingPrice: parseFloat(e.target.value) || 0
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Supplier</Label>
                                <Input
                                  value={selectedItem.supplier}
                                  onChange={(e) => setSelectedItem({...selectedItem, supplier: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Location</Label>
                                <Select 
                                  value={selectedItem.location} 
                                  onValueChange={(value) => setSelectedItem({...selectedItem, location: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {locations.map((location) => (
                                      <SelectItem key={location} value={location}>
                                        {location}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input
                                value={selectedItem.description || ''}
                                onChange={(e) => setSelectedItem({...selectedItem, description: e.target.value})}
                              />
                            </div>
                          </div>
                        )}

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateItem}>
                            Update Item
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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