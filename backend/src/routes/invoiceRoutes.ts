import { Router } from 'express';
import {
  getNextInvoiceNumber,
  createInvoice,
  getInvoices,
  getInvoiceById,
} from '../controllers/invoiceController.js';

const router = Router();

router.get('/next-number', getNextInvoiceNumber);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);

export default router;
