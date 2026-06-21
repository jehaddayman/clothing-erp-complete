import { PackagingMaterial, PackagingUsage, IPackagingMaterial } from '../models/Packaging';
import { ApiError } from '../utils/ApiError';

export const listMaterials = async () => {
  return PackagingMaterial.find({ isActive: true }).sort({ name: 1 });
};

export const createMaterial = async (data: Partial<IPackagingMaterial>) => {
  return PackagingMaterial.create(data);
};

export const restockMaterial = async (id: string, quantity: number) => {
  const material = await PackagingMaterial.findByIdAndUpdate(
    id,
    { $inc: { quantityInStock: quantity } },
    { new: true }
  );
  if (!material) throw ApiError.notFound('Packaging material not found');
  return material;
};

export const recordUsage = async (
  materialId: string,
  quantityUsed: number,
  performedBy: string,
  orderId?: string
) => {
  const material = await PackagingMaterial.findById(materialId);
  if (!material) throw ApiError.notFound('Packaging material not found');
  if (material.quantityInStock < quantityUsed) {
    throw ApiError.badRequest(
      `Insufficient packaging stock. Available: ${material.quantityInStock}`
    );
  }

  material.quantityInStock -= quantityUsed;
  await material.save();

  const totalCost = material.costPerUnit * quantityUsed;

  return PackagingUsage.create({
    material: materialId,
    order: orderId,
    quantityUsed,
    totalCost,
    performedBy,
  });
};

export const getConsumptionReport = async (startDate?: Date, endDate?: Date) => {
  const match: Record<string, unknown> = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) (match.createdAt as any).$gte = startDate;
    if (endDate) (match.createdAt as any).$lte = endDate;
  }

  return PackagingUsage.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$material',
        totalQuantityUsed: { $sum: '$quantityUsed' },
        totalCost: { $sum: '$totalCost' },
        usageCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'packagingmaterials',
        localField: '_id',
        foreignField: '_id',
        as: 'material',
      },
    },
    { $unwind: '$material' },
    {
      $project: {
        materialName: '$material.name',
        totalQuantityUsed: 1,
        totalCost: 1,
        usageCount: 1,
      },
    },
    { $sort: { totalCost: -1 } },
  ]);
};

export const getLowStockMaterials = async () => {
  return PackagingMaterial.find({
    isActive: true,
    $expr: { $lte: ['$quantityInStock', '$reorderThreshold'] },
  });
};
