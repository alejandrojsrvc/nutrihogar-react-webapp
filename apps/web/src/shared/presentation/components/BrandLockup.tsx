import { Leaf } from 'lucide-react';
import { Link } from 'react-router';

export function BrandLockup({ link = true }: { link?: boolean }) {
  const content = (
    <>
      <span>NutriHogar</span>
      <Leaf size={17} aria-hidden="true" />
    </>
  );

  return link ? (
    <Link className="brand-lockup" to="/app" aria-label="Inicio de NutriHogar">
      {content}
    </Link>
  ) : (
    <div className="brand-lockup" aria-label="NutriHogar">
      {content}
    </div>
  );
}
