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
}

export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get(`/user/getmydetails/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

