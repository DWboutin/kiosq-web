import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UserData } from "@/types/app";
import { Session } from "@supabase/supabase-js";
import { signInWithOtp, signOut, verifyOtpCode } from "@/utils/supabase/client";
import { getUser } from "@/actions/get-user";
import { getAuthenticatedUserData } from "@/utils/requests/get-authenticated-user-data";

type UserState = {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  isSigningWithOtp: boolean;
  user: User | null;
  userData: UserData | null;
  session: Session | null;
  name: string | null;
  error: string | null;
};

type UserActions = {
  updateUser: (user: User | null) => void;
  updateName: (name: string | null) => void;
  getUser: () => Promise<void>;
  signInWithOtp: (email: string, name: string) => Promise<void>;
  connectWithOtp: (email: string, code: string) => Promise<void>;
  disconnectUser: () => Promise<void>;
};

const initialState: UserState = {
  isAuthenticating: false,
  isAuthenticated: false,
  isSigningWithOtp: false,
  user: null,
  userData: null,
  session: null,
  name: null,
  error: null,
};

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      updateUser: (user) => {
        set((state) => {
          state.user = user;
        });
      },
      updateName: (name) => {
        set((state) => {
          state.name = name;
        });
      },
      getUser: async () => {
        const user = await getUser();

        set((state) => {
          state.user = user;
        });
      },
      getUserData: async () => {
        const userData = await getAuthenticatedUserData();

        set((state) => {
          state.userData = userData;
        });
      },
      signInWithOtp: async (email, name) => {
        try {
          set((state) => {
            state.isSigningWithOtp = true;
          });

          const usedName = get().name || name;

          await signInWithOtp(email, usedName);
        } catch (error) {
          set((state) => {
            state.error = error as string;
          });
          throw error;
        } finally {
          set((state) => {
            state.isSigningWithOtp = false;
          });
        }
      },
      connectWithOtp: async (email, code) => {
        try {
          set((state) => {
            state.isAuthenticating = true;
          });

          const session = await verifyOtpCode(email, code);
          const userData = await getAuthenticatedUserData();

          set((state) => {
            state.session = session || null;
            state.user = session?.user || null;
            state.userData = userData || null;
            state.isAuthenticated = true;
          });
        } catch (error) {
          set((state) => {
            state.error = error as string;
          });
        } finally {
          set((state) => {
            state.isAuthenticating = false;
          });
        }
      },
      disconnectUser: async () => {
        try {
          set((state) => {
            state.isAuthenticating = true;
          });

          await signOut();
          window.location.href = "/";
        } catch (error) {
          set((state) => {
            state.error = error as string;
          });
        } finally {
          set((state) => {
            state.isAuthenticated = false;
            state.session = null;
            state.user = null;
            state.name = null;
            state.isAuthenticating = false;
          });
        }
      },
    })),
    {
      name: "user-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
