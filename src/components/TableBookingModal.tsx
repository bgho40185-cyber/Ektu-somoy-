import React, { useState } from 'react';
import { X, Calendar, Clock, Users, CheckCircle2, MapPin } from 'lucide-react';
import { CAFE_INFO } from '../data/menuData';
import { saveReservationToFirestore } from '../firebase';

interface TableBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableBookingModal: React.FC<TableBookingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('04:00 PM');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const timeSlots = [
    '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM',
    '03:00 PM', '04:00 PM', '05:30 PM', '07:00 PM',
    '08:30 PM', '09:30 PM',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `TB-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingId(id);
    setIsBooked(true);

    // Save to Firestore in background
    saveReservationToFirestore({
      bookingId: id,
      name,
      phone,
      date,
      timeSlot,
      guests,
      seatingArea: 'Standard',
      notes,
      status: 'confirmed',
    }).catch((err) => {
      console.warn('Could not sync reservation to Firestore:', err);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0E1015] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-4 sm:my-6 text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0B0E]">
          <div>
            <h2 className="text-base sm:text-lg font-light text-[#E5E7EB]">
              Reserve Your Table
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 font-light">
              Available daily from {CAFE_INFO.openingHours}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isBooked ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-light text-[#E5E7EB]">
                Reservation Confirmed!
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                We have saved a lovely table for you at <strong className="text-zinc-200">{CAFE_INFO.name}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0B0E] border border-white/5 text-xs text-left space-y-2 max-w-sm mx-auto font-light">
              <div className="flex justify-between">
                <span className="text-zinc-500">Booking ID</span>
                <span className="font-mono font-medium text-[#C29B6B]">#{bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Guest</span>
                <span className="text-[#E5E7EB]">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & Time</span>
                <span className="text-[#E5E7EB] font-mono">{date} at {timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Guests</span>
                <span className="text-[#E5E7EB]">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#C29B6B] hover:bg-[#B18A5A] text-black font-bold uppercase tracking-wider text-xs transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[calc(85vh-100px)] overflow-y-auto text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Das"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A0B0E] border border-white/10 text-[#E5E7EB] placeholder-zinc-600 focus:outline-none focus:border-[#C29B6B] text-xs font-light"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A0B0E] border border-white/10 text-[#E5E7EB] placeholder-zinc-600 focus:outline-none focus:border-[#C29B6B] text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A0B0E] border border-white/10 text-[#E5E7EB] focus:outline-none focus:border-[#C29B6B] text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">Number of Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A0B0E] border border-white/10 text-[#E5E7EB] focus:outline-none focus:border-[#C29B6B] text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Select Time Slot</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-1.5 px-1.5 rounded-lg border text-center text-[10px] sm:text-[11px] font-mono transition-all ${
                      timeSlot === slot
                        ? 'bg-[#C29B6B] text-black font-semibold border-[#C29B6B]'
                        : 'bg-[#0A0B0E] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Special Occasion / Notes</label>
              <input
                type="text"
                placeholder="e.g. Quiet corner, anniversary, high chair..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0B0E] border border-white/10 text-[#E5E7EB] placeholder-zinc-600 focus:outline-none focus:border-[#C29B6B] text-xs font-light"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#C29B6B] hover:bg-[#B18A5A] text-black font-bold uppercase tracking-wider text-xs transition-all shadow-md shadow-[#C29B6B]/20"
            >
              Confirm Table Reservation
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
