import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShipments, useCreateShipment, useUpdateShipmentStatus, Shipment } from '../../hooks/useShipping';
import { useOrders } from '../../hooks/useOrders';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/currency';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'returned'];

function CreateShipmentForm({ onClose }: { onClose: () => void }) {
  const { data: ordersData } = useOrders({ limit: 50 });
  const createShipment = useCreateShipment();

  const [order, setOrder] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [trackingNumber, setTrackingNumber] = useState('');

  const submit = async () => {
    if (!order || !shippingCompany) return;
    await createShipment.mutateAsync({ order, shippingCompany, shippingCost, trackingNumber });
    onClose();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Order</label>
        <select className="input" value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="">Select order...</option>
          {ordersData?.items.map((o) => (
            <option key={o._id} value={o._id}>
              {o.orderNumber} — {formatCurrency(o.total)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Shipping Company</label>
        <input className="input" value={shippingCompany} onChange={(e) => setShippingCompany(e.target.value)} />
      </div>
      <div>
        <label className="label">Shipping Cost</label>
        <input
          type="number"
          className="input"
          value={shippingCost}
          onChange={(e) => setShippingCost(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="label">Tracking Number</label>
        <input className="input" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={submit} disabled={createShipment.isLoading}>
          Create
        </button>
      </div>
    </div>
  );
}

export default function ShippingPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useShipments({ page, limit: 10, status: status || undefined });
  const updateStatus = useUpdateShipmentStatus();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.shipping')}</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + New Shipment
        </button>
      </div>

      <select
        className="input max-w-xs"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
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
              <th>Company</th>
              <th>Tracking #</th>
              <th>Cost</th>
              <th>{t('common.status')}</th>
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
              data?.items.map((s: Shipment) => (
                <tr key={s._id}>
                  <td className="font-mono text-xs">
                    {typeof s.order === 'object' ? s.order.orderNumber : s.order}
                  </td>
                  <td>{s.shippingCompany}</td>
                  <td>{s.trackingNumber || '-'}</td>
                  <td>{formatCurrency(s.shippingCost)}</td>
                  <td>
                    <select
                      className="rounded-md border border-gray-300 bg-transparent px-1 py-0.5 text-xs dark:border-gray-700"
                      value={s.status}
                      onChange={(e) => updateStatus.mutate({ id: s._id, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Shipment">
        <CreateShipmentForm onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
