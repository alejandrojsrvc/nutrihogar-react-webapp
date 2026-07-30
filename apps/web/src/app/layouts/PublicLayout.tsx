import { Outlet } from 'react-router';

export function PublicLayout() {
  return (
    <main className="public-layout">
      <div className="public-layout__brand" aria-label="NutriHogar">
        <span className="brand-mark" aria-hidden="true">
          N
        </span>
        <span>NutriHogar</span>
      </div>
      <div className="public-layout__content">
        <Outlet />
      </div>
    </main>
  );
}
