import React from 'react';
import { 
  Waves, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Users, 
  Sparkles,
  Compass,
  Menu,
  X
} from 'lucide-react';
import { UserSubscription } from '../types';

interface HeaderProps {
  subscription: UserSubscription;
  onOpenSubscriptionModal: () => void;
  onRequestLocation: () => void;
  isLocating: boolean;
  hasLocation: boolean;
  activeTab: 'map' | 'partners' | 'sensors';
  setActiveTab: (tab: 'map' | 'partners' | 'sensors') => void;
}

export const Header: React.FC<HeaderProps> = ({
  subscription,
  onOpenSubscriptionModal,
  onRequestLocation,
  isLocating,
  hasLocation,
  activeTab,
  setActiveTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950">
            <Waves className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-100 flex items-center gap-1">
                WaveReady<span className="text-cyan-400">.</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-cyan-950 text-cyan-300 border border-cyan-800">
                Singapore
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Water Sports & Fishing Charter Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            OneMap Coastal & Beaches
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'partners'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Charter & Rental Partners</span>
          </button>
          <button
            onClick={() => setActiveTab('sensors')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'sensors'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Live NEA Telemetry
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Nearest Beach / GPS Button */}
          <button
            onClick={onRequestLocation}
            disabled={isLocating}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              hasLocation
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
            title="Sort beaches nearest to your current location"
          >
            <Navigation className={`w-3.5 h-3.5 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isLocating ? 'Locating...' : hasLocation ? 'Nearest Beach Active' : 'Find Nearest Beach'}
            </span>
            <span className="sm:hidden text-[11px]">
              {hasLocation ? 'Near Me' : 'Locate'}
            </span>
          </button>

          {/* Subscription Badge */}
          <button
            onClick={onOpenSubscriptionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {subscription.status === 'free_trial'
                ? `1-Mo Trial (${subscription.trialDaysLeft}d)`
                : 'Pro Pass'}
            </span>
            <span className="sm:hidden text-[11px]">Trial</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
          <button
            onClick={() => {
              setActiveTab('map');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'map' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-200'
            }`}
          >
            OneMap Coastal & Beaches
          </button>
          <button
            onClick={() => {
              setActiveTab('partners');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'partners' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-200'
            }`}
          >
            Charter & Rental Partners (Boat & Water Gear)
          </button>
          <button
            onClick={() => {
              setActiveTab('sensors');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'sensors' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-200'
            }`}
          >
            Live NEA Coastal Feeds (Tides, UV, Heat-Stress)
          </button>
        </div>
      )}
    </header>
  );
};
