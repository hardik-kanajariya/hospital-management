import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
    WarningIcon,
    ShieldCheckIcon,
    HeartIcon,
    PillIcon,
    SyringeIcon,
    ChartBarIcon,
    BellIcon,
    XIcon,
    CheckIcon,
    ClockIcon,
    UserIcon,
    EyeIcon,
    TrendUpIcon,
    TrendDownIcon,
    ActivityIcon
} from '@phosphor-icons/react'

interface ClinicalAlert {
    id: string
    type: 'critical' | 'warning' | 'info' | 'medication' | 'allergy' | 'appointment'
    severity: 'high' | 'medium' | 'low'
    title: string
    message: string
    timestamp: string
    patientId?: string
    patientName?: string
    actionRequired: boolean
    acknowledged: boolean
    category: string
    data?: any
}

interface DrugInteraction {
    id: string
    drug1: string
    drug2: string
    severity: 'severe' | 'moderate' | 'mild'
    description: string
    recommendation: string
    patientId: string
    patientName: string
}

interface RiskScore {
    patientId: string
    patientName: string
    overallScore: number
    category: 'low' | 'medium' | 'high' | 'critical'
    factors: {
        name: string
        score: number
        weight: number
        description: string
    }[]
    lastUpdated: string
    trending: 'up' | 'down' | 'stable'
}

interface ImmunizationDue {
    id: string
    patientId: string
    patientName: string
    vaccineName: string
    dueDate: string
    overdue: boolean
    priority: 'routine' | 'urgent' | 'critical'
    ageGroup: string
}

export default function ClinicalAlertsMonitoring() {
    const [alerts, setAlerts] = useState<ClinicalAlert[]>([])
    const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([])
    const [riskScores, setRiskScores] = useState<RiskScore[]>([])
    const [immunizationsDue, setImmunizationsDue] = useState<ImmunizationDue[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedFilter, setSelectedFilter] = useState('all')
    const [alertPreferences, setAlertPreferences] = useState({
        criticalAlerts: true,
        warningAlerts: true,
        infoAlerts: false,
        drugInteractions: true,
        immunizationReminders: true,
        riskScoreChanges: true
    })

    useEffect(() => {
        fetchClinicalData()
    }, [])

    const fetchClinicalData = async () => {
        setLoading(true)
        try {
            // Fetch all clinical monitoring data
            await Promise.all([
                fetchAlerts(),
                fetchDrugInteractions(),
                fetchRiskScores(),
                fetchImmunizationsDue()
            ])
        } catch (error) {
            console.error('Error fetching clinical data:', error)
            toast.error('Failed to load clinical monitoring data')
        } finally {
            setLoading(false)
        }
    }

    const fetchAlerts = async () => {
        // Mock data - in real app this would be an API call
        const mockAlerts: ClinicalAlert[] = [
            {
                id: 'alert-1',
                type: 'critical',
                severity: 'high',
                title: 'Severe Allergy Alert',
                message: 'Patient John Doe has severe penicillin allergy. Verify prescriptions before administration.',
                timestamp: new Date().toISOString(),
                patientId: 'pat-001',
                patientName: 'John Doe',
                actionRequired: true,
                acknowledged: false,
                category: 'Allergy Management'
            },
            {
                id: 'alert-2',
                type: 'warning',
                severity: 'medium',
                title: 'Medication Interaction',
                message: 'Potential interaction between Warfarin and Aspirin for Sarah Smith.',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                patientId: 'pat-002',
                patientName: 'Sarah Smith',
                actionRequired: true,
                acknowledged: false,
                category: 'Drug Interactions'
            },
            {
                id: 'alert-3',
                type: 'appointment',
                severity: 'medium',
                title: 'Overdue Appointment',
                message: 'Michael Johnson has missed 2 consecutive appointments.',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                patientId: 'pat-003',
                patientName: 'Michael Johnson',
                actionRequired: true,
                acknowledged: false,
                category: 'Appointment Management'
            },
            {
                id: 'alert-4',
                type: 'info',
                severity: 'low',
                title: 'Lab Results Available',
                message: 'New lab results available for Emily Davis.',
                timestamp: new Date(Date.now() - 10800000).toISOString(),
                patientId: 'pat-004',
                patientName: 'Emily Davis',
                actionRequired: false,
                acknowledged: true,
                category: 'Lab Results'
            }
        ]
        setAlerts(mockAlerts)
    }

    const fetchDrugInteractions = async () => {
        const mockInteractions: DrugInteraction[] = [
            {
                id: 'interaction-1',
                drug1: 'Warfarin',
                drug2: 'Aspirin',
                severity: 'severe',
                description: 'Increased risk of bleeding when used together',
                recommendation: 'Monitor INR closely and consider alternative antiplatelet therapy',
                patientId: 'pat-002',
                patientName: 'Sarah Smith'
            },
            {
                id: 'interaction-2',
                drug1: 'Simvastatin',
                drug2: 'Amlodipine',
                severity: 'moderate',
                description: 'May increase simvastatin exposure and risk of myopathy',
                recommendation: 'Consider dose reduction of simvastatin or alternative statin',
                patientId: 'pat-005',
                patientName: 'Robert Wilson'
            }
        ]
        setDrugInteractions(mockInteractions)
    }

    const fetchRiskScores = async () => {
        const mockRiskScores: RiskScore[] = [
            {
                patientId: 'pat-001',
                patientName: 'John Doe',
                overallScore: 85,
                category: 'high',
                trending: 'up',
                lastUpdated: new Date().toISOString(),
                factors: [
                    { name: 'Age', score: 20, weight: 0.3, description: '> 65 years old' },
                    { name: 'Diabetes', score: 25, weight: 0.25, description: 'Type 2 diabetes with complications' },
                    { name: 'Hypertension', score: 20, weight: 0.2, description: 'Uncontrolled blood pressure' },
                    { name: 'Smoking', score: 20, weight: 0.25, description: 'Current smoker' }
                ]
            },
            {
                patientId: 'pat-002',
                patientName: 'Sarah Smith',
                overallScore: 45,
                category: 'medium',
                trending: 'stable',
                lastUpdated: new Date(Date.now() - 86400000).toISOString(),
                factors: [
                    { name: 'Age', score: 10, weight: 0.3, description: '45-65 years old' },
                    { name: 'Family History', score: 15, weight: 0.2, description: 'Family history of heart disease' },
                    { name: 'BMI', score: 10, weight: 0.15, description: 'Overweight (BMI 27)' },
                    { name: 'Medication Compliance', score: 10, weight: 0.35, description: 'Occasional missed doses' }
                ]
            }
        ]
        setRiskScores(mockRiskScores)
    }

    const fetchImmunizationsDue = async () => {
        const mockImmunizations: ImmunizationDue[] = [
            {
                id: 'imm-1',
                patientId: 'pat-003',
                patientName: 'Michael Johnson',
                vaccineName: 'Influenza',
                dueDate: new Date(Date.now() - 86400000 * 7).toISOString(),
                overdue: true,
                priority: 'urgent',
                ageGroup: 'Adult'
            },
            {
                id: 'imm-2',
                patientId: 'pat-004',
                patientName: 'Emily Davis',
                vaccineName: 'Tetanus/Diphtheria',
                dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
                overdue: false,
                priority: 'routine',
                ageGroup: 'Adult'
            }
        ]
        setImmunizationsDue(mockImmunizations)
    }

    const acknowledgeAlert = async (alertId: string) => {
        try {
            // API call to acknowledge alert
            setAlerts(prev => prev.map(alert => 
                alert.id === alertId ? { ...alert, acknowledged: true } : alert
            ))
            toast.success('Alert acknowledged')
        } catch (error) {
            toast.error('Failed to acknowledge alert')
        }
    }

    const dismissAlert = async (alertId: string) => {
        try {
            // API call to dismiss alert
            setAlerts(prev => prev.filter(alert => alert.id !== alertId))
            toast.success('Alert dismissed')
        } catch (error) {
            toast.error('Failed to dismiss alert')
        }
    }

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <WarningIcon className="w-5 h-5" />
            case 'warning':
                return <WarningIcon className="w-5 h-5" />
            case 'medication':
                return <PillIcon className="w-5 h-5" />
            case 'allergy':
                return <ShieldCheckIcon className="w-5 h-5" />
            case 'appointment':
                return <ClockIcon className="w-5 h-5" />
            default:
                return <BellIcon className="w-5 h-5" />
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'destructive'
            case 'medium':
                return 'default'
            case 'low':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    const getRiskCategoryColor = (category: string) => {
        switch (category) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const filteredAlerts = alerts.filter(alert => {
        if (selectedFilter === 'all') return true
        if (selectedFilter === 'critical') return alert.type === 'critical'
        if (selectedFilter === 'warning') return alert.type === 'warning'
        if (selectedFilter === 'unacknowledged') return !alert.acknowledged
        if (selectedFilter === 'action-required') return alert.actionRequired
        return true
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading clinical monitoring data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Clinical Alerts & Monitoring</h2>
                    <p className="text-muted-foreground">Real-time clinical decision support and patient monitoring</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <BellIcon className="w-4 h-4" />
                        <Switch
                            checked={alertPreferences.criticalAlerts}
                            onCheckedChange={(checked) => 
                                setAlertPreferences(prev => ({ ...prev, criticalAlerts: checked }))
                            }
                        />
                        <span className="text-sm">Notifications</span>
                    </div>
                    <Button onClick={fetchClinicalData} variant="outline" size="sm">
                        <ActivityIcon className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <WarningIcon className="w-5 h-5 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold text-red-600">
                                    {alerts.filter(a => a.type === 'critical').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <PillIcon className="w-5 h-5 text-orange-500" />
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{drugInteractions.length}</p>
                                <p className="text-sm text-muted-foreground">Drug Interactions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {riskScores.filter(r => r.category === 'high' || r.category === 'critical').length}
                                </p>
                                <p className="text-sm text-muted-foreground">High Risk Patients</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <SyringeIcon className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold text-green-600">
                                    {immunizationsDue.filter(i => i.overdue).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Overdue Immunizations</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alerts Panel */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <BellIcon className="w-5 h-5" />
                                Active Alerts
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="text-sm border rounded px-2 py-1"
                                >
                                    <option value="all">All Alerts</option>
                                    <option value="critical">Critical</option>
                                    <option value="warning">Warning</option>
                                    <option value="unacknowledged">Unacknowledged</option>
                                    <option value="action-required">Action Required</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                                {filteredAlerts.map((alert) => (
                                    <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                                        <div className="flex items-start justify-between w-full">
                                            <div className="flex items-start gap-3">
                                                {getAlertIcon(alert.type)}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold">{alert.title}</h4>
                                                        <Badge variant={getSeverityColor(alert.severity) as any}>
                                                            {alert.severity}
                                                        </Badge>
                                                        {alert.actionRequired && (
                                                            <Badge variant="outline">Action Required</Badge>
                                                        )}
                                                    </div>
                                                    <AlertDescription className="mb-2">
                                                        {alert.message}
                                                    </AlertDescription>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>
                                                            {alert.patientName && (
                                                                <span className="flex items-center gap-1">
                                                                    <UserIcon className="w-3 h-3" />
                                                                    {alert.patientName}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2">
                                                {!alert.acknowledged && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => acknowledgeAlert(alert.id)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <CheckIcon className="w-3 h-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => dismissAlert(alert.id)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <XIcon className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Alert>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Risk Scores Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5" />
                            Patient Risk Scores
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-4">
                                {riskScores.map((risk) => (
                                    <div key={risk.patientId} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold">{risk.patientName}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Last updated: {new Date(risk.lastUpdated).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getRiskCategoryColor(risk.category)}>
                                                    {risk.category.toUpperCase()}
                                                </Badge>
                                                {risk.trending === 'up' ? (
                                                    <TrendUpIcon className="w-4 h-4 text-red-500" />
                                                ) : risk.trending === 'down' ? (
                                                    <TrendDownIcon className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">Overall Risk Score</span>
                                                <span className="text-2xl font-bold">{risk.overallScore}</span>
                                            </div>
                                            <Progress value={risk.overallScore} className="h-2" />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {risk.factors.slice(0, 3).map((factor, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">{factor.name}</span>
                                                    <span className="font-medium">{factor.score}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <Button variant="ghost" size="sm" className="mt-2 w-full">
                                            <EyeIcon className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Drug Interactions and Immunizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Drug Interactions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PillIcon className="w-5 h-5" />
                            Drug Interactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {drugInteractions.map((interaction) => (
                                <div key={interaction.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">{interaction.patientName}</h4>
                                        <Badge variant={
                                            interaction.severity === 'severe' ? 'destructive' :
                                            interaction.severity === 'moderate' ? 'default' : 'secondary'
                                        }>
                                            {interaction.severity}
                                        </Badge>
                                    </div>
                                    <p className="text-sm mb-2">
                                        <span className="font-medium">{interaction.drug1}</span> + 
                                        <span className="font-medium"> {interaction.drug2}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {interaction.description}
                                    </p>
                                    <div className="bg-muted p-2 rounded text-sm">
                                        <strong>Recommendation:</strong> {interaction.recommendation}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Immunizations Due */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SyringeIcon className="w-5 h-5" />
                            Immunizations Due
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {immunizationsDue.map((immunization) => (
                                <div key={immunization.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">{immunization.patientName}</h4>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={
                                                immunization.priority === 'critical' ? 'destructive' :
                                                immunization.priority === 'urgent' ? 'default' : 'secondary'
                                            }>
                                                {immunization.priority}
                                            </Badge>
                                            {immunization.overdue && (
                                                <Badge variant="destructive">Overdue</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium mb-1">{immunization.vaccineName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Due: {new Date(immunization.dueDate).toLocaleDateString()}
                                        {immunization.overdue && (
                                            <span className="text-red-600 ml-2">
                                                ({Math.floor((Date.now() - new Date(immunization.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
