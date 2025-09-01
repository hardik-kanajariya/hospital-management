import React, { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible";
import { Separator } from "./components/ui/separator";
import { Badge } from "./components/ui/badge";

import {
  AlertTriangleIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeartPulseIcon,
  PhoneIcon,
  MailIcon,
  ClipboardIcon,
  CheckIcon
} from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // When encountering an error in the development mode, rethrow it and don't display the boundary.
  // The parent UI will take care of showing a more helpful dialog.
  if (import.meta.env.DEV) throw error;

  const copyErrorDetails = async () => {
    try {
      const errorDetails = `Error: ${error.message}\nStack: ${error.stack}\nTimestamp: ${new Date().toISOString()}`;
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Error Card */}
        <Card className="mb-6 border-destructive/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <HeartPulseIcon className="w-8 h-8 text-destructive animate-pulse" />
            </div>
            <CardTitle className="text-2xl text-destructive">
              System Temporarily Unavailable
            </CardTitle>
            <CardDescription className="text-base mt-2">
              The hospital management system encountered an unexpected error.
              Patient care operations may be affected. Please try the recovery options below.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="destructive" className="gap-2">
                <AlertTriangleIcon className="w-4 h-4" />
                Service Interrupted
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={resetErrorBoundary}
                className="w-full gap-2"
                size="lg"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Retry Application
              </Button>
              <Button
                onClick={refreshPage}
                variant="outline"
                className="w-full gap-2"
                size="lg"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Refresh Page
              </Button>
            </div>

            <Separator />

            {/* Error Details Section */}
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2">
                  <span className="text-sm font-medium">Technical Details</span>
                  {showDetails ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                <div className="bg-muted/50 border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      Error Information
                    </h4>
                    <Button
                      onClick={copyErrorDetails}
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="w-4 h-4 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Error Message:</p>
                      <pre className="text-xs text-destructive bg-background p-2 rounded border overflow-auto max-h-24">
                        {error.message}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Timestamp:</p>
                      <p className="text-xs font-mono">{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Separator />

            {/* Support Information */}
            <div className="w-full">
              <h4 className="font-semibold text-sm text-center mb-3">Need Immediate Support?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <PhoneIcon className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Emergency Helpline</p>
                    <p className="text-muted-foreground">+91-XXX-XXX-XXXX</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <MailIcon className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium">Technical Support</p>
                    <p className="text-muted-foreground">support@hospital.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <Alert className="bg-blue-50/50 border-blue-200 text-blue-800">
              <AlertTriangleIcon className="w-4 h-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Important Notice</AlertTitle>
              <AlertDescription className="text-blue-700">
                If this error persists and affects patient care, please contact your IT administrator
                immediately and use backup systems as per hospital protocol.
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
