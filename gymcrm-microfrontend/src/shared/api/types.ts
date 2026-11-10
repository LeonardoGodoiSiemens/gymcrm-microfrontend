export const PRODUCT_CATEGORIES = ['SUPPLEMENT', 'ACCESSORY', 'APPAREL', 'MAINTENANCE', 'OTHER'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Item de estoque (MS Estoque / MongoDB). */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  minStock: number;
  lowStock: boolean;
  createdAt: string;
}

export const ENROLLMENT_STATUSES = ['ACTIVE', 'FROZEN', 'CANCELLED'] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const PLAN_PERIODS = ['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const;
export type PlanPeriod = (typeof PLAN_PERIODS)[number];

/** Matrícula do aluno (MS Matrículas / Azure SQL). */
export interface Enrollment {
  id: number;
  studentName: string;
  studentEmail: string;
  planName: string;
  period: PlanPeriod;
  monthlyPrice: number;
  total: number;
  status: EnrollmentStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
}

/** Resultado financeiro da Azure Function. */
export interface Enrichment {
  enrollmentCount: number;
  grossTotal: number;
  discount: number;
  discountedTotal: number;
  gatewayFee: number;
  netTotal: number;
  monthlyRecurring: number;
}

export type ServiceName = 'products' | 'enrollments' | 'enrichment';

export interface AggregatedData {
  products: Product[];
  lowStockProducts: Product[];
  enrollments: Enrollment[];
  enrichment: Enrichment | null;
  meta: { generatedAt: string; partial: boolean; errors: { service: ServiceName; message: string }[] };
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  minStock: number;
}
export interface EnrollmentInput {
  studentName: string;
  studentEmail: string;
  planName: string;
  period: PlanPeriod;
  monthlyPrice: number;
}
export interface EnrollmentUpdateInput extends EnrollmentInput { status: EnrollmentStatus }
