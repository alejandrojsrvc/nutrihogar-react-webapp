import { Outlet } from 'react-router';
import { Heart, ShieldCheck, Users } from 'lucide-react';

import { BrandLockup } from '../../shared/presentation/components/BrandLockup';

export function PublicLayout() {
  return (
    <main className="public-layout">
      <section
        className="public-layout__story"
        aria-label="Nutrición para tu hogar"
      >
        <BrandLockup link={false} />
        <div className="public-layout__message">
          <p className="eyebrow">Comer mejor. Vivir mejor. Juntos.</p>
          <h1>Tu nutrición, organizada alrededor de la vida real.</h1>
          <p>
            Planifica, registra y entiende tus hábitos sin perder de vista a las
            personas con quienes compartes la mesa.
          </p>
        </div>
        <ul className="public-layout__benefits">
          <li>
            <Heart size={20} aria-hidden="true" />
            <span>Hábitos que suman bienestar</span>
          </li>
          <li>
            <Users size={20} aria-hidden="true" />
            <span>Pensado para toda la familia</span>
          </li>
          <li>
            <ShieldCheck size={20} aria-hidden="true" />
            <span>Datos seguros y bajo tu control</span>
          </li>
        </ul>
      </section>
      <div className="public-layout__form-area">
        <div className="public-layout__mobile-brand">
          <BrandLockup link={false} />
        </div>
        <div className="public-layout__content">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
