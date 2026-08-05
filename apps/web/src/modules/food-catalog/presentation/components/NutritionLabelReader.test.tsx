import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NutritionLabelReader } from './NutritionLabelReader';

describe('NutritionLabelReader', () => {
  it('delivers the selected file and lets the same file be chosen again', async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    render(<NutritionLabelReader isPending={false} onFile={onFile} />);

    const input = screen.getByLabelText('Archivo de etiqueta nutricional');
    const label = new File(['label'], 'label.jpg', { type: 'image/jpeg' });

    await user.upload(input, label);
    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile).toHaveBeenCalledWith(expect.objectContaining({ name: 'label.jpg' }));

    await user.upload(input, label);
    expect(onFile).toHaveBeenCalledTimes(2);
    expect(onFile).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'label.jpg' }),
    );
  });
});
