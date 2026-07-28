import { Router } from 'express';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

const router = Router();

// Public Authentication Routes
router.use('/auth', authRoutes);

// Protected App Routes (requires logged-in user JWT token)
router.use('/products', authMiddleware, productRoutes);
router.use('/customers', authMiddleware, customerRoutes);
router.use('/invoices', authMiddleware, invoiceRoutes);
router.use('/store', authMiddleware, storeRoutes);

export default router;
