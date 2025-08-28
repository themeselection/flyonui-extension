import { Button } from '@/components/ui/button';
import { useLicenseKey } from '@/hooks/use-license-key';
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { KeyIcon, XCircleIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

interface LicenseKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LicenseKeyDialog({ isOpen, onClose }: LicenseKeyDialogProps) {
  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { saveLicenseKey, validateLicenseKey } = useLicenseKey();

  const handleSave = useCallback(async () => {
    if (!inputKey.trim()) {
      setValidationError('Please enter a license key');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate the license key format
      const isValid = await validateLicenseKey(inputKey.trim());

      if (isValid) {
        await saveLicenseKey(inputKey.trim());
        setInputKey('');
        onClose();
      } else {
        setValidationError('Invalid license key format');
      }
    } catch (error) {
      setValidationError(
        error instanceof Error
          ? error.message
          : 'Failed to validate license key',
      );
    } finally {
      setIsValidating(false);
    }
  }, [inputKey, saveLicenseKey, validateLicenseKey, onClose]);

  const handleCancel = useCallback(() => {
    setInputKey('');
    setValidationError(null);
    onClose();
  }, [onClose]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      }
    },
    [handleSave],
  );

  return (
    <Dialog open={isOpen} onClose={handleCancel} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <KeyIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="font-semibold text-foreground">
                  Enter License Key
                </DialogTitle>
                <Description className="text-foreground text-sm">
                  Enter your pro license key to unlock premium features
                </Description>
              </div>
            </div>

            {/* Input */}
            <div className="mb-4">
              <label
                htmlFor="license-key"
                className="mb-2 block font-medium text-foreground text-sm"
              >
                License Key
              </label>
              <input
                id="license-key"
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your license key..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                disabled={isValidating}
                autoFocus
              />

              {/* Validation Error */}
              {validationError && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm dark:text-red-400">
                  <XCircleIcon className="h-4 w-4" />
                  {validationError}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={isValidating}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isValidating || !inputKey.trim()}
              >
                {isValidating ? 'Validating...' : 'Save License Key'}
              </Button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
