import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReturns, useCreateReturn, useUpdateReturnStatus, ReturnRecord } from '../../hooks/useReturns';
import { useOrders } from '../../hooks/useOrders';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/currency';

const REASONS = [
  'defective', 'wrong_item', 'wrong_size', 'not_as_described', 'changed_mind', 'damaged_in_transit', 'other',
];
const STATUSES = ['requested', 'approved', 'rejected', 'refunded', 'completed'];

function CreateReturnForm({ onClose }: { onClose: () => void }) {
  const { data: ordersData } = useOrders({ limit: 50 });
  const createReturn = useCreateReturn();

  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [type, setType] = useState<'product_return' | 'shipping_return'>('product_return');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const selectedOrder = ordersData?.items.find((o) => o._id === orderId);

  const submit = async () => {
    if (!selectedOrder) return;
    const items = Object.entries(itemQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([product, quantity]) => ({ product, quantity }));
    if (items.length === 0) return;

    await createReturn.mutateAsync({ order: orderId, type, reason, items });
    onClose();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Order</label>
        <select
          className="input"
          value={orderId}
          onChange={(e) => {
            setOrderId(e.target.value);
            setItemQuantities({});
          }}
        >
          <option value="">Select order...</option>
          {ordersData?.items.map((o) => (
            <option key={o._id} value={o._id}>
              {o.orderNumber}
            </option>
          ))}
        </select>
      </div>

      {selectedOrder && (
        <div className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
          <p className="text-xs text-gray-500">Select return quantities:</p>
          {selectedOrder.items.map((item) => (
            <div key={item.product} className="flex items-center justify-between gap-2 text-sm">
              <span>
                {item.name} (max {item.quantity})
              </span>
              <input
                type="number"
                min={0}
                max={item.quantity}
                className="input w-20"
                value={itemQuantities[item.product] || ''}
                onChange={(e) =>
                  setItemQuantities((prev) => ({ ...prev, [item.product]: Number(e.target.value) }))
                }
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="label">Type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="product_return">Product Return</option>
          <option value="shipping_return">Shipping Return</option>
        </select>
      </div>

      <div>
        <label className="label">Reason</label>
        <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={submit} disabled={createReturn.isLoading}>
          Create Return
        </button>
      </div>
    </div>
  );
}

export default function ReturnsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useReturns({ page, limit: 10, status: statusFilter || undefined });
  const updateStatus = useUpdateReturnStatus();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.returns')}</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + New Return
        </button>
      </div>

      <select
        className="input max-w-xs"
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
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
              <th>Type</th>
              <th>Reason</th>
              <th>Refund</th>
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
              data?.items.map((r: ReturnRecord) => (
                <tr key={r._id}>
                  <td className="font-mono text-xs">
                    {typeof r.order === 'object' ? r.order.orderNumber : r.order}
                  </td>
                  <td className="capitalize">{r.type.replace('_', ' ')}</td>
                  <td className="capitalize">{r.reason.replace('_', ' ')}</td>
                  <td>{formatCurrency(r.totalRefund)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    {r.status === 'requested' && (
                      <div className="flex gap-2">
                        <button
                          className="text-emerald-600 hover:underline"
                          onClick={() => updateStatus.mutate({ id: r._id, status: 'approved' })}
                        >
                          Approve
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => updateStatus.mutate({ id: r._id, status: 'rejected' })}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === 'approved' && (
                      <button
                        className="text-primary-600 hover:underline"
                        onClick={() => updateStatus.mutate({ id: r._id, status: 'refunded', restock: true })}
                      >
                        Refund & Restock
                      </button>
                    )}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Return">
        <CreateReturnForm onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
