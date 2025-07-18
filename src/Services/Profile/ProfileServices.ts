import api from '../axios';

interface UserProfile {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
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
  qualifications: { degree: string; fieldOfStudy: string; instituteName: string; yearOfPass: number; gradePercentage: string; }[];
  previousEmployments: { instituteName: string; role: string; joinedDate: string; revealedDate: string; }[];
  id: string;
  username: string;
  name: string;
  email: string;

  classroom?: {
    _id: string;
    name: string;
    academicYear: {
      _id: string;
      startDate: string;
      endDate: string;
    };
    classTeacherId: string;
    isActive: boolean;
    schoolId: string;
    subjects: string[];
  };
  enrollmentNumber?: string;
  state?: string;
  tcDocument?: string;
  tcNumber?: string;
}

export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get(`/user/getmydetails/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (id:string, profile: UserProfile): Promise<UserProfile> => {
  try {
    const response = await api.patch(`/user/${id}`, profile);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    console.log(username)
    const response = await api.get(`/user/check-username/${username}`);
    console.log(response.data)
    return response.data.available;
  } catch (error) {
    console.error("Error checking username availability:", error);
    throw error;
  }
};

