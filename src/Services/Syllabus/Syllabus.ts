import api from '../axios';
import { ISyllabus } from './ISyllabus';


export const fetchSyllabus = async () => {
    try {
      const response = await api.get(`/syllabus/students`);
      return response.data as ISyllabus[];
    } catch (error) {
      return [] as ISyllabus[];
    }
  };
