// API Configuration for Frontend
// Use server IP address instead of localhost for external access
const API_BASE_URL = 'https://api.haditex.net';

// Local storage key for JWT token
const TOKEN_KEY = 'event_erp_token';
const REFRESH_TOKEN_KEY = 'event_erp_refresh_token';

// API service with authentication
const api = {
  // Helper to get auth headers
  getHeaders: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // Generic request handler
  request: async (method, endpoint, data = null, params = {}) => {
    try {
      let url = `${API_BASE_URL}${endpoint}`;

      // Add query parameters
      if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += `?${queryString}`;
      }

      const options = {
        method,
        headers: api.getHeaders(),
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      // Handle 401 Unauthorized - token expired
      if (response.status === 401 && localStorage.getItem(TOKEN_KEY)) {
        // Try to refresh token
        await api.refreshToken();
        // Retry original request
        return api.request(method, endpoint, data, params);
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // GET request
  get: (endpoint, params = {}) => api.request('GET', endpoint, null, params),

  // POST request
  post: (endpoint, data = {}) => api.request('POST', endpoint, data),

  // PUT request
  put: (endpoint, data = {}) => api.request('PUT', endpoint, data),

  // PATCH request
  patch: (endpoint, data = {}) => api.request('PATCH', endpoint, data),

  // DELETE request
  delete: (endpoint) => api.request('DELETE', endpoint),

  // Authentication
  login: async (username, password) => {
  login: async (username, password) => {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.access_token) {
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      try { const p = JSON.parse(atob(response.access_token.split('.')[1])); localStorage.setItem('user', JSON.stringify({username: p.sub, role: p.role})); } catch(e) {}
      return { success: true, data: response };
    }
    return { success: false, message: 'Login failed' };
  },

  register: async (username, email, password, fullName = '', role = 'storekeeper') => {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
      full_name: fullName,
      role
    });
    if (response.access_token) {
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      try { const p = JSON.parse(atob(response.access_token.split('.')[1])); localStorage.setItem('user', JSON.stringify({username: p.sub, role: p.role})); } catch(e) {}
    }
    return response;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await api.post('/api/auth/refresh', { refresh_token: refreshToken });
      if (response.access_token) {
        localStorage.setItem(TOKEN_KEY, response.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      api.logout();
    }
  },

  getCurrentUser: async () => {
    return await api.get('/api/auth/me');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Get stored user
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // API endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      me: '/api/auth/me',
      refresh: '/api/auth/refresh',
      logout: '/api/auth/logout'
    },
    inventory: {
      list: '/api/inventory',
      create: '/api/inventory',
      get: (id) => `/api/inventory/${id}`,
      update: (id) => `/api/inventory/${id}`,
      delete: (id) => `/api/inventory/${id}`,
      availability: '/api/inventory/availability',
      lowStock: '/api/inventory/low-stock',
      rentable: '/api/inventory/rentable',
      consumables: '/api/inventory/consumables',
      tools: '/api/inventory/tools',
      stats: '/api/inventory/stats'
    },
    customers: {
      list: '/api/customers',
      create: '/api/customers',
      get: (id) => `/api/customers/${id}`,
      update: (id) => `/api/customers/${id}`,
      delete: (id) => `/api/customers/${id}`,
      orders: (id) => `/api/customers/${id}/orders`,
      ledger: (id) => `/api/customers/${id}/ledger`
    },
    orders: {
      list: '/api/orders',
      create: '/api/orders',
      get: (id) => `/api/orders/${id}`,
      update: (id) => `/api/orders/${id}`,
      updateStatus: (id) => `/api/orders/${id}/status`,
      dispatch: (id) => `/api/orders/${id}/dispatch`,
      return: (id) => `/api/orders/${id}/return`,
      upcoming: '/api/orders/upcoming'
    },
    dashboard: {
      stats: '/api/dashboard/stats',
      notifications: '/api/dashboard/notifications',
      upcoming: '/api/dashboard/upcoming',
      overdue: '/api/dashboard/overdue',
      recent: '/api/dashboard/recent'
      quotations: {
      list: '/api/quotations',
      create: '/api/quotations',
      get: (id) => `/api/quotations/${id}`,
      update: (id) => `/api/quotations/${id}`,
      delete: (id) => `/api/quotations/${id}`
    }

// Export for use in React components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
