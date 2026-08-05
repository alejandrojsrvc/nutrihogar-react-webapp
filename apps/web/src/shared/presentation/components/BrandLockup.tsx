import { Link } from 'react-router';
import { BrandMark } from './BrandMark';

export function BrandLockup({ link = true }: { link?: boolean }) {
  const content = (
    <>
      <span>NutriHogar</span>
      <BrandMark />
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
