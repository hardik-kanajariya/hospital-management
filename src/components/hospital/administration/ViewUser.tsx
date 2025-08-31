import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeftIcon, PencilIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { httpService } from '@/services/HttpService'
import { useNotifications } from '@/hooks/useNotifications'
import { User, Role } from '@/types/auth'

export default function ViewUser() {
    const navigate = useNavigate()
    const { userId } = useParams()
    const { addNotification } = useNotifications()

    const [user, setUser] = useState<User | null>(null)
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)

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
                setUser(response.data)
            }
        } catch (error) {
            console.error('Error loading user:', error)
            addNotification({ type: 'error', message: 'Failed to load user' })
            navigate('/users')
        } finally {
            setLoading(false)
        }
    }

    const loadRoles = async () => {
        try {
            const response = await httpService.get('/roles')
            if (response.success) {
                const roles = response.data || []
                setRoles(Array.isArray(roles) ? roles : [])
            }
        } catch (error) {
            console.error('Error loading roles:', error)
        }
    }

    const handleBack = () => {
        navigate('/users')
    }

    const handleEdit = () => {
        if (user && !isSuperAdmin()) {
            navigate(`/users/${user.id}/edit`)
        }
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

    const getRoleName = (): string => {
        if (!user) return 'Unknown Role'
        if (typeof user.role === 'object' && user.role?.displayName) {
            return user.role.displayName
        }
        if (user.roleId) {
            const role = roles.find(r => r.id === user.roleId)
            return role?.displayName || 'Unknown Role'
        }
        return typeof user.role === 'string' ? user.role : 'No Role'
    }

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleString()
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">Loading user...</div>
                </CardContent>
            </Card>
        )
    }

    if (!user) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-red-600 mb-2">User Not Found</h3>
                        <p className="text-muted-foreground mb-4">The requested user could not be found.</p>
                        <Button onClick={handleBack}>Return to Users</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="p-2"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle>User Details</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    View user information and permissions
                                </p>
                            </div>
                        </div>
                        {!isSuperAdmin() && (
                            <Button onClick={handleEdit} variant="outline">
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Edit User
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isSuperAdmin() && (
                        <Alert>
                            <ShieldCheckIcon className="h-4 w-4" />
                            <AlertDescription>
                                This is a Super Administrator account with full system access.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                                <p className="text-base">{user.name}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                                <p className="text-base">{user.email}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                                <p className="text-base">{user.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                                <p className="text-base">{getRoleName()}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                                <p className="text-base">{user.department || 'Not assigned'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Employee ID</h3>
                                <p className="text-base">{user.employeeId || 'Not assigned'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Last Login</h3>
                            <p className="text-base">{formatDate(user.lastLogin)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                            <p className="text-base">{formatDate(user.createdAt)}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                            <p className="text-base">{formatDate((user as any).updatedAt)}</p>
                        </div>
                    </div>

                    {(user as any).roleData && Object.keys((user as any).roleData).length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium mb-4">Role-Specific Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries((user as any).roleData).map(([key, value]) => (
                                    <div key={key}>
                                        <h4 className="text-sm font-medium text-muted-foreground capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </h4>
                                        <p className="text-base">
                                            {value !== null && value !== undefined ? String(value) : 'Not provided'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
