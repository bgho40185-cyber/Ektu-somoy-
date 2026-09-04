import React, { useRef } from 'react';
import { Coffee, Tag, MapPin, Home } from 'lucide-react';
import { CAFE_INFO } from '../data/menuData';
import { NavTab } from './BottomNav';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenBookTable?: () => void;
  onOpenOrders?: () => void;
  ordersCount?: number;
  onOpenAdminLogin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenBookTable,
  onOpenOrders,
  ordersCount = 0,
  onOpenAdminLogin,
  isAdminLoggedIn = false,
}) => {
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCafeBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 4) {
      clickCountRef.current = 0;
      if (onOpenAdminLogin) {
        onOpenAdminLogin();
      }
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2500);
    }
  };

  const handleGoHomeAndScroll = (id?: string) => {
    onSelectTab('home');
    if (id) {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0A0B0E]/90 border-b border-white/10 transition-all duration-300">
      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 sm:py-4 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer"
          onClick={() => handleGoHomeAndScroll()}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C29B6B] flex items-center justify-center shadow-lg shadow-[#C29B6B]/10 text-black">
            <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-base sm:text-2xl font-light tracking-[0.12em] sm:tracking-[0.2em] text-[#C29B6B] uppercase">
                {CAFE_INFO.name}
              </span>
              <span
                id="admin-secret-cafe-badge"
                onClick={handleCafeBadgeClick}
                className="text-[8px] sm:text-[9px] tracking-widest uppercase font-semibold text-[#C29B6B] bg-[#C29B6B]/10 px-1.5 py-0.5 rounded border border-[#C29B6B]/20 cursor-pointer select-none active:scale-90 hover:bg-[#C29B6B]/20 transition-all"
                title="Ektu Shomoy Cafe"
              >
                Cafe
              </span>
            </div>
            <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-medium hidden sm:block">
              A Little Time • Modern Artisan Cafe
            </p>
          </div>
        </div>

        {/* Center navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs tracking-widest uppercase font-medium text-zinc-400">
          <button
            onClick={() => handleGoHomeAndScroll()}
            className={`transition-colors flex items-center gap-1.5 ${
              activeTab === 'home' ? 'text-[#C29B6B]' : 'hover:text-[#C29B6B]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => handleGoHomeAndScroll('menu-section')}
            className="hover:text-[#C29B6B] transition-colors"
          >
            Artisan Menu
          </button>
          <button
            onClick={() => onSelectTab('offers')}
            className={`transition-colors flex items-center gap-1.5 ${
              activeTab === 'offers' ? 'text-[#C29B6B]' : 'hover:text-[#C29B6B]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Offer's</span>
          </button>
          <button
            onClick={() => onSelectTab('contact')}
            className={`transition-colors flex items-center gap-1.5 ${
              activeTab === 'contact' ? 'text-[#C29B6B]' : 'hover:text-[#C29B6B]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Contact & Map</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
