import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ProfileState {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  adhaarNumber: string;
  pancardNumber: string;
  joinDate: string;
  isActive: boolean;
  roles: string[];
  schoolId: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  qualifications: Array<{
    degree: string;
    fieldOfStudy: string;
    instituteName: string;
    yearOfPass: number;
    gradePercentage: string;
  }>;
  previousEmployments: Array<{
    instituteName: string;
    role: string;
    joinedDate: string;
    revealedDate: string;
  }>;
}

interface ProfileStore {
  profile: ProfileState | null;
  setProfile: (profile: ProfileState) => void;
  clearProfile: () => void;
}

const useProfileStore = create(
  persist<ProfileStore>(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useProfileStore;

