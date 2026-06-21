import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as productService from '../services/productService';

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, category, brand, isActive, lowStockOnly, sortBy, sortOrder } =
    req.query;

  const result = await productService.listProducts({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string,
    category: category as string,
    brand: brand as string,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    lowStockOnly: lowStockOnly === 'true',
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  res.status(200).json({ success: true, ...result });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body, req.user!.id);
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: 'Product deactivated successfully' });
});

export const getLowStockProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getLowStockProducts();
  res.status(200).json({ success: true, data: products });
});
