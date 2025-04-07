import { RelatedImage } from "./related-image";

export interface Interest {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  since?: string;
  frequency?: string;
  skillsRelated?: string[];
  relatedImages?: RelatedImage[];
  highlight?: string;
  requiredEvidence: string;
}

