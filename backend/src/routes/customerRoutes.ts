import { Router } from 'express';
import { searchCustomers, createCustomer } from '../controllers/customerController.js';

const router = Router();

router.get('/search', searchCustomers);
router.post('/', createCustomer);

export default router;
