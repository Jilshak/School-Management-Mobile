import api from "../axios";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
}

interface AttendanceRecord {
  studentId: string;
  present: boolean;
}

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
