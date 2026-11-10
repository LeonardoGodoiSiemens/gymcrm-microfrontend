import { brl } from '../../shared/api/format';
import { Enrichment } from '../../shared/api/types';

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`receipt-line${strong ? ' receipt-total' : ''}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** Resultado da Azure Function, apresentado como um resumo financeiro das matrículas ativas. */
export function Receipt({ enrichment }: { enrichment: Enrichment }) {
  return (
    <section className="receipt" aria-labelledby="receipt-title">
      <h2 id="receipt-title">Resumo financeiro</h2>
      <p className="receipt-sub">Matrículas ativas ({enrichment.enrollmentCount}), calculadas pela Azure Function</p>
      <dl>
        <Line label="Receita bruta" value={brl(enrichment.grossTotal)} />
        <Line label="Desconto de fidelidade" value={`− ${brl(enrichment.discount)}`} />
        <Line label="Taxa do gateway" value={`− ${brl(enrichment.gatewayFee)}`} />
        <Line label="Receita líquida" value={brl(enrichment.netTotal)} strong />
        <Line label="Receita recorrente mensal" value={brl(enrichment.monthlyRecurring)} />
      </dl>
    </section>
  );
}
