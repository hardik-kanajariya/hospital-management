import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { DynamicRoleForm } from './DynamicRoleForm'
import { httpService } from '@/services/HttpService'
import { useNotifications } from '@/hooks/useNotifications'
import { User, Role } from '@/types/auth'

interface UserFormData {
    name: string
    email: string
    password?: string
    roleId: string
    phone: string
    department: string
    isActive: boolean
}

export default function EditUser() {
    const navigate = useNavigate()
    const { userId } = useParams()
    const { addNotification } = useNotifications()

    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        roleId: '',
        phone: '',
        department: '',
        isActive: true
    })
    const [roleData, setRoleData] = useState<Record<string, any>>({})
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('basic')
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        if (userId) {
            loadUser()
            loadRoles()
        }
    }, [userId])

    const loadUser = async () => {
        try {
            const response = await httpService.get(`/users/${userId}`)
            if (response.success) {
                const userData = response.data
                setUser(userData)
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    roleId: userData.roleId || '',
                    phone: userData.phone || '',
                    department: userData.department || '',
                    isActive: userData.isActive ?? true
                })
                setRoleData(userData.roleData || {})
            }
        } catch (error) {
            console.error('Error loading user:', error)
            addNotification({ type: 'error', message: 'Failed to load user' })
            navigate('/users')
        } finally {
            setInitialLoading(false)
        }
    }

    const loadRoles = async () => {
        try {
            const response = await httpService.get('/roles')
            if (response.success) {
                const roles = response.data || []
                setRoles(Array.isArray(roles) ? roles.filter((role: Role) => role.isActive) : [])
            }
        } catch (error) {
            console.error('Error loading roles:', error)
            addNotification({ type: 'error', message: 'Failed to load roles' })
        }
    }

    const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...formData,
                roleData: Object.keys(roleData).length > 0 ? roleData : undefined
            }

            // Remove password if it's empty (don't update password)
            if (!payload.password) {
                delete payload.password
            }

            const response = await httpService.put(`/users/${userId}`, payload)
            
            if (response.success) {
                addNotification({ type: 'success', message: 'User updated successfully' })
                navigate('/users')
            } else {
                addNotification({ type: 'error', message: response.message || 'Failed to update user' })
            }
        } catch (error: any) {
            console.error('Error updating user:', error)
            addNotification({ 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to update user' 
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        navigate('/users')
    }

    // Check if user is super admin
    const isSuperAdmin = (): boolean => {
        if (!user) return false
        if (typeof user.role === 'object' && user.role?.name) {
            return user.role.name === 'super_admin'
        }
        if (user.roleId) {
            const role = roles.find(r => r.id === user.roleId)
            return role?.name === 'super_admin'
        }
        return typeof user.role === 'string' && user.role === 'super_admin'
    }

    const selectedRole = roles.find(role => role.id === formData.roleId)

    if (initialLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">Loading user...</div>
                </CardContent>
            </Card>
        )
    }

    if (isSuperAdmin()) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-red-600 mb-2">Access Denied</h3>
                        <p className="text-muted-foreground mb-4">Super Administrator users cannot be modified.</p>
                        <Button onClick={handleCancel}>Return to Users</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleCancel}
                            className="p-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle>Edit User</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Update user information and role details
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                                <TabsTrigger value="role" disabled={!formData.roleId}>
                                    Role Details
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password || ''}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            placeholder="Enter new password or leave blank"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={formData.roleId}
                                            onValueChange={(value) => handleInputChange('roleId', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
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
                                        <Label htmlFor="department">Department</Label>
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) => handleInputChange('department', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                    />
                                    <Label htmlFor="isActive">User is active</Label>
                                </div>

                                {formData.roleId && (
                                    <div className="pt-4">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setActiveTab('role')}
                                        >
                                            Continue to Role Details →
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="role" className="space-y-4">
                                {selectedRole && (
                                    <DynamicRoleForm
                                        roleId={selectedRole.id}
                                        initialData={roleData}
                                        onSubmit={async (data) => {
                                            setRoleData(data)
                                        }}
                                    />
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end space-x-2 pt-6">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update User'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
