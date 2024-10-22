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
    console.error('Error creating work done book:', error);
    throw error;
  }
};
