import { Router } from 'express';
import {
  getNextInvoiceNumber,
  createInvoice,
  updateInvoice,
  getInvoices,
  getInvoiceById,
  deleteInvoice,
} from '../controllers/invoiceController.js';

const router = Router();

router.get('/next-number', getNextInvoiceNumber);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
