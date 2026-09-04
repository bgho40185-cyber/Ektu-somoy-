import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { CafeExperience } from './components/CafeExperience';
import { OffersPage } from './components/OffersPage';
import { ContactPage } from './components/ContactPage';
import { BottomNav, NavTab } from './components/BottomNav';
import { Footer } from './components/Footer';
import { ItemCustomizerModal } from './components/ItemCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { TableBookingModal } from './components/TableBookingModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { MenuItem, CartItem, OrderType, OrderDetails } from './types';
import { calculateBill } from './utils/cafeHelpers';
import { Check } from 'lucide-react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  saveOrderToFirestore,
  fetchUserOrders,
  signInWithGoogle,
  logOutUser,
  isUserAdmin,
} from './firebase';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('es_cafe_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Order history persisted to localStorage
  const [orderHistory, setOrderHistory] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem('es_cafe_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const remoteOrders = await fetchUserOrders(user.uid);
          if (remoteOrders && remoteOrders.length > 0) {
            setOrderHistory((prev) => {
              const existingIds = new Set(prev.map((o) => o.orderId));
              const newOrders = remoteOrders.filter((o) => !existingIds.has(o.orderId));
              return [...newOrders, ...prev];
            });
          }
        } catch (err) {
          console.warn('Could not sync user orders from Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');

  // Modals state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBookTableOpen, setIsBookTableOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [activeSuccessOrder, setActiveSuccessOrder] = useState<OrderDetails | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Toast notification when item is added
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('es_cafe_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('es_cafe_orders', JSON.stringify(orderHistory));
    } catch {
      // ignore
    }
  }, [orderHistory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Cart actions
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      // Check if exact same item with exact same options already exists
      const existingIdx = prev.findIndex(
        (i) =>
          i.menuItemId === item.menuItemId &&
          i.selectedSize === item.selectedSize &&
          JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions) &&
          i.specialInstructions === item.specialInstructions
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += item.quantity;
        return copy;
      } else {
        return [...prev, item];
      }
    });

    showToast(`Added "${item.name}" to your cart`);
  };

  const handleQuickAdd = (menuItem: MenuItem) => {
    const defaultSize = menuItem.availableSizes?.[0]?.name;
    const sizeMultiplier = menuItem.availableSizes?.[0]?.priceMultiplier || 1.0;
    const unitPrice = Math.round(menuItem.price * sizeMultiplier);

    const newItem: CartItem = {
      id: `${menuItem.id}-${Date.now()}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      basePrice: menuItem.price,
      selectedSize: defaultSize,
      sizeMultiplier,
      selectedOptions: [],
      unitPrice,
      quantity: 1,
      image: menuItem.image,
      isVeg: menuItem.isVeg,
    };

    handleAddToCart(newItem);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleProceedToCheckout = (coupon: string) => {
    setAppliedCoupon(coupon);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: OrderDetails) => {
    setOrderHistory((prev) => [order, ...prev]);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setActiveSuccessOrder(order);

    // Save order to Firebase Firestore
    saveOrderToFirestore(order).catch((err) => {
      console.warn('Could not sync order to Firestore:', err);
    });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const billSummary = calculateBill(cartItems, appliedCoupon, orderType);

  const handleSwitchTab = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#E5E7EB] font-sans flex flex-col selection:bg-[#C29B6B] selection:text-black pb-16 sm:pb-20">
      {/* Toast Notification (positioned above bottom nav) */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#0E1015] text-[#E5E7EB] border border-white/10 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="ml-2 text-[#C29B6B] hover:underline"
          >
            View Cart →
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSwitchTab}
        onOpenBookTable={() => setIsBookTableOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        ordersCount={orderHistory.length}
        onOpenAdminLogin={() => {
          if (isUserAdmin(currentUser)) {
            setIsAdminPanelOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        isAdminLoggedIn={isUserAdmin(currentUser)}
      />

      {/* Main Page Layout Based on Selected Tab */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onExploreMenu={() => {
                const el = document.getElementById('menu-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenBookTable={() => setIsBookTableOpen(true)}
              onGoToContact={() => handleSwitchTab('contact')}
            />

            <MenuSection
              onSelectItem={(item) => setCustomizingItem(item)}
              onQuickAdd={handleQuickAdd}
            />

            <CafeExperience />
          </>
        )}

        {activeTab === 'offers' && (
          <OffersPage
            onApplyCoupon={(code) => {
              setAppliedCoupon(code);
              showToast(`Coupon "${code}" applied to tray!`);
            }}
            onExploreMenu={() => {
              handleSwitchTab('home');
              setTimeout(() => {
                const el = document.getElementById('menu-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 60);
            }}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {activeTab === 'contact' && (
          <ContactPage
            onOpenBookTable={() => setIsBookTableOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenBookTable={() => setIsBookTableOpen(true)}
        onSelectTab={handleSwitchTab}
        onOpenOrders={() => setIsOrdersOpen(true)}
        ordersCount={orderHistory.length}
      />

      {/* Bottom Navigation Bar with Home, Offer's, Cart, Contact */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSwitchTab}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Item Customizer Modal */}
      <ItemCustomizerModal
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        orderType={orderType}
        onChangeOrderType={setOrderType}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Express Payment & Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        orderType={orderType}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success & Tax Invoice Modal */}
      <OrderSuccessModal
        order={activeSuccessOrder}
        onClose={() => setActiveSuccessOrder(null)}
        onNewOrder={() => {
          setActiveSuccessOrder(null);
          handleSwitchTab('home');
          setTimeout(() => {
            const el = document.getElementById('menu-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        }}
      />

      {/* Table Booking Modal */}
      <TableBookingModal
        isOpen={isBookTableOpen}
        onClose={() => setIsBookTableOpen(false)}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orderHistory}
        onSelectOrder={(order) => setActiveSuccessOrder(order)}
        currentUser={currentUser}
        onSignInWithGoogle={async () => {
          try {
            await signInWithGoogle();
            showToast('Signed in with Google');
          } catch {
            showToast('Google sign-in cancelled or failed');
          }
        }}
        onSignOut={async () => {
          try {
            await logOutUser();
            showToast('Signed out successfully');
          } catch {
            // ignore
          }
        }}
      />

      {/* Admin Secret Login Modal (Triggered by 4 clicks on CAFE badge) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAdminLoginOpen(false);
          setIsAdminPanelOpen(true);
          showToast('Welcome to Admin Portal, Biki');
        }}
      />

      {/* Full Admin Management Panel */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onLoggedOut={() => {
          setCurrentUser(null);
          setIsAdminPanelOpen(false);
          showToast('Logged out of Admin Portal. Re-login required.');
        }}
      />
    </div>
  );
}
