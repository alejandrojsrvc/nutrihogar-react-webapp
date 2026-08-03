import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JwtAuthSessionGateway } from './JwtAuthSessionGateway';

function response(body: unknown, status = 200) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}

const tokens = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  user: { id: 'user-1' },
};

describe('JwtAuthSessionGateway', () => {
  beforeEach(() => sessionStorage.clear());

  it('registers, sends the API payload and stores the refresh token', async () => {
    const fetchMock = vi.fn(async () => response(tokens, 201));
    const gateway = new JwtAuthSessionGateway('http://localhost:3000/api', fetchMock);

    await gateway.registerWithEmail({
      email: ' User@Example.com ',
      fullName: 'Alejandro',
      password: 'password-seguro',
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
      displayName: 'Alejandro',
      email: 'user@example.com',
      password: 'password-seguro',
    });
    expect(sessionStorage.getItem('nutrihogar.refresh-token')).toBe('refresh-1');
  });

  it('refreshes concurrent unauthorized requests only once and retries with Bearer', async () => {
    let refreshCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/auth/login')) return response(tokens);
      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        return response({ ...tokens, accessToken: 'access-2', refreshToken: 'refresh-2' });
      }
      return response(undefined, 401);
    });
    const gateway = new JwtAuthSessionGateway('http://localhost:3000/api', fetchMock);
    await gateway.loginWithEmail({ email: 'user@example.com', password: 'password' });

    const request = new Request('http://localhost:3000/api/households', {
      headers: { Authorization: 'Bearer access-1' },
    });
    const [first, second] = await Promise.all([
      gateway.handleUnauthorized(request.clone()),
      gateway.handleUnauthorized(request.clone()),
    ]);

    expect(refreshCalls).toBe(1);
    expect(first?.status).toBe(401);
    expect(second?.status).toBe(401);
    expect(fetchMock.mock.calls.at(-1)?.[0]).toBeInstanceOf(Request);
    expect((fetchMock.mock.calls.at(-1)?.[0] as Request).headers.get('Authorization')).toBe(
      'Bearer access-2',
    );
  });

  it('restores a session from the refresh token', async () => {
    sessionStorage.setItem('nutrihogar.refresh-token', 'refresh-1');
    const fetchMock = vi.fn(async () =>
      response({ ...tokens, accessToken: 'access-restored' }),
    );
    const gateway = new JwtAuthSessionGateway('http://localhost:3000/api', fetchMock);

    await expect(gateway.getSession()).resolves.toEqual({
      accessToken: 'access-restored',
      userId: 'user-1',
    });
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/api/auth/refresh');
  });

  it('exposes invalid credentials as an HTTP error', async () => {
    const gateway = new JwtAuthSessionGateway(
      'http://localhost:3000/api',
      async () => response({ message: 'Credenciales invalidas' }, 401),
    );

    await expect(
      gateway.loginWithEmail({ email: 'user@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('clears the session after logout', async () => {
    const fetchMock = vi.fn(async () => response(undefined, 204));
    const gateway = new JwtAuthSessionGateway('http://localhost:3000/api', fetchMock);
    sessionStorage.setItem('nutrihogar.refresh-token', 'refresh-1');

    await gateway.logout();

    expect(sessionStorage.getItem('nutrihogar.refresh-token')).toBeNull();
  });
});
