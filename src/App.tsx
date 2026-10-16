import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Navigation, 
  MapPin, 
  Filter, 
  Sparkles, 
  Fish, 
  Ship, 
  Anchor, 
  Waves, 
  RefreshCw, 
  ArrowUpDown, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  CoastalSpot, 
  SpotSuitability, 
  TideData, 
  UVData, 
  HeatStressData, 
  WindStation, 
  WaterActivity, 
  PartnerVendor, 
  UserSubscription 
} from './types';
import { COASTAL_SPOTS, PARTNER_VENDORS } from './data/coastalSpots';
import { 
  fetchTides, 
  fetchUV, 
  fetchHeatStress, 
  fetchWindDirection, 
  fetchWindSpeed, 
  parseWindStations, 
  ApiResponse 
} from './services/api';
import { computeSuitability, calculateDistanceKm } from './services/suitability';
import { Header } from './components/Header';
import { Map } from './components/Map';
import { SpotCard } from './components/SpotCard';
import { ConditionsOverview } from './components/ConditionsOverview';
import { PartnersSection } from './components/PartnersSection';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PlainLanguageStatus } from './components/PlainLanguageStatus';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation & tabs
  const [activeTab, setActiveTab] = useState<'map' | 'partners' | 'sensors'>('map');
  const [selectedSpot, setSelectedSpot] = useState<CoastalSpot | null>(COASTAL_SPOTS[0]);
  const [selectedActivity, setSelectedActivity] = useState<WaterActivity | 'all'>('all');
  const [partnerSpotFilter, setPartnerSpotFilter] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'nearest' | 'suitability' | 'alphabetical'>('suitability');

  // User Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Subscription state
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription>({
    status: 'free_trial',
    trialDaysLeft: 28,
    planName: 'WaveReady Pro Free Trial',
    expiryDate: '2026-11-16',
    hasCharterAssurance: true,
  });

  // Live Coastal API states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tidesResponse, setTidesResponse] = useState<ApiResponse<TideData>>({
    success: false,
    data: null,
    error: 'Loading live NEA coastal tide data...',
    isEmpty: false,
    isSlow: false,
    isRefused: false,
  });

  const [uvResponse, setUvResponse] = useState<ApiResponse<UVData>>({
    success: false,
    data: null,
    error: 'Loading live coastal UV data...',
    isEmpty: false,
    isSlow: false,
    isRefused: false,
  });

  const [heatStressResponse, setHeatStressResponse] = useState<ApiResponse<HeatStressData>>({
    success: false,
    data: null,
    error: 'Loading live coastal heat stress data...',
    isEmpty: false,
    isSlow: false,
    isRefused: false,
  });

  const [windDirResponse, setWindDirResponse] = useState<ApiResponse<any>>({
    success: false,
    data: null,
    error: 'Loading live wind direction from Data.gov.sg...',
    isEmpty: false,
    isSlow: false,
    isRefused: false,
  });

  const [windSpeedResponse, setWindSpeedResponse] = useState<ApiResponse<any>>({
    success: false,
    data: null,
    error: 'Loading live wind speed from Data.gov.sg...',
    isEmpty: false,
    isSlow: false,
    isRefused: false,
  });

  // Parsed Wind stations
  const [windStations, setWindStations] = useState<WindStation[]>([]);

  // Fetch all endpoints
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // Sub-goal 3: Obtain data through our project's /api/tides, /api/uv, /api/heat-stress, /api/wind-direction, /api/wind-speed
      const [tides, uv, heatStress, windDir, windSpeed] = await Promise.all([
        fetchTides(),
        fetchUV(),
        fetchHeatStress(),
        fetchWindDirection(),
        fetchWindSpeed(),
      ]);

      setTidesResponse(tides);
      setUvResponse(uv);
      setHeatStressResponse(heatStress);
      setWindDirResponse(windDir);
      setWindSpeedResponse(windSpeed);

      if (windDir.data || windSpeed.data) {
        const stations = parseWindStations(windDir.data, windSpeed.data);
        setWindStations(stations);
      }
    } catch (err: any) {
      console.error('Failed to load coastal telemetry:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Request user GPS
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setSortBy('nearest');
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        // Default to Central Singapore fallback for demonstration if user denies permission
        setUserLocation({ lat: 1.290270, lng: 103.851959 });
        setLocationError('GPS permission was dismissed. Using Central Singapore coordinate as reference.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Compute suitability for each coastal spot
  const suitabilityMap = useMemo(() => {
    const map: Record<string, SpotSuitability> = {};
    for (const spot of COASTAL_SPOTS) {
      map[spot.id] = computeSuitability(
        spot,
        windStations,
        tidesResponse.data,
        uvResponse.data,
        heatStressResponse.data
      );
    }
    return map;
  }, [windStations, tidesResponse.data, uvResponse.data, heatStressResponse.data]);

  // Filtered and Sorted spots
  const displayedSpots = useMemo(() => {
    let list = COASTAL_SPOTS.filter((spot) => {
      if (selectedActivity === 'all') return true;
      return spot.popularActivities.includes(selectedActivity);
    });

    return list.map((spot) => {
      const distance = userLocation
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, spot.latitude, spot.longitude)
        : undefined;
      return { spot, distance };
    }).sort((a, b) => {
      if (sortBy === 'nearest') {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      }
      if (sortBy === 'suitability') {
        const scoreA = suitabilityMap[a.spot.id]?.score ?? 0;
        const scoreB = suitabilityMap[b.spot.id]?.score ?? 0;
        return scoreB - scoreA;
      }
      return a.spot.name.localeCompare(b.spot.name);
    });
  }, [selectedActivity, sortBy, userLocation, suitabilityMap]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <Header
        subscription={subscription}
        onOpenSubscriptionModal={() => setSubscriptionModalOpen(true)}
        onRequestLocation={handleRequestLocation}
        isLocating={isLocating}
        hasLocation={Boolean(userLocation)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Sub-goal 4: Plain Language Status Banner (handles empty, slow, or refused data) */}
        <PlainLanguageStatus
          tidesStatus={tidesResponse}
          uvStatus={uvResponse}
          heatStressStatus={heatStressResponse}
          windDirStatus={windDirResponse}
          windSpeedStatus={windSpeedResponse}
          onRefresh={loadAllData}
          isRefreshing={isRefreshing}
        />

        {/* Location Notification if fallback applied */}
        {locationError && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>{locationError}</span>
            <button onClick={() => setLocationError(null)} className="text-slate-500 hover:text-white">✕</button>
          </div>
        )}

        {/* Top Hero / Conditions Bar (Sub-goals 1 & 3) */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                Singapore Coastal Conditions
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h2>
              <p className="text-xs text-slate-400">
                Synchronized live telemetry from NEA coastal tide gauges, satellite UV, and Data.gov.sg marine wind stations.
              </p>
            </div>

            {/* Quick Activity Filter Pill Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'all', label: 'All Activities' },
                { id: 'fishing_charter', label: 'Fishing Charter' },
                { id: 'jetski', label: 'JetSki' },
                { id: 'yacht', label: 'Yacht' },
                { id: 'kayak_sup', label: 'Kayak/SUP' },
                { id: 'wakeboard', label: 'Wakeboard' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedActivity(item.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedActivity === item.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Sensor Cards Overview */}
          <ConditionsOverview
            tidesResponse={tidesResponse}
            uvResponse={uvResponse}
            heatStressResponse={heatStressResponse}
            windStations={windStations}
            windDirResponse={windDirResponse}
            windSpeedResponse={windSpeedResponse}
          />
        </section>

        {/* VIEW 1: Map & Beaches Explorer */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive OneMap (Sub-goal 2) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm text-slate-200">
                    OneMap Singapore Coastal Basemap
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400">
                  {displayedSpots.length} Beaches Active
                </span>
              </div>

              {/* Sub-goal 2a: OneMap Basemap */}
              <div className="h-[400px] sm:h-[480px] lg:h-[580px] w-full">
                <Map
                  spots={COASTAL_SPOTS}
                  selectedSpot={selectedSpot}
                  onSelectSpot={(spot) => setSelectedSpot(spot)}
                  suitabilityMap={suitabilityMap}
                  userLocation={userLocation}
                  partners={PARTNER_VENDORS}
                  onSelectPartner={(p) => {
                    setPartnerSpotFilter(p.spotId);
                    setActiveTab('partners');
                  }}
                />
              </div>

              {/* Selected Spot Detailed Spotlight Card */}
              {selectedSpot && suitabilityMap[selectedSpot.id] && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-800/50 shadow-xl">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                        Selected Coastal Hotspot
                      </span>
                      <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                        {selectedSpot.name}
                        {userLocation && (
                          <span className="text-xs font-normal text-slate-400">
                            ({calculateDistanceKm(userLocation.lat, userLocation.lng, selectedSpot.latitude, selectedSpot.longitude)} km from your GPS)
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-cyan-300 block">
                        {suitabilityMap[selectedSpot.id].score}% Match
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        {suitabilityMap[selectedSpot.id].level}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {suitabilityMap[selectedSpot.id].headline}
                  </p>

                  <div className="space-y-1 text-xs text-slate-300 mb-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <strong className="text-[11px] text-cyan-400 uppercase tracking-wider block mb-1">
                      Real-Time Conditions Breakdown
                    </strong>
                    {suitabilityMap[selectedSpot.id].reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {selectedSpot.fishingSpecies && (
                    <div className="mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Target Sportfishing Species Active Here:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSpot.fishingSpecies.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-400">
                      Launch Facilities: <span className="text-slate-200">{selectedSpot.launchFacilities.slice(0, 2).join(', ')}</span>
                    </span>
                    <button
                      onClick={() => {
                        setPartnerSpotFilter(selectedSpot.id);
                        setActiveTab('partners');
                      }}
                      className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      Browse Charter Fleets Here
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Coastal Beaches Ranked by Suitability or Proximity */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                    <span>Ranked Singapore Beaches</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Sorted by {sortBy === 'nearest' ? 'proximity to you' : sortBy === 'suitability' ? 'best water sports conditions' : 'name'}
                  </span>
                </div>

                {/* Sort Toggle */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setSortBy('suitability')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      sortBy === 'suitability' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Best Score
                  </button>
                  <button
                    onClick={() => {
                      if (!userLocation) handleRequestLocation();
                      else setSortBy('nearest');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      sortBy === 'nearest' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Nearest
                  </button>
                </div>
              </div>

              {/* Spot Cards Scrollable List */}
              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {displayedSpots.map(({ spot, distance }) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    suitability={suitabilityMap[spot.id]}
                    isSelected={selectedSpot?.id === spot.id}
                    distanceKm={distance}
                    onSelect={() => setSelectedSpot(spot)}
                    partners={PARTNER_VENDORS}
                    onViewPartners={(s) => {
                      setPartnerSpotFilter(s.id);
                      setActiveTab('partners');
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Partner Charters & Equipment Hire (Sub-goal 5) */}
        {activeTab === 'partners' && (
          <PartnersSection
            partners={PARTNER_VENDORS}
            spots={COASTAL_SPOTS}
            selectedSpotFilter={partnerSpotFilter}
            onSelectSpotFilter={(id) => setPartnerSpotFilter(id)}
          />
        )}

        {/* VIEW 3: Detailed Live Telemetry Inspector */}
        {activeTab === 'sensors' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Live Coastal Sensor Feed Inspector</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct transparency into all upstream NEA and Data.gov.sg API responses.
                  </p>
                </div>
                <button
                  onClick={loadAllData}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Fetch Fresh Readings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Tides NEA Endpoint */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-2">
                  <div className="flex items-center justify-between text-cyan-400 font-bold">
                    <span>GET /api/tides (https://neaweather.com/api/v1/tides)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-800">
                      Status: {tidesResponse.success ? '200 OK' : 'Failed'}
                    </span>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-48 p-2 bg-slate-900 rounded border border-slate-800">
                    {tidesResponse.data ? JSON.stringify(tidesResponse.data, null, 2) : tidesResponse.error}
                  </pre>
                </div>

                {/* Heat Stress NEA Endpoint */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-2">
                  <div className="flex items-center justify-between text-orange-400 font-bold">
                    <span>GET /api/heat-stress (https://neaweather.com/api/v1/heat-stress)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-orange-950 border border-orange-800">
                      Status: {heatStressResponse.success ? '200 OK' : 'Failed'}
                    </span>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-48 p-2 bg-slate-900 rounded border border-slate-800">
                    {heatStressResponse.data ? JSON.stringify(heatStressResponse.data, null, 2) : heatStressResponse.error}
                  </pre>
                </div>

                {/* UV NEA Endpoint */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-2">
                  <div className="flex items-center justify-between text-amber-400 font-bold">
                    <span>GET /api/uv (https://neaweather.com/api/v1/uv)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 border border-amber-800">
                      Status: {uvResponse.success ? '200 OK' : 'Failed'}
                    </span>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-48 p-2 bg-slate-900 rounded border border-slate-800">
                    {uvResponse.data ? JSON.stringify(uvResponse.data, null, 2) : uvResponse.error}
                  </pre>
                </div>

                {/* Wind Data.gov.sg Endpoint */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-2">
                  <div className="flex items-center justify-between text-blue-400 font-bold">
                    <span>GET /api/wind-speed & /api/wind-direction</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 border border-blue-800">
                      {windStations.length} Coastal Buoys
                    </span>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-48 p-2 bg-slate-900 rounded border border-slate-800">
                    {JSON.stringify(windStations.slice(0, 4), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Subscription & Peace of Mind Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        subscription={subscription}
        onUpdateSubscription={(sub) => setSubscription(sub)}
      />

      {/* Sub-goal 6: Strict Data Source Credit in Footer */}
      <Footer />
    </div>
  );
}
