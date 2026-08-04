import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

export interface ActiveProfileOption {
  id: string;
  name: string;
  isActive?: boolean;
}

interface ActiveProfileContextValue {
  activeProfile: ActiveProfileOption | null;
  activeProfileId: string;
  profiles: ActiveProfileOption[];
  selectActiveProfile: (profileId: string) => void;
}

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(
  null,
);

export function ActiveProfileProvider({
  children,
  profiles,
}: PropsWithChildren<{
  profiles: ActiveProfileOption[];
}>) {
  const availableProfiles = useMemo(
    () => profiles.filter((profile) => profile.isActive !== false),
    [profiles],
  );
  const [activeProfileId, setActiveProfileId] = useState('');

  const selectedProfile = availableProfiles.find(
    (profile) => profile.id === activeProfileId,
  );
  const activeProfile = selectedProfile ?? availableProfiles[0] ?? null;

  return (
    <ActiveProfileContext.Provider
      value={{
        activeProfile,
        activeProfileId: activeProfile?.id ?? '',
        profiles: availableProfiles,
        selectActiveProfile: setActiveProfileId,
      }}
    >
      {children}
    </ActiveProfileContext.Provider>
  );
}

// The provider and hook intentionally share this module as one context API.
// eslint-disable-next-line react-refresh/only-export-components
export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context) {
    throw new Error(
      'useActiveProfile debe utilizarse dentro de ActiveProfileProvider.',
    );
  }
  return context;
}
