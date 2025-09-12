import { useCallback, useEffect, useState } from 'react';

// License key storage key
const LICENSE_KEY_STORAGE_KEY = 'stagewise_pro_license_key';

interface LicenseKeyState {
  licenseKey: string | null;
  isProUser: boolean;
  isValidated: boolean;
  lastValidated: Date | null;
}

export function useLicenseKey() {
  const [licenseState, setLicenseState] = useState<LicenseKeyState>({
    licenseKey: null,
    isProUser: false,
    isValidated: false,
    lastValidated: null,
  });

  const loadLicenseKey = useCallback(async () => {
    try {
      const storedData = localStorage.getItem(LICENSE_KEY_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setLicenseState({
          licenseKey: parsed.licenseKey,
          isProUser: parsed.isValidated === true,
          isValidated: parsed.isValidated === true,
          lastValidated: parsed.lastValidated
            ? new Date(parsed.lastValidated)
            : null,
        });
      }
    } catch (error) {
      console.warn('Failed to load license key from storage:', error);
      // Clear invalid stored data
      localStorage.removeItem(LICENSE_KEY_STORAGE_KEY);
    }
  }, []);

  // Load license key from storage on mount
  useEffect(() => {
    loadLicenseKey();

    // Listen for storage changes (from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LICENSE_KEY_STORAGE_KEY) {
        loadLicenseKey();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadLicenseKey]);

  const validateLicenseKey = useCallback(
    async (key: string): Promise<boolean> => {
      if (!key || typeof key !== 'string') {
        return false;
      }

      const trimmedLicenseKey = key.trim();
      const url = 'https://flyonui.com/staging/api/mcp/validate-license-key';
      // Will try to implement backend validation with the help of API.

      // TODO: Update this staging URL to production when ready

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-license-key': trimmedLicenseKey,
        },
      });

      if (!response.ok) {
        console.error(
          'License key validation request failed:',
          response.status,
        );
        return false;
      }
      return true;

      // For demo purposes, consider any properly formatted key as valid
      // In production, this should validate against your license server
    },
    [],
  );

  const saveLicenseKey = useCallback(
    async (key: string): Promise<void> => {
      const trimmedKey = key.trim().toUpperCase();

      // Validate the key first
      const isValid = await validateLicenseKey(trimmedKey);

      if (!isValid) {
        throw new Error('Invalid license key');
      }

      const licenseData = {
        licenseKey: trimmedKey,
        isValidated: true,
        lastValidated: new Date().toISOString(),
      };

      try {
        // Store in localStorage
        localStorage.setItem(
          LICENSE_KEY_STORAGE_KEY,
          JSON.stringify(licenseData),
        );

        // Update state immediately
        const newState = {
          licenseKey: trimmedKey,
          isProUser: true,
          isValidated: true,
          lastValidated: new Date(),
        };

        setLicenseState(newState);

        console.log('License key saved successfully');

        // Trigger a storage event for other components/tabs to sync
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: LICENSE_KEY_STORAGE_KEY,
            newValue: JSON.stringify(licenseData),
            storageArea: localStorage,
          }),
        );
      } catch (error) {
        console.error('Failed to save license key:', error);
        throw new Error('Failed to save license key');
      }
    },
    [validateLicenseKey],
  );

  const removeLicenseKey = useCallback(() => {
    try {
      localStorage.removeItem(LICENSE_KEY_STORAGE_KEY);
      setLicenseState({
        licenseKey: null,
        isProUser: false,
        isValidated: false,
        lastValidated: null,
      });

      console.log('License key removed successfully');

      // Trigger a storage event for other components/tabs to sync
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: LICENSE_KEY_STORAGE_KEY,
          newValue: null,
          storageArea: localStorage,
        }),
      );
    } catch (error) {
      console.error('Failed to remove license key:', error);
      throw new Error('Failed to remove license key');
    }
  }, []);

  const refreshLicenseValidation = useCallback(async (): Promise<boolean> => {
    if (!licenseState.licenseKey) {
      return false;
    }

    try {
      const isValid = await validateLicenseKey(licenseState.licenseKey);

      if (isValid) {
        const licenseData = {
          licenseKey: licenseState.licenseKey,
          isValidated: true,
          lastValidated: new Date().toISOString(),
        };

        localStorage.setItem(
          LICENSE_KEY_STORAGE_KEY,
          JSON.stringify(licenseData),
        );

        setLicenseState((prev) => ({
          ...prev,
          isProUser: true,
          isValidated: true,
          lastValidated: new Date(),
        }));
      } else {
        // License is no longer valid, remove it
        removeLicenseKey();
      }

      return isValid;
    } catch (error) {
      console.error('Failed to refresh license validation:', error);
      return false;
    }
  }, [licenseState.licenseKey, validateLicenseKey, removeLicenseKey]);

  // Helper to check if license needs revalidation (e.g., every 24 hours)
  const needsRevalidation = useCallback((): boolean => {
    if (!licenseState.lastValidated) {
      return true;
    }

    const hoursSinceLastValidation =
      (Date.now() - licenseState.lastValidated.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastValidation > 24; // Revalidate every 24 hours
  }, [licenseState.lastValidated]);

  return {
    // State
    licenseKey: licenseState.licenseKey,
    isProUser: licenseState.isProUser,
    isValidated: licenseState.isValidated,
    lastValidated: licenseState.lastValidated,

    // Actions
    saveLicenseKey,
    removeLicenseKey,
    validateLicenseKey,
    refreshLicenseValidation,
    needsRevalidation,
    loadLicenseKey,
  };
}
