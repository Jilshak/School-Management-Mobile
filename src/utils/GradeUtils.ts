export const calculateGrade = (score: number, totalMark: number): string => {
  const percentage = (score / totalMark) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'F';
};

export const calculatePercentage = (score: number, totalMark: number): number => {
  return (score / totalMark) * 100;
};
