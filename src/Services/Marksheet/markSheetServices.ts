import api from "../axios";

 export const getMarksheet = async () => {
    const response = await api.get(`/exams/offline-exam/student`);
    return response.data;
  };

  export const getExamMarksheet = async (examId:string) => {
    const response = await api.get(`/exams/result/student?examId=${examId}`);
    return response.data;
  };
