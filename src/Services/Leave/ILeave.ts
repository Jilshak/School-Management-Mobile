export interface LeaveRequest {
    _id: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    type: 'sick' | 'casual' | 'other';
    attachments?: string[];
  }