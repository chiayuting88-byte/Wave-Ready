import React from 'react';
import { 
  Navigation2, 
  Wind, 
  Waves, 
  Anchor, 
  Ship, 
  Fish, 
  Sparkles, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { CoastalSpot, SpotSuitability, PartnerVendor, WaterActivity } from '../types';

interface SpotCardProps {
  spot: CoastalSpot;
  suitability: SpotSuitability;
  isSelected: boolean;
  distanceKm?: number;
  onSelect: () => void;
  partners: PartnerVendor[];
  onViewPartners: (spot: CoastalSpot) => void;
  onBookPartner?: (partner: PartnerVendor) => void;
}

const ACTIVITY_LABELS: Record<WaterActivity, { label: string; icon: any }> = {
  fishing_charter: { label: 'Fishing Charter', icon: Fish },
  jetski: { label: 'JetSki & Moto', icon: Sparkles },
  yacht: { label: 'Yacht & Sail', icon: Ship },
  kayak_sup: { label: 'Kayak & SUP', icon: Waves },
  wakeboard: { label: 'Wakeboarding', icon: Anchor },
};

export const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  suitability,
  isSelected,
  distanceKm,
  onSelect,
  partners,
  onViewPartners,
}) => {
  const level = suitability?.level ?? 'moderate';
  const score = suitability?.score ?? 75;
  const wind = suitability?.matchedWind;
  const spotPartners = partners.filter(p => p.spotId === spot.id);

  let badgeBg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  let badgeDot = 'bg-emerald-400 shadow-[0_0_8px_#34d399]';
  if (level === 'caution') {
    badgeBg = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    badgeDot = 'bg-amber-400 shadow-[0_0_8px_#fbbf24]';
  } else if (level === 'unfavorable') {
    badgeBg = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    badgeDot = 'bg-rose-400 shadow-[0_0_8px_#fb7185]';
  }

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/20 shadow-xl shadow-cyan-950/40'
          : 'bg-slate-950/70 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Nearest Badge & Area */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-semibold bg-slate-800 text-slate-300">
            {spot.area}
          </span>
          {distanceKm !== undefined && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
              distanceKm < 8 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50' : 'bg-slate-800 text-slate-400'
            }`}>
              <Navigation2 className="w-2.5 h-2.5" />
              {distanceKm} km away {distanceKm < 8 && '(Nearest)'}
            </span>
          )}
        </div>

        {/* Suitability score pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeBg}`}>
          <span className={`w-2 h-2 rounded-full ${badgeDot}`}></span>
          <span className="capitalize">{level} ({score}%)</span>
        </div>
      </div>

      {/* Spot Title & Chinese subtext */}
      <div className="mb-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-cyan-300 flex items-center justify-between">
          <span>{spot.name}</span>
          <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : ''}`} />
        </h3>
        {spot.chineseName && (
          <span className="text-xs text-slate-500 font-sans">{spot.chineseName}</span>
        )}
      </div>

      {/* Headline suitability description */}
      <p className="text-xs text-slate-300 mb-3 line-clamp-2 leading-relaxed">
        {suitability?.headline || spot.description}
      </p>

      {/* Live Conditions Mini-Strip */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs mb-3">
        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block">Nearby Wind</span>
            <span className="font-semibold text-slate-200">
              {wind ? `${wind.speedKnots} kts (${wind.stationName.split(' ')[0]})` : 'Live sensor...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Waves className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block">Tide Dynamic</span>
            <span className="font-semibold text-slate-200 capitalize">
              {spot.tideSensitivity} Sensitivity
            </span>
          </div>
        </div>
      </div>

      {/* Activity Suitability Pills */}
      <div className="space-y-1.5 mb-3">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
          Activity Suitability
        </span>
        <div className="flex flex-wrap gap-1.5">
          {spot.popularActivities.map((act) => {
            const actInfo = ACTIVITY_LABELS[act];
            const actSuit = suitability?.activitySuitability?.[act];
            const Icon = actInfo?.icon || Sparkles;

            const isGood = actSuit?.status === 'optimal' || actSuit?.status === 'good';
            return (
              <span
                key={act}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                  isGood
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                    : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                }`}
                title={actSuit?.reason}
              >
                <Icon className="w-3 h-3" />
                <span>{actInfo?.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Sub-goal 5: Verified Partners strip & action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>
            <strong className="text-cyan-300">{spotPartners.length}</strong> rental & charter partners
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewPartners(spot);
          }}
          className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-cyan-200 font-semibold rounded-lg border border-cyan-800/60 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
        >
          <span>View Fleets</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
