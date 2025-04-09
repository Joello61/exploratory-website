export interface MapQuestion {
    id: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
    locationId: string; // ID de l'emplacement correspondant à découvrir
    feedback: {
      correct: string;
      incorrect: string;
    };
  }