import { useState } from 'react';
import { ApiError } from '../../shared/api/client';
import { brl, CATEGORY_LABEL } from '../../shared/api/format';
import { Product, ProductInput } from '../../shared/api/types';
import { useResource } from '../../shared/api/useResource';
import { EmptyState, ErrorNotice, PageHead } from '../../shared/ui/components';
import { createProduct, deleteProduct, listProducts, updateProduct } from './stock.api';
import { StockForm } from './StockForm';

type Editing = { mode: 'new' } | { mode: 'edit'; product: Product } | null;

export function StockPage() {
  const { data: products, error, loading, reload } = useResource(listProducts);
  const [editing, setEditing] = useState<Editing>(null);
  const [actionError, setActionError] = useState<ApiError | null>(null);

  async function save(input: ProductInput) {
    if (editing?.mode === 'edit') await updateProduct(editing.product.id, input);
    else await createProduct(input);
    setEditing(null);
    reload();
  }

  async function remove(p: Product) {
    if (!window.confirm(`Excluir o item "${p.name}"?`)) return;
    setActionError(null);
    try {
      await deleteProduct(p.id);
      reload();
    } catch (e) {
      setActionError(e instanceof ApiError ? e : new ApiError(0, 'UNKNOWN', String(e)));
    }
  }

  return (
    <>
      <PageHead title="Estoque" action={!editing && <button className="btn" onClick={() => setEditing({ mode: 'new' })}>Novo item</button>} />
      {editing && (
        <StockForm
          key={editing.mode === 'edit' ? editing.product.id : 'new'}
          initial={editing.mode === 'edit' ? editing.product : undefined}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      )}
      {error && <ErrorNotice error={error} onRetry={reload} />}
      {actionError && <ErrorNotice error={actionError} />}
      {loading && !products && <p className="muted" role="status">Carregando estoque…</p>}
      {products && products.length === 0 && (
        <EmptyState title="Nenhum item cadastrado">Use “Novo item” para cadastrar o primeiro.</EmptyState>
      )}
      {products && products.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Categoria</th><th className="num">Preço</th><th className="num">Saldo</th><th className="num">Mínimo</th><th><span className="sr-only">Ações</span></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong>{p.description && <span className="cell-sub">{p.description}</span>}</td>
                  <td>{CATEGORY_LABEL[p.category] ?? p.category}</td>
                  <td className="num">{brl(p.price)}</td>
                  <td className="num">{p.lowStock ? <span className="chip chip-lowstock">Baixo: {p.stock}</span> : p.stock}</td>
                  <td className="num">{p.minStock}</td>
                  <td className="actions">
                    <button className="btn btn-quiet" onClick={() => setEditing({ mode: 'edit', product: p })}>Editar</button>
                    <button className="btn btn-danger" onClick={() => remove(p)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
