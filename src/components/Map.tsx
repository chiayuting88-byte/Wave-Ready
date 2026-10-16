import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CoastalSpot, SpotSuitability, PartnerVendor } from '../types';

interface MapProps {
  spots: CoastalSpot[];
  selectedSpot: CoastalSpot | null;
  onSelectSpot: (spot: CoastalSpot) => void;
  suitabilityMap: Record<string, SpotSuitability>;
  userLocation: { lat: number; lng: number } | null;
  partners: PartnerVendor[];
  onSelectPartner?: (partner: PartnerVendor) => void;
}

export const Map: React.FC<MapProps> = ({
  spots,
  selectedSpot,
  onSelectSpot,
  suitabilityMap,
  userLocation,
  partners,
  onSelectPartner,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Singapore Coordinates
    const initialLat = 1.3200;
    const initialLng = 103.8200;
    const initialZoom = 11;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
      maxBounds: [
        [1.1000, 103.5500],
        [1.5200, 104.1500]
      ],
      maxBoundsViscosity: 0.8
    });

    // Sub-goal 2a: OneMap tiles basemap endpoint
    // GET https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png
    const oneMapLayer = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 10,
      attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:14px;display:inline-block;vertical-align:middle;margin-right:4px;" alt="OneMap" /> &copy; <a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">OneMap</a> | Singapore Land Authority',
      crossOrigin: true,
    });

    oneMapLayer.addTo(map);

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers for Spots
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing spot markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    spots.forEach((spot) => {
      const suitability = suitabilityMap[spot.id];
      const isSelected = selectedSpot?.id === spot.id;
      const score = suitability?.score ?? 75;
      const level = suitability?.level ?? 'moderate';
      const windSpeed = suitability?.matchedWind?.speedKnots ?? '--';

      let badgeColor = 'bg-emerald-500 border-emerald-300 text-emerald-950';
      let ringColor = 'border-emerald-500/30';
      if (level === 'caution') {
        badgeColor = 'bg-amber-500 border-amber-300 text-amber-950';
        ringColor = 'border-amber-500/30';
      } else if (level === 'unfavorable') {
        badgeColor = 'bg-rose-500 border-rose-300 text-rose-950';
        ringColor = 'border-rose-500/30';
      }

      // Custom HTML Marker Pin
      const iconHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'}">
          <!-- Pulse ripple for optimal spots -->
          ${level === 'optimal' ? '<div class="absolute -inset-1.5 rounded-full bg-cyan-400/20 animate-ping"></div>' : ''}
          
          <div class="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-xl backdrop-blur-md ${isSelected ? 'bg-slate-900 border-2 border-cyan-400 ring-4 ring-cyan-500/40 text-cyan-200' : 'bg-slate-950/90 border border-slate-700 text-slate-100'}">
            <!-- Icon Indicator -->
            <span class="w-2.5 h-2.5 rounded-full ${level === 'optimal' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : level === 'caution' ? 'bg-amber-400' : 'bg-rose-400'}"></span>
            
            <span class="text-xs font-bold tracking-tight whitespace-nowrap">${spot.name.split(' (')[0]}</span>
            
            <!-- Wind tag -->
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              ${windSpeed}kt
            </span>
          </div>

          <!-- Bottom pointer -->
          <div class="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 border-r border-b ${isSelected ? 'border-cyan-400' : 'border-slate-700'}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-spot-marker',
        iconSize: [160, 40],
        iconAnchor: [80, 40],
      });

      const marker = L.marker([spot.latitude, spot.longitude], { icon: customIcon });

      marker.on('click', () => {
        onSelectSpot(spot);
      });

      // Bind rich popup
      const partnerCount = partners.filter(p => p.spotId === spot.id).length;
      const popupHtml = `
        <div class="p-1 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
            <h4 class="font-bold text-sm text-cyan-300">${spot.name}</h4>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${badgeColor}">${level} (${score}%)</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${spot.description}</p>
          <div class="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <div>
              <span class="text-slate-400 block">Nearby Wind</span>
              <span class="font-semibold text-cyan-300">${windSpeed} knots (${suitability?.matchedWind?.stationName || 'Coastal'})</span>
            </div>
            <div>
              <span class="text-slate-400 block">Verified Partners</span>
              <span class="font-semibold text-emerald-400">${partnerCount} Operators</span>
            </div>
          </div>
          <button id="popup-btn-${spot.id}" class="w-full mt-2 py-1.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer text-center">
            Inspect Coastal Conditions & Book
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: 'custom-leaflet-popup'
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${spot.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectSpot(spot);
            map.closePopup();
          };
        }
      });

      marker.addTo(map);
      markersRef.current[spot.id] = marker;
    });
  }, [spots, suitabilityMap, selectedSpot, partners, onSelectSpot]);

  // Center on selected spot
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedSpot) return;

    map.flyTo([selectedSpot.latitude, selectedSpot.longitude], 13, {
      duration: 1.2
    });
  }, [selectedSpot]);

  // User location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
              <div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
            </div>
          `,
          className: 'user-location-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .bindTooltip('Your Location', { permanent: false, direction: 'top' })
          .addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  return (
    <div className="relative w-full h-full min-h-[360px] lg:min-h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 shadow-xl max-w-xs pointer-events-auto">
        <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
            OneMap Singapore Basemap
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">Live</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Caution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>Unfavorable</span>
          </div>
        </div>
      </div>

      {/* Recenter / Fit All Bounds Button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([1.3200, 103.8200], 11, { duration: 1 });
          }
        }}
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 backdrop-blur-md shadow-lg transition-colors cursor-pointer"
        title="Reset Singapore Map View"
      >
        <span>Reset Singapore View</span>
      </button>
    </div>
  );
};
