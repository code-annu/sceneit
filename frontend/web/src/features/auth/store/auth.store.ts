import { create } from "zustand";
import type { AuthStore } from "./auth-store.type";

const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  setAccessToken: (token: string) => set(() => ({ accessToken: token })),
  setAuthenticated: (isAuthenticated: boolean) =>
    set(() => ({ isAuthenticated })),
}));

export default useAuthStore;
