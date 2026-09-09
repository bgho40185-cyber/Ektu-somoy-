import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Printer,
  Coffee,
  Clock,
  X,
  Receipt,
} from 'lucide-react';
import { OrderDetails } from '../types';
import { CAFE_INFO } from '../data/menuData';
import { formatPrice } from '../utils/cafeHelpers';

interface OrderSuccessModalProps {
  order: OrderDetails | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onNewOrder,
}) => {
  useEffect(() => {
    if (order) {
      // Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C29B6B', '#E5E7EB', '#10B981', '#3B82F6'],
      });
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-xl bg-[#0E1015] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-4 sm:my-6 text-left animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Top Celebration Banner (hidden in print) */}
        <div className="p-4 sm:p-6 bg-[#0A0B0E] border-b border-white/10 text-center space-y-2 print:hidden relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/20">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          <h2 className="text-lg sm:text-2xl font-light text-[#E5E7EB]">
            Payment Received & Order Confirmed!
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 max-w-sm mx-auto font-light leading-relaxed">
            Your ticket has been sent to our barista and head chef. Sit back and enjoy the ambient rhythm at <strong className="text-zinc-200 font-medium">{CAFE_INFO.name}</strong>.
          </p>

          {/* Live Kitchen Status Progress Bar */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-medium tracking-wider uppercase mb-1.5">
              <span className="text-emerald-400 flex items-center justify-center gap-1">
                ✓ Order Paid
              </span>
              <span className="text-[#C29B6B] flex items-center justify-center gap-1 animate-pulse">
                • Kitchen Prep
              </span>
              <span className="text-zinc-600">Ready to Serve</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
              <div className="w-2/3 h-full bg-gradient-to-r from-emerald-500 via-[#C29B6B] to-[#C29B6B] rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Printable Digital Tax Invoice Body */}
        <div className="p-6 sm:p-8 space-y-6 text-[#E5E7EB] print:text-black">
          {/* Cafe Header & Invoice Metadata */}
          <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:border-black/20">
            <div>
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-[#C29B6B] print:text-black" />
                <h3 className="text-xl font-light tracking-tight text-[#E5E7EB] print:text-black">
                  {CAFE_INFO.name}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 print:text-gray-600 font-light">
                {CAFE_INFO.subtitle}
              </p>
              <p className="text-[11px] text-zinc-500 print:text-gray-500 mt-0.5 font-mono">
                Hours: {CAFE_INFO.openingHours} Daily • Ph: {CAFE_INFO.phone}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C29B6B] print:text-gray-700 block">
                Official Bill Receipt
              </span>
              <span className="text-sm font-mono font-semibold text-[#E5E7EB] print:text-black">
                #{order.orderId}
              </span>
              <div className="text-[11px] text-zinc-500 print:text-gray-600 font-mono">
                {order.createdAt}
              </div>
            </div>
          </div>

          {/* Customer & Order Details Summary */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-[#0A0B0E] p-4 rounded-2xl border border-white/5 print:bg-gray-50 print:border-gray-200">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-0.5">
                Guest Name
              </span>
              <strong className="text-[#E5E7EB] print:text-black font-medium text-xs">
                {order.customerName}
              </strong>
              <div className="text-[11px] text-zinc-400 print:text-gray-600 font-mono mt-0.5">
                {order.customerPhone}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-0.5">
                Order Type & Place
              </span>
              <strong className="text-[#C29B6B] print:text-black font-semibold uppercase text-xs">
                {order.orderType}
              </strong>
              <div className="text-[11px] text-zinc-400 print:text-gray-600 font-light mt-0.5">
                {order.tableNumber || order.pickupTime || order.customerAddress}
              </div>
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 border-b border-white/10 pb-2 flex justify-between print:border-black/20">
              <span>Item Description</span>
              <span>Amount</span>
            </div>

            <div className="space-y-2 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <div>
                    <div className="font-normal text-[#E5E7EB] print:text-black">
                      <span className="font-mono text-zinc-400 mr-1.5">{item.quantity}x</span>
                      {item.name}
                      {item.selectedSize && (
                        <span className="text-[11px] font-light text-zinc-400 ml-1">
                          ({item.selectedSize})
                        </span>
                      )}
                    </div>
                    {item.selectedOptions.length > 0 && (
                      <div className="text-[10px] text-[#C29B6B] print:text-gray-600 font-mono">
                        {item.selectedOptions.map((o) => o.selectedOption).join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div className="text-[10px] text-zinc-500 italic">
                        Note: {item.specialInstructions}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-zinc-300 print:text-black">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Tax Summary */}
          <div className="border-t border-white/10 pt-3.5 space-y-1.5 text-xs text-zinc-400 print:border-black/20 print:text-gray-600 font-light">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-[#E5E7EB] font-mono print:text-black font-medium">{formatPrice(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-mono print:text-green-700">
                <span>Discount ({order.couponCode})</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}

            {order.gst > 0 && (
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="text-[#E5E7EB] font-mono print:text-black font-medium">{formatPrice(order.gst)}</span>
              </div>
            )}

            {order.serviceCharge > 0 && (
              <div className="flex justify-between">
                <span>Service Gratuity (2.5%)</span>
                <span className="text-[#E5E7EB] font-mono print:text-black font-medium">{formatPrice(order.serviceCharge)}</span>
              </div>
            )}

            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Doorstep Delivery</span>
                <span className="text-[#E5E7EB] font-mono print:text-black font-medium">{formatPrice(order.deliveryFee)}</span>
              </div>
            )}

            <div className="flex justify-between pt-2.5 border-t border-white/10 text-sm font-light text-[#E5E7EB] print:text-black print:border-black/20">
              <span className="uppercase tracking-wider text-xs font-semibold">Total Paid</span>
              <span className="text-base font-mono font-medium text-[#C29B6B] print:text-black">{formatPrice(order.total)}</span>
            </div>

            {/* Transaction Stamp */}
            <div className="mt-3 p-3 rounded-xl bg-[#0A0B0E] border border-white/5 text-[11px] text-zinc-400 flex items-center justify-between print:bg-gray-100 print:border-gray-300">
              <div>
                <span className="font-medium uppercase text-emerald-400 print:text-green-700 tracking-wider">
                  {order.paymentStatus === 'paid' ? 'Paid Online' : 'Pay at Counter'}
                </span>
                <span className="text-zinc-500 ml-1.5">via {order.paymentMethod.toUpperCase()}</span>
              </div>
              <code className="text-[10px] text-zinc-400 font-mono print:text-gray-700">{order.transactionId}</code>
            </div>
          </div>
        </div>

        {/* Action Controls (hidden in print) */}
        <div className="p-5 bg-[#0A0B0E] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#C29B6B]" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNewOrder();
            }}
            className="px-6 py-2.5 rounded-xl bg-[#C29B6B] hover:bg-[#B18A5A] text-black text-xs font-semibold uppercase tracking-widest transition-all shadow-md active:scale-95"
          >
            Order More Items
          </button>
        </div>
      </div>
    </div>
  );
};
