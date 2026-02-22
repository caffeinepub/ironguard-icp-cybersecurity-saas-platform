import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { BillingStatus } from '../backend';

interface BillingAlertProps {
  status: BillingStatus;
  showUpdateButton?: boolean;
}

export default function BillingAlert({ status, showUpdateButton = true }: BillingAlertProps) {
  if (status === BillingStatus.active) {
    return null;
  }

  if (status === BillingStatus.grace) {
    return (
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-yellow-500 mb-1">Payment Issue Detected</p>
            <p className="text-sm">
              Your recent payment failed. You have full access for 7 days while we retry your payment method. 
              Please update your payment information to avoid service interruption.
            </p>
          </div>
          {showUpdateButton && (
            <Link to="/billing" className="ml-4">
              <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
                Update Payment Method
              </Button>
            </Link>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === BillingStatus.restricted) {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <XCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-destructive mb-1">Service Restricted</p>
            <p className="text-sm">
              Your account has been restricted due to payment failure. File uploads are disabled, but you retain read-only access to your data and keys. 
              Update your payment method to restore full service immediately.
            </p>
          </div>
          {showUpdateButton && (
            <Link to="/billing" className="ml-4">
              <Button variant="destructive" size="sm">
                Update Payment Method
              </Button>
            </Link>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

