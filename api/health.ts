export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Guardrail 4: If an explicitly configured required key is empty, return 503
  if (process.env.REQUIRE_API_KEY === 'true' && !process.env.API_KEY) {
    return res.status(503).json({
      status: 'error',
      message: 'key not configured',
      code: 503
    });
  }

  return res.status(200).json({
    status: 'healthy',
    app: 'WaveReady',
    description: 'Coastal Water Sports & Fishing Charter Weather/Tide Intelligence',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    endpoints: {
      tides: '/api/tides',
      uv: '/api/uv',
      heatStress: '/api/heat-stress',
      windDirection: '/api/wind-direction',
      windSpeed: '/api/wind-speed',
      neaMulti: '/api/NEA'
    }
  });
}
