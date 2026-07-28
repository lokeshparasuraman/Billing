import { Router } from 'express';
import {
  searchProducts,
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
} from '../controllers/productController.js';

const router = Router();

router.get('/search', searchProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
