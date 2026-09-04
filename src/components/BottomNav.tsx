import React from 'react';
import { Home, Tag, ShoppingBag, MapPin } from 'lucide-react';

export type NavTab = 'home' | 'offers' | 'contact';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0A0B0E]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
    >
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-around">
        {/* 1. Home */}
        <button
          id="bottom-nav-home"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
            activeTab === 'home'
              ? 'text-[#C29B6B]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5 transition-transform active:scale-90" />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C29B6B]" />
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase font-medium mt-1">
            Home
          </span>
        </button>

        {/* 2. Offer's */}
        <button
          id="bottom-nav-offers"
          onClick={() => onSelectTab('offers')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
            activeTab === 'offers'
              ? 'text-[#C29B6B]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Tag className="w-5 h-5 transition-transform active:scale-90" />
            {/* Offer badge dot */}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C29B6B] animate-pulse" />
            {activeTab === 'offers' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C29B6B]" />
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase font-medium mt-1">
            Offer's
          </span>
        </button>

        {/* 3. Cart */}
        <button
          id="bottom-nav-cart"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all text-zinc-400 hover:text-[#C29B6B] relative group"
        >
          <div className="relative">
            <div className="w-9 h-9 -mt-3.5 rounded-full bg-[#C29B6B] text-black flex items-center justify-center shadow-lg shadow-[#C29B6B]/25 group-active:scale-95 transition-transform">
              <ShoppingBag className="w-4 h-4 stroke-[2.4]" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-4 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#0A0B0E]">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase font-medium mt-0.5 text-zinc-300 group-hover:text-[#C29B6B]">
            Cart
          </span>
        </button>

        {/* 4. Contact */}
        <button
          id="bottom-nav-contact"
          onClick={() => onSelectTab('contact')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
            activeTab === 'contact'
              ? 'text-[#C29B6B]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <MapPin className="w-5 h-5 transition-transform active:scale-90" />
            {activeTab === 'contact' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C29B6B]" />
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase font-medium mt-1">
            Contact
          </span>
        </button>
      </div>
    </nav>
  );
};
