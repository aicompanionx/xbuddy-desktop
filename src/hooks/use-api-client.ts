import { useState, useCallback } from 'react';

// API state interface
interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    status: number | null;
}

// API request options
interface ApiRequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
}

/**
 * API Client Hook - Makes HTTP requests through IPC to the main process
 * Provides convenient API request functionality for React components
 */
export function useApiClient<T = unknown>() {
    // API state
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
        status: null
    });

    // Reset state
    const resetState = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
            status: null
        });
    }, []);

    // Set loading state
    const setLoading = useCallback(() => {
        setState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));
    }, []);

    // Handle successful response
    const handleSuccess = useCallback((data: any, status = 200) => {
        setState({
            data: data as T,
            loading: false,
            error: null,
            status: status
        });
    }, []);

    // Handle error response
    const handleError = useCallback((error: unknown, status = 500) => {
        const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
        setState({
            data: null,
            loading: false,
            error: errorMessage,
            status
        });
    }, []);

    // Wrap IPC request - GET
    const get = useCallback(async <R = T>(
        url: string,
        options?: ApiRequestOptions
    ): Promise<R | null> => {
        setLoading();
        try {
            const response = await window.electronAPI.http.get(
                url,
                options?.headers
            );

            if (response.error) {
                handleError(response.error, response.status);
                return null;
            }

            handleSuccess(response.data, response.status);
            return response.data as R;
        } catch (error) {
            handleError(error);
            return null;
        }
    }, [setLoading, handleSuccess, handleError]);

    // Wrap IPC request - POST
    const post = useCallback(async <R = T>(
        url: string,
        data?: unknown,
        options?: ApiRequestOptions
    ): Promise<R | null> => {
        setLoading();
        try {
            const response = await window.electronAPI.http.post(
                url,
                data,
                options?.headers
            );

            if (response.error) {
                handleError(response.error, response.status);
                return null;
            }

            handleSuccess(response.data, response.status);
            return response.data as R;
        } catch (error) {
            handleError(error);
            return null;
        }
    }, [setLoading, handleSuccess, handleError]);

    // Wrap IPC request - PUT
    const put = useCallback(async <R = T>(
        url: string,
        data?: unknown,
        options?: ApiRequestOptions
    ): Promise<R | null> => {
        setLoading();
        try {
            const response = await window.electronAPI.http.put(
                url,
                data,
                options?.headers
            );

            if (response.error) {
                handleError(response.error, response.status);
                return null;
            }

            handleSuccess(response.data, response.status);
            return response.data as R;
        } catch (error) {
            handleError(error);
            return null;
        }
    }, [setLoading, handleSuccess, handleError]);

    // Wrap IPC request - DELETE
    const del = useCallback(async <R = T>(
        url: string,
        options?: ApiRequestOptions
    ): Promise<R | null> => {
        setLoading();
        try {
            const response = await window.electronAPI.http.delete(
                url,
                options?.headers
            );

            if (response.error) {
                handleError(response.error, response.status);
                return null;
            }

            handleSuccess(response.data, response.status);
            return response.data as R;
        } catch (error) {
            handleError(error);
            return null;
        }
    }, [setLoading, handleSuccess, handleError]);

    // Wrap IPC request - PATCH
    const patch = useCallback(async <R = T>(
        url: string,
        data?: unknown,
        options?: ApiRequestOptions
    ): Promise<R | null> => {
        setLoading();
        try {
            const response = await window.electronAPI.http.patch(
                url,
                data,
                options?.headers
            );

            if (response.error) {
                handleError(response.error, response.status);
                return null;
            }

            handleSuccess(response.data, response.status);
            return response.data as R;
        } catch (error) {
            handleError(error);
            return null;
        }
    }, [setLoading, handleSuccess, handleError]);

    return {
        // State
        ...state,

        // Request methods
        get,
        post,
        put,
        delete: del,
        patch,

        // Utility methods
        reset: resetState,
        isLoading: state.loading,
        isError: !!state.error,
        hasData: !!state.data
    };
} 