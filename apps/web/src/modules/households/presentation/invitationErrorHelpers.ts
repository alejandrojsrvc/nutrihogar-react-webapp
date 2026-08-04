export function getInvitationErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const status = getErrorStatus(error);

  if (status === 401) {
    return 'Tu sesión ya no es válida. Inicia sesión nuevamente.';
  }

  if (status === 403) {
    return 'Solo los administradores del hogar pueden gestionar invitaciones.';
  }

  if (status === 400 || status === 422) {
    return 'Revisa el correo y el rol antes de crear la invitación.';
  }

  if (status === 409) {
    return 'Ese correo ya pertenece al hogar o ya tiene una invitación pendiente.';
  }

  if (status === 429) {
    return 'Se alcanzó el límite de intentos. Espera un momento antes de volver a invitar.';
  }

  return error instanceof Error ? error.message : fallback;
}

export function getAcceptanceErrorMessage(error: unknown): string {
  const status = getErrorStatus(error);

  if (status === 400) {
    return 'El enlace de invitación no es válido.';
  }

  if (status === 401) {
    return 'Tu sesión ya no es válida. Inicia sesión nuevamente.';
  }

  if (status === 403) {
    return 'El correo de tu cuenta no coincide con el de la invitación.';
  }

  if (status === 404) {
    return 'La invitación no existe o el enlace es incorrecto.';
  }

  if (status === 409) {
    return 'La invitación ya fue procesada.';
  }

  if (status === 410) {
    return 'La invitación ha expirado. Solicita una nueva invitación.';
  }

  if (status === 429) {
    return 'Se realizaron demasiados intentos. Espera un momento antes de volver a intentarlo.';
  }

  return error instanceof Error
    ? error.message
    : 'No se pudo aceptar la invitación. Inténtalo nuevamente.';
}

export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  const status = error.status;
  return typeof status === 'number' ? status : undefined;
}
