import { create } from "zustand";
import { TOKEN_STORAGE_KEYS } from "../api/client";


export const useAuthStore = create((set) => ({

  accessToken: localStorage.getItem(TOKEN_STORAGE_KEYS.access),
  refreshToken: localStorage.getItem(TOKEN_STORAGE_KEYS.refresh),
  isAuthenticated: Boolean(localStorage.getItem(TOKEN_STORAGE_KEYS.access)),

  login: ({ access, refresh }) => {
    localStorage.setItem(TOKEN_STORAGE_KEYS.access, access);
    localStorage.setItem(TOKEN_STORAGE_KEYS.refresh, refresh);

    set({
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.access);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.refresh);

    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user:null,
    });
  },
}));