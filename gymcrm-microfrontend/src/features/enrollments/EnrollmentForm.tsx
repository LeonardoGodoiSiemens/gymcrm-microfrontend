import { FormEvent, useState } from 'react';
import { ApiError } from '../../shared/api/client';
import { brl, PERIOD_LABEL, STATUS_LABEL } from '../../shared/api/format';
import { ENROLLMENT_STATUSES, Enrollment, EnrollmentStatus, EnrollmentUpdateInput, PLAN_PERIODS, PlanPeriod } from '../../shared/api/types';
import { ErrorNotice } from '../../shared/ui/components';

interface Props {
  initial?: Enrollment;
  onSubmit: (input: EnrollmentUpdateInput) => Promise<void>;
  onCancel: () => void;
}

const MONTHS: Record<PlanPeriod, number> = { MONTHLY: 1, QUARTERLY: 3, ANNUAL: 12 };

export function EnrollmentForm({ initial, onSubmit, onCancel }: Props) {
  const [studentName, setStudentName] = useState(initial?.studentName ?? '');
  const [studentEmail, setStudentEmail] = useState(initial?.studentEmail ?? '');
  const [planName, setPlanName] = useState(initial?.planName ?? '');
  const [period, setPeriod] = useState<PlanPeriod>(initial?.period ?? 'MONTHLY');
  const [monthlyPrice, setMonthlyPrice] = useState(initial ? String(initial.monthlyPrice) : '');
  const [status, setStatus] = useState<EnrollmentStatus>(initial?.status ?? 'ACTIVE');
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  const total = Math.round((Number(monthlyPrice) * MONTHS[period] + Number.EPSILON) * 100) / 100;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        studentName: studentName.trim(), studentEmail: studentEmail.trim(), planName: planName.trim(),
        period, monthlyPrice: Number(monthlyPrice), status,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', String(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>{initial ? `Editar matrícula #${initial.id}` : 'Nova matrícula'}</h2>
      <div className="form-row">
        <label>Aluno
          <input value={studentName} onChange={(e) => setStudentName(e.target.value)} required maxLength={120} />
        </label>
        <label>E-mail do aluno
          <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required maxLength={160} />
        </label>
      </div>
      <label>Plano de treino/contrato
        <input value={planName} onChange={(e) => setPlanName(e.target.value)} required maxLength={120} placeholder="Ex.: Musculação + Aulas Coletivas" />
      </label>
      <div className="form-row">
        <label>Periodicidade
          <select value={period} onChange={(e) => setPeriod(e.target.value as PlanPeriod)}>
            {PLAN_PERIODS.map((p) => <option key={p} value={p}>{PERIOD_LABEL[p]}</option>)}
          </select>
        </label>
        <label>Mensalidade (R$)
          <input type="number" min="0" step="0.01" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} required />
        </label>
        {initial && (
          <label>Status
            <select value={status} onChange={(e) => setStatus(e.target.value as EnrollmentStatus)}>
              {ENROLLMENT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
        )}
      </div>
      <p className="form-total">Total do período: <strong>{Number.isFinite(total) ? brl(total) : '—'}</strong></p>
      {error && <ErrorNotice error={error} />}
      <div className="form-actions">
        <button className="btn" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar matrícula'}</button>
        <button className="btn btn-quiet" type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
