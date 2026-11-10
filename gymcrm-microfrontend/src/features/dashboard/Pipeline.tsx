import { AggregatedData, ServiceName } from '../../shared/api/types';

interface Props { data: AggregatedData; ms: number }

const SERVICES: { key: ServiceName; name: string; store: string }[] = [
  { key: 'products', name: 'Estoque', store: 'MongoDB' },
  { key: 'enrollments', name: 'Matrículas', store: 'Azure SQL' },
  { key: 'enrichment', name: 'Cálculo financeiro', store: 'Azure Function' },
];

function metric(key: ServiceName, data: AggregatedData): string {
  if (key === 'products') return `${data.products.length} ${data.products.length === 1 ? 'item' : 'itens'}`;
  if (key === 'enrollments') return `${data.enrollments.length} ${data.enrollments.length === 1 ? 'matrícula' : 'matrículas'}`;
  const n = data.enrichment?.enrollmentCount;
  return data.enrichment ? `${n} ${n === 1 ? 'matrícula calculada' : 'matrículas calculadas'}` : 'sem cálculo';
}

/** Mostra, para esta resposta do BFF, quais serviços responderam. */
export function Pipeline({ data, ms }: Props) {
  const failed = new Map(data.meta.errors.map((e) => [e.service, e.message]));
  return (
    <section className="pipeline" aria-label="Estado dos serviços nesta consulta">
      <div className="pipeline-source">
        <span className="pipeline-label">Uma consulta ao BFF</span>
        <span className="pipeline-time">{ms} ms</span>
      </div>
      <ul className="pipeline-list">
        {SERVICES.map((s) => {
          const error = failed.get(s.key);
          return (
            <li key={s.key} className={`pipeline-node ${error ? 'is-down' : 'is-up'}`}>
              <span className="node-dot" aria-hidden="true" />
              <span className="node-name">{s.name}</span>
              <span className="node-store">{s.store}</span>
              <span className="node-metric">{error ? 'não respondeu' : metric(s.key, data)}</span>
              <span className="sr-only">{error ? `Falhou: ${error}` : 'Respondeu normalmente'}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
