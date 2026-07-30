import { beforeEach, describe, expect, it } from 'vitest';

import { LocalStorageHouseholdInvitationLinkGateway } from './LocalStorageHouseholdInvitationLinkGateway';

describe('LocalStorageHouseholdInvitationLinkGateway', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('recovers a token saved for an invitation', () => {
    const gateway = new LocalStorageHouseholdInvitationLinkGateway();

    gateway.saveToken('invitation-1', 'raw-invitation-token');

    expect(gateway.getToken('invitation-1')).toBe('raw-invitation-token');
  });

  it('keeps tokens for different invitations separate', () => {
    const gateway = new LocalStorageHouseholdInvitationLinkGateway();

    gateway.saveToken('invitation-1', 'token-1');
    gateway.saveToken('invitation-2', 'token-2');

    expect(gateway.getToken('invitation-1')).toBe('token-1');
    expect(gateway.getToken('invitation-2')).toBe('token-2');
  });
});
