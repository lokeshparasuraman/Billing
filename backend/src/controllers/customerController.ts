import { Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const searchCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const query = String(req.query.q || '').trim();

    if (!query) {
      const topCustomers = await prisma.customer.findMany({
        where: { userId },
        take: 10,
        orderBy: { name: 'asc' },
      });
      return res.json(topCustomers);
    }

    const customers = await prisma.customer.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { name: 'asc' },
    });

    res.json(customers);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: 'Failed to search customers' });
  }
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        userId,
        name: String(name).trim(),
        phone: phone ? String(phone).trim() : null,
        address: address ? String(address).trim() : null,
      },
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};
