export interface LeaveRequest {
    _id: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    type: 'sick' | 'casual' | 'other';
    attachments?: string[];
  }

export interface StudentDetails {
    _id: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    contactNumber: string;
    state: string;
    address: string;
    joinDate: string;
    enrollmentNumber: string;
    classId: string;
    parentsDetails: {
        guardianName: string;
        guardianContactNumber: string;
        relationshipToStudent: string;
        _id: string;
    };
    adhaarNumber: string;
    adhaarDocument: string;
    birthCertificateDocument: string;
    tcNumber: string;
    tcDocument: string;
    emergencyContactName: string;
    emergencyContactNumber: string;
    isActive: boolean;
    bloodGroup: string;
    extraCurricular: string[];
    remarks: string;
    achievements: string[];
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequestByTeacher {
    _id: string;
    status: LeaveStatus;
    startDate: string;
    endDate: string;
    reason: string;
    studentId?: string;
    classId: string;
    createdAt: string;
    updatedAt: string;
    studentDetails: StudentDetails;
}
