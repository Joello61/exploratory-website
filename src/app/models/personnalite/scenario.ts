import { Response } from './response';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  responses: Response[];
}

