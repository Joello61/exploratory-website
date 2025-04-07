export interface Scenario {
    title: string;
    description: string;
    options: string[];
    correctOption: number;
    feedback: {
      correct: string;
      incorrect: string;
    };
}
