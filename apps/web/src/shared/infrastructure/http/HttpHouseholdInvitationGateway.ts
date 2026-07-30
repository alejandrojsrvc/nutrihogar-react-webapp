import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
} from '@nutrihogar/api-client';

import type {
  CreateHouseholdInvitationInput,
  HouseholdInvitation,
  HouseholdInvitationGateway,
} from '../../../modules/households/application/ports/HouseholdInvitationGateway';

export class HttpHouseholdInvitationGateway
  implements HouseholdInvitationGateway
{
  constructor(private readonly apiClient: ApiClient) {}

  async list(householdId: string): Promise<HouseholdInvitation[]> {
    try {
      const result = await this.apiClient.GET(
        '/api/households/{householdId}/invitations',
        { params: { path: { householdId } } },
      );

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio las invitaciones del hogar.',
        );
      }

      return result.data.map(toHouseholdInvitation);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async create(
    householdId: string,
    input: CreateHouseholdInvitationInput,
  ): Promise<HouseholdInvitation> {
    try {
      const result = await this.apiClient.POST(
        '/api/households/{householdId}/invitations',
        {
          body: input,
          params: { path: { householdId } },
        },
      );

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio la invitacion creada.',
        );
      }

      return toHouseholdInvitation(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async accept(token: string): Promise<HouseholdInvitation> {
    try {
      const result = await this.apiClient.POST(
        '/api/household-invitations/{token}/accept',
        { params: { path: { token } } },
      );

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio la invitacion aceptada.',
        );
      }

      return toHouseholdInvitation(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function toHouseholdInvitation(value: {
  id: string;
  householdId: string;
  email: string;
  role: HouseholdInvitation['role'];
  status: HouseholdInvitation['status'];
  expiresAt: string;
  invitedById: string;
  acceptedById: unknown;
  createdAt: string;
  updatedAt: string;
  token?: unknown;
}): HouseholdInvitation {
  return {
    acceptedById: toNullableText(value.acceptedById),
    createdAt: value.createdAt,
    email: value.email,
    expiresAt: value.expiresAt,
    householdId: value.householdId,
    id: value.id,
    invitedById: value.invitedById,
    role: value.role,
    status: value.status,
    token: toOptionalText(value.token),
    updatedAt: value.updatedAt,
  };
}

function toNullableText(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function toOptionalText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
