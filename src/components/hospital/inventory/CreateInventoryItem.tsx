import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon } from '@phosphor-icons/react'

export default function CreateInventoryItem() {
    const navigate = useNavigate()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/inventory')}>
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Inventory
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Add Inventory Item</h1>
                    <p className="text-muted-foreground">Add a new item to inventory</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Inventory Item Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This component will be implemented in the next phase.
                        For now, you can go back to the inventory management.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
