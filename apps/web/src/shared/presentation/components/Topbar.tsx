import { createElement, type ComponentType } from 'react';
import { useMatches } from 'react-router';

import { ProfileMenu } from './ProfileMenu';
import { BrandLockup } from './BrandLockup';
import { useActiveProfile } from '../providers/ActiveProfileContext';
import type { RouteHandle } from '../navigation/routeHandle';

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
  const matches = useMatches();
  const pageHeader = matches.reduceRight<ComponentType | undefined>(
    (current, match) =>
      current ?? (match.handle as RouteHandle | undefined)?.pageHeader,
    undefined,
  );

  return (
    <header className="app-topbar">
      <div className="app-topbar__row">
        <div className="app-topbar__brand">
          <BrandLockup />
        </div>

        {pageHeader ? (
          <div className="app-topbar__page-header">
            {createElement(pageHeader)}
          </div>) : null}

        <ProfileMenu
          householdName={householdName}
          isSigningOut={isSigningOut}
          onLogout={onLogout}
          profileName={activeProfile?.name ?? 'Mi perfil'}
        />
      </div>
    </header>
  );
}
