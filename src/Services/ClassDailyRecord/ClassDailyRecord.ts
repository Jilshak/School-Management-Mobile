import api from "../axios";
import { ClassDailyRecord } from "./IClassDailyRecord";


export const fetchClassDailyRecords = async (
  date: string
): Promise<ClassDailyRecord[]> => {
  try {
    const response = await api.get(`/classdailyrecord/${date}`);
    return response.data;
  } catch (error) {
    return [];
  }
};