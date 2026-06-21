import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import KpiCard from '../../components/KpiCard';
import { useDashboardSummary, useMonthlySales } from '../../hooks/useDashboard';
import { formatCurrency } from '../../utils/currency';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data: summary, isLoading } = useDashboardSummary();
  const { data: monthly } = useMonthlySales(new Date().getFullYear());

  const chartData = (monthly || []).map((m) => ({
    month: MONTH_NAMES[m._id - 1],
    revenue: m.revenue,
    orders: m.orders,
  }));

  if (isLoading || !summary) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">{t('common.loading')}</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('dashboard.totalRevenue')} value={formatCurrency(summary.totalRevenue)} icon="💰" accent="primary" />
        <KpiCard label={t('dashboard.totalExpenses')} value={formatCurrency(summary.totalExpenses)} icon="📉" accent="red" />
        <KpiCard label={t('dashboard.netProfit')} value={formatCurrency(summary.netProfit)} icon="📈" accent="green" />
        <KpiCard label={t('dashboard.cashFlow')} value={formatCurrency(summary.cashFlow)} icon="🏦" accent="primary" />
        <KpiCard label={t('dashboard.inventoryValue')} value={formatCurrency(summary.inventoryValue)} icon="📦" accent="primary" />
        <KpiCard label={t('dashboard.totalProducts')} value={summary.totalProducts} icon="👕" accent="primary" />
        <KpiCard label={t('dashboard.lowStockAlerts')} value={summary.lowStockAlerts} icon="⚠️" accent="amber" />
        <KpiCard label={t('dashboard.pendingShipments')} value={summary.pendingShipments} icon="🚚" accent="amber" />
        <KpiCard label={t('dashboard.returnedOrders')} value={summary.returnedOrders} icon="↩️" accent="red" />
        <KpiCard
          label={t('dashboard.monthlySales')}
          value={`${formatCurrency(summary.monthlySales.revenue)} (${summary.monthlySales.orders})`}
          icon="🛒"
          accent="green"
        />
      </div>

      <div className="card">
        <h2 className="mb-4 text-base font-semibold">{t('dashboard.monthlySales')}</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#3478f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
