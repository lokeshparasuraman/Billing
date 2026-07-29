import { Request, Response } from 'express';
import { prisma } from '../db.js';

// Global store ID — we always use a single fixed row for the whole app
const GLOBAL_STORE_ID = 'global';

const defaultStore = {
  id: GLOBAL_STORE_ID,
  storeName: 'OWSHIKA ENTERPRISES',
  ownerName: 'C.Perumal',
  email: 'owshikaentt@gmail.com',
  gstin: '33BAEPP2449B1Z3',
  phone: '+91 9445662637',
  address: '4/783, Kothumai Mill, Near New Bus Stand, Salem Main Road, Dharmapuri - 636701',
  bankName: 'STATE BANK OF INDIA',
  accountNumber: '41234567890',
  ifscCode: 'SBIN0001234',
  branchName: 'Dharmapuri Main Branch',
  upiId: 'owshika@sbi',
};

export const getStoreSettings = async (_req: Request, res: Response) => {
  try {
    let settings = await prisma.storeSetting.findUnique({
      where: { id: GLOBAL_STORE_ID },
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
    const { storeName, ownerName, email, gstin, phone, address, bankName, accountNumber, ifscCode, branchName, upiId } = req.body;

    const existing = await prisma.storeSetting.findUnique({ where: { id: GLOBAL_STORE_ID } });

    const updated = await prisma.storeSetting.upsert({
      where: { id: GLOBAL_STORE_ID },
      update: {
        storeName: storeName !== undefined ? String(storeName).trim() : (existing?.storeName || defaultStore.storeName),
        ownerName: ownerName !== undefined ? String(ownerName).trim() : (existing?.ownerName || defaultStore.ownerName),
        email: email !== undefined ? String(email).trim().toLowerCase() : (existing?.email || defaultStore.email),
        gstin: gstin !== undefined ? String(gstin).trim().toUpperCase() : (existing?.gstin || defaultStore.gstin),
        phone: phone !== undefined ? String(phone).trim() : (existing?.phone || defaultStore.phone),
        address: address !== undefined ? String(address).trim() : (existing?.address || defaultStore.address),
        bankName: bankName !== undefined ? String(bankName).trim().toUpperCase() : (existing?.bankName || defaultStore.bankName),
        accountNumber: accountNumber !== undefined ? String(accountNumber).trim() : (existing?.accountNumber || defaultStore.accountNumber),
        ifscCode: ifscCode !== undefined ? String(ifscCode).trim().toUpperCase() : (existing?.ifscCode || defaultStore.ifscCode),
        branchName: branchName !== undefined ? String(branchName).trim() : (existing?.branchName || defaultStore.branchName),
        upiId: upiId !== undefined ? String(upiId).trim().toLowerCase() : (existing?.upiId || defaultStore.upiId),
      },
      create: {
        ...defaultStore,
        storeName: storeName !== undefined ? String(storeName).trim() : defaultStore.storeName,
        ownerName: ownerName !== undefined ? String(ownerName).trim() : defaultStore.ownerName,
        email: email !== undefined ? String(email).trim().toLowerCase() : defaultStore.email,
        gstin: gstin !== undefined ? String(gstin).trim().toUpperCase() : defaultStore.gstin,
        phone: phone !== undefined ? String(phone).trim() : defaultStore.phone,
        address: address !== undefined ? String(address).trim() : defaultStore.address,
        bankName: bankName !== undefined ? String(bankName).trim().toUpperCase() : defaultStore.bankName,
        accountNumber: accountNumber !== undefined ? String(accountNumber).trim() : defaultStore.accountNumber,
        ifscCode: ifscCode !== undefined ? String(ifscCode).trim().toUpperCase() : defaultStore.ifscCode,
        branchName: branchName !== undefined ? String(branchName).trim() : defaultStore.branchName,
        upiId: upiId !== undefined ? String(upiId).trim().toLowerCase() : defaultStore.upiId,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating store settings:', error);
    res.status(500).json({ error: 'Failed to update store settings in database' });
  }
};
