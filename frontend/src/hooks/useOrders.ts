import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse, Order, OrderStatus, PaginatedResponse, PaymentStatus } from '../types';

interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export const useOrders = (params: OrderListParams) =>
  useQuery<PaginatedResponse<Order>>(['orders', params], async () => {
    const { data } = await api.get<PaginatedResponse<Order>>('/orders', { params });
    return data;
  });

interface CreateOrderInput {
  customer: string;
  items: { product: string; quantity: number }[];
  discount?: number;
  taxRate?: number;
  shippingCost?: number;
  notes?: string;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: CreateOrderInput) => {
      const { data } = await api.post<ApiResponse<Order>>('/orders', input);
      return data.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries('dashboard-summary');
      },
    }
  );
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { data } = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('orders') }
  );
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) => {
      const { data } = await api.patch<ApiResponse<Order>>(`/orders/${id}/payment-status`, {
        paymentStatus,
      });
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('orders') }
  );
};

export const downloadInvoice = async (orderId: string, orderNumber: string) => {
  const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice-${orderNumber}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
