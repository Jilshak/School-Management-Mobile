export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  chapterId: string;
};

export const questions: { [key: string]: Question[] } = {
  Mathematics: [
    { id: 1, question: "What is 2 + 2?", options: ["3", "4", "5", "6"], correctAnswer: "4", chapterId: "math1" },
    { id: 2, question: "What is 3 * 3?", options: ["6", "7", "8", "9"], correctAnswer: "9", chapterId: "math1" },
    { id: 3, question: "What is the square root of 16?", options: ["2", "3", "4", "5"], correctAnswer: "4", chapterId: "math2" },
    // Add more mathematics questions here
  ],
  Physics: [
    { id: 1, question: "What is the SI unit of force?", options: ["Newton", "Joule", "Watt", "Pascal"], correctAnswer: "Newton", chapterId: "phy5" },
    { id: 2, question: "Which law of motion states that 'For every action, there is an equal and opposite reaction'?", options: ["First law", "Second law", "Third law", "Fourth law"], correctAnswer: "Third law", chapterId: "phy5" },
    { id: 3, question: "What is the speed of light in vacuum?", options: ["299,792 km/s", "300,000 km/s", "3,000,000 km/s", "30,000 km/s"], correctAnswer: "299,792 km/s", chapterId: "phy1" },
    // Add more physics questions here
  ],
  Biology: [
    { id: 1, question: "What is the basic unit of life?", options: ["Atom", "Cell", "Tissue", "Organ"], correctAnswer: "Cell", chapterId: "bio8" },
    { id: 2, question: "Which organelle is known as the 'powerhouse' of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"], correctAnswer: "Mitochondria", chapterId: "bio8" },
    { id: 3, question: "What is the process by which plants make their own food?", options: ["Respiration", "Photosynthesis", "Digestion", "Excretion"], correctAnswer: "Photosynthesis", chapterId: "bio13" },
    // Add more biology questions here
  ],
  Chemistry: [
    { id: 1, question: "What is the atomic number of Carbon?", options: ["5", "6", "7", "8"], correctAnswer: "6", chapterId: "chem2" },
    { id: 2, question: "Which of these is a noble gas?", options: ["Oxygen", "Nitrogen", "Helium", "Chlorine"], correctAnswer: "Helium", chapterId: "chem3" },
    { id: 3, question: "What is the chemical formula for sulfuric acid?", options: ["H2SO3", "H2SO4", "HSO3", "H2S2O7"], correctAnswer: "H2SO4", chapterId: "chem1" },
    // Add more chemistry questions here
  ],
};