import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse } from '../types';

interface PackagingMaterial {
  _id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  quantityInStock: number;
  reorderThreshold: number;
}

export const useMaterials = () =>
  useQuery<PackagingMaterial[]>('packaging-materials', async () => {
    const { data } = await api.get<ApiResponse<PackagingMaterial[]>>('/packaging/materials');
    return data.data;
  });

interface MaterialInput {
  name: string;
  unit: string;
  costPerUnit: number;
}

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: MaterialInput) => {
      const { data } = await api.post<ApiResponse<PackagingMaterial>>('/packaging/materials', input);
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('packaging-materials') }
  );
};

export const useRestockMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data } = await api.post<ApiResponse<PackagingMaterial>>(`/packaging/materials/${id}/restock`, {
        quantity,
      });
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('packaging-materials') }
  );
};

interface ConsumptionRow {
  materialName: string;
  totalQuantityUsed: number;
  totalCost: number;
  usageCount: number;
}

export const useConsumptionReport = () =>
  useQuery<ConsumptionRow[]>('packaging-consumption', async () => {
    const { data } = await api.get<ApiResponse<ConsumptionRow[]>>('/packaging/reports/consumption');
    return data.data;
  });
