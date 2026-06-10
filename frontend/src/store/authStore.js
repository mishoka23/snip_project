import { create } from "zustand";

export const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: Boolean(localStorage.getItem("accessToken")),

  login: (accessToken) => {
    localStorage.setItem("accessToken", accessToken);

    set({
      accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("accessToken");

    set({
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));