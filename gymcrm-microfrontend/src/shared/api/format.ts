import { EnrollmentStatus, PlanPeriod, ProductCategory } from './types';

const brlFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const brl = (n: number): string => brlFormat.format(n);

export const percent = (rate: number): string => `${Math.round(rate * 100)}%`;

export function dateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** Data sem horário (vigência da matrícula). */
export function dateOnly(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export const STATUS_LABEL: Record<EnrollmentStatus, string> = {
  ACTIVE: 'Ativa',
  FROZEN: 'Trancada',
  CANCELLED: 'Cancelada',
};

export const PERIOD_LABEL: Record<PlanPeriod, string> = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  ANNUAL: 'Anual',
};

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  SUPPLEMENT: 'Suplemento',
  ACCESSORY: 'Acessório',
  APPAREL: 'Vestuário',
  MAINTENANCE: 'Manutenção',
  OTHER: 'Outros',
};
