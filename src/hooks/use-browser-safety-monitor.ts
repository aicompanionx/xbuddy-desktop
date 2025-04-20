import { useState, useEffect } from 'react';
import { usePhishingDetection } from './use-phishing-detection';

interface BrowserSafetyMonitorResult {
    // Directly monitored unsafe URL result
    unsafeUrlData: unknown | null;
    // Whether to show direct alert
    showUnsafeAlert: boolean;
    // Combined alert state (either direct or from hook)
    shouldShowAlert: boolean;
    // Combined result (prioritize direct detection)
    alertResult: unknown | null;
    // Function to close alert
    handleAlertClose: () => void;
    // Whether browser monitoring is active
    isMonitorActive: boolean;
}

/**
 * Hook for browser monitoring and URL safety checking
 * Combines both direct monitoring and the phishing detection hook
 */
export const useBrowserSafetyMonitor = (): BrowserSafetyMonitorResult => {
    // Direct browser monitoring state
    const [monitorActive, setMonitorActive] = useState(false);
    const [unsafeUrlData, setUnsafeUrlData] = useState<unknown | null>(null);
    const [showUnsafeAlert, setShowUnsafeAlert] = useState(false);

    // Use phishing detection hook as a backup
    const { unsafeUrlResult, showAlert, handleCloseAlert } = usePhishingDetection();

    // Start browser monitoring
    useEffect(() => {
        const startMonitoring = async () => {
            try {
                const result = await window.electronAPI.startBrowserMonitoring();
                setMonitorActive(result.success);
            } catch (error) {
                console.error('Failed to start browser monitoring:', error);
            }
        };

        // Start monitoring when hook is mounted
        startMonitoring();

        // Clean up on unmount
        return () => {
            window.electronAPI.stopBrowserMonitoring()
                .then(() => console.log('Browser monitoring stopped'))
                .catch(err => console.error('Error stopping monitoring:', err));
        };
    }, []);

    // Process browser data and check URL safety
    useEffect(() => {
        if (!monitorActive) return;

        // Function to check URL safety
        const checkUrlSafety = async (url: string) => {
            try {
                const result = await window.electronAPI.checkUrlSafety(url);

                // If URL is unsafe, update state to show alert
                if (result && !result.safe) {
                    setUnsafeUrlData(result);
                    setShowUnsafeAlert(true);
                }
            } catch (error) {
                console.error('Failed to check URL safety:', error);
            }
        };

        // Listen for browser data
        const unsubscribe = window.electronAPI.onBrowserData((data: any) => {
            // Skip if no URL or it's a status/error message
            if (!data || !data.url || data.status || data.error) return;
            // Check URL safety
            checkUrlSafety(data.url);
        });

        return () => {
            unsubscribe();
        };
    }, [monitorActive]);

    // Handle direct alert close
    const handleDirectAlertClose = () => {
        setShowUnsafeAlert(false);
    };

    // Determine which alert to show (prioritize direct monitoring)
    const shouldShowAlert = showUnsafeAlert || showAlert;
    const alertResult = unsafeUrlData || unsafeUrlResult;

    // Combined alert close handler
    const handleCombinedAlertClose = () => {
        if (showUnsafeAlert) handleDirectAlertClose();
        if (showAlert) handleCloseAlert();
    };

    return {
        unsafeUrlData,
        showUnsafeAlert,
        shouldShowAlert,
        alertResult,
        handleAlertClose: handleCombinedAlertClose,
        isMonitorActive: monitorActive
    };
}; 