import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ServePreparedBatchPortionsPage } from './ServePreparedBatchPortionsPage';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  useAdultProfiles: vi.fn(),
  useHouseholds: vi.fn(),
  usePreparedBatchDetails: vi.fn(),
  useServePreparedBatchPortions: vi.fn(),
}));

vi.mock('../../../households/presentation/hooks/useAdultProfiles', () => ({
  useAdultProfiles: mocks.useAdultProfiles,
}));

vi.mock('../../../households/presentation/hooks/useHouseholds', () => ({
  useHouseholds: mocks.useHouseholds,
}));

vi.mock('../hooks/usePreparedBatches', () => ({
  usePreparedBatchDetails: mocks.usePreparedBatchDetails,
  useServePreparedBatchPortions: mocks.useServePreparedBatchPortions,
}));

describe('ServePreparedBatchPortionsPage', () => {
  beforeEach(() => {
    mocks.mutate.mockReset();
    mocks.useHouseholds.mockReturnValue({
      activeHousehold: { id: 'household-1', name: 'Hogar' },
      isError: false,
      isPending: false,
    });
    mocks.useAdultProfiles.mockReturnValue({
      isError: false,
      isPending: false,
      profiles: [{ id: 'profile-1', isActive: true, name: 'Alejandro' }],
    });
    mocks.usePreparedBatchDetails.mockReturnValue({
      data: {
        availability: {
          availableWeight: 500,
          discardedWeight: 0,
          finalCookedWeight: 500,
          savedRemainderWeight: 0,
          servedWeight: 0,
          storedLeftoverWeight: 0,
        },
        batch: { status: 'FINALIZED' },
      },
      isError: false,
      isPending: false,
    });
    mocks.useServePreparedBatchPortions.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: mocks.mutate,
    });
  });

  it('requires a member for every portion with weight', async () => {
    const user = userEvent.setup();
    renderPage();

    const submit = screen.getByRole('button', { name: 'Guardar porciones' });
    await user.type(screen.getByLabelText('Peso servido (g)'), '180');

    expect(submit).toBeDisabled();
    expect(
      screen.getByText('Selecciona un integrante para cada porción con peso.'),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Integrante'), 'profile-1');
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(mocks.mutate).toHaveBeenCalledWith(
      {
        batchId: 'batch-1',
        input: {
          portions: [{ adultProfileId: 'profile-1', servedWeight: 180 }],
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    const options = mocks.mutate.mock.calls[0]?.[1] as {
      onSuccess: (result: {
        availableWeight: number;
        portions: Array<{ id: string }>;
      }) => void;
    };
    options.onSuccess({ availableWeight: 320, portions: [{ id: 'portion-1' }] });
    expect(
      await screen.findByText('1 porción guardada. Quedan 320 g disponibles.'),
    ).toBeInTheDocument();
  });

  it('explains when the preparation context is missing', () => {
    render(
      <MemoryRouter>
        <ServePreparedBatchPortionsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        'Falta identificar la preparación. Abre esta acción desde su detalle.',
      ),
    ).toBeInTheDocument();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/app/preparaciones/batch-1/servir']}>
      <Routes>
        <Route
          path="/app/preparaciones/:batchId/servir"
          element={<ServePreparedBatchPortionsPage />}
        />
        <Route path="/app/preparaciones/:batchId" element={<PreparationResult />} />
      </Routes>
    </MemoryRouter>,
  );
}

function PreparationResult() {
  const location = useLocation();
  const message = (location.state as { successMessage?: string } | null)
    ?.successMessage;
  return <p>{message}</p>;
}
