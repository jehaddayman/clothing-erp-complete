import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCashTransactions,
  useCashPosition,
  useRecordCashTransaction,
  useCashFlowForecast,
} from '../../hooks/useCashFlow';
import KpiCard from '../../components/KpiCard';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { formatCurrency } from '../../utils/currency';

const CATEGORIES = [
  'sales_revenue', 'supplier_payment', 'salary', 'rent', 'utilities', 'shipping_expense',
  'packaging_expense', 'marketing', 'refund', 'other_income', 'other_expense',
];

function RecordTransactionForm({ onClose }: { onClose: () => void }) {
  const record = useRecordCashTransaction();
  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');

  const submit = async () => {
    if (amount <= 0) return;
    await record.mutateAsync({ direction, category, amount, description });
    onClose();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Direction</label>
        <select className="input" value={direction} onChange={(e) => setDirection(e.target.value as any)}>
          <option value="in">Cash In</option>
          <option value="out">Cash Out</option>
        </select>
      </div>
      <div>
        <label className="label">Category</label>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Amount</label>
        <input type="number" className="input" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <div>
        <label className="label">Description</label>
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={submit} disabled={record.isLoading}>
          Record
        </button>
      </div>
    </div>
  );
}

export default function CashflowPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: position } = useCashPosition();
  const { data: transactions, isLoading } = useCashTransactions({ page, limit: 10 });
  const { data: forecastData } = useCashFlowForecast();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.cashflow')}</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Record Transaction
        </button>
      </div>

      {position && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Cash In" value={formatCurrency(position.cashIn)} icon="📥" accent="green" />
          <KpiCard label="Cash Out" value={formatCurrency(position.cashOut)} icon="📤" accent="red" />
          <KpiCard label="Net Cash" value={formatCurrency(position.netCash)} icon="🏦" accent="primary" />
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>Date</th>
              <th>Direction</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  {t('common.loading')}
                </td>
              </tr>
            ) : (
              transactions?.items.map((tx) => (
                <tr key={tx._id}>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td className={tx.direction === 'in' ? 'text-emerald-600' : 'text-red-600'}>
                    {tx.direction === 'in' ? 'In' : 'Out'}
                  </td>
                  <td className="capitalize">{tx.category.replace('_', ' ')}</td>
                  <td>{formatCurrency(tx.amount)}</td>
                  <td>{tx.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {transactions && (
          <Pagination
            page={transactions.pagination.page}
            totalPages={transactions.pagination.totalPages}
            onChange={setPage}
          />
        )}
      </div>

      {forecastData && (
        <div className="card overflow-x-auto p-0">
          <h2 className="px-4 pt-4 text-base font-semibold">3-Month Forecast</h2>
          <table className="table-base w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th>Month</th>
                <th>Projected Inflow</th>
                <th>Projected Outflow</th>
                <th>Projected Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {forecastData.forecast.map((f, i) => (
                <tr key={i}>
                  <td>{f.month}</td>
                  <td>{formatCurrency(f.projectedInflow)}</td>
                  <td>{formatCurrency(f.projectedOutflow)}</td>
                  <td className={f.projectedNet >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {formatCurrency(f.projectedNet)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Cash Transaction">
        <RecordTransactionForm onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
