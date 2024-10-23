export interface ClassDailyRecord {
  _id: string;
  date: string;
  schoolId: string;
  classroomId: string;
  classroomName: string;
  entries: Entry[];
}

export interface Entry {
  subjectId: string;
  subjectName: string;
  teacherName: string;
  topics: string[];
  activities?: string[];
  homework?: string[];
}
