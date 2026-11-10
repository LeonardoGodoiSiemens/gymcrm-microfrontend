import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnrollmentForm } from '../src/features/enrollments/EnrollmentForm';
import { Enrollment } from '../src/shared/api/types';

const norm = (s: string | null) => (s ?? '').replace(/\u00a0/g, ' ');

describe('EnrollmentForm', () => {
  it('previews the period total according to the chosen periodicity', async () => {
    const user = userEvent.setup();
    render(<EnrollmentForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/mensalidade/i), '100');
    expect(norm(screen.getByText(/total do período/i).textContent)).toContain('R$ 100,00');

    await user.selectOptions(screen.getByLabelText('Periodicidade'), 'ANNUAL');
    expect(norm(screen.getByText(/total do período/i).textContent)).toContain('R$ 1.200,00');
  });

  it('submits the typed values (status only appears when editing)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EnrollmentForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Aluno'), ' Maria Souza ');
    await user.type(screen.getByLabelText(/e-mail do aluno/i), 'maria@email.com');
    await user.type(screen.getByLabelText(/plano de treino/i), 'Musculação');
    await user.selectOptions(screen.getByLabelText('Periodicidade'), 'QUARTERLY');
    await user.type(screen.getByLabelText(/mensalidade/i), '129.9');
    await user.click(screen.getByRole('button', { name: /salvar matrícula/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      studentName: 'Maria Souza', studentEmail: 'maria@email.com', planName: 'Musculação',
      period: 'QUARTERLY', monthlyPrice: 129.9, status: 'ACTIVE',
    });
  });

  it('shows the status selector when editing an existing enrollment', () => {
    const initial: Enrollment = {
      id: 3, studentName: 'João', studentEmail: 'j@e.com', planName: 'Crossfit', period: 'MONTHLY', monthlyPrice: 200,
      total: 200, status: 'FROZEN', startDate: '2026-11-01T00:00:00Z', endDate: '2026-12-01T00:00:00Z', createdAt: '',
    };
    render(<EnrollmentForm initial={initial} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText('Status')).toHaveValue('FROZEN');
    expect(screen.getByRole('heading', { name: /editar matrícula #3/i })).toBeInTheDocument();
  });
});
