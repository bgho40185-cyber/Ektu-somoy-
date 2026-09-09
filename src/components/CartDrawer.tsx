import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Utensils, Bike, ShoppingCart } from 'lucide-react';
import { CartItem, OrderType } from '../types';
import { formatPrice, calculateBill } from '../utils/cafeHelpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: (appliedCoupon: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  orderType,
  onChangeOrderType,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [activeCoupon, setActiveCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const bill = calculateBill(items, activeCoupon, orderType);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    const testBill = calculateBill(items, code, orderType);
    if (testBill.discount > 0) {
      setActiveCoupon(code);
      setCouponInput(code);
      setCouponError('');
    } else {
      setCouponError('Invalid or inapplicable coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon('');
    setCouponInput('');
    setCouponError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md bg-[#0E1015] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl text-left animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C29B6B]/15 text-[#C29B6B]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-medium text-[#E5E7EB] uppercase tracking-wider">Current Order</h2>
              <p className="text-[11px] text-zinc-500 font-mono">
                {items.length} {items.length === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-zinc-500 hover:text-rose-400 transition-colors p-1 uppercase tracking-wider text-[11px]"
                title="Empty cart"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900/60 border border-white/10 flex items-center justify-center text-zinc-500">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-light text-[#E5E7EB]">Your Cart is Empty</h3>
              <p className="text-xs text-zinc-400 max-w-xs font-light">
                Explore our handcrafted coffees, artisan sourdough sandwiches, and signature desserts.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#C29B6B] text-black font-semibold uppercase tracking-widest text-xs hover:bg-[#B18A5A] transition-all"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Dining Mode selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-zinc-400 block">
                Select Dining Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeOrderType('dine-in')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                    orderType === 'dine-in'
                      ? 'bg-[#C29B6B]/15 border-[#C29B6B] text-[#E5E7EB]'
                      : 'bg-[#0A0B0E] border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider text-[10px]">Dine-In</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeOrderType('takeaway')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                    orderType === 'takeaway'
                      ? 'bg-[#C29B6B]/15 border-[#C29B6B] text-[#E5E7EB]'
                      : 'bg-[#0A0B0E] border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider text-[10px]">Takeaway</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeOrderType('delivery')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                    orderType === 'delivery'
                      ? 'bg-[#C29B6B]/15 border-[#C29B6B] text-[#E5E7EB]'
                      : 'bg-[#0A0B0E] border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider text-[10px]">Delivery</span>
                </button>
              </div>
            </div>

            {/* Item list */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#0A0B0E] border border-white/5 space-y-2.5"
                >
                  <div className="flex gap-3">
                    {/* Item thumbnail */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-[#0E1015] border border-white/5"
                      referrerPolicy="no-referrer"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-[#E5E7EB] truncate">{item.name}</h4>
                        <span className="text-xs font-mono font-medium text-[#C29B6B]">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>

                      {/* Size or options tags */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedSize && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/10 font-mono">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedOptions.map((opt, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-[#C29B6B] border border-white/10 font-mono"
                          >
                            {opt.selectedOption}
                          </span>
                        ))}
                      </div>

                      {item.specialInstructions && (
                        <p className="text-[10px] text-zinc-500 italic mt-1 line-clamp-1 font-light">
                          "{item.specialInstructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Delete row */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-lg px-2 py-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="text-zinc-400 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-medium text-[#E5E7EB] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="text-zinc-400 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 uppercase tracking-wider text-[10px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Box */}
            <div className="p-3.5 rounded-2xl bg-[#0A0B0E] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#E5E7EB] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Tag className="w-3.5 h-3.5 text-[#C29B6B]" /> Have a Promo Code?
                </span>
                {activeCoupon && (
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="WELCOME10 / EKTIME20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#07080A] border border-white/10 text-xs text-[#E5E7EB] uppercase placeholder-zinc-600 focus:outline-none focus:border-[#C29B6B] font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-[#C29B6B] hover:text-black text-xs font-semibold text-[#C29B6B] border border-white/10 transition-colors uppercase tracking-wider text-[11px]"
                >
                  Apply
                </button>
              </div>

              {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}

              {bill.promoMessage && (
                <p className="text-[11px] text-emerald-400 font-medium">{bill.promoMessage}</p>
              )}

              {/* Fast coupon chip suggestions */}
              {!activeCoupon && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => handleApplyCoupon('WELCOME10')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900/80 text-[#C29B6B] hover:bg-zinc-800 border border-white/10 font-mono"
                  >
                    WELCOME10 (10% Off)
                  </button>
                  <button
                    onClick={() => handleApplyCoupon('EKTIME20')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900/80 text-[#C29B6B] hover:bg-zinc-800 border border-white/10 font-mono"
                  >
                    EKTIME20 (20% Off)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-5 bg-[#0A0B0E] border-t border-white/10 space-y-3">
            {/* Detailed Bill Breakdown */}
            <div className="space-y-1.5 text-xs text-zinc-400 font-light">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#E5E7EB] font-mono">{formatPrice(bill.subtotal)}</span>
              </div>

              {bill.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Discount ({activeCoupon})</span>
                  <span className="font-mono">-{formatPrice(bill.discount)}</span>
                </div>
              )}

              {bill.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-[#E5E7EB] font-mono">{formatPrice(bill.deliveryFee)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-semibold text-[#E5E7EB]">
                <span className="uppercase tracking-wider text-xs">Total Amount</span>
                <span className="text-base font-mono text-[#C29B6B] font-medium">{formatPrice(bill.total)}</span>
              </div>
            </div>

            {/* Fast Checkout CTA */}
            <button
              id="proceed-checkout-btn"
              onClick={() => onProceedToCheckout(activeCoupon)}
              className="w-full py-3.5 px-5 rounded-xl bg-[#C29B6B] hover:bg-[#B18A5A] text-black font-semibold uppercase tracking-widest text-xs flex items-center justify-between shadow-lg shadow-[#C29B6B]/10 transition-all active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span>{formatPrice(bill.total)}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
