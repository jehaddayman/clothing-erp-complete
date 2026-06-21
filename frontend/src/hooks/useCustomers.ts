import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse, Customer, PaginatedResponse } from '../types';

interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useCustomers = (params: CustomerListParams) =>
  useQuery<PaginatedResponse<Customer>>(['customers', params], async () => {
    const { data } = await api.get<PaginatedResponse<Customer>>('/customers', { params });
    return data;
  });

export interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: CustomerInput) => {
      const { data } = await api.post<ApiResponse<Customer>>('/customers', input);
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('customers') }
  );
};

export const useAddCustomerNote = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, text }: { id: string; text: string }) => {
      const { data } = await api.post<ApiResponse<Customer>>(`/customers/${id}/notes`, { text });
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('customers') }
  );
};
