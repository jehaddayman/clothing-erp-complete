import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAccounts,
  useSeedDefaultAccounts,
  usePostJournalEntry,
  useTrialBalance,
  useProfitAndLoss,
  useBalanceSheet,
} from '../../hooks/useAccounting';
import Modal from '../../components/Modal';
import { formatCurrency } from '../../utils/currency';

type Tab = 'accounts' | 'trial-balance' | 'profit-loss' | 'balance-sheet';

function JournalEntryForm({ onClose }: { onClose: () => void }) {
  const { data: accounts } = useAccounts();
  const postEntry = usePostJournalEntry();
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([
    { account: '', debit: 0, credit: 0 },
    { account: '', debit: 0, credit: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);

  const updateLine = (i: number, field: string, value: string | number) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  const addLine = () => setLines((prev) => [...prev, { account: '', debit: 0, credit: 0 }]);

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

  const submit = async () => {
    setError(null);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      setError('Total debits must equal total credits');
      return;
    }
    try {
      await postEntry.mutateAsync({ description, lines: lines.filter((l) => l.account) });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to post entry');
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <label className="label">Description</label>
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {lines.map((line, i) => (
        <div key={i} className="flex gap-2">
          <select
            className="input"
            value={line.account}
            onChange={(e) => updateLine(i, 'account', e.target.value)}
          >
            <option value="">Account...</option>
            {accounts?.map((a) => (
              <option key={a._id} value={a._id}>
                {a.code} - {a.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="input w-24"
            placeholder="Debit"
            value={line.debit || ''}
            onChange={(e) => updateLine(i, 'debit', Number(e.target.value))}
          />
          <input
            type="number"
            className="input w-24"
            placeholder="Credit"
            value={line.credit || ''}
            onChange={(e) => updateLine(i, 'credit', Number(e.target.value))}
          />
        </div>
      ))}
      <button type="button" className="text-sm text-primary-600 hover:underline" onClick={addLine}>
        + Add line
      </button>

      <div className="rounded-lg bg-gray-50 p-2 text-xs dark:bg-gray-800/50">
        Debit: {formatCurrency(totalDebit)} | Credit: {formatCurrency(totalCredit)}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={submit} disabled={postEntry.isLoading}>
          Post Entry
        </button>
      </div>
    </div>
  );
}

export default function AccountingPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('accounts');
  const [journalModal, setJournalModal] = useState(false);

  const { data: accounts } = useAccounts();
  const seedDefaults = useSeedDefaultAccounts();
  const { data: trialBalance } = useTrialBalance();
  const { data: pl } = useProfitAndLoss();
  const { data: bs } = useBalanceSheet();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'accounts', label: 'Chart of Accounts' },
    { key: 'trial-balance', label: 'Trial Balance' },
    { key: 'profit-loss', label: 'P&L' },
    { key: 'balance-sheet', label: 'Balance Sheet' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.accounting')}</h1>
        <div className="flex gap-2">
          {(!accounts || accounts.length === 0) && (
            <button className="btn-secondary" onClick={() => seedDefaults.mutate()}>
              Seed Default Accounts
            </button>
          )}
          <button className="btn-primary" onClick={() => setJournalModal(true)}>
            + Post Journal Entry
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === tb.key
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'accounts' && (
        <div className="card overflow-x-auto p-0">
          <table className="table-base w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {accounts?.map((a) => (
                <tr key={a._id}>
                  <td className="font-mono text-xs">{a.code}</td>
                  <td>{a.name}</td>
                  <td className="capitalize">{a.type}</td>
                  <td>{formatCurrency(a.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'trial-balance' && trialBalance && (
        <div className="card overflow-x-auto p-0">
          <table className="table-base w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {trialBalance.rows.map((r) => (
                <tr key={r.code}>
                  <td className="font-mono text-xs">{r.code}</td>
                  <td>{r.name}</td>
                  <td>{r.debit ? formatCurrency(r.debit) : '-'}</td>
                  <td>{r.credit ? formatCurrency(r.credit) : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 font-semibold dark:border-gray-800">
                <td colSpan={2}>Total</td>
                <td>{formatCurrency(trialBalance.totalDebit)}</td>
                <td>{formatCurrency(trialBalance.totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
          <p className={`px-4 py-2 text-xs ${trialBalance.isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
            {trialBalance.isBalanced ? '✓ Balanced' : '✗ Not balanced'}
          </p>
        </div>
      )}

      {tab === 'profit-loss' && pl && (
        <div className="card space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Revenue</h3>
            {pl.revenue.map((r) => (
              <div key={r.code} className="flex justify-between text-sm">
                <span>{r.name}</span>
                <span>{formatCurrency(r.amount)}</span>
              </div>
            ))}
            <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 text-sm font-semibold dark:border-gray-800">
              <span>Total Revenue</span>
              <span>{formatCurrency(pl.totalRevenue)}</span>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Expenses</h3>
            {pl.expenses.map((e) => (
              <div key={e.code} className="flex justify-between text-sm">
                <span>{e.name}</span>
                <span>{formatCurrency(e.amount)}</span>
              </div>
            ))}
            <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 text-sm font-semibold dark:border-gray-800">
              <span>Total Expenses</span>
              <span>{formatCurrency(pl.totalExpenses)}</span>
            </div>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Net Profit</span>
            <span className={pl.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {formatCurrency(pl.netProfit)}
            </span>
          </div>
        </div>
      )}

      {tab === 'balance-sheet' && bs && (
        <div className="card space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Assets</h3>
            {bs.assets.map((a) => (
              <div key={a.code} className="flex justify-between text-sm">
                <span>{a.name}</span>
                <span>{formatCurrency(a.amount)}</span>
              </div>
            ))}
            <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 text-sm font-semibold dark:border-gray-800">
              <span>Total Assets</span>
              <span>{formatCurrency(bs.totalAssets)}</span>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Liabilities</h3>
            {bs.liabilities.map((l) => (
              <div key={l.code} className="flex justify-between text-sm">
                <span>{l.name}</span>
                <span>{formatCurrency(l.amount)}</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Equity</h3>
            {bs.equity.map((e) => (
              <div key={e.code} className="flex justify-between text-sm">
                <span>{e.name}</span>
                <span>{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </div>
          <p className={`text-xs ${bs.isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
            {bs.isBalanced ? '✓ Balanced' : '✗ Not balanced'}
          </p>
        </div>
      )}

      <Modal isOpen={journalModal} onClose={() => setJournalModal(false)} title="Post Journal Entry">
        <JournalEntryForm onClose={() => setJournalModal(false)} />
      </Modal>
    </div>
  );
}
