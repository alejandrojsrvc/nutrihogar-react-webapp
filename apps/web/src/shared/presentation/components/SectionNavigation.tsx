import { NavLink } from 'react-router';

export function SectionNavigation({
  ariaLabel,
  items,
}: {
  ariaLabel: string;
  items: ReadonlyArray<{ end?: boolean; label: string; to: string }>;
}) {
  return (
    <nav aria-label={ariaLabel} className="section-navigation">
      {items.map((item) => (
        <NavLink end={item.end} key={item.to} to={item.to}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
