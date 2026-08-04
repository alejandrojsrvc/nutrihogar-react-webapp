import { ApiClientError } from '@nutrihogar/api-client';

import type {
  AuthSession,
  AuthSessionGateway,
  EmailCredentials,
  RegisterWithEmailInput,
  RegisterWithEmailResult,
} from '../../../modules/auth/application/ports/AuthSessionGateway';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string };
}

const REFRESH_TOKEN_KEY = 'nutrihogar.refresh-token';
const browserFetch: typeof globalThis.fetch = (...args) =>
  globalThis.fetch(...args);

export class JwtAuthSessionGateway implements AuthSessionGateway {
  private accessToken: string | null = null;
  private userId: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly fetchImplementation: typeof globalThis.fetch = browserFetch,
    private readonly onSessionExpired: () => void = () => undefined,
  ) {}

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async loginWithEmail({ email, password }: EmailCredentials): Promise<void> {
    const response = await this.request<AuthResponse>('/auth/login', {
      body: { email: normalizeEmail(email), password },
      method: 'POST',
    });
    this.setTokens(response);
  }

  async registerWithEmail({
    email,
    fullName,
    password,
  }: RegisterWithEmailInput) {
    const response = await this.request<AuthResponse>('/auth/register', {
      body: {
        displayName: fullName.trim(),
        email: normalizeEmail(email),
        password,
      },
      method: 'POST',
    });
    this.setTokens(response);
    const result: RegisterWithEmailResult = {
      requiresEmailConfirmation: false,
    };
    return result;
  }

  async getSession(): Promise<AuthSession | null> {
    if (this.accessToken) {
      return this.sessionFromToken(this.accessToken);
    }

    if (!this.getRefreshToken()) {
      return null;
    }

    const accessToken = await this.refresh();
    return accessToken ? this.sessionFromToken(accessToken) : null;
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    try {
      if (refreshToken) {
        await this.request('/auth/logout', {
          body: { refreshToken },
          method: 'POST',
        });
      }
    } finally {
      this.clearTokens();
    }
  }

  async handleUnauthorized(request: Request): Promise<Response | undefined> {
    if (
      request.url.endsWith('/auth/refresh') ||
      request.url.endsWith('/auth/logout')
    ) {
      this.expireSession();
      return undefined;
    }

    const accessToken = await this.refresh();
    if (!accessToken) {
      return undefined;
    }

    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    return this.fetchImplementation(new Request(request, { headers }));
  }

  async fetchAuthenticated(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const headers = new Headers(init?.headers);
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const request = new Request(input, { ...init, headers });
    const response = await this.fetchImplementation(request.clone());
    if (response.status !== 401) {
      return response;
    }

    return (await this.handleUnauthorized(request)) ?? response;
  }

  private async refresh(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.refreshPromise = this.request<AuthResponse>('/auth/refresh', {
      body: { refreshToken },
      method: 'POST',
    })
      .then((response) => {
        this.setTokens(response);
        return response.accessToken;
      })
      .catch(() => {
        this.expireSession();
        return null;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private async request<T = void>(
    path: string,
    options: { body?: unknown; method: string },
  ): Promise<T> {
    const response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers: { 'Content-Type': 'application/json' },
      method: options.method,
    });

    if (!response.ok) {
      throw new ApiClientError(
        'http',
        await getErrorMessage(response),
        response.status,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private setTokens(response: AuthResponse): void {
    this.accessToken = response.accessToken;
    this.userId = response.user.id;
    globalThis.sessionStorage?.setItem(
      REFRESH_TOKEN_KEY,
      response.refreshToken,
    );
  }

  private getRefreshToken(): string | null {
    return globalThis.sessionStorage?.getItem(REFRESH_TOKEN_KEY) ?? null;
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.userId = null;
    globalThis.sessionStorage?.removeItem(REFRESH_TOKEN_KEY);
  }

  private expireSession(): void {
    this.clearTokens();
    this.onSessionExpired();
  }

  private sessionFromToken(accessToken: string): AuthSession {
    return { accessToken, userId: this.userId ?? '' };
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.clone().json()) as {
      message?: string | string[];
    };
    return Array.isArray(body.message)
      ? body.message.join(', ')
      : (body.message ?? `La API respondio con el estado ${response.status}.`);
  } catch {
    return `La API respondio con el estado ${response.status}.`;
  }
}
