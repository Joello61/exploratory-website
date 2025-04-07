export interface UserResponse {
  moduleId: string;
  questionId: string;
  response: string | string[] | number | boolean;
  timestamp: number;
}