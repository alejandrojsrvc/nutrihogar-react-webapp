import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormField } from './FormField';

describe('FormField', () => {
  it('associates help and validation feedback with the control', () => {
    render(
      <FormField
        error="Campo obligatorio"
        help="Usa tu correo habitual"
        htmlFor="email"
        label="Correo"
      >
        {(fieldProps) => <input id="email" {...fieldProps} />}
      </FormField>,
    );

    const input = screen.getByLabelText('Correo');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'Usa tu correo habitual Campo obligatorio',
    );
  });
});
