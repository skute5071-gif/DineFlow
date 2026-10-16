import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, DbUser } from './db';
import { hashPassword, verifyPassword } from './cryptoUtils';

export { hashPassword, verifyPassword };

// JWT secret (server-side only, never exposed to client)
const JWT_SECRET = process.env.JWT_SECRET || 'dineflow_secure_jwt_secret_key_2026_hotel_veg_maharaja';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'staff';
  restaurantId: string;
  restaurantName: string;
  exp: number;
  iat: number;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Generate standard RFC 7519 JWT (HS256)
 */
export function createJwtToken(
  user: Pick<DbUser, 'id' | 'email' | 'name' | 'role' | 'restaurantId' | 'restaurantName'>,
  expiresInSeconds: number = 86400 // 24 hours
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
    restaurantName: user.restaurantName,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64url');

  return `${signatureInput}.${signature}`;
}

/**
 * Verify and decode JWT token
 */
export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as TokenPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Express Middleware: Require valid staff/owner JWT Authentication
 */
export function requireStaffAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (typeof req.headers['x-staff-token'] === 'string') {
    token = req.headers['x-staff-token'];
  }

  // Also support legacy staff PIN header for backward compatibility during migration
  const legacyPin = req.headers['x-staff-pin'] || req.query.staffPin || req.body?.staffPin;
  if (!token && legacyPin === (process.env.STAFF_PIN || '1234')) {
    // Generate synthetic token payload for default manager
    req.user = {
      userId: 'usr-default-manager',
      email: 'manager@vegmaharaja.com',
      name: 'Restaurant Manager',
      role: 'manager',
      restaurantId: 'veg-maharaja-main',
      restaurantName: 'HOTEL VEG MAHARAJA',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    };
    return next();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. Please login to continue to the staff portal.',
      code: 'AUTH_REQUIRED',
    });
  }

  const decoded = verifyJwtToken(token);
  if (!decoded) {
    return res.status(401).json({
      error: 'Invalid or Expired Token',
      message: 'Your session has expired or is invalid. Please log in again.',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Verify that the user still exists and is active in the database
  const user = db.getUserById(decoded.userId);
  if (!user || !user.isActive) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'User account is inactive or no longer exists.',
      code: 'ACCOUNT_INACTIVE',
    });
  }

  req.user = decoded;
  next();
}

/**
 * Express Middleware: Enforce restaurant tenant boundary
 * Ensures staff from Restaurant A cannot access data of Restaurant B
 */
export function requireRestaurantAccess(paramName: string = 'restaurantId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const targetRestaurantId = req.params[paramName] || req.body[paramName] || req.query[paramName];
    if (targetRestaurantId && req.user.restaurantId !== targetRestaurantId && req.user.role !== 'owner') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to view or manage another restaurant.',
        code: 'TENANT_MISMATCH',
      });
    }

    next();
  };
}
