import { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';
import { useCreateOrder } from '../../hooks/useOrders';

interface LineItem {
  product: string;
  quantity: number;
}

export default function CreateOrderForm({ onClose }: { onClose: () => void }) {
  const { data: customersData } = useCustomers({ limit: 100 });
  const { data: productsData } = useProducts({ limit: 100 });
  const createOrder = useCreateOrder();

  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ product: '', quantity: 1 }]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const products = productsData?.items || [];
  const customers = customersData?.items || [];

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { product: '', quantity: 1 }]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p._id === item.product);
    return sum + (product ? product.sellingPrice * item.quantity : 0);
  }, 0);

  const submit = async () => {
    setError(null);
    const validItems = items.filter((i) => i.product && i.quantity > 0);
    if (!customer || validItems.length === 0) {
      setError('Select a customer and at least one product line.');
      return;
    }
    try {
      await createOrder.mutateAsync({
        customer,
        items: validItems,
        discount,
        taxRate,
        shippingCost,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create order');
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="label">Customer</label>
        <select className="input" value={customer} onChange={(e) => setCustomer(e.target.value)}>
          <option value="">Select customer...</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} — {c.phone}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="label">Items</label>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select
              className="input"
              value={item.product}
              onChange={(e) => updateItem(idx, 'product', e.target.value)}
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku}) — {p.quantity} in stock
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              className="input w-20"
              value={item.quantity}
              onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
            />
            <button type="button" className="text-red-600" onClick={() => removeItem(idx)}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="text-sm text-primary-600 hover:underline" onClick={addItem}>
          + Add item
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="label">Discount</label>
          <input
            type="number"
            className="input"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Tax %</label>
          <input
            type="number"
            className="input"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Shipping</label>
          <input
            type="number"
            className="input"
            value={shippingCost}
            onChange={(e) => setShippingCost(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800/50">
        Subtotal: <span className="font-semibold">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={submit} disabled={createOrder.isLoading}>
          {createOrder.isLoading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </div>
  );
}
