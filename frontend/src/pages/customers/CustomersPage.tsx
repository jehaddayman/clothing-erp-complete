import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCustomers, useCreateCustomer, useAddCustomerNote, CustomerInput } from '../../hooks/useCustomers';
import { Customer } from '../../types';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { formatCurrency } from '../../utils/currency';

function CreateCustomerForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<CustomerInput>();
  const createMutation = useCreateCustomer();

  const onSubmit = async (values: CustomerInput) => {
    await createMutation.mutateAsync(values);
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
        <input type="email" className="input" {...register('email')} />
      </div>
      <div>
        <label className="label">City</label>
        <input className="input" {...register('city')} />
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

function CustomerNotesPanel({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [text, setText] = useState('');
  const addNote = useAddCustomerNote();

  const submit = async () => {
    if (!text.trim()) return;
    await addNote.mutateAsync({ id: customer._id, text });
    setText('');
  };

  return (
    <div className="space-y-3">
      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-800">
        {customer.notes.length === 0 && <p className="text-sm text-gray-400">No notes yet.</p>}
        {customer.notes.map((n, i) => (
          <div key={i} className="text-sm">
            <p>{n.text}</p>
            <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note..." />
        <button className="btn-primary" onClick={submit} disabled={addNote.isLoading}>
          Add
        </button>
      </div>
      <div className="flex justify-end">
        <button className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [notesCustomer, setNotesCustomer] = useState<Customer | undefined>(undefined);

  const { data, isLoading } = useCustomers({ page, limit: 10, search });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.customers')}</h1>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          + {t('common.create')}
        </button>
      </div>

      <input
        className="input max-w-xs"
        placeholder={t('common.search') as string}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <div className="card overflow-x-auto p-0">
        <table className="table-base w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Total Spent</th>
              <th>Orders</th>
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
              data?.items.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.city || '-'}</td>
                  <td>{formatCurrency(c.totalSpent)}</td>
                  <td>{c.totalOrders}</td>
                  <td>
                    <button className="text-primary-600 hover:underline" onClick={() => setNotesCustomer(c)}>
                      Notes
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

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Customer">
        <CreateCustomerForm onClose={() => setCreateOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!notesCustomer}
        onClose={() => setNotesCustomer(undefined)}
        title={`Notes — ${notesCustomer?.name || ''}`}
      >
        {notesCustomer && <CustomerNotesPanel customer={notesCustomer} onClose={() => setNotesCustomer(undefined)} />}
      </Modal>
    </div>
  );
}
