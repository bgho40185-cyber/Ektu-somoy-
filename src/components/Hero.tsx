import React from 'react';
import { ArrowDown, Sparkles, Zap, Coffee } from 'lucide-react';
import { isCafeOpen } from '../utils/cafeHelpers';
import cafeInteriorImage from '../assets/images/cafe_interior_seating_1788540473948.jpg';

interface HeroProps {
  onExploreMenu: () => void;
  onOpenBookTable: () => void;
  onGoToContact?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu, onOpenBookTable, onGoToContact }) => {
  const status = isCafeOpen();

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 lg:py-20 border-b border-white/5">
      {/* Ambient background glows */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#C29B6B]/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Story & Direct CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            {/* Status chip */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/10 text-[10px] sm:text-xs font-medium text-[#C29B6B] tracking-wide">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C29B6B]" />
              <span className="uppercase tracking-wider sm:tracking-widest text-[9px] sm:text-[10px]">Artisanal Roastery & Bistro</span>
              <span className="text-zinc-700">•</span>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider border ${status.isOpen ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-700'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {status.isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>

            {/* Interior Seating Hero Image with Transparent CTA Buttons */}
            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src={cafeInteriorImage}
                alt="Ektu Shomoy Cafe Interior Seating"
                className="w-full h-64 sm:h-80 md:h-96 lg:h-80 object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E]/85 via-[#0A0B0E]/20 to-transparent" />
              
              {/* Transparent Buttons placed directly on the image */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 flex items-center justify-start gap-2.5 sm:gap-3 z-10">
                <button
                  id="hero-order-now-btn"
                  onClick={onExploreMenu}
                  className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-transparent hover:bg-white/15 text-white font-medium uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-2 border border-white/60 hover:border-white transition-all transform active:scale-95 shadow-md backdrop-blur-xs cursor-pointer"
                >
                  <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  <span>Order Menu</span>
                  <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  onClick={onOpenBookTable}
                  className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-transparent hover:bg-white/15 text-white font-medium uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-1.5 sm:gap-2 border border-white/60 hover:border-white transition-all transform active:scale-95 shadow-md backdrop-blur-xs cursor-pointer"
                >
                  <span>Reserve Table</span>
                </button>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#E5E7EB] leading-[1.2]">
                Pause. Sip. Savor. <br />
                <span className="italic font-normal text-[#C29B6B]">Ektu Shomoy</span> Cafe.
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-light leading-relaxed">
                Translated as <em>"A Little Time"</em>, our cafe is conceived as an architectural pause in your day. Experience micro-lot specialty roasts, artisan sourdough bites, and quiet conversations in an elevated sanctuary.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Showcase (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image Frame */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0E1015] aspect-[4/5] sm:aspect-[4/4.5]">
                <img
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85"
                  alt="Ektu Shomoy Cafe Ambiance"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-transparent to-transparent opacity-80" />

                {/* Overlaid highlight caption */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl backdrop-blur-md bg-[#0A0B0E]/85 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#C29B6B] font-semibold tracking-widest uppercase">
                        Atmosphere & Tone
                      </p>
                      <h2 className="text-base sm:text-lg font-light tracking-wide text-[#E5E7EB]">
                        Warm tones & fresh roast aroma
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Open until</span>
                      <p className="text-sm font-mono text-[#C29B6B]">11:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute -top-4 -left-4 sm:-left-6 p-3.5 rounded-2xl bg-[#0E1015]/95 backdrop-blur-md border border-white/10 shadow-xl max-w-[210px] hidden sm:block">
                <div className="flex items-center gap-1 text-[#C29B6B] text-xs mb-1">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span className="text-white font-mono font-bold ml-1">4.9</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  "A truly contemplative cafe. The Spanish Cortado & Tiramisu are extraordinary."
                </p>
              </div>

              {/* Floating Quick Order Pill */}
              <div className="absolute -bottom-4 -right-4 sm:-right-6 p-3.5 rounded-2xl bg-[#0E1015]/95 backdrop-blur-md border border-[#C29B6B]/30 shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#C29B6B] text-black flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Digital Service</div>
                  <div className="text-xs font-medium text-[#E5E7EB]">Instant UPI / Card Bill</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
