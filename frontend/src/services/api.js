import axios from 'axios';

// API base URLs
const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001';
const ORDER_SERVICE_URL = process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost:3002';

// Create axios instances
const userApi = axios.create({
  baseURL: USER_SERVICE_URL,
  timeout: 10000,
});

const orderApi = axios.create({
  baseURL: ORDER_SERVICE_URL,
  timeout: 10000,
});

// Request interceptors
userApi.interceptors.request.use(
  (config) => {
    console.log(`Making request to User Service: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

orderApi.interceptors.request.use(
  (config) => {
    console.log(`Making request to Order Service: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptors
const handleResponse = (response) => response.data;
const handleError = (error) => {
  console.error('API Error:', error.response?.data || error.message);
  throw error.response?.data || { error: 'Network error' };
};

userApi.interceptors.response.use(handleResponse, handleError);
orderApi.interceptors.response.use(handleResponse, handleError);

// User Service API
export const userService = {
  // Get all users
  getUsers: () => userApi.get('/api/users'),
  
  // Get user by ID
  getUser: (id) => userApi.get(`/api/users/${id}`),
  
  // Create user
  createUser: (userData) => userApi.post('/api/users', userData),
  
  // Update user
  updateUser: (id, userData) => userApi.put(`/api/users/${id}`, userData),
  
  // Delete user
  deleteUser: (id) => userApi.delete(`/api/users/${id}`),
  
  // Health check
  getHealth: () => userApi.get('/health'),
};

// Order Service API
export const orderService = {
  // Get all orders
  getOrders: (userId = null) => {
    const params = userId ? { userId } : {};
    return orderApi.get('/api/orders', { params });
  },
  
  // Get order by ID
  getOrder: (id) => orderApi.get(`/api/orders/${id}`),
  
  // Create order
  createOrder: (orderData) => orderApi.post('/api/orders', orderData),
  
  // Update order status
  updateOrderStatus: (id, status) => orderApi.put(`/api/orders/${id}`, { status }),
  
  // Cancel order
  cancelOrder: (id) => orderApi.delete(`/api/orders/${id}`),
  
  // Health check
  getHealth: () => orderApi.get('/health'),
};

// Combined API for dashboard stats
export const dashboardService = {
  getStats: async () => {
    try {
      const [usersResponse, ordersResponse, userHealthResponse, orderHealthResponse] = await Promise.all([
        userService.getUsers(),
        orderService.getOrders(),
        userService.getHealth(),
        orderService.getHealth(),
      ]);

      return {
        users: {
          total: usersResponse.count || 0,
          data: usersResponse.data || [],
        },
        orders: {
          total: ordersResponse.count || 0,
          data: ordersResponse.data || [],
        },
        health: {
          userService: userHealthResponse.status === 'healthy',
          orderService: orderHealthResponse.status === 'healthy',
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};