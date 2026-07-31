import { SunMoon } from 'lucide-react';

import { useTheme } from '../providers/ThemeContext';

export function ThemeControl() {
  const { preference, setPreference } = useTheme();

  return (
    <label className="theme-control">
      <SunMoon size={17} aria-hidden="true" />
      <span>Tema</span>
      <select
        aria-label="Tema de la aplicación"
        value={preference}
        onChange={(event) => setPreference(event.target.value as typeof preference)}
      >
        <option value="system">Sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
      </select>
    </label>
  );
}
