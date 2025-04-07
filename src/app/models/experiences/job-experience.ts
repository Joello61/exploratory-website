import { JobClue } from "./job-clue";

export interface JobExperience {
  title: string;
  company: string;
  period: string;
  description: string;
  clues: JobClue[];
  skills: string[];
  notes: string;
  conclusion: string;
  achievement: string;
}

