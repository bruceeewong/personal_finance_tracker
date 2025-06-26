import axios from 'axios';

// Get API URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  invitePartner: (email) => api.post('/auth/invite-partner', { partner_email: email }),
  acceptInvitation: (relationshipId) => api.post(`/auth/accept-invitation/${relationshipId}`),
  getPendingInvitations: () => api.get('/auth/pending-invitations'),
};

// Account API
export const accountAPI = {
  getAccountTypes: () => api.get('/account-types'),
  getAccounts: () => api.get('/accounts'),
  createAccount: (accountData) => api.post('/accounts', accountData),
  getAccount: (id) => api.get(`/accounts/${id}`),
  updateAccount: (id, accountData) => api.put(`/accounts/${id}`, accountData),
  updateBalance: (id, balanceData) => api.put(`/accounts/${id}/balance`, balanceData),
  getBalanceHistory: (id, days = 30) => api.get(`/accounts/${id}/balance-history?days=${days}`),
  deleteAccount: (id) => api.delete(`/accounts/${id}`),
  getAccountsSummary: () => api.get('/accounts/summary'),
};

// Transaction API
export const transactionAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  getTransactions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/transactions?${queryString}`);
  },
  createTransaction: (transactionData) => api.post('/transactions', transactionData),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  updateTransaction: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
  createTransfer: (transferData) => api.post('/transactions/transfer', transferData),
  getTransactionsSummary: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/transactions/summary?${queryString}`);
  },
};

// Investment API
export const investmentAPI = {
  getInvestmentTypes: () => api.get('/investment-types'),
  getInvestments: () => api.get('/investments'),
  createInvestment: (investmentData) => api.post('/investments', investmentData),
  getInvestment: (id) => api.get(`/investments/${id}`),
  getInvestmentTransactions: (id) => api.get(`/investments/${id}/transactions`),
  createInvestmentTransaction: (id, transactionData) => api.post(`/investments/${id}/transactions`, transactionData),
  updateInvestmentPrice: (id, priceData) => api.put(`/investments/${id}/price`, priceData),
  getPortfolioSummary: () => api.get('/portfolio/summary'),
};

// Budget API
export const budgetAPI = {
  getBudgets: () => api.get('/budgets'),
  createBudget: (budgetData) => api.post('/budgets', budgetData),
  getBudget: (id) => api.get(`/budgets/${id}`),
  addBudgetCategory: (id, categoryData) => api.post(`/budgets/${id}/categories`, categoryData),
  getGoals: () => api.get('/goals'),
  createGoal: (goalData) => api.post('/goals', goalData),
  getGoal: (id) => api.get(`/goals/${id}`),
  addGoalContribution: (id, contributionData) => api.post(`/goals/${id}/contributions`, contributionData),
  getDashboardSummary: () => api.get('/dashboard/summary'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;

