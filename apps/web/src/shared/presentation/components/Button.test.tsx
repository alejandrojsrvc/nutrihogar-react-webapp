import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button, ButtonLink } from './Button';

describe('Button', () => {
  it('renders the label', () => {
    render(<Button>Guardar comida</Button>);

    expect(
      screen.getByRole('button', { name: 'Guardar comida' }),
    ).toBeInTheDocument();
  });

  it('applies the requested variant class', () => {
    const { container } = render(<Button variant="secondary">Cancelar</Button>);

    expect(container.querySelector('button')?.className).toContain(
      'button--secondary',
    );
  });

  it('renders leading and trailing icons', () => {
    render(
      <Button
        icon={<span data-testid="icon-start" />}
        iconEnd={<span data-testid="icon-end" />}
      >
        Guardar
      </Button>,
    );

    expect(screen.getByTestId('icon-start')).toBeInTheDocument();
    expect(screen.getByTestId('icon-end')).toBeInTheDocument();
  });

  it('keeps the label, disables and marks as busy while loading', () => {
    const { container } = render(<Button loading>Guardando</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Guardando')).toBeInTheDocument();
    expect(container.querySelector('.button__spinner')).toBeInTheDocument();
  });

  it('can swap the label while loading', () => {
    render(
      <Button loading loadingLabel="Procesando...">
        Guardar
      </Button>,
    );

    expect(screen.getByRole('button')).toHaveAccessibleName('Procesando...');
  });

  it('renders as a link with the button style', () => {
    render(<ButtonLink to="/app">Registrar comida</ButtonLink>);

    const link = screen.getByRole('link', { name: 'Registrar comida' });
    expect(link).toHaveAttribute('href', '/app');
    expect(link.className).toContain('button--primary');
  });
});
