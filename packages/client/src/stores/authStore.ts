import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  username?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        try {
          localStorage.removeItem("authToken");
          set({ token: null, user: null, isAuthenticated: false });
        } catch (error) {
          console.error("Failed to clear auth token:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Store rehydrated:", state);
        }
      },
    }
  )
);