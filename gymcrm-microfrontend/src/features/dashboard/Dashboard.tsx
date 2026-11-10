import { brl, dateOnly, PERIOD_LABEL } from '../../shared/api/format';
import { useResource } from '../../shared/api/useResource';
import { EmptyState, ErrorNotice, PageHead, StatusChip } from '../../shared/ui/components';
import { getAggregatedData } from './dashboard.api';
import { Pipeline } from './Pipeline';
import { Receipt } from './Receipt';

export function Dashboard() {
  const { data: result, error, loading, reload } = useResource(getAggregatedData);

  return (
    <>
      <PageHead
        title="Painel"
        action={<button className="btn" onClick={reload} disabled={loading}>{loading ? 'Atualizando…' : 'Atualizar'}</button>}
      />
      {error && <ErrorNotice error={error} onRetry={reload} />}
      {!result && loading && <p className="muted" role="status">Consultando o BFF…</p>}
      {result && (
        <>
          <Pipeline data={result.data} ms={result.ms} />
          {result.data.meta.partial && (
            <div className="notice notice-warn" role="status">
              <p>Resposta parcial: alguns serviços não responderam, então parte dos dados abaixo está vazia.</p>
              <ul>{result.data.meta.errors.map((e) => <li key={e.service}>{e.message}</li>)}</ul>
            </div>
          )}
          <div className="dashboard-grid">
            <section aria-labelledby="enrollments-title">
              <h2 id="enrollments-title">Matrículas</h2>
              {result.data.enrollments.length === 0 ? (
                <EmptyState title="Nenhuma matrícula ainda">Crie a primeira na aba Matrículas.</EmptyState>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Nº</th><th>Aluno</th><th>Plano</th><th className="num">Total</th><th>Status</th><th>Vigência até</th></tr>
                    </thead>
                    <tbody>
                      {result.data.enrollments.map((e) => (
                        <tr key={e.id}>
                          <td>#{e.id}</td>
                          <td>{e.studentName}</td>
                          <td>{e.planName} · {PERIOD_LABEL[e.period]}</td>
                          <td className="num">{brl(e.total)}</td>
                          <td><StatusChip status={e.status} /></td>
                          <td>{dateOnly(e.endDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {result.data.lowStockProducts.length > 0 && (
                <div className="notice notice-warn" role="status" aria-label="Alertas de estoque">
                  <p><strong>Estoque baixo:</strong> repor os itens abaixo do mínimo.</p>
                  <ul>
                    {result.data.lowStockProducts.map((p) => (
                      <li key={p.id}>{p.name}: saldo {p.stock} (mínimo {p.minStock})</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
            {result.data.enrichment && <Receipt enrichment={result.data.enrichment} />}
          </div>
        </>
      )}
    </>
  );
}
