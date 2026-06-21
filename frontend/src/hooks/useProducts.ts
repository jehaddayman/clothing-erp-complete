import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse, PaginatedResponse, Product } from '../types';

interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}

export const useProducts = (params: ProductListParams) =>
  useQuery<PaginatedResponse<Product>>(['products', params], async () => {
    const { data } = await api.get<PaginatedResponse<Product>>('/products', { params });
    return data;
  });

export type ProductInput = Omit<Product, '_id' | 'isActive' | 'isLowStock' | 'createdAt' | 'images'> & {
  images?: string[];
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: Partial<ProductInput>) => {
      const { data } = await api.post<ApiResponse<Product>>('/products', input);
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('products') }
  );
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, input }: { id: string; input: Partial<ProductInput> }) => {
      const { data } = await api.put<ApiResponse<Product>>(`/products/${id}`, input);
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('products') }
  );
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    { onSuccess: () => queryClient.invalidateQueries('products') }
  );
};
