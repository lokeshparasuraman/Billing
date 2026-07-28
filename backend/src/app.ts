import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Root Status Endpoint
app.get('/', (_req, res) => {
  res.json({
    message: '⚡ Owshika Enterprises Billing API Backend is Live & Running!',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      invoices: '/api/invoices',
      customers: '/api/customers',
      store: '/api/store',
    },
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
