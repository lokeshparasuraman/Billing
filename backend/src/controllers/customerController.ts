import { Request, Response } from 'express';
import { prisma } from '../db.js';

export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      const topCustomers = await prisma.customer.findMany({
        take: 10,
        orderBy: { name: 'asc' },
      });
      return res.json(topCustomers);
    }

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
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

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        phone,
        address,
      },
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};
