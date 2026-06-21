import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse, Supplier } from '../types';

export const useSuppliers = (search?: string) =>
  useQuery<Supplier[]>(['suppliers', search], async () => {
    const { data } = await api.get<ApiResponse<Supplier[]>>('/suppliers', { params: { search } });
    return data.data;
  });

interface SupplierInput {
  name: string;
  phone: string;
  email?: string;
  contactPerson?: string;
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: SupplierInput) => {
      const { data } = await api.post<ApiResponse<Supplier>>('/suppliers', input);
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('suppliers') }
  );
};

interface PurchaseOrder {
  _id: string;
  poNumber: string;
  supplier: { name: string } | string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export const usePurchaseOrders = () =>
  useQuery<{ items: PurchaseOrder[] }>('purchase-orders', async () => {
    const { data } = await api.get('/suppliers/purchase-orders/all');
    return data;
  });

interface POItemInput {
  product: string;
  quantity: number;
  unitCost: number;
}

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: { supplier: string; items: POItemInput[] }) => {
      const { data } = await api.post<ApiResponse<PurchaseOrder>>('/suppliers/purchase-orders', input);
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('purchase-orders') }
  );
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      const { data } = await api.post<ApiResponse<PurchaseOrder>>(`/suppliers/purchase-orders/${id}/receive`);
      return data.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('purchase-orders');
        queryClient.invalidateQueries('products');
      },
    }
  );
};
