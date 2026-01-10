// API client for backend communication
// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get JWT token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set JWT token in localStorage
 */
const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove JWT token from localStorage
 */
const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============= AUTH API =============

/**
 * Login admin user
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{token: string, user: object}>}
 */
export const login = async (username, password) => {
  const data = await fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  
  // Store token on successful login
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
};

/**
 * Change password (admin only)
 * Endpoint: POST /api/auth/change-password
 */
export const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  const data = await fetchAPI('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
  return data;
};

/**
 * Logout request (admin only)
 * Endpoint: POST /api/auth/logout
 * Note: JWT is stateless; client must clear token.
 */
export const logoutRequest = async () => {
  const data = await fetchAPI('/auth/logout', {
    method: 'POST',
  });
  return data;
};

/**
 * Logout - clears token from localStorage
 */
export const logout = () => {
  removeToken();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

// ============= OIL API =============

/**
 * Get all active oils (public endpoint)
 * @returns {Promise<Array>}
 */
export const getOils = async () => {
  const data = await fetchAPI('/oils');
  return data.data || [];
};

/**
 * Get all oils (admin only) including inactive.
 * Endpoint: GET /api/oils/admin/all
 */
export const getAllOilsAdmin = async () => {
  const data = await fetchAPI('/oils/admin/all');
  return data.data || [];
};

/**
 * Create new oil (admin only)
 * @param {object} oilData 
 * @returns {Promise<object>}
 */
export const createOil = async (oilData) => {
  const data = await fetchAPI('/oils', {
    method: 'POST',
    body: JSON.stringify(oilData),
  });
  return data;
};

/**
 * Update existing oil (admin only)
 * @param {number} id 
 * @param {object} oilData 
 * @returns {Promise<object>}
 */
export const updateOil = async (id, oilData) => {
  const data = await fetchAPI(`/oils/${id}`, {
    method: 'PUT',
    body: JSON.stringify(oilData),
  });
  return data;
};

/**
 * Delete oil (admin only)
 * @param {number} id 
 * @returns {Promise<object>}
 */
export const deleteOil = async (id) => {
  const data = await fetchAPI(`/oils/${id}`, {
    method: 'DELETE',
  });
  return data;
};

// ============= SALES API =============

/**
 * Get monthly sales summary (admin only)
 * @param {number} year
 * @param {number} month 1-12
 * @returns {Promise<{year:number, month:number, totalSalesValue:number}>}
 */
export const getMonthlySalesSummary = async (year, month) => {
  const params = new URLSearchParams({ year: String(year), month: String(month) });
  const data = await fetchAPI(`/sales/summary?${params.toString()}`);
  return data.data;
};

/**
 * Get monthly report details (admin only)
 * Endpoint: GET /api/reports/monthly/details?year=YYYY&month=M
 * Returns totals + per-oil quantity/revenue aggregates.
 */
export const getMonthlyReportDetails = async (year, month) => {
  const params = new URLSearchParams({ year: String(year), month: String(month) });
  const data = await fetchAPI(`/reports/monthly/details?${params.toString()}`);
  return data.data;
};

/**
 * Get daily summary (admin only)
 * Endpoint: GET /api/reports/daily?date=YYYY-MM-DD
 * If date is omitted, backend returns "today" in Asia/Yangon.
 */
export const getDailySummary = async (date) => {
  const endpoint = date
    ? `/reports/daily?${new URLSearchParams({ date: String(date) }).toString()}`
    : '/reports/daily';
  const data = await fetchAPI(endpoint);
  return data.data;
};

/**
 * Confirm (record) a completed sale (admin only)
 * @param {object} payload
 * @returns {Promise<object>} created sale
 */
export const confirmSale = async (payload) => {
  const data = await fetchAPI('/sales/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.data;
};

// Export token utilities
export { getToken, setToken, removeToken };

