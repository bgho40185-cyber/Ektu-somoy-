import React from 'react';
import { Coffee, Clock, MapPin, ExternalLink, Heart, ArrowUp } from 'lucide-react';
import { CAFE_INFO } from '../data/menuData';
import { NavTab } from './BottomNav';

interface FooterProps {
  onOpenBookTable: () => void;
  onSelectTab?: (tab: NavTab) => void;
  onOpenOrders?: () => void;
  ordersCount?: number;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#07080A] border-t border-white/5 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-white/5">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C29B6B] flex items-center justify-center text-black">
                <Coffee className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-xl font-light tracking-[0.2em] text-[#C29B6B] uppercase">
                {CAFE_INFO.name}
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed font-light">
              {CAFE_INFO.tagline}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">
              "A Little Time for Coffee & Conversations"
            </p>
          </div>

          {/* Col 2: Operating Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-widest text-[#E5E7EB] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C29B6B]" />
              <span>Opening Hours</span>
            </h4>
            <div className="space-y-1.5 text-zinc-400 font-light">
              <p className="text-[#E5E7EB] font-mono">{CAFE_INFO.openingHours}</p>
              <p>{CAFE_INFO.days}</p>
              <p className="text-[11px] text-zinc-500">Breakfast • Lunch • Evening High Tea • Late Dinner</p>
            </div>
          </div>

          {/* Col 3: Location Link & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-widest text-[#E5E7EB] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C29B6B]" />
              <span>Cafe Location</span>
            </h4>
            <div className="space-y-2 text-zinc-400 font-light">
              <p className="leading-snug">{CAFE_INFO.address}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectTab && onSelectTab('contact')}
                  className="text-[#C29B6B] hover:underline font-medium text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  View Contact & Map
                </button>
                <span className="text-zinc-600">•</span>
                <a
                  href={CAFE_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-[11px] uppercase tracking-wider"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} {CAFE_INFO.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-[#C29B6B] fill-current" /> for coffee lovers
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 transition-colors"
              title="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
