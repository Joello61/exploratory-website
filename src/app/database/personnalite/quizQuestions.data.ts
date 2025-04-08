import { QuizQuestion } from "../../models/personnalite/quiz-question";

export const QUIZQUESTIONSDATA: QuizQuestion[] = [
    {
      question:
        'Quel est mon niveau de Conscienciosité (Rigueur) selon le profil psychologique ?',
      options: ['5/10', '7/10', '9/10', '6/10'],
      correctAnswer: 2,
    },
    {
      question: 'Comment est-ce que je réagis face à un feedback critique ?',
      options: [
        'Je défends vigoureusement mon travail et conteste les critiques',
        "J'accepte passivement toutes les critiques sans discussion",
        "J'écoute attentivement, remercie pour la franchise et élabore un plan d'action",
        "J'ignore généralement les critiques que je trouve injustifiées",
      ],
      correctAnswer: 2,
    },
    {
      question: 'Quelle est ma principale force en situation de crise ?',
      options: [
        'Improvisation créative',
        'Analyse méthodique et communication claire',
        'Délégation efficace des tâches',
        'Capacité à travailler sans interruption pendant de longues périodes',
      ],
      correctAnswer: 1,
    },
    {
      question:
        'Quelle valeur professionnelle est particulièrement importante pour moi ?',
      options: [
        'Compétition et reconnaissance individuelle',
        'Stabilité et prévisibilité',
        'Équilibre entre créativité et pragmatisme',
        'Autonomie complète dans le travail',
      ],
      correctAnswer: 2,
    },
    {
      question:
        "Comment est-ce que j'aborde les nouvelles idées dans un projet ?",
      options: [
        "Je préfère m'en tenir aux méthodes éprouvées",
        "J'adopte toutes les nouveautés sans analyse critique",
        "J'écoute attentivement puis je pose des questions pertinentes pour approfondir",
        "Je m'intéresse uniquement aux idées venant de sources reconnues",
      ],
      correctAnswer: 2,
    },
  
];
