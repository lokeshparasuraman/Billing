import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { numberToWordsIndian } from '../utils/numberToWords.js';

export const getNextInvoiceNumber = async (req: Request, res: Response) => {
  try {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    const invoiceNumber = `OE-${year}-${nextNum}`;
    res.json({ invoiceNumber });
  } catch (error) {
    console.error('Error generating next invoice number:', error);
    res.status(500).json({ error: 'Failed to generate invoice number' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const {
      invoiceNumber,
      invoiceDate,
      customerName,
      customerPhone,
      customerAddress,
      paymentMode,
      items,
    } = req.body;

    const finalCustomerName = (customerName && String(customerName).trim()) || 'Owshika Enterprises';

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one product item is required' });
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productName || item.productName.trim() === '') {
        return res.status(400).json({ error: `Item #${i + 1}: Product name is missing` });
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        return res.status(400).json({ error: `Item #${i + 1} (${item.productName}): Quantity must be greater than 0` });
      }
      if (item.price === undefined || Number(item.price) < 0) {
        return res.status(400).json({ error: `Item #${i + 1} (${item.productName}): Price cannot be negative` });
      }
    }

    // Perform server-side calculation verification
    let calculatedSubtotal = 0;
    let calculatedDiscountTotal = 0;
    let calculatedCgstTotal = 0;
    let calculatedSgstTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const qty = Number(item.quantity);
      const price = Number(item.price);
      const discountPct = Number(item.discount || 0);
      const gstRate = Number(item.gstRate || 0);

      const grossAmount = qty * price;
      const discountAmount = (grossAmount * discountPct) / 100;
      const taxableAmount = grossAmount - discountAmount;

      const gstAmount = (taxableAmount * gstRate) / 100;
      const itemTotal = taxableAmount + gstAmount;

      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;

      calculatedSubtotal += taxableAmount;
      calculatedDiscountTotal += discountAmount;
      calculatedCgstTotal += cgst;
      calculatedSgstTotal += sgst;

      processedItems.push({
        productId: item.productId || null,
        partNumber: item.partNumber || 'N/A',
        productName: item.productName,
        hsn: item.hsn || 'N/A',
        unit: item.unit || 'PCS',
        quantity: qty,
        price: price,
        discount: discountPct,
        gstRate: gstRate,
        gstAmount: gstAmount,
        total: itemTotal,
      });
    }

    const exactGrandTotal = calculatedSubtotal + calculatedCgstTotal + calculatedSgstTotal;
    const roundedGrandTotal = Math.round(exactGrandTotal);
    const roundOff = Number((roundedGrandTotal - exactGrandTotal).toFixed(2));
    const amountInWords = numberToWordsIndian(roundedGrandTotal);

    // Auto-register or update entered products into Product Catalog list
    for (const item of processedItems) {
      const pNum = String(item.partNumber || '').trim().toUpperCase();
      const pName = String(item.productName || '').trim();
      const isSpecialRow =
        !pNum ||
        pNum === 'N/A' ||
        pNum === 'LABOUR' ||
        pNum === 'SERVICE' ||
        pNum === 'MISC-SPARES' ||
        pNum === 'SPARES';

      if (!isSpecialRow && pName) {
        try {
          const existing = await prisma.product.findFirst({
            where: { partNumber: pNum },
          });

          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                price: item.price,
                hsn: item.hsn || existing.hsn,
                gst: item.gstRate !== undefined ? item.gstRate : existing.gst,
                name: pName || existing.name,
              },
            });
          } else {
            await prisma.product.create({
              data: {
                partNumber: pNum,
                name: pName,
                hsn: item.hsn || 'N/A',
                gst: item.gstRate || 0,
                price: item.price,
                unit: item.unit || 'PCS',
                stock: 100,
              },
            });
          }
        } catch (err) {
          console.warn('Failed to auto-upsert catalog product:', err);
        }
      }
    }

    // Save Customer if not exists or update phone/address
    let customerId: string | null = null;
    const existingCustomer = await prisma.customer.findFirst({
      where: { name: finalCustomerName },
    });

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const newCust = await prisma.customer.create({
        data: {
          name: finalCustomerName,
          phone: customerPhone || null,
          address: customerAddress || null,
        },
      });
      customerId = newCust.id;
    }

    // Handle invoice number collision gracefully
    let finalInvNum = invoiceNumber;
    if (!finalInvNum) {
      const year = new Date().getFullYear();
      const count = await prisma.invoice.count();
      finalInvNum = `OE-${year}-${(count + 1).toString().padStart(4, '0')}`;
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: finalInvNum,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        customerName: finalCustomerName,
        customerPhone: customerPhone || null,
        customerAddress: customerAddress || null,
        paymentMode: paymentMode || 'CASH',
        subtotal: Number(calculatedSubtotal.toFixed(2)),
        discountTotal: Number(calculatedDiscountTotal.toFixed(2)),
        cgstTotal: Number(calculatedCgstTotal.toFixed(2)),
        sgstTotal: Number(calculatedSgstTotal.toFixed(2)),
        igstTotal: 0,
        roundOff: roundOff,
        grandTotal: roundedGrandTotal,
        amountInWords: amountInWords,
        customerId: customerId,
        items: {
          create: processedItems,
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Invoice number already exists. Please try again.' });
    }
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice by id:', error);
    res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    await prisma.invoice.delete({
      where: { id },
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: error?.message || 'Failed to delete invoice' });
  }
};
