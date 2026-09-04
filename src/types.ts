export type DietaryPreference = 'all' | 'veg' | 'non-veg' | 'vegan';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  isChefSpecial?: boolean;
  isBestseller?: boolean;
  preparationTime: string; // e.g. "8-10 mins"
  calories?: number;
  availableSizes?: {
    name: string;
    priceMultiplier: number;
  }[];
  customizations?: {
    title: string;
    type: 'single' | 'multiple';
    options: {
      name: string;
      additionalPrice: number;
    }[];
  }[];
}

export interface CartItemOption {
  categoryTitle: string;
  selectedOption: string;
  extraPrice: number;
}

export interface CartItem {
  id: string; // unique cart line item id
  menuItemId: string;
  name: string;
  basePrice: number;
  selectedSize?: string;
  sizeMultiplier: number;
  selectedOptions: CartItemOption[];
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
  image: string;
  isVeg: boolean;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'counter';

export interface OrderDetails {
  orderId: string;
  createdAt: string;
  orderType: OrderType;
  tableNumber?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  pickupTime?: string;
  specialNotes?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  gst: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  transactionId: string;
  orderStatus: 'received' | 'preparing' | 'ready' | 'completed';
}

export interface TableReservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  timeSlot: string;
  guests: number;
  seatingArea: 'indoor-ac' | 'patio-garden' | 'coffee-bar' | 'co-working';
  specialRequests?: string;
  status: 'confirmed';
}

export interface CafeOffer {
  id: string;
  title: string;
  description: string;
  code?: string;
  discountBadge?: string;
  mediaType: 'none' | 'video' | 'image';
  mediaUrl?: string;
  videoChunksCount?: number;
  videoMimeType?: string;
  videoFileName?: string;
  videoSizeMb?: number;
  validUntil?: string;
  minOrder?: string;
  isActive: boolean;
  createdAt: string;
}
