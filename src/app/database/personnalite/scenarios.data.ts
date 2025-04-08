import { Scenario } from "../../models/personnalite/scenario";

export const SCENARIOSDATA: Scenario[] = [
    {
      id: 'scenario1',
      title: 'Réunion de projet',
      description:
        "Vous observez le sujet lors d'une réunion où une idée qu'il avait partagée en privé est présentée par un collègue sans le mentionner. Comment le sujet réagit-il?",
      responses: [
        {
          id: 'r1a',
          text: 'Observer sa réaction immédiate',
          outcome:
            "Le sujet ne semble pas perturbé et continue à prendre des notes. Il hoche occasionnellement la tête en signe d'approbation.",
          insightRevealed: ['agreeableness'],
        },
        {
          id: 'r1b',
          text: 'Surveiller ses interactions après la réunion',
          outcome:
            'Après la réunion, le sujet discute calmement avec le collègue. Leur conversation semble cordiale mais sérieuse, et se termine par une poignée de main.',
          insightRevealed: ['collaboration1'],
        },
        {
          id: 'r1c',
          text: "Examiner ses communications écrites suite à l'incident",
          outcome:
            "Le sujet envoie un email à l'équipe avec des informations complémentaires sur l'idée, mentionnant subtilement son implication initiale dans sa conception, tout en soulignant la valeur des contributions de tous.",
          insightRevealed: ['communication', 'value1'],
        },
      ],
    },
    {
      id: 'scenario2',
      title: 'Gestion de crise technique',
      description:
        'Un problème majeur survient sur un projet critique avec un délai imminent. Comment le sujet gère-t-il cette situation de crise?',
      responses: [
        {
          id: 'r2a',
          text: 'Observer son processus de résolution de problème',
          outcome:
            'Le sujet commence par évaluer méthodiquement la situation, identifiant les causes potentielles. Il documente chaque étape de son analyse et teste systématiquement différentes hypothèses.',
          insightRevealed: ['conscientiousness', 'process1'],
        },
        {
          id: 'r2b',
          text: "Analyser sa communication avec l'équipe pendant la crise",
          outcome:
            "Le sujet reste calme et fournit des mises à jour claires et régulières à l'équipe. Il communique de manière factuelle sans rejeter la faute sur qui que ce soit, tout en encourageant les contributions.",
          insightRevealed: ['extroversion', 'communication'],
        },
        {
          id: 'r2c',
          text: 'Évaluer ses décisions sous pression',
          outcome:
            "Face à des options limitées, le sujet prend une décision réfléchie mais rapide. Il propose une solution innovante qui n'avait pas été envisagée initialement, permettant de respecter le délai tout en maintenant la qualité.",
          insightRevealed: ['openness', 'value2'],
        },
      ],
    },
    {
      id: 'scenario3',
      title: "Projet d'innovation",
      description:
        "Le sujet participe à un atelier d'innovation où des idées radicales sont proposées pour transformer un produit existant. Comment réagit-il face à ces nouvelles perspectives?",
      responses: [
        {
          id: 'r3a',
          text: 'Observer sa participation aux discussions créatives',
          outcome:
            "Le sujet écoute attentivement chaque proposition avant d'intervenir. Il pose des questions pertinentes pour approfondir les idées des autres avant de suggérer ses propres améliorations, souvent en combinant différents concepts.",
          insightRevealed: ['openness', 'collaboration2'],
        },
        {
          id: 'r3b',
          text: 'Examiner ses propositions et contributions',
          outcome:
            "Ses suggestions montrent un équilibre entre créativité et pragmatisme. Il propose des idées novatrices mais s'assure toujours qu'elles restent réalisables techniquement et alignées avec les objectifs du projet.",
          insightRevealed: ['conscientiousness', 'motivation1'],
        },
        {
          id: 'r3c',
          text: 'Analyser son suivi post-atelier',
          outcome:
            "Après l'atelier, le sujet prend l'initiative de formaliser les idées retenues dans un document structuré avec des étapes concrètes de mise en œuvre et une analyse des risques potentiels.",
          insightRevealed: ['process2', 'motivation2'],
        },
      ],
    },
    {
      id: 'scenario4',
      title: 'Feedback critique',
      description:
        'Un client important exprime des critiques sévères sur un livrable récent. Comment le sujet traite-t-il ce feedback négatif?',
      responses: [
        {
          id: 'r4a',
          text: 'Observer sa réaction initiale au feedback',
          outcome:
            'Le sujet écoute les critiques sans interruption ni défensive. Il prend des notes détaillées et remercie sincèrement le client pour sa franchise.',
          insightRevealed: ['agreeableness', 'value3'],
        },
        {
          id: 'r4b',
          text: "Analyser son plan d'action suite au feedback",
          outcome:
            "Il élabore rapidement un plan de remédiation structuré avec des délais précis, priorisant les points les plus critiques. Il propose également des check-points réguliers pour s'assurer que les corrections répondent aux attentes.",
          insightRevealed: ['conscientiousness', 'process3'],
        },
        {
          id: 'r4c',
          text: "Examiner comment il communique ce feedback à l'équipe",
          outcome:
            "Lors de la réunion d'équipe, il présente le feedback de manière constructive, sans pointer du doigt les responsables. Il transforme les critiques en opportunités d'amélioration et implique toute l'équipe dans la solution.",
          insightRevealed: ['collaboration3', 'extroversion'],
        },
      ],
    },
    {
      id: 'scenario5',
      title: 'Opportunité de formation',
      description:
        "Le sujet a l'opportunité de participer à une formation avancée qui nécessiterait un investissement personnel significatif en dehors des heures de travail. Comment réagit-il?",
      responses: [
        {
          id: 'r5a',
          text: 'Examiner son processus de décision',
          outcome:
            "Il évalue méticuleusement le contenu de la formation, recherchant les avis d'anciens participants et analysant comment ces nouvelles compétences pourraient s'appliquer concrètement à ses projets actuels et futurs.",
          insightRevealed: ['openness', 'motivation3'],
        },
        {
          id: 'r5b',
          text: 'Observer son organisation personnelle pour intégrer cette formation',
          outcome:
            "Il réorganise proactivement son emploi du temps, créant un plan d'étude structuré qui équilibre ses responsabilités professionnelles, ses engagements personnels et les exigences de la formation.",
          insightRevealed: ['conscientiousness', 'preference1'],
        },
        {
          id: 'r5c',
          text: 'Analyser comment il partage ses nouvelles connaissances',
          outcome:
            "Après la formation, il prend l'initiative d'organiser un atelier interne pour partager les connaissances acquises avec ses collègues, adaptant le contenu aux besoins spécifiques de l'équipe.",
          insightRevealed: ['extroversion', 'value4'],
        },
      ],
    },
  
];
