import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse, PaginatedResponse, Product } from '../types';

interface InventoryLog {
  _id: string;
  product: { _id: string; name: string; sku: string } | string;
  type: string;
  quantityChange: number;
  quantityAfter: number;
  reason?: string;
  performedBy: { name: string } | string;
  createdAt: string;
}

export const useInventoryLogs = (params: { page?: number; limit?: number; type?: string }) =>
  useQuery<PaginatedResponse<InventoryLog>>(['inventory-logs', params], async () => {
    const { data } = await api.get<PaginatedResponse<InventoryLog>>('/inventory/logs', { params });
    return data;
  });

interface MovementInput {
  product: string;
  quantity: number;
  reason?: string;
}

const useMovement = (endpoint: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: MovementInput) => {
      const { data } = await api.post<ApiResponse<Product>>(`/inventory/${endpoint}`, input);
      return data.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries('inventory-logs');
      },
    }
  );
};

export const useStockIn = () => useMovement('stock-in');
export const useStockOut = () => useMovement('stock-out');
export const useMarkDamaged = () => useMovement('damaged');
