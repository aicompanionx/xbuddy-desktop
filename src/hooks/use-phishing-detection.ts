import { useState, useEffect } from 'react';
import { UrlSafetyResult } from '../lib/api/types';

interface PhishingDetectionResult {
    unsafeUrlResult: UrlSafetyResult | null;
    showAlert: boolean;
    setShowAlert: (show: boolean) => void;
    handleCloseAlert: () => void;
}

/**
 * Phishing detection hook
 * Subscribe to unsafe URL events from main process
 */
export const usePhishingDetection = (): PhishingDetectionResult => {
    const [unsafeUrlResult, setUnsafeUrlResult] = useState<UrlSafetyResult | null>(null);
    const [showAlert, setShowAlert] = useState<boolean>(false);

    useEffect(() => {
        // Define type-safe callback function
        const handleUnsafeUrl = (result: UrlSafetyResult) => {
            // Show alert for any unsafe URL regardless of risk score
            if (result && !result.isSafe) {
                setUnsafeUrlResult(result);
                setShowAlert(true);
            }
        };

        let unsubscribe: (() => void) | undefined;

        // Ensure API exists
        if (window.electronAPI && typeof window.electronAPI.onUnsafeUrlDetected === 'function') {
            // Subscribe to unsafe URL events from main process
            unsubscribe = window.electronAPI.onUnsafeUrlDetected(handleUnsafeUrl);
        }

        return () => {
            // Clean up subscription
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    // Close alert handler
    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    return {
        unsafeUrlResult,
        showAlert,
        setShowAlert,
        handleCloseAlert
    };
}; 