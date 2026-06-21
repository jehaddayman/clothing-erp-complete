import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useSuppliers,
  useCreateSupplier,
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useReceivePurchaseOrder,
} from '../../hooks/useSuppliers';
import { useProducts } from '../../hooks/useProducts';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/currency';

function CreateSupplierForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const create = useCreateSupplier();
  const onSubmit = async (values: any) => {
    await create.mutateAsync(values);
    onClose();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="label">Name</label>
        <input className="input" {...register('name', { required: true })} />
      </div>
      <div>
        <label className="label">Phone</label>
        <input className="input" {...register('phone', { required: true })} />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input" {...register('email')} />
      </div>
      <div>
        <label className="label">Contact Person</label>
        <input className="input" {...register('contactPerson')} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          Save
        </button>
      </div>
    </form>
  );
}

function CreatePOForm({ onClose }: { onClose: () => void }) {
  const { data: suppliers } = useSuppliers();
  const { data: productsData } = useProducts({ limit: 100 });
  const createPO = useCreatePurchaseOrder();

  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1, unitCost: 0 }]);

  const addItem = () => setItems((prev) => [...prev, { product: '', quantity: 1, unitCost: 0 }]);
  const updateItem = (i: number, field: string, value: string | number) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  const submit = async () => {
    const valid = items.filter((i) => i.product && i.quantity > 0);
    if (!supplier || valid.length === 0) return;
    await createPO.mutateAsync({ supplier, items: valid });
    onClose();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Supplier</label>
        <select className="input" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
          <option value="">Select supplier...</option>
          {suppliers?.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <select
            className="input"
            value={item.product}
            onChange={(e) => updateItem(i, 'product', e.target.value)}
          >
            <option value="">Product...</option>
            {productsData?.items.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="input w-20"
            value={item.quantity}
            onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
          />
          <input
            type="number"
            className="input w-24"
            placeholder="Unit cost"
            value={item.unitCost}
            onChange={(e) => updateItem(i, 'unitCost', Number(e.target.value))}
          />
        </div>
      ))}
      <button type="button" className="text-sm text-primary-600 hover:underline" onClick={addItem}>
        + Add item
      </button>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={submit} disabled={createPO.isLoading}>
          Create PO
        </button>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const { t } = useTranslation();
  const { data: suppliers, isLoading } = useSuppliers();
  const { data: posData } = usePurchaseOrders();
  const receivePO = useReceivePurchaseOrder();

  const [supplierModal, setSupplierModal] = useState(false);
  const [poModal, setPoModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.suppliers')}</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setSupplierModal(true)}>
            + New Supplier
          </button>
          <button className="btn-primary" onClick={() => setPoModal(true)}>
            + New Purchase Order
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Purchased</th>
              <th>Outstanding Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  {t('common.loading')}
                </td>
              </tr>
            ) : (
              suppliers?.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.phone}</td>
                  <td>{formatCurrency(s.totalPurchased)}</td>
                  <td className={s.outstandingBalance > 0 ? 'text-amber-600' : ''}>
                    {formatCurrency(s.outstandingBalance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto p-0">
        <h2 className="px-4 pt-4 text-base font-semibold">Purchase Orders</h2>
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>PO #</th>
              <th>Supplier</th>
              <th>Amount</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {posData?.items.map((po) => (
              <tr key={po._id}>
                <td className="font-mono text-xs">{po.poNumber}</td>
                <td>{typeof po.supplier === 'object' ? po.supplier.name : po.supplier}</td>
                <td>{formatCurrency(po.totalAmount)}</td>
                <td>
                  <StatusBadge status={po.status} />
                </td>
                <td>
                  {po.status !== 'received' && (
                    <button
                      className="text-primary-600 hover:underline"
                      onClick={() => receivePO.mutate(po._id)}
                    >
                      Mark Received
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={supplierModal} onClose={() => setSupplierModal(false)} title="New Supplier">
        <CreateSupplierForm onClose={() => setSupplierModal(false)} />
      </Modal>
      <Modal isOpen={poModal} onClose={() => setPoModal(false)} title="New Purchase Order">
        <CreatePOForm onClose={() => setPoModal(false)} />
      </Modal>
    </div>
  );
}
