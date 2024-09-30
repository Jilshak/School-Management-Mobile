import { logJSON } from '../../utils/logger';
import api from '../axios';
import { ServerResponse } from './Interfaces/IClassroomService';
import { IClassroomService, FetchClassroomByIdResponse } from './Interfaces/IClassroomService';

export const fetchAllClassrooms = async (): Promise<ServerResponse> => {
  try {
    const response = await api.get<ServerResponse>('/classroom/with-students');
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    throw error;
  }
};

export const fetchClassroomById = async (classId: string): Promise<FetchClassroomByIdResponse> => {
  try {
    const response = await api.get(`/classroom/${classId}`);
    return response.data.students;
  } catch (error) {
    console.error('Error fetching classroom:', error);
    throw error;
  }
};

export const createClassroom = async (classroom: Omit<ServerResponse, '_id'>): Promise<ServerResponse> => {
  try {
    const response = await api.post('/classroom', classroom);
    return response.data;
  } catch (error) {
    console.error("Error creating classroom:", error);
    throw error;
  }
};

export const updateClassroom = async (id: string, classroom: Partial<ServerResponse>): Promise<ServerResponse> => {
  try {
    const response = await api.patch(`/classroom/${id}`, classroom);
    return response.data;
  } catch (error) {
    console.error(`Error updating classroom with id ${id}:`, error);
    throw error;
  }
};

export const deleteClassroom = async (id: string): Promise<void> => {
  try {
    await api.delete(`/classroom/${id}`);
  } catch (error) {
    console.error(`Error deleting classroom with id ${id}:`, error);
    throw error;
  }
};