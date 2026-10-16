import { TideData, UVData, HeatStressData, WindStation } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  isEmpty: boolean;
  isSlow: boolean;
  isRefused: boolean;
  source?: string;
  retrievedAt?: string;
}

const API_TIMEOUT = 9000;

async function requestWithStatus<T>(url: string): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const startTime = Date.now();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    const isSlow = duration > 4500;

    if (!res.ok) {
      return {
        success: false,
        data: null,
        error: `Server responded with HTTP ${res.status}: Connection refused or endpoint error`,
        isEmpty: false,
        isSlow,
        isRefused: true,
      };
    }

    const json = await res.json();

    if (!json || json.success === false || json.data === null) {
      return {
        success: false,
        data: null,
        error: json?.error || 'Live data is empty from upstream provider',
        isEmpty: true,
        isSlow,
        isRefused: false,
        source: json?.source
      };
    }

    const payload = json.data !== undefined ? json.data : json;

    return {
      success: true,
      data: payload as T,
      error: null,
      isEmpty: false,
      isSlow,
      isRefused: false,
      source: json.source,
      retrievedAt: json.retrievedAt || new Date().toISOString()
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        data: null,
        error: 'The live sensor response was too slow (>9s). Upstream provider timed out.',
        isEmpty: false,
        isSlow: true,
        isRefused: false,
      };
    }

    return {
      success: false,
      data: null,
      error: `Connection refused: ${err.message || 'Network unreachable'}. Live server rejected or failed request.`,
      isEmpty: false,
      isSlow: false,
      isRefused: true,
    };
  }
}

/**
 * Live coastal tide data from NEA (GET https://neaweather.com/api/v1/tides),
 * fetched only through project's /api/tides
 */
export async function fetchTides(): Promise<ApiResponse<TideData>> {
  return requestWithStatus<TideData>('/api/tides');
}

/**
 * Live coastal UV data from NEA (GET https://neaweather.com/api/v1/uv),
 * fetched only through project's /api/uv
 */
export async function fetchUV(): Promise<ApiResponse<UVData>> {
  return requestWithStatus<UVData>('/api/uv');
}

/**
 * Live coastal heat stress data from NEA (GET https://neaweather.com/api/v1/heat-stress),
 * fetched only through project's /api/heat-stress
 */
export async function fetchHeatStress(): Promise<ApiResponse<HeatStressData>> {
  return requestWithStatus<HeatStressData>('/api/heat-stress');
}

/**
 * Wind direction from GET https://data.gov.sg/datasets/d_534cf203023b51f51f879145ccc56ff9/view
 * fetched through /api/wind-direction
 */
export async function fetchWindDirection(): Promise<ApiResponse<any>> {
  return requestWithStatus<any>('/api/wind-direction');
}

/**
 * Wind speed from GET https://data.gov.sg/datasets/d_7677738484067741bf3b56ab5d69c7e9/view
 * fetched through /api/wind-speed
 */
export async function fetchWindSpeed(): Promise<ApiResponse<any>> {
  return requestWithStatus<any>('/api/wind-speed');
}

/**
 * Parse Data.gov.sg Wind Direction and Wind Speed stations into unified list
 */
export function parseWindStations(dirData: any, speedData: any): WindStation[] {
  const stationsMap = new Map<string, WindStation>();

  // Extract from dirData
  // Format may be { code: 0, data: { stations: [...], readings: [...] } } or { metadata: { stations: [...] }, items: [...] }
  const dirStations = dirData?.data?.stations || dirData?.metadata?.stations || [];
  const dirReadings = dirData?.data?.readings?.[0]?.data || dirData?.items?.[0]?.readings || [];

  for (const st of dirStations) {
    const id = st.id || st.deviceId || st.device_id;
    const lat = st.location?.latitude || st.location?.lat;
    const lng = st.location?.longitude || st.location?.lng;
    if (id && lat && lng) {
      stationsMap.set(id, {
        id,
        name: st.name || id,
        latitude: lat,
        longitude: lng,
      });
    }
  }

  for (const r of dirReadings) {
    const stationId = r.stationId || r.station_id;
    const val = typeof r.value === 'number' ? r.value : parseFloat(r.value);
    if (stationId && !isNaN(val) && stationsMap.has(stationId)) {
      stationsMap.get(stationId)!.directionDeg = val;
    }
  }

  // Extract from speedData
  const speedStations = speedData?.data?.stations || speedData?.metadata?.stations || [];
  const speedReadings = speedData?.data?.readings?.[0]?.data || speedData?.items?.[0]?.readings || [];

  for (const st of speedStations) {
    const id = st.id || st.deviceId || st.device_id;
    const lat = st.location?.latitude || st.location?.lat;
    const lng = st.location?.longitude || st.location?.lng;
    if (id && lat && lng && !stationsMap.has(id)) {
      stationsMap.set(id, {
        id,
        name: st.name || id,
        latitude: lat,
        longitude: lng,
      });
    }
  }

  for (const r of speedReadings) {
    const stationId = r.stationId || r.station_id;
    const val = typeof r.value === 'number' ? r.value : parseFloat(r.value);
    if (stationId && !isNaN(val) && stationsMap.has(stationId)) {
      stationsMap.get(stationId)!.speedKnots = val;
    }
  }

  return Array.from(stationsMap.values());
}
