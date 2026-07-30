export type ApiClientErrorKind = 'network' | 'http' | 'unknown';

export class ApiClientError extends Error {
  override readonly name = 'ApiClientError';

  constructor(
    public readonly kind: ApiClientErrorKind,
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function normalizeApiError(
  error: unknown,
  response?: Response,
): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (response && !response.ok) {
    return new ApiClientError(
      'http',
      `La API respondio con el estado ${response.status}.`,
      response.status,
      error,
    );
  }

  if (error instanceof TypeError) {
    return new ApiClientError(
      'network',
      'No se pudo conectar con la API de NutriHogar.',
      undefined,
      error,
    );
  }

  return new ApiClientError(
    'unknown',
    'Ocurrio un error inesperado al consultar la API.',
    undefined,
    error,
  );
}
