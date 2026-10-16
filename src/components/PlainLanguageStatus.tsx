import React from 'react';
import { AlertTriangle, WifiOff, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { ApiResponse } from '../services/api';

interface PlainLanguageStatusProps {
  tidesStatus: ApiResponse<any>;
  uvStatus: ApiResponse<any>;
  heatStressStatus: ApiResponse<any>;
  windDirStatus: ApiResponse<any>;
  windSpeedStatus: ApiResponse<any>;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const PlainLanguageStatus: React.FC<PlainLanguageStatusProps> = ({
  tidesStatus,
  uvStatus,
  heatStressStatus,
  windDirStatus,
  windSpeedStatus,
  onRefresh,
  isRefreshing,
}) => {
  // Collect any non-ok feeds
  const feeds = [
    { name: 'NEA Coastal Tides (/api/tides)', status: tidesStatus },
    { name: 'NEA Coastal UV Index (/api/uv)', status: uvStatus },
    { name: 'NEA Heat Stress WBGT (/api/heat-stress)', status: heatStressStatus },
    { name: 'Data.gov.sg Wind Direction (/api/wind-direction)', status: windDirStatus },
    { name: 'Data.gov.sg Wind Speed (/api/wind-speed)', status: windSpeedStatus },
  ];

  const failedFeeds = feeds.filter(f => !f.status.success || f.status.isEmpty || f.status.isSlow || f.status.isRefused);
  const allHealthy = failedFeeds.length === 0;

  return (
    <div className="w-full">
      {/* Sub-goal 4: If any data is empty, slow or refused, explain in plain words */}
      {!allHealthy && (
        <div className="mb-4 p-4 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-200 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm flex-1">
              <h4 className="font-bold text-amber-100">Live Data Notification: Some Coastal Sensors Need Attention</h4>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                As required by our strict real-time standards, we never invent or show fake dummy numbers.
                When government endpoints are slow, refused, or return empty payloads, we report it plainly:
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                {failedFeeds.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 font-mono text-[11px] bg-amber-900/40 px-2 py-1 rounded">
                    {f.status.isRefused ? (
                      <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : f.status.isSlow ? (
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    )}
                    <span className="font-bold text-amber-100">{f.name}:</span>
                    <span>
                      {f.status.isRefused
                        ? 'Connection refused by upstream host.'
                        : f.status.isSlow
                        ? 'Data took over 4.5s to respond (Slow connection).'
                        : f.status.isEmpty
                        ? 'The provider returned an empty dataset.'
                        : f.status.error || 'Unavailable'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-amber-700/60 hover:bg-amber-600/80 text-amber-50 text-xs font-semibold rounded-lg border border-amber-500/50 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Retry Now
            </button>
          </div>
        </div>
      )}

      {/* Healthy status bar */}
      {allHealthy && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-200">
              Live Coastal Telemetry Active
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">
              NEA Tides, UV & Heat-Stress + Data.gov.sg Wind synced
            </span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      )}
    </div>
  );
};
