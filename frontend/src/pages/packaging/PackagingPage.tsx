import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMaterials, useCreateMaterial, useRestockMaterial, useConsumptionReport } from '../../hooks/usePackaging';
import Modal from '../../components/Modal';
import { formatCurrency } from '../../utils/currency';

function CreateMaterialForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const create = useCreateMaterial();
  const onSubmit = async (values: any) => {
    await create.mutateAsync({ ...values, costPerUnit: Number(values.costPerUnit) });
    onClose();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="label">Name</label>
        <input className="input" {...register('name', { required: true })} />
      </div>
      <div>
        <label className="label">Unit</label>
        <input className="input" placeholder="e.g. box, roll, piece" {...register('unit', { required: true })} />
      </div>
      <div>
        <label className="label">Cost Per Unit</label>
        <input type="number" step="0.01" className="input" {...register('costPerUnit', { required: true })} />
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

export default function PackagingPage() {
  const { t } = useTranslation();
  const { data: materials, isLoading } = useMaterials();
  const { data: consumption } = useConsumptionReport();
  const restock = useRestockMaterial();
  const [modalOpen, setModalOpen] = useState(false);
  const [restockQty, setRestockQty] = useState<Record<string, number>>({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.packaging')}</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + New Material
        </button>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>Material</th>
              <th>Unit</th>
              <th>Cost/Unit</th>
              <th>In Stock</th>
              <th>{t('common.actions')}</th>
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
              materials?.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{m.unit}</td>
                  <td>{formatCurrency(m.costPerUnit)}</td>
                  <td className={m.quantityInStock <= m.reorderThreshold ? 'font-semibold text-red-600' : ''}>
                    {m.quantityInStock}
                  </td>
                  <td className="flex items-center gap-2">
                    <input
                      type="number"
                      className="input w-20"
                      placeholder="Qty"
                      value={restockQty[m._id] || ''}
                      onChange={(e) =>
                        setRestockQty((prev) => ({ ...prev, [m._id]: Number(e.target.value) }))
                      }
                    />
                    <button
                      className="text-primary-600 hover:underline"
                      onClick={() =>
                        restock.mutate({ id: m._id, quantity: restockQty[m._id] || 0 })
                      }
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto p-0">
        <h2 className="px-4 pt-4 text-base font-semibold">Consumption Report</h2>
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>Material</th>
              <th>Total Used</th>
              <th>Total Cost</th>
              <th>Usage Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {consumption?.map((row, i) => (
              <tr key={i}>
                <td>{row.materialName}</td>
                <td>{row.totalQuantityUsed}</td>
                <td>{formatCurrency(row.totalCost)}</td>
                <td>{row.usageCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Packaging Material">
        <CreateMaterialForm onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
