import { Router } from 'express';
import {
  searchProducts,
  getProducts,
  getProductById,
  createProduct,
} from '../controllers/productController.js';

const router = Router();

router.get('/search', searchProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);

export default router;
