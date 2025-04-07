export interface IncorrectAnswer {
  questionId: number;
  userAnswer: number;
  correctAnswer: number;
  feedback: string; // Explication de la bonne réponse
}

