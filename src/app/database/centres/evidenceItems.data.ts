import { Evidence } from "../../models/centres/evidence";

export const EVIDENCEITEMSDATA: Evidence[] = [
    {
      id: 'evidence-cooking',
      name: 'Ustensiles de cuisine spécialisés',
      icon: 'bi-egg-fried',
      description:
        "Un ensemble d'ustensiles de cuisine de qualité et des ingrédients variés ont été découverts, témoignant d'une passion pour l'expérimentation culinaire et la préparation de plats créatifs.",
      discovered: false,
      unlocksInterests: ['cooking'],
    },
    {
      id: 'evidence-music',
      name: 'Équipement audio et partitions',
      icon: 'bi-music-note-beamed',
      description:
        "Un microphone de qualité et des partitions de chant ont été identifiés, révélant une pratique régulière du chant et un intérêt pour l'exploration de différents styles vocaux.",
      discovered: false,
      unlocksInterests: ['singing'],
    },
    {
      id: 'evidence-sports',
      name: 'Équipement de basketball',
      icon: 'bi-dribbble',
      description:
        'Un ballon de basketball, des chaussures de sport spécialisées et un abonnement à un complexe sportif ont été trouvés, indiquant une pratique hebdomadaire du basketball en loisir.',
      discovered: false,
      unlocksInterests: ['basketball'],
    },
    {
      id: 'evidence-tech',
      name: 'Abonnements à des newsletters tech',
      icon: 'bi-cpu',
      description:
        "Plusieurs abonnements à des newsletters sur les innovations technologiques, notamment dans les domaines du développement web, mobile et des technologies 3D, témoignent d'une veille quotidienne sur les avancées du secteur.",
      discovered: false,
      unlocksInterests: ['new-tech'],
    },
  
];
