import { createElement, type ComponentType } from 'react';
import { useLocation, useMatches } from 'react-router';

import { ProfileMenu } from './ProfileMenu';
import { useActiveProfile } from '../providers/ActiveProfileContext';
import type { RouteHandle } from '../navigation/routeHandle';
import { fallbackForRoute, routeDepth } from '../navigation/routeHandle';
import { BackButton } from './BackButton';

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
  const location = useLocation();
  const matches = useMatches();
  const pageHeader = matches.reduceRight<ComponentType | undefined>(
    (current, match) =>
      current ?? (match.handle as RouteHandle | undefined)?.pageHeader,
    undefined,
  );
  const leafHandle = matches.at(-1)?.handle as RouteHandle | undefined;
  const depth = leafHandle?.depth ?? routeDepth(location.pathname);
  const fallback = leafHandle?.back ?? fallbackForRoute(location.pathname);
  const showBack = depth === 'detail' || depth === 'task';

  return (
    <header className="app-topbar">
      <div className={`app-topbar__row${showBack ? ' app-topbar__row--deep' : ''}`}>
        {showBack ? <BackButton fallback={fallback} /> : null}
        {pageHeader ? (
          <div className="app-topbar__page-header">
            {createElement(pageHeader)}
          </div>
        ) : null}
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
