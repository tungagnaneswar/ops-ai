const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  // If it's a mock/static token for development bypass, we still set it (or we could handle it specifically)
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'API Request failed');
  }

  // If response is 204 No Content, don't parse JSON
  if (response.status === 204) {
    return null;
  }

  // Handle empty responses to avoid JSON parse errors
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const authApi = {
  login: (data: any) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

export const incidentsApi = {
  getAll: () => fetchWithAuth('/incidents'),
  getById: (id: string) => fetchWithAuth(`/incidents/${id}`),
  create: (data: any) => fetchWithAuth('/incidents', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => fetchWithAuth(`/incidents/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const teamsApi = {
  getAll: () => fetchWithAuth('/teams'),
  getById: (id: number) => fetchWithAuth(`/teams/${id}`),
  create: (data: any) => fetchWithAuth('/teams', { method: 'POST', body: JSON.stringify(data) }),
};

export const userApi = {
  getProfile: () => fetchWithAuth('/users/me'),
  updateProfile: (data: any) => fetchWithAuth('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
};
