import api from "../axios";
import { ClassDailyRecord } from "./IClassDailyRecord";


export const fetchClassDailyRecords = async (
  date: string
): Promise<ClassDailyRecord[]> => {
  try {
    const response = await api.get(`/classdailyrecord/${date}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching class daily records:", error);
    return [];
  }
};