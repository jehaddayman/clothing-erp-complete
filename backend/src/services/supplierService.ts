import { Supplier, ISupplier } from '../models/Supplier';
import { ApiError } from '../utils/ApiError';

export const listSuppliers = async (search?: string) => {
  const filter = search ? { $text: { $search: search } } : {};
  return Supplier.find(filter).sort({ name: 1 });
};

export const getSupplierById = async (id: string): Promise<ISupplier> => {
  const supplier = await Supplier.findById(id);
  if (!supplier) throw ApiError.notFound('Supplier not found');
  return supplier;
};

export const createSupplier = async (data: Partial<ISupplier>): Promise<ISupplier> => {
  return Supplier.create(data);
};

export const updateSupplier = async (id: string, data: Partial<ISupplier>): Promise<ISupplier> => {
  const supplier = await Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!supplier) throw ApiError.notFound('Supplier not found');
  return supplier;
};

export const deactivateSupplier = async (id: string): Promise<void> => {
  const supplier = await Supplier.findByIdAndUpdate(id, { isActive: false });
  if (!supplier) throw ApiError.notFound('Supplier not found');
};

export const recordSupplierPayment = async (id: string, amount: number): Promise<ISupplier> => {
  const supplier = await Supplier.findById(id);
  if (!supplier) throw ApiError.notFound('Supplier not found');
  supplier.outstandingBalance = Math.max(supplier.outstandingBalance - amount, 0);
  await supplier.save();
  return supplier;
};
