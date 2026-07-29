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
  address: '4/783, Roller Flour Mills, Near New Bus Stand, Salem Main Road, Dharmapuri - 636701',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  upiId: '',
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
    } else if (!settings.address || settings.address.includes('Kothumai Mill')) {
      settings = await prisma.storeSetting.update({
        where: { id: GLOBAL_STORE_ID },
        data: { address: defaultStore.address },
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

    // Strict Bank Details Validation if bank details are provided
    if (bankName !== undefined || accountNumber !== undefined || ifscCode !== undefined) {
      const cleanBankName = bankName ? String(bankName).trim() : '';
      const cleanAccNo = accountNumber ? String(accountNumber).trim() : '';
      const cleanIfsc = ifscCode ? String(ifscCode).trim().toUpperCase() : '';
      const cleanBranch = branchName ? String(branchName).trim() : '';
      const cleanUpi = upiId ? String(upiId).trim().toLowerCase() : '';

      // If user is trying to save bank details (not clearing all)
      if (cleanBankName || cleanAccNo || cleanIfsc) {
        if (!cleanBankName || cleanBankName.length < 3) {
          return res.status(400).json({ error: 'Bank Name must be at least 3 characters long.' });
        }
        if (!cleanAccNo || !/^\d+$/.test(cleanAccNo) || cleanAccNo.length < 9 || cleanAccNo.length > 18) {
          return res.status(400).json({ error: 'Account Number must contain only digits (9 to 18 numbers long).' });
        }
        if (!cleanIfsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
          return res.status(400).json({ error: "Invalid IFSC Code. Must be 11 characters starting with 4 letters, then '0', followed by 6 alphanumeric characters (e.g. SBIN0001234)." });
        }
        if (!cleanBranch || cleanBranch.length < 3) {
          return res.status(400).json({ error: 'Branch Name must be at least 3 characters long.' });
        }
        if (cleanUpi && !/^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/.test(cleanUpi)) {
          return res.status(400).json({ error: 'Invalid UPI ID format (e.g. owshika@sbi).' });
        }
      }
    }

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
