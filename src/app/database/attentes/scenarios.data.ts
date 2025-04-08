import { Scenario } from "../../models/attentes/scenario";

export const SCENARIOSDATA: Scenario[] = [
    {
      title: 'Choix de projet',
      description:
        "En tant qu'alternant développeur Fullstack, on vous propose deux projets: développer une application web avec Vue.js et API REST ou travailler sur une application mobile native nécessitant d'apprendre un nouveau langage. Que choisiriez-vous?",
      options: [
        "L'application web avec Vue.js et API REST, technologies que vous maîtrisez déjà",
        "L'application mobile native pour élargir vos compétences",
        'Proposer une solution hybride utilisant vos compétences web pour créer une application cross-platform',
        'Demander à partager votre temps entre les deux projets',
      ],
      correctOption: 2,
      feedback: {
        correct:
          "Excellent choix! Votre profil montre une volonté d'exploiter vos compétences web existantes tout en les étendant vers le mobile, ce qui correspond à votre expérience chez ANG Tech.",
        incorrect:
          "Compte tenu de votre profil, vous privilégieriez une solution hybride qui combine vos compétences web actuelles (Vue.js) tout en développant votre expertise mobile, comme l'indique votre expérience en développement d'applications web/mobile.",
      },
    },
    {
      title: 'Équilibre études-travail',
      description:
        "Votre entreprise vous confie un projet ambitieux avec une deadline serrée qui coïncide avec une période d'examens importants à l'université. Comment gérez-vous cette situation?",
      options: [
        'Vous privilégiez le projet professionnel et réduisez le temps consacré à vos études',
        'Vous privilégiez vos examens et demandez un délai supplémentaire pour le projet',
        'Vous établissez un planning précis pour équilibrer les deux responsabilités et communiquez clairement avec les parties prenantes',
        'Vous déléguez une partie du projet à vos collègues',
      ],
      correctOption: 2,
      feedback: {
        correct:
          "Parfait! Cette approche reflète votre capacité de gestion du temps et d'organisation mentionnée dans vos soft skills, tout en respectant vos engagements académiques et professionnels.",
        incorrect:
          "Votre profil indique une forte capacité de gestion du temps et d'organisation. La meilleure approche serait d'établir un planning précis et de communiquer ouvertement avec toutes les parties prenantes pour trouver un équilibre entre vos études et votre travail.",
      },
    },
    {
      title: 'Développement technique',
      description:
        "Vous avez l'opportunité de vous former à une nouvelle technologie. Laquelle choisiriez-vous prioritairement, en fonction de votre profil actuel?",
      options: [
        "Une formation avancée en management d'équipe technique",
        'Un framework JavaScript front-end concurrent de Vue.js',
        'Une technologie de conteneurisation et orchestration comme Kubernetes',
        'Un framework de développement mobile cross-platform comme React Native',
      ],
      correctOption: 3,
      feedback: {
        correct:
          "Excellent choix! Le développement mobile cross-platform représente une extension naturelle de vos compétences web actuelles et s'aligne avec votre expérience en développement d'applications web/mobile.",
        incorrect:
          "Compte tenu de votre expérience en développement d'applications web et mobile et de votre maîtrise de JavaScript/TypeScript, apprendre React Native vous permettrait d'étendre naturellement vos compétences vers le mobile cross-platform.",
      },
    },
    {
      title: 'Environnement de travail',
      description:
        "Quelle caractéristique d'entreprise serait la plus importante pour vous dans votre situation d'alternant développeur Fullstack?",
      options: [
        'Une entreprise utilisant exclusivement les dernières technologies',
        'Une société offrant la possibilité de télétravailler à 100%',
        'Une organisation avec des mentors expérimentés et un accompagnement structuré',
        'Une startup proposant des opportunités de prise de responsabilité rapide',
      ],
      correctOption: 2,
      feedback: {
        correct:
          "Tout à fait! Dans votre situation d'alternant cherchant à développer vos compétences, l'accès à des mentors expérimentés et un bon accompagnement est crucial pour votre progression technique.",
        incorrect:
          "En tant qu'alternant développeur Fullstack en formation, l'accès à des mentors expérimentés et un accompagnement structuré vous permettrait de progresser plus efficacement, comme le suggère votre profil orienté vers l'apprentissage et le perfectionnement.",
      },
    },
    {
      title: 'Projet personnel',
      description:
        'Si vous deviez développer un projet personnel pour enrichir votre portfolio, lequel choisiriez-vous?',
      options: [
        'Un site web statique avec un design élaboré',
        'Une application métier pure backend avec API REST complexe',
        'Une application mobile native iOS ou Android',
        'Une application web fullstack avec fonctionnalités 3D et interface responsive',
      ],
      correctOption: 3,
      feedback: {
        correct:
          "Parfait choix! Une application fullstack avec des fonctionnalités 3D s'aligne parfaitement avec votre expérience chez ANG Tech et valorise l'ensemble de vos compétences frontend, backend et 3D.",
        incorrect:
          "Votre profil et votre expérience chez ANG Tech suggèrent qu'une application fullstack intégrant des éléments 3D serait idéale pour mettre en valeur l'ensemble de vos compétences techniques.",
      },
    },
  ]