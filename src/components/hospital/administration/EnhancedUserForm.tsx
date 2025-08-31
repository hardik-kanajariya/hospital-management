import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DynamicRoleForm } from './DynamicRoleForm'
import { httpService } from '@/services/HttpService'
import { useNotifications } from '@/hooks/useNotifications'
import { User, Role } from '@/types/auth'

interface UserFormData {
    name: string
    email: string
    password: string
    roleId: string
    phone: string
    department: string
    isActive: boolean
}

interface EnhancedUserFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: User | null
    roles: Role[]
    onSave: () => void
}

export function EnhancedUserForm({ open, onOpenChange, user, roles, onSave }: EnhancedUserFormProps) {
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        roleId: '',
        phone: '',
        department: '',
        isActive: true
    })
    const [roleData, setRoleData] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')
    const { addNotification } = useNotifications()

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                roleId: user.roleId || '',
                phone: user.phone || '',
                department: user.department || '',
                isActive: user.isActive ?? true
            })

            // Load existing role data if editing
            if ((user as any).roleData) {
                setRoleData((user as any).roleData)
            } else {
                loadUserRoleData(user.id)
            }
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                roleId: '',
                phone: '',
                department: '',
                isActive: true
            })
            setRoleData({})
        }
    }, [user])

    const loadUserRoleData = async (userId: string) => {
        try {
            const response = await httpService.get(`/role-fields/user/${userId}/data`)
            if (response.success) {
                setRoleData(response.data || {})
            }
        } catch (error) {
            console.error('Error loading user role data:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.roleId) {
            addNotification({
                message: 'Please fill in all required fields',
                type: 'error'
            })
            return
        }

        if (!user && !formData.password) {
            addNotification({
                message: 'Password is required for new users',
                type: 'error'
            })
            return
        }

        try {
            setLoading(true)

            const payload: any = {
                ...formData,
                roleData
            }

            if (user) {
                // Update existing user
                if (!formData.password) {
                    delete payload.password
                }

                await httpService.put(`/users/${user.id}`, payload)
                addNotification({
                    message: 'User updated successfully',
                    type: 'success'
                })
            } else {
                // Create new user
                await httpService.post('/users', payload)
                addNotification({
                    message: 'User created successfully',
                    type: 'success'
                })
            }

            onSave()
            onOpenChange(false)
            resetForm()
        } catch (error: any) {
            console.error('Error saving user:', error)
            addNotification({
                message: error.response?.data?.message || 'Failed to save user',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            roleId: '',
            phone: '',
            department: '',
            isActive: true
        })
        setRoleData({})
        setActiveTab('basic')
    }

    const handleRoleDataSubmit = async (data: Record<string, any>) => {
        setRoleData(data)
        // Don't save to server yet, wait for main form submission
        return Promise.resolve()
    }

    const selectedRole = roles.find(role => role.id === formData.roleId)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
                    <DialogDescription>
                        {user ? 'Update user information and role-specific data' : 'Enter user information and role-specific data'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Information</TabsTrigger>
                            <TabsTrigger value="role" disabled={!formData.roleId}>
                                Role Information
                                {selectedRole && ` (${selectedRole.displayName})`}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="Enter email address"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input
                                                id="department"
                                                value={formData.department}
                                                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                                placeholder="Enter department"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role *</Label>
                                            <Select
                                                value={formData.roleId}
                                                onValueChange={(value) => {
                                                    setFormData(prev => ({ ...prev, roleId: value }))
                                                    setRoleData({}) // Reset role data when role changes
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={role.id}>
                                                            {role.displayName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Password {!user && '*'}
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                placeholder={user ? "Leave empty to keep current" : "Enter password"}
                                                required={!user}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                        />
                                        <Label htmlFor="isActive">Active User</Label>
                                    </div>

                                    {formData.roleId && (
                                        <div className="pt-4">
                                            <Button
                                                type="button"
                                                onClick={() => setActiveTab('role')}
                                                variant="outline"
                                                className="w-full"
                                            >
                                                Configure Role Information →
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="role" className="space-y-4">
                            {formData.roleId ? (
                                <DynamicRoleForm
                                    roleId={formData.roleId}
                                    initialData={roleData}
                                    onSubmit={handleRoleDataSubmit}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-center text-gray-500">
                                            Please select a role first
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
