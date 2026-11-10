import { ApiError, createApiClient } from '../src/shared/api/client';

async function rejection(promise: Promise<unknown>): Promise<ApiError> {
  try { await promise; } catch (e) { return e as ApiError; }
  throw new Error('expected the promise to reject');
}

const res = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

describe('api client', () => {
  it('builds the URL from the base (ignoring trailing slashes) and parses JSON', async () => {
    const fetchFn = vi.fn().mockResolvedValue(res(200, [{ id: 1 }]));
    const client = createApiClient('https://gw.example.com//', fetchFn);
    expect(await client.get('/enrollments')).toEqual([{ id: 1 }]);
    expect(fetchFn.mock.calls[0][0]).toBe('https://gw.example.com/enrollments');
  });

  it('sends JSON bodies with Content-Type', async () => {
    const fetchFn = vi.fn().mockResolvedValue(res(201, { id: 'x' }));
    await createApiClient('http://a', fetchFn).post('/products', { name: 'N' });
    const init = fetchFn.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"name":"N"}');
  });

  it('returns undefined on 204', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    expect(await createApiClient('http://a', fetchFn).delete('/products/1')).toBeUndefined();
  });

  it('maps API errors to ApiError with code and message', async () => {
    const fetchFn = vi.fn().mockResolvedValue(res(404, { code: 'ENROLLMENT_NOT_FOUND', message: 'Enrollment not found' }));
    const err = await rejection(createApiClient('http://a', fetchFn).get('/enrollments/9'));
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 404, code: 'ENROLLMENT_NOT_FOUND', message: 'Enrollment not found' });
  });

  it('joins validation message arrays', async () => {
    const fetchFn = vi.fn().mockResolvedValue(res(400, { message: ['price must be >= 0', 'stock must be an integer'] }));
    const err = await rejection(createApiClient('http://a', fetchFn).post('/products', {}));
    expect(err.message).toBe('price must be >= 0; stock must be an integer');
  });

  it('explains upstream failures in plain Portuguese', async () => {
    const fetchFn = vi.fn().mockResolvedValue(res(502, { code: 'UPSTREAM_UNAVAILABLE', service: 'enrollments' }));
    const err = await rejection(createApiClient('http://a', fetchFn).get('/enrollments'));
    expect(err.message).toContain('serviço de matrículas');
  });

  it('turns network failures into a NETWORK_ERROR', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const err = await rejection(createApiClient('http://a', fetchFn).get('/x'));
    expect(err).toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });
});
