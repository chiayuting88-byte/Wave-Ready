/**
 * Serverless function for NEA and Data.gov.sg Coastal Weather Data
 * Deployed to Vercel and mounted via Express dev server
 */

interface FetchOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeoutMs = 7000, headers = {} } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WaveReady-App/1.0 (Singapore Coastal Watersports Intelligence)',
        'Accept': 'application/json',
        ...headers,
      },
    });
    clearTimeout(id);
    return res;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Upstream NEA server is responding slowly.');
    }
    throw new Error(`Connection refused or network failed: ${err.message || 'unknown error'}`);
  }
}

export default async function handler(req: any, res: any) {
  // CORS and Headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Guardrail 1 & 4: Check if any required key is configured in process.env
  // If an environment variable is marked required but empty, return 503
  if (process.env.REQUIRE_API_KEY === 'true' && !process.env.API_KEY) {
    return res.status(503).json({
      success: false,
      error: 'key not configured',
      message: 'A required API key is marked as mandatory but is empty or missing from process.env.'
    });
  }

  // Determine requested endpoint: either from query param or from path
  const urlPath = req.url ? req.url.split('?')[0] : '';
  const queryEndpoint = req.query?.endpoint;

  let endpointType = queryEndpoint || '';
  if (!endpointType) {
    if (urlPath.includes('/tides')) endpointType = 'tides';
    else if (urlPath.includes('/uv')) endpointType = 'uv';
    else if (urlPath.includes('/heat-stress')) endpointType = 'heat-stress';
    else if (urlPath.includes('/wind-direction')) endpointType = 'wind-direction';
    else if (urlPath.includes('/wind-speed')) endpointType = 'wind-speed';
    else endpointType = 'all';
  }

  try {
    switch (endpointType) {
      case 'tides': {
        const response = await fetchWithTimeout('https://neaweather.com/api/v1/tides');
        if (!response.ok) {
          return res.status(response.status).json({
            success: false,
            error: 'NEA Tides API refused connection or returned error status',
            status: response.status
          });
        }
        const data = await response.json();
        if (!data || (!data.today && !Array.isArray(data))) {
          return res.status(200).json({
            success: false,
            error: 'NEA Tides data is empty from provider',
            data: null
          });
        }
        return res.status(200).json({
          success: true,
          source: 'NEA',
          retrievedAt: new Date().toISOString(),
          data
        });
      }

      case 'uv': {
        const response = await fetchWithTimeout('https://neaweather.com/api/v1/uv');
        if (!response.ok) {
          return res.status(response.status).json({
            success: false,
            error: 'NEA UV API refused connection or returned error status',
            status: response.status
          });
        }
        const data = await response.json();
        if (!data || (!data.current && !data.data)) {
          return res.status(200).json({
            success: false,
            error: 'NEA UV data is empty from provider',
            data: null
          });
        }
        return res.status(200).json({
          success: true,
          source: 'NEA',
          retrievedAt: new Date().toISOString(),
          data
        });
      }

      case 'heat-stress': {
        const response = await fetchWithTimeout('https://neaweather.com/api/v1/heat-stress');
        if (!response.ok) {
          return res.status(response.status).json({
            success: false,
            error: 'NEA Heat Stress API refused connection or returned error status',
            status: response.status
          });
        }
        const data = await response.json();
        if (!data || (!data.current && !data.data)) {
          return res.status(200).json({
            success: false,
            error: 'NEA Heat Stress data is empty from provider',
            data: null
          });
        }
        return res.status(200).json({
          success: true,
          source: 'NEA',
          retrievedAt: new Date().toISOString(),
          data
        });
      }

      case 'wind-direction': {
        // Primary: data.gov.sg v2 realtime API (Dataset d_534cf203023b51f51f879145ccc56ff9)
        let data: any = null;
        let sourceUsed = 'Data.gov.sg v2';
        try {
          const resp = await fetchWithTimeout('https://api-open.data.gov.sg/v2/real-time/api/wind-direction');
          if (resp.ok) {
            data = await resp.json();
          }
        } catch (e) {
          // Attempt fallback to v1 API
        }

        if (!data || !data.data) {
          try {
            const respV1 = await fetchWithTimeout('https://api.data.gov.sg/v1/environment/wind-direction');
            if (respV1.ok) {
              data = await respV1.json();
              sourceUsed = 'Data.gov.sg v1';
            }
          } catch (e) {
            // failed
          }
        }

        if (!data) {
          return res.status(200).json({
            success: false,
            error: 'Wind direction data is empty or refused from Data.gov.sg',
            data: null
          });
        }

        return res.status(200).json({
          success: true,
          source: sourceUsed,
          retrievedAt: new Date().toISOString(),
          data
        });
      }

      case 'wind-speed': {
        // Primary: data.gov.sg v2 realtime API (Dataset d_7677738484067741bf3b56ab5d69c7e9)
        let data: any = null;
        let sourceUsed = 'Data.gov.sg v2';
        try {
          const resp = await fetchWithTimeout('https://api-open.data.gov.sg/v2/real-time/api/wind-speed');
          if (resp.ok) {
            data = await resp.json();
          }
        } catch (e) {
          // Attempt fallback
        }

        if (!data || !data.data) {
          try {
            const respV1 = await fetchWithTimeout('https://api.data.gov.sg/v1/environment/wind-speed');
            if (respV1.ok) {
              data = await respV1.json();
              sourceUsed = 'Data.gov.sg v1';
            }
          } catch (e) {
            // failed
          }
        }

        if (!data) {
          return res.status(200).json({
            success: false,
            error: 'Wind speed data is empty or refused from Data.gov.sg',
            data: null
          });
        }

        return res.status(200).json({
          success: true,
          source: sourceUsed,
          retrievedAt: new Date().toISOString(),
          data
        });
      }

      case 'all':
      default: {
        // Aggregate all coastal feeds in parallel for high performance
        const [tidesRes, uvRes, heatStressRes, windDirRes, windSpeedRes] = await Promise.allSettled([
          fetchWithTimeout('https://neaweather.com/api/v1/tides').then(r => r.ok ? r.json() : null),
          fetchWithTimeout('https://neaweather.com/api/v1/uv').then(r => r.ok ? r.json() : null),
          fetchWithTimeout('https://neaweather.com/api/v1/heat-stress').then(r => r.ok ? r.json() : null),
          fetchWithTimeout('https://api-open.data.gov.sg/v2/real-time/api/wind-direction').then(r => r.ok ? r.json() : null)
            .catch(() => fetchWithTimeout('https://api.data.gov.sg/v1/environment/wind-direction').then(r => r.ok ? r.json() : null)),
          fetchWithTimeout('https://api-open.data.gov.sg/v2/real-time/api/wind-speed').then(r => r.ok ? r.json() : null)
            .catch(() => fetchWithTimeout('https://api.data.gov.sg/v1/environment/wind-speed').then(r => r.ok ? r.json() : null)),
        ]);

        const tidesData = tidesRes.status === 'fulfilled' ? tidesRes.value : null;
        const uvData = uvRes.status === 'fulfilled' ? uvRes.value : null;
        const heatStressData = heatStressRes.status === 'fulfilled' ? heatStressRes.value : null;
        const windDirData = windDirRes.status === 'fulfilled' ? windDirRes.value : null;
        const windSpeedData = windSpeedRes.status === 'fulfilled' ? windSpeedRes.value : null;

        return res.status(200).json({
          success: true,
          timestamp: new Date().toISOString(),
          credits: 'Data: NEA, Data.gov.sg, METEO',
          results: {
            tides: {
              ok: Boolean(tidesData?.today || (Array.isArray(tidesData) && tidesData.length > 0)),
              statusMessage: tidesData ? 'Live tidal forecast active' : 'Tide data is empty or refused from NEA',
              data: tidesData
            },
            uv: {
              ok: Boolean(uvData?.current),
              statusMessage: uvData?.current ? 'Live coastal UV active' : 'UV data is empty or slow from NEA',
              data: uvData
            },
            heatStress: {
              ok: Boolean(heatStressData?.current),
              statusMessage: heatStressData?.current ? 'Live WBGT heat stress active' : 'Heat stress data is empty or slow from NEA',
              data: heatStressData
            },
            windDirection: {
              ok: Boolean(windDirData?.data || windDirData?.items),
              statusMessage: (windDirData?.data || windDirData?.items) ? 'Live coastal wind direction active' : 'Wind direction is slow or unavailable from Data.gov.sg',
              data: windDirData
            },
            windSpeed: {
              ok: Boolean(windSpeedData?.data || windSpeedData?.items),
              statusMessage: (windSpeedData?.data || windSpeedData?.items) ? 'Live coastal wind speed active' : 'Wind speed is slow or unavailable from Data.gov.sg',
              data: windSpeedData
            }
          }
        });
      }
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Upstream server connection failed',
      message: error.message || 'The data request was refused or timed out'
    });
  }
}
