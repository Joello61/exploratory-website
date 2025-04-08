import { AspirationBranch } from '../../models/attentes/aspiration-branch';

export const ASPIRATIONBRANCHESDATA: AspirationBranch[] = [
  {
    title: 'Expertise Technique',
    icon: 'bi-code-slash',
    priority: 'high',
    revealed: false,
    subBranches: [
      {
        title: 'Maîtrise des Frameworks Frontend',
        icon: 'bi-window',
        description:
          'Perfectionner votre expertise en Vue.js et approfondir vos connaissances en Angular pour développer des interfaces utilisateur avancées et performantes.',
        priority: 'high',
        revealed: false,
      },
      {
        title: 'Technologies 3D Web',
        icon: 'bi-box',
        description:
          "Approfondir vos compétences en intégration 3D web, en vous appuyant sur votre expérience acquise chez ANG Tech dans le développement d'applications intégrant la 3D.",
        priority: 'medium',
        revealed: false,
      },
      {
        title: 'Backend Robuste',
        icon: 'bi-server',
        description:
          'Renforcer votre maîtrise des frameworks backend (Spring Boot, Symfony, Node.js) et des architectures API REST sécurisées que vous avez déjà commencé à utiliser.',
        priority: 'high',
        revealed: false,
      },
    ],
  },
  {
    title: 'Spécialisation DevOps',
    icon: 'bi-gear-wide-connected',
    priority: 'medium',
    revealed: false,
    subBranches: [
      {
        title: 'CI/CD Avancé',
        icon: 'bi-arrow-repeat',
        description:
          "Développer une expertise plus poussée en pipelines CI/CD en vous basant sur votre expérience avec GitLab, et explorer d'autres outils comme Jenkins ou GitHub Actions.",
        priority: 'medium',
        revealed: false,
      },
      {
        title: 'Conteneurisation & Orchestration',
        icon: 'bi-boxes',
        description:
          "Approfondir vos connaissances Docker et vous former à Kubernetes pour l'orchestration de conteneurs à grande échelle.",
        priority: 'high',
        revealed: false,
      },
      {
        title: 'Infrastructure as Code',
        icon: 'bi-file-code',
        description:
          'Acquérir des compétences en IaC avec des outils comme Terraform ou Ansible pour compléter votre profil DevOps.',
        priority: 'medium',
        revealed: false,
      },
    ],
  },
  {
    title: 'Innovation Mobile',
    icon: 'bi-phone',
    priority: 'high',
    revealed: false,
    subBranches: [
      {
        title: 'Applications Hybrides',
        icon: 'bi-phone-flip',
        description:
          'Exploiter votre expérience en développement mobile pour maîtriser des frameworks comme React Native ou Flutter, en complément de vos compétences web.',
        priority: 'high',
        revealed: false,
      },
      {
        title: 'Réalité Augmentée',
        icon: 'bi-badge-ar',
        description:
          "Étendre vos compétences en 3D vers la réalité augmentée, en vous appuyant sur votre expérience d'intégration d'API de traitement d'images.",
        priority: 'medium',
        revealed: false,
      },
      {
        title: 'PWA Avancées',
        icon: 'bi-app',
        description:
          'Développer une expertise en Progressive Web Apps pour créer des expériences mobiles performantes, même hors connexion.',
        priority: 'medium',
        revealed: false,
      },
    ],
  },
  {
    title: 'Data & Analytics',
    icon: 'bi-database',
    priority: 'medium',
    revealed: false,
    subBranches: [
      {
        title: 'Optimisation SQL',
        icon: 'bi-table',
        description:
          "Approfondir vos compétences en PostgreSQL et MySQL, notamment sur l'optimisation des requêtes complexes, en vous appuyant sur votre expérience de création et d'optimisation de requêtes SQL.",
        priority: 'high',
        revealed: false,
      },
      {
        title: 'Data Visualization',
        icon: 'bi-graph-up',
        description:
          'Développer des compétences en visualisation de données avec des bibliothèques JavaScript comme D3.js ou Chart.js pour enrichir vos applications frontend.',
        priority: 'medium',
        revealed: false,
      },
      {
        title: 'Intégration IA',
        icon: 'bi-cpu',
        description:
          "Explorer l'intégration d'API d'intelligence artificielle dans vos applications, similaire à votre expérience avec l'API de traitement d'images pour la reconstruction 3D.",
        priority: 'medium',
        revealed: false,
      },
    ],
  },
  {
    title: 'Leadership Technique',
    icon: 'bi-people',
    priority: 'medium',
    revealed: false,
    subBranches: [
      {
        title: 'Documentation Avancée',
        icon: 'bi-file-text',
        description:
          "Perfectionner vos compétences en rédaction de documentation technique, en vous appuyant sur votre expérience de documentation d'architecture et de guides utilisateur.",
        priority: 'medium',
        revealed: false,
      },
      {
        title: 'Tests & Qualité',
        icon: 'bi-check-circle',
        description:
          'Devenir expert en méthodologies de test et assurance qualité, en développant votre expérience en tests unitaires et fonctionnels.',
        priority: 'high',
        revealed: false,
      },
      {
        title: 'Gestion de Projet Tech',
        icon: 'bi-kanban',
        description:
          'Renforcer vos compétences en gestion de projets techniques, en capitalisant sur votre expérience en gestion de projets chez SKOOVEL.',
        priority: 'medium',
        revealed: false,
      },
    ],
  },
];
