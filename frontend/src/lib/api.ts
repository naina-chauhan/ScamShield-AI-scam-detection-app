const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  auth: {
    register: (data: { email: string; password: string; displayName?: string }) =>
      api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    
    login: (data: { email: string; password: string }) =>
      api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    
    getProfile: () => api.request('/auth/profile'),
  },

  scan: {
    analyze: (data: { scan_type: string; input: string; privacy_mode?: boolean }) =>
      api.request('/scan/analyze', { method: 'POST', body: JSON.stringify(data) }),
    
    getHistory: (params?: { limit?: number; offset?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      return api.request(`/scan/history${query ? `?${query}` : ''}`);
    },
    
    report: (data: { report_text: string; category: string; scan_id?: string }) =>
      api.request('/scan/report', { method: 'POST', body: JSON.stringify(data) }),
  },
};
