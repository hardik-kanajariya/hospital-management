import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon } from '@phosphor-icons/react'

export default function ViewBill() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/billing')}>
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Billing
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">View Bill</h1>
                    <p className="text-muted-foreground">Bill ID: {id}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bill Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This component will be implemented in the next phase.
                        For now, you can go back to the billing list.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
