import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface ReturnRecord {
  _id: string;
  order: { orderNumber: string } | string;
  type: string;
  reason: string;
  status: string;
  totalRefund: number;
  restocked: boolean;
  createdAt: string;
}

export const useReturns = (params: { page?: number; limit?: number; status?: string }) =>
  useQuery<PaginatedResponse<ReturnRecord>>(['returns', params], async () => {
    const { data } = await api.get<PaginatedResponse<ReturnRecord>>('/returns', { params });
    return data;
  });

interface CreateReturnInput {
  order: string;
  type: 'product_return' | 'shipping_return';
  items: { product: string; quantity: number }[];
  reason: string;
}

export const useCreateReturn = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: CreateReturnInput) => {
      const { data } = await api.post<ApiResponse<ReturnRecord>>('/returns', input);
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('returns') }
  );
};

export const useUpdateReturnStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, status, restock }: { id: string; status: string; restock?: boolean }) => {
      const { data } = await api.patch<ApiResponse<ReturnRecord>>(`/returns/${id}/status`, {
        status,
        restock,
      });
      return data.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('returns');
        queryClient.invalidateQueries('products');
      },
    }
  );
};
