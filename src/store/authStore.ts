import { create } from "zustand";
import { loginUser } from "../Services/Login/LoginServices";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  login: async (username: string, password: string) => {
    const credentials = { username, password };
    const isAuthenticated = await loginUser(credentials);
    if (isAuthenticated.access_token) {
      console.log("reaching here")
      await AsyncStorage.setItem("token", isAuthenticated.access_token);
    }
  },
  logout: () => {
    AsyncStorage.removeItem("token");
  },
}));

const fakeApiLogin = async (
  email: string,
  password: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === "admin" && password === "admin") {
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1000);
  });
};

export default useAuthStore;
