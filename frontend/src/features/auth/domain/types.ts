export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = {
  email: string;
  password: string;
};

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetRequestResponse = {
  message: string;
};

export type AuthUser = {
  id: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  avatar_url: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};
