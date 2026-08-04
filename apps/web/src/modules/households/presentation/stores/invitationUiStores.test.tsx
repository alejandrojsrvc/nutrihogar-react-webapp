import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import type { HouseholdInvitation } from '../../application/ports/HouseholdInvitationGateway';
import {
  closeInvitationForm,
  markInvitationAccepted,
  openInvitationForm,
  resetInvitationAcceptance,
  useAcceptedInvitation,
  useInvitationFormOpen,
} from './invitationUiStores';

const invitation: HouseholdInvitation = {
  acceptedById: null,
  createdAt: '2026-07-30T12:00:00.000Z',
  email: 'adult@example.com',
  expiresAt: '2099-08-06T12:00:00.000Z',
  householdId: 'household-2',
  id: 'invitation-1',
  invitedById: 'user-1',
  role: 'MEMBER',
  status: 'PENDING',
  updatedAt: '2026-07-30T12:00:00.000Z',
};

function StoreProbe() {
  const formOpen = useInvitationFormOpen();
  const acceptedInvitation = useAcceptedInvitation();

  return (
    <div>
      <p data-testid="form-open">{String(formOpen)}</p>
      <p data-testid="accepted-invitation">
        {acceptedInvitation ? acceptedInvitation.id : 'none'}
      </p>
      <button onClick={openInvitationForm} type="button">
        Abrir formulario
      </button>
      <button onClick={closeInvitationForm} type="button">
        Cerrar formulario
      </button>
      <button
        onClick={() => markInvitationAccepted(invitation)}
        type="button"
      >
        Marcar aceptada
      </button>
      <button onClick={resetInvitationAcceptance} type="button">
        Restablecer aceptación
      </button>
    </div>
  );
}

describe('invitationUiStores', () => {
  beforeEach(() => {
    closeInvitationForm();
    resetInvitationAcceptance();
  });

  it('shares the invitation form state and the accepted invitation between consumers', async () => {
    const user = userEvent.setup();
    render(<StoreProbe />);

    expect(screen.getByTestId('form-open')).toHaveTextContent('false');
    expect(screen.getByTestId('accepted-invitation')).toHaveTextContent(
      'none',
    );

    await user.click(screen.getByRole('button', { name: 'Abrir formulario' }));
    expect(screen.getByTestId('form-open')).toHaveTextContent('true');

    await user.click(screen.getByRole('button', { name: 'Marcar aceptada' }));
    expect(screen.getByTestId('accepted-invitation')).toHaveTextContent(
      'invitation-1',
    );

    await user.click(screen.getByRole('button', { name: 'Cerrar formulario' }));
    expect(screen.getByTestId('form-open')).toHaveTextContent('false');

    await user.click(
      screen.getByRole('button', { name: 'Restablecer aceptación' }),
    );
    expect(screen.getByTestId('accepted-invitation')).toHaveTextContent(
      'none',
    );
  });
});
