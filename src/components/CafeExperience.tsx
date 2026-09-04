import React from 'react';
import { Coffee, Flame, HeartHandshake, Award } from 'lucide-react';
import { CAFE_INFO } from '../data/menuData';

export const CafeExperience: React.FC = () => {
  return (
    <section id="highlights-section" className="py-10 sm:py-16 lg:py-20 border-t border-white/5 bg-[#0A0B0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Story Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center mb-8 sm:mb-16">
          <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-zinc-900/60 border border-white/10 text-[10px] sm:text-xs font-semibold text-[#C29B6B] uppercase tracking-wider sm:tracking-widest">
              <span>Our Philosophy</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#E5E7EB] tracking-tight leading-snug">
              Why We Call It <br />
              <span className="text-[#C29B6B] italic font-normal">"Ektu Shomoy"</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
              In an accelerating world of hurried routines and fleeting notifications, <strong>Ektu Shomoy</strong> is an invitation to slow down. Translated to <em>"A Little Time"</em>, our space was founded to restore the lost art of mindful conversation over freshly pulled espresso, artisan sourdough, and slow acoustic melodies.
            </p>

            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light">
              Whether you come with your journal, a good book, a laptop, or your favorite person, our doors stay open from <strong>{CAFE_INFO.openingHours}</strong> to give you that much-needed pause in your day.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-white/5">
              <div>
                <span className="font-mono text-xl sm:text-2xl font-light text-[#E5E7EB]">100%</span>
                <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider sm:tracking-widest font-semibold">Specialty Arabica</p>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-light text-[#E5E7EB]">18 Hrs</span>
                <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider sm:tracking-widest font-semibold">Cold Drip Steep</p>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-light text-[#C29B6B]">13 Hrs</span>
                <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider sm:tracking-widest font-semibold">Open (10AM-11PM)</p>
              </div>
            </div>
          </div>

          {/* Photo Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 aspect-[4/5] bg-[#0E1015]">
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80"
                  alt="Espresso Extraction"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-white/5">
                <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-[#C29B6B] mb-1 sm:mb-1.5" />
                <h3 className="text-[11px] sm:text-xs font-semibold text-[#E5E7EB] uppercase tracking-wide">Micro-Lot Roast</h3>
                <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-light">Small batches roasted weekly to ensure peak aromatic freshness.</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-white/5">
                <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mb-1 sm:mb-1.5" />
                <h3 className="text-[11px] sm:text-xs font-semibold text-[#E5E7EB] uppercase tracking-wide">Direct Trade</h3>
                <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-light">Supporting regenerative coffee farmers across single estate hills.</p>
              </div>
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 aspect-[4/5] bg-[#0E1015]">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
                  alt="Cafe Seating Interior"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
