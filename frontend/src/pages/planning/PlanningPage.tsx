import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlans, useCreatePlan, useSalesForecast, useBusinessKpis, usePlanProgress } from '../../hooks/usePlanning';
import KpiCard from '../../components/KpiCard';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/currency';

function CreatePlanForm({ onClose }: { onClose: () => void }) {
  const create = useCreatePlan();
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenueTarget, setRevenueTarget] = useState(0);
  const [salesTarget, setSalesTarget] = useState(0);

  const submit = async () => {
    if (!title || !startDate || !endDate) return;
    await create.mutateAsync({ title, period, startDate, endDate, revenueTarget, salesTarget });
    onClose();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="label">Period</label>
        <select className="input" value={period} onChange={(e) => setPeriod(e.target.value as any)}>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Start Date</label>
          <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="label">End Date</label>
          <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Revenue Target</label>
          <input
            type="number"
            className="input"
            value={revenueTarget}
            onChange={(e) => setRevenueTarget(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Sales Target (orders)</label>
          <input
            type="number"
            className="input"
            value={salesTarget}
            onChange={(e) => setSalesTarget(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={submit} disabled={create.isLoading}>
          Create Plan
        </button>
      </div>
    </div>
  );
}

function PlanProgressModal({ planId, onClose }: { planId: string; onClose: () => void }) {
  const { data: progress, isLoading } = usePlanProgress(planId);

  return (
    <Modal isOpen onClose={onClose} title="Plan Progress">
      {isLoading || !progress ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Actual Revenue</span>
            <span className="font-semibold">{formatCurrency(progress.actualRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Revenue Progress</span>
            <span className="font-semibold">{progress.revenueProgress.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Actual Orders</span>
            <span className="font-semibold">{progress.actualOrders}</span>
          </div>
          <div className="flex justify-between">
            <span>Sales Progress</span>
            <span className="font-semibold">{progress.salesProgress.toFixed(1)}%</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function PlanningPage() {
  const { t } = useTranslation();
  const { data: plans, isLoading } = usePlans();
  const { data: forecast } = useSalesForecast();
  const { data: kpis } = useBusinessKpis();

  const [modalOpen, setModalOpen] = useState(false);
  const [progressPlanId, setProgressPlanId] = useState<string | undefined>(undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.planning')}</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + New Plan
        </button>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="Total Revenue" value={formatCurrency(kpis.totalRevenue)} accent="primary" />
          <KpiCard label="Total Orders" value={kpis.totalOrders} accent="primary" />
          <KpiCard label="Avg Order Value" value={formatCurrency(kpis.avgOrderValue)} accent="primary" />
          <KpiCard label="Customers" value={kpis.totalCustomers} accent="primary" />
          <KpiCard label="Retention Rate" value={`${kpis.customerRetentionRate.toFixed(1)}%`} accent="green" />
          <KpiCard label="Return Rate" value={`${kpis.returnRate.toFixed(1)}%`} accent="amber" />
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <h2 className="px-4 pt-4 text-base font-semibold">Business Plans</h2>
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>Title</th>
              <th>Period</th>
              <th>Revenue Target</th>
              <th>Sales Target</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  {t('common.loading')}
                </td>
              </tr>
            ) : (
              plans?.map((p) => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td className="capitalize">{p.period}</td>
                  <td>{formatCurrency(p.revenueTarget)}</td>
                  <td>{p.salesTarget}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>
                    <button
                      className="text-primary-600 hover:underline"
                      onClick={() => setProgressPlanId(p._id)}
                    >
                      View Progress
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {forecast && (
        <div className="card overflow-x-auto p-0">
          <h2 className="px-4 pt-4 text-base font-semibold">Sales Forecast</h2>
          {forecast.note ? (
            <p className="p-4 text-sm text-gray-400">{forecast.note}</p>
          ) : (
            <table className="table-base w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th>Month</th>
                  <th>Projected Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {forecast.forecast.map((f, i) => (
                  <tr key={i}>
                    <td>{f.month}</td>
                    <td>{formatCurrency(f.projectedRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Business Plan">
        <CreatePlanForm onClose={() => setModalOpen(false)} />
      </Modal>

      {progressPlanId && (
        <PlanProgressModal planId={progressPlanId} onClose={() => setProgressPlanId(undefined)} />
      )}
    </div>
  );
}
