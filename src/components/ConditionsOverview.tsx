import React from 'react';
import { Waves, Sun, Flame, Wind, Compass, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { TideData, UVData, HeatStressData, WindStation } from '../types';
import { ApiResponse } from '../services/api';
import { analyzeCurrentTide, degreesToCompass } from '../services/suitability';

interface ConditionsOverviewProps {
  tidesResponse: ApiResponse<TideData>;
  uvResponse: ApiResponse<UVData>;
  heatStressResponse: ApiResponse<HeatStressData>;
  windStations: WindStation[];
  windDirResponse: ApiResponse<any>;
  windSpeedResponse: ApiResponse<any>;
}

export const ConditionsOverview: React.FC<ConditionsOverviewProps> = ({
  tidesResponse,
  uvResponse,
  heatStressResponse,
  windStations,
  windDirResponse,
  windSpeedResponse,
}) => {
  const tideInfo = analyzeCurrentTide(tidesResponse.data);

  // Calculate average or representative coastal wind
  const validSpeedStations = windStations.filter(s => s.speedKnots !== undefined);
  const avgSpeed = validSpeedStations.length
    ? Math.round((validSpeedStations.reduce((acc, s) => acc + (s.speedKnots || 0), 0) / validSpeedStations.length) * 10) / 10
    : null;

  const validDirStations = windStations.filter(s => s.directionDeg !== undefined);
  const avgDir = validDirStations.length
    ? Math.round(validDirStations.reduce((acc, s) => acc + (s.directionDeg || 0), 0) / validDirStations.length)
    : null;

  const compassDir = avgDir !== null ? degreesToCompass(avgDir) : '--';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
      {/* 1. Tides Card (from /api/tides) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Live Coastal Tide</span>
              <span className="text-xs font-mono text-cyan-400">NEA Singapore</span>
            </div>
          </div>
          {tideInfo.nextTide && (
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${tideInfo.nextTide.tide_type === 'high' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
              {tideInfo.nextTide.tide_type === 'high' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {tideInfo.nextTide.tide_type.toUpperCase()}
            </span>
          )}
        </div>

        <div className="my-2.5">
          {!tidesResponse.success ? (
            <div className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-800/40">
              {tidesResponse.error || 'Tidal data was refused or empty from NEA'}
            </div>
          ) : (
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-100 flex items-baseline gap-1">
                {tideInfo.nextTide?.height_metres ? `${tideInfo.nextTide.height_metres}m` : 'Reading...'}
                <span className="text-xs font-normal text-slate-400">
                  {tideInfo.stage}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {tideInfo.summary}
              </p>
            </div>
          )}
        </div>

        {/* Tide schedule timeline snippet */}
        {tidesResponse.data?.today && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            {tidesResponse.data.today.slice(0, 3).map((t, idx) => (
              <span key={idx} className="font-mono">
                {t.tide_time.slice(0, 5)}: <strong className={t.tide_type === 'high' ? 'text-cyan-300' : 'text-amber-300'}>{t.height_metres}m</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Coastal Wind (from /api/wind-direction and /api/wind-speed) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/40">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Coastal Wind</span>
              <span className="text-xs font-mono text-blue-400">Data.gov.sg</span>
            </div>
          </div>
          {avgDir !== null && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              <Compass className="w-3 h-3 text-cyan-400" />
              {avgDir}° {compassDir}
            </span>
          )}
        </div>

        <div className="my-2.5">
          {!windSpeedResponse.success ? (
            <div className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-800/40">
              {windSpeedResponse.error || 'Wind speed sensor data unavailable'}
            </div>
          ) : (
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-100 flex items-baseline gap-1">
                {avgSpeed !== null ? `${avgSpeed} kts` : '--'}
                <span className="text-xs font-normal text-slate-400">
                  {avgSpeed !== null && avgSpeed <= 12 ? 'Moderate Sea' : 'Active Chop'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                From {compassDir} direction ({validSpeedStations.length} coastal stations active)
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Charter Drift:</span>
          <span className="font-semibold text-slate-200">
            {avgSpeed && avgSpeed < 14 ? 'Stable Drift (0.6 - 1.2 kts)' : 'Brisk Drift (1.5+ kts)'}
          </span>
        </div>
      </div>

      {/* 3. Heat Stress WBGT (from /api/heat-stress) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-950 text-orange-400 border border-orange-800/40">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Heat Stress (WBGT)</span>
              <span className="text-xs font-mono text-orange-400">NEA Real-time</span>
            </div>
          </div>
          {heatStressResponse.data?.current?.category && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              heatStressResponse.data.current.category === 'Extreme'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : heatStressResponse.data.current.category === 'High'
                ? 'bg-orange-950 text-orange-300 border border-orange-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {heatStressResponse.data.current.category}
            </span>
          )}
        </div>

        <div className="my-2.5">
          {!heatStressResponse.success ? (
            <div className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-800/40">
              {heatStressResponse.error || 'Heat stress sensor refused or empty'}
            </div>
          ) : (
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-100 flex items-baseline gap-1">
                {heatStressResponse.data?.current?.wbgt_value ? `${heatStressResponse.data.current.wbgt_value}°C` : '--'}
                <span className="text-xs font-normal text-slate-400">Wet Bulb</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {parseFloat(heatStressResponse.data?.current?.wbgt_value || '0') >= 33.0
                  ? 'Extreme heat: hydrate frequently & use cabin bimini.'
                  : 'Manageable outdoor sport conditions.'}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Charter Safety:</span>
          <span className="font-semibold text-slate-200">
            {parseFloat(heatStressResponse.data?.current?.wbgt_value || '0') >= 32.5 ? 'Shade & Ice Required' : 'Comfortable on Water'}
          </span>
        </div>
      </div>

      {/* 4. UV Index (from /api/uv) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/40">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Coastal UV Index</span>
              <span className="text-xs font-mono text-amber-400">NEA Satellite</span>
            </div>
          </div>
          {uvResponse.data?.current?.category && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
              {uvResponse.data.current.category}
            </span>
          )}
        </div>

        <div className="my-2.5">
          {!uvResponse.success ? (
            <div className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-800/40">
              {uvResponse.error || 'UV sensor data refused or empty'}
            </div>
          ) : (
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-100 flex items-baseline gap-1">
                {uvResponse.data?.current?.uv_value !== undefined ? uvResponse.data.current.uv_value : '--'}
                <span className="text-xs font-normal text-slate-400">
                  / 12 Peak
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {uvResponse.data?.current?.uv_value && uvResponse.data.current.uv_value >= 8
                  ? 'High water glare: polarized glasses & SPF 50+'
                  : 'Moderate solar exposure.'}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Water Glare:</span>
          <span className="font-semibold text-slate-200">
            {uvResponse.data?.current?.uv_value && uvResponse.data.current.uv_value >= 6 ? 'High (Reflective)' : 'Low to Medium'}
          </span>
        </div>
      </div>
    </div>
  );
};
