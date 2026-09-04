import React from 'react';
import {
  Clock,
  MapPin,
  ExternalLink,
  Wifi,
  Car,
  Dog,
  PlugZap,
  BookOpen,
  Music,
  Navigation,
  PhoneCall,
  Mail,
} from 'lucide-react';
import { CAFE_INFO } from '../data/menuData';
import { isCafeOpen } from '../utils/cafeHelpers';

export const LocationSection: React.FC = () => {
  const status = isCafeOpen();

  const amenities = [
    { icon: Wifi, title: 'High-Speed WiFi', desc: 'Free gigabit fiber for digital nomads & meetings' },
    { icon: PlugZap, title: 'Power Outlets', desc: 'Convenient AC charging plugs at every seating booth' },
    { icon: Dog, title: 'Pet Friendly', desc: 'Friendly pups & pets warmly welcomed in the garden patio' },
    { icon: Car, title: 'Dedicated Parking', desc: 'Ample two-wheeler & car parking on premise' },
    { icon: BookOpen, title: 'Reading Nook', desc: 'Curated library of books, art journals & board games' },
    { icon: Music, title: 'Lo-Fi Jazz Ambiance', desc: 'Acoustic background tunes tailored for conversations' },
  ];

  return (
    <section id="location-section" className="py-10 sm:py-16 lg:py-20 bg-[#0A0B0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-zinc-900/60 border border-white/10 text-[10px] sm:text-xs font-semibold text-[#C29B6B] uppercase tracking-wider sm:tracking-widest">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C29B6B]" />
            <span>Visit Our Sanctuary</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#E5E7EB] tracking-tight">
            Hours & Location
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
            Step in for a morning cortado, work undisturbed throughout the day, or wind down with friends into the late evening.
          </p>
        </div>

        {/* 2-Column Grid: Hours & Details on Left, Interactive Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Timings & Address Details */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            {/* Opening Hours Spotlight Card */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/40 border border-white/5 space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#C29B6B]/15 text-[#C29B6B] flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-[#E5E7EB]">
                      Operating Timings
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-500 font-mono">Open 7 Days a Week</p>
                  </div>
                </div>

                <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-medium uppercase tracking-wider border flex items-center gap-1.5 ${status.isOpen ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-700'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span>{status.message}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-3 sm:pt-4">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-400">Monday – Sunday</span>
                  <span className="font-mono font-medium text-[#C29B6B]">{CAFE_INFO.openingHours}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 font-mono">
                  <span>Kitchen Last Order</span>
                  <span>10:30 PM</span>
                </div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 font-mono">
                  <span>Coffee Bar Last Order</span>
                  <span>10:45 PM</span>
                </div>
              </div>
            </div>

            {/* Address & Quick Contacts Card */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/40 border border-white/5 space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2.5 sm:gap-3.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#C29B6B]/15 text-[#C29B6B] flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-[#E5E7EB]">
                    {CAFE_INFO.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-0.5 sm:mt-1 font-light">
                    {CAFE_INFO.address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <a
                  href={`tel:${CAFE_INFO.phone.replace(/\s+/g, '')}`}
                  className="p-2.5 sm:p-3 rounded-xl bg-[#0E1015] border border-white/5 hover:border-[#C29B6B]/40 text-xs text-zinc-400 hover:text-white flex items-center gap-2 transition-colors font-mono"
                >
                  <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C29B6B]" />
                  <span>{CAFE_INFO.phone}</span>
                </a>

                <a
                  href={`mailto:${CAFE_INFO.email}`}
                  className="p-2.5 sm:p-3 rounded-xl bg-[#0E1015] border border-white/5 hover:border-[#C29B6B]/40 text-xs text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C29B6B]" />
                  <span className="truncate">{CAFE_INFO.email}</span>
                </a>
              </div>

              {/* Direct Maps CTA button */}
              <div className="pt-1 sm:pt-2">
                <a
                  href={CAFE_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 sm:py-3.5 px-4 sm:px-5 rounded-xl bg-[#C29B6B] hover:bg-[#B18A5A] text-black font-bold uppercase tracking-wider text-[11px] sm:text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#C29B6B]/10 transition-all active:scale-[0.99]"
                >
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Open Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Map Card & Amenities */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            {/* Map Preview Card linking directly to Google Maps */}
            <a
              href={CAFE_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative rounded-3xl overflow-hidden border border-white/10 bg-[#0E1015] aspect-[16/10] shadow-xl"
            >
              {/* Stylized dark map graphic */}
              <div className="absolute inset-0 bg-[#0E1015] flex items-center justify-center overflow-hidden">
                {/* SVG stylistic map grid */}
                <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mapGrid)" />
                  <path d="M 0 100 Q 150 140 300 100 T 600 150" fill="none" stroke="#C29B6B" strokeWidth="2" opacity="0.4" />
                  <path d="M 120 0 L 140 400" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
                  <path d="M 380 0 L 360 400" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
                </svg>

                {/* Pulsing center marker */}
                <div className="relative z-10 flex flex-col items-center group-hover:scale-110 transition-transform duration-300">
                  <div className="relative flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-[#C29B6B]/25 animate-ping absolute" />
                    <div className="w-11 h-11 rounded-2xl bg-[#C29B6B] border border-white/20 text-black flex items-center justify-center shadow-2xl">
                      <MapPin className="w-5 h-5 stroke-[2.4]" />
                    </div>
                  </div>
                  <div className="mt-3 px-3 py-1.5 rounded-full bg-[#0A0B0E]/90 backdrop-blur-md border border-white/10 text-xs font-mono font-medium text-[#E5E7EB] flex items-center gap-1.5 shadow-lg">
                    <span>Ektu Shomoy Cafe</span>
                    <ExternalLink className="w-3 h-3 text-[#C29B6B]" />
                  </div>
                </div>
              </div>

              {/* Bottom hint banner */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl backdrop-blur-md bg-[#0A0B0E]/85 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Click anywhere on map to view on Google Maps</span>
                <span className="text-[#C29B6B] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider text-[11px]">
                  Directions →
                </span>
              </div>
            </a>

            {/* Cafe Amenities Grid */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/40 border border-white/5 space-y-3 sm:space-y-4">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-[#C29B6B]">
                Guest Amenities
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {amenities.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#0E1015] border border-white/5 space-y-1 sm:space-y-1.5">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C29B6B]" />
                      <div className="text-[11px] sm:text-xs font-medium text-[#E5E7EB]">{item.title}</div>
                      <p className="text-[9px] sm:text-[10px] text-zinc-500 leading-tight font-light">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
