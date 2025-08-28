// Sync status component for monitoring offline/online state
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSyncStatus } from '@/hooks/useData'
import { CloudArrowUpIcon, WifiSlashIcon, PulseIcon, WarningIcon, CheckCircleIcon } from '@phosphor-icons/react'

interface SyncStatusProps {
  onSyncNow?: () => void
  className?: string
}

export default function SyncStatus({ onSyncNow, className }: SyncStatusProps) {
  const status = useSyncStatus()

  const getStatusColor = () => {
    if (!status.isOnline) return 'text-orange-600 border-orange-600'
    if (status.syncInProgress) return 'text-blue-600 border-blue-600'
    if (status.pendingSync > 0) return 'text-yellow-600 border-yellow-600'
    return 'text-green-600 border-green-600'
  }

  const getStatusIcon = () => {
    if (!status.isOnline) return <WifiSlashIcon className="w-3 h-3 mr-1" />
    if (status.syncInProgress) return <PulseIcon className="w-3 h-3 mr-1 animate-spin" />
    if (status.pendingSync > 0) return <WarningIcon className="w-3 h-3 mr-1" />
    return <CheckCircleIcon className="w-3 h-3 mr-1" />
  }

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline'
    if (status.syncInProgress) return 'Syncing...'
    if (status.pendingSync > 0) return `${status.pendingSync} pending`
    return 'Synced'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className={getStatusColor()}>
        {getStatusIcon()}
        {getStatusText()}
      </Badge>

      {status.lastSync && (
        <span className="text-xs text-muted-foreground">
          Last: {status.lastSync.toLocaleTimeString()}
        </span>
      )}

      {onSyncNow && status.isOnline && !status.syncInProgress && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSyncNow}
          className="h-6 px-2"
        >
          <CloudArrowUpIcon className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}

// Connectivity indicator for the status bar
export function ConnectivityIndicator() {
  const status = useSyncStatus()

  return (
    <div className="flex items-center gap-1 text-xs">
      {status.isOnline ? (
        <div className="flex items-center gap-1 text-green-600">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          Online
        </div>
      ) : (
        <div className="flex items-center gap-1 text-orange-600">
          <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
          Offline
        </div>
      )}

      {status.pendingSync > 0 && (
        <div className="text-yellow-600">
          ({status.pendingSync} pending)
        </div>
      )}
    </div>
  )
}

// Detailed sync status card
export function DetailedSyncStatus() {
  const status = useSyncStatus()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Sync Status</h3>
            <SyncStatus />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Connection:</span>
              <p className="font-medium">
                {status.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">Pending Sync:</span>
              <p className="font-medium">{status.pendingSync} operations</p>
            </div>

            {status.lastSync && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Last Sync:</span>
                <p className="font-medium">
                  {status.lastSync.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {!status.isOnline && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <WifiSlashIcon className="w-4 h-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">Working Offline</p>
                  <p className="text-orange-700">
                    Your changes are saved locally and will sync when connection is restored.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status.pendingSync > 0 && status.isOnline && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <WarningIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Sync Pending</p>
                  <p className="text-yellow-700">
                    {status.pendingSync} operations waiting to sync with the server.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}