import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Shipment {
  _id: string;
  order: { orderNumber: string; total: number } | string;
  shippingCompany: string;
  trackingNumber?: string;
  shippingCost: number;
  status: string;
  createdAt: string;
}

export const useShipments = (params: { page?: number; limit?: number; status?: string }) =>
  useQuery<PaginatedResponse<Shipment>>(['shipments', params], async () => {
    const { data } = await api.get<PaginatedResponse<Shipment>>('/shipping', { params });
    return data;
  });

interface CreateShipmentInput {
  order: string;
  shippingCompany: string;
  shippingCost: number;
  trackingNumber?: string;
}

export const useCreateShipment = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: CreateShipmentInput) => {
      const { data } = await api.post<ApiResponse<Shipment>>('/shipping', input);
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('shipments') }
  );
};

export const useUpdateShipmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch<ApiResponse<Shipment>>(`/shipping/${id}/status`, { status });
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('shipments') }
  );
};
