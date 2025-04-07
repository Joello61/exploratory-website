export interface CvAnnotation {
  id: string;
  title: string;
  text: string;
  position: {
    top: number;
    left: number;
  };
  target?: string; // Identifiant de l'élément cible (optionnel)
}

