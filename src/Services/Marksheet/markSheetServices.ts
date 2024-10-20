import api from "../axios";

 export const getMarksheet = async () => {
    const response = await api.get(`/exams/offline-exam/student`);
    return response.data;
  };

  export const getExamMarksheet = async (examId:string) => {
    const response = await api.get(`/exams/result/student?examId=${examId}`);
    return response.data;
  };

  export const getExamResultByClassAndStudent = async (classId: string, studentId?: string) => {
    const url = `/exams/offline-exam/${classId}${studentId ? `?studentId=${studentId}` : ''}`;
    const response = await api.get(url);
    return response.data;
  };

export const getExistingResultOfStudent = async (examId: string, studentId: string) => {
  try {
    const response = await api.get('/exams/result/teacher', {
      params: {
        examId,
        studentId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching existing result of student:', error);
    throw error;
  }
};