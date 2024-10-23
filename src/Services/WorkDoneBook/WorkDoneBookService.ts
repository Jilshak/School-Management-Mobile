import api from '../axios';

interface WorkDoneBookEntry {
  classroomId: string;
  subjectId: string;
  date: Date;
  topics: string[];
  activities: string[];
  homework: string[];
}

export const createWorkDoneBook = async (workDoneBooks: WorkDoneBookEntry[]) => {
  try {
    const response = await api.post(`/workdonebook`, workDoneBooks);
    return response.data;
  } catch (error) {
    return null;
  }
};


export const fetchWorkDoneLogs = async (date: string) => {
  try {
    const response = await api.get(`/workdonebook/daily?date=${date}`);
    return response.data;
  } catch (error) {
    return [];
  }
};
