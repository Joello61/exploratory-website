import { QuizQuestion } from "../../models/itineraire/quiz-question";

export const QUIZQUESTIONSDATA: QuizQuestion[] = [
    {
      id: 'q1',
      text: 'Quelle est la formation la plus récente du parcours éducatif ?',
      options: [
        'Licence Informatique et réseau',
        'Master Informatique',
        'DUT Génie Logiciel',
        'Stage chez SKOOVEL',
      ],
      correctOptionIndex: 1,
      feedback: {
        correct:
          "Correct ! Le Master Informatique à l'Université de Toulouse Jean Jaurès est la formation la plus récente (2024-en cours).",
        incorrect:
          "Incorrect. Le Master Informatique à l'Université de Toulouse Jean Jaurès (2024-en cours) est la formation la plus récente du parcours.",
      },
    },
    {
      id: 'q2',
      text: 'Dans quelle ville le développeur effectue-t-il actuellement son alternance ?',
      options: ['Toulouse', 'Yaoundé', 'Marseille', 'Bandjoun'],
      correctOptionIndex: 2,
      feedback: {
        correct: "Correct ! L'alternance chez ANG Tech se déroule à Marseille.",
        incorrect:
          "Incorrect. L'alternance chez ANG Tech se déroule à Marseille, tandis que le Master est suivi à Toulouse.",
      },
    },
    {
      id: 'q3',
      text: "Quelle technologie spécifique est mise en avant dans le poste actuel d'alternant ?",
      options: [
        'Intelligence artificielle',
        'Blockchain',
        'Intégration 3D',
        'Internet des objets (IoT)',
      ],
      correctOptionIndex: 2,
      feedback: {
        correct:
          "Correct ! L'intégration 3D est une technologie clé dans le poste actuel chez ANG Tech, avec le développement d'une application web/mobile incorporant des fonctionnalités 3D.",
        incorrect:
          "Incorrect. L'intégration 3D est la technologie spécifique mise en avant dans le poste actuel, notamment pour l'analyse des mesures corporelles.",
      },
    },
    {
      id: 'q4',
      text: "Quel est le niveau d'expertise fullstack atteint en 2024 selon l'évolution des compétences ?",
      options: ['60%', '75%', '85%', '95%'],
      correctOptionIndex: 2,
      feedback: {
        correct:
          "Correct ! En 2024, le niveau d'expertise fullstack est de 85%, correspondant au début du Master et de l'alternance.",
        incorrect:
          "Incorrect. En 2024, le niveau d'expertise fullstack est de 85%, marquant le début du Master Informatique et de l'alternance chez ANG Tech.",
      },
    },
    {
      id: 'q5',
      text: 'Quel framework frontend est principalement utilisé dans le poste actuel ?',
      options: ['React', 'Angular', 'Vue.js', 'Svelte'],
      correctOptionIndex: 2,
      feedback: {
        correct:
          "Correct ! Vue.js est le framework frontend principal utilisé chez ANG Tech pour le développement de l'application web/mobile avec intégration 3D.",
        incorrect:
          "Incorrect. Vue.js est le framework frontend principalement utilisé dans le poste actuel pour développer l'interface utilisateur de l'application avec intégration 3D.",
      },
    },
    {
      id: 'q6',
      text: "Combien d'expériences professionnelles figurent dans le parcours du développeur ?",
      options: ['1', '2', '3', '4'],
      correctOptionIndex: 2,
      feedback: {
        correct:
          'Correct ! Le parcours comprend 3 expériences professionnelles : alternance chez ANG Tech, stage chez SKOOVEL et stage chez Megasoft.',
        incorrect:
          "Incorrect. Le parcours comprend 3 expériences professionnelles distinctes : l'alternance actuelle chez ANG Tech, le stage de 10 mois chez SKOOVEL et le stage de 3 mois chez Megasoft.",
      },
    },
    {
      id: 'q7',
      text: 'Quel outil DevOps est utilisé pour les pipelines CI/CD dans le poste actuel ?',
      options: ['Jenkins', 'GitHub Actions', 'GitLab CI/CD', 'Azure DevOps'],
      correctOptionIndex: 2,
      feedback: {
        correct:
          "Correct ! GitLab CI/CD est l'outil utilisé pour mettre en place des pipelines d'intégration et de déploiement continus chez ANG Tech.",
        incorrect:
          "Incorrect. GitLab CI/CD est l'outil DevOps utilisé dans le poste actuel pour automatiser les tests et déploiements.",
      },
    },
  
];
