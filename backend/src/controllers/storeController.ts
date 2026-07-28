import { Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

const defaultStore = {
  storeName: 'OWSHIKA ENTERPRISES',
  ownerName: 'C.Perumal',
  email: 'owshikaentt@gmail.com',
  gstin: '33BAEPP2449B1Z3',
  phone: '+91 9445662637',
  address: '4/783, Kothumai Mill, Near New Bus Stand, Salem Main Road, Dharmapuri - 636701',
};

export const getStoreSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let settings = await prisma.storeSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: {
          ...defaultStore,
          userId,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ error: 'Failed to fetch store settings from database' });
  }
};

export const updateStoreSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { storeName, ownerName, email, gstin, phone, address } = req.body;

    const existing = await prisma.storeSetting.findUnique({ where: { userId } });

    const updated = await prisma.storeSetting.upsert({
      where: { userId },
      update: {
        storeName: storeName !== undefined ? String(storeName).trim() : (existing?.storeName || defaultStore.storeName),
        ownerName: ownerName !== undefined ? String(ownerName).trim() : (existing?.ownerName || defaultStore.ownerName),
        email: email !== undefined ? String(email).trim().toLowerCase() : (existing?.email || defaultStore.email),
        gstin: gstin !== undefined ? String(gstin).trim().toUpperCase() : (existing?.gstin || defaultStore.gstin),
        phone: phone !== undefined ? String(phone).trim() : (existing?.phone || defaultStore.phone),
        address: address !== undefined ? String(address).trim() : (existing?.address || defaultStore.address),
      },
      create: {
        userId,
        storeName: storeName !== undefined ? String(storeName).trim() : defaultStore.storeName,
        ownerName: ownerName !== undefined ? String(ownerName).trim() : defaultStore.ownerName,
        email: email !== undefined ? String(email).trim().toLowerCase() : defaultStore.email,
        gstin: gstin !== undefined ? String(gstin).trim().toUpperCase() : defaultStore.gstin,
        phone: phone !== undefined ? String(phone).trim() : defaultStore.phone,
        address: address !== undefined ? String(address).trim() : defaultStore.address,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating store settings:', error);
    res.status(500).json({ error: 'Failed to update store settings in database' });
  }
};
