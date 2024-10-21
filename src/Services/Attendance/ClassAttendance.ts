import api from "../axios";
import { AttendanceRecord, RegularizeAttendanceParams, Student, RegularizationRequest, RegularizationStatus } from "./IClassAttendance";


export const fetchStudentsInClass = async (
  classId: string
): Promise<Student[]> => {
  try {
    const response = await api.get(`/classroom/${classId}`);
    return response.data.students;
  } catch (error) {
    console.error("Error fetching students in class:", error);
    throw error;
  }
};

export const markAttendance = async (
  classId: string,
  date: string,
  attendanceRecords: AttendanceRecord[]
): Promise<void> => {
  try {
    await api.post(`/attendance/${classId}`, { date, attendanceRecords });
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

export const fetchAttendanceForClass = async (
  classId: string
): Promise<AttendanceRecord[]> => {
  try {
    const response = await api.get(`/classroom/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance for class:", error);
    throw error;
  }
};

export const saveAttendance = async (attendanceData: any) => {
  try {
    const response = await api.post("/attendance", attendanceData);
    return response.data;
  } catch (error) {
    console.error("Error saving attendance:", error);
    throw error;
  }
};

export const getAttendance = async (year: number, month: number) => {
  try {
    const response = await api.get(`/attendance/student-attendance/`, {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};

export const regularizeAttendance = async ({
  attendanceId,
  reason,
  date,
  type,
}: {
  attendanceId: string;
  reason: string;
  date: string;
  type: "fullDay" | "halfDay";
}) => {
  try {
    const response = await api.post("/attendance/regularization", {
      attendanceId,
      reason,
      date,
      type,
    });
    return response.data;
  } catch (error) {
    console.error("Error regularizing attendance:", error);
    throw error;
  }
};

export const fetchRegularizationRequests = async (): Promise<RegularizationRequest[]> => {
  try {
    const response = await api.get('/attendance/regularization/teacher');
    return response.data;
  } catch (error) {
    console.error("Error fetching regularization requests:", error);
    throw error;
  }
};

export const updateRegularizationRequest = async (
  id: string, 
  status: RegularizationStatus,
  type: string
): Promise<RegularizationRequest> => {
  try {
    const response = await api.patch(`/attendance/regularization/approve-or-reject/${id}`, { status, type });
    return response.data;
  } catch (error) {
    console.error('Error updating regularization request:', error);
    throw error;
  }
};
