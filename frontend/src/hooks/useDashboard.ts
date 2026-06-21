import { useQuery } from 'react-query';
import { api } from '../api/client';
import { ApiResponse, DashboardSummary } from '../types';

export const useDashboardSummary = () =>
  useQuery<DashboardSummary>('dashboard-summary', async () => {
    const { data } = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return data.data;
  });

interface MonthlySalesPoint {
  _id: number;
  revenue: number;
  orders: number;
}

export const useMonthlySales = (year: number) =>
  useQuery<MonthlySalesPoint[]>(['monthly-sales', year], async () => {
    const { data } = await api.get<ApiResponse<MonthlySalesPoint[]>>('/dashboard/sales-chart', {
      params: { year },
    });
    return data.data;
  });
