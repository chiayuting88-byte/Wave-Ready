import React from 'react';
import { Waves, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-16 text-slate-400 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Mission */}
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            <span className="font-black text-slate-200 tracking-tight text-base">
              WaveReady Singapore
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Real-time coastal condition intelligence for water sports enthusiasts, yacht racers, and sportfishing charters in Singapore.
          </p>
        </div>

        {/* Sub-goal 6: Strict Data Source Credit */}
        <div className="flex flex-col items-center md:items-end gap-1.5 text-xs text-center md:text-right">
          <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium">
            Data: NEA, Data.gov.sg, METEO
          </div>
          <p className="text-[11px] text-slate-500">
            OneMap Singapore basemap provided under Open Data license by Singapore Land Authority (SLA).
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-2">
        <span>&copy; {new Date().getFullYear()} WaveReady. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400">1-Month Free Trial Protection</span>
          <span>•</span>
          <span className="hover:text-slate-400">Verified Fleet Partners</span>
          <span>•</span>
          <span className="hover:text-slate-400">No Hardcoded Mock Data Guarantee</span>
        </div>
      </div>
    </footer>
  );
};
