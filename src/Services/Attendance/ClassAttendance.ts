import api from '../axios';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
}

interface AttendanceRecord {
  studentId: string;
  present: boolean;
}

export const fetchStudentsInClass = async (classId: string): Promise<Student[]> => {
  try {
    const response = await api.get(`/classroom/${classId}`);
    return response.data.students;
  } catch (error) {
    console.error("Error fetching students in class:", error);
    throw error;
  }
};

export const markAttendance = async (classId: string, date: string, attendanceRecords: AttendanceRecord[]): Promise<void> => {
  try {
    await api.post(`/attendance/${classId}`, { date, attendanceRecords });
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

export const fetchAttendanceForClass = async (classId: string): Promise<AttendanceRecord[]> => {
  try {
    const response = await api.get(`/classroom/66f6dcfd7c56fe0bb7ab7a53`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance for class:", error);
    throw error;
  }
};

export const saveAttendance = async (attendanceData: any) => {
  try {
    const response = await api.post("/attendance", attendanceData);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error saving attendance:", error);
    throw error;
  }
};
