import api from "../axios";

export const getTimetableForStudent = async () => {
  const res = await api.get(`/timetable/student`);
  return res.data;
};
