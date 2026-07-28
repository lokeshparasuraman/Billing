import { Request, Response } from 'express';
import { prisma } from '../db.js';

const defaultStore = {
  id: 'default_store',
  storeName: 'OWSHIKA ENTERPRISES',
  ownerName: 'C.Perumal',
  email: 'owshikaentt@gmail.com',
  gstin: '33BAEPP2449B1Z3',
  phone: '+91 9445662637',
  address: '4/783, Kothumai Mill, Near New Bus Stand, Salem Main Road, Dharmapuri - 636701',
};

export const getStoreSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.storeSetting.findUnique({
      where: { id: 'default_store' },
    });

    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: defaultStore,
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ error: 'Failed to fetch store settings from database' });
  }
};

export const updateStoreSettings = async (req: Request, res: Response) => {
  try {
    const { storeName, ownerName, email, gstin, phone, address } = req.body;

    const updated = await prisma.storeSetting.upsert({
      where: { id: 'default_store' },
      update: {
        storeName: storeName !== undefined ? String(storeName).trim() : defaultStore.storeName,
        ownerName: ownerName !== undefined ? String(ownerName).trim() : defaultStore.ownerName,
        email: email !== undefined ? String(email).trim().toLowerCase() : defaultStore.email,
        gstin: gstin !== undefined ? String(gstin).trim().toUpperCase() : defaultStore.gstin,
        phone: phone !== undefined ? String(phone).trim() : defaultStore.phone,
        address: address !== undefined ? String(address).trim() : defaultStore.address,
      },
      create: {
        id: 'default_store',
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
