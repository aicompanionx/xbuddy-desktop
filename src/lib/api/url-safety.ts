import { apiClient, handleApiResponse } from './client';
import { UrlSafetyResult } from './types';

// API endpoint
const URL_CHECK_ENDPOINT = '/api/goplus/check-url';

// Cache mechanism - Singleton implementation
class UrlSafetyCacheManager {
    private static instance: UrlSafetyCacheManager;
    private cache: Map<string, UrlSafetyResult>;
    private cacheDuration: number = 30 * 60 * 1000; // 30 minutes cache duration

    private constructor() {
        this.cache = new Map<string, UrlSafetyResult>();
    }

    public static getInstance(): UrlSafetyCacheManager {
        if (!UrlSafetyCacheManager.instance) {
            UrlSafetyCacheManager.instance = new UrlSafetyCacheManager();
        }
        return UrlSafetyCacheManager.instance;
    }

    /**
     * Get URL safety check result (prioritize cache)
     */
    public async getUrlSafetyResult(url: string): Promise<UrlSafetyResult> {
        const normalizedUrl = this.normalizeUrl(url);

        // Check cache
        const cachedResult = this.cache.get(normalizedUrl);
        const now = Date.now();

        if (cachedResult && (now - cachedResult.timestamp < this.cacheDuration)) {
            console.log(`Using cached safety result for ${normalizedUrl}`);
            return cachedResult;
        }

        // Cache doesn't exist or expired, get new result from API
        try {
            const result = await checkUrlSafetyFromApi(normalizedUrl);
            // Update cache
            this.cache.set(normalizedUrl, result);
            return result;
        } catch (error) {
            console.error('Failed to check URL safety:', error);
            // Return default unsafe result
            const fallbackResult: UrlSafetyResult = {
                url: normalizedUrl,
                isSafe: false,
                reason: 'Failed to verify URL safety',
                timestamp: now
            };
            return fallbackResult;
        }
    }

    /**
     * Clear URL safety check cache
     */
    public clearCache(): void {
        this.cache.clear();
    }

    /**
     * Normalize URL format
     */
    private normalizeUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    }
}

/**
 * Check URL safety from API
 */
export async function checkUrlSafetyFromApi(url: string): Promise<UrlSafetyResult> {
    try {
        const response = await apiClient.get<any>(URL_CHECK_ENDPOINT, {
            params: { url }
        });

        const apiData = handleApiResponse(response);
        const timestamp = Date.now();

        // Parse API response based on the actual format we received
        // API returns: { success: true, data: { url, is_phishing, risk_level, phishing_type, target_site, message, ... } }
        if (!apiData || !apiData.success || !apiData.data) {
            throw new Error('Invalid API response format');
        }

        const data = apiData.data;

        // Create a standardized result object
        const result: UrlSafetyResult = {
            url: data.url || url,
            isSafe: data.is_phishing !== 1, // 1 means phishing, 0 means safe
            timestamp,
            riskScore: data.is_phishing === 1 ? 1 : 0,
            category: data.phishing_type || undefined,
            reason: data.message || (data.is_phishing === 1
                ? `Phishing site detected. Risk level: ${data.risk_level || 'Unknown'}`
                : 'Site appears to be safe')
        };

        return result;
    } catch (error) {
        console.error('URL safety check API error:', error);
        throw error;
    }
}

// Export cache manager singleton
export const urlSafetyCache = UrlSafetyCacheManager.getInstance();

/**
 * Check URL safety (with caching)
 */
export async function checkUrlSafety(url: string): Promise<UrlSafetyResult> {
    return urlSafetyCache.getUrlSafetyResult(url);
}

/**
 * Clear URL safety check cache
 */
export function clearUrlSafetyCache(): void {
    urlSafetyCache.clearCache();
} 