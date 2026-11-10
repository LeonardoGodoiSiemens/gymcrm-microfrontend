import { ReactNode } from 'react';
import { STATUS_LABEL } from '../api/format';
import { ApiError } from '../api/client';
import { EnrollmentStatus } from '../api/types';

export function StatusChip({ status }: { status: EnrollmentStatus }) {
  return <span className={`chip chip-${status.toLowerCase()}`}>{STATUS_LABEL[status] ?? status}</span>;
}

export function ErrorNotice({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div className="notice notice-error" role="alert">
      <p>{error.message}</p>
      {onRetry && <button className="btn btn-quiet" onClick={onRetry}>Tentar de novo</button>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children && <p className="empty-body">{children}</p>}
    </div>
  );
}

export function PageHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {action}
    </div>
  );
}
