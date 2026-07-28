import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config({ override: true });

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

// CORS setup allowing requests from laptop, mobile, and web clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoints
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// ─── Local / LAN mode: serve built frontend from disk ───────────────────────
// On Vercel, static files are served by the CDN. Only serve locally.
if (!process.env.VERCEL) {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  // SPA fallback for local use
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}
// ─────────────────────────────────────────────────────────────────────────────

// Global Error Handler
app.use(errorHandler);

export default app;
