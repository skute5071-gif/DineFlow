import fs from 'fs';
import path from 'path';
import { hashPassword } from './cryptoUtils';

export interface DbTable {
  id: string;
  restaurantId: string;
  number: string;
  area: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
}

export interface DbOrderItem {
  dish: {
    id: string;
    name: string;
    price: number;
    category?: string;
  };
  quantity: number;
  specialInstructions?: string;
}

export interface DbOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  tableId: string;
  tableNumber: string;
  areaName?: string;
  items: DbOrderItem[];
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

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: 'owner' | 'manager' | 'staff';
  restaurantId: string;
  restaurantName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'dineflow_db.json');

interface DatabaseSchema {
  users: DbUser[];
  tables: DbTable[];
  orders: DbOrder[];
}


const INITIAL_TABLES: DbTable[] = [
  { id: 'hvm-t1', restaurantId: 'veg-maharaja-main', number: '1', area: 'Ground Floor · AC Family Hall', capacity: 4, isActive: true, createdAt: new Date().toISOString() },
  { id: 'hvm-t2', restaurantId: 'veg-maharaja-main', number: '2', area: 'Ground Floor · AC Family Hall', capacity: 4, isActive: true, createdAt: new Date().toISOString() },
  { id: 'hvm-t3', restaurantId: 'veg-maharaja-main', number: '3', area: 'Ground Floor · Royal Maharaja Sofa', capacity: 6, isActive: true, createdAt: new Date().toISOString() },
  { id: 'hvm-t4', restaurantId: 'veg-maharaja-main', number: '4', area: 'Garden Courtyard · Open Air', capacity: 4, isActive: true, createdAt: new Date().toISOString() },
  { id: 'hvm-t5', restaurantId: 'veg-maharaja-main', number: '5', area: 'First Floor · Family Dining Hall', capacity: 6, isActive: true, createdAt: new Date().toISOString() },
  { id: 'hvm-t6', restaurantId: 'veg-maharaja-main', number: '6', area: 'First Floor · Royal Cabana', capacity: 8, isActive: true, createdAt: new Date().toISOString() },
  { id: 'hvm-t7', restaurantId: 'veg-maharaja-main', number: '7', area: 'Terrace Dining · City View', capacity: 4, isActive: true, createdAt: new Date().toISOString() },
  { id: 'hvm-t8', restaurantId: 'veg-maharaja-main', number: '8', area: 'Terrace Dining · City View', capacity: 6, isActive: true, createdAt: new Date().toISOString() },
  { id: 'hvm-t9', restaurantId: 'veg-maharaja-main', number: '9', area: 'Ground Floor · Window Table', capacity: 2, isActive: true, createdAt: new Date().toISOString() },
  { id: 'hvm-t10', restaurantId: 'veg-maharaja-main', number: '10', area: 'VIP Maharaja Suite', capacity: 10, isActive: true, createdAt: new Date().toISOString() },
  // Tables for demo restaurant 2 (Royal Punjab Express)
  { id: 'rpe-t1', restaurantId: 'royal-punjab-express', number: '1', area: 'Main Hall', capacity: 4, isActive: true, createdAt: new Date().toISOString() },
  { id: 'rpe-t2', restaurantId: 'royal-punjab-express', number: '2', area: 'Main Hall', capacity: 4, isActive: true, createdAt: new Date().toISOString() },
  { id: 'rpe-t3', restaurantId: 'royal-punjab-express', number: '3', area: 'Outdoor Lawn', capacity: 6, isActive: true, createdAt: new Date().toISOString() },
];

const INITIAL_ORDERS: DbOrder[] = [
  {
    id: 'HVM-108201',
    restaurantId: 'veg-maharaja-main',
    restaurantName: 'HOTEL VEG MAHARAJA',
    tableId: 'hvm-t5',
    tableNumber: '5',
    areaName: 'First Floor · Family Dining Hall',
    items: [
      { dish: { id: 'hvm-pan-01', name: 'Paneer Butter Masala', price: 210, category: 'paneer_special' }, quantity: 1 },
      { dish: { id: 'hvm-tan-03', name: 'Butter Naan', price: 40, category: 'tandoor_special' }, quantity: 3 },
      { dish: { id: 'hvm-ric-01', name: 'Jeera Rice', price: 110, category: 'rice_special' }, quantity: 1 },
      { dish: { id: 'hvm-bev-01', name: 'Malai Lassi', price: 50, category: 'beverages' }, quantity: 2 },
    ],
    subtotal: 540,
    tax: 27,
    totalAmount: 567,
    customerName: 'Rahul Deshmukh',
    customerPhone: '9822011223',
    specialInstructions: 'Make lassi extra chilled with malai',
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    orderStatus: 'preparing',
    razorpayDetails: {
      orderId: 'order_hvm_live_9011',
      paymentId: 'pay_live_78912',
      method: 'upi',
      verifiedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'HVM-108202',
    restaurantId: 'veg-maharaja-main',
    restaurantName: 'HOTEL VEG MAHARAJA',
    tableId: 'hvm-t3',
    tableNumber: '3',
    areaName: 'Ground Floor · Royal Maharaja Sofa',
    items: [
      { dish: { id: 'hvm-vsb-01', name: 'Veg Maharaja', price: 350, category: 'veg_special_bhaji' }, quantity: 1 },
      { dish: { id: 'hvm-tan-02', name: 'Butter Roti', price: 20, category: 'tandoor_special' }, quantity: 4 },
      { dish: { id: 'hvm-dal-03', name: 'Butter Dal Fry', price: 150, category: 'aapki_pasandi_dal' }, quantity: 1 },
      { dish: { id: 'hvm-pap-01', name: 'Masala Papad', price: 40, category: 'papad_special' }, quantity: 2 },
    ],
    subtotal: 660,
    tax: 33,
    totalAmount: 693,
    customerName: 'Sanjay Kulkarni',
    customerPhone: '9850022334',
    specialInstructions: 'Medium spicy, extra crispy papad',
    paymentMethod: 'CASH',
    paymentStatus: 'PENDING',
    orderStatus: 'received',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'HVM-108198',
    restaurantId: 'veg-maharaja-main',
    restaurantName: 'HOTEL VEG MAHARAJA',
    tableId: 'hvm-t2',
    tableNumber: '2',
    areaName: 'Ground Floor · AC Family Hall',
    items: [
      { dish: { id: 'hvm-bir-01', name: 'Veg Dum Biryani', price: 250, category: 'biryani_rice_special' }, quantity: 2 },
      { dish: { id: 'hvm-sal-02', name: 'Veg Rayta', price: 90, category: 'salad_special' }, quantity: 1 },
      { dish: { id: 'hvm-bev-02', name: 'Masala Tak / Chach', price: 25, category: 'beverages' }, quantity: 2 },
    ],
    subtotal: 640,
    tax: 32,
    totalAmount: 672,
    customerName: 'Priya Joshi',
    customerPhone: '9422033445',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    orderStatus: 'served',
    cashReceivedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    cashReceivedBy: 'Staff (Counter)',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
];

const defaultPwd = hashPassword('Maharaja@2026');

const INITIAL_USERS: DbUser[] = [
  {
    id: 'usr-hvm-owner',
    email: 'owner@vegmaharaja.com',
    passwordHash: defaultPwd.hash,
    salt: defaultPwd.salt,
    name: 'Rajendra Patil (Owner)',
    role: 'owner',
    restaurantId: 'veg-maharaja-main',
    restaurantName: 'HOTEL VEG MAHARAJA',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr-hvm-mgr',
    email: 'manager@vegmaharaja.com',
    passwordHash: defaultPwd.hash,
    salt: defaultPwd.salt,
    name: 'Vikram Shinde (Manager)',
    role: 'manager',
    restaurantId: 'veg-maharaja-main',
    restaurantName: 'HOTEL VEG MAHARAJA',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr-hvm-staff',
    email: 'staff@vegmaharaja.com',
    passwordHash: defaultPwd.hash,
    salt: defaultPwd.salt,
    name: 'Amit Jadhav (Floor Captain)',
    role: 'staff',
    restaurantId: 'veg-maharaja-main',
    restaurantName: 'HOTEL VEG MAHARAJA',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr-hvm-cashier',
    email: 'cashier@vegmaharaja.com',
    passwordHash: defaultPwd.hash,
    salt: defaultPwd.salt,
    name: 'Sunita More (Billing Desk)',
    role: 'staff',
    restaurantId: 'veg-maharaja-main',
    restaurantName: 'HOTEL VEG MAHARAJA',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr-rpe-staff',
    email: 'staff@punjabexpress.com',
    passwordHash: defaultPwd.hash,
    salt: defaultPwd.salt,
    name: 'Harpreet Singh (Captain)',
    role: 'staff',
    restaurantId: 'royal-punjab-express',
    restaurantName: 'ROYAL PUNJAB EXPRESS',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [...INITIAL_USERS],
      tables: [...INITIAL_TABLES],
      orders: [...INITIAL_ORDERS],
    };
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (parsed.users && Array.isArray(parsed.users) && parsed.users.length > 0) {
          this.data.users = parsed.users;
        } else {
          this.data.users = [...INITIAL_USERS];
        }
        if (parsed.tables && Array.isArray(parsed.tables)) {
          this.data.tables = parsed.tables;
        }
        if (parsed.orders && Array.isArray(parsed.orders)) {
          this.data.orders = parsed.orders;
        }
        this.saveToDisk();
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.error('[DB] Error loading database from disk:', err);
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB] Error saving database to disk:', err);
    }
  }

  // --- User & Staff Management ---
  public getUserById(id: string): DbUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): DbUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public getUsersByRestaurant(restaurantId: string): Omit<DbUser, 'passwordHash' | 'salt'>[] {
    return this.data.users
      .filter(u => u.restaurantId === restaurantId)
      .map(({ passwordHash, salt, ...safeUser }) => safeUser);
  }

  public createUser(payload: {
    email: string;
    password: string;
    name: string;
    role: 'owner' | 'manager' | 'staff';
    restaurantId: string;
    restaurantName: string;
  }): Omit<DbUser, 'passwordHash' | 'salt'> {
    const existing = this.getUserByEmail(payload.email);
    if (existing) {
      throw new Error(`A staff account with email ${payload.email} already exists.`);
    }

    const { hash, salt } = hashPassword(payload.password);
    const now = new Date().toISOString();
    const newUser: DbUser = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      email: payload.email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      name: payload.name.trim(),
      role: payload.role || 'staff',
      restaurantId: payload.restaurantId,
      restaurantName: payload.restaurantName,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    this.data.users.push(newUser);
    this.saveToDisk();

    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return safeUser;
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    const deleted = this.data.users.length < initialLen;
    if (deleted) {
      this.saveToDisk();
    }
    return deleted;
  }

  // --- Tables Management ---
  public getTablesByRestaurant(restaurantId: string): DbTable[] {
    return this.data.tables.filter(t => t.restaurantId === restaurantId);
  }

  public getTableById(restaurantId: string, tableId: string): DbTable | undefined {
    return this.data.tables.find(
      t => t.restaurantId === restaurantId && (t.id === tableId || t.number === tableId)
    );
  }

  public createTable(restaurantId: string, payload: { number: string; area: string; capacity: number }): DbTable {
    const existing = this.data.tables.find(
      t => t.restaurantId === restaurantId && t.number.trim() === payload.number.trim()
    );
    if (existing) {
      throw new Error(`Table number ${payload.number} already exists for this restaurant.`);
    }

    const newTable: DbTable = {
      id: `${restaurantId}-t${payload.number.replace(/\s+/g, '')}-${Date.now().toString(36)}`,
      restaurantId,
      number: payload.number.trim(),
      area: payload.area.trim() || 'Main Dining Hall',
      capacity: Number(payload.capacity) || 4,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.data.tables.push(newTable);
    this.saveToDisk();
    return newTable;
  }

  public deleteTable(restaurantId: string, tableId: string): boolean {
    const initialLength = this.data.tables.length;
    this.data.tables = this.data.tables.filter(
      t => !(t.restaurantId === restaurantId && (t.id === tableId || t.number === tableId))
    );
    const deleted = this.data.tables.length < initialLength;
    if (deleted) {
      this.saveToDisk();
    }
    return deleted;
  }

  // --- Orders Management ---
  public getOrdersByRestaurant(restaurantId: string): DbOrder[] {
    return this.data.orders
      .filter(o => o.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(orderId: string): DbOrder | undefined {
    return this.data.orders.find(o => o.id === orderId);
  }

  public createOrder(payload: Omit<DbOrder, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DbOrder {
    const generatedId = payload.id || `HVM-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newOrder: DbOrder = {
      ...payload,
      id: generatedId,
      createdAt: now,
      updatedAt: now,
    };

    this.data.orders.unshift(newOrder);
    this.saveToDisk();
    return newOrder;
  }

  public markCashReceived(orderId: string, staffName: string = 'Authorized Staff'): DbOrder {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.paymentMethod !== 'CASH') {
      throw new Error(`Order ${orderId} is not a cash order`);
    }

    order.paymentStatus = 'PAID';
    order.cashReceivedAt = new Date().toISOString();
    order.cashReceivedBy = staffName;
    order.updatedAt = new Date().toISOString();

    this.saveToDisk();
    return order;
  }

  public updateOrderStatus(orderId: string, status: DbOrder['orderStatus']): DbOrder {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return order;
  }

  public markOrderOnlinePaid(orderId: string, razorpayData: DbOrder['razorpayDetails']): DbOrder {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.paymentMethod = 'ONLINE';
    order.paymentStatus = 'PAID';
    order.razorpayDetails = razorpayData;
    order.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return order;
  }

  public markOrderPaymentFailed(orderId: string, reason?: string): DbOrder {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.paymentStatus = 'FAILED';
    order.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return order;
  }
}

export const db = new Database();
