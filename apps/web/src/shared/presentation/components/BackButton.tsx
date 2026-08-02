import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { IconButton } from './IconButton';

export function BackButton({
  fallback = '/app',
  label = 'Atrás',
}: {
  fallback?: string;
  label?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleBack() {
    if (location.key === 'default') {
      navigate(fallback, { replace: true });
      return;
    }

    navigate(-1);
  }

  return (
    <IconButton
      aria-label={label}
      className="back-button"
      onClick={handleBack}
      type="button"
    >
      <ArrowLeft size={20} aria-hidden="true" />
    </IconButton>
  );
}
