import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse } from '../types';

export interface BusinessPlan {
  _id: string;
  title: string;
  period: string;
  startDate: string;
  endDate: string;
  revenueTarget: number;
  salesTarget: number;
  status: string;
}

export const usePlans = () =>
  useQuery<BusinessPlan[]>('plans', async () => {
    const { data } = await api.get<ApiResponse<BusinessPlan[]>>('/planning');
    return data.data;
  });

interface PlanInput {
  title: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  revenueTarget: number;
  salesTarget: number;
}

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: PlanInput) => {
      const { data } = await api.post<ApiResponse<BusinessPlan>>('/planning', input);
      return data.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('plans') }
  );
};

export const usePlanProgress = (id: string | undefined) =>
  useQuery(
    ['plan-progress', id],
    async () => {
      const { data } = await api.get(`/planning/${id}/progress`);
      return data.data;
    },
    { enabled: !!id }
  );

interface ForecastMonth {
  month: string;
  projectedRevenue: number;
}

export const useSalesForecast = () =>
  useQuery<{ forecast: ForecastMonth[]; note?: string }>('sales-forecast', async () => {
    const { data } = await api.get('/planning/forecast/sales');
    return data.data;
  });

interface Kpis {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  customerRetentionRate: number;
  returnRate: number;
}

export const useBusinessKpis = () =>
  useQuery<Kpis>('business-kpis', async () => {
    const { data } = await api.get('/planning/kpis');
    return data.data;
  });
