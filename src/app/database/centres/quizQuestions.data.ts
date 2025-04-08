import { QuizQuestion } from "../../models/centres/quiz-question";

export const QUIZQUESTIONSDATA: QuizQuestion[] = [
    {
      question:
        'À quelle fréquence la cuisine est-elle pratiquée selon le profil?',
      options: [
        'Quotidiennement',
        'Plusieurs fois par semaine',
        'Mensuellement',
        'Occasionnellement',
      ],
      correctAnswer: 1,
    },
    {
      question: 'Quelle compétence est associée à la pratique du chant?',
      options: [
        'Patience',
        'Coordination',
        'Expression artistique',
        'Adaptabilité',
      ],
      correctAnswer: 2,
    },
    {
      question: 'À quelle fréquence le basketball est-il pratiqué?',
      options: [
        'Quotidiennement',
        'Plusieurs fois par semaine',
        'Hebdomadaire',
        'Mensuellement',
      ],
      correctAnswer: 2,
    },
    {
      question:
        'Quelle valeur est développée par la pratique du basketball selon le profil?',
      options: [
        'Créativité',
        "Esprit d'équipe",
        'Technique vocale',
        'Curiosité',
      ],
      correctAnswer: 1,
    },
    {
      question:
        'Dans quels domaines spécifiques porte la veille technologique?',
      options: [
        'Développement web, mobile et technologies 3D',
        'Intelligence artificielle et machine learning',
        'Cybersécurité et protection des données',
        'Blockchain et cryptomonnaies',
      ],
      correctAnswer: 0,
    },
    {
      question:
        "Quelle compétence est associée à l'intérêt pour les nouvelles technologies?",
      options: [
        'Précision',
        'Coordination',
        'Adaptabilité',
        'Expression artistique',
      ],
      correctAnswer: 2,
    },
    {
      question:
        'Quelle compétence est commune à la cuisine et au basketball selon le profil?',
      options: ['Créativité', 'Coordination', 'Précision', 'Organisation'],
      correctAnswer: 1,
    },
  
];
