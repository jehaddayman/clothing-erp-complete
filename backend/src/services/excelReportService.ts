import ExcelJS from 'exceljs';
import { Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { CashTransaction } from '../models/CashTransaction';
import { Shipment } from '../models/Shipment';
import { Return } from '../models/Return';

const sendWorkbook = async (workbook: ExcelJS.Workbook, res: Response, filename: string) => {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  res.end();
};

const styleHeader = (sheet: ExcelJS.Worksheet) => {
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' },
  };
};

export const generateSalesReport = async (res: Response, startDate?: Date, endDate?: Date) => {
  const filter: Record<string, unknown> = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) (filter.createdAt as any).$gte = startDate;
    if (endDate) (filter.createdAt as any).$lte = endDate;
  }

  const orders = await Order.find(filter).populate('customer', 'name phone').sort({ createdAt: -1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sales Report');
  sheet.columns = [
    { header: 'Order #', key: 'orderNumber', width: 15 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Customer', key: 'customer', width: 22 },
    { header: 'Subtotal', key: 'subtotal', width: 12 },
    { header: 'Discount', key: 'discount', width: 12 },
    { header: 'Tax', key: 'tax', width: 12 },
    { header: 'Shipping', key: 'shipping', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Payment Status', key: 'paymentStatus', width: 16 },
  ];
  styleHeader(sheet);

  orders.forEach((o) => {
    sheet.addRow({
      orderNumber: o.orderNumber,
      date: new Date(o.createdAt).toLocaleDateString(),
      customer: (o.customer as any)?.name || 'N/A',
      subtotal: o.subtotal,
      discount: o.discount,
      tax: o.taxAmount,
      shipping: o.shippingCost,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
    });
  });

  await sendWorkbook(workbook, res, 'sales-report.xlsx');
};

export const generateInventoryReport = async (res: Response) => {
  const products = await Product.find({ isActive: true }).sort({ category: 1, name: 1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Inventory Report');
  sheet.columns = [
    { header: 'SKU', key: 'sku', width: 16 },
    { header: 'Name', key: 'name', width: 28 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Color', key: 'color', width: 12 },
    { header: 'Size', key: 'size', width: 10 },
    { header: 'Cost Price', key: 'costPrice', width: 12 },
    { header: 'Selling Price', key: 'sellingPrice', width: 14 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Stock Value', key: 'stockValue', width: 14 },
    { header: 'Low Stock?', key: 'lowStock', width: 12 },
  ];
  styleHeader(sheet);

  products.forEach((p) => {
    sheet.addRow({
      sku: p.sku,
      name: p.name,
      category: p.category,
      color: p.color || '',
      size: p.size || '',
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      stockValue: p.costPrice * p.quantity,
      lowStock: p.quantity <= p.lowStockThreshold ? 'YES' : 'NO',
    });
  });

  await sendWorkbook(workbook, res, 'inventory-report.xlsx');
};

export const generateCashFlowReport = async (res: Response, startDate?: Date, endDate?: Date) => {
  const filter: Record<string, unknown> = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) (filter.date as any).$gte = startDate;
    if (endDate) (filter.date as any).$lte = endDate;
  }

  const transactions = await CashTransaction.find(filter).sort({ date: -1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Cash Flow Report');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Direction', key: 'direction', width: 12 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Description', key: 'description', width: 30 },
  ];
  styleHeader(sheet);

  transactions.forEach((t) => {
    sheet.addRow({
      date: new Date(t.date).toLocaleDateString(),
      direction: t.direction === 'in' ? 'Cash In' : 'Cash Out',
      category: t.category,
      amount: t.amount,
      description: t.description || '',
    });
  });

  await sendWorkbook(workbook, res, 'cash-flow-report.xlsx');
};

export const generateShippingReport = async (res: Response) => {
  const shipments = await Shipment.find().populate('order', 'orderNumber total').sort({ createdAt: -1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Shipping Report');
  sheet.columns = [
    { header: 'Order #', key: 'orderNumber', width: 15 },
    { header: 'Shipping Company', key: 'company', width: 20 },
    { header: 'Tracking #', key: 'tracking', width: 18 },
    { header: 'Cost', key: 'cost', width: 12 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Shipped At', key: 'shippedAt', width: 16 },
    { header: 'Delivered At', key: 'deliveredAt', width: 16 },
  ];
  styleHeader(sheet);

  shipments.forEach((s) => {
    sheet.addRow({
      orderNumber: (s.order as any)?.orderNumber || 'N/A',
      company: s.shippingCompany,
      tracking: s.trackingNumber || '',
      cost: s.shippingCost,
      status: s.status,
      shippedAt: s.shippedAt ? new Date(s.shippedAt).toLocaleDateString() : '',
      deliveredAt: s.deliveredAt ? new Date(s.deliveredAt).toLocaleDateString() : '',
    });
  });

  await sendWorkbook(workbook, res, 'shipping-report.xlsx');
};

export const generateReturnsReport = async (res: Response) => {
  const returns = await Return.find().populate('order', 'orderNumber').sort({ createdAt: -1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Returns Report');
  sheet.columns = [
    { header: 'Order #', key: 'orderNumber', width: 15 },
    { header: 'Type', key: 'type', width: 16 },
    { header: 'Reason', key: 'reason', width: 18 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Total Refund', key: 'refund', width: 14 },
    { header: 'Restocked', key: 'restocked', width: 12 },
    { header: 'Date', key: 'date', width: 14 },
  ];
  styleHeader(sheet);

  returns.forEach((r) => {
    sheet.addRow({
      orderNumber: (r.order as any)?.orderNumber || 'N/A',
      type: r.type,
      reason: r.reason,
      status: r.status,
      refund: r.totalRefund,
      restocked: r.restocked ? 'YES' : 'NO',
      date: new Date(r.createdAt).toLocaleDateString(),
    });
  });

  await sendWorkbook(workbook, res, 'returns-report.xlsx');
};
