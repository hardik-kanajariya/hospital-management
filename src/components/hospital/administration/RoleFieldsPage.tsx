import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import { httpService } from '@/services/HttpService'
import { Role } from '@/types/auth'
import { toast } from 'sonner'
import { RoleFieldManagement } from './RoleFieldManagement'

export default function RoleFieldsPage() {
    const { roleId } = useParams<{ roleId: string }>()
    const navigate = useNavigate()
    const [role, setRole] = useState<Role | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (roleId) {
            loadRole()
        }
    }, [roleId])

    const loadRole = async () => {
        try {
            const response = await httpService.get(`/roles/${roleId}`)
            if (response.success) {
                setRole(response.data)
            } else {
                toast.error('Role not found')
                navigate('/admin/roles')
            }
        } catch (error) {
            toast.error('Failed to load role')
            navigate('/admin/roles')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">Loading role...</div>
                </CardContent>
            </Card>
        )
    }

    if (!role) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">Role not found</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/roles')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Roles
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{role.displayName} - Role Fields</h1>
                        <p className="text-muted-foreground">
                            Configure custom fields for {role.displayName} role
                        </p>
                    </div>
                </div>
            </div>

            <RoleFieldManagement
                roleId={role.id}
                roleName={role.displayName}
                isSystemRole={role.isSystemRole}
            />
        </div>
    )
}
