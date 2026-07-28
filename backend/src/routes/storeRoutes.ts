import express from 'express';
import { getStoreSettings, updateStoreSettings } from '../controllers/storeController.js';

const router = express.Router();

router.get('/', getStoreSettings);
router.put('/', updateStoreSettings);

export default router;
