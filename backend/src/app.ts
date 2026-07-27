import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);

// Root endpoint status
app.get('/', (req, res) => {
  res.json({
    message: '⚡ Owshika Enterprises Billing API Backend is Live & Running!',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      invoices: '/api/invoices',
      customers: '/api/customers',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
