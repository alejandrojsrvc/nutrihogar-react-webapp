import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from './Overlay';

describe('Dialog', () => {
  it('closes with Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog onClose={onClose} open title="Confirmar">
        <button type="button">Continuar</button>
      </Dialog>,
    );

    expect(
      screen.getByRole('dialog', { name: 'Confirmar' }),
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
