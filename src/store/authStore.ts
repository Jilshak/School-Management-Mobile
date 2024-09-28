import { create } from "zustand";
import { loginUser } from "../Services/Login/LoginServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import useProfileStore, { ProfileState } from "./profileStore";
import { fetchUserProfile } from "../Services/Profile/ProfileServices";

export interface AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  decodeAndSaveToken: (token: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  login: async (username: string, password: string) => {
    const credentials = { username, password };
    const isAuthenticated = await loginUser(credentials);
    if (isAuthenticated.access_token) {
      await AsyncStorage.setItem("token", isAuthenticated.access_token);
      await useAuthStore
        .getState()
        .decodeAndSaveToken(isAuthenticated.access_token);
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem("token");
    useProfileStore.getState().clearProfile();
  },
  decodeAndSaveToken: async (token: string) => {
    try {
      const decodedToken: any = jwtDecode(token);
      const profile = await fetchUserProfile();

      const profileData: ProfileState = {
        userId: profile.userId,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        contactNumber: profile.contactNumber,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        nationality: profile.nationality,
        adhaarNumber: profile.adhaarNumber,
        pancardNumber: profile.pancardNumber,
        joinDate: profile.joinDate,
        isActive: profile.isActive,
        roles: profile.roles,
        schoolId: profile.schoolId,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactNumber: profile.emergencyContactNumber,
        qualifications: profile.qualifications,
        previousEmployments: profile.previousEmployments,
      };

      useProfileStore.getState().setProfile(profileData);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  },
  fetchProfile: async () => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      const profile = await fetchUserProfile();
      useProfileStore.getState().setProfile(profile);
    }
  },
}));

export default useAuthStore;
