import api from '../axios';
import { WorkDoneBookEntry } from './IWorkDoneBookService';

export const createWorkDoneBook = async (workDoneBooks: WorkDoneBookEntry[]) => {
  try {
    const response = await api.post(`/workdonebook`, workDoneBooks);
    return response.data;
  } catch (error) {
    return null;
  }
};


export const fetchWorkDoneLogs = async (startDate: string, endDate?: string) => {
  try {
    let url = `/workdonebook/daily?date=${startDate}`;
    if (endDate) {
      url = `/workdonebook/weekly?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    return [];
  }
};
