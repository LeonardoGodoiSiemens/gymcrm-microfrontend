import { FormEvent, useState } from 'react';
import { ApiError } from '../../shared/api/client';
import { CATEGORY_LABEL } from '../../shared/api/format';
import { PRODUCT_CATEGORIES, Product, ProductCategory, ProductInput } from '../../shared/api/types';
import { ErrorNotice } from '../../shared/ui/components';

interface Props {
  initial?: Product;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
}

export function StockForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '0');
  const [minStock, setMinStock] = useState(initial ? String(initial.minStock) : '0');
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? 'SUPPLEMENT');
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), price: Number(price), stock: Number(stock), category, minStock: Number(minStock) });
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', String(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>{initial ? 'Editar item de estoque' : 'Novo item de estoque'}</h2>
      <label>Nome do item
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
      </label>
      <label>Descrição
        <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
      </label>
      <div className="form-row">
        <label>Categoria
          <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}>
            {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
        </label>
        <label>Preço (R$)
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>
        <label>Saldo em estoque
          <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </label>
        <label>Estoque mínimo
          <input type="number" min="0" step="1" value={minStock} onChange={(e) => setMinStock(e.target.value)} required />
        </label>
      </div>
      {error && <ErrorNotice error={error} />}
      <div className="form-actions">
        <button className="btn" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar item'}</button>
        <button className="btn btn-quiet" type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
