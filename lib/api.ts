/**
 * API Client Utilities
 * 
 * Reusable fetch wrapper for making API requests.
 * Handles cookies automatically (credentials: 'include').
 * Normalizes error responses for consistent handling.
 * Works in both server and client components.
 */

export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
}

/**
 * Normalize API error from response
 */
function normalizeError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = error as { error: { code?: string; message?: string } | string };
    
    if (typeof apiError.error === 'string') {
      return { message: apiError.error };
    }
    
    if (apiError.error && typeof apiError.error === 'object') {
      return {
        message: apiError.error.message || 'An error occurred',
        code: apiError.error.code,
      };
    }
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { message: 'An unexpected error occurred' };
}

/**
 * Fetch wrapper with automatic cookie handling and error normalization
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with normalized response data or throws error
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for session-based auth
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Parse JSON response
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    // If response is not JSON, create error from status text
    if (!response.ok) {
      throw new Error(response.statusText || 'Request failed');
    }
    throw new Error('Invalid response format');
  }

  // Handle non-OK responses
  if (!response.ok) {
    const error = normalizeError(data);
    const apiError = new Error(error.message) as Error & { code?: string; status?: number };
    apiError.code = error.code;
    apiError.status = response.status;
    throw apiError;
  }

  return data as T;
}

/**
 * Make a GET request
 */
export async function apiGet<T = unknown>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: 'GET' });
}

/**
 * Make a POST request
 */
export async function apiPost<T = unknown>(
  url: string,
  body?: unknown
): Promise<T> {
  return apiFetch<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Make a PATCH request
 */
export async function apiPatch<T = unknown>(
  url: string,
  body?: unknown
): Promise<T> {
  return apiFetch<T>(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Make a DELETE request
 */
export async function apiDelete<T = unknown>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: 'DELETE' });
}

