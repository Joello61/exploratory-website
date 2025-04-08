import { RecommendationCategory } from "../../models/conclusion/recommendation-category";

export const RECOMMENDATIONCATEGORIESDATA: RecommendationCategory[] = [
    {
      title: 'Environnement de travail',
      icon: 'bi-building',
      expanded: true,
      items: [
        {
          content:
            "Équipe technique pluridisciplinaire permettant d'échanger avec des experts en frontend, backend et 3D",
        },
        {
          content:
            "Culture valorisant l'équilibre entre études et travail pendant l'alternance",
        },
        {
          content: 'Structure offrant du mentorat par des développeurs seniors',
        },
        {
          content:
            "Environnement favorisant l'innovation technique et l'exploration des nouvelles technologies",
        },
      ],
    },
    {
      title: 'Type de projets',
      icon: 'bi-briefcase',
      expanded: false,
      items: [
        {
          content:
            "Applications web/mobile avec composante 3D ou traitement d'images",
        },
        {
          content:
            'Projets fullstack impliquant à la fois frontend Vue.js et backend API REST',
        },
        {
          content: 'Initiatives incluant des aspects DevOps et CI/CD',
        },
        {
          content: 'Projets nécessitant une documentation technique rigoureuse',
        },
      ],
    },
    {
      title: 'Développement professionnel',
      icon: 'bi-graph-up',
      expanded: false,
      items: [
        {
          content:
            'Évolution vers un rôle de développeur Fullstack senior avec spécialisation 3D',
        },
        {
          content:
            'Formation continue sur les frameworks frontend et backend modernes',
        },
        { content: 'Approfondissement des compétences DevOps et CI/CD' },
        {
          content:
            'Préparation à des responsabilités techniques et de gestion de projets',
        },
      ],
    },
    {
      title: 'Équilibre personnel',
      icon: 'bi-heart',
      expanded: false,
      items: [
        {
          content:
            "Environnement respectant l'équilibre entre vie professionnelle et personnelle",
        },
        {
          content:
            'Flexibilité pour concilier les passions (cuisine, chant, basketball)',
        },
        { content: 'Possibilité de travail hybride ou télétravail partiel' },
        {
          content:
            "Culture d'entreprise valorisant la créativité et l'expression personnelle",
        },
      ],
    },
  
];
