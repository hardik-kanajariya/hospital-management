import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  WifiSlashIcon,
  WarningIcon
} from '@phosphor-icons/react';

interface ConnectionStatusProps {
  onCheck?: () => void;
  className?: string;
}

// Simple connection status component
export default function ConnectionStatus({ onCheck, className }: ConnectionStatusProps) {
  const { connectionState, checkConnection } = useConnectionStatus();
  const { user } = useAuth();

  // Only show to admin and receptionist roles
  if (user?.role !== 'super_admin' && user?.role !== 'receptionist') {
    return null;
  }

  const getStatusColor = () => {
    if (!connectionState.isOnline) return 'text-red-600 border-red-600';
    if (connectionState.checking) return 'text-blue-600 border-blue-600';
    if (connectionState.isConnected) return 'text-green-600 border-green-600';
    return 'text-orange-600 border-orange-600';
  };

  const getStatusIcon = () => {
    if (!connectionState.isOnline) return <WifiSlashIcon className="w-3 h-3 mr-1" />;
    if (connectionState.checking) return <ArrowClockwiseIcon className="w-3 h-3 mr-1 animate-spin" />;
    if (connectionState.isConnected) return <CheckCircleIcon className="w-3 h-3 mr-1" />;
    return <WarningIcon className="w-3 h-3 mr-1" />;
  };

  const getStatusText = () => {
    if (!connectionState.isOnline) return 'Offline';
    if (connectionState.checking) return 'Checking...';
    if (connectionState.isConnected) return 'Connected';
    return 'Server Issue';
  };

  const handleCheck = () => {
    if (onCheck) {
      onCheck();
    } else {
      checkConnection();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className={getStatusColor()}>
        {getStatusIcon()}
        {getStatusText()}
      </Badge>

      {connectionState.lastCheck && (
        <span className="text-xs text-muted-foreground">
          Last: {connectionState.lastCheck.toLocaleTimeString()}
        </span>
      )}

      {connectionState.isOnline && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCheck}
          disabled={connectionState.checking}
        >
          {connectionState.checking ? 'Checking...' : 'Test Connection'}
        </Button>
      )}
    </div>
  );
}

// Main connection status card with detailed information
export function ConnectionStatusCard() {
  const { connectionState, checkConnection } = useConnectionStatus();
  const { user } = useAuth();

  // Only show to admin and receptionist roles
  if (user?.role !== 'super_admin' && user?.role !== 'receptionist') {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {connectionState.isOnline && connectionState.isConnected ? (
            <CloudArrowUpIcon className="w-4 h-4 text-green-600" />
          ) : (
            <WifiSlashIcon className="w-4 h-4 text-orange-600" />
          )}
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Internet</span>
          <Badge variant={connectionState.isOnline ? 'default' : 'destructive'}>
            {connectionState.isOnline ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Server</span>
          <Badge variant={connectionState.isConnected ? 'default' : 'secondary'}>
            {connectionState.isConnected ? 'Available' : 'Unavailable'}
          </Badge>
        </div>

        {connectionState.lastCheck && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Check</span>
            <span className="text-xs text-muted-foreground">
              {connectionState.lastCheck.toLocaleTimeString()}
            </span>
          </div>
        )}

        {connectionState.error && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs text-destructive">{connectionState.error}</p>
          </div>
        )}

        {connectionState.isOnline && (
          <Button
            onClick={checkConnection}
            disabled={connectionState.checking}
            size="sm"
            className="w-full"
          >
            {connectionState.checking ? (
              <>
                <ArrowClockwiseIcon className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <ArrowClockwiseIcon className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        )}

        {!connectionState.isOnline && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600 text-center">
              Internet connection required to use the application
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Legacy export for backward compatibility
export { ConnectionStatus as SyncStatus, ConnectionStatusCard as SyncStatusCard };