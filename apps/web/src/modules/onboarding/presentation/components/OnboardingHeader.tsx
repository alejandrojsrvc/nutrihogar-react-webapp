import { HousePlus } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';

export function OnboardingHeader() {
  const onboarding = useOnboardingStatus();

  if (onboarding.isLoading) {
    return (
      <PageHeader
        eyebrow="Primeros pasos"
        icon={<HousePlus size={24} />}
        title="Primeros pasos"
      />
    );
  }

  if (onboarding.isError) {
    return (
      <PageHeader
        eyebrow="Primeros pasos"
        icon={<HousePlus size={24} />}
        title="No pudimos preparar tu hogar"
        titleId="onboarding-error-title"
      />
    );
  }

  if (onboarding.step === 'select-household') {
    return (
      <PageHeader
        description="Selecciona el espacio familiar donde quieres configurar tu perfil."
        eyebrow="Primeros pasos"
        icon={<HousePlus size={24} />}
        title="Elige un hogar para continuar"
        titleId="household-select-title"
      />
    );
  }

  if (onboarding.step !== 'create-household') {
    return (
      <PageHeader
        eyebrow="Primeros pasos"
        icon={<HousePlus size={24} />}
        title="Primeros pasos"
      />
    );
  }

  return (
    <PageHeader
      description="Empieza con un espacio compartido para organizar la alimentación y el bienestar de tu familia."
      eyebrow="Primeros pasos"
      icon={<HousePlus size={24} />}
      title="Crea tu hogar"
      titleId="onboarding-title"
    />
  );
}
