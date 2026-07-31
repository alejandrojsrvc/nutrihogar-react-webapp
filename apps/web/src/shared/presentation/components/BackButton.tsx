import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

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
      navigate(fallback);
      return;
    }

    navigate(-1);
  }

  return (
    <button className="back-button" onClick={handleBack} type="button">
      <ArrowLeft size={18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
