import { Evidence } from "../../models/motivations/evidence";

export const EVIDENCEITEMSDATA: Evidence[] = [
    {
      id: 'ev1',
      title: "Centres d'intérêt",
      icon: 'bi-heart',
      date: '2020-2024',
      description:
        "Les centres d'intérêt révèlent une forte attirance pour l'innovation technologique, l'apprentissage continu et les activités créatives. Ces inclinaisons personnelles montrent une motivation intrinsèque pour rester à la pointe des évolutions du domaine et explorer de nouvelles approches.",
      keywords: ['Innovation', 'Apprentissage', 'Créativité'],
      discovered: true,
      connections: ['ev2', 'ev5'],
    },
    {
      id: 'ev2',
      title: 'Personnalité',
      icon: 'bi-person-badge',
      date: 'Profil établi',
      description:
        "L'analyse de personnalité montre un profil analytique et orienté résolution de problèmes, avec une forte autonomie et une grande capacité d'adaptation. Ces traits sont cohérents avec une motivation pour les environnements professionnels offrant liberté d'action et défis intellectuels stimulants.",
      keywords: ['Autonomie', 'Adaptabilité', 'Analyse'],
      discovered: true,
      connections: ['ev1', 'ev3'],
    },
    {
      id: 'ev3',
      title: 'Itinéraire',
      icon: 'bi-map',
      date: '2015-2024',
      description:
        "Le parcours personnel et professionnel indique une progression délibérée vers des rôles demandant plus de responsabilité et d'impact. Les choix de carrière montrent une préférence claire pour des environnements innovants privilégiant l'excellence technique et l'évolution continue.",
      keywords: ['Progression', 'Impact', 'Évolution'],
      discovered: true,
      connections: ['ev4', 'ev6'],
    },
    {
      id: 'ev4',
      title: 'Expérience professionnelle',
      icon: 'bi-briefcase',
      date: '2016-2024',
      description:
        "L'analyse des expériences professionnelles révèle une constante recherche de défis techniques complexes et de projets à fort impact. Les transitions de carrière indiquent une motivation pour les environnements valorisant l'expertise technique combinée à une vision stratégique.",
      keywords: ['Expertise', 'Impact', 'Défis'],
      discovered: true,
      connections: ['ev3', 'ev5'],
    },
    {
      id: 'ev5',
      title: 'Compétences',
      icon: 'bi-tools',
      date: 'Évaluation récente',
      description:
        "Le profil de compétences montre un investissement significatif dans l'acquisition et le perfectionnement de savoir-faire techniques avancés, dépassant souvent les exigences immédiates des postes occupés. Cette démarche témoigne d'une motivation intrinsèque pour la maîtrise et l'excellence technique.",
      keywords: ['Maîtrise', 'Excellence', 'Développement'],
      discovered: true,
      connections: ['ev1', 'ev4'],
    },
    {
      id: 'ev6',
      title: 'Attentes professionnelles',
      icon: 'bi-arrow-up-circle',
      date: 'Projection future',
      description:
        "Les attentes professionnelles exprimées mettent en avant le désir d'équilibrer défis techniques stimulants et vision stratégique, avec une forte valorisation de l'autonomie et de l'impact concret. La recherche d'un environnement favorisant l'innovation et l'évolution continue est une constante.",
      keywords: ['Autonomie', 'Impact', 'Innovation'],
      discovered: true,
      connections: ['ev3'],
    },
  
];
