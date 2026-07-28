import { Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const searchProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const query = String(req.query.q || '').trim();

    if (!query) {
      const topProducts = await prisma.product.findMany({
        where: { userId },
        take: 20,
        orderBy: { name: 'asc' },
      });
      return res.json(topProducts);
    }

    const products = await prisma.product.findMany({
      where: {
        userId,
        OR: [
          { partNumber: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
};

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id, userId },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { partNumber, name, hsn, gst, price, unit, stock } = req.body;

    if (!partNumber || !name || !hsn || gst === undefined || price === undefined || !unit) {
      return res.status(400).json({ error: 'Missing required product fields (Part #, Name, HSN, Price, Unit).' });
    }

    const uppercasePartNum = String(partNumber).trim().toUpperCase();

    const existing = await prisma.product.findFirst({
      where: {
        userId,
        partNumber: uppercasePartNum,
      },
    });

    if (existing) {
      return res.status(400).json({ error: `Product with Part Number '${uppercasePartNum}' already exists.` });
    }

    const newProduct = await prisma.product.create({
      data: {
        userId,
        partNumber: uppercasePartNum,
        name: String(name).trim(),
        hsn: String(hsn).trim(),
        gst: Number(gst),
        price: Number(price),
        unit: String(unit).trim().toUpperCase(),
        stock: Number(stock || 100),
      },
    });

    res.status(201).json(newProduct);
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error?.code === 'P2002') {
      return res.status(400).json({ error: 'Product with this Part Number already exists' });
    }
    res.status(500).json({ error: error?.message || 'Failed to create product' });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const existing = await prisma.product.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    await prisma.product.delete({
      where: { id: existing.id },
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error?.message || 'Failed to delete product' });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { price, partNumber, name, hsn, gst } = req.body;

    const updateData: any = {};
    if (price !== undefined) updateData.price = Number(price);
    if (name !== undefined) updateData.name = String(name).trim();
    if (hsn !== undefined) updateData.hsn = String(hsn).trim();
    if (gst !== undefined) updateData.gst = Number(gst);

    let existing;
    if (id && id !== 'undefined') {
      existing = await prisma.product.findFirst({ where: { id, userId } });
    } else if (partNumber) {
      const uppercasePartNum = String(partNumber).trim().toUpperCase();
      existing = await prisma.product.findFirst({ where: { partNumber: uppercasePartNum, userId } });
    }

    if (!existing) {
      return res.status(404).json({ error: 'Product not found for update' });
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error?.message || 'Failed to update product' });
  }
};
