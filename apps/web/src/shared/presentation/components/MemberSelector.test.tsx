import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { MemberSelector } from './MemberSelector';
import { ActiveProfileProvider } from '../providers/ActiveProfileContext';

describe('MemberSelector', () => {
  it('lets the user change the active member', async () => {
    const user = userEvent.setup();
    render(
      <ActiveProfileProvider
        profiles={[
          { id: 'profile-1', name: 'Alejandro' },
          { id: 'profile-2', name: 'Camila' },
        ]}
      >
        <MemberSelector />
      </ActiveProfileProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Alejandro' }));
    await user.click(screen.getByRole('button', { name: 'Camila' }));

    expect(screen.getByRole('button', { name: 'Camila' })).toBeInTheDocument();
  });
});
