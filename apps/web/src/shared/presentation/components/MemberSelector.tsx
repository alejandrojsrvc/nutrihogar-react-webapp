import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { BottomSheet } from './Overlay';
import { useActiveProfile } from '../providers/ActiveProfileContext';

export function MemberSelector() {
  const { activeProfile, profiles, selectActiveProfile } = useActiveProfile();
  const [open, setOpen] = useState(false);

  if (!activeProfile || profiles.length < 2) return null;

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="member-selector"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span>{activeProfile.name}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <BottomSheet
        onClose={() => setOpen(false)}
        open={open}
        title="¿Para quién?"
      >
        <div className="member-selector__options">
          {profiles.map((profile) => (
            <button
              aria-pressed={profile.id === activeProfile.id}
              className="member-selector__option"
              key={profile.id}
              onClick={() => {
                selectActiveProfile(profile.id);
                setOpen(false);
              }}
              type="button"
            >
              <span>{profile.name}</span>
              {profile.id === activeProfile.id ? <strong>Activo</strong> : null}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
