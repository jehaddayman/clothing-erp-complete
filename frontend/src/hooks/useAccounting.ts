import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/client';
import { ApiResponse } from '../types';

export interface Account {
  _id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
}

export const useAccounts = (type?: string) =>
  useQuery<Account[]>(['accounts', type], async () => {
    const { data } = await api.get<ApiResponse<Account[]>>('/accounting/accounts', { params: { type } });
    return data.data;
  });

export const useSeedDefaultAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const { data } = await api.post('/accounting/accounts/seed-defaults');
      return data;
    },
    { onSuccess: () => queryClient.invalidateQueries('accounts') }
  );
};

interface JournalLineInput {
  account: string;
  debit?: number;
  credit?: number;
}

export const usePostJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: { description: string; lines: JournalLineInput[] }) => {
      const { data } = await api.post('/accounting/journal-entries', input);
      return data.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('accounts');
        queryClient.invalidateQueries('trial-balance');
        queryClient.invalidateQueries('profit-loss');
        queryClient.invalidateQueries('balance-sheet');
      },
    }
  );
};

interface TrialBalanceRow {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

export const useTrialBalance = () =>
  useQuery<{ rows: TrialBalanceRow[]; totalDebit: number; totalCredit: number; isBalanced: boolean }>(
    'trial-balance',
    async () => {
      const { data } = await api.get('/accounting/reports/trial-balance');
      return data.data;
    }
  );

interface PLData {
  revenue: { code: string; name: string; amount: number }[];
  expenses: { code: string; name: string; amount: number }[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export const useProfitAndLoss = () =>
  useQuery<PLData>('profit-loss', async () => {
    const { data } = await api.get('/accounting/reports/profit-loss');
    return data.data;
  });

interface BalanceSheetData {
  assets: { code: string; name: string; amount: number }[];
  liabilities: { code: string; name: string; amount: number }[];
  equity: { code: string; name: string; amount: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
}

export const useBalanceSheet = () =>
  useQuery<BalanceSheetData>('balance-sheet', async () => {
    const { data } = await api.get('/accounting/reports/balance-sheet');
    return data.data;
  });
