import { Education } from "../../models/itineraire/education";

export const EDUCATIONTIMELINEDATA: Education[] = [
    {
      id: 'edu1',
      years: '2024 - En cours',
      title: 'Master Informatique',
      institution: 'Université de Toulouse Jean Jaurès, Toulouse',
      description:
        "Formation avancée en informatique avec spécialisation en développement d'applications, réalisée en alternance pour combiner théorie et pratique professionnelle chez ANG Tech.",
      skills: [
        'Développement Fullstack',
        'Intégration 3D',
        'Architecture logicielle',
        'DevOps & CI/CD',
      ],
      achievements: [
        "Projet d'alternance : Développement d'une application web/mobile avec intégration 3D",
        'Mise en place de pipelines CI/CD avec GitLab',
        'Rédaction de documentation technique complète',
      ],
      discovered: true,
      expanded: false,
    },
    {
      id: 'edu2',
      years: '2022 - 2023',
      title: 'Licence Informatique et réseau',
      institution: 'IUT de Bandjoun, Cameroun',
      description:
        "Formation approfondie en informatique et réseaux, avec un focus sur les technologies web, les architectures de systèmes d'information et la sécurité informatique.",
      skills: [
        'Programmation avancée',
        'Architecture réseau',
        'Sécurité des systèmes',
        'Bases de données relationnelles',
      ],
      achievements: [
        'Stage de 10 mois chez SKOOVEL en tant que consultant informatique',
        'Projets académiques en développement web et gestion de bases de données',
        'Analyse de données et support technique en environnement professionnel',
      ],
      discovered: true,
      expanded: false,
    },
    {
      id: 'edu3',
      years: '2020 - 2022',
      title: 'DUT Génie Logiciel',
      institution: 'IUT de Bandjoun, Cameroun',
      description:
        "Formation technique axée sur le développement logiciel, les méthodologies de conception et la programmation, établissant des bases solides en développement d'applications.",
      skills: ['Java', 'PHP', 'JavaScript', 'Conception orientée objet'],
      achievements: [
        'Stage de 3 mois chez Megasoft Sarl en développement web',
        "Intégration d'API REST et maintenance d'applications",
        'Optimisation de requêtes SQL et tests unitaires',
      ],
      discovered: true,
      expanded: false,
    },
  
];
