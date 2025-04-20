/**
 * 渲染进程API模块
 * 用于与主进程通信，发送HTTP请求
 */

// HTTP方法类型
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

// 响应接口
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    status?: number;
}

/**
 * 发送API请求
 * @param method 请求方法
 * @param url 请求URL
 * @param data 请求数据
 * @param headers 请求头
 * @param params 查询参数
 * @returns Promise<ApiResponse>
 */
export async function apiRequest<T>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    headers?: Record<string, string>,
    params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
    try {
        // 处理查询参数
        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });

            // 添加查询参数到URL
            url = `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
        }

        // 调用预加载脚本中的HTTP API
        const response = await window.electronAPI.http.request(method, url, data, headers);

        // 格式化返回结果
        return {
            success: response.status >= 200 && response.status < 300,
            data: response.data,
            status: response.status,
            error: response.status >= 400 ? `请求失败，状态码：${response.status}` : undefined
        };
    } catch (error) {
        console.error('API请求错误:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误',
            status: 500
        };
    }
}

/**
 * GET请求
 * @param url 请求URL
 * @param headers 请求头
 * @param params 查询参数
 * @returns Promise<ApiResponse>
 */
export function get<T>(
    url: string,
    headers?: Record<string, string>,
    params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
    return apiRequest<T>('get', url, undefined, headers, params);
}

/**
 * POST请求
 * @param url 请求URL
 * @param data 请求数据
 * @param headers 请求头
 * @param params 查询参数
 * @returns Promise<ApiResponse>
 */
export function post<T>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>,
    params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
    return apiRequest<T>('post', url, data, headers, params);
}

/**
 * PUT请求
 * @param url 请求URL
 * @param data 请求数据
 * @param headers 请求头
 * @param params 查询参数
 * @returns Promise<ApiResponse>
 */
export function put<T>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>,
    params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
    return apiRequest<T>('put', url, data, headers, params);
}

/**
 * DELETE请求
 * @param url 请求URL
 * @param headers 请求头
 * @param params 查询参数
 * @returns Promise<ApiResponse>
 */
export function del<T>(
    url: string,
    headers?: Record<string, string>,
    params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
    return apiRequest<T>('delete', url, undefined, headers, params);
}

/**
 * PATCH请求
 * @param url 请求URL
 * @param data 请求数据
 * @param headers 请求头
 * @param params 查询参数
 * @returns Promise<ApiResponse>
 */
export function patch<T>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>,
    params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
    return apiRequest<T>('patch', url, data, headers, params);
} 