import api from "../axios";

export const getAttendanceDetails = async (classId: string, date: string) => {
  try {
    const response = await api.get(`/attendance/${classId}/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance details:', error);
    throw error;
  }
};
