/**
 * DineFlow API Service
 * Communicates with backend Express routes for table management, orders, staff auth, and payments.
 */

export interface ApiTable {
  id: string;
  restaurantId: string;
  number: string;
  area: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
}

export interface ApiStaffUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'staff';
  restaurantId: string;
  restaurantName: string;
}

export interface ApiOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  tableId: string;
  tableNumber: string;
  areaName?: string;
  items: Array<{
    dish: {
      id: string;
      name: string;
      price: number;
      category?: string;
    };
    quantity: number;
    specialInstructions?: string;
  }>;
  subtotal: number;
  tax: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  specialInstructions?: string;
  paymentMethod: 'ONLINE' | 'CASH';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  orderStatus: 'received' | 'preparing' | 'served' | 'completed' | 'cancelled';
  razorpayDetails?: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    method?: string;
    verifiedAt?: string;
  };
  cashReceivedAt?: string;
  cashReceivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = '/api';
const TOKEN_KEY = 'dineflow_staff_token';
const USER_KEY = 'dineflow_staff_user';

export const apiService = {
  // --- Token & Session Management ---
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setSession(token: string, user: ApiStaffUser) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('[API] Failed to save session:', e);
    }
  },

  getCachedUser(): ApiStaffUser | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('[API] Failed to clear session:', e);
    }
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-staff-token'] = token;
    }
    // Backward compatibility with legacy PIN header if needed
    const legacyPin = localStorage.getItem('hvm_staff_pin');
    if (legacyPin) {
      headers['x-staff-pin'] = legacyPin;
    }
    return headers;
  },

  // --- Authentication API (Feature 1) ---
  async login(email: string, password: string): Promise<{ token: string; user: ApiStaffUser; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Authentication failed');
    }

    if (data.token && data.user) {
      this.setSession(data.token, data.user);
    }

    return data;
  },

  async getCurrentUser(): Promise<ApiStaffUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: this.getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        this.clearSession();
        return null;
      }
      return data.user;
    } catch (err) {
      console.warn('[API] Failed to verify current user:', err);
      return this.getCachedUser();
    }
  },

  async getRestaurantStaff(restaurantId: string): Promise<ApiStaffUser[]> {
    const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/staff`, {
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to fetch staff members');
    return data.staff || [];
  },

  async createStaff(
    restaurantId: string,
    payload: { name: string; email: string; password: string; role?: 'manager' | 'staff' }
  ): Promise<ApiStaffUser> {
    const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/staff`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to create staff account');
    return data.user;
  },

  // --- Table Management (Feature 3 & 4) ---
  async getTables(restaurantId: string): Promise<ApiTable[]> {
    try {
      const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/tables`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch tables');
      return data.tables || [];
    } catch (err) {
      console.warn('[API] Falling back to default table list:', err);
      return [];
    }
  },

  async addTable(
    restaurantId: string,
    payload: { number: string; area: string; capacity: number }
  ): Promise<ApiTable> {
    const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/tables`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to create table');
    return data.table;
  },

  async deleteTable(restaurantId: string, tableId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/tables/${encodeURIComponent(tableId)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to delete table');
  },

  // --- Order Placement ---
  async createOrder(orderPayload: Partial<ApiOrder>): Promise<ApiOrder> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to submit order');
    return data.order;
  },

  async getOrder(orderId: string): Promise<ApiOrder> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to retrieve order');
    return data.order;
  },

  // --- Restaurant Staff Order Management (Feature 2) ---
  async getRestaurantOrders(restaurantId: string): Promise<ApiOrder[]> {
    const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/orders`, {
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to fetch restaurant orders');
    return data.orders || [];
  },

  async markCashReceived(restaurantId: string, orderId: string, staffName?: string): Promise<ApiOrder> {
    const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/orders/${encodeURIComponent(orderId)}/cash-received`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ staffName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to mark cash as received');
    return data.order;
  },

  async updateOrderStatus(restaurantId: string, orderId: string, status: ApiOrder['orderStatus']): Promise<ApiOrder> {
    const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to update order status');
    return data.order;
  },

  // --- Razorpay Payment API ---
  async createRazorpayOrder(amount: number, receipt?: string, notes?: Record<string, string>) {
    const res = await fetch(`${API_BASE}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to initialize Razorpay order');
    return data;
  },

  async verifyPayment(payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    method?: string;
  }) {
    const res = await fetch(`${API_BASE}/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Payment signature verification failed');
    return data;
  },

  async notifyPaymentFailure(orderId: string, reason?: string) {
    try {
      await fetch(`${API_BASE}/payment/fail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason }),
      });
    } catch (e) {
      console.warn('[API] Failed to record payment failure:', e);
    }
  },
};
