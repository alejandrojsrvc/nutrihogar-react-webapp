import type { HouseholdInvitationLinkGateway } from '../../../modules/households/application/ports/HouseholdInvitationLinkGateway';

const HOUSEHOLD_INVITATION_TOKENS_KEY =
  'nutrihogar.household-invitation-tokens';

export class LocalStorageHouseholdInvitationLinkGateway
  implements HouseholdInvitationLinkGateway
{
  getToken(invitationId: string): string | null {
    const tokens = this.readTokens();
    return tokens[invitationId] ?? null;
  }

  saveToken(invitationId: string, token: string): void {
    try {
      const tokens = this.readTokens();
      globalThis.localStorage?.setItem(
        HOUSEHOLD_INVITATION_TOKENS_KEY,
        JSON.stringify({ ...tokens, [invitationId]: token }),
      );
    } catch {
      // La invitacion sigue disponible en la respuesta actual si storage falla.
    }
  }

  private readTokens(): Record<string, string> {
    try {
      const rawValue = globalThis.localStorage?.getItem(
        HOUSEHOLD_INVITATION_TOKENS_KEY,
      );

      if (!rawValue) {
        return {};
      }

      const parsedValue: unknown = JSON.parse(rawValue);

      if (typeof parsedValue !== 'object' || parsedValue === null) {
        return {};
      }

      return Object.entries(parsedValue).reduce<Record<string, string>>(
        (tokens, [id, token]) => {
          if (typeof token === 'string') {
            tokens[id] = token;
          }

          return tokens;
        },
        {},
      );
    } catch {
      return {};
    }
  }
}
