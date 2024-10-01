export interface IUser {
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
    qualifications: {
      degree: string;
      fieldOfStudy: string;
      instituteName: string;
      yearOfPass: number;
      gradePercentage: string;
    }[];
    previousEmployments: {
      instituteName: string;
      role: string;
      joinedDate: string;
      revealedDate: string;
    }[];
    id: string;
    username: string;
    name: string;
    email: string;
    enrollmentNumber: string;
    performance: number;
    attendance: number;
    bloodGroup?: string;
    classroom: {
      name: string;
      academicYear: {
        startDate: string;
        endDate: string;
      };
      classTeacher: {
        firstName?: string | null;
        lastName?: string | null;
      }[];
    };
    remarks?: string;
    extraCurricular?: string[]
    achievements: string[]
    parentsDetails?: {
      guardianName: string;
      guardianContactNumber: string;
      relationshipToStudent: string;
    };
  }