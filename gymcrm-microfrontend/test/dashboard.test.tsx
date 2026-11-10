import { render, screen, within } from '@testing-library/react';
import { Dashboard } from '../src/features/dashboard/Dashboard';
import { AggregatedData } from '../src/shared/api/types';

const product = { id: 'p1', name: 'Whey Protein', description: '', price: 150, stock: 1, category: 'SUPPLEMENT' as const, minStock: 3, lowStock: true, createdAt: '2026-11-01T10:00:00Z' };
const base: AggregatedData = {
  products: [product],
  lowStockProducts: [product],
  enrollments: [
    { id: 7, studentName: 'Maria Souza', studentEmail: 'm@e.com', planName: 'Musculação', period: 'QUARTERLY', monthlyPrice: 100, total: 300, status: 'ACTIVE', startDate: '2026-11-01T00:00:00Z', endDate: '2027-02-01T00:00:00Z', createdAt: '2026-11-02T10:00:00Z' },
    { id: 8, studentName: 'João Lima', studentEmail: 'j@e.com', planName: 'Crossfit', period: 'MONTHLY', monthlyPrice: 200, total: 200, status: 'FROZEN', startDate: '2026-11-01T00:00:00Z', endDate: '2026-12-01T00:00:00Z', createdAt: '2026-11-02T11:00:00Z' },
  ],
  enrichment: { enrollmentCount: 1, grossTotal: 300, discount: 15, discountedTotal: 285, gatewayFee: 8.52, netTotal: 276.48, monthlyRecurring: 95 },
  meta: { generatedAt: '2026-11-03T12:00:00Z', partial: false, errors: [] },
};

const mockFetch = (data: unknown, status = 200) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(data), { status })));
const text = (el: HTMLElement) => (el.textContent ?? '').replace(/\u00a0/g, ' ');

afterEach(() => vi.unstubAllGlobals());

describe('Dashboard', () => {
  it('shows the three services as up, the enrollments, the low-stock alert and the financial summary', async () => {
    mockFetch(base);
    render(<Dashboard />);

    const pipeline = await screen.findByRole('region', { name: /estado dos serviços/i });
    expect(text(pipeline)).toContain('2 matrículas');
    expect(text(pipeline)).toContain('1 item');
    expect(within(pipeline).getAllByText('Respondeu normalmente')).toHaveLength(3);

    expect(screen.getByText('#7')).toBeInTheDocument();
    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('Trancada')).toBeInTheDocument();

    const alert = screen.getByRole('status', { name: /alertas de estoque/i });
    expect(text(alert)).toContain('Whey Protein: saldo 1 (mínimo 3)');

    const receipt = screen.getByRole('region', { name: /resumo financeiro/i });
    expect(text(receipt)).toContain('R$ 276,48');
    expect(text(receipt)).toContain('R$ 95,00');
    expect(screen.queryByText(/resposta parcial/i)).not.toBeInTheDocument();
  });

  it('flags a partial response and names the failed service', async () => {
    mockFetch({
      ...base, enrollments: [], enrichment: null, lowStockProducts: [],
      meta: { generatedAt: 'x', partial: true, errors: [
        { service: 'enrollments', message: 'enrollments is unreachable: fetch failed' },
        { service: 'enrichment', message: 'skipped: enrollments are unavailable' },
      ] },
    });
    render(<Dashboard />);

    expect(await screen.findByText(/resposta parcial/i)).toBeInTheDocument();
    expect(screen.getByText('enrollments is unreachable: fetch failed')).toBeInTheDocument();
    const pipeline = screen.getByRole('region', { name: /estado dos serviços/i });
    expect(within(pipeline).getAllByText('não respondeu')).toHaveLength(2);
    expect(screen.getByText('Nenhuma matrícula ainda')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /resumo financeiro/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('status', { name: /alertas de estoque/i })).not.toBeInTheDocument();
  });

  it('shows a readable error when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<Dashboard />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível conectar à api/i);
    expect(screen.getByRole('button', { name: /tentar de novo/i })).toBeInTheDocument();
  });
});
