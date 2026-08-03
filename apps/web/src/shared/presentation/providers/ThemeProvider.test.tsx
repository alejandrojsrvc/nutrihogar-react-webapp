import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeControl } from '../components/ThemeControl';
import { ThemeProvider } from './ThemeProvider';

function renderThemeControl() {
  return render(
    <ThemeProvider>
      <ThemeControl />
    </ThemeProvider>,
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });

  it('follows the operating system by default', () => {
    renderThemeControl();

    expect(screen.getByRole('combobox')).toHaveValue('system');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('allows selecting and persists a theme override', async () => {
    const user = userEvent.setup();
    renderThemeControl();

    await user.selectOptions(screen.getByRole('combobox'), 'light');

    expect(screen.getByRole('combobox')).toHaveValue('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('nutrihogar-theme')).toBe('light');
  });

  it('restores a persisted preference', () => {
    window.localStorage.setItem('nutrihogar-theme', 'dark');

    renderThemeControl();

    expect(screen.getByRole('combobox')).toHaveValue('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
