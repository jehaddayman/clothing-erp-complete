import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { IOrder } from '../models/Order';

export const streamInvoicePdf = (order: IOrder, res: Response): void => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text('INVOICE', { align: 'right' });
  doc.fontSize(10).text(`Order #: ${order.orderNumber}`, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
  doc.moveDown(2);

  const customer = order.customer as any;
  doc.fontSize(12).text('Bill To:');
  doc.fontSize(10).text(customer?.name || 'N/A');
  if (customer?.phone) doc.text(customer.phone);
  if (customer?.email) doc.text(customer.email);
  doc.moveDown(2);

  const tableTop = doc.y;
  doc.fontSize(10).text('Item', 50, tableTop);
  doc.text('Qty', 280, tableTop);
  doc.text('Unit Price', 350, tableTop);
  doc.text('Total', 450, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let y = tableTop + 25;
  order.items.forEach((item) => {
    doc.text(`${item.name} (${item.sku})`, 50, y, { width: 220 });
    doc.text(String(item.quantity), 280, y);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 350, y);
    doc.text(`$${item.lineTotal.toFixed(2)}`, 450, y);
    y += 20;
  });

  y += 10;
  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 15;

  const summaryLine = (label: string, value: number) => {
    doc.text(label, 350, y);
    doc.text(`$${value.toFixed(2)}`, 450, y);
    y += 18;
  };

  summaryLine('Subtotal:', order.subtotal);
  if (order.discount > 0) summaryLine('Discount:', -order.discount);
  if (order.taxAmount > 0) summaryLine(`Tax (${order.taxRate}%):`, order.taxAmount);
  if (order.shippingCost > 0) summaryLine('Shipping:', order.shippingCost);
  doc.fontSize(12).text('Total:', 350, y);
  doc.text(`$${order.total.toFixed(2)}`, 450, y);

  doc.end();
};
