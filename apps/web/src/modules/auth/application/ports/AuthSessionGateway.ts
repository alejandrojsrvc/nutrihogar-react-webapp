export interface AuthSession {
  userId: string;
  accessToken: string;
}

export interface EmailCredentials {
  email: string;
  password: string;
}

export interface RegisterWithEmailInput extends EmailCredentials {
  fullName: string;
}

export interface RegisterWithEmailResult {
  requiresEmailConfirmation: boolean;
}

export interface AuthSessionGateway {
  loginWithEmail(credentials: EmailCredentials): Promise<void>;
  registerWithEmail(
    input: RegisterWithEmailInput,
  ): Promise<RegisterWithEmailResult>;
  getSession(): Promise<AuthSession | null>;
  logout(): Promise<void>;
}
