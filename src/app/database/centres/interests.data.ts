import { Interest } from "../../models/centres/interest";

export const INTERESTSDATA: Interest[] = [
    // Cuisine
    {
      id: 'cooking',
      name: 'Cuisine',
      icon: 'bi-egg-fried',
      category: 'culinary',
      description:
        "Passion pour l'expérimentation culinaire et la préparation de plats créatifs, en explorant diverses techniques et influences internationales.",
      frequency: 'Plusieurs fois par semaine',
      skillsRelated: ['Créativité', 'Précision', 'Organisation'],
      requiredEvidence: 'evidence-cooking',
    },

    // Musique
    {
      id: 'singing',
      name: 'Chant',
      icon: 'bi-mic',
      category: 'music',
      description:
        'Pratique du chant comme expression artistique personnelle, avec un plaisir à explorer différents styles et techniques vocales.',
      frequency: 'Régulière',
      skillsRelated: [
        'Expression artistique',
        'Technique vocale',
        'Confiance en soi',
      ],
      requiredEvidence: 'evidence-music',
    },

    // Basketball
    {
      id: 'basketball',
      name: 'Basketball',
      icon: 'bi-dribbble',
      category: 'sports',
      description:
        "Pratique du basketball en loisir, permettant de maintenir une bonne condition physique tout en développant l'esprit d'équipe.",
      frequency: 'Hebdomadaire',
      skillsRelated: ["Esprit d'équipe", 'Coordination', 'Endurance'],
      requiredEvidence: 'evidence-sports',
    },

    // Nouvelles Technologies
    {
      id: 'new-tech',
      name: 'Nouvelles Technologies',
      icon: 'bi-cpu',
      category: 'tech',
      description:
        'Veille constante sur les innovations technologiques, particulièrement dans les domaines du développement web, mobile et des technologies 3D.',
      frequency: 'Quotidienne',
      skillsRelated: [
        'Curiosité technique',
        'Adaptabilité',
        'Apprentissage continu',
      ],
      requiredEvidence: 'evidence-tech',
    },
  
];
