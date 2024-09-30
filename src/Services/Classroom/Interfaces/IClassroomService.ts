export interface ServerResponse {
    classrooms: {
      _id: string;
      name: string;
      studentCount: number;
      classTeacherDetails: {
        name: string;
      };
      students: {
        _id: string;
        studentDetails: {
          name: string;
          rollNumber: string;
          performance: number;
          attendance: number;
        }
      }[];
      subjects: {
        _id: string;
        name: string;
        code: string;
      }[];
    }[];
    totalCount: number;
  }

export interface StudentDetails {
  __v: number;
  _id: string;
  address: string;
  adhaarDocument: string;
  adhaarNumber: string;
  birthCertificateDocument: string;
  classId: string;
  contactNumber: string;
  dateOfBirth: string;
  email: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  enrollmentNumber: string;
  firstName: string;
  gender: string;
  isActive: boolean;
  joinDate: string;
  lastName: string;
  nationality: string;
  parentsDetails: any; // You might want to define a more specific type for this
  state: string;
  tcDocument: string;
  performance: number;
  tcNumber: string;
  userId: string;
}

export interface ClassDetails {
  _id: string;
  academicYear: any; // You might want to define a more specific type for this
  name: string;
}

export interface ClassroomStudent {
  _id: string;
  studentDetails: {
    firstName: string;
    lastName: string;
    enrollmentNumber: string;
    gender: string;
    performance?: number;
    attendance?: number;
  };
  // ... other fields
}

export interface FetchClassroomByIdResponse {
  [index: number]: ClassroomStudent;
}

// Update the existing IClassroomService interface
export interface IClassroomService {
  // ... existing methods ...
  fetchClassroomById: (classId: string) => Promise<FetchClassroomByIdResponse>;
}