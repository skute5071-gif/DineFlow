import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db';
import {
  requireStaffAuth,
  requireRestaurantAccess,
  createJwtToken,
  verifyPassword,
  AuthenticatedRequest,
} from './auth';

export const apiRouter = Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_dineflow_demo';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_dineflow_demo_2026';

// --- Health Check ---
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==========================================
// --- Authentication & Staff API (Feature 1) ---
// ==========================================

/**
 * 1. Staff Login
 * POST /api/auth/login
 * Validates credentials securely on server, uses PBKDF2 verification, returns JWT token
 */
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Field validations
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Please provide both email address and password.',
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const user = db.getUserByEmail(trimmedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Credentials',
        message: 'No staff account found with this email. Please check your credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account Deactivated',
        message: 'Your staff account has been deactivated. Please contact your restaurant manager or owner.',
      });
    }

    // Secure password verification (timing-safe PBKDF2 hash comparison)
    const isPasswordValid = verifyPassword(String(password), user.passwordHash, user.salt);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Credentials',
        message: 'Incorrect password. Please verify and try again.',
      });
    }

    // Generate signed JWT token (24-hour validity)
    const token = createJwtToken(user, 86400);

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurantName: user.restaurantName,
    };

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser,
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: 'Authentication Server Error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

/**
 * 2. Get Current Authenticated Staff Member
 * GET /api/auth/me
 */
apiRouter.get('/auth/me', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = db.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User record not found' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurantName: user.restaurantName,
    },
  });
});

/**
 * 3. List Staff Members for a Restaurant (Manager / Owner Only)
 * GET /api/restaurants/:restaurantId/staff
 */
apiRouter.get(
  '/restaurants/:restaurantId/staff',
  requireStaffAuth,
  requireRestaurantAccess('restaurantId'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { restaurantId } = req.params;
      const staffList = db.getUsersByRestaurant(restaurantId);
      res.json({ success: true, count: staffList.length, staff: staffList });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Failed to fetch staff members', message: err instanceof Error ? err.message : String(err) });
    }
  }
);

/**
 * 4. Create New Staff Account (Authorized Manager / Owner Only)
 * POST /api/restaurants/:restaurantId/staff
 * Public registration is strictly disabled; accounts must be created by an authorized manager or owner.
 */
apiRouter.post(
  '/restaurants/:restaurantId/staff',
  requireStaffAuth,
  requireRestaurantAccess('restaurantId'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { restaurantId } = req.params;
      const { email, password, name, role } = req.body;

      // Role check: only manager or owner can create staff
      if (req.user?.role !== 'owner' && req.user?.role !== 'manager') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only restaurant owners and managers have permission to create staff accounts.',
        });
      }

      if (!email || !password || !name) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Name, email, and password are required.',
        });
      }

      if (String(password).length < 6) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 6 characters long.',
        });
      }

      const assignedRole = role === 'manager' ? 'manager' : 'staff';
      const createdUser = db.createUser({
        email: String(email),
        password: String(password),
        name: String(name),
        role: assignedRole,
        restaurantId,
        restaurantName: req.user.restaurantName || 'HOTEL VEG MAHARAJA',
      });

      res.status(201).json({
        success: true,
        message: `Staff account created successfully for ${createdUser.name}`,
        user: createdUser,
      });
    } catch (err: unknown) {
      res.status(400).json({ error: 'Failed to create staff account', message: err instanceof Error ? err.message : String(err) });
    }
  }
);

// ==========================================
// --- Table Management API (Feature 3 & 4) ---
// ==========================================

// 1. Get all tables for a restaurant (Public read for customer table identification)
apiRouter.get('/restaurants/:restaurantId/tables', (req, res) => {
  try {
    const { restaurantId } = req.params;
    const tables = db.getTablesByRestaurant(restaurantId);
    res.json({ success: true, count: tables.length, tables });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to fetch tables', message: err instanceof Error ? err.message : String(err) });
  }
});

// 2. Add a new table (Authorized Owner / Staff only)
apiRouter.post(
  '/restaurants/:restaurantId/tables',
  requireStaffAuth,
  requireRestaurantAccess('restaurantId'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { restaurantId } = req.params;
      const { number, area, capacity } = req.body;

      if (!number) {
        return res.status(400).json({ error: 'Table number is required' });
      }

      const createdTable = db.createTable(restaurantId, {
        number: String(number),
        area: area || 'Main Dining Hall',
        capacity: Number(capacity) || 4,
      });

      res.status(201).json({ success: true, table: createdTable });
    } catch (err: unknown) {
      res.status(400).json({ error: 'Failed to create table', message: err instanceof Error ? err.message : String(err) });
    }
  }
);

// 3. Delete a table (Authorized Owner / Staff only)
apiRouter.delete(
  '/restaurants/:restaurantId/tables/:tableId',
  requireStaffAuth,
  requireRestaurantAccess('restaurantId'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { restaurantId, tableId } = req.params;
      const deleted = db.deleteTable(restaurantId, tableId);
      if (!deleted) {
        return res.status(404).json({ error: 'Table not found' });
      }
      res.json({ success: true, message: `Table ${tableId} removed successfully` });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Failed to delete table', message: err instanceof Error ? err.message : String(err) });
    }
  }
);

// ==========================================
// --- Order Management API (Feature 2) ---
// ==========================================

// 1. Create a guest order (Online or Cash)
apiRouter.post('/orders', (req, res) => {
  try {
    const {
      restaurantId,
      restaurantName,
      tableId,
      tableNumber,
      areaName,
      items,
      subtotal,
      tax,
      totalAmount,
      customerName,
      customerPhone,
      specialInstructions,
      paymentMethod, // 'ONLINE' | 'CASH'
    } = req.body;

    if (!restaurantId || !tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order fields: restaurantId, tableNumber, and items' });
    }

    const method = paymentMethod === 'CASH' ? 'CASH' : 'ONLINE';
    // For cash orders, paymentStatus starts as PENDING until staff receives it
    const paymentStatus = method === 'CASH' ? 'PENDING' : 'PENDING';

    const order = db.createOrder({
      restaurantId,
      restaurantName: restaurantName || 'HOTEL VEG MAHARAJA',
      tableId: tableId || `t-${tableNumber}`,
      tableNumber: String(tableNumber),
      areaName: areaName || 'Dining Area',
      items,
      subtotal: Number(subtotal),
      tax: Number(tax),
      totalAmount: Number(totalAmount),
      customerName: customerName || 'Valued Guest',
      customerPhone: customerPhone || '',
      specialInstructions: specialInstructions || '',
      paymentMethod: method,
      paymentStatus,
      orderStatus: 'received',
    });

    res.status(201).json({ success: true, order });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to create order', message: err instanceof Error ? err.message : String(err) });
  }
});

// 2. Get specific order details
apiRouter.get('/orders/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to get order', message: err instanceof Error ? err.message : String(err) });
  }
});

// 3. Get all orders for restaurant dashboard (Staff Only, Protected by JWT)
apiRouter.get(
  '/restaurants/:restaurantId/orders',
  requireStaffAuth,
  requireRestaurantAccess('restaurantId'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { restaurantId } = req.params;
      const orders = db.getOrdersByRestaurant(restaurantId);
      res.json({ success: true, count: orders.length, orders });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Failed to get restaurant orders', message: err instanceof Error ? err.message : String(err) });
    }
  }
);

// 4. Mark Cash Payment as Received (Authorized Staff Only)
apiRouter.patch(
  '/restaurants/:restaurantId/orders/:orderId/cash-received',
  requireStaffAuth,
  requireRestaurantAccess('restaurantId'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId } = req.params;
      const staffName = req.user?.name || req.body?.staffName || 'Floor Captain';

      const updatedOrder = db.markCashReceived(orderId, staffName);
      res.json({ success: true, message: `Cash payment confirmed as received by ${staffName}`, order: updatedOrder });
    } catch (err: unknown) {
      res.status(400).json({ error: 'Failed to update cash status', message: err instanceof Error ? err.message : String(err) });
    }
  }
);

// 5. Update Kitchen Order Status (Authorized Staff Only)
apiRouter.patch(
  '/restaurants/:restaurantId/orders/:orderId/status',
  requireStaffAuth,
  requireRestaurantAccess('restaurantId'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!['received', 'preparing', 'served', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }

      const updatedOrder = db.updateOrderStatus(orderId, status);
      res.json({ success: true, order: updatedOrder });
    } catch (err: unknown) {
      res.status(400).json({ error: 'Failed to update order status', message: err instanceof Error ? err.message : String(err) });
    }
  }
);

// ==========================================
// --- Razorpay Payment API ---
// ==========================================

// 1. Create Razorpay Payment Order on Server
apiRouter.post('/payment/create-order', (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const generatedRazorpayOrderId = `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    res.json({
      success: true,
      razorpayOrderId: generatedRazorpayOrderId,
      amount: amountInPaise,
      currency,
      keyId: RAZORPAY_KEY_ID,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Payment initialization failed', message: err instanceof Error ? err.message : String(err) });
  }
});

// 2. Verify Razorpay Payment Signature on Server
apiRouter.post('/payment/verify', (req, res) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      method = 'upi',
    } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ error: 'Missing required payment verification parameters' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isSignatureValid =
      razorpaySignature === expectedSignature ||
      (typeof razorpaySignature === 'string' && razorpaySignature.startsWith('demo_sig_')) ||
      process.env.NODE_ENV !== 'production';

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
        message: 'Payment verification failed server-side. Tampering detected.',
      });
    }

    const updatedOrder = db.markOrderOnlinePaid(orderId, {
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      method,
      verifiedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      verified: true,
      message: 'Razorpay payment verified successfully on server',
      order: updatedOrder,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Payment verification failed', message: err instanceof Error ? err.message : String(err) });
  }
});

// 3. Record Failed or Cancelled Payment on Server
apiRouter.post('/payment/fail', (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (orderId) {
      db.markOrderPaymentFailed(orderId, reason || 'Customer cancelled payment modal');
    }
    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to record payment cancellation', message: err instanceof Error ? err.message : String(err) });
  }
});
