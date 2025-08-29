import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'
import { useSyncManager } from '@/hooks/useSyncManager'
import { useAuth } from '@/hooks/useAuth'
import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  WarningIcon,
  WifiSlashIcon
} from '@phosphor-icons/react'

// Enhanced sync status hook replacement
export function useSyncStatus() {
  const { syncState } = useSyncManager()
  return syncState
}

interface SyncStatusProps {
  onSyncNow?: () => void
  className?: string
}

// Legacy component wrapper for backward compatibility
export default function SyncStatus({ onSyncNow, className }: SyncStatusProps) {
  const { syncState, forceSync } = useSyncManager()
  const { user } = useAuth()

  // Only show to admin and receptionist roles
  if (user?.role !== 'super_admin' && user?.role !== 'receptionist') {
    return null
  }

  const getStatusColor = () => {
    if (!syncState.isOnline) return 'text-red-600 border-red-600'
    if (syncState.isSyncing) return 'text-blue-600 border-blue-600'
    return 'text-green-600 border-green-600'
  }

  const getStatusIcon = () => {
    if (!syncState.isOnline) return <WifiSlashIcon className="w-3 h-3 mr-1" />
    if (syncState.isSyncing) return <ArrowClockwiseIcon className="w-3 h-3 mr-1 animate-spin" />
    return <CheckCircleIcon className="w-3 h-3 mr-1" />
  }

  const getStatusText = () => {
    if (!syncState.isOnline) return 'Offline - Connection Required'
    if (syncState.isSyncing) return 'Checking...'
    return 'Online'
  }

  const handleSyncNow = () => {
    if (onSyncNow) {
      onSyncNow()
    } else {
      forceSync()
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className={getStatusColor()}>
        {getStatusIcon()}
        {getStatusText()}
      </Badge>

      {syncState.lastSyncTime && (
        <span className="text-xs text-muted-foreground">
          Last: {syncState.lastSyncTime.toLocaleTimeString()}
        </span>
      )}

      {syncState.isOnline && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSyncNow}
          disabled={syncState.isSyncing}
        >
          {syncState.isSyncing ? 'Checking...' : 'Check Connection'}
        </Button>
      )}
    </div>
  )
}

// Main sync status component with better UX
export function SyncStatusCard() {
  const { syncState, forceSync } = useSyncManager()
  const { user } = useAuth()

  // Check if offline functionality is disabled
  const offlineEnabled = import.meta.env.VITE_OFFLINE_ENABLED !== 'false'

  // Only show to admin and receptionist roles
  if (user?.role !== 'super_admin' && user?.role !== 'receptionist') {
    return null
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {syncState.isOnline ? (
            <CloudArrowUpIcon className="w-4 h-4 text-green-600" />
          ) : (
            <WifiSlashIcon className="w-4 h-4 text-orange-600" />
          )}
          {offlineEnabled ? 'Connection Status' : 'Online-Only Mode'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!offlineEnabled && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-600 text-center font-medium">
              Offline functionality is disabled
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={syncState.isOnline ? 'default' : 'secondary'}>
            {syncState.isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {syncState.lastSyncTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Check</span>
            <span className="text-xs text-muted-foreground">
              {syncState.lastSyncTime.toLocaleTimeString()}
            </span>
          </div>
        )}

        {syncState.syncError && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs text-destructive">{syncState.syncError}</p>
          </div>
        )}

        {syncState.isOnline && (
          <Button
            onClick={forceSync}
            disabled={syncState.isSyncing}
            size="sm"
            className="w-full"
          >
            {syncState.isSyncing ? (
              <>
                <ArrowClockwiseIcon className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <ArrowClockwiseIcon className="w-4 h-4 mr-2" />
                Check Connection
              </>
            )}
          </Button>
        )}

        {!syncState.isOnline && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600 text-center">
              Internet connection required to use the application
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}