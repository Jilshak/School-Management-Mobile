import api from "../axios";

export const getTimetableForStudent = async () => {
  const res = await api.get(`/timetable/student`);
  return res.data;
};


export const getTeacherTimetable = async ()=> {
    try {
      const response = await api.get(`/timetable/teacher-timetable`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher timetable:', error);
      throw error;
    }
  };