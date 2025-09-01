import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon } from '@phosphor-icons/react'

export default function CreateBed() {
    const navigate = useNavigate()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/beds')}>
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Bed Management
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Add New Bed</h1>
                    <p className="text-muted-foreground">Add a new bed to the system</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Bed Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This component will be implemented in the next phase.
                        For now, you can go back to the bed management.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
