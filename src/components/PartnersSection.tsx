import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Anchor, 
  Fish, 
  Ship, 
  Sparkles, 
  Waves, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  X,
  AlertCircle
} from 'lucide-react';
import { PartnerVendor, CoastalSpot } from '../types';

interface PartnersSectionProps {
  partners: PartnerVendor[];
  spots: CoastalSpot[];
  selectedSpotFilter?: string | null;
  onSelectSpotFilter?: (spotId: string | null) => void;
}

export const PartnersSection: React.FC<PartnersSectionProps> = ({
  partners,
  spots,
  selectedSpotFilter,
  onSelectSpotFilter,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [bookingModalPartner, setBookingModalPartner] = useState<PartnerVendor | null>(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '2026-10-17',
    timeSlot: 'Morning (08:00 - 12:00) - Prime Tide',
    pax: '4 Pax',
    notes: 'Request twin outriggers for trolling pelagics & bimini top deployed',
  });

  const categories = [
    { id: 'all', label: 'All Fleets' },
    { id: 'fishing_charter', label: 'Fishing Charters', icon: Fish },
    { id: 'boat_charter', label: 'Boat & Wakesurf', icon: Anchor },
    { id: 'jetski_equipment', label: 'JetSki & eFoil', icon: Sparkles },
    { id: 'kayak_watersports', label: 'Kayak & Foil', icon: Waves },
    { id: 'yacht_club', label: 'Luxury Yachts', icon: Ship },
  ];

  const filtered = partners.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSpot = !selectedSpotFilter || p.spotId === selectedSpotFilter;
    return matchesCat && matchesSpot;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitted(true);
    setTimeout(() => {
      // simulate inquiry confirmation
    }, 500);
  };

  return (
    <section className="w-full space-y-6">
      {/* Partner Network Header & Context Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Marine Partner Fleet & Equipment Hire</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              WaveReady Certified Boat Charters & Water Sports Rentals
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Book offshore fishing boats, luxury sailing catamarans, and pro equipment without worrying about losing charter fees to adverse squalls or dead tides.
            </p>
          </div>

          {/* Context Metrics: Partner numbers that show it works */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Active Suppliers</span>
              <span className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1">
                <Users className="w-4 h-4" />
                34
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Supplier Revenue</span>
              <span className="text-lg font-black text-cyan-400 flex items-center justify-center gap-1">
                <DollarSign className="w-4 h-4" />
                S$86,400<span className="text-xs font-normal text-slate-400">/mo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filter by Coastal Spot */}
          {selectedSpotFilter && (
            <div className="flex items-center gap-2 text-xs bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
              <span className="text-slate-400">Filtered by:</span>
              <span className="font-semibold text-cyan-300">
                {spots.find((s) => s.id === selectedSpotFilter)?.name}
              </span>
              <button
                onClick={() => onSelectSpotFilter && onSelectSpotFilter(null)}
                className="text-slate-400 hover:text-white ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((vendor) => (
          <div
            key={vendor.id}
            className="p-5 rounded-2xl bg-slate-900/85 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 shadow-lg flex flex-col justify-between transition-all"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {vendor.categoryLabel}
                </span>
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                  ★ {vendor.rating} <span className="text-slate-500 font-normal">({vendor.reviewCount})</span>
                </span>
              </div>

              {/* Title & Marina */}
              <h3 className="text-base font-bold text-slate-100 mb-1">
                {vendor.name}
              </h3>
              <p className="text-xs text-slate-400 mb-3 flex items-center gap-1 truncate">
                <Anchor className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{vendor.marina}</span>
              </p>

              {/* Fleet & Specs */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Available Fleet & Equipment
                </span>
                <ul className="space-y-1 text-slate-300">
                  {vendor.fleet.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tide Condition Recommendation */}
              <div className="text-[11px] text-slate-300 p-2 rounded-lg bg-cyan-950/30 border border-cyan-800/40 mb-3">
                <strong className="text-cyan-300">Tide Alignment:</strong> {vendor.recommendedTide}
              </div>
            </div>

            {/* Pricing & Booking Action */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Rate Guide</span>
                  <span className="font-bold text-sm text-slate-100">{vendor.priceRange}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 block font-semibold">Today's Slots</span>
                  <span className="text-xs font-bold text-slate-200">
                    {vendor.todayAvailableSlots} Openings
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setBookingModalPartner(vendor);
                  setBookingSubmitted(false);
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reserve with Tide Assurance</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Inquiry Modal */}
      {bookingModalPartner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setBookingModalPartner(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSubmitted ? (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                    Direct Charter & Equipment Booking
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">{bookingModalPartner.name}</h3>
                  <p className="text-xs text-slate-400">{bookingModalPartner.marina}</p>
                </div>

                <div className="bg-cyan-950/40 border border-cyan-800/40 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>WaveReady Charter Peace-of-Mind Protection</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    If NEA winds exceed 20 kts or severe lightning warnings are issued on your charter day, 100% of your deposit is refunded or rescheduled automatically.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Captain David Tan"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Contact (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+65 9123 4567"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Time Window</label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option>Morning (08:00 - 12:00) - Prime Tide</option>
                      <option>Afternoon (13:30 - 17:30) - Wind Sport Peak</option>
                      <option>Sunset & Night (18:00 - 22:00) - Calm Cruise</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-slate-400 block mb-1 font-semibold">Special Equipment or Rig Requests</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Standard Platform Royalty</span>
                    <span className="font-semibold text-emerald-400">{bookingModalPartner.royaltyRate} (Covered by Vendor)</span>
                  </div>
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    Confirm Booking Request
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-100">Booking Request Transmitted!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  {bookingModalPartner.name} has received your charter request for {formData.date}.
                  Your WaveReady Weather Guarantee is locked in.
                </p>
                <button
                  onClick={() => setBookingModalPartner(null)}
                  className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
