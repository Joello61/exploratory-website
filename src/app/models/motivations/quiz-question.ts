export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index de la bonne réponse
}

