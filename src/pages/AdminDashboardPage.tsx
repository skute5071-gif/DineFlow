import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiService, ApiOrder, ApiTable, ApiStaffUser } from '../services/apiService';
import { useTable } from '../context/TableContext';
import { TableQRCode } from '../components/table/TableQRCode';
import { ExactMaharajaLogo } from '../components/common/Logo';
import {
  QrCode,
  ClipboardList,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Utensils,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  X,
  CreditCard,
  Banknote,
  Users,
  LogOut,
  UserCheck,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantId, restaurant, tables: contextTables, refreshTables: refreshContextTables } = useTable();

  // Auth & Session State
  const [currentUser, setCurrentUser] = useState<ApiStaffUser | null>(() => apiService.getCachedUser());
  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true);

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'tables' | 'staff'>('orders');

  // Orders State
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending_cash' | 'paid_online' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Tables State
  const [tables, setTables] = useState<ApiTable[]>(contextTables);
  const [isAddTableOpen, setIsAddTableOpen] = useState<boolean>(false);
  const [newTableNum, setNewTableNum] = useState<string>('');
  const [newTableArea, setNewTableArea] = useState<string>('Main AC Hall');
  const [newTableCap, setNewTableCap] = useState<number>(4);
  const [tableActionMsg, setTableActionMsg] = useState<string | null>(null);

  // Staff Team State (Managers/Owners)
  const [staffList, setStaffList] = useState<ApiStaffUser[]>([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffEmail, setNewStaffEmail] = useState<string>('');
  const [newStaffPassword, setNewStaffPassword] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'manager'>('staff');
  const [staffActionMsg, setStaffActionMsg] = useState<string | null>(null);

  // 1. Verify Authentication & Enforce Protected Route
  useEffect(() => {
    const token = apiService.getToken();
    if (!token) {
      navigate('/staff/login', { replace: true, state: { from: location } });
      return;
    }

    const checkAuth = async () => {
      try {
        const user = await apiService.getCurrentUser();
        if (!user) {
          apiService.clearSession();
          navigate('/staff/login', { replace: true, state: { from: location } });
          return;
        }
        setCurrentUser(user);
      } catch {
        apiService.clearSession();
        navigate('/staff/login', { replace: true, state: { from: location } });
      } finally {
        setIsVerifyingAuth(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  // 2. Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      const data = await apiService.getRestaurantOrders(restaurantId);
      setOrders(data);
    } catch (err: unknown) {
      setOrdersError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [restaurantId]);

  // 3. Fetch tables from backend
  const fetchTables = useCallback(async () => {
    try {
      const data = await apiService.getTables(restaurantId);
      if (data && data.length > 0) {
        setTables(data);
      }
    } catch {
      // fallback
    }
  }, [restaurantId]);

  // 4. Fetch staff team members (for managers/owners)
  const fetchStaff = useCallback(async () => {
    try {
      const staff = await apiService.getRestaurantStaff(restaurantId);
      setStaffList(staff);
    } catch {
      // fallback
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!isVerifyingAuth) {
      fetchOrders();
      fetchTables();
      if (currentUser?.role === 'owner' || currentUser?.role === 'manager') {
        fetchStaff();
      }

      // Auto-refresh orders every 12 seconds
      const interval = setInterval(fetchOrders, 12000);
      return () => clearInterval(interval);
    }
  }, [isVerifyingAuth, fetchOrders, fetchTables, fetchStaff, currentUser]);

  // Handle Logout
  const handleLogout = () => {
    apiService.clearSession();
    setCurrentUser(null);
    navigate('/staff/login', { replace: true });
  };

  // Handle Mark Cash Received (Staff Only)
  const handleMarkCashReceived = async (orderId: string) => {
    if (!window.confirm(`Confirm receipt of cash payment for Order #${orderId}?`)) {
      return;
    }

    try {
      setActionLoadingId(orderId);
      const staffName = currentUser?.name || 'Staff Counter';
      const updatedOrder = await apiService.markCashReceived(restaurantId, orderId, staffName);
      setOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update cash status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Kitchen Status Progression
  const handleUpdateStatus = async (orderId: string, currentStatus: ApiOrder['orderStatus']) => {
    let nextStatus: ApiOrder['orderStatus'] = 'preparing';
    if (currentStatus === 'received') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'served';
    else if (currentStatus === 'served') nextStatus = 'completed';

    try {
      setActionLoadingId(orderId);
      const updated = await apiService.updateOrderStatus(restaurantId, orderId, nextStatus);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Add Table
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;

    try {
      const created = await apiService.addTable(restaurantId, {
        number: newTableNum.trim(),
        area: newTableArea.trim(),
        capacity: newTableCap,
      });
      setTables(prev => [...prev, created]);
      refreshContextTables();
      setIsAddTableOpen(false);
      setNewTableNum('');
      setTableActionMsg(`Table ${created.number} successfully added!`);
      setTimeout(() => setTableActionMsg(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create table');
    }
  };

  // Handle Delete Table
  const handleDeleteTable = async (tableId: string, tableNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete Table ${tableNumber}?`)) {
      return;
    }

    try {
      await apiService.deleteTable(restaurantId, tableId);
      setTables(prev => prev.filter(t => t.id !== tableId));
      refreshContextTables();
      setTableActionMsg(`Table ${tableNumber} deleted.`);
      setTimeout(() => setTableActionMsg(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete table');
    }
  };

  // Handle Add New Staff Member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword) return;

    try {
      const created = await apiService.createStaff(restaurantId, {
        name: newStaffName.trim(),
        email: newStaffEmail.trim().toLowerCase(),
        password: newStaffPassword,
        role: newStaffRole,
      });
      setStaffList(prev => [...prev, created]);
      setIsAddStaffOpen(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      setStaffActionMsg(`Staff account for ${created.name} (${created.email}) created!`);
      setTimeout(() => setStaffActionMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create staff account');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'pending_cash') {
      if (order.paymentMethod !== 'CASH' || order.paymentStatus === 'PAID') return false;
    } else if (orderFilter === 'paid_online') {
      if (order.paymentMethod !== 'ONLINE' || order.paymentStatus !== 'PAID') return false;
    } else if (orderFilter === 'active') {
      if (['completed', 'cancelled'].includes(order.orderStatus)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchTable = String(order.tableNumber).toLowerCase().includes(q);
      const matchCust = order.customerName.toLowerCase().includes(q);
      return matchId || matchTable || matchCust;
    }

    return true;
  });

  // Analytics Metrics
  const pendingCashOrders = orders.filter(o => o.paymentMethod === 'CASH' && o.paymentStatus === 'PENDING');
  const pendingCashTotal = pendingCashOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidOnlineOrders = orders.filter(o => o.paymentMethod === 'ONLINE' && o.paymentStatus === 'PAID');
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  if (isVerifyingAuth) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-stone-600">
        <div className="w-10 h-10 border-4 border-[#7D151B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-stone-800">Verifying Staff Authorization...</p>
        <p className="text-xs text-stone-500 mt-1">Checking secure JWT token and permissions</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 pb-32 md:pb-20 text-[#241A18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Card with Restaurant Info & Logged-in Staff Member */}
        <div className="bg-[#38080B] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#7D151B] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-[#CBA24B]/30 backdrop-blur-xs">
              <ExactMaharajaLogo size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel font-black text-xs tracking-[0.2em] text-[#F5C443]">
                  HOTEL
                </span>
                <span className="text-[10px] bg-[#15803D] text-white font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">
                  Staff & Owner Console
                </span>
              </div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
                {restaurant.name}
              </h1>
              <p className="text-xs text-stone-300">
                DineFlow Table QR Code Management & Live Order Console
              </p>
            </div>
          </div>

          {/* Logged-in Staff Info Badge & Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
            {currentUser && (
              <div className="bg-white/10 border border-[#CBA24B]/30 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#CBA24B] text-[#38080B] font-black text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className="text-[9px] bg-[#CBA24B]/30 text-[#F5C443] px-1.5 py-0.2 rounded-full font-black uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-300">{currentUser.email}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchOrders();
                  fetchTables();
                  if (currentUser?.role === 'owner' || currentUser?.role === 'manager') fetchStaff();
                }}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Refresh Live Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                to="/menu"
                className="px-3.5 py-2 bg-[#CBA24B] hover:bg-[#b88f3a] text-[#38080B] rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Customer Menu</span>
              </Link>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Log Out Staff Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#EDE5D5] pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-[#7D151B] text-white shadow-md'
                  : 'bg-white text-stone-700 border border-[#EDE5D5] hover:bg-stone-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Live Orders ({orders.length})</span>
              {pendingCashOrders.length > 0 && (
                <span className="bg-amber-400 text-stone-900 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingCashOrders.length} Cash
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tables')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'tables'
                  ? 'bg-[#7D151B] text-white shadow-md'
                  : 'bg-white text-stone-700 border border-[#EDE5D5] hover:bg-stone-50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Table QR Stands & Management ({tables.length})</span>
            </button>

            {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'staff'
                    ? 'bg-[#7D151B] text-white shadow-md'
                    : 'bg-white text-stone-700 border border-[#EDE5D5] hover:bg-stone-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Staff Team & RBAC ({staffList.length})</span>
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authenticated as <strong>{currentUser?.name}</strong></span>
          </div>
        </div>

        {/* ================= TAB 1: LIVE ORDERS (FEATURE 2) ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EDE5D5] shadow-xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                  Total Orders Today
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif font-black text-2xl text-stone-900">
                    {orders.length}
                  </span>
                  <ClipboardList className="w-5 h-5 text-stone-400" />
                </div>
              </div>

              <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-xs">
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
                  Cash Pending Collection
                </span>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="font-serif font-black text-2xl text-amber-900">
                      ₹{pendingCashTotal}
                    </span>
                    <span className="text-xs text-amber-700 block font-medium">
                      {pendingCashOrders.length} Uncollected Orders
                    </span>
                  </div>
                  <Banknote className="w-6 h-6 text-amber-600" />
                </div>
              </div>

              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                  Razorpay Online Paid
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif font-black text-2xl text-emerald-900">
                    {paidOnlineOrders.length}
                  </span>
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDE5D5] shadow-xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                  Total Verified Revenue
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif font-black text-2xl text-[#7D151B]">
                    ₹{totalRevenue}
                  </span>
                  <DollarSign className="w-5 h-5 text-[#CBA24B]" />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#EDE5D5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    orderFilter === 'all'
                      ? 'bg-[#7D151B] text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('pending_cash')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    orderFilter === 'pending_cash'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  Pending Cash ({pendingCashOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('paid_online')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    orderFilter === 'paid_online'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                  }`}
                >
                  Online Paid ({paidOnlineOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('active')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    orderFilter === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  Active Kitchen
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search table, order ID, guest..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white"
                />
              </div>
            </div>

            {/* Orders Feed */}
            {ordersLoading && orders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#EDE5D5]">
                <div className="w-8 h-8 border-3 border-[#7D151B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-stone-700">Loading live orders from server...</p>
              </div>
            ) : ordersError ? (
              <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="text-xs font-semibold">{ordersError}</span>
                </div>
                <button
                  onClick={fetchOrders}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#EDE5D5] space-y-2">
                <Utensils className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-sm font-bold text-stone-700">No orders found matching the filter</p>
                <p className="text-xs text-stone-500">
                  New orders submitted by customers scanning table QR codes will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrders.map(order => {
                  const isCash = order.paymentMethod === 'CASH';
                  const isPending = order.paymentStatus === 'PENDING';
                  const isPaid = order.paymentStatus === 'PAID';

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-2xl border shadow-xs transition-all flex flex-col justify-between overflow-hidden ${
                        isCash && isPending
                          ? 'border-amber-400 ring-2 ring-amber-100'
                          : 'border-[#EDE5D5] hover:border-[#7D151B]/40'
                      }`}
                    >
                      {/* Order Card Header */}
                      <div className="p-4 border-b border-stone-100 bg-[#FFFDF9]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-black text-base text-[#7D151B]">
                              Table #{order.tableNumber}
                            </span>
                            <span className="text-[10px] text-stone-500 truncate max-w-[120px]">
                              {order.areaName || 'Dining Area'}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                            {order.id}
                          </span>
                        </div>

                        {/* Customer Info & Timestamp */}
                        <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                          <span>Guest: <strong className="text-stone-800">{order.customerName}</strong></span>
                          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-4 space-y-2 flex-1">
                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between text-xs">
                              <div className="flex items-start gap-1.5 text-stone-800">
                                <span className="font-bold text-[#7D151B] tabular-nums">
                                  {item.quantity}×
                                </span>
                                <div>
                                  <span className="font-medium">{item.dish.name}</span>
                                  {item.specialInstructions && (
                                    <span className="block text-[10px] text-amber-700 italic">
                                      Note: {item.specialInstructions}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-bold text-stone-700 tabular-nums">
                                ₹{item.dish.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.specialInstructions && (
                          <div className="p-2 bg-amber-50/80 rounded-xl text-[11px] text-amber-900 border border-amber-200/60">
                            <strong>Chef Note:</strong> {order.specialInstructions}
                          </div>
                        )}
                      </div>

                      {/* Payment & Status Summary */}
                      <div className="p-4 bg-stone-50 border-t border-stone-100 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600 font-medium">Grand Total</span>
                          <span className="font-serif font-black text-base text-stone-900">
                            ₹{order.totalAmount}
                          </span>
                        </div>

                        {/* Payment Method & Status Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {isCash ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                <Banknote className="w-3.5 h-3.5 text-amber-700" />
                                <span>CASH ORDER</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                                <span>ONLINE (Razorpay)</span>
                              </span>
                            )}
                          </div>

                          <div>
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>PAID</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>PENDING</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cash Verification Record */}
                        {isCash && isPaid && (
                          <div className="text-[10px] text-emerald-800 bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-100">
                            Cash collected by: <strong>{order.cashReceivedBy || 'Counter Desk'}</strong>
                          </div>
                        )}

                        {/* Action 1: Cash Collection Button (for pending cash orders) */}
                        {isCash && isPending && (
                          <button
                            onClick={() => handleMarkCashReceived(order.id)}
                            disabled={actionLoadingId === order.id}
                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === order.id ? (
                              <span>Updating...</span>
                            ) : (
                              <>
                                <Banknote className="w-4 h-4" />
                                <span>Collect Cash (₹{order.totalAmount}) & Mark Paid</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Action 2: Kitchen Progress Button */}
                        {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, order.orderStatus)}
                            disabled={actionLoadingId === order.id}
                            className="w-full py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>
                              {order.orderStatus === 'received'
                                ? 'Send to Kitchen (Preparing)'
                                : order.orderStatus === 'preparing'
                                ? 'Mark as Served to Table'
                                : 'Mark Order Completed'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: TABLE QR CODES & MANAGEMENT (FEATURE 3 & 4) ================= */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            {/* Header with Add Table button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EDE5D5] shadow-xs">
              <div>
                <h2 className="font-serif font-bold text-lg text-stone-900">
                  Unique Table QR Stand Generator
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Every table has a unique, separate QR code containing the restaurant ID and table number.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsAddTableOpen(true)}
                  className="px-4 py-2.5 bg-[#7D151B] hover:bg-[#671116] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Table</span>
                </button>
              </div>
            </div>

            {tableActionMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tableActionMsg}</span>
              </div>
            )}

            {/* Tables Grid with Real QR Codes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {tables.map(table => {
                // Real deployed website URL for this specific table
                const tableUrl = `${window.location.origin}/menu?restaurantId=${encodeURIComponent(restaurantId)}&tableId=${encodeURIComponent(table.id)}&tableNumber=${encodeURIComponent(table.number)}`;

                return (
                  <div
                    key={table.id}
                    className="bg-white rounded-2xl border border-[#EDE5D5] shadow-xs p-4 flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-black text-base text-[#7D151B]">
                            Table #{table.number}
                          </span>
                          <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded font-medium">
                            {table.capacity} Seats
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteTable(table.id, table.number)}
                          className="text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                          title="Delete Table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Distinct Table QR Code with Canvas rendering */}
                      <TableQRCode
                        url={tableUrl}
                        tableNumber={table.number}
                        restaurantName={restaurant.name}
                        areaName={table.area}
                        size={160}
                      />
                    </div>

                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <a
                        href={tableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-[#FAF1F1] hover:bg-[#FAF1F1]/80 text-[#7D151B] border border-[#7D151B]/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Open & Test Table {table.number}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: STAFF TEAM MANAGEMENT (RBAC) ================= */}
        {activeTab === 'staff' && (currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EDE5D5] shadow-xs">
              <div>
                <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#7D151B]" />
                  <span>Authorized Restaurant Staff Members</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Role-based access control. Only authorized restaurant owners and managers can create new staff accounts.
                </p>
              </div>

              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="px-4 py-2.5 bg-[#7D151B] hover:bg-[#671116] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Staff Account</span>
              </button>
            </div>

            {staffActionMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{staffActionMsg}</span>
              </div>
            )}

            {/* Staff Members List */}
            <div className="bg-white rounded-2xl border border-[#EDE5D5] shadow-xs overflow-hidden">
              <div className="divide-y divide-stone-100">
                {staffList.map(member => (
                  <div key={member.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF1F1] text-[#7D151B] border border-[#7D151B]/20 font-black text-sm flex items-center justify-center">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">{member.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            member.role === 'owner'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : member.role === 'manager'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500">{member.email}</div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-stone-400 flex items-center gap-2">
                      <span className="hidden sm:inline">Active · Authorized</span>
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Table Modal */}
        {isAddTableOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white rounded-3xl border border-[#EDE5D5] shadow-2xl p-6 sm:p-7 w-full max-w-md space-y-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#7D151B] text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Add New Table
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddTableOpen(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddTable} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Table Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11, 12, T-A"
                    value={newTableNum}
                    onChange={e => setNewTableNum(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Dining Area / Hall
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. First Floor · Family AC Hall"
                    value={newTableArea}
                    onChange={e => setNewTableArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Seating Capacity
                  </label>
                  <select
                    value={newTableCap}
                    onChange={e => setNewTableCap(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white"
                  >
                    <option value={2}>2 Guests</option>
                    <option value={4}>4 Guests</option>
                    <option value={6}>6 Guests</option>
                    <option value={8}>8 Guests</option>
                    <option value={10}>10+ Guests (Royal Suite)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddTableOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#7D151B] hover:bg-[#671116] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Create Table & QR
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Staff Member Modal */}
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white rounded-3xl border border-[#EDE5D5] shadow-2xl p-6 sm:p-7 w-full max-w-md space-y-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#7D151B] text-white flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Create Staff Account
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Staff Member Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kadam"
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@vegmaharaja.com"
                    value={newStaffEmail}
                    onChange={e => setNewStaffEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Set temporary password"
                    value={newStaffPassword}
                    onChange={e => setNewStaffPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Staff Role
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value as 'staff' | 'manager')}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#7D151B] focus:bg-white"
                  >
                    <option value="staff">Floor Staff / Waiter / Cashier</option>
                    <option value="manager">Restaurant Manager</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#7D151B] hover:bg-[#671116] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Create Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
