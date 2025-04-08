import { JobExperience } from "../../models/experiences/job-experience";

export const JOBSDATA: JobExperience[] = [
    {
      title: 'Alternant Développeur Fullstack',
      company: 'ANG Tech',
      period: 'Décembre 2024 - Actuel',
      description:
        "Poste en alternance dans le cadre du Master Informatique à l'Université de Toulouse Jean Jaurès. Développement d'une application web et mobile intégrant des technologies 3D et une API REST sécurisée.",
      clues: [
        {
          title: 'Intégration 3D',
          detail:
            "Développement d'une application web/mobile intégrant la 3D pour l'analyse des mesures corporelles dans un contexte e-commerce",
          icon: 'bi-box',
          skill: 'Technologies 3D',
        },
        {
          title: 'API Backend',
          detail:
            "Conception et implémentation d'une API REST sécurisée pour la communication entre le frontend et les services de traitement d'images",
          icon: 'bi-hdd-network',
          skill: 'Backend API',
        },
        {
          title: 'Frontend Vue.js',
          detail:
            'Développement du frontend en Vue.js avec une interface utilisateur intuitive pour manipuler des objets 3D et visualiser des analyses',
          icon: 'bi-window',
          skill: 'Vue.js',
        },
        {
          title: 'Pipelines CI/CD',
          detail:
            "Mise en place de pipelines CI/CD avec GitLab pour automatiser les tests et déploiements de l'application",
          icon: 'bi-gear-wide-connected',
          skill: 'DevOps',
        },
        {
          title: 'Documentation',
          detail:
            "Rédaction d'une documentation technique complète couvrant l'architecture, les guides utilisateur et les procédures de maintenance",
          icon: 'bi-file-text',
          skill: 'Documentation Technique',
        },
      ],
      skills: [
        'Vue.js',
        'API REST',
        'Technologies 3D',
        'DevOps',
        'Documentation Technique',
      ],
      notes:
        "Cette expérience en cours permet au candidat de combiner ses connaissances théoriques avec une application pratique dans un contexte professionnel. L'accent sur les technologies 3D et le développement fullstack enrichit considérablement son profil technique.",
      conclusion:
        'Cette alternance permet au candidat de développer des compétences avancées en intégration 3D et développement fullstack, tout en renforçant sa maîtrise des méthodologies DevOps et de la documentation technique, éléments essentiels pour un développeur fullstack moderne.',
      achievement: 'Développeur Fullstack 3D',
    },
    {
      title: 'Stagiaire Consultant Informatique',
      company: 'SKOOVEL Sarl',
      period: 'Octobre 2023 - Juillet 2024',
      description:
        "Stage de 10 mois en tant que consultant informatique, avec des missions diversifiées incluant l'analyse de données, le support technique, le développement et la gestion de sites web, et la formation des utilisateurs.",
      clues: [
        {
          title: 'Analyse de Données',
          detail:
            'Analyse et traitement de données pour extraire des informations pertinentes et faciliter la prise de décision',
          icon: 'bi-graph-up',
          skill: 'Analyse de Données',
        },
        {
          title: 'Développement Web',
          detail:
            'Développement et maintenance de sites web pour divers clients, en utilisant différentes technologies web',
          icon: 'bi-code-slash',
          skill: 'Développement Web',
        },
        {
          title: 'Gestion Bases de Données',
          detail:
            'Administration et optimisation de bases de données pour assurer des performances optimales et la sécurité des données',
          icon: 'bi-database',
          skill: 'Bases de Données',
        },
        {
          title: 'Formation Utilisateurs',
          detail:
            "Conception et animation de sessions de formation pour les utilisateurs finaux sur l'utilisation des systèmes informatiques",
          icon: 'bi-people',
          skill: 'Formation',
        },
        {
          title: 'Gestion de Projets',
          detail:
            'Coordination et suivi de divers projets informatiques, en assurant le respect des délais et des objectifs',
          icon: 'bi-kanban',
          skill: 'Gestion de Projets',
        },
      ],
      skills: [
        'Analyse de Données',
        'Développement Web',
        'Bases de Données',
        'Formation',
        'Gestion de Projets',
      ],
      notes:
        "Cette expérience a permis au candidat de développer une polyvalence technique et des compétences en communication client importantes. La diversité des missions a contribué à renforcer sa capacité d'adaptation et sa vision globale des problématiques informatiques.",
      conclusion:
        'Ce stage a constitué une expérience professionnelle enrichissante pour le candidat, lui permettant de découvrir différentes facettes du métier de consultant informatique et de développer des compétences transversales précieuses pour sa future carrière de développeur fullstack.',
      achievement: 'Polyvalence Technique',
    },
    {
      title: 'Stagiaire Développeur Web',
      company: 'Megasoft Sarl',
      period: 'Avril 2022 - Juin 2022',
      description:
        "Premier stage en entreprise d'une durée de 3 mois, axé sur le développement web, l'intégration d'API REST, la maintenance d'applications existantes et l'optimisation de requêtes SQL.",
      clues: [
        {
          title: 'Application Web/Mobile',
          detail:
            "Participation au développement d'une application web avec adaptation mobile pour un client du secteur commercial",
          icon: 'bi-phone',
          skill: 'Développement Web/Mobile',
        },
        {
          title: 'Intégration API',
          detail:
            "Intégration d'API REST externes pour enrichir les fonctionnalités de l'application et assurer l'interopérabilité avec d'autres services",
          icon: 'bi-link',
          skill: 'Intégration API',
        },
        {
          title: 'Maintenance',
          detail:
            'Correction de bugs et amélioration des fonctionnalités existantes sur des applications en production',
          icon: 'bi-wrench',
          skill: 'Maintenance Applicative',
        },
        {
          title: 'Requêtes SQL',
          detail:
            "Création et optimisation de requêtes SQL pour améliorer les performances et l'efficacité des applications",
          icon: 'bi-database',
          skill: 'SQL',
        },
        {
          title: 'Tests',
          detail:
            'Mise en place et exécution de tests unitaires et fonctionnels pour assurer la qualité des développements',
          icon: 'bi-check-circle',
          skill: 'Tests',
        },
      ],
      skills: [
        'Développement Web/Mobile',
        'Intégration API',
        'Maintenance Applicative',
        'SQL',
        'Tests',
      ],
      notes:
        'Ce premier stage a constitué une introduction pratique au monde professionnel du développement web pour le candidat. Il a pu mettre en application les connaissances théoriques acquises durant sa formation et découvrir les réalités du développement en entreprise.',
      conclusion:
        "Cette expérience initiale a permis au candidat de se familiariser avec le cycle de développement complet d'une application web, depuis la conception jusqu'aux tests, en passant par l'intégration d'API et l'optimisation des performances. Elle a posé les bases de sa carrière de développeur fullstack.",
      achievement: 'Fondamentaux du Développement Web',
    },
    {
      title: 'Formation Académique',
      company: 'Parcours Universitaire',
      period: 'Septembre 2020 - Actuel',
      description:
        "Parcours de formation complet en informatique, du DUT Génie Logiciel au Master Informatique à l'Université de Toulouse Jean Jaurès, avec une spécialisation progressive vers le développement fullstack.",
      clues: [
        {
          title: 'Master Informatique',
          detail:
            "Master en cours à l'Université de Toulouse Jean Jaurès, avec spécialisation en développement d'applications",
          icon: 'bi-mortarboard',
          skill: 'Formation Supérieure',
        },
        {
          title: 'Licence Informatique',
          detail:
            "Licence Informatique et réseau obtenue à l'IUT de Bandjoun au Cameroun, avec acquisition des fondamentaux théoriques",
          icon: 'bi-award',
          skill: 'Informatique Théorique',
        },
        {
          title: 'DUT Génie Logiciel',
          detail:
            "Formation initiale en Génie Logiciel à l'IUT de Bandjoun, avec introduction aux méthodes de développement et programmation",
          icon: 'bi-code-square',
          skill: 'Programmation',
        },
        {
          title: 'Projets Académiques',
          detail:
            "Réalisation de nombreux projets pratiques dans le cadre de la formation, permettant d'explorer différentes technologies",
          icon: 'bi-folder',
          skill: 'Gestion de Projets',
        },
        {
          title: 'Alternance',
          detail:
            "Choix d'un Master en alternance pour combiner formation théorique et expérience professionnelle concrète",
          icon: 'bi-briefcase',
          skill: 'Professionnalisation',
        },
      ],
      skills: [
        'Formation Supérieure',
        'Informatique Théorique',
        'Programmation',
        'Gestion de Projets',
        'Professionnalisation',
      ],
      notes:
        "Le parcours académique du candidat montre une progression constante et une spécialisation progressive vers le développement d'applications. L'alternance choisie pour le Master témoigne d'une volonté de confronter la théorie à la pratique professionnelle.",
      conclusion:
        "Cette solide formation académique, complétée par l'alternance en cours, constitue une base théorique et technique robuste pour le candidat. Elle lui permet d'aborder le développement fullstack avec à la fois des connaissances théoriques approfondies et une expérience pratique en constante évolution.",
      achievement: 'Fondements Théoriques Solides',
    },
  
];
