/**
 * Razorpay Payment Service
 * 
 * Provides isolated frontend structure for Razorpay checkout integration.
 * In production, the client calls the backend (/api/create-razorpay-order) to get
 * an order_id using server-side Razorpay Key Secret (never stored in frontend code).
 * The client then initializes Razorpay Checkout options with the publishable key.
 */

export interface RazorpayOrderDetails {
  orderId: string;
  amount: number; // in INR
  customerName?: string;
  customerPhone?: string;
  tableNumber: string;
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature?: string;
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  timestamp: string;
}

/**
 * Initiates Razorpay payment flow.
 * In sandbox/development preview: executes structured Razorpay modal or mock verification.
 */
export const initiateRazorpayPayment = async (
  details: RazorpayOrderDetails,
  onSuccess: (result: RazorpayPaymentResult) => void,
  onFailure?: (error: Error) => void
): Promise<void> => {
  try {
    // In production, options are passed to new window.Razorpay(options).open()
    const paymentId = `pay_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
    const rzpOrderId = `order_${Date.now().toString(36)}`;

    const result: RazorpayPaymentResult = {
      razorpay_payment_id: paymentId,
      razorpay_order_id: rzpOrderId,
      method: 'upi',
      timestamp: new Date().toISOString(),
    };

    onSuccess(result);
  } catch (err: unknown) {
    if (onFailure) {
      onFailure(err instanceof Error ? err : new Error('Payment processing failed'));
    }
  }
};
