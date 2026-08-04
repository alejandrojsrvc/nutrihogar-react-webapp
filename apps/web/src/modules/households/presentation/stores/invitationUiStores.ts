import { useSyncExternalStore } from 'react';

import type { HouseholdInvitation } from '../../application/ports/HouseholdInvitationGateway';

type Listener = () => void;

function createExternalStore<T>(initialValue: T) {
  let value = initialValue;
  const listeners = new Set<Listener>();

  return {
    getSnapshot: () => value,
    reset: () => {
      value = initialValue;
      listeners.forEach((listener) => listener());
    },
    set: (nextValue: T) => {
      value = nextValue;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const invitationFormStore = createExternalStore(false);
const acceptedInvitationStore = createExternalStore<HouseholdInvitation | null>(
  null,
);

export function useInvitationFormOpen(): boolean {
  return useSyncExternalStore(
    invitationFormStore.subscribe,
    invitationFormStore.getSnapshot,
  );
}

export function openInvitationForm() {
  invitationFormStore.set(true);
}

export function closeInvitationForm() {
  invitationFormStore.set(false);
}

export function useAcceptedInvitation() {
  return useSyncExternalStore(
    acceptedInvitationStore.subscribe,
    acceptedInvitationStore.getSnapshot,
  );
}

export function markInvitationAccepted(invitation: HouseholdInvitation) {
  acceptedInvitationStore.set(invitation);
}

export function resetInvitationAcceptance() {
  acceptedInvitationStore.reset();
}
