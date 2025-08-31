import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'

interface RoleFieldSchema {
    id: string
    name: string
    label: string
    type: 'text' | 'email' | 'number' | 'decimal' | 'boolean' | 'date' | 'datetime' | 'select' | 'multi_select' | 'textarea' | 'file' | 'phone' | 'url'
    required: boolean
    options?: {
        options?: Array<{ value: string; label: string }>
    }
    validation?: {
        min?: number
        max?: number
        minLength?: number
        maxLength?: number
        pattern?: string
    }
    description?: string
    sortOrder: number
}

interface DynamicRoleFormProps {
    roleId: string
    initialData?: Record<string, any>
    onSubmit: (data: Record<string, any>) => Promise<void>
    className?: string
}

export function DynamicRoleForm({ roleId, initialData = {}, onSubmit, className }: DynamicRoleFormProps) {
    const [schema, setSchema] = useState<RoleFieldSchema[]>([])
    const [formData, setFormData] = useState<Record<string, any>>(initialData)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const { addNotification } = useNotifications()

    useEffect(() => {
        if (roleId) {
            fetchRoleSchema()
        }
    }, [roleId])

    useEffect(() => {
        setFormData(initialData)
    }, [initialData])

    const fetchRoleSchema = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/role-fields/role/${roleId}/schema`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch role schema')
            }

            const result = await response.json()
            setSchema(result.data || [])
        } catch (error) {
            console.error('Error fetching role schema:', error)
            addNotification({
                message: 'Failed to load role fields',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const validateField = (field: RoleFieldSchema, value: any): string | null => {
        if (field.required && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
            return `${field.label} is required`
        }

        if (value && field.validation) {
            const { min, max, minLength, maxLength, pattern } = field.validation

            if (field.type === 'number' || field.type === 'decimal') {
                const numValue = Number(value)
                if (min !== undefined && numValue < min) {
                    return `${field.label} must be at least ${min}`
                }
                if (max !== undefined && numValue > max) {
                    return `${field.label} must be at most ${max}`
                }
            }

            if (field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'phone' || field.type === 'url') {
                const strValue = String(value)
                if (minLength !== undefined && strValue.length < minLength) {
                    return `${field.label} must be at least ${minLength} characters`
                }
                if (maxLength !== undefined && strValue.length > maxLength) {
                    return `${field.label} must be at most ${maxLength} characters`
                }
                if (pattern && !new RegExp(pattern).test(strValue)) {
                    return `${field.label} format is invalid`
                }
            }

            if (field.type === 'email') {
                const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
                if (!emailRegex.test(String(value))) {
                    return `${field.label} must be a valid email`
                }
            }

            if (field.type === 'phone') {
                const phoneRegex = /^[\\+]?[1-9][\\d]{0,15}$/
                if (!phoneRegex.test(String(value).replace(/[\\s\\-\\(\\)]/g, ''))) {
                    return `${field.label} must be a valid phone number`
                }
            }

            if (field.type === 'url') {
                try {
                    new URL(String(value))
                } catch {
                    return `${field.label} must be a valid URL`
                }
            }
        }

        return null
    }

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }))

        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate all fields
        const newErrors: Record<string, string> = {}
        schema.forEach(field => {
            const error = validateField(field, formData[field.name])
            if (error) {
                newErrors[field.name] = error
            }
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            addNotification({
                message: 'Please fix the errors in the form',
                type: 'error'
            })
            return
        }

        try {
            setSubmitting(true)
            await onSubmit(formData)
            addNotification({
                message: 'Data saved successfully',
                type: 'success'
            })
        } catch (error) {
            console.error('Error submitting form:', error)
            addNotification({
                message: 'Failed to save data',
                type: 'error'
            })
        } finally {
            setSubmitting(false)
        }
    }

    const renderField = (field: RoleFieldSchema) => {
        const value = formData[field.name] || ''
        const error = errors[field.name]

        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
            case 'url':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id={field.name}
                            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.description}
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {field.description && !error && (
                            <p className="text-sm text-gray-500">{field.description}</p>
                        )}
                    </div>
                )

            case 'number':
            case 'decimal':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id={field.name}
                            type="number"
                            step={field.type === 'decimal' ? '0.01' : '1'}
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.description}
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {field.description && !error && (
                            <p className="text-sm text-gray-500">{field.description}</p>
                        )}
                    </div>
                )

            case 'textarea':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Textarea
                            id={field.name}
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.description}
                            className={error ? 'border-red-500' : ''}
                            rows={4}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {field.description && !error && (
                            <p className="text-sm text-gray-500">{field.description}</p>
                        )}
                    </div>
                )

            case 'boolean':
                return (
                    <div key={field.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id={field.name}
                                checked={Boolean(value)}
                                onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                            />
                            <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {field.description && !error && (
                            <p className="text-sm text-gray-500">{field.description}</p>
                        )}
                    </div>
                )

            case 'select':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Select value={value} onValueChange={(newValue) => handleFieldChange(field.name, newValue)}>
                            <SelectTrigger className={error ? 'border-red-500' : ''}>
                                <SelectValue placeholder={`Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {field.description && !error && (
                            <p className="text-sm text-gray-500">{field.description}</p>
                        )}
                    </div>
                )

            case 'multi_select':
                const selectedValues = Array.isArray(value) ? value : []
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                            {field.options?.options?.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${field.name}-${option.value}`}
                                        checked={selectedValues.includes(option.value)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                handleFieldChange(field.name, [...selectedValues, option.value])
                                            } else {
                                                handleFieldChange(field.name, selectedValues.filter(v => v !== option.value))
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`${field.name}-${option.value}`} className="text-sm">
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {field.description && !error && (
                            <p className="text-sm text-gray-500">{field.description}</p>
                        )}
                    </div>
                )

            case 'date':
            case 'datetime':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !value && "text-muted-foreground",
                                        error && "border-red-500"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {value ? format(new Date(value), field.type === 'datetime' ? 'PPP HH:mm' : 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={value ? new Date(value) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            handleFieldChange(field.name, date.toISOString())
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {field.description && !error && (
                            <p className="text-sm text-gray-500">{field.description}</p>
                        )}
                    </div>
                )

            default:
                return null
        }
    }

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (schema.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <p className="text-center text-gray-500">No additional fields required for this role</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Role Specific Information</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {schema
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(renderField)}

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
