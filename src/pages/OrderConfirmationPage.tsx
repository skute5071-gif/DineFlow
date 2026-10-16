import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExactMaharajaLogo } from '../components/common/Logo';
import { VegBadge } from '../components/common/VegBadge';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { useTable } from '../context/TableContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService, ApiOrder } from '../services/apiService';
import {
  CheckCircle2,
  Calendar,
  Hash,
  Utensils,
  Banknote,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { tableNumber } = useTable();
  const { t, language } = useLanguage();
  const [order, setOrder] = useState<ApiOrder | null>(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // 1. First try reading from localStorage
    const saved = localStorage.getItem('hvm_confirmed_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOrder(parsed);
      } catch {
        // fallback
      }
    }

    // 2. Fetch fresh order state from backend API if orderId is available
    if (orderId) {
      apiService
        .getOrder(orderId)
        .then(remoteOrder => {
          if (remoteOrder) {
            setOrder(remoteOrder);
            localStorage.setItem('hvm_confirmed_order', JSON.stringify(remoteOrder));
          }
        })
        .catch(err => {
          console.warn('[OrderConfirmation] Could not fetch remote order, using cached:', err);
        });
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Utensils className="w-10 h-10 text-[#7D151B] mx-auto animate-bounce" />
          <p className="text-sm font-bold text-stone-700">Loading Order Confirmation...</p>
        </div>
      </div>
    );
  }

  const isCash = order.paymentMethod === 'CASH';
  const isCashPending = isCash && order.paymentStatus === 'PENDING';
  const isPaid = order.paymentStatus === 'PAID';

  const formattedDate = new Date(order.createdAt).toLocaleString(
    language === 'mr' ? 'mr-IN' : 'en-IN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 pb-32 md:pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Top Header Bar */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <div className="bg-white rounded-3xl border border-[#EDE5D5] shadow-xl overflow-hidden">
          {/* 1. Header with Success Message & Restaurant Branding */}
          <div className="bg-gradient-to-r from-[#4E0D11] via-[#7D151B] to-[#5A0F14] text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-[#15803D] text-white flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-white/20 animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-[#CBA24B]/20 border border-[#CBA24B]/40 text-[#F3D99A] text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <VegBadge size="sm" />
              <span>{t('pure_veg')}</span>
            </div>

            {/* Success Message */}
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
              {t('order_successfully_placed')}
            </h1>

            {/* Restaurant Name */}
            <p className="font-cinzel text-xs font-bold tracking-[0.2em] text-[#F5C443] mt-2">
              {order.restaurantName}
            </p>
            <p className="text-xs text-[#EDE5D5]/80 mt-0.5">
              Kitchen Order Ticket (KOT) sent to master chef. Food is being prepared fresh.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* 2. Order Metadata Grid: Table Number, Order ID, Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF1F1] p-4 rounded-2xl border border-[#7D151B]/15">
              {/* Table Number */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7D151B] text-white flex items-center justify-center font-black text-sm shrink-0">
                  {order.tableNumber}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    {t('table')}
                  </span>
                  <span className="font-serif font-bold text-stone-900 text-sm">
                    {t('table')} {order.tableNumber}
                  </span>
                </div>
              </div>

              {/* Order ID */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EDE5D5] text-[#7D151B] flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    {t('order_id')}
                  </span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {order.id}
                  </span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EDE5D5] text-stone-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    {t('date_time')}
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Payment Status Box (Distinct for Cash vs Online) */}
            {isCash ? (
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isCashPending
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isCashPending ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">
                        Payment Method: Cash at Table / Counter
                      </span>
                      <span className="text-[10px] text-stone-600">
                        {isCashPending
                          ? 'Please hand over ₹' + order.totalAmount + ' in cash to your server or cashier'
                          : 'Cash payment confirmed by restaurant staff'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isCashPending
                        ? 'bg-amber-200/90 text-amber-900 border border-amber-400'
                        : 'bg-emerald-200/90 text-emerald-900 border border-emerald-400'
                    }`}
                  >
                    {isCashPending ? 'Payment: PENDING' : 'Payment: PAID'}
                  </span>
                </div>

                {isCashPending && (
                  <div className="p-2.5 bg-amber-100/70 border border-amber-300/60 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Payment Action Required:</strong> Restaurant staff will collect{' '}
                      <span className="font-bold underline">₹{order.totalAmount} in cash</span> at your table or
                      the billing counter. Authorized staff will mark this order as received in the staff portal.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Online Payment Verified Box */
              <div className="bg-[#0c2340] text-white p-4 rounded-2xl border border-[#0284c7]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0284c7] text-white flex items-center justify-center text-xs font-black italic">
                      R
                    </div>
                    <span className="text-xs font-bold text-stone-200">
                      Payment Verified · Razorpay Online Gateway
                    </span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10 text-stone-300">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Payment ID</span>
                    <span className="font-mono text-white font-medium">
                      {order.razorpayDetails?.paymentId || 'pay_verified_instant'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block text-[10px]">Gateway Order Ref</span>
                    <span className="font-mono text-white font-medium">
                      {order.razorpayDetails?.orderId || 'order_verified'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Ordered Items & Total Amount */}
            <div className="border border-[#EDE5D5] rounded-2xl p-4 bg-[#FDFBF7] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDE5D5]">
                <h2 className="font-serif font-bold text-sm text-stone-900">
                  {t('ordered_items')} ({order.items.length})
                </h2>
                <span className="text-xs font-bold text-[#15803D]">
                  {t('sent_to_kitchen')}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <VegBadge size="sm" />
                      <span className="font-bold text-stone-800">
                        {item.quantity} × {item.dish.name}
                      </span>
                    </div>
                    <span className="font-semibold text-stone-900 tabular-nums shrink-0 ml-2">
                      ₹{item.dish.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="pt-3 border-t border-[#EDE5D5] flex items-center justify-between">
                <div>
                  <span className="font-serif font-black text-base text-stone-900">
                    {t('total_amount')}
                  </span>
                  <span className="block text-[10px] text-stone-500">
                    {isCash ? 'To be paid in Cash' : 'Paid Online via Razorpay'}
                  </span>
                </div>
                <span className="font-serif font-black text-2xl text-[#7D151B] tabular-nums">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>

            {/* 5. Navigation Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <Link
                to="/menu"
                className="w-full sm:flex-1 py-3.5 bg-[#7D151B] hover:bg-[#671116] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-[#F3D99A]" />
                <span>Order More Items</span>
              </Link>

              <Link
                to="/admin"
                className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl border border-stone-300 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Staff Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
