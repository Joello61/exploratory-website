import { SubBranch } from './sub-branch';

export interface AspirationBranch {
  title: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  revealed: boolean;
  subBranches: SubBranch[];
}
