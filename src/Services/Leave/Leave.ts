import api from '../axios';
import { LeaveRequest } from './ILeave';

export const fetchLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const response = await api.get(`/attendance/leave-request/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createLeaveRequest = async (leaveData: Partial<LeaveRequest>) => {
  try {
    const response = await api.post('/attendance/leave-request', leaveData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLeaveRequest = async (id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest> => {
  try {
    const response = await api.patch(`/attendance/leave-request/${id}`, updates);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLeaveRequest = async (id: string): Promise<void> => {
  try {
    await api.delete(`/attendance/leave-request/${id}`);
  } catch (error) {
    throw error;
  }
};

export const approveLeaveRequest = async (id: string): Promise<LeaveRequest> => {
  try {
    const response = await api.patch(`/attendance/leave-request/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectLeaveRequest = async (id: string): Promise<LeaveRequest> => {
  try {
    const response = await api.patch(`/attendance/leave-request/${id}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLeaveRequests = async () => {
  try {
    const response = await api.get('/attendance/leave-requests');
    return response.data;
  } catch (error) {
    throw error;
  }
};
