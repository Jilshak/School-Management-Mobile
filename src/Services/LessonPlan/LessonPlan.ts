import api from '../axios';
import { LessonPlanData } from './ILessonPlan';

export const createLessonPlan = async (lessonPlan: LessonPlanData[]) => {
  try {
    console.log(lessonPlan[0].entries[0], "lessonPlan");
    const response = await api.post(`/lessonplan`, lessonPlan);
    return response.data;
  } catch (error) {
    return null;
  }
};


export const fetchLessonPlan = async (startDate: string, endDate: string) => {
  try {
    const response = await api.get(`/lessonplan/weekly?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    return [];
  }
};
