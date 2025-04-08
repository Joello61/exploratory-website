import { Location } from "../../models/itineraire/location";

export const ORIGINLOCATIONSDATA: Location[] = [
    {
      id: 'loc1',
      name: 'Toulouse',
      period: '2024 - Présent',
      description:
        "Lieu de résidence actuel et ville d'études pour le Master Informatique à l'Université de Toulouse Jean Jaurès.",
      coordinates: { lat: 43.6047, lng: 1.4442 }, // Coordonnées réelles de Toulouse
      data: [
        { label: 'Influence', value: 'Actuelle' },
        { label: 'Formation', value: 'Master Informatique' },
        { label: "Secteur d'activité", value: 'Développement Fullstack' },
      ],
      discovered: false,
    },
    {
      id: 'loc2',
      name: 'Marseille',
      period: '2024 - Présent',
      description:
        "Lieu de l'alternance chez ANG Tech, où se déroule l'expérience professionnelle actuelle en développement Fullstack.",
      coordinates: { lat: 43.2965, lng: 5.3698 }, // Coordonnées réelles de Marseille
      data: [
        { label: 'Influence', value: 'Professionnelle' },
        { label: 'Expérience', value: 'Développement 3D' },
        { label: 'Connexions', value: 'Professionnelles' },
      ],
      discovered: false,
    },
    {
      id: 'loc3',
      name: 'Yaoundé, Cameroun',
      period: '2020 - 2023',
      description:
        "Lieu des premières expériences professionnelles (stages chez SKOOVEL et Megasoft) et des études en Licence et DUT à l'IUT de Bandjoun.",
      coordinates: { lat: 3.848, lng: 11.5021 }, // Coordonnées réelles de Yaoundé
      data: [
        { label: 'Influence', value: 'Fondamentale' },
        { label: 'Formation initiale', value: 'Informatique' },
        {
          label: 'Expériences',
          value: 'Premières expériences professionnelles',
        },
      ],
      discovered: false,
    },
    {
      id: 'loc4',
      name: 'Bandjoun, Cameroun',
      period: '2020 - 2023',
      description:
        "Site de l'IUT où ont été suivies les formations de DUT Génie Logiciel et de Licence Informatique et réseau.",
      coordinates: { lat: 5.3772, lng: 10.4111 }, // Coordonnées approximatives de Bandjoun
      data: [
        { label: 'Influence', value: 'Académique' },
        { label: 'Formation', value: 'DUT et Licence' },
        { label: 'Environnement', value: 'Universitaire' },
      ],
      discovered: false,
    },
  
];
