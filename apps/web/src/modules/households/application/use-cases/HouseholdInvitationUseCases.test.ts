import { describe, expect, it, vi } from 'vitest';

import type {
  CreateHouseholdInvitationInput,
  HouseholdInvitation,
  HouseholdInvitationGateway,
} from '../ports/HouseholdInvitationGateway';
import { AcceptHouseholdInvitationUseCase } from './AcceptHouseholdInvitationUseCase';
import { CreateHouseholdInvitationUseCase } from './CreateHouseholdInvitationUseCase';
import { ListHouseholdInvitationsUseCase } from './ListHouseholdInvitationsUseCase';

const invitation: HouseholdInvitation = {
  id: 'invitation-1',
  householdId: 'household-1',
  email: 'adult@example.com',
  role: 'MEMBER',
  status: 'PENDING',
  expiresAt: '2099-08-06T12:00:00.000Z',
  invitedById: 'user-1',
  acceptedById: null,
  createdAt: '2026-07-30T12:00:00.000Z',
  updatedAt: '2026-07-30T12:00:00.000Z',
};

function createGateway(): HouseholdInvitationGateway {
  return {
    accept: vi.fn(async (token: string) => {
      void token;
      return { ...invitation, status: 'ACCEPTED' as const };
    }),
    create: vi.fn(async () => invitation),
    list: vi.fn(async () => [invitation]),
  };
}

describe('household invitation use cases', () => {
  it('lists invitations for a household', async () => {
    const gateway = createGateway();

    await expect(
      new ListHouseholdInvitationsUseCase(gateway).execute('household-1'),
    ).resolves.toEqual([invitation]);
    expect(gateway.list).toHaveBeenCalledWith('household-1');
  });

  it('creates an invitation for a household', async () => {
    const gateway = createGateway();
    const input: CreateHouseholdInvitationInput = {
      email: 'adult@example.com',
      role: 'MEMBER',
    };

    await expect(
      new CreateHouseholdInvitationUseCase(gateway).execute(
        'household-1',
        input,
      ),
    ).resolves.toEqual(invitation);
    expect(gateway.create).toHaveBeenCalledWith('household-1', input);
  });

  it('accepts an invitation with its token', async () => {
    const gateway = createGateway();

    await expect(
      new AcceptHouseholdInvitationUseCase(gateway).execute(
        'raw-invitation-token',
      ),
    ).resolves.toMatchObject({ status: 'ACCEPTED' });
    expect(gateway.accept).toHaveBeenCalledWith('raw-invitation-token');
  });
});
