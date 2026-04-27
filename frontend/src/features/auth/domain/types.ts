export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
};

export type AuthResponse = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};
