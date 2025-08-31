import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { Role } from '@/types/auth'

interface UserFormData {
    name: string
    email: string
    password: string
    roleId: string
    phone: string
    department: string
    isActive: boolean
}

export default function CreateUser() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { addNotification } = useNotifications()

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
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')

    useEffect(() => {
        loadRoles()
        
        // Handle role preselection from URL parameters
        const preSelectedRole = searchParams.get('role')
        if (preSelectedRole && roles.length > 0) {
            const selectedRole = roles.find(role => role.name === preSelectedRole)
            if (selectedRole) {
                setFormData(prev => ({ ...prev, roleId: selectedRole.id }))
            }
        }
    }, [searchParams, roles.length])

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

            const response = await httpService.post('/users', payload)
            
            if (response.success) {
                addNotification({ type: 'success', message: 'User created successfully' })
                navigate('/users')
            } else {
                addNotification({ type: 'error', message: response.message || 'Failed to create user' })
            }
        } catch (error: any) {
            console.error('Error creating user:', error)
            addNotification({ 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to create user' 
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        navigate('/users')
    }

    const selectedRole = roles.find(role => role.id === formData.roleId)

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
                            <CardTitle>Create New User</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Add a new staff member to the hospital system
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
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            required
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
                                {loading ? 'Creating...' : 'Create User'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
