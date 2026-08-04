import { ProfileMenu } from './ProfileMenu';
import { BrandLockup } from './BrandLockup';
import { useActiveProfile } from '../providers/ActiveProfileContext';
import { PageHeader } from './PageHeader';
import { PackagePlus } from 'lucide-react';

export function Topbar({
  householdName,
  isSigningOut,
  onLogout,
}: {
  householdName: string;
  isSigningOut: boolean;
  onLogout: () => void;
}) {
  const { activeProfile } = useActiveProfile();

  return (
    <header className="app-topbar">
      <div className="app-topbar__brand">
        <BrandLockup />
      </div>
    
      <ProfileMenu
        householdName={householdName}
        isSigningOut={isSigningOut}
        onLogout={onLogout}
        profileName={activeProfile?.name ?? 'Mi perfil'}
      />
    </header>
  );
}
