import fetch, { RequestInit } from 'node-fetch'

/**
 * Request options interface
 */
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  data?: unknown
  headers?: Record<string, string>
  timeout?: number
}

export interface Response<T = unknown> {
  code: number
  msg: string
  data: T
}

/**
 * Response interface
 */
export interface ApiResponse<T = unknown> {
  data: T
  status: number
  headers: Record<string, string>
}

/**
 * API client configuration interface
 */
export interface ApiClientConfig {
  baseUrl?: string
  defaultHeaders?: Record<string, string>
  timeout?: number
  onError?: (error: unknown) => void
  onResponse?: <T>(response: ApiResponse<T>) => void
}

/**
 * Internal function to send HTTP request
 * @param options Request options
 * @returns Promise<ApiResponse>
 */
async function sendHttpRequest<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
  const { method, url, data, headers = {}, timeout = 30000 } = options

  // Set request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  // Add request body (if not GET request)
  if (method !== 'GET' && data) {
    requestOptions.body = JSON.stringify(data)
  }

  try {
    // Send request (node-fetch doesn't directly support timeout parameter, can use AbortController to implement)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    requestOptions.signal = controller.signal

    const response = await fetch(url, requestOptions)
    clearTimeout(timeoutId)

    // Parse response body
    let responseData: Response<T>
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      responseData = (await response.json()) as Response<T>
    } else {
      responseData = (await response.text()) as unknown as Response<T>
    }

    // Convert response headers to object
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, name) => {
      responseHeaders[name] = value
    })

    // Return formatted response
    return {
      data: responseData.data,
      status: response.status,
      headers: responseHeaders,
    }
  } catch (error) {
    // Handle error
    console.error('HTTP request error:', error)
    throw error
  }
}

/**
 * API Client class
 * Provides a unified interface for sending HTTP requests
 */
class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private timeout: number
  private onError?: (error: unknown) => void
  private onResponse?: <T>(response: ApiResponse<T>) => void

  /**
   * Constructor
   * @param config API client configuration
   */
  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || ''
    this.defaultHeaders = config.defaultHeaders || {}
    this.timeout = config.timeout || 30000
    this.onError = config.onError
    this.onResponse = config.onResponse
  }

  /**
   * Get full URL
   * @param path Path
   * @returns Full URL
   */
  private getFullUrl(path: string): string {
    // If path is already a complete URL, return it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // Ensure there's a slash between baseUrl and path
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`
    const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path

    return `${baseUrl}${pathWithoutLeadingSlash}`
  }

  /**
   * Send request
   * @param options Request options
   * @returns Promise<ApiResponse>
   */
  async request<T>(options: Omit<RequestOptions, 'url'> & { path: string }): Promise<ApiResponse<T>> {
    const { path, headers = {}, ...restOptions } = options

    console.log(`Sending request to ${this.getFullUrl(path)}`)

    try {
      // Merge request options
      const requestOptions: RequestOptions = {
        ...restOptions,
        url: this.getFullUrl(path),
        headers: { ...this.defaultHeaders, ...headers },
        timeout: options.timeout || this.timeout,
      }

      // Send request
      const response = await sendHttpRequest<T>(requestOptions)

      // Call response callback
      if (this.onResponse) {
        this.onResponse(response)
      }

      return response
    } catch (error) {
      // Call error callback
      if (this.onError) {
        this.onError(error)
      }

      // Rethrow error
      throw error
    }
  }

  /**
   * Send GET request
   * @param path Path
   * @param headers Request headers
   * @param timeout Timeout
   * @returns Promise<ApiResponse>
   */
  async get<T>(path: string, headers?: Record<string, string>, timeout?: number): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      path,
      headers,
      timeout,
    })
  }

  /**
   * Send POST request
   * @param path Path
   * @param data Request data
   * @param headers Request headers
   * @param timeout Timeout
   * @returns Promise<ApiResponse>
   */
  async post<T>(
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
    timeout?: number,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      path,
      data,
      headers,
      timeout,
    })
  }

  /**
   * Send PUT request
   * @param path Path
   * @param data Request data
   * @param headers Request headers
   * @param timeout Timeout
   * @returns Promise<ApiResponse>
   */
  async put<T>(
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
    timeout?: number,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      path,
      data,
      headers,
      timeout,
    })
  }

  /**
   * Send DELETE request
   * @param path Path
   * @param data Request data
   * @param headers Request headers
   * @param timeout Timeout
   * @returns Promise<ApiResponse>
   */
  async delete<T>(
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
    timeout?: number,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      path,
      data,
      headers,
      timeout,
    })
  }

  /**
   * Send PATCH request
   * @param path Path
   * @param data Request data
   * @param headers Request headers
   * @param timeout Timeout
   * @returns Promise<ApiResponse>
   */
  async patch<T>(
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
    timeout?: number,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      path,
      data,
      headers,
      timeout,
    })
  }
}

const xbuddyClient = new ApiClient({
  baseUrl: process.env.XBUDDY_API,
})

const xbuddyAiClient = new ApiClient({
  baseUrl: process.env.XBUDDY_AI_API,
})

export { xbuddyClient, xbuddyAiClient }
