import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTable } from '../context/TableContext';
import { useLanguage } from '../context/LanguageContext';
import { ExactMaharajaLogo } from '../components/common/Logo';
import { TableIndicator } from '../components/common/TableIndicator';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { VegBadge } from '../components/common/VegBadge';
import { RazorpayPaymentModal } from '../components/payment/RazorpayPaymentModal';
import { RazorpayPaymentResult } from '../services/razorpayService';
import { apiService, ApiOrder } from '../services/apiService';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  User,
  Phone,
  CreditCard,
  Banknote,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, tax, grandTotal, totalCount, clearCart } = useCart();
  const { tableNumber, tableId, areaName, restaurantId, restaurant, isQRLocked } = useTable();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(() => localStorage.getItem('hvm_guest_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('hvm_guest_phone') || '');
  const [specialInstructions, setSpecialInstructions] = useState(() => localStorage.getItem('hvm_instructions') || '');

  // Two Payment Options: ONLINE or CASH
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH'>('ONLINE');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Razorpay state
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [activeCreatedOrder, setActiveCreatedOrder] = useState<ApiOrder | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>('');

  // Track if order was placed so clearCart() doesn't accidentally redirect to /menu instead of /order-confirmation
  const isOrderPlacedRef = useRef(false);

  // Redirect to menu if cart is empty on visit (safe inside useEffect, not during render)
  useEffect(() => {
    if (items.length === 0 && !isOrderPlacedRef.current) {
      navigate('/menu', { replace: true });
    }
  }, [items.length, navigate]);

  // If cart is empty, render loading/transition state while useEffect redirects or order completes
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#7D151B] mx-auto" />
          <p className="text-sm text-stone-600 font-medium">
            {isOrderPlacedRef.current ? 'Finalizing your order...' : 'Redirecting to menu...'}
          </p>
        </div>
      </div>
    );
  }

  const effectiveTableNumber = tableNumber || '5';
  const effectiveTableId = tableId || `${restaurantId}-t${effectiveTableNumber}`;

  // Handle Order Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (customerName) localStorage.setItem('hvm_guest_name', customerName);
    if (customerPhone) localStorage.setItem('hvm_guest_phone', customerPhone);
    if (specialInstructions) localStorage.setItem('hvm_instructions', specialInstructions);

    try {
      // 1. If Cash Payment is selected:
      if (paymentMethod === 'CASH') {
        const orderPayload: Partial<ApiOrder> = {
          restaurantId,
          restaurantName: restaurant.name,
          tableId: effectiveTableId,
          tableNumber: effectiveTableNumber,
          areaName,
          items: items.map(item => ({
            dish: {
              id: item.dish.id,
              name: item.dish.name,
              price: item.dish.price,
              category: item.dish.category,
            },
            quantity: item.quantity,
          })),
          subtotal,
          tax,
          totalAmount: grandTotal,
          customerName: customerName || 'Valued Guest',
          customerPhone: customerPhone || '',
          specialInstructions: specialInstructions || '',
          paymentMethod: 'CASH',
          paymentStatus: 'PENDING',
        };

        const createdOrder = await apiService.createOrder(orderPayload);
        localStorage.setItem('hvm_confirmed_order', JSON.stringify(createdOrder));
        isOrderPlacedRef.current = true;
        clearCart();
        setIsSubmitting(false);
        navigate(`/order-confirmation?orderId=${createdOrder.id}`);
        return;
      }

      // 2. If Online Payment (Razorpay) is selected:
      // First create pending order in backend
      const orderPayload: Partial<ApiOrder> = {
        restaurantId,
        restaurantName: restaurant.name,
        tableId: effectiveTableId,
        tableNumber: effectiveTableNumber,
        areaName,
        items: items.map(item => ({
          dish: {
            id: item.dish.id,
            name: item.dish.name,
            price: item.dish.price,
            category: item.dish.category,
          },
          quantity: item.quantity,
        })),
        subtotal,
        tax,
        totalAmount: grandTotal,
        customerName: customerName || 'Valued Guest',
        customerPhone: customerPhone || '',
        specialInstructions: specialInstructions || '',
        paymentMethod: 'ONLINE',
        paymentStatus: 'PENDING',
      };

      const createdOrder = await apiService.createOrder(orderPayload);
      setActiveCreatedOrder(createdOrder);

      // Create Razorpay payment order on server
      const rzpRes = await apiService.createRazorpayOrder(grandTotal, createdOrder.id, {
        restaurantId,
        tableNumber: effectiveTableNumber,
        customerName: customerName || 'Valued Guest',
      });

      setRazorpayOrderId(rzpRes.razorpayOrderId);
      setIsSubmitting(false);
      setIsRazorpayModalOpen(true);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to place order');
    }
  };

  // Handle Online Payment Success & Server Signature Verification
  const handlePaymentSuccess = async (result: RazorpayPaymentResult) => {
    if (!activeCreatedOrder) return;

    try {
      // Verify signature on backend server
      const verification = await apiService.verifyPayment({
        orderId: activeCreatedOrder.id,
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature || 'demo_sig_client',
        method: result.method,
      });

      const confirmedOrder = verification.order || {
        ...activeCreatedOrder,
        paymentStatus: 'PAID',
        razorpayDetails: {
          orderId: result.razorpay_order_id,
          paymentId: result.razorpay_payment_id,
          method: result.method,
        },
      };

      localStorage.setItem('hvm_confirmed_order', JSON.stringify(confirmedOrder));
      isOrderPlacedRef.current = true;
      clearCart();
      setIsRazorpayModalOpen(false);
      navigate(`/order-confirmation?orderId=${confirmedOrder.id}`);
    } catch (err: unknown) {
      alert(`Payment verification failed: ${err instanceof Error ? err.message : 'Signature error'}`);
    }
  };

  // Handle Online Payment Cancellation / Failure
  const handlePaymentFailure = async (reason: string) => {
    if (activeCreatedOrder) {
      await apiService.notifyPaymentFailure(activeCreatedOrder.id, reason);
    }
    setIsRazorpayModalOpen(false);
    setErrorMessage(
      `Online payment was cancelled or failed (${reason}). You can retry or choose to Pay Cash instead.`
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 pb-32 md:pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#7D151B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('return_to_cart')}</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <TableIndicator size="sm" />
            <LanguageSelector />
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Payment Notification</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#EDE5D5] shadow-sm overflow-hidden">
          {/* Top Brand Banner: HOTEL VEG MAHARAJA & Table Number */}
          <div className="bg-gradient-to-r from-[#4E0D11] via-[#7D151B] to-[#5A0F14] text-white p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <ExactMaharajaLogo size="sm" />
                <div>
                  <span className="font-cinzel font-black text-xs tracking-[0.2em] text-[#F5C443] block">
                    HOTEL
                  </span>
                  <h1 className="font-serif font-black text-xl sm:text-2xl text-white tracking-wide">
                    {restaurant.name}
                  </h1>
                  <span className="text-[10px] text-[#F3D99A] font-bold">
                    Pure Veg & Family Restaurant
                  </span>
                </div>
              </div>

              {/* Table Number Display (Locked to prevent accidental changes) */}
              <div className="bg-black/30 backdrop-blur-xs border border-white/20 rounded-2xl p-3 sm:px-4 sm:py-2.5 flex items-center justify-between sm:justify-start gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E2BF6F] block flex items-center gap-1">
                    {isQRLocked && <Lock className="w-2.5 h-2.5" />}
                    <span>{t('table')}</span>
                  </span>
                  <span className="font-serif font-black text-lg sm:text-xl text-white">
                    {t('table')} {effectiveTableNumber}
                  </span>
                  <span className="text-[10px] text-stone-300 block truncate max-w-[140px]">
                    {areaName}
                  </span>
                </div>
                {isQRLocked ? (
                  <span className="text-[10px] bg-emerald-700/60 text-emerald-200 border border-emerald-500/30 px-2 py-1 rounded-md font-semibold">
                    QR Verified
                  </span>
                ) : (
                  <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded-md font-semibold">
                    Walk-in
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            {/* Ordered Food Items Section */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EDE5D5] mb-4">
                <h2 className="font-serif font-bold text-lg text-stone-900">
                  {t('ordered_items')} ({totalCount})
                </h2>
                <span className="text-xs text-stone-500 font-semibold">
                  {t('step_review')}
                </span>
              </div>

              <div className="space-y-3 divide-y divide-stone-100">
                {items.map(item => (
                  <div
                    key={item.dish.id}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <VegBadge size="sm" />
                      <div className="truncate">
                        <span className="font-serif font-bold text-stone-900 text-sm block truncate">
                          {item.dish.name}
                        </span>
                        <span className="text-stone-500 text-[11px]">
                          {t('price')}: ₹{item.dish.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <span className="font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded text-xs tabular-nums">
                        {t('quantity')}: {item.quantity}
                      </span>
                      <span className="font-serif font-bold text-stone-900 text-sm tabular-nums min-w-[60px]">
                        ₹{item.dish.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount Card */}
            <div className="bg-[#FAF1F1] rounded-2xl p-4 sm:p-5 border border-[#7D151B]/20 space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-600">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-stone-900 tabular-nums">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>{t('gst')} (5%)</span>
                <span className="tabular-nums">₹{tax}</span>
              </div>
              <div className="pt-2 border-t border-[#7D151B]/20 flex justify-between items-baseline">
                <div>
                  <span className="font-serif font-black text-base sm:text-lg text-stone-900">
                    {t('total_amount')}
                  </span>
                  <span className="block text-[10px] text-stone-500">
                    {t('all_taxes_included')}
                  </span>
                </div>
                <span className="font-serif font-black text-2xl sm:text-3xl text-[#7D151B] tabular-nums">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* FEATURE 2: TWO PAYMENT OPTIONS */}
            <div className="space-y-3 pt-2">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Select Payment Option
                </h3>
                <p className="text-xs text-stone-500">
                  Choose how you would like to settle your bill for Table {effectiveTableNumber}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Option 1: Online Payment (Razorpay) */}
                <div
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'ONLINE'
                      ? 'border-[#7D151B] bg-[#FAF1F1]/70 shadow-sm ring-1 ring-[#7D151B]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0284c7]/15 text-[#0284c7] flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-stone-900">Online Payment</span>
                          <span className="text-[10px] bg-[#0284c7] text-white px-1.5 py-0.2 rounded font-black">
                            Instant
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          UPI, GPay, PhonePe, Cards, NetBanking
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        paymentMethod === 'ONLINE'
                          ? 'border-[#7D151B] bg-[#7D151B]'
                          : 'border-stone-300'
                      }`}
                    >
                      {paymentMethod === 'ONLINE' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-[11px] text-stone-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Secured by Razorpay Payment Gateway</span>
                  </div>
                </div>

                {/* Option 2: Cash Payment */}
                <div
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'CASH'
                      ? 'border-[#7D151B] bg-[#FAF1F1]/70 shadow-sm ring-1 ring-[#7D151B]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-stone-900">Pay Cash</span>
                          <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-black">
                            At Table
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Pay cash to captain or at billing counter
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        paymentMethod === 'CASH'
                          ? 'border-[#7D151B] bg-[#7D151B]'
                          : 'border-stone-300'
                      }`}
                    >
                      {paymentMethod === 'CASH' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-[11px] text-stone-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Status will remain Pending until staff verifies cash</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information (Optional - NO LOGIN REQUIRED) */}
            <div className="pt-2">
              <div className="mb-3">
                <h3 className="font-serif font-bold text-base text-stone-900">
                  {t('guest_info_title')}
                </h3>
                <p className="text-xs text-stone-500">
                  {t('guest_info_sub')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {t('customer_name')} ({t('optional')})
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#EDE5D5] rounded-xl focus:outline-none focus:border-[#7D151B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {t('mobile_number')} ({t('optional')})
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="e.g. 98220 12345"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#EDE5D5] rounded-xl focus:outline-none focus:border-[#7D151B]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Kitchen Notes / Special Cooking Request ({t('optional')})
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, Jain preparation, extra napkins"
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EDE5D5] rounded-xl focus:outline-none focus:border-[#7D151B]"
                />
              </div>
            </div>

            {/* Submission CTA Button */}
            <div className="pt-4 border-t border-[#EDE5D5] space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 ${
                  paymentMethod === 'ONLINE'
                    ? 'bg-[#7D151B] hover:bg-[#671116] active:bg-[#4E0D11]'
                    : 'bg-stone-800 hover:bg-stone-900 active:bg-black'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Placing Table Order...</span>
                  </>
                ) : paymentMethod === 'ONLINE' ? (
                  <>
                    <Lock className="w-4 h-4 text-[#F3D99A]" />
                    <span>Pay Online ₹{grandTotal} (Razorpay)</span>
                  </>
                ) : (
                  <>
                    <Banknote className="w-5 h-5 text-amber-300" />
                    <span>Place Order (Pay Cash ₹{grandTotal})</span>
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {paymentMethod === 'ONLINE'
                      ? 'Instant Kitchen KOT upon payment verification'
                      : 'KOT sent immediately to kitchen. Pay cash at counter/table'}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Razorpay Payment Modal (Only used for Online payment) */}
      <RazorpayPaymentModal
        isOpen={isRazorpayModalOpen}
        amount={grandTotal}
        tableNumber={effectiveTableNumber}
        razorpayOrderId={razorpayOrderId}
        customerName={customerName}
        customerPhone={customerPhone}
        onClose={() => setIsRazorpayModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </div>
  );
};
