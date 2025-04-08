import { Skill } from "../../models/competences/skill";

export const SKILLSDATA: Skill[] = [
    // Frontend
    {
      id: 'vue',
      name: 'Vue.js',
      category: 'frontend',
      level: 4,
      description:
        "Développement d'interfaces utilisateur réactives avec Vue.js, utilisé notamment pour le frontend de l'application 3D chez ANG Tech.",
      icon: 'bi-code-slash',
      projects: [
        'Application web/mobile avec intégration 3D',
        'Interfaces utilisateur réactives',
      ],
      discovered: false,
    },
    {
      id: 'angular',
      name: 'Angular',
      category: 'frontend',
      level: 3,
      description:
        "Création d'applications web dynamiques avec Angular, en utilisant TypeScript et les composants réutilisables.",
      icon: 'bi-code-square',
      projects: ['Projets académiques', "Composants d'interface utilisateur"],
      discovered: false,
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'frontend',
      level: 3,
      description:
        'Utilisation de TypeScript pour le développement frontend structuré et typé, permettant une meilleure maintenabilité du code.',
      icon: 'bi-braces',
      projects: ['Applications Vue.js', 'Projets Angular'],
      discovered: false,
    },
    {
      id: 'responsive',
      name: 'Responsive Design',
      category: 'frontend',
      level: 3,
      description:
        "Création d'interfaces adaptatives pour différents appareils en utilisant les techniques modernes de CSS et les frameworks responsive.",
      icon: 'bi-layout-split',
      projects: ['Applications web/mobile', 'Sites adaptés multi-écrans'],
      discovered: false,
    },

    // Backend
    {
      id: 'spring',
      name: 'Spring Boot',
      category: 'backend',
      level: 3,
      description:
        "Développement de services backend robustes avec Spring Boot, incluant la création d'API REST sécurisées.",
      icon: 'bi-gear',
      projects: ['Backend pour application 3D', 'API sécurisées'],
      discovered: false,
    },
    {
      id: 'symfony',
      name: 'Symfony',
      category: 'backend',
      level: 3,
      description:
        "Conception d'applications PHP structurées et performantes avec le framework Symfony.",
      icon: 'bi-code-slash',
      projects: ['Applications web', 'Services backend'],
      discovered: false,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'backend',
      level: 3,
      description:
        'Création de serveurs et APIs avec Node.js et Express, pour des applications web modernes.',
      icon: 'bi-hdd-network',
      projects: ['Services web', 'API REST'],
      discovered: false,
    },
    {
      id: 'python',
      name: 'Python',
      category: 'backend',
      level: 2,
      description:
        "Utilisation de Python pour le développement backend avec Flask, l'analyse de données et l'automatisation.",
      icon: 'bi-filetype-py',
      projects: ["Scripts d'analyse", 'Applications web avec Flask'],
      discovered: false,
    },

    // Mobile & 3D
    {
      id: 'mobile-web',
      name: 'Développement Web Mobile',
      category: 'mobile3d',
      level: 3,
      description:
        "Création d'applications web adaptées aux appareils mobiles, avec une expérience utilisateur optimisée.",
      icon: 'bi-phone',
      projects: [
        'Applications web/mobile chez ANG Tech',
        'Interfaces responsives',
      ],
      discovered: false,
    },
    {
      id: '3d-integration',
      name: 'Intégration 3D Web',
      category: 'mobile3d',
      level: 3,
      description:
        "Intégration de technologies 3D dans des applications web, incluant l'utilisation d'API de traitement d'images.",
      icon: 'bi-box',
      projects: [
        "Application d'analyse de mesures corporelles 3D",
        'Visualisation 3D web',
      ],
      discovered: false,
    },
    {
      id: 'api-integration',
      name: "Intégration d'API",
      category: 'mobile3d',
      level: 3,
      description:
        "Intégration d'API externes et développement d'API personnalisées pour les applications web et mobiles.",
      icon: 'bi-link',
      projects: ["API de traitement d'images", "Services d'intégration"],
      discovered: false,
    },

    // DevOps & CI/CD
    {
      id: 'docker',
      name: 'Docker',
      category: 'devops',
      level: 2,
      description:
        "Conteneurisation d'applications avec Docker pour faciliter le déploiement et assurer la cohérence des environnements.",
      icon: 'bi-box',
      projects: [
        'Environnements de développement',
        "Configurations d'applications",
      ],
      discovered: false,
    },
    {
      id: 'git',
      name: 'Git',
      category: 'devops',
      level: 3,
      description:
        'Gestion de versions et collaboration avec Git, incluant les workflows de branches et les stratégies de fusion.',
      icon: 'bi-git',
      projects: ['Gestion de code source', "Collaboration d'équipe"],
      discovered: false,
    },
    {
      id: 'cicd',
      name: 'CI/CD GitLab',
      category: 'devops',
      level: 3,
      description:
        'Configuration et utilisation de pipelines CI/CD avec GitLab pour automatiser les tests et déploiements.',
      icon: 'bi-arrow-repeat',
      projects: ['Pipelines CI/CD chez ANG Tech', 'Automatisation de tests'],
      discovered: false,
    },

    // Bases de données
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'database',
      level: 3,
      description:
        "Conception et gestion de bases de données PostgreSQL, incluant l'optimisation de requêtes complexes.",
      icon: 'bi-database',
      projects: [
        "Bases de données d'application",
        'Stockage de données structurées',
      ],
      discovered: false,
    },
    {
      id: 'mysql',
      name: 'MySQL',
      category: 'database',
      level: 3,
      description:
        'Administration et optimisation de bases de données MySQL pour des applications web et mobiles.',
      icon: 'bi-database-fill',
      projects: [
        'Systèmes de stockage relationnels',
        'Bases de données applicatives',
      ],
      discovered: false,
    },
    {
      id: 'sql-optimization',
      name: 'Optimisation SQL',
      category: 'database',
      level: 2,
      description:
        'Création et optimisation de requêtes SQL pour améliorer les performances des applications.',
      icon: 'bi-speedometer2',
      projects: ['Requêtes complexes', 'Amélioration de performance'],
      discovered: false,
    },

    // Documentation & Gestion
    {
      id: 'tech-documentation',
      name: 'Documentation Technique',
      category: 'documentation',
      level: 3,
      description:
        "Rédaction de documentation technique claire et complète, incluant l'architecture, les guides utilisateur et la maintenance.",
      icon: 'bi-file-text',
      projects: ['Documentation chez ANG Tech', 'Guides techniques'],
      discovered: false,
    },
    {
      id: 'project-management',
      name: 'Gestion de Projets',
      category: 'documentation',
      level: 2,
      description:
        "Planification et suivi de projets techniques, coordination d'équipe et gestion des délais.",
      icon: 'bi-kanban',
      projects: [
        'Gestion de projets chez SKOOVEL',
        "Coordination d'activités techniques",
      ],
      discovered: false,
    },
    {
      id: 'testing',
      name: 'Tests et Qualité',
      category: 'documentation',
      level: 2,
      description:
        'Mise en place et exécution de tests unitaires et fonctionnels pour assurer la qualité des applications.',
      icon: 'bi-check-circle',
      projects: ['Tests automatisés', 'Validation de fonctionnalités'],
      discovered: false,
    },

    // Soft Skills
    {
      id: 'teamwork',
      name: "Travail d'équipe",
      category: 'softskills',
      level: 4,
      description:
        "Collaboration efficace au sein d'équipes de développement, partage de connaissances et adaptation aux environnements d'équipe.",
      icon: 'bi-people-fill',
      projects: ['Projets collaboratifs', 'Développement en équipe'],
      discovered: false,
    },
    {
      id: 'adaptability',
      name: 'Adaptabilité',
      category: 'softskills',
      level: 4,
      description:
        "Capacité à s'adapter rapidement à de nouvelles technologies, environnements et exigences de projet.",
      icon: 'bi-shuffle',
      projects: [
        'Alternance études-travail',
        'Multiples environnements techniques',
      ],
      discovered: false,
    },
    {
      id: 'critical-thinking',
      name: 'Esprit critique',
      category: 'softskills',
      level: 3,
      description:
        'Analyse approfondie des problèmes techniques et évaluation objective des solutions possibles.',
      icon: 'bi-lightbulb',
      projects: [
        'Résolution de problèmes complexes',
        'Optimisation de solutions',
      ],
      discovered: false,
    },
    {
      id: 'time-management',
      name: 'Gestion du temps',
      category: 'softskills',
      level: 3,
      description:
        "Organisation efficace du temps entre les responsabilités académiques et professionnelles dans le cadre de l'alternance.",
      icon: 'bi-clock',
      projects: ['Équilibre études-travail', 'Respect des délais'],
      discovered: false,
    },
    {
      id: 'creativity',
      name: 'Créativité technique',
      category: 'softskills',
      level: 3,
      description:
        'Approche créative dans la résolution de problèmes techniques et le développement de fonctionnalités innovantes.',
      icon: 'bi-palette',
      projects: ['Solutions innovantes', 'Approches alternatives'],
      discovered: false,
    },
  
];
