export type AttendanceStatus = "present" | "absent" | "half-day";

export interface IStudent {
    _id: string;
    studentDetails: {
      _id: string;
      firstName: string;
      lastName: string;
      enrollmentNumber: string;
    };
    attendanceStatus: AttendanceStatus;
    comment?: string;
  }
  