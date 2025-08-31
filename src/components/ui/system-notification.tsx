import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircleIcon, XCircleIcon, InfoIcon, WarningIcon } from '@phosphor-icons/react';

interface SystemNotificationProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    onDismiss?: () => void;
}

export default function SystemNotification({ type, title, message, onDismiss }: SystemNotificationProps) {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
            case 'error':
                return <XCircleIcon className="h-4 w-4 text-red-600" />;
            case 'warning':
                return <WarningIcon className="h-4 w-4 text-yellow-600" />;
            case 'info':
            default:
                return <InfoIcon className="h-4 w-4 text-blue-600" />;
        }
    };

    const getAlertClassName = () => {
        switch (type) {
            case 'success':
                return 'border-green-200 bg-green-50 text-green-800';
            case 'error':
                return 'border-red-200 bg-red-50 text-red-800';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50 text-yellow-800';
            case 'info':
            default:
                return 'border-blue-200 bg-blue-50 text-blue-800';
        }
    };

    return (
        <Alert className={getAlertClassName()}>
            {getIcon()}
            <AlertDescription>
                {title && <div className="font-medium mb-1">{title}</div>}
                <div>{message}</div>
            </AlertDescription>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
                >
                    <XCircleIcon className="h-4 w-4" />
                </button>
            )}
        </Alert>
    );
}
