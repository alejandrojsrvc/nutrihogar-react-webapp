import type {
  PurchaseOcrGateway,
  PurchaseOcrInput,
} from '../../application/ports/PurchaseOcrGateway';

export class PurchaseOcrError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'PurchaseOcrError';
  }
}

export class HttpPurchaseOcrGateway implements PurchaseOcrGateway {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchAuthenticated: (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => Promise<Response>,
  ) {}

  async createDraft({ householdId, file, currency, locale }: PurchaseOcrInput) {
    const formData = new FormData();
    formData.append('file', file);
    if (currency) formData.append('currency', currency);
    if (locale) formData.append('locale', locale);

    const response = await this.fetchAuthenticated(
      `${this.baseUrl}/households/${householdId}/purchases/ocr-draft`,
      {
        body: formData,
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        method: 'POST',
      },
    );

    if (!response.ok) {
      throw new PurchaseOcrError(response.status, getOcrErrorMessage(response.status));
    }

    return response.json();
  }
}

function getOcrErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'El archivo no es valido.';
    case 401:
      return 'Tu sesion expiro. Inicia sesion nuevamente.';
    case 403:
      return 'No tienes acceso a este hogar.';
    case 413:
      return 'El archivo es demasiado grande.';
    case 422:
      return 'El ticket no contiene elementos reconocibles.';
    case 502:
      return 'No se pudo procesar el ticket.';
    case 503:
      return 'El almacenamiento no esta disponible.';
    default:
      return 'No se pudo procesar el ticket.';
  }
}
