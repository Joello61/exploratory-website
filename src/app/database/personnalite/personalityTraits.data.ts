import { PersonalityTrait } from "../../models/personnalite/personality-trait";

export const PERSONALITYTRAITSDATA: PersonalityTrait[] = [
    {
      id: 'extroversion',
      name: 'Extraversion',
      icon: 'bi-people-fill',
      description:
        "Niveau modérément élevé d'aisance sociale et d'énergie dans les interactions professionnelles. Communique efficacement et avec assurance, tout en sachant écouter.",
      manifestations: [
        'Communication claire et directe, mais sans dominer les échanges',
        'Facilité à établir des relations professionnelles de confiance',
        "Présentation assurée d'idées et concepts en réunion",
        'Équilibre entre prise de parole et écoute active',
      ],
      workImpact:
        "Capacité à collaborer efficacement tout en maintenant une autonomie productive. Favorise un environnement d'équipe positif où les idées peuvent être librement partagées et discutées.",
      discovered: false,
    },
    {
      id: 'agreeableness',
      name: 'Coopération',
      icon: 'bi-hand-thumbs-up',
      description:
        "Niveau élevé de coopération, valorisant l'harmonie d'équipe et les approches collaboratives. Montre une forte capacité d'empathie tout en restant objectif.",
      manifestations: [
        'Recherche active de solutions mutuellement bénéfiques lors de désaccords',
        'Écoute attentive des différentes perspectives avant de formuler des conclusions',
        'Soutien aux collègues tout en maintenant des attentes élevées',
        'Communication constructive même lors de discussions difficiles',
      ],
      workImpact:
        "Contribue à un environnement de travail respectueux et productif où les conflits sont résolus constructivement. Favorise la cohésion d'équipe sans sacrifier l'exigence de qualité.",
      discovered: false,
    },
    {
      id: 'conscientiousness',
      name: 'Rigueur',
      icon: 'bi-check2-square',
      description:
        "Niveau très élevé d'organisation, de fiabilité et d'attention aux détails. Approche méthodique et structurée du travail, avec un fort engagement envers la qualité.",
      manifestations: [
        'Planification méticuleuse des projets avec anticipation des risques',
        'Documentation systématique des processus et décisions',
        'Respect scrupuleux des délais et engagements',
        'Vérification approfondie avant validation finale',
      ],
      workImpact:
        'Garantit une exécution fiable et de haute qualité des projets complexes. Instaure des standards élevés tout en maintenant une progression constante vers les objectifs définis.',
      discovered: false,
    },
    {
      id: 'openness',
      name: 'Ouverture',
      icon: 'bi-lightbulb',
      description:
        "Niveau élevé d'ouverture aux nouvelles idées et approches, combinant curiosité intellectuelle et pragmatisme. Intérêt marqué pour l'innovation applicable.",
      manifestations: [
        'Recherche proactive de nouvelles méthodes et technologies pertinentes',
        'Évaluation équilibrée des innovations, considérant à la fois le potentiel et la faisabilité',
        'Apprentissage continu et auto-dirigé dans des domaines variés',
        'Capacité à reconceptualiser les problèmes pour trouver des solutions originales',
      ],
      workImpact:
        "Apporte une perspective à la fois innovante et réaliste aux défis professionnels. Contribue à l'évolution des pratiques tout en assurant leur applicabilité concrète.",
      discovered: false,
    },
  
];
