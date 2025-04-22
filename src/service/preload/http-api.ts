import { ipcRenderer } from 'electron';

/**
 * HTTP API request options interface
 */
export interface ApiRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
}

/**
 * HTTP API interface exposed to renderer process through preload script
 */
export const httpApi = {
    /**
     * Send API request
     * @param method Request method
     * @param url Request URL
     * @param data Request data
     * @param headers Request headers
     * @param timeout Timeout in milliseconds
     * @returns Promise<T>
     */
    request: <T>(
        method: ApiRequestOptions['method'],
        url: string,
        data?: T,
        headers?: Record<string, string>,
        timeout?: number
    ) => {
        return ipcRenderer.invoke('api-request', {
            method,
            url,
            data,
            headers,
            timeout
        }) as Promise<T>;
    },

    /**
     * GET request
     * @param url Request URL
     * @param headers Request headers
     * @param timeout Timeout in milliseconds
     * @returns Promise<T>
     */
    get: <T>(url: string, headers?: Record<string, string>, timeout?: number) => {
        return ipcRenderer.invoke('api-request', {
            method: 'GET',
            url,
            headers,
            timeout
        }) as Promise<T>;
    },

    /**
     * POST request
     * @param url Request URL
     * @param data Request data
     * @param headers Request headers
     * @param timeout Timeout in milliseconds
     * @returns Promise<T>
     */
    post: <T>(url: string, data?: T, headers?: Record<string, string>, timeout?: number) => {
        return ipcRenderer.invoke('api-request', {
            method: 'POST',
            url,
            data,
            headers,
            timeout
        }) as Promise<T>;
    },

    /**
     * PUT request
     * @param url Request URL
     * @param data Request data
     * @param headers Request headers
     * @param timeout Timeout in milliseconds
     * @returns Promise<T>
     */
    put: <T>(url: string, data?: T, headers?: Record<string, string>, timeout?: number) => {
        return ipcRenderer.invoke('api-request', {
            method: 'PUT',
            url,
            data,
            headers,
            timeout
        }) as Promise<T>;
    },

    /**
     * DELETE request
     * @param url Request URL
     * @param data Request data
     * @param headers Request headers
     * @param timeout Timeout in milliseconds
     * @returns Promise<T>
     */
    delete: <T>(url: string, data?: T, headers?: Record<string, string>, timeout?: number) => {
        return ipcRenderer.invoke('api-request', {
            method: 'DELETE',
            url,
            data,
            headers,
            timeout
        }) as Promise<T>;
    },

    /**
     * PATCH request
     * @param url Request URL
     * @param data Request data
     * @param headers Request headers
     * @param timeout Timeout in milliseconds
     * @returns Promise<T>
     */
    patch: <T>(url: string, data?: T, headers?: Record<string, string>, timeout?: number) => {
        return ipcRenderer.invoke('api-request', {
            method: 'PATCH',
            url,
            data,
            headers,
            timeout
        }) as Promise<T>;
    }
};
