import { API_BASE_URL } from '../config';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token to localStorage
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get headers with auth token if available
  getHeaders() {
    const token = this.getAuthToken();
    return {
      ...this.defaultHeaders,
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setAuthToken(null);
    }
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', { method: 'POST' });
    if (response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Prediction endpoints
  async predictImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.request('/predict', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        'Accept': 'application/json',
        ...(this.getAuthToken() && { 'Authorization': `Bearer ${this.getAuthToken()}` })
      },
      body: formData,
    });
  }

  async predictMultipleImages(imageFiles) {
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append(`images`, file);
    });

    return this.request('/predict/batch', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(this.getAuthToken() && { 'Authorization': `Bearer ${this.getAuthToken()}` })
      },
      body: formData,
    });
  }

  // History endpoints
  async getHistory(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const endpoint = queryParams.toString() ? `/history?${queryParams.toString()}` : '/history';
    return this.request(endpoint);
  }

  async getHistoryById(id) {
    return this.request(`/history/${id}`);
  }

  async deleteHistoryItem(id) {
    return this.request(`/history/${id}`, { method: 'DELETE' });
  }

  async exportHistory(format = 'csv', filters = {}) {
    const queryParams = new URLSearchParams({ format, ...filters });
    return this.request(`/history/export?${queryParams.toString()}`);
  }

  // Analytics endpoints
  async getAnalytics(timeRange = 'month') {
    return this.request(`/analytics?timeRange=${timeRange}`);
  }

  async getDiseaseStats() {
    return this.request('/analytics/diseases');
  }

  async getConfidenceStats() {
    return this.request('/analytics/confidence');
  }

  async getActivityTimeline(timeRange = 'month') {
    return this.request(`/analytics/timeline?timeRange=${timeRange}`);
  }

  // User management endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  }

  // File management endpoints
  async uploadFile(file, type = 'image') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(this.getAuthToken() && { 'Authorization': `Bearer ${this.getAuthToken()}` })
      },
      body: formData,
    });
  }

  async deleteFile(fileId) {
    return this.request(`/files/${fileId}`, { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // System info
  async getSystemInfo() {
    return this.request('/system/info');
  }

  // Error handling utilities
  handleError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network error. Please check your connection.',
        original: error
      };
    }

    if (error.status === 401) {
      this.setAuthToken(null);
      return {
        type: 'auth',
        message: 'Authentication required. Please log in again.',
        original: error
      };
    }

    if (error.status === 403) {
      return {
        type: 'permission',
        message: 'You don\'t have permission to perform this action.',
        original: error
      };
    }

    if (error.status >= 500) {
      return {
        type: 'server',
        message: 'Server error. Please try again later.',
        original: error
      };
    }

    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      original: error
    };
  }

  // Request interceptor for adding loading states
  async withLoading(requestFn, setLoading) {
    if (setLoading) {
      setLoading(true);
    }
    
    try {
      const result = await requestFn();
      return result;
    } finally {
      if (setLoading) {
        setLoading(false);
      }
    }
  }

  // Retry mechanism for failed requests
  async withRetry(requestFn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  predictImage,
  predictMultipleImages,
  getHistory,
  getHistoryById,
  deleteHistoryItem,
  exportHistory,
  getAnalytics,
  getDiseaseStats,
  getConfidenceStats,
  getActivityTimeline,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSettings,
  updateSettings,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  uploadFile,
  deleteFile,
  healthCheck,
  getSystemInfo,
  handleError,
  withLoading,
  withRetry
} = apiService; 