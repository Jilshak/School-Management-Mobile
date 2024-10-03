import api from '../axios';
import { LeaveRequest } from './ILeave';

export const fetchLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const response = await api.get(`/attendance/leave-request/student`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createLeaveRequest = async (leaveData: Partial<LeaveRequest>) => {
  try {
    const response = await api.post('/attendance/leave-request', leaveData);
    return { status: response.status, data: response.data };
  } catch (error: any) {
    if (error.response) {
      throw { status: error.response.status, message: error.response.data };
    } else {
      throw { status: 500, message: 'An unexpected error occurred' };
    }
  }
};

export const updateLeaveRequest = async (
  id: string,
  leaveRequestData: Partial<LeaveRequest>
): Promise<LeaveRequest> => {
  try {
    console.log(id, leaveRequestData);
    const response = await api.patch(`/attendance/leave-request/edit/${id}`, leaveRequestData);
    return response.data;
  } catch (error) {
    console.error('Error updating leave request:', error);
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
