import React from 'react';
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  ExternalLink,
  Calendar,
  MessageSquare,
  Wifi,
  PlugZap,
  Dog,
  Car,
  BookOpen,
  Music,
} from 'lucide-react';
import { CAFE_INFO } from '../data/menuData';
import { useCafeStatus } from '../context/CafeStatusContext';

interface ContactPageProps {
  onOpenBookTable: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenBookTable }) => {
  const { statusInfo: status } = useCafeStatus();

  const amenities = [
    { icon: Wifi, title: 'High-Speed WiFi', desc: 'Free gigabit fiber for digital nomads & meetings' },
    { icon: PlugZap, title: 'Power Outlets', desc: 'Convenient AC charging plugs at every seating booth' },
    { icon: Dog, title: 'Pet Friendly', desc: 'Friendly pups & pets warmly welcomed in the garden patio' },
    { icon: Car, title: 'Dedicated Parking', desc: 'Ample two-wheeler & car parking on premise' },
    { icon: BookOpen, title: 'Reading Nook', desc: 'Curated library of books, art journals & board games' },
    { icon: Music, title: 'Lo-Fi Jazz Ambiance', desc: 'Acoustic background tunes tailored for conversations' },
  ];

  return (
    <div id="contact-page" className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/10 text-[10px] sm:text-xs font-semibold text-[#C29B6B] uppercase tracking-widest">
          <MapPin className="w-3.5 h-3.5 text-[#C29B6B]" />
          <span>Get in Touch & Visit</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#E5E7EB]">
          Contact & <span className="text-[#C29B6B] italic font-normal">Location</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
          Find your route to our cafe sanctuary, reach our barista team directly, or inquire about table reservations and celebrations.
        </p>
      </div>

      {/* Quick Contact Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Phone Call */}
        <a
          href={`tel:${CAFE_INFO.phone.replace(/\s+/g, '')}`}
          className="p-5 rounded-2xl bg-[#0E1015] border border-white/10 hover:border-[#C29B6B]/50 transition-all group flex flex-col justify-between gap-3 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#C29B6B]/15 text-[#C29B6B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Direct Line
            </span>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Call The Cafe
            </h3>
            <p className="text-sm font-mono font-medium text-[#E5E7EB] mt-0.5 group-hover:text-[#C29B6B] transition-colors">
              {CAFE_INFO.phone}
            </p>
          </div>
        </a>

        {/* 2. WhatsApp Inquiry */}
        <a
          href="https://wa.me/919830012345?text=Hello%20Ektu%20Shomoy%20Cafe,%20I%20would%20like%20to%20inquire%20about%20a%20table/order"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-[#0E1015] border border-white/10 hover:border-emerald-500/50 transition-all group flex flex-col justify-between gap-3 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Instant Chat
            </span>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              WhatsApp Support
            </h3>
            <p className="text-sm font-medium text-[#E5E7EB] mt-0.5 group-hover:text-emerald-400 transition-colors">
              Chat on WhatsApp
            </p>
          </div>
        </a>

        {/* 3. Email Us */}
        <a
          href={`mailto:${CAFE_INFO.email}`}
          className="p-5 rounded-2xl bg-[#0E1015] border border-white/10 hover:border-[#C29B6B]/50 transition-all group flex flex-col justify-between gap-3 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#C29B6B]/15 text-[#C29B6B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Inquiries
            </span>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Email Address
            </h3>
            <p className="text-xs font-mono font-medium text-[#E5E7EB] mt-0.5 group-hover:text-[#C29B6B] transition-colors truncate">
              {CAFE_INFO.email}
            </p>
          </div>
        </a>

        {/* 4. Table Booking */}
        <button
          onClick={onOpenBookTable}
          className="p-5 rounded-2xl bg-[#0E1015] border border-[#C29B6B]/40 hover:border-[#C29B6B] hover:bg-zinc-900/50 transition-all group flex flex-col justify-between gap-3 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#C29B6B] text-black flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4 stroke-[2.4]" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C29B6B]">
              Reserve
            </span>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Host / Dining
            </h3>
            <p className="text-sm font-medium text-[#C29B6B] mt-0.5">
              Book Table Free →
            </p>
          </div>
        </button>
      </div>

      {/* Map Navigation & Operational Details (Transferred here from Home per user instruction) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Col: Opening Hours & Location Info */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          {/* Opening Hours Spotlight Card */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0E1015] border border-white/10 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C29B6B]/15 text-[#C29B6B] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-[#E5E7EB]">
                    Operating Timings
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 font-mono">Open 7 Days a Week</p>
                </div>
              </div>

              <div
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border flex items-center gap-1.5 ${
                  status.isOpen
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{status.message}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-4">
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

          {/* Guest Amenities */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0E1015] border border-white/10 space-y-4">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C29B6B]">
              Guest Amenities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {amenities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-2.5 sm:p-3.5 rounded-xl bg-[#0A0B0E] border border-white/5 space-y-1">
                    <Icon className="w-4 h-4 text-[#C29B6B]" />
                    <div className="text-[11px] sm:text-xs font-medium text-[#E5E7EB]">{item.title}</div>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 leading-tight font-light">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Google Map + Direct Route Container */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0E1015] shadow-2xl relative">
            {/* Map Header bar */}
            <div className="p-4 bg-[#0A0B0E] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono text-zinc-300">
                  22.5186° N, 88.3541° E • Southern Avenue, Kolkata
                </span>
              </div>
              <a
                href={CAFE_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-[#C29B6B] hover:underline flex items-center gap-1"
              >
                <span>Full Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Embedded Interactive Google Map */}
            <div className="relative w-full h-[280px] sm:h-[350px]">
              <iframe
                title="Ektu Shomoy Cafe Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14742.664429956463!2d88.3512535!3d22.5165485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a027732a3928427%3A0x2dbbe6e80b2a3036!2sSouthern%20Ave%2C%20Kolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1709400000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(90%)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Floating Address Tag over Map */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#0A0B0E]/90 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#C29B6B] text-black flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-[#E5E7EB]">Ektu Shomoy Cafe</p>
                    <p className="text-[10px] text-zinc-400 truncate">Near Southern Avenue & Lake Mall</p>
                  </div>
                </div>

                <a
                  href={CAFE_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#C29B6B] hover:bg-[#B18A5A] text-black text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors"
                >
                  Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
