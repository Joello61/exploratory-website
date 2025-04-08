import { QuizQuestion } from "../../models/motivations/quiz-question";

export const QUIZQUESTIONSDATA: QuizQuestion[] = [
    {
      id: 1,
      text: "Quel est le facteur de motivation principal identifié dans l'analyse ?",
      options: [
        'La reconnaissance externe et le statut social',
        "Les défis techniques et l'impact concret",
        'La stabilité professionnelle et la sécurité',
        'La progression hiérarchique rapide',
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      text: "Quelle caractéristique d'environnement professionnel est la plus valorisée selon le profil motivationnel ?",
      options: [
        'Structure très hiérarchisée avec des directives claires',
        'Environnement compétitif orienté résultats individuels',
        "Cadre favorisant l'autonomie et l'innovation",
        'Organisation très structurée avec des processus standardisés',
      ],
      correctAnswer: 2,
    },
    {
      id: 3,
      text: "Quel élément issu des centres d'intérêt influence positivement la motivation professionnelle ?",
      options: [
        "La pratique d'activités sportives compétitives",
        "L'intérêt pour les activités sociales et communautaires",
        "L'attirance pour l'innovation technologique et l'apprentissage continu",
        'La préférence pour les activités structurées et prévisibles',
      ],
      correctAnswer: 2,
    },
    {
      id: 4,
      text: "Selon l'analyse de personnalité, quel trait contribue à la motivation pour des environnements professionnels spécifiques ?",
      options: [
        "La préférence pour le travail en équipe plutôt qu'individuel",
        'Le besoin de validation externe et de reconnaissance',
        "L'aversion pour le risque et l'incertitude",
        "L'autonomie et la capacité d'adaptation",
      ],
      correctAnswer: 3,
    },
    {
      id: 5,
      text: 'Quel facteur de motivation a été évalué avec le score le plus élevé (niveau 9) ?',
      options: [
        'Reconnaissance',
        'Stabilité',
        'Défis techniques',
        'Collaboration',
      ],
      correctAnswer: 2,
    },
  
];
