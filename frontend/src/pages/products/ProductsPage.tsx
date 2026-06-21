import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  ProductInput,
} from '../../hooks/useProducts';
import { Product } from '../../types';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import ProductForm from './ProductForm';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const canManage = hasRole('admin', 'inventory_manager');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);

  const { data, isLoading } = useProducts({ page, limit: 10, search, lowStockOnly });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Partial<ProductInput>) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deactivate this product?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.products')}</h1>
        {canManage && (
          <button className="btn-primary" onClick={openCreate}>
            + {t('common.create')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder={t('common.search') as string}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(1);
            }}
          />
          Low stock only
        </label>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Cost</th>
              <th>Price</th>
              <th>Qty</th>
              {canManage && <th>{t('common.actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  {t('common.loading')}
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  {t('common.noResults')}
                </td>
              </tr>
            ) : (
              data?.items.map((p) => (
                <tr key={p._id}>
                  <td className="font-mono text-xs">{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{formatCurrency(p.costPrice)}</td>
                  <td>{formatCurrency(p.sellingPrice)}</td>
                  <td>
                    <span className={p.quantity <= p.lowStockThreshold ? 'font-semibold text-red-600' : ''}>
                      {p.quantity}
                    </span>
                  </td>
                  {canManage && (
                    <td className="space-x-2 rtl:space-x-reverse">
                      <button className="text-primary-600 hover:underline" onClick={() => openEdit(p)}>
                        {t('common.edit')}
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(p._id)}
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data && (
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'New Product'}>
        <ProductForm
          initial={editing}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isLoading || updateMutation.isLoading}
        />
      </Modal>
    </div>
  );
}
