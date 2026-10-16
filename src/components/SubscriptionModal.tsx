import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  Zap, 
  Sparkles, 
  X, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Umbrella, 
  Clock 
} from 'lucide-react';
import { UserSubscription } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onUpdateSubscription: (sub: UserSubscription) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  const handleActivate = (plan: 'monthly' | 'annual') => {
    onUpdateSubscription({
      status: plan === 'monthly' ? 'active_monthly' : 'active_annual',
      trialDaysLeft: 0,
      planName: plan === 'monthly' ? 'WaveReady Pro Monthly' : 'WaveReady Pro Annual VIP',
      expiryDate: plan === 'monthly' ? '2026-11-16' : '2027-10-16',
      hasCharterAssurance: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Charter Peace of Mind Protection</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            Never Lose a S$1,500 Charter Booking to Bad Sea Conditions
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            High-end fishing charters and boat rentals are expensive. WaveReady aggregates real-time NEA tides, Data.gov.sg wind, and heat stress so you know before you cast off.
          </p>
        </div>

        {/* Current User Status Banner */}
        <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border border-cyan-800/50 p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 block">
                {subscription.status === 'free_trial' ? '1-Month Free Trial Active' : subscription.planName}
              </span>
              <span className="text-[11px] text-cyan-300">
                {subscription.status === 'free_trial'
                  ? `${subscription.trialDaysLeft} days remaining of full Pro telemetry`
                  : `Active until ${subscription.expiryDate}`}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
            Full Access
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-semibold text-slate-400 mb-1">Monthly Plan</div>
            <div className="text-2xl font-black text-slate-100">
              $10<span className="text-xs font-normal text-slate-400"> / month</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Flexible month-to-month water sports intelligence. Cancel anytime.
            </p>
          </div>

          {/* Annual Plan (Best Value) */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`p-4 rounded-xl border cursor-pointer relative transition-all ${
              selectedPlan === 'annual'
                ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wide">
              Save $20/yr
            </span>
            <div className="text-xs font-semibold text-cyan-400 mb-1">Annual VIP Pass</div>
            <div className="text-2xl font-black text-slate-100">
              $100<span className="text-xs font-normal text-slate-400"> / year</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Includes full year of automated coastal tide alerts & charter insurance partner credits.
            </p>
          </div>
        </div>

        {/* Feature Checklist */}
        <div className="space-y-2 mb-6 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>High-frequency live NEA tide levels & rising/falling tidal vectors</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>OneMap Singapore high-resolution coastal basemap integration</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Real-time Data.gov.sg wind speed & direction across 12 coastal marine buoys</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Partner booking protection: 100% weather reschedule with 34 verified suppliers</span>
          </div>
        </div>

        {/* Performance Metrics: Context Proof */}
        <div className="mb-6 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-around text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Subscribers</span>
            <span className="text-base font-extrabold text-slate-100 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              4,280
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Monthly Revenue</span>
            <span className="text-base font-extrabold text-emerald-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              $42,800 MRR
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleActivate(selectedPlan)}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          <span>
            {subscription.status === 'free_trial'
              ? `Extend with ${selectedPlan === 'annual' ? '$100 Annual VIP' : '$10/Month'}`
              : `Switch to ${selectedPlan === 'annual' ? 'Annual Pass ($100/yr)' : 'Monthly ($10/mo)'}`}
          </span>
        </button>
      </div>
    </div>
  );
};
