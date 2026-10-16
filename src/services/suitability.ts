import { CoastalSpot, SpotSuitability, TideData, UVData, HeatStressData, WindStation, WaterActivity } from '../types';

/**
 * Calculate distance between two lat/lng coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Find nearest wind station to a coastal spot
 */
export function findNearestWind(spot: CoastalSpot, stations: WindStation[]): { speedKnots: number; directionDeg: number; stationName: string } | null {
  if (!stations.length) return null;

  // Prefer exact match by ID if available
  const exact = stations.find(s => s.id === spot.nearbyStationId && (s.speedKnots !== undefined || s.directionDeg !== undefined));
  if (exact) {
    return {
      speedKnots: exact.speedKnots ?? 8,
      directionDeg: exact.directionDeg ?? 180,
      stationName: exact.name
    };
  }

  // Otherwise find geographically closest station with readings
  let closest: WindStation | null = null;
  let minDistance = Infinity;

  for (const st of stations) {
    if (st.speedKnots === undefined && st.directionDeg === undefined) continue;
    const dist = calculateDistanceKm(spot.latitude, spot.longitude, st.latitude, st.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = st;
    }
  }

  if (closest) {
    return {
      speedKnots: closest.speedKnots ?? 7,
      directionDeg: closest.directionDeg ?? 160,
      stationName: closest.name
    };
  }

  return null;
}

/**
 * Determine cardinal direction string from degrees (e.g. 180 -> S, 45 -> NE)
 */
export function degreesToCompass(deg: number): string {
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16] || 'Var';
}

/**
 * Analyze today's tides and deduce current stage
 */
export function analyzeCurrentTide(tideData: TideData | null) {
  const todayEvents = tideData?.today || [];
  if (!todayEvents.length) {
    return {
      stage: 'Unknown (awaiting NEA)',
      nextTide: null,
      summary: 'Tide data pending from NEA'
    };
  }

  // Parse events relative to current Singapore time (UTC+8)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextEvent = todayEvents.find(e => {
    const [h, m] = e.tide_time.split(':').map(Number);
    return (h * 60 + m) > currentMinutes;
  });

  if (!nextEvent) {
    nextEvent = todayEvents[todayEvents.length - 1];
  }

  return {
    stage: nextEvent.tide_type === 'high' ? 'Rising / Flood Tide' : 'Falling / Ebb Tide',
    nextTide: nextEvent,
    summary: `Next ${nextEvent.tide_type.toUpperCase()} tide (${nextEvent.height_metres}m) at ${nextEvent.tide_time.slice(0, 5)}`
  };
}

/**
 * Compute real-time watersport and charter suitability for a specific coastal spot
 */
export function computeSuitability(
  spot: CoastalSpot,
  windStations: WindStation[],
  tideData: TideData | null,
  uvData: UVData | null,
  heatStressData: HeatStressData | null
): SpotSuitability {
  const wind = findNearestWind(spot, windStations);
  const tideInfo = analyzeCurrentTide(tideData);

  const speed = wind?.speedKnots ?? 8;
  const direction = wind?.directionDeg ?? 180;
  const compass = degreesToCompass(direction);
  const uvValue = uvData?.current?.uv_value ?? 5;
  const wbgt = parseFloat(heatStressData?.current?.wbgt_value ?? '31');

  let baseScore = 80;
  const reasons: string[] = [];

  // Wind analysis
  if (speed >= 6 && speed <= 15) {
    baseScore += 10;
    reasons.push(`Favorable breeze of ${speed} kts from ${compass} providing steady navigation without high swell.`);
  } else if (speed > 18) {
    baseScore -= 20;
    reasons.push(`Brisk wind at ${speed} kts: expect chop and increased spray on open water.`);
  } else if (speed < 4) {
    baseScore -= 5;
    reasons.push(`Calm wind (${speed} kts): glassy water, minimal sailing breeze.`);
  }

  // Tide analysis
  if (tideData?.today?.length) {
    if (tideInfo.nextTide?.tide_type === 'high') {
      baseScore += 8;
      reasons.push(`Rising flood tide advancing towards ${tideInfo.nextTide.height_metres}m: excellent water clearance over reefs and ramps.`);
    } else {
      reasons.push(`Ebbing tide moving towards low (${tideInfo.nextTide?.height_metres ?? '1.0'}m): exercise caution in shallow channels.`);
    }
  }

  // Heat Stress & UV advisory
  if (wbgt >= 33.0) {
    baseScore -= 12;
    reasons.push(`Extreme WBGT heat stress (${wbgt.toFixed(1)}°C): mandatory shade, onboard ice packs, and frequent hydration.`);
  } else if (wbgt >= 31.0) {
    baseScore -= 5;
    reasons.push(`High heat stress (${wbgt.toFixed(1)}°C): ensure bimini top is deployed.`);
  }

  if (uvValue >= 8) {
    reasons.push(`Very High UV Index (${uvValue}): high UV protection and rash guards strongly recommended.`);
  }

  const score = Math.max(20, Math.min(98, baseScore));

  let level: SpotSuitability['level'] = 'moderate';
  if (score >= 80) level = 'optimal';
  else if (score >= 65) level = 'moderate';
  else if (score >= 50) level = 'caution';
  else level = 'unfavorable';

  const headline = level === 'optimal'
    ? `Optimal Conditions: ${speed} kts ${compass} breeze with healthy sea conditions`
    : level === 'moderate'
    ? `Good Conditions: Moderate ${speed} kts breeze, mind midday heat index`
    : level === 'caution'
    ? `Caution Advised: Choppier conditions or extreme heat (${wbgt.toFixed(1)}°C WBGT)`
    : `Unfavorable: Adverse wind or low depth limits charter comfort`;

  // Activity-specific suitability
  const activitySuitability: Record<WaterActivity, { status: 'optimal' | 'good' | 'caution' | 'unfavorable'; reason: string }> = {
    fishing_charter: {
      status: speed < 16 ? (tideInfo.stage.includes('Rising') ? 'optimal' : 'good') : 'caution',
      reason: speed < 16
        ? `Tidal movement stimulates pelagic feeding; steady drift speed around ${speed} kts.`
        : `Wind at ${speed} kts causes faster drift and choppier sea floor hold.`
    },
    jetski: {
      status: speed <= 14 ? 'optimal' : speed <= 19 ? 'good' : 'caution',
      reason: speed <= 14
        ? `Clean surface with responsive waves; plenty of depth along designated coastal zones.`
        : `Moderate swell may produce heavier spray; keep safe distance from reefs.`
    },
    yacht: {
      status: speed >= 7 && speed <= 20 ? 'optimal' : speed > 20 ? 'caution' : 'good',
      reason: speed >= 7 && speed <= 20
        ? `Ideal wind force for sailing catamarans and cruising yachts along the Southern Islands.`
        : speed < 7 ? `Light air: rely on auxiliary twin engines for cruising.` : `Strong gusts: reef sails and secure deck gear.`
    },
    kayak_sup: {
      status: speed < 9 ? 'optimal' : speed < 14 ? 'good' : 'caution',
      reason: speed < 9
        ? `Flat water, minimal leeward drift, safe for beginners and paddle touring.`
        : speed < 14 ? `Noticeable leeward wind drift: stay close to shoreline or within sheltered lagoons.` : `High drift hazard for paddle craft: avoid open crossings.`
    },
    wakeboard: {
      status: speed < 9 ? 'optimal' : speed < 14 ? 'good' : 'caution',
      reason: speed < 9
        ? `Glassy calm water creates crisp wake definition for jumps and surf transfers.`
        : `Wind chop produces bumpy ride; prioritize sheltered cable park or inner channels.`
    }
  };

  return {
    score,
    level,
    headline,
    reasons,
    matchedWind: wind ? { speedKnots: speed, directionDeg: direction, stationName: wind.stationName } : undefined,
    activitySuitability
  };
}
