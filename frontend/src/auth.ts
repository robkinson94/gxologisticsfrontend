import api from './api';

/**
 * Retrieve the CSRF token cookie before making any state-changing requests.
 * The server sets the csrftoken cookie via a GET request to /api/csrf/.
 */
export async function getCsrfToken(): Promise<void> {
  const response = await api.get('/api/csrf/');
  if (response.status !== 200) {
    throw new Error('Failed to get CSRF token');
  }
  // The csrftoken cookie is set by Django via Set-Cookie header.
}

/**
 * Helper to grab the csrf token from document.cookie if needed.
 * (If the cookie is non-HttpOnly, you can read it here.)
 */
function getCookie(name: string): string {
  const matches = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return matches ? matches[2] : '';
}

// =========== AUTH ACTIONS ===========

interface LoginError {
  detail?: string;
}

/**
 * Login user with credentials: sets HttpOnly cookies (access_token, refresh_token).
 * Must include CSRF token in the header if your Django requires it.
 */
export async function loginUser(username: string, password: string): Promise<void> {
  // ensure we have a CSRF cookie set
  await getCsrfToken();

  try {
    const csrfToken = getCookie('csrftoken');  // if needed for Django's CSRF check
    const response = await api.post<LoginError>('/api/token/', {
      username,
      password,
    }, {
      headers: {
        'X-CSRFToken': csrfToken,
      }
    });
    if (response.status !== 200) {
      throw new Error(response.data?.detail || 'Login failed');
    }
    // HttpOnly cookies are automatically set by the server in the Set-Cookie header
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || 'Login request failed');
  }
}

/**
 * Logout user: clears the access_token, refresh_token cookies server-side.
 */
export async function logoutUser(): Promise<void> {
  const csrfToken = getCookie('csrftoken');
  await api.post('/api/logout/', {}, {
    headers: {
      'X-CSRFToken': csrfToken,
    }
  });
}

/**
 * Manually call /api/token/refresh/ if you want to refresh the token
 * on your own schedule (the interceptor handles 401 automatically, though).
 */
export async function refreshTokenManually(): Promise<void> {
  const csrfToken = getCookie('csrftoken');
  await api.post('/api/token/refresh/', {}, {
    headers: {
      'X-CSRFToken': csrfToken,
    }
  });
  // New access token cookie is set. The interceptor is optional in this flow.
}

interface MeResponse {
  username: string;
  email: string;
}

/**
 * Protected endpoint to get the current user profile / self data.
 * Cookies are automatically included. If the access_token is expired,
 * the interceptor will attempt a refresh if possible.
 */
export async function fetchUserProfile(): Promise<MeResponse> {
  const csrfToken = getCookie('csrftoken');
  const response = await api.get<MeResponse>('/api/me/', {
    headers: {
      'X-CSRFToken': csrfToken,
    }
  });
  return response.data;
}