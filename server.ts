import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import neaHandler from './api/NEA.ts';
import healthHandler from './api/health.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Mount API endpoints
  app.all('/api/health', (req, res) => {
    return healthHandler(req, res);
  });

  app.all('/api/NEA', (req, res) => {
    return neaHandler(req, res);
  });

  app.all('/api/tides', (req, res) => {
    req.query = { ...req.query, endpoint: 'tides' };
    return neaHandler(req, res);
  });

  app.all('/api/uv', (req, res) => {
    req.query = { ...req.query, endpoint: 'uv' };
    return neaHandler(req, res);
  });

  app.all('/api/heat-stress', (req, res) => {
    req.query = { ...req.query, endpoint: 'heat-stress' };
    return neaHandler(req, res);
  });

  app.all('/api/wind-direction', (req, res) => {
    req.query = { ...req.query, endpoint: 'wind-direction' };
    return neaHandler(req, res);
  });

  app.all('/api/wind-speed', (req, res) => {
    req.query = { ...req.query, endpoint: 'wind-speed' };
    return neaHandler(req, res);
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`WaveReady server running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
