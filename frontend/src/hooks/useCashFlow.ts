import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface CashTransaction {
  _id: string;
  direction: 'in' | 'out';
  category: string;
  amount: number;
  description?: string;
  date: string;
}

export const useCashTransactions = (params: { page?: number; limit?: number }) =>
  useQuery<PaginatedResponse<CashTransaction>>(['cash-transactions', params], async () => {
    const { data } = await api.get<PaginatedResponse<CashTransaction>>('/cashflow', { params });
    return data;
  });

export const useCashPosition = () =>
  useQuery<{ cashIn: number; cashOut: number; netCash: number }>('cash-position', async () => {
    const { data } = await api.get('/cashflow/position');
    return data.data;
  });

interface CashTxInput {
  direction: 'in' | 'out';
  category: string;
  amount: number;
  description?: string;
}

export const useRecordCashTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: CashTxInput) => {
      const { data } = await api.post<ApiResponse<CashTransaction>>('/cashflow', input);
      return data.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cash-transactions');
        queryClient.invalidateQueries('cash-position');
        queryClient.invalidateQueries('dashboard-summary');
      },
    }
  );
};

interface ForecastMonth {
  month: string;
  projectedInflow: number;
  projectedOutflow: number;
  projectedNet: number;
}

export const useCashFlowForecast = () =>
  useQuery<{ forecast: ForecastMonth[] }>('cash-forecast', async () => {
    const { data } = await api.get('/cashflow/forecast');
    return data.data;
  });
