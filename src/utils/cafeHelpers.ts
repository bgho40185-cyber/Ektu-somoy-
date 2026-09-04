import { CartItem, CartItemOption, OrderType } from '../types';
import { CAFE_INFO } from '../data/menuData';

export function isCafeOpen(): { isOpen: boolean; message: string; badgeColor: string } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const openTimeInMinutes = CAFE_INFO.openingTime24.open * 60; // 10:00 AM = 600
  const closeTimeInMinutes = CAFE_INFO.openingTime24.close * 60; // 11:00 PM = 1380

  if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
    const minutesLeft = closeTimeInMinutes - currentTimeInMinutes;
    const hoursLeft = Math.floor(minutesLeft / 60);
    const minsRemaining = minutesLeft % 60;

    let closingText = 'Closes at 11:00 PM';
    if (hoursLeft === 0) {
      closingText = `Closing in ${minsRemaining} mins`;
    }

    return {
      isOpen: true,
      message: `Open Now • ${closingText}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
  } else {
    return {
      isOpen: false,
      message: 'Closed Now • Opens at 10:00 AM',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
  }
}

export function formatPrice(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export interface PromoResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  message: string;
}

export function applyPromoCode(code: string, subtotal: number): PromoResult {
  const normalized = code.trim().toUpperCase();

  if (subtotal <= 0) {
    return { valid: false, code: '', discountAmount: 0, message: 'Add items to apply coupon' };
  }

  if (normalized === 'WELCOME10') {
    const discount = Math.round(subtotal * 0.1);
    return { valid: true, code: 'WELCOME10', discountAmount: discount, message: '10% Welcome Discount applied!' };
  }

  if (normalized === 'EKTIME20') {
    const discount = Math.min(Math.round(subtotal * 0.2), 120);
    return { valid: true, code: 'EKTIME20', discountAmount: discount, message: '20% Off (up to ₹120) applied!' };
  }

  if (normalized === 'CAFE50') {
    if (subtotal < 300) {
      return { valid: false, code: '', discountAmount: 0, message: 'Minimum order ₹300 required for CAFE50' };
    }
    return { valid: true, code: 'CAFE50', discountAmount: 50, message: 'Flat ₹50 savings applied!' };
  }

  return { valid: false, code: '', discountAmount: 0, message: 'Invalid or expired coupon code' };
}

export function calculateBill(items: CartItem[], couponCode = '', orderType: OrderType = 'dine-in') {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const promo = couponCode ? applyPromoCode(couponCode, subtotal) : { valid: false, discountAmount: 0, code: '', message: '' };
  const discount = promo.valid ? promo.discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - discount);

  // 5% Cafe GST
  const gst = Math.round(taxableAmount * 0.05);

  // 2.5% Service Charge for Dine-in (optional gratuity in modern cafes)
  const serviceCharge = orderType === 'dine-in' ? Math.round(taxableAmount * 0.025) : 0;

  // Delivery fee for delivery orders
  const deliveryFee = orderType === 'delivery' ? (taxableAmount > 500 ? 0 : 40) : 0;

  const total = Math.max(0, taxableAmount + gst + serviceCharge + deliveryFee);

  return {
    subtotal,
    discount,
    promoMessage: promo.valid ? promo.message : undefined,
    gst,
    serviceCharge,
    deliveryFee,
    total,
  };
}

export function generateUpiQrUrl(amount: number, orderId: string): string {
  const upiUrl = `upi://pay?pa=${encodeURIComponent(CAFE_INFO.upiId)}&pn=${encodeURIComponent(
    CAFE_INFO.name
  )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Bill for Order ${orderId}`)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(upiUrl)}`;
}
