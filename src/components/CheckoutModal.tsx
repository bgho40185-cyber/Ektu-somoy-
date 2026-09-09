import React, { useState } from 'react';
import {
  X,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { CartItem, OrderType, PaymentMethod, OrderDetails } from '../types';
import { CAFE_INFO } from '../data/menuData';
import { formatPrice, calculateBill } from '../utils/cafeHelpers';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  orderType: OrderType;
  appliedCoupon: string;
  onOrderSuccess: (order: OrderDetails) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  orderType,
  appliedCoupon,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const bill = calculateBill(items, appliedCoupon, orderType);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('Table 4 (Garden)');
  const [pickupTime, setPickupTime] = useState('15-20 mins (Earliest)');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Payment method: Counter only per request
  const paymentMethod: PaymentMethod = 'counter';
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const simulatedOrderId = `ES-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setFormError('Please provide your name for the order receipt.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setFormError('Please provide your complete delivery address.');
      return;
    }

    setFormError('');
    setIsProcessing(true);

    // Simulate express payment gateway processing
    setTimeout(() => {
      setIsProcessing(false);
      const newOrder: OrderDetails = {
        orderId: simulatedOrderId,
        createdAt: new Date().toISOString(),
        orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        pickupTime: orderType === 'takeaway' ? pickupTime : undefined,
        specialNotes: specialNotes.trim() || undefined,
        items,
        subtotal: bill.subtotal,
        discount: bill.discount,
        couponCode: appliedCoupon || undefined,
        gst: bill.gst,
        serviceCharge: bill.serviceCharge,
        deliveryFee: bill.deliveryFee,
        total: bill.total,
        paymentMethod,
        paymentStatus: 'pending',
        transactionId: `TXN_COUNTER_${Date.now().toString().slice(-8)}`,
        orderStatus: 'received',
      };

      onOrderSuccess(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0E1015] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-6 text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#0A0B0E]">
          <div>
            <span className="text-xl sm:text-2xl font-light text-[#E5E7EB]">
              Express Bill & Payment
            </span>
            <p className="text-xs text-zinc-400 mt-0.5 font-light">
              Complete your payment for instant kitchen dispatch at <strong className="text-zinc-300 font-medium">{CAFE_INFO.name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleProcessPayment} className="p-5 sm:p-6 space-y-6 max-h-[calc(88vh-130px)] overflow-y-auto">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Customer Contact & Dining Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#C29B6B] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#C29B6B]/20 text-[#C29B6B] flex items-center justify-center text-[10px] font-mono">1</span>
              <span>Customer Details ({orderType.toUpperCase()})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Roy"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0E] border border-white/10 text-xs text-[#E5E7EB] placeholder-zinc-600 focus:outline-none focus:border-[#C29B6B] font-light"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  Phone Number (For Bill SMS) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0E] border border-white/10 text-xs text-[#E5E7EB] placeholder-zinc-600 focus:outline-none focus:border-[#C29B6B] font-mono"
                />
              </div>
            </div>

            {/* Conditional field according to OrderType */}
            {orderType === 'dine-in' && (
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  Table / Seating Area
                </label>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0E] border border-white/10 text-xs text-[#E5E7EB] focus:outline-none focus:border-[#C29B6B]"
                >
                  <option value="Table 1 (Indoor AC)">Table 1 (Indoor AC Lounge)</option>
                  <option value="Table 2 (Indoor AC)">Table 2 (Indoor AC Lounge)</option>
                  <option value="Table 3 (Window Seat)">Table 3 (Window View)</option>
                  <option value="Table 4 (Garden)">Table 4 (Patio Garden)</option>
                  <option value="Table 5 (Garden)">Table 5 (Patio Garden)</option>
                  <option value="Bar Counter 1">Espresso Bar Counter</option>
                </select>
              </div>
            )}

            {orderType === 'takeaway' && (
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  Preferred Pickup Timing
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0E] border border-white/10 text-xs text-[#E5E7EB] focus:outline-none focus:border-[#C29B6B]"
                >
                  <option value="15-20 mins (Earliest)">Earliest (15 - 20 mins)</option>
                  <option value="In 30 mins">In 30 mins</option>
                  <option value="In 45 mins">In 45 mins</option>
                  <option value="In 1 hour">In 1 hour</option>
                </select>
              </div>
            )}

            {orderType === 'delivery' && (
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  Complete Delivery Address <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Flat / Building number, Street, Landmark, Pin code..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0A0B0E] border border-white/10 text-xs text-[#E5E7EB] placeholder-zinc-600 focus:outline-none focus:border-[#C29B6B] font-light"
                />
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="space-y-4 border-t border-white/5 pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#C29B6B] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#C29B6B]/20 text-[#C29B6B] flex items-center justify-center text-[10px] font-mono">2</span>
                <span>Payment Method</span>
              </h3>
              <span className="text-xs font-medium text-zinc-400">
                Total: <span className="text-[#C29B6B] text-sm font-mono font-semibold">{formatPrice(bill.total)}</span>
              </span>
            </div>

            {/* Pay at Counter Card */}
            <div className="p-4 rounded-2xl bg-[#0A0B0E] border border-[#C29B6B]/40 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C29B6B]/15 border border-[#C29B6B]/30 flex items-center justify-center text-[#C29B6B] shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E5E7EB]">
                    At Counter
                  </h4>
                  <span className="text-[11px] text-zinc-400">Pay in Cash or Card at Cafe Counter</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed pt-2 border-t border-white/5">
                Your order will be transmitted directly to the kitchen. You can settle your bill of <strong className="text-[#C29B6B] font-mono font-medium">{formatPrice(bill.total)}</strong> when served or upon collecting your order at the barista station.
              </p>
            </div>
          </div>

          {/* Security footnote */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/5 font-mono">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#C29B6B]" />
              <span>Direct Kitchen Dispatch</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Instant Confirmation</span>
            </div>
          </div>

          {/* Submit payment button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-xl bg-[#C29B6B] hover:bg-[#B18A5A] text-black font-semibold uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#C29B6B]/10 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Confirming Order...</span>
              </div>
            ) : (
              <>
                <span>Confirm Order ({formatPrice(bill.total)})</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
