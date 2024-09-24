export const questions: { [key: string]: Question[] } = {
  Mathematics: [
    { id: 1, question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: '4', chapterId: 'math1' },
    { id: 2, question: 'What is 3 * 3?', options: ['6', '7', '8', '9'], correctAnswer: '9', chapterId: 'math1' },
    // ... (add more questions for each chapter)
  ],
  Science: [
    { id: 1, question: 'What is the chemical symbol for water?', options: ['H2O', 'O2', 'CO2', 'NaCl'], correctAnswer: 'H2O', chapterId: 'sci1' },
    { id: 2, question: 'What planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars', chapterId: 'sci1' },
    // ... (add more questions for each chapter)
  ],
  // ... (add questions for other subjects)
};

export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  chapterId: string;
};