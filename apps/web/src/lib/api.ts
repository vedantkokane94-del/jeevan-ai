/**
 * JEEVAN AI — API Client Wrapper
 *
 * Automatically injects the Bearer token into requests and handles 401s.
 */

// Safe to read in browser (no secret), defaults to localhost for dev
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Core fetch wrapper that automatically handles Auth tokens and standardizes errors.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requireAuth = true, headers = {}, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders = new Headers(headers);

  // Auto-inject JWT if required
  if (requireAuth) {
    // In a real production app, we would prefer httpOnly cookies.
    // For this architecture phase, we use localStorage to hold the JWT.
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  // Auto-set JSON content type if body is provided and not FormData
  if (
    fetchOptions.body &&
    !(fetchOptions.body instanceof FormData) &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    if (response.status === 401 && requireAuth && typeof window !== "undefined") {
      // Auto-logout on 401
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }

    let errorMessage = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Ignore JSON parse errors on non-JSON error responses
    }
    
    throw new Error(errorMessage);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
