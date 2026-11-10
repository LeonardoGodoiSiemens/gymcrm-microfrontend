import { useState } from 'react';
import { ApiError } from '../../shared/api/client';
import { brl, dateOnly, PERIOD_LABEL } from '../../shared/api/format';
import { Enrollment, EnrollmentUpdateInput } from '../../shared/api/types';
import { useResource } from '../../shared/api/useResource';
import { EmptyState, ErrorNotice, PageHead, StatusChip } from '../../shared/ui/components';
import { createEnrollment, deleteEnrollment, listEnrollments, renewEnrollment, updateEnrollment } from './enrollments.api';
import { EnrollmentForm } from './EnrollmentForm';

type Editing = { mode: 'new' } | { mode: 'edit'; enrollment: Enrollment } | null;

export function EnrollmentsPage() {
  const enrollments = useResource(listEnrollments);
  const [editing, setEditing] = useState<Editing>(null);
  const [actionError, setActionError] = useState<ApiError | null>(null);

  async function save(input: EnrollmentUpdateInput) {
    const { status, ...create } = input;
    if (editing?.mode === 'edit') await updateEnrollment(editing.enrollment.id, input);
    else await createEnrollment(create);
    setEditing(null);
    enrollments.reload();
  }

  async function act(fn: () => Promise<unknown>) {
    setActionError(null);
    try {
      await fn();
      enrollments.reload();
    } catch (e) {
      setActionError(e instanceof ApiError ? e : new ApiError(0, 'UNKNOWN', String(e)));
    }
  }

  const remove = (e: Enrollment) => {
    if (window.confirm(`Excluir a matrícula #${e.id} de ${e.studentName}?`)) void act(() => deleteEnrollment(e.id));
  };

  return (
    <>
      <PageHead
        title="Matrículas"
        action={!editing && <button className="btn" onClick={() => setEditing({ mode: 'new' })}>Nova matrícula</button>}
      />
      {editing && (
        <EnrollmentForm
          key={editing.mode === 'edit' ? editing.enrollment.id : 'new'}
          initial={editing.mode === 'edit' ? editing.enrollment : undefined}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      )}
      {enrollments.error && <ErrorNotice error={enrollments.error} onRetry={enrollments.reload} />}
      {actionError && <ErrorNotice error={actionError} />}
      {enrollments.loading && !enrollments.data && <p className="muted" role="status">Carregando matrículas…</p>}
      {enrollments.data && enrollments.data.length === 0 && (
        <EmptyState title="Nenhuma matrícula ainda">Use “Nova matrícula” para matricular o primeiro aluno.</EmptyState>
      )}
      {enrollments.data && enrollments.data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nº</th><th>Aluno</th><th>Plano</th><th className="num">Mensalidade</th><th className="num">Total</th><th>Status</th><th>Vigência até</th><th><span className="sr-only">Ações</span></th></tr>
            </thead>
            <tbody>
              {enrollments.data.map((e) => (
                <tr key={e.id}>
                  <td>#{e.id}</td>
                  <td><strong>{e.studentName}</strong><span className="cell-sub">{e.studentEmail}</span></td>
                  <td>{e.planName}<span className="cell-sub">{PERIOD_LABEL[e.period]}</span></td>
                  <td className="num">{brl(e.monthlyPrice)}</td>
                  <td className="num">{brl(e.total)}</td>
                  <td><StatusChip status={e.status} /></td>
                  <td>{dateOnly(e.endDate)}</td>
                  <td className="actions">
                    <button className="btn btn-quiet" onClick={() => void act(() => renewEnrollment(e.id))} disabled={e.status === 'CANCELLED'}>Renovar</button>
                    <button className="btn btn-quiet" onClick={() => setEditing({ mode: 'edit', enrollment: e })}>Editar</button>
                    <button className="btn btn-danger" onClick={() => remove(e)}>Excluir</button>
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
