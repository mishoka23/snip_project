import { create } from "zustand";

export const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: Boolean(localStorage.getItem("accessToken")),

  login: ({ access, refresh }) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    set({
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));