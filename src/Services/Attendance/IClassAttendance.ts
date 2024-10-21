export interface Student {
    _id: string;
    firstName: string;
    lastName: string;
  }
  
  export interface AttendanceRecord {
    studentId: string;
    present: boolean;
  }
  
  export interface RegularizeAttendanceParams {
    attendanceId: string;
    reason: string;
    date: string;
  }
  
  export interface RegularizationRequest {
    _id: string;
    attendanceId: string;
    studentId: string;
    classId: string;
    date: string;
    reason: string;
    status: RegularizationStatus;
    studentName: string;
    createdAt: string;
    updatedAt: string;
    type: "fullDay" | "halfDay";
  }

  export type RegularizationStatus = 'pending' | 'approved' | 'rejected';
