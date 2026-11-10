import { brl, CATEGORY_LABEL, dateOnly, dateTime, PERIOD_LABEL, percent, STATUS_LABEL } from '../src/shared/api/format';

const norm = (s: string) => s.replace(/\u00a0/g, ' ');

describe('format helpers', () => {
  it('formats BRL currency', () => {
    expect(norm(brl(4999.9))).toBe('R$ 4.999,90');
    expect(norm(brl(0))).toBe('R$ 0,00');
  });
  it('formats percentages', () => expect(percent(0.05)).toBe('5%'));
  it('handles invalid dates', () => {
    expect(dateTime('nope')).toBe('—');
    expect(dateOnly('nope')).toBe('—');
  });
  it('formats the enrollment end date (UTC, no time)', () => expect(dateOnly('2027-02-01T00:00:00.000Z')).toBe('01/02/2027'));
  it('translates every enrollment status, period and category', () => {
    expect(Object.keys(STATUS_LABEL).sort()).toEqual(['ACTIVE', 'CANCELLED', 'FROZEN']);
    expect(Object.keys(PERIOD_LABEL).sort()).toEqual(['ANNUAL', 'MONTHLY', 'QUARTERLY']);
    expect(Object.keys(CATEGORY_LABEL).sort()).toEqual(['ACCESSORY', 'APPAREL', 'MAINTENANCE', 'OTHER', 'SUPPLEMENT']);
  });
});
