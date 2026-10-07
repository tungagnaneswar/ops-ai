const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  sessionId?: number;
  type: string;
  id: number;
  username: string;
  email: string;
}

export interface Session {
  id: number;
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  createdAt: string;
  expiresAt: string;
  current?: boolean;
}

export interface UserProfile {
  id: number;
  publicId?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  roles?: string[];
  createdAt?: string;
  lastLoginAt?: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(refreshToken ? { 'X-Refresh-Token': refreshToken } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized (expired or invalid token)
  if (response.status === 401) {
    // If not a login attempt, try refresh token if present
    if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh') && refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const refreshData: AuthResponse = await refreshRes.json();
          localStorage.setItem('token', refreshData.token);
          if (refreshData.refreshToken) {
            localStorage.setItem('refreshToken', refreshData.refreshToken);
          }
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${refreshData.token}`;
          const retryRes = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
          if (retryRes.ok) {
            const text = await retryRes.text();
            if (!text) return null;
            try { return JSON.parse(text); } catch { return { message: text }; }
          }
        }
      } catch {
        // Refresh failed, proceed to logout cleanup
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    
    // Only redirect if not already on the landing page or login flow
    if (window.location.pathname !== '/' && !endpoint.includes('/auth/login')) {
      window.location.href = '/';
    }
  }

  // Handle non-2xx responses with clean error extraction
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorText;
    } catch {
      errorMessage = errorText || `HTTP ${response.status} Error`;
    }
    throw new Error(errorMessage);
  }

  // 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Safe parsing: handles both JSON and plain-text responses
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const authData = res as AuthResponse;
    if (authData.token) {
      localStorage.setItem('token', authData.token);
    }
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }
    if (authData.sessionId) {
      localStorage.setItem('sessionId', String(authData.sessionId));
    }
    return authData;
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const res = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (typeof res === 'object' && res !== null ? res : { message: String(res) }) as { message: string };
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await fetchWithAuth('/auth/me');
    return res as UserProfile;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await fetchWithAuth('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('username');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated: (): boolean => {
    return Boolean(localStorage.getItem('token'));
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  getCurrentUser: (): { username: string; token: string; email?: string } | null => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (!token || !username) return null;
    return { token, username };
  },
};

export const sessionApi = {
  getActiveSessions: async (): Promise<Session[]> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const res = await fetchWithAuth('/auth/sessions', {
      headers: refreshToken ? { 'X-Refresh-Token': refreshToken } : {},
    });
    return (Array.isArray(res) ? res : []) as Session[];
  },

  revokeSession: async (id: number): Promise<{ message: string }> => {
    const res = await fetchWithAuth(`/auth/sessions/${id}`, {
      method: 'DELETE',
    });
    return res as { message: string };
  },

  revokeAllOtherSessions: async (): Promise<{ message: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const res = await fetchWithAuth('/auth/sessions/revoke-all', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return res as { message: string };
  },
};

export const userApi = {
  getProfile: (): Promise<UserProfile> => fetchWithAuth('/users/me'),
  updateProfile: (data: Partial<UserProfile>): Promise<UserProfile> =>
    fetchWithAuth('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> =>
    fetchWithAuth('/users/me/password', { method: 'PUT', body: JSON.stringify(data) }),
  getSessions: (): Promise<Session[]> => {
    const refreshToken = localStorage.getItem('refreshToken');
    return fetchWithAuth('/users/me/sessions', {
      headers: refreshToken ? { 'X-Refresh-Token': refreshToken } : {},
    });
  },
};

export const incidentsApi = {
  getAll: () => fetchWithAuth('/incidents'),
  getById: (id: string) => fetchWithAuth(`/incidents/${id}`),
  create: (data: any) => fetchWithAuth('/incidents', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    fetchWithAuth(`/incidents/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const teamsApi = {
  getAll: () => fetchWithAuth('/teams'),
  getById: (id: number) => fetchWithAuth(`/teams/${id}`),
  create: (data: any) => fetchWithAuth('/teams', { method: 'POST', body: JSON.stringify(data) }),
};
