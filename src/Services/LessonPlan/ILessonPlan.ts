export interface LessonPlanEntry {
  classroomId: string;
  subjectId: string;
  topics: string[];
  activities: string[];
  chapters: string[];
  objectives: string[];
  corePoints: string[];
  evaluations: string[];
  learningOutcomes: string[];
}

export interface LessonPlanData {
  startDate: string;
  endDate: string;
  entries: LessonPlanEntry[];
}
