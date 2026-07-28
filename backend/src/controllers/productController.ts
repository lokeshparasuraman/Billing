import { Request, Response } from 'express';
import { prisma } from '../db.js';

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      const topProducts = await prisma.product.findMany({
        take: 20,
        orderBy: { name: 'asc' },
      });
      return res.json(topProducts);
    }

    // Search by part number OR product name
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { partNumber: { contains: query } },
          { name: { contains: query } },
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

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
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

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { partNumber, name, hsn, gst, price, unit, stock } = req.body;

    if (!partNumber || !name || !hsn || gst === undefined || price === undefined || !unit) {
      return res.status(400).json({ error: 'Missing required product fields (Part #, Name, HSN, Price, Unit).' });
    }

    const uppercasePartNum = String(partNumber).trim().toUpperCase();

    const existing = await prisma.product.findFirst({
      where: {
        partNumber: {
          equals: uppercasePartNum,
        },
      },
    });
    if (existing) {
      return res.status(400).json({ error: `Product with Part Number '${uppercasePartNum}' already exists.` });
    }

    const newProduct = await prisma.product.create({
      data: {
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

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id },
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error?.message || 'Failed to delete product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { price, partNumber, name, hsn, gst } = req.body;

    const updateData: any = {};
    if (price !== undefined) updateData.price = Number(price);
    if (name !== undefined) updateData.name = String(name).trim();
    if (hsn !== undefined) updateData.hsn = String(hsn).trim();
    if (gst !== undefined) updateData.gst = Number(gst);

    let updated;
    if (id && id !== 'undefined') {
      updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });
    } else if (partNumber) {
      const uppercasePartNum = String(partNumber).trim().toUpperCase();
      const existing = await prisma.product.findFirst({
        where: { partNumber: uppercasePartNum },
      });
      if (existing) {
        updated = await prisma.product.update({
          where: { id: existing.id },
          data: updateData,
        });
      }
    }

    if (!updated) {
      return res.status(404).json({ error: 'Product not found for update' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error?.message || 'Failed to update product' });
  }
};
