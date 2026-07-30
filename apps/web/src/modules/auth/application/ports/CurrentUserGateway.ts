export interface CurrentUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  timezone: string;
  locale: string;
}

export interface CurrentUserGateway {
  getCurrentUser(): Promise<CurrentUser>;
}
