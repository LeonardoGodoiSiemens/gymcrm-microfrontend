import { api } from '../../shared/api/client';
import { AggregatedData } from '../../shared/api/types';

export interface TimedAggregate { data: AggregatedData; ms: number }

/** GET /aggregated-data no BFF: estoque + matrículas + função financeira em um único JSON. */
export async function getAggregatedData(): Promise<TimedAggregate> {
  const started = performance.now();
  const data = await api.get<AggregatedData>('/aggregated-data');
  return { data, ms: Math.round(performance.now() - started) };
}
