import { useState } from 'react';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    MagnifyingGlassIcon,
    UserIcon,
    PhoneIcon,
    XIcon
} from '@phosphor-icons/react'
import { usePatientSearch } from '@/hooks/usePatientApi'
import { Patient } from '@/types/patient'

interface PatientSearchProps {
    onSelect: (patient: Patient) => void
    onClose?: () => void
    placeholder?: string
    className?: string
}

export default function PatientSearch({ onSelect, onClose, placeholder, className }: PatientSearchProps) {
    const [query, setQuery] = useState('')
    const { searchResults, loading, search, clearSearch } = usePatientSearch()

    const handleSearch = (value: string) => {
        setQuery(value)
        if (value.trim().length >= 2) {
            search(value)
        } else {
            clearSearch()
        }
    }

    const handleSelect = (patient: Patient) => {
        onSelect(patient)
        setQuery('')
        clearSearch()
    }

    const calculateAge = (dateOfBirth: string) => {
        return Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder={placeholder || "Search patients by name, phone, or patient ID..."}
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10"
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => {
                            setQuery('')
                            clearSearch()
                        }}
                    >
                        <XIcon className="w-3 h-3" />
                    </Button>
                )}
                {onClose && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={onClose}
                    >
                        <XIcon className="w-3 h-3" />
                    </Button>
                )}
            </div>

            {/* Search Results */}
            {query.length >= 2 && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">Searching patients...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="divide-y">
                                {searchResults.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => handleSelect(patient)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <UserIcon className="w-4 h-4 text-primary" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{patient.name}</p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span>{patient.patient_id}</span>
                                                        <span className="flex items-center gap-1">
                                                            <PhoneIcon className="w-3 h-3" />
                                                            {patient.phone}
                                                        </span>
                                                        <span>{calculateAge(patient.date_of_birth)} years</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {patient.blood_group && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {patient.blood_group}
                                                    </Badge>
                                                )}
                                                {patient.allergies && patient.allergies.length > 0 && (
                                                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                                                        Allergies
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center">
                                <UserIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                                <p className="text-sm text-muted-foreground">No patients found</p>
                                <p className="text-xs text-muted-foreground">Try a different search term</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
