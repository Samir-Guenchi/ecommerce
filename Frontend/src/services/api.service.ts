import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api.config';

/**
 * API Service
 * Centralized service for making API calls with authentication
 */

// Get authentication token from storage
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Make authenticated API request
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

// Handle API response
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `HTTP error! status: ${response.status}`);
  }

  return data as T;
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Check if admin exists
   */
  checkAdmin: async (): Promise<{ adminExists: boolean }> => {
    const response = await fetch(`${API_URL}/auth/check-admin`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<{ adminExists: boolean }>(response);
  },

  /**
   * Sign up new user
   */
  signUp: async (data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{
    message: string;
    user: any;
    token?: string;
    needsVerification?: boolean;
  }> => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Login user
   */
  login: async (data: {
    email: string;
    password: string;
  }): Promise<{
    message: string;
    user: any;
    token: string;
  }> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<{ user: any }> => {
    const response = await apiRequest('/auth/me', {
      method: 'GET',
    });
    return handleResponse(response);
  },
};

/**
 * User Management API (Admin only)
 */
export const userAPI = {
  /**
   * Get all users
   */
  getAllUsers: async (): Promise<{
    users: Array<{
      id: number;
      email: string;
      fullName: string | null;
      accountType: string;
      accountStatus: string;
      createdAt: string;
      lastLogin: string | null;
    }>
  }> => {
    const response = await apiRequest('/users', {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: number): Promise<{ user: any }> => {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Update user account status
   */
  updateUserStatus: async (
    userId: number,
    accountStatus: 'active' | 'pending' | 'suspended' | 'inactive'
  ): Promise<{
    message: string;
    user: {
      id: number;
      email: string;
      accountStatus: string;
    };
  }> => {
    const response = await apiRequest(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus }),
    });
    return handleResponse(response);
  },

  /**
   * Update user details
   */
  updateUser: async (
    userId: number,
    data: {
      fullName?: string;
      accountType?: string;
    }
  ): Promise<{
    message: string;
    user: any;
  }> => {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

/**
 * Product API
 */
export const productAPI = {
  /**
   * Get all products
   */
  getAllProducts: async (): Promise<{
    products: Array<{
      id: number;
      storeId: number;
      name: string;
      description: string | null;
      price: number;
      stock: number;
      status: string;
      category: string | null;
      imagePath: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  }> => {
    const response = await apiRequest('/products', {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Get product by ID
   */
  getProductById: async (productId: number): Promise<{ product: any }> => {
    const response = await apiRequest(`/products/${productId}`, {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Create product
   */
  createProduct: async (data: {
    storeId: number;
    name: string;
    description?: string;
    price: number;
    stock?: number;
    category?: string;
    imagePath?: string;
    status?: string;
  }): Promise<{ message: string; product: any }> => {
    const response = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Update product
   */
  updateProduct: async (
    productId: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      category?: string;
      imagePath?: string;
      status?: string;
    }
  ): Promise<{ message: string; product: any }> => {
    const response = await apiRequest(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: number): Promise<{ message: string }> => {
    const response = await apiRequest(`/products/${productId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

/**
 * Store API
 */
export const storeAPI = {
  /**
   * Get all stores
   */
  getAllStores: async (): Promise<{
    stores: Array<{
      id: number;
      userId: number;
      name: string;
      status: string;
      location: string | null;
      description: string | null;
      themeId: number | null;
      domain: string | null;
      storefrontTheme: string | null;
      storefrontLanguage: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  }> => {
    const response = await apiRequest('/stores', {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Get store by ID
   */
  getStoreById: async (storeId: number): Promise<{ store: any }> => {
    const response = await apiRequest(`/stores/${storeId}`, {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Create store
   */
  createStore: async (data: {
    name: string;
    location?: string;
    description?: string;
    metapixleid?: string;
    themeId?: number;
    domain?: string;
    status?: string;
    storefrontTheme?: string;
    storefrontLanguage?: string;
  }): Promise<{ message: string; store: any }> => {
    const response = await apiRequest('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Update store
   */
  updateStore: async (
    storeId: number,
    data: {
      name?: string;
      location?: string;
      description?: string;
      metapixleid?: string;
      themeId?: number;
      domain?: string;
      status?: string;
      storefrontTheme?: string;
      storefrontLanguage?: string;
    }
  ): Promise<{ message: string; store: any }> => {
    const response = await apiRequest(`/stores/${storeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Delete store
   */
  deleteStore: async (storeId: number): Promise<{ message: string }> => {
    const response = await apiRequest(`/stores/${storeId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

/**
 * Order API
 */
export const orderAPI = {
  /**
   * Get all orders
   */
  getAllOrders: async (): Promise<{
    orders: Array<{
      id: number;
      orderNumber: string;
      userId: number;
      storeId: number;
      totalAmount: number;
      status: string;
      trackingNumber: string | null;
      orderDate: string;
      shippedDate: string | null;
      deliveredDate: string | null;
    }>
  }> => {
    const response = await apiRequest('/orders', {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: number): Promise<{ order: any }> => {
    const response = await apiRequest(`/orders/${orderId}`, {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    orderId: number,
    data: {
      status: string;
      trackingNumber?: string;
    }
  ): Promise<{ message: string; order: any }> => {
    const response = await apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Get order by order number (public)
   */
  getOrderByOrderNumber: async (orderNumber: string): Promise<{ order: any }> => {
    const response = await fetch(`${API_URL}/orders/track/${orderNumber}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<{ order: any }>(response);
  },
};

/**
 * Event API
 */
export const eventAPI = {
  /**
   * Get events for a store
   */
  getEventsForStore: async (
    storeId: number,
    filters?: {
      eventType?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<{
    events: Array<{
      id: number;
      eventType: string;
      eventData: any;
      status: string;
      createdAt: string;
    }>
  }> => {
    const queryParams = new URLSearchParams();
    if (filters?.eventType) queryParams.append('eventType', filters.eventType);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const response = await apiRequest(`/events/store/${storeId}?${queryParams.toString()}`, {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Get event statistics for a store
   */
  getEventStatsForStore: async (
    storeId: number,
    startDate?: string,
    endDate?: string
  ): Promise<{
    stats: {
      total: number;
      byType: Record<string, number>;
      recent: Array<{
        id: number;
        eventType: string;
        eventData: any;
        status: string;
        createdAt: string;
      }>;
    }
  }> => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await apiRequest(`/events/store/${storeId}/stats?${queryParams.toString()}`, {
      method: 'GET',
    });
    return handleResponse(response);
  },
};

/**
 * Profile API
 */
export const profileAPI = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{
    user: {
      id: number;
      email: string;
      fullName: string | null;
      phone: string | null;
      bio: string | null;
      accountType: string;
      accountStatus: string;
      languagePreference: string;
      createdAt: string;
      lastLogin: string | null;
    }
  }> => {
    const response = await apiRequest('/profile', {
      method: 'GET',
    });
    return handleResponse(response);
  },

  /**
   * Update profile
   */
  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    bio?: string;
    languagePreference?: string;
    accountType?: string;
  }): Promise<{ message: string; user: any }> => {
    const response = await apiRequest('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

/**
 * Payment API
 */
export const paymentAPI = {
  getAllPayments: async (): Promise<{ paymentMethods: any[] }> => handleResponse(await apiRequest('/payments')),
  createPayment: async (data: any): Promise<{ paymentMethod: any; message: string }> => handleResponse(await apiRequest('/payments', { method: 'POST', body: JSON.stringify(data) })),
  updatePayment: async (paymentId: number, data: any): Promise<{ paymentMethod: any; message: string }> => handleResponse(await apiRequest(`/payments/${paymentId}`, { method: 'PATCH', body: JSON.stringify(data) })),
  deletePayment: async (paymentId: number): Promise<{ message: string }> => handleResponse(await apiRequest(`/payments/${paymentId}`, { method: 'DELETE' })),
};

/**
 * Delivery API
 */
export const deliveryAPI = {
  getDeliverySettings: async (): Promise<{ deliverySetting: any }> => handleResponse(await apiRequest('/delivery')),
  updateDeliverySettings: async (data: any): Promise<{ deliverySetting: any; message: string }> => handleResponse(await apiRequest('/delivery', { method: 'PATCH', body: JSON.stringify(data) })),
};

/**
 * Delivery Person API
 */
export const deliveryPersonAPI = {
  register: async (data: { vehicleType: string; licensePlate?: string; phone: string }): Promise<{ message: string; deliveryPerson: any }> =>
    handleResponse(await apiRequest('/delivery-person/register', { method: 'POST', body: JSON.stringify(data) })),
};

/**
 * Tax API
 */
export const taxAPI = {
  getTaxSettings: async (): Promise<{ taxSetting: any }> => handleResponse(await apiRequest('/taxes')),
  updateTaxSettings: async (data: any): Promise<{ taxSetting: any; message: string }> => handleResponse(await apiRequest('/taxes', { method: 'PATCH', body: JSON.stringify(data) })),
};

/**
 * Address API
 */
export const addressAPI = {
  getAllAddresses: async (): Promise<{ addresses: any[] }> => handleResponse(await apiRequest('/addresses')),
  createAddress: async (data: any): Promise<{ address: any; message: string }> => handleResponse(await apiRequest('/addresses', { method: 'POST', body: JSON.stringify(data) })),
  updateAddress: async (addressId: number, data: any): Promise<{ address: any; message: string }> => handleResponse(await apiRequest(`/addresses/${addressId}`, { method: 'PATCH', body: JSON.stringify(data) })),
  deleteAddress: async (addressId: number): Promise<{ message: string }> => handleResponse(await apiRequest(`/addresses/${addressId}`, { method: 'DELETE' })),
};

/**
 * Subscription API
 */
export const subscriptionAPI = {
  getCurrentSubscription: async (): Promise<{ subscription: any; plan: any }> => handleResponse(await apiRequest('/subscriptions/current')),
  getPlans: async (): Promise<{ plans: any[] }> => handleResponse(await apiRequest('/subscriptions/plans')),
  updateSubscription: async (data: { planId: number }): Promise<{ subscription: any }> => handleResponse(await apiRequest('/subscriptions/update', { method: 'PUT', body: JSON.stringify(data) })),
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
  getStats: async (): Promise<{
    stats: {
      totalRevenue: number;
      totalOrders: number;
      totalProducts: number;
      totalStores: number;
      activeProducts: number;
      lowStock: number;
      outOfStock: number;
      weeklyTrend: number[];
      dayLabels: string[];
      revenueTrend: number;
      previousWeekOrders: number;
      thisWeekOrders: number;
      recentOrders: any[];
      statusCounts: Record<string, number>;
      eventsCount: number;
    }
  }> => handleResponse(await apiRequest('/dashboard/stats')),
};

/**
 * Admin API
 */
export const adminAPI = {
  // Get admin dashboard statistics
  getStats: async (): Promise<{
    totalUsers: number;
    totalSellers: number;
    totalBuyers: number;
    totalDelivery: number;
    pendingVerifications: number;
    activeSellers: number;
    activeDelivery: number;
  }> => handleResponse(await apiRequest('/admin/stats')),

  // Get all users
  getUsers: async (): Promise<{ users: any[] }> =>
    handleResponse(await apiRequest('/admin/users')),

  // User actions
  approveUser: async (userId: number): Promise<{ message: string }> =>
    handleResponse(await apiRequest(`/admin/users/${userId}/approve`, { method: 'PATCH' })),

  rejectUser: async (userId: number): Promise<{ message: string }> =>
    handleResponse(await apiRequest(`/admin/users/${userId}/reject`, { method: 'PATCH' })),

  suspendUser: async (userId: number): Promise<{ message: string }> =>
    handleResponse(await apiRequest(`/admin/users/${userId}/suspend`, { method: 'PATCH' })),

  activateUser: async (userId: number): Promise<{ message: string }> =>
    handleResponse(await apiRequest(`/admin/users/${userId}/activate`, { method: 'PATCH' })),

  banUser: async (userId: number): Promise<{ message: string }> =>
    handleResponse(await apiRequest(`/admin/users/${userId}/ban`, { method: 'PATCH' })),

  unbanUser: async (userId: number): Promise<{ message: string }> =>
    handleResponse(await apiRequest(`/admin/users/${userId}/unban`, { method: 'PATCH' })),

  // Get user documents
  getUserDocuments: async (userId: number): Promise<{ documents: any[] }> =>
    handleResponse(await apiRequest(`/admin/users/${userId}/documents`)),
};

