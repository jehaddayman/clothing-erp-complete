import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders, useUpdateOrderStatus, useUpdatePaymentStatus, downloadInvoice } from '../../hooks/useOrders';
import { Customer, Order, OrderStatus } from '../../types';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import CreateOrderForm from './CreateOrderForm';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'];

export default function OrdersPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useOrders({ page, limit: 10, status: statusFilter || undefined });
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePaymentStatus();

  const canEditPayment = hasRole('admin', 'accountant');
  const canCreate = hasRole('admin', 'sales_employee');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.orders')}</h1>
        {canCreate && (
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            + New Order
          </button>
        )}
      </div>

      <select
        className="input max-w-xs"
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value as OrderStatus | '');
          setPage(1);
        }}
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="card overflow-x-auto p-0">
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>{t('common.status')}</th>
              <th>Payment</th>
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
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  {t('common.noResults')}
                </td>
              </tr>
            ) : (
              data?.items.map((o: Order) => (
                <tr key={o._id}>
                  <td className="font-mono text-xs">{o.orderNumber}</td>
                  <td>{(o.customer as Customer)?.name || 'N/A'}</td>
                  <td>{formatCurrency(o.total)}</td>
                  <td>
                    <select
                      className="rounded-md border border-gray-300 bg-transparent px-1 py-0.5 text-xs dark:border-gray-700"
                      value={o.status}
                      onChange={(e) =>
                        updateStatus.mutate({ id: o._id, status: e.target.value as OrderStatus })
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {canEditPayment ? (
                      <select
                        className="rounded-md border border-gray-300 bg-transparent px-1 py-0.5 text-xs dark:border-gray-700"
                        value={o.paymentStatus}
                        onChange={(e) =>
                          updatePayment.mutate({ id: o._id, paymentStatus: e.target.value as any })
                        }
                      >
                        <option value="unpaid">unpaid</option>
                        <option value="paid">paid</option>
                        <option value="partial">partial</option>
                        <option value="refunded">refunded</option>
                      </select>
                    ) : (
                      <StatusBadge status={o.paymentStatus} />
                    )}
                  </td>
                  <td>
                    <button
                      className="text-primary-600 hover:underline"
                      onClick={() => downloadInvoice(o._id, o.orderNumber)}
                    >
                      Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data && (
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
        )}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Order">
        <CreateOrderForm onClose={() => setCreateOpen(false)} />
      </Modal>
    </div>
  );
}
