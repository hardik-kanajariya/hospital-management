import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon } from '@phosphor-icons/react'

export default function CreateLabTest() {
    const navigate = useNavigate()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/lab')}>
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Lab Management
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Create Lab Test</h1>
                    <p className="text-muted-foreground">Add a new lab test to the system</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Lab Test Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This component will be implemented in the next phase.
                        For now, you can go back to the lab management.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
