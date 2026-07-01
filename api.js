// API Configuration for Frontend
// Set VITE_API_URL in Vercel project settings to point at the deployed backend
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.haditex.net').replace(/\/+$/, '');

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
    const response = await api.post('/api/auth/login', { username, password });
    // Backend returns flat TokenResponse, not wrapped
    if (response.access_token) {
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      // Don't fetch user info here - let dashboard do it when needed
      // This prevents blocking the redirect
    }
    // Return in the format frontend expects
    return {
      success: !!response.access_token,
      data: response,
      message: response.access_token ? 'Login successful' : 'Login failed'
    };
  },

  register: async (username, email, password, fullName = '', role = 'storekeeper') => {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
      full_name: fullName,
      role
    });
    // Backend returns UserResponse, auto-login after registration
    if (response.id) {
      // Store user info
      localStorage.setItem('user', JSON.stringify(response));
      // Auto-login after registration
      const loginResponse = await api.login(username, password);
      return loginResponse;
    }
    return {
      success: false,
      data: response,
      message: 'Registration failed'
    };
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
      // Backend returns flat TokenResponse
      if (response.access_token) {
        localStorage.setItem(TOKEN_KEY, response.access_token);
        if (response.refresh_token) {
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
    },
    quotations: {
      list: '/api/quotations',
      create: '/api/quotations',
      get: (id) => `/api/quotations/${id}`,
      update: (id) => `/api/quotations/${id}`,
      delete: (id) => `/api/quotations/${id}`
    },
    invoices: {
      list: '/api/invoices',
      create: '/api/invoices',
      get: (id) => `/api/invoices/${id}`,
      update: (id) => `/api/invoices/${id}`,
      delete: (id) => `/api/invoices/${id}`,
      payments: (id) => `/api/invoices/${id}/payments`
    },
    rentals: {
      list: '/api/rentals',
      create: '/api/rentals',
      get: (id) => `/api/rentals/${id}`,
      update: (id) => `/api/rentals/${id}`,
      dispatch: (id) => `/api/rentals/${id}/dispatch`,
      return: (id) => `/api/rentals/${id}/return`,
      upcoming: '/api/rentals/upcoming',
      active: '/api/rentals/active'
    },
    returns: {
      list: '/api/returns',
      create: '/api/returns',
      get: (id) => `/api/returns/${id}`,
      process: (id) => `/api/returns/${id}/process`
    },
    ledger: {
      list: '/api/ledger',
      customer: (id) => `/api/ledger/customers/${id}`,
      transactions: (id) => `/api/ledger/customers/${id}/transactions`
    },
    expenses: {
      list: '/api/expenses',
      create: '/api/expenses',
      get: (id) => `/api/expenses/${id}`,
      update: (id) => `/api/expenses/${id}`,
      delete: (id) => `/api/expenses/${id}`,
      categories: '/api/expenses/categories'
    },
    hr: {
      employees: '/api/hr/employees',
      employee: (id) => `/api/hr/employees/${id}`,
      advances: '/api/hr/advances',
      salary: '/api/hr/salary',
      processSalary: '/api/hr/salary/process'
    },
    purchase: {
      vendors: '/api/purchase/vendors',
      vendor: (id) => `/api/purchase/vendors/${id}`,
      purchases: '/api/purchase/purchases',
      purchase: (id) => `/api/purchase/purchases/${id}`
    },
    partners: {
      list: '/api/partners',
      create: '/api/partners',
      get: (id) => `/api/partners/${id}`,
      update: (id) => `/api/partners/${id}`,
      delete: (id) => `/api/partners/${id}`,
      rentals: '/api/partners/rentals',
      payables: '/api/partners/payables'
    },
    consumables: {
      list: '/api/consumables',
      reorder: '/api/consumables/reorder',
      usage: '/api/consumables/usage'
    },
    reports: {
      revenue: '/api/reports/revenue',
      inventory: '/api/reports/inventory',
      rentals: '/api/reports/rentals',
      customers: '/api/reports/customers'
    },
    notifications: {
      list: '/api/notifications',
      markRead: (id) => `/api/notifications/${id}/read`,
      markAllRead: '/api/notifications/read-all',
      settings: '/api/notifications/settings'
    },
    settings: {
      all: '/api/settings',
      get: (key) => `/api/settings/${key}`,
      update: (key) => `/api/settings/${key}`
    }
  }
};

// Export for use in React components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
