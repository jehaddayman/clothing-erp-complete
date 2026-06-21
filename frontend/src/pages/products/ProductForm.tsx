import { useForm } from 'react-hook-form';
import { Product } from '../../types';
import { ProductInput } from '../../hooks/useProducts';

interface ProductFormProps {
  initial?: Product;
  onSubmit: (values: Partial<ProductInput>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ProductForm({ initial, onSubmit, onCancel, isSubmitting }: ProductFormProps) {
  const { register, handleSubmit } = useForm<Partial<ProductInput>>({
    defaultValues: initial
      ? {
          name: initial.name,
          sku: initial.sku,
          barcode: initial.barcode,
          category: initial.category,
          brand: initial.brand,
          color: initial.color,
          size: initial.size,
          costPrice: initial.costPrice,
          sellingPrice: initial.sellingPrice,
          quantity: initial.quantity,
          lowStockThreshold: initial.lowStockThreshold,
        }
      : { lowStockThreshold: 10, quantity: 0 },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="grid grid-cols-2 gap-3"
    >
      <div className="col-span-2">
        <label className="label">Name</label>
        <input className="input" {...register('name', { required: true })} />
      </div>

      <div>
        <label className="label">SKU</label>
        <input className="input" disabled={!!initial} {...register('sku', { required: true })} />
      </div>
      <div>
        <label className="label">Barcode</label>
        <input className="input" {...register('barcode')} />
      </div>

      <div>
        <label className="label">Category</label>
        <input className="input" {...register('category', { required: true })} />
      </div>
      <div>
        <label className="label">Brand</label>
        <input className="input" {...register('brand')} />
      </div>

      <div>
        <label className="label">Color</label>
        <input className="input" {...register('color')} />
      </div>
      <div>
        <label className="label">Size</label>
        <input className="input" {...register('size')} />
      </div>

      <div>
        <label className="label">Cost Price</label>
        <input
          type="number"
          step="0.01"
          className="input"
          {...register('costPrice', { required: true, valueAsNumber: true })}
        />
      </div>
      <div>
        <label className="label">Selling Price</label>
        <input
          type="number"
          step="0.01"
          className="input"
          {...register('sellingPrice', { required: true, valueAsNumber: true })}
        />
      </div>

      <div>
        <label className="label">Quantity</label>
        <input
          type="number"
          className="input"
          {...register('quantity', { valueAsNumber: true })}
        />
      </div>
      <div>
        <label className="label">Low Stock Threshold</label>
        <input
          type="number"
          className="input"
          {...register('lowStockThreshold', { valueAsNumber: true })}
        />
      </div>

      <div className="col-span-2 mt-2 flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
