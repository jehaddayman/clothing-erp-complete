import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface LineItem {
  code?: string;
  name: string;
  amount: number;
}

const startDoc = (res: Response, filename: string, title: string) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  doc.pipe(res);
  doc.fontSize(18).text(title, { align: 'center' });
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);
  return doc;
};

const renderSection = (doc: PDFKit.PDFDocument, heading: string, items: LineItem[], total: number) => {
  doc.fontSize(13).text(heading, { underline: true });
  doc.moveDown(0.5);
  items.forEach((item) => {
    doc.fontSize(10).text(`${item.code ? item.code + ' - ' : ''}${item.name}`, 60, doc.y, { continued: true });
    doc.text(`$${item.amount.toFixed(2)}`, { align: 'right' });
  });
  doc.moveDown(0.3);
  doc.fontSize(11).text(`Total ${heading}: $${total.toFixed(2)}`, { align: 'right' });
  doc.moveDown(1.5);
};

export const generateProfitLossPdf = (
  res: Response,
  data: { revenue: LineItem[]; expenses: LineItem[]; totalRevenue: number; totalExpenses: number; netProfit: number }
) => {
  const doc = startDoc(res, 'profit-and-loss.pdf', 'Profit & Loss Statement');
  renderSection(doc, 'Revenue', data.revenue, data.totalRevenue);
  renderSection(doc, 'Expenses', data.expenses, data.totalExpenses);
  doc.moveDown(1);
  doc.fontSize(14).text(`Net Profit: $${data.netProfit.toFixed(2)}`, { align: 'right' });
  doc.end();
};

export const generateBalanceSheetPdf = (
  res: Response,
  data: {
    assets: LineItem[];
    liabilities: LineItem[];
    equity: LineItem[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  }
) => {
  const doc = startDoc(res, 'balance-sheet.pdf', 'Balance Sheet');
  renderSection(doc, 'Assets', data.assets, data.totalAssets);
  renderSection(doc, 'Liabilities', data.liabilities, data.totalLiabilities);
  renderSection(doc, 'Equity', data.equity, data.totalEquity);
  doc.moveDown(1);
  doc
    .fontSize(12)
    .text(
      `Total Liabilities + Equity: $${(data.totalLiabilities + data.totalEquity).toFixed(2)}`,
      { align: 'right' }
    );
  doc.end();
};
