export interface AuthStore {
  isAuthenticated: boolean;
  accessToken: string | null;

  setAccessToken: (token: string) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}
