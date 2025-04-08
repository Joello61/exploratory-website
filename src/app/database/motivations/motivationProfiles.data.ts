import { MotivationProfile } from "../../models/motivations/motivation-profile";

export const MOTIVATIONPROFILESDATA: MotivationProfile[] = [
    {
      id: 'builder',
      name: 'Bâtisseur technique',
      icon: 'bi-tools',
      description:
        'Ce profil de motivation est caractérisé par un fort désir de créer des solutions techniques robustes et innovantes qui résolvent des problèmes complexes. Il combine expertise technique approfondie et vision architecturale pour construire des systèmes durables et évolutifs.',
      aspects: [
        {
          title: 'Excellence technique',
          icon: 'bi-award',
          description:
            "Recherche constante de qualité et d'optimisation dans les implémentations techniques, avec un souci particulier pour la maintenabilité et l'évolutivité des solutions.",
        },
        {
          title: 'Innovation pragmatique',
          icon: 'bi-lightbulb',
          description:
            "Équilibre entre exploration de nouvelles approches et solutions éprouvées, avec une préférence pour l'innovation ayant un impact concret sur les problématiques abordées.",
        },
        {
          title: 'Apprentissage continu',
          icon: 'bi-book',
          description:
            "Motivation intrinsèque pour l'acquisition de nouvelles compétences et la maîtrise approfondie des technologies, au-delà des exigences immédiates des projets.",
        },
      ],
    },
    {
      id: 'strategist',
      name: "Stratège d'innovation",
      icon: 'bi-graph-up',
      description:
        "Ce profil combine vision technique et compréhension stratégique pour identifier et développer des approches novatrices à fort impact. Il est motivé par la transformation des défis complexes en opportunités d'innovation avec des applications concrètes.",
      aspects: [
        {
          title: 'Vision systémique',
          icon: 'bi-intersect',
          description:
            'Capacité à percevoir les interconnexions entre différents domaines et à synthétiser des approches multidisciplinaires pour résoudre des problèmes complexes.',
        },
        {
          title: 'Impact mesurable',
          icon: 'bi-bullseye',
          description:
            'Forte motivation pour les projets générant une valeur tangible et des résultats mesurables, avec une préférence pour les solutions ayant un impact significatif.',
        },
        {
          title: 'Évolution constante',
          icon: 'bi-arrow-up-right',
          description:
            "Recherche permanente d'amélioration et d'évolution, tant au niveau personnel que des solutions développées, avec une vision à long terme.",
        },
      ],
    },
    {
      id: 'collaborator',
      name: 'Collaborateur autonome',
      icon: 'bi-people',
      description:
        "Ce profil valorise l'équilibre entre collaboration d'équipe efficace et autonomie personnelle. Il est motivé par les environnements qui favorisent l'échange d'expertise tout en offrant l'espace nécessaire pour explorer et développer des solutions de manière indépendante.",
      aspects: [
        {
          title: 'Autonomie responsable',
          icon: 'bi-person-check',
          description:
            "Préférence pour les contextes offrant une liberté décisionnelle encadrée par des objectifs clairs, permettant une expression optimale de la créativité et de l'expertise.",
        },
        {
          title: 'Synergie collective',
          icon: 'bi-puzzle',
          description:
            "Valorisation des dynamiques d'équipe qui permettent l'enrichissement mutuel et la combinaison des forces individuelles pour atteindre des résultats supérieurs.",
        },
        {
          title: "Partage d'expertise",
          icon: 'bi-share',
          description:
            "Motivation pour transmettre et recevoir des connaissances au sein d'un écosystème professionnel, contribuant à l'élévation collective des compétences.",
        },
      ],
    },
  
];
