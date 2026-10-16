import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  X,
  Smartphone,
  CreditCard,
  Building2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { RazorpayPaymentResult } from '../../services/razorpayService';

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  amount: number;
  tableNumber: string;
  razorpayOrderId?: string;
  customerName?: string;
  customerPhone?: string;
  onClose: () => void;
  onPaymentSuccess: (result: RazorpayPaymentResult) => void;
  onPaymentFailure?: (reason: string) => void;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  amount,
  tableNumber,
  razorpayOrderId,
  customerName = 'Guest',
  customerPhone = '',
  onClose,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState('guest@okhdfcbank');

  if (!isOpen) return null;

  const currentRzpOrderId = razorpayOrderId || `order_${Date.now().toString(36)}`;

  const handlePaySuccess = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const paymentId = `pay_${Date.now().toString(36).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
      // Simulated HMAC signature for server verification
      const signature = `demo_sig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      setIsProcessing(false);
      onPaymentSuccess({
        razorpay_payment_id: paymentId,
        razorpay_order_id: currentRzpOrderId,
        razorpay_signature: signature,
        method: selectedMethod,
        timestamp: new Date().toISOString(),
      });
    }, 1100);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onPaymentFailure) {
        onPaymentFailure('Transaction declined by issuing bank (Test Simulation)');
      } else {
        onClose();
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 text-stone-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Razorpay Header Bar */}
        <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Razorpay Logo glyph */}
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white font-black text-sm italic tracking-tighter shadow-xs">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-200 tracking-wide uppercase">
                  Razorpay
                </span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 font-semibold px-1.5 py-0.2 rounded border border-sky-400/30">
                  Standard Checkout
                </span>
              </div>
              <h3 className="font-serif font-bold text-sm text-white">
                HOTEL VEG MAHARAJA
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Amount Bar */}
        <div className="bg-[#f0f9ff] border-b border-sky-100 px-5 py-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 uppercase font-semibold">
              Table {tableNumber} Dining Bill
            </span>
            <p className="text-xs font-medium text-stone-700">
              {customerName ? `${customerName}` : 'Dine-in Guest'}
              {customerPhone ? ` · ${customerPhone}` : ''}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-stone-400 block uppercase">To Pay</span>
            <span className="text-xl font-bold text-sky-900 tabular-nums">
              ₹{amount}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Choose Payment Mode
            </label>

            {/* UPI Option */}
            <div
              onClick={() => setSelectedMethod('upi')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'upi'
                  ? 'border-[#0284c7] bg-sky-50/60 ring-1 ring-[#0284c7]'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">UPI / QR (Instant)</p>
                  <p className="text-[11px] text-stone-500">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'upi' ? 'border-[#0284c7] bg-[#0284c7]' : 'border-stone-300'
                }`}
              >
                {selectedMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>

            {/* Cards Option */}
            <div
              onClick={() => setSelectedMethod('card')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'card'
                  ? 'border-[#0284c7] bg-sky-50/60 ring-1 ring-[#0284c7]'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Debit / Credit Card</p>
                  <p className="text-[11px] text-stone-500">Visa, MasterCard, RuPay</p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'card' ? 'border-[#0284c7] bg-[#0284c7]' : 'border-stone-300'
                }`}
              >
                {selectedMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>

            {/* Netbanking Option */}
            <div
              onClick={() => setSelectedMethod('netbanking')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'netbanking'
                  ? 'border-[#0284c7] bg-sky-50/60 ring-1 ring-[#0284c7]'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Net Banking</p>
                  <p className="text-[11px] text-stone-500">SBI, HDFC, ICICI, Axis & All Banks</p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'netbanking' ? 'border-[#0284c7] bg-[#0284c7]' : 'border-stone-300'
                }`}
              >
                {selectedMethod === 'netbanking' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          </div>

          {/* Method Details */}
          {selectedMethod === 'upi' && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Virtual Payment Address (UPI ID)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
              />
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePaySuccess}
            disabled={isProcessing}
            className="w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay Now ₹{amount}</span>
              </>
            )}
          </button>

          {/* Simulation & Test Controls (Required for Feature 4 Testing) */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
              <span>Test Simulator Controls:</span>
              <button
                type="button"
                onClick={handleSimulateFailure}
                disabled={isProcessing}
                className="text-red-600 hover:text-red-700 font-semibold underline cursor-pointer"
              >
                Simulate Payment Failure / Cancel
              </button>
            </div>
          </div>

          {/* Razorpay Trust Footer */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 text-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Secured by Razorpay Payment Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};
