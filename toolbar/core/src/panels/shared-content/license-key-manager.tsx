import { Button } from '@/components/ui/button';
import { useLicenseKey } from '@/hooks/use-license-key';
import {
  CheckCircleIcon,
  KeyIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  TrashIcon,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { LicenseKeyDialog } from './license-key-dialog';

export function LicenseKeyManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    licenseKey,
    isProUser,
    lastValidated,
    removeLicenseKey,
    refreshLicenseValidation,
    needsRevalidation,
  } = useLicenseKey();

  const handleRemoveLicense = useCallback(async () => {
    if (
      window.confirm(
        'Are you sure you want to remove your license key? You will lose access to pro features.',
      )
    ) {
      try {
        removeLicenseKey();
      } catch (error) {
        console.error('Failed to remove license key:', error);
        alert('Failed to remove license key. Please try again.');
      }
    }
  }, [removeLicenseKey]);

  const handleRefreshValidation = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshLicenseValidation();
    } catch (error) {
      console.error('Failed to refresh license validation:', error);
      alert('Failed to refresh license validation. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshLicenseValidation]);

  const formatLicenseKey = (key: string) => {
    // Mask the middle part for security
    if (key.length <= 8) return key;
    const start = key.substring(0, 4);
    const end = key.substring(key.length - 4);
    return `${start}${'*'.repeat(Math.max(0, key.length - 8))}${end}`;
  };

  const formatLastValidated = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 text-sm dark:text-gray-100">
            Pro License
          </h3>
        </div>

        {!isProUser && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsDialogOpen(true)}
          >
            <KeyIcon className="mr-2 h-4 w-4" />
            Enter License Key
          </Button>
        )}
      </div>

      {isProUser ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <h4 className="font-medium text-green-900 text-sm dark:text-green-100">
                  Pro License Active
                </h4>
                <div className="mt-1 space-y-1 text-green-700 text-xs dark:text-green-300">
                  <p>License: {formatLicenseKey(licenseKey || '')}</p>
                  {lastValidated && (
                    <p>Last validated: {formatLastValidated(lastValidated)}</p>
                  )}
                  {needsRevalidation() && (
                    <p className="text-amber-600 dark:text-amber-400">
                      ⚠️ License validation recommended
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="ml-4 flex flex-col gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRefreshValidation}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
                title="Refresh license validation"
              >
                <RefreshCwIcon
                  className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={handleRemoveLicense}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Remove license key"
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-start gap-3">
            <KeyIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900 text-sm dark:text-gray-100">
                Free License
              </h4>
              <p className="mt-1 text-gray-600 text-xs dark:text-gray-400">
                You're using the free version. Upgrade to pro for additional
                features.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <KeyIcon className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      )}

      <LicenseKeyDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
