import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../../hooks/useProducts';
import { useInventoryLogs, useStockIn, useStockOut, useMarkDamaged } from '../../hooks/useInventory';
import Pagination from '../../components/Pagination';

type MovementType = 'stock-in' | 'stock-out' | 'damaged';

export default function InventoryPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data: logsData, isLoading } = useInventoryLogs({ page, limit: 15 });
  const { data: productsData } = useProducts({ limit: 100 });

  const [movementType, setMovementType] = useState<MovementType>('stock-in');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const stockIn = useStockIn();
  const stockOut = useStockOut();
  const markDamaged = useMarkDamaged();

  const mutationMap = { 'stock-in': stockIn, 'stock-out': stockOut, damaged: markDamaged };
  const activeMutation = mutationMap[movementType];

  const submit = async () => {
    setFeedback(null);
    if (!product || quantity <= 0) {
      setFeedback('Select a product and a valid quantity.');
      return;
    }
    try {
      await activeMutation.mutateAsync({ product, quantity, reason: reason || undefined });
      setFeedback('Movement recorded successfully.');
      setQuantity(1);
      setReason('');
    } catch (err: any) {
      setFeedback(err?.response?.data?.message || 'Failed to record movement');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('nav.inventory')}</h1>

      <div className="card">
        <h2 className="mb-3 text-base font-semibold">Record Stock Movement</h2>
        {feedback && (
          <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800/50">{feedback}</div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <select
            className="input"
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as MovementType)}
          >
            <option value="stock-in">Stock In</option>
            <option value="stock-out">Stock Out</option>
            <option value="damaged">Damaged</option>
          </select>

          <select className="input sm:col-span-1" value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="">Select product...</option>
            {productsData?.items.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            className="input"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <input
            className="input"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button className="btn-primary" onClick={submit} disabled={activeMutation.isLoading}>
            {activeMutation.isLoading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <h2 className="px-4 pt-4 text-base font-semibold">Movement History</h2>
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Change</th>
              <th>Qty After</th>
              <th>Reason</th>
              <th>Date</th>
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
              logsData?.items.map((log) => (
                <tr key={log._id}>
                  <td>{typeof log.product === 'object' ? `${log.product.name} (${log.product.sku})` : log.product}</td>
                  <td className="capitalize">{log.type.replace('_', ' ')}</td>
                  <td className={log.quantityChange >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {log.quantityChange >= 0 ? '+' : ''}
                    {log.quantityChange}
                  </td>
                  <td>{log.quantityAfter}</td>
                  <td>{log.reason || '-'}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {logsData && (
          <Pagination page={logsData.pagination.page} totalPages={logsData.pagination.totalPages} onChange={setPage} />
        )}
      </div>
    </div>
  );
}
