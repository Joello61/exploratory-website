import { RecommendationItem } from "./recommendation-item";

export interface RecommendationCategory {
  title: string;
  icon: string;
  expanded: boolean;
  items: RecommendationItem[];
}

