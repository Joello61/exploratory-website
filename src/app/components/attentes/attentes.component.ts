import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { ProgressService } from '../../services/progress.service';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';

interface TerminalLine {
  type: 'input' | 'output';
  text: string;
  active: boolean;
}

interface AspirationBranch {
  title: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  revealed: boolean;
  subBranches: SubBranch[];
}

interface SubBranch {
  title: string;
  icon: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  revealed: boolean;
}

interface FutureProject {
  title: string;
  description: string;
  type: 'project' | 'opportunity';
  timeline: 'short' | 'mid' | 'long';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  objectives: string[];
}

interface EnvironmentCategory {
  title: string;
  icon: string;
  items: EnvironmentItem[];
}

interface EnvironmentItem {
  title: string;
  description: string;
  icon: string;
}

// Ajouter ces interfaces
interface PrioritizationItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  correctRank: number;
}

interface Scenario {
  title: string;
  description: string;
  options: string[];
  correctOption: number;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

interface CompatibilityItem {
  title: string;
  description: string;
  icon: string;
  correctRating: number;
}

@Component({
  selector: 'app-attentes',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './attentes.component.html',
  styleUrls: ['./attentes.component.css']
})
export class AttentesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;
  @ViewChild('terminalOutput') terminalOutput!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string = "Agent, nous avons besoin d'une projection des intentions futures du sujet. Utilisez le terminal prédictif pour accéder à ses aspirations professionnelles, projets et environnement idéal. Ces informations sont cruciales pour comprendre sa trajectoire de carrière.";
  private subscriptions: Subscription[] = [];

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Terminal
  terminalLines: TerminalLine[] = [];
  currentInput: string = '';
  showCursor: boolean = true;
  executingCommand: boolean = false;
  showTopicSuggestions: boolean = false;
  showAspirations: boolean = false;

  // Commandes disponibles
  availableCommands: string[] = [
    'help', 
    'scan_aspirations', 
    'scan_projects', 
    'scan_environment',
    'clear'
  ];

  // Sujets disponibles pour explorer
  availableTopics: string[] = [
    'développement-fullstack',
    'technologies-3d',
    'devops-cicd',
    'mobile-web',
    'équilibre-études-travail'
  ];

  // Visibilité des sections
  showAspirationsMap: boolean = false;
  showFutureProjects: boolean = false;
  showIdealProfile: boolean = false;

  // Projets sélectionnés
  selectedTimeline: 'short' | 'mid' | 'long' = 'short';

  // Module complété
  isModuleCompleted: boolean = false;
  moduleProgressPercentage: number = 0;
  elapsedTime: string = '00:00:00';
  
  // Données des aspirations professionnelles
  aspirationBranches: AspirationBranch[] = [
    {
      title: 'Expertise Technique',
      icon: 'bi-code-slash',
      priority: 'high',
      revealed: false,
      subBranches: [
        {
          title: 'Maîtrise des Frameworks Frontend',
          icon: 'bi-window',
          description: 'Perfectionner votre expertise en Vue.js et approfondir vos connaissances en Angular pour développer des interfaces utilisateur avancées et performantes.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Technologies 3D Web',
          icon: 'bi-box',
          description: 'Approfondir vos compétences en intégration 3D web, en vous appuyant sur votre expérience acquise chez ANG Tech dans le développement d\'applications intégrant la 3D.',
          priority: 'medium',
          revealed: false
        },
        {
          title: 'Backend Robuste',
          icon: 'bi-server',
          description: 'Renforcer votre maîtrise des frameworks backend (Spring Boot, Symfony, Node.js) et des architectures API REST sécurisées que vous avez déjà commencé à utiliser.',
          priority: 'high',
          revealed: false
        }
      ]
    },
    {
      title: 'Spécialisation DevOps',
      icon: 'bi-gear-wide-connected',
      priority: 'medium',
      revealed: false,
      subBranches: [
        {
          title: 'CI/CD Avancé',
          icon: 'bi-arrow-repeat',
          description: 'Développer une expertise plus poussée en pipelines CI/CD en vous basant sur votre expérience avec GitLab, et explorer d\'autres outils comme Jenkins ou GitHub Actions.',
          priority: 'medium',
          revealed: false
        },
        {
          title: 'Conteneurisation & Orchestration',
          icon: 'bi-boxes',
          description: 'Approfondir vos connaissances Docker et vous former à Kubernetes pour l\'orchestration de conteneurs à grande échelle.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Infrastructure as Code',
          icon: 'bi-file-code',
          description: 'Acquérir des compétences en IaC avec des outils comme Terraform ou Ansible pour compléter votre profil DevOps.',
          priority: 'medium',
          revealed: false
        }
      ]
    },
    {
      title: 'Innovation Mobile',
      icon: 'bi-phone',
      priority: 'high',
      revealed: false,
      subBranches: [
        {
          title: 'Applications Hybrides',
          icon: 'bi-phone-flip',
          description: 'Exploiter votre expérience en développement mobile pour maîtriser des frameworks comme React Native ou Flutter, en complément de vos compétences web.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Réalité Augmentée',
          icon: 'bi-badge-ar',
          description: 'Étendre vos compétences en 3D vers la réalité augmentée, en vous appuyant sur votre expérience d\'intégration d\'API de traitement d\'images.',
          priority: 'medium',
          revealed: false
        },
        {
          title: 'PWA Avancées',
          icon: 'bi-app',
          description: 'Développer une expertise en Progressive Web Apps pour créer des expériences mobiles performantes, même hors connexion.',
          priority: 'medium',
          revealed: false
        }
      ]
    },
    {
      title: 'Data & Analytics',
      icon: 'bi-database',
      priority: 'medium',
      revealed: false,
      subBranches: [
        {
          title: 'Optimisation SQL',
          icon: 'bi-table',
          description: 'Approfondir vos compétences en PostgreSQL et MySQL, notamment sur l\'optimisation des requêtes complexes, en vous appuyant sur votre expérience de création et d\'optimisation de requêtes SQL.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Data Visualization',
          icon: 'bi-graph-up',
          description: 'Développer des compétences en visualisation de données avec des bibliothèques JavaScript comme D3.js ou Chart.js pour enrichir vos applications frontend.',
          priority: 'medium',
          revealed: false
        },
        {
          title: 'Intégration IA',
          icon: 'bi-cpu',
          description: 'Explorer l\'intégration d\'API d\'intelligence artificielle dans vos applications, similaire à votre expérience avec l\'API de traitement d\'images pour la reconstruction 3D.',
          priority: 'medium',
          revealed: false
        }
      ]
    },
    {
      title: 'Leadership Technique',
      icon: 'bi-people',
      priority: 'medium',
      revealed: false,
      subBranches: [
        {
          title: 'Documentation Avancée',
          icon: 'bi-file-text',
          description: 'Perfectionner vos compétences en rédaction de documentation technique, en vous appuyant sur votre expérience de documentation d\'architecture et de guides utilisateur.',
          priority: 'medium',
          revealed: false
        },
        {
          title: 'Tests & Qualité',
          icon: 'bi-check-circle',
          description: 'Devenir expert en méthodologies de test et assurance qualité, en développant votre expérience en tests unitaires et fonctionnels.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Gestion de Projet Tech',
          icon: 'bi-kanban',
          description: 'Renforcer vos compétences en gestion de projets techniques, en capitalisant sur votre expérience en gestion de projets chez SKOOVEL.',
          priority: 'medium',
          revealed: false
        }
      ]
    }
  ];

   // Projets futurs
   futureProjects: FutureProject[] = [
    {
      title: 'Application 3D Interactive',
      description: 'Développer une application web/mobile avancée intégrant des fonctionnalités 3D interactives pour l\'industrie du e-commerce ou de la formation.',
      type: 'project',
      timeline: 'short',
      priority: 'high',
      tags: ['Vue.js', '3D Web', 'WebGL', 'API REST'],
      objectives: [
        'Approfondir l\'expérience acquise en développement 3D chez ANG Tech',
        'Intégrer des API avancées de traitement d\'images et de reconstruction 3D',
        'Concevoir une interface utilisateur intuitive pour manipuler des objets 3D'
      ]
    },
    {
      title: 'Expertise Full Stack Vue.js & Spring Boot',
      description: 'Renforcer l\'expertise technique en développant une application complète utilisant Vue.js en frontend et Spring Boot en backend.',
      type: 'opportunity',
      timeline: 'short',
      priority: 'high',
      tags: ['Vue.js', 'Spring Boot', 'API REST', 'PostgreSQL'],
      objectives: [
        'Créer une architecture backend robuste avec Spring Boot',
        'Développer une interface utilisateur réactive avec Vue.js',
        'Mettre en place des pipelines CI/CD automatisés avec GitLab'
      ]
    },
    {
      title: 'Application Mobile Cross-Platform',
      description: 'Élargir les compétences de développement mobile en créant une application cross-platform basée sur vos connaissances web actuelles.',
      type: 'project',
      timeline: 'mid',
      priority: 'medium',
      tags: ['React Native', 'TypeScript', 'API REST', 'Mobile'],
      objectives: [
        'Transférer les compétences JavaScript/TypeScript vers le développement mobile natif',
        'Concevoir et développer une API REST sécurisée avec Node.js',
        'Implémenter des fonctionnalités offline-first pour une expérience utilisateur optimale'
      ]
    },
    {
      title: 'Plateforme d\'Analyse de Données',
      description: 'Développer une application d\'analyse et de visualisation de données basée sur vos compétences en gestion de bases de données.',
      type: 'project',
      timeline: 'mid',
      priority: 'medium',
      tags: ['Python', 'Flask', 'PostgreSQL', 'Data Visualization'],
      objectives: [
        'Exploiter vos compétences en Python et bases de données',
        'Créer des visualisations de données interactives avec D3.js',
        'Optimiser les requêtes SQL pour des performances élevées'
      ]
    },
    {
      title: 'DevOps et Infrastructure as Code',
      description: 'Approfondir les compétences DevOps en implémentant une infrastructure complète avec Docker et des outils CI/CD.',
      type: 'opportunity',
      timeline: 'short',
      priority: 'high',
      tags: ['Docker', 'CI/CD', 'GitLab', 'Infrastructure as Code'],
      objectives: [
        'Développer une expertise en conteneurisation avec Docker',
        'Mettre en place des pipelines CI/CD automatisés pour le déploiement continu',
        'Documenter les bonnes pratiques DevOps pour les équipes de développement'
      ]
    },
    {
      title: 'Contribution Open Source Vue.js/Angular',
      description: 'Contribuer à des projets open source dans l\'écosystème des frameworks frontend que vous maîtrisez déjà.',
      type: 'project',
      timeline: 'long',
      priority: 'medium',
      tags: ['Open Source', 'Vue.js', 'Angular', 'Communauté'],
      objectives: [
        'Développer des composants réutilisables pour Vue.js ou Angular',
        'Participer à l\'amélioration de la documentation technique',
        'Acquérir de la visibilité dans la communauté des développeurs frontend'
      ]
    },
    {
      title: 'Formation Technique et Mentorat',
      description: 'Partager vos connaissances techniques en développant du contenu éducatif et en mentorant des développeurs juniors.',
      type: 'opportunity',
      timeline: 'mid',
      priority: 'medium',
      tags: ['Formation', 'Documentation', 'Leadership Technique'],
      objectives: [
        'Créer des tutoriels et des guides sur les technologies que vous maîtrisez',
        'Animer des sessions de formation sur le développement fullstack',
        'Accompagner des développeurs juniors dans leur montée en compétence'
      ]
    }
  ];

  // Environnement idéal
  idealEnvironment: EnvironmentCategory[] = [
    {
      title: 'Culture d\'entreprise',
      icon: 'bi-building',
      items: [
        {
          title: 'Innovation technique',
          description: 'Entreprise qui valorise l\'innovation technique et encourage l\'exploration de nouvelles technologies comme la 3D web et les frameworks front-end modernes que vous maîtrisez.',
          icon: 'bi-lightbulb'
        },
        {
          title: 'Équilibre travail-études',
          description: 'Organisation qui soutient pleinement le modèle d\'alternance et offre un équilibre optimal entre missions professionnelles et formation académique en informatique.',
          icon: 'bi-book'
        },
        {
          title: 'Rigueur et créativité',
          description: 'Culture qui combine rigueur technique et créativité, valorisant à la fois les solutions robustes et les approches innovantes, en phase avec votre profil.',
          icon: 'bi-stars'
        }
      ]
    },
    {
      title: 'Projets et technologies',
      icon: 'bi-code-slash',
      items: [
        {
          title: 'Projets Full Stack',
          description: 'Projets qui exploitent pleinement la double compétence frontend/backend avec les technologies que vous maîtrisez (Vue.js, Angular, Spring Boot, Symfony).',
          icon: 'bi-layers'
        },
        {
          title: 'Expérimentation 3D/mobile',
          description: 'Opportunités de développer des applications intégrant des technologies 3D et mobiles, prolongeant votre expérience actuelle chez ANG Tech.',
          icon: 'bi-phone'
        },
        {
          title: 'Infrastructure moderne',
          description: 'Utilisation de Docker, Git et des pipelines CI/CD que vous connaissez déjà, avec possibilité d\'approfondir ces compétences DevOps.',
          icon: 'bi-gear'
        }
      ]
    },
    {
      title: 'Équipe et collaboration',
      icon: 'bi-people',
      items: [
        {
          title: 'Équipe pluridisciplinaire',
          description: 'Travail au sein d\'une équipe aux compétences variées permettant d\'enrichir votre vision fullstack et de renforcer vos soft skills comme le travail d\'équipe.',
          icon: 'bi-people-fill'
        },
        {
          title: 'Mentorat technique',
          description: 'Accès à des développeurs seniors pouvant vous guider dans votre progression technique et vous aider à approfondir vos connaissances.',
          icon: 'bi-person-check'
        },
        {
          title: 'Autonomie progressive',
          description: 'Environnement qui vous permet de gagner en autonomie tout en bénéficiant d\'un encadrement adapté à votre statut d\'alternant.',
          icon: 'bi-award'
        }
      ]
    },
    {
      title: 'Développement professionnel',
      icon: 'bi-arrow-up-right',
      items: [
        {
          title: 'Montée en compétences techniques',
          description: 'Possibilités d\'approfondir vos compétences dans vos domaines de prédilection (Vue.js, Spring Boot) tout en explorant de nouvelles technologies.',
          icon: 'bi-graph-up'
        },
        {
          title: 'Documentation et formation',
          description: 'Opportunités de renforcer vos compétences en rédaction technique et documentation, suite à votre expérience chez ANG Tech.',
          icon: 'bi-file-text'
        },
        {
          title: 'Préparation post-alternance',
          description: 'Accompagnement dans la transition vers un rôle de développeur fullstack à temps plein à l\'issue de votre Master en Informatique.',
          icon: 'bi-signpost-split'
        }
      ]
    },
    {
      title: 'Équilibre et bien-être',
      icon: 'bi-heart',
      items: [
        {
          title: 'Flexibilité d\'organisation',
          description: 'Flexibilité permettant de concilier vos études à l\'Université de Toulouse Jean Jaurès avec vos missions professionnelles.',
          icon: 'bi-clock'
        },
        {
          title: 'Espace pour les passions',
          description: 'Culture qui respecte l\'équilibre vie professionnelle/personnelle et vous laisse du temps pour vos centres d\'intérêt comme la cuisine et le chant.',
          icon: 'bi-music-note'
        },
        {
          title: 'Localisation adaptée',
          description: 'Emplacement géographique accessible depuis votre domicile à Toulouse ou possibilité de travail à distance partiel.',
          icon: 'bi-geo-alt'
        }
      ]
    }
  ];
  // Ajouter ces propriétés à la classe AttentesComponent
isQuizModalOpen: boolean = false;
quizCompleted: boolean = false;
quizPassed: boolean = false;
quizScore: number = 0;

// Types de quiz
quizTypes: string[] = ['prioritization', 'scenarios', 'compatibility'];
quizType: string = 'prioritization';
quizIndex: number = 0;

// Données pour le quiz de priorisation
prioritizationItems: PrioritizationItem[] = [
  {
    id: 'expertise_fullstack',
    title: 'Expertise Full Stack',
    description: 'Maîtriser les technologies front-end (Vue.js, Angular) et back-end (Spring Boot, Symfony) ainsi que l\'intégration 3D',
    icon: 'bi-code-slash',
    correctRank: 0
  },
  {
    id: 'reussite_alternance',
    title: 'Réussite en Alternance',
    description: 'Équilibrer formation académique à l\'Université de Toulouse Jean Jaurès et missions professionnelles',
    icon: 'bi-book',
    correctRank: 1
  },
  {
    id: 'projets_techniques',
    title: 'Projets Techniques Complets',
    description: 'Développer des applications web/mobile complètes avec intégration d\'API et expérience 3D',
    icon: 'bi-layers',
    correctRank: 2
  },
  {
    id: 'competences_devops',
    title: 'Compétences DevOps',
    description: 'Renforcer les connaissances en Docker, CI/CD et bonnes pratiques de développement',
    icon: 'bi-gear',
    correctRank: 3
  },
  {
    id: 'preparation_carriere',
    title: 'Préparation à la Carrière',
    description: 'Développer les bases solides pour évoluer vers des rôles techniques avancés après le Master',
    icon: 'bi-graph-up',
    correctRank: 4
  }
];
prioritizationCompleted: boolean = false;

// Données pour le quiz de scénarios
scenarios: Scenario[] = [
  {
    title: 'Choix de projet',
    description: 'En tant qu\'alternant développeur Fullstack, on vous propose deux projets: développer une application web avec Vue.js et API REST ou travailler sur une application mobile native nécessitant d\'apprendre un nouveau langage. Que choisiriez-vous?',
    options: [
      'L\'application web avec Vue.js et API REST, technologies que vous maîtrisez déjà',
      'L\'application mobile native pour élargir vos compétences',
      'Proposer une solution hybride utilisant vos compétences web pour créer une application cross-platform',
      'Demander à partager votre temps entre les deux projets'
    ],
    correctOption: 2,
    feedback: {
      correct: 'Excellent choix! Votre profil montre une volonté d\'exploiter vos compétences web existantes tout en les étendant vers le mobile, ce qui correspond à votre expérience chez ANG Tech.',
      incorrect: 'Compte tenu de votre profil, vous privilégieriez une solution hybride qui combine vos compétences web actuelles (Vue.js) tout en développant votre expertise mobile, comme l\'indique votre expérience en développement d\'applications web/mobile.'
    }
  },
  {
    title: 'Équilibre études-travail',
    description: 'Votre entreprise vous confie un projet ambitieux avec une deadline serrée qui coïncide avec une période d\'examens importants à l\'université. Comment gérez-vous cette situation?',
    options: [
      'Vous privilégiez le projet professionnel et réduisez le temps consacré à vos études',
      'Vous privilégiez vos examens et demandez un délai supplémentaire pour le projet',
      'Vous établissez un planning précis pour équilibrer les deux responsabilités et communiquez clairement avec les parties prenantes',
      'Vous déléguez une partie du projet à vos collègues'
    ],
    correctOption: 2,
    feedback: {
      correct: 'Parfait! Cette approche reflète votre capacité de gestion du temps et d\'organisation mentionnée dans vos soft skills, tout en respectant vos engagements académiques et professionnels.',
      incorrect: 'Votre profil indique une forte capacité de gestion du temps et d\'organisation. La meilleure approche serait d\'établir un planning précis et de communiquer ouvertement avec toutes les parties prenantes pour trouver un équilibre entre vos études et votre travail.'
    }
  },
  {
    title: 'Développement technique',
    description: 'Vous avez l\'opportunité de vous former à une nouvelle technologie. Laquelle choisiriez-vous prioritairement, en fonction de votre profil actuel?',
    options: [
      'Une formation avancée en management d\'équipe technique',
      'Un framework JavaScript front-end concurrent de Vue.js',
      'Une technologie de conteneurisation et orchestration comme Kubernetes',
      'Un framework de développement mobile cross-platform comme React Native'
    ],
    correctOption: 3,
    feedback: {
      correct: 'Excellent choix! Le développement mobile cross-platform représente une extension naturelle de vos compétences web actuelles et s\'aligne avec votre expérience en développement d\'applications web/mobile.',
      incorrect: 'Compte tenu de votre expérience en développement d\'applications web et mobile et de votre maîtrise de JavaScript/TypeScript, apprendre React Native vous permettrait d\'étendre naturellement vos compétences vers le mobile cross-platform.'
    }
  },
  {
    title: 'Environnement de travail',
    description: 'Quelle caractéristique d\'entreprise serait la plus importante pour vous dans votre situation d\'alternant développeur Fullstack?',
    options: [
      'Une entreprise utilisant exclusivement les dernières technologies',
      'Une société offrant la possibilité de télétravailler à 100%',
      'Une organisation avec des mentors expérimentés et un accompagnement structuré',
      'Une startup proposant des opportunités de prise de responsabilité rapide'
    ],
    correctOption: 2,
    feedback: {
      correct: 'Tout à fait! Dans votre situation d\'alternant cherchant à développer vos compétences, l\'accès à des mentors expérimentés et un bon accompagnement est crucial pour votre progression technique.',
      incorrect: 'En tant qu\'alternant développeur Fullstack en formation, l\'accès à des mentors expérimentés et un accompagnement structuré vous permettrait de progresser plus efficacement, comme le suggère votre profil orienté vers l\'apprentissage et le perfectionnement.'
    }
  },
  {
    title: 'Projet personnel',
    description: 'Si vous deviez développer un projet personnel pour enrichir votre portfolio, lequel choisiriez-vous?',
    options: [
      'Un site web statique avec un design élaboré',
      'Une application métier pure backend avec API REST complexe',
      'Une application mobile native iOS ou Android',
      'Une application web fullstack avec fonctionnalités 3D et interface responsive'
    ],
    correctOption: 3,
    feedback: {
      correct: 'Parfait choix! Une application fullstack avec des fonctionnalités 3D s\'aligne parfaitement avec votre expérience chez ANG Tech et valorise l\'ensemble de vos compétences frontend, backend et 3D.',
      incorrect: 'Votre profil et votre expérience chez ANG Tech suggèrent qu\'une application fullstack intégrant des éléments 3D serait idéale pour mettre en valeur l\'ensemble de vos compétences techniques.'
    }
  }
];

currentScenarioIndex: number = 0;
selectedScenarioOption: number | null = null;
scenarioAnswered: boolean = false;
scenarioScores: boolean[] = [];

// Données pour le quiz de compatibilité
// Données pour le quiz de compatibilité adaptées au profil de développeur Fullstack en alternance
compatibilityItems: CompatibilityItem[] = [
  {
    title: 'Polyvalence technique',
    description: 'Capacité à travailler sur différentes couches d\'application (frontend, backend, bases de données)',
    icon: 'bi-layers',
    correctRating: 9
  },
  {
    title: 'Équilibre études-travail',
    description: 'Aptitude à gérer efficacement les responsabilités académiques et professionnelles simultanément',
    icon: 'bi-calendar-check',
    correctRating: 8
  },
  {
    title: 'Adaptation technologique',
    description: 'Capacité à apprendre et maîtriser rapidement de nouveaux frameworks et technologies',
    icon: 'bi-lightning',
    correctRating: 9
  },
  {
    title: 'Travail en équipe',
    description: 'Affinité pour la collaboration, le partage de connaissances et les projets collectifs',
    icon: 'bi-people',
    correctRating: 7
  },
  {
    title: 'Documentation et rigueur',
    description: 'Aptitude à documenter le code et les architectures avec précision et méthodologie',
    icon: 'bi-file-text',
    correctRating: 8
  },
  {
    title: 'Autonomie technique',
    description: 'Capacité à résoudre des problèmes techniques et à progresser sans supervision constante',
    icon: 'bi-person-check',
    correctRating: 7
  },
  {
    title: 'Créativité technique',
    description: 'Capacité à proposer des solutions innovantes et à penser hors des sentiers battus',
    icon: 'bi-lightbulb',
    correctRating: 8
  }
];
compatibilityRatings: number[] = [5, 5, 5, 5, 5];
compatibilityCompleted: boolean = false;

  constructor(
    private router: Router,
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService
  ) {}

  ngOnInit() {

    if (!this.progressService.isModuleAvailable('attentes')) {
      console.warn('Ce module n\'est pas encore disponible');
      // Logique de redirection à implémenter si nécessaire
    }

    // Initialiser le terminal avec un message de bienvenue
    this.terminalLines = [
      {
        type: 'output',
        text: `
┌─────────────────────────────────────────────────────┐
│                                                     │
│  SYSTÈME DE PROJECTION PROFESSIONNELLE v2.0         │
│  © Département d'Analyse des Trajectoires           │
│                                                     │
│  Initialisation du terminal...                      │
│  Connexion sécurisée établie.                       │
│  Tapez 'help' pour voir les commandes disponibles.  │
│                                                     │
└─────────────────────────────────────────────────────┘`,
        active: true
      }
    ];

    // S'abonner au temps écoulé
    this.subscriptions.push(
      this.timeTrackerService.elapsedTime$.subscribe(time => {
        this.elapsedTime = time;
      })
    );

    // Vérifier si le module est déjà complété
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe(statuses => {
        this.isModuleCompleted = statuses.attentes;
        this.moduleProgressPercentage = this.progressService.getCompletionPercentage();
        
        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadUserResponses();
        }
      })
    );

    this.subscriptions.push(
      this.dialogService.isDialogOpen$.subscribe(isOpen => {
        this.isDialogOpen = isOpen;
      }),
      this.dialogService.isTyping$.subscribe(isTyping => {
        this.isTyping = isTyping;
      }),
      this.dialogService.currentMessage$.subscribe(message => {
        this.dialogMessage = message;
      })
    );

    // Vérifier si ce module est disponible
    if (!this.progressService.isModuleAvailable('attentes')) {
      // Rediriger vers la page d'accueil ou afficher un message
      console.warn('Ce module n\'est pas encore disponible');
      // Logique de redirection à implémenter si nécessaire
    }
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService au lieu du typewriter manuel
    setTimeout(() => {
      this.showIntroDialog();
    }, 500);
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions pour éviter les fuites de mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: "", // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective'
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText, () => {
      setTimeout(() => {
        this.dialogService.closeDialog()
      }, 3000);
    });
  }

  // Fermer le dialogue
  closeDialogTypeWriter(): void {
    this.dialogService.closeDialog();
  }

  // Enregistrer les réponses utilisateur
  saveUserResponse(questionId: string, response: any): void {
    this.userDataService.saveResponse('attentes', questionId, response);
  }

  // Charger les réponses utilisateur précédentes
  loadUserResponses(): void {
    const responses = this.userDataService.getModuleResponses('attentes');
    
    if (responses.length > 0) {
      // Exemple pour précharger des aspirations révélées
      const aspirationsResponse = responses.find(r => r.questionId === 'aspirations');
      if (aspirationsResponse && typeof aspirationsResponse.response === 'boolean' && aspirationsResponse.response === true) {
        this.showAspirationsMap = true;
        this.revealAllBranches();
      }

      // Exemple pour précharger des projets révélés
      const projectsResponse = responses.find(r => r.questionId === 'projects');
      if (projectsResponse && typeof projectsResponse.response === 'boolean' && projectsResponse.response === true) {
        this.showFutureProjects = true;
      }

      // Exemple pour précharger l'environnement idéal
      const environmentResponse = responses.find(r => r.questionId === 'environment');
      if (environmentResponse && typeof environmentResponse.response === 'boolean' && environmentResponse.response === true) {
        this.showIdealProfile = true;
      }

      // Précharger la timeline sélectionnée
      const timelineResponse = responses.find(r => r.questionId === 'timeline');
      if (timelineResponse && (timelineResponse.response === 'short' || timelineResponse.response === 'mid' || timelineResponse.response === 'long')) {
        this.selectedTimeline = timelineResponse.response as 'short' | 'mid' | 'long';
      }
    }
  }

  // Marquer le module comme complété
  completeModule(): void {
    if (!this.isModuleCompleted && 
        this.showAspirationsMap && 
        this.showFutureProjects && 
        this.showIdealProfile) {
      this.progressService.completeModule('attentes');
      this.isModuleCompleted = true;
      
      // Ajouter une note automatique pour résumer ce qui a été fait
      this.addCompletionNote();
    }
  }

  // Ajouter une note de complétion automatique
  addCompletionNote(): void {
    const noteContent = `
Module "Attentes Professionnelles" complété le ${new Date().toLocaleDateString()}.
Aspirations principales identifiées: Expertise Technique, Leadership, Innovation.
Projets prioritaires à court terme: Architecture Cloud Native, Leadership Technique.
Environnement idéal: Culture d'innovation, équipe pluridisciplinaire, projets à impact.
    `;
    
    this.noteService.addNote(noteContent.trim());
  }

  // Simulation de saisie de commande
  executeCommand(command: string): void {
    if (this.executingCommand) return;
    
    this.executingCommand = true;
    this.showTopicSuggestions = false;
    this.currentInput = command;
    
    // Simuler la saisie
    setTimeout(() => {
      // Ajouter la commande au terminal
      this.terminalLines.push({
        type: 'input',
        text: this.currentInput,
        active: true
      });
      
      // Réinitialiser l'input
      this.currentInput = '';
      
      // Traiter la commande
      this.processCommand(command);
      
      // Faire défiler jusqu'au bas du terminal
      setTimeout(() => {
        if (this.terminalOutput) {
          this.terminalOutput.nativeElement.scrollTop = this.terminalOutput.nativeElement.scrollHeight;
        }
      }, 100);
    }, 500);
  }
  
  // Traitement des commandes
  processCommand(command: string): void {
    switch(command) {
      case 'help':
        this.showHelpCommand();
        break;
      case 'scan_aspirations':
        this.scanAspirationsCommand();
        break;
      case 'scan_projects':
        this.scanProjectsCommand();
        break;
      case 'scan_environment':
        this.scanEnvironmentCommand();
        break;
      case 'clear':
        this.clearCommand();
        break;
      default:
        if (command.startsWith('explore_')) {
          const topic = command.replace('explore_', '');
          this.exploreTopicCommand(topic);
        } else {
          this.unknownCommand(command);
        }
    }

    // Vérifier si le module peut être marqué comme complété
    if (this.showAspirationsMap && this.showFutureProjects && this.showIdealProfile) {
      this.completeModule();
    }
  }
  
  // Commande d'aide (inchangée)
  showHelpCommand(): void {
    this.terminalLines.push({
      type: 'output',
      text: `
<span class="highlight">Commandes disponibles:</span>

  help              - Affiche cette liste de commandes
  scan_aspirations  - Analyse les aspirations professionnelles
  scan_projects     - Explore les projets et opportunités futures
  scan_environment  - Évalue l'environnement de travail idéal
  explore_[sujet]   - Approfondit un sujet spécifique
  clear             - Efface le terminal

<span class="highlight">Sujets explorables:</span>
  technologies, équipe, management, croissance, équilibre
`,
      active: true
    });
    
    this.showTopicSuggestions = true;
    this.executingCommand = false;
  }
  
  // Commande pour scanner les aspirations
  scanAspirationsCommand(): void {
    this.terminalLines.push({
      type: 'output',
      text: `
<span class="highlight">Analyse des aspirations professionnelles en cours...</span>

Initialisation du scan...
Accès aux données biométriques...
Analyse des modèles de comportement...
Corrélation avec l'historique professionnel...
Évaluation des facteurs de motivation...

<span class="highlight">Scan complété avec succès!</span>
Carte des aspirations professionnelles générée.
`,
      active: true
    });
    
    this.showAspirations = true
    // Montrer la carte des aspirations
    setTimeout(() => {
      this.showAspirationsMap = true;
      // Enregistrer la réponse utilisateur
      this.saveUserResponse('aspirations', true);
      this.executingCommand = false;
      
      // Révéler progressivement les branches
      this.revealBranchesProgressively();
    }, 1500);
  }

  // Révéler progressivement les branches
  revealBranchesProgressively(): void {
    this.aspirationBranches.forEach((branch, index) => {
      setTimeout(() => {
        branch.revealed = true;
        
        // Révéler les sous-branches avec délai
        branch.subBranches.forEach((subBranch, subIndex) => {
          setTimeout(() => {
            subBranch.revealed = true;
          }, 300 * subIndex);
        });
      }, 500 * index);
    });
  }

  // Révéler toutes les branches immédiatement
  revealAllBranches(): void {
    this.aspirationBranches.forEach(branch => {
      branch.revealed = true;
      branch.subBranches.forEach(subBranch => {
        subBranch.revealed = true;
      });
    });
  }
  
  // Commande pour scanner les projets
  scanProjectsCommand(): void {
    this.terminalLines.push({
      type: 'output',
      text: `
<span class="highlight">Analyse des projets et opportunités futures en cours...</span>

Chargement des données prédictives...
Évaluation des tendances du marché...
Identification des opportunités futures...
Calcul des trajectoires de carrière possibles...
Évaluation des facteurs de risque et de réussite...

<span class="highlight">Analyse complétée!</span>
Projets futurs et opportunités identifiés avec succès.
`,
      active: true
    });
    
    // Montrer les projets futurs
    setTimeout(() => {
      this.showFutureProjects = true;
      // Enregistrer la réponse utilisateur
      this.saveUserResponse('projects', true);
      this.executingCommand = false;
    }, 1500);
  }
  
  // Commande pour scanner l'environnement idéal
  scanEnvironmentCommand(): void {
    this.terminalLines.push({
      type: 'output',
      text: `
<span class="highlight">Analyse de l'environnement de travail idéal en cours...</span>

Récupération des données psychométriques...
Analyse des préférences professionnelles...
Identification des facteurs de satisfaction...
Corrélation avec les performances historiques...
Modélisation des compatibilités d'équipe...

<span class="highlight">Profil d'environnement idéal généré avec succès!</span>
Affichage des résultats...
`,
      active: true
    });
    
    // Montrer le profil idéal
    setTimeout(() => {
      this.showIdealProfile = true;
      // Enregistrer la réponse utilisateur
      this.saveUserResponse('environment', true);
      this.executingCommand = false;
    }, 1500);
  }
  
  // Commande pour effacer le terminal (inchangée)
  clearCommand(): void {
    this.terminalLines = [
      {
        type: 'output',
        text: 'Terminal effacé. Tapez \'help\' pour voir les commandes disponibles.',
        active: true
      }
    ];
    this.executingCommand = false;
  }
  
  // Commande pour explorer un sujet spécifique
  exploreTopicCommand(topic: string): void {
    let outputText = '';
    
    switch(topic) {
      case 'technologies':
        outputText = `
<span class="highlight">Exploration du sujet: Technologies</span>

Intérêts principaux identifiés:
- Architectures cloud natives et conteneurisation
- Technologies front-end modernes (Angular, React)
- DevOps et automatisation des déploiements
- Intelligence artificielle et apprentissage automatique

Trajectoire d'apprentissage recommandée:
1. Approfondir l'expertise Kubernetes et cloud hybride
2. Explorer les architectures événementielles
3. Développer des compétences en IA appliquée aux applications web
`;
        break;
        
      // Autres cas inchangés...
        
      default:
        outputText = `
<span class="highlight">Sujet "${topic}" non reconnu</span>

Veuillez choisir parmi les sujets disponibles:
technologies, équipe, management, croissance, équilibre
`;
    }
    
    this.terminalLines.push({
      type: 'output',
      text: outputText,
      active: true
    });

    // Enregistrer la réponse utilisateur pour ce sujet
    this.saveUserResponse(`explore_${topic}`, true);
    
    this.executingCommand = false;
  }
  
  // Commande inconnue (inchangée)
  unknownCommand(command: string): void {
    this.terminalLines.push({
      type: 'output',
      text: `Commande '${command}' non reconnue. Tapez 'help' pour voir la liste des commandes disponibles.`,
      active: true
    });
    
    this.executingCommand = false;
  }
  
  // Explorer un sujet depuis les boutons
  exploreTopic(topic: string): void {
    if (this.executingCommand) return;
    
    this.executeCommand(`explore_${topic}`);
  }
  
  // Sélectionner une timeline de projets
  selectTimeline(timeline: 'short' | 'mid' | 'long'): void {
    this.selectedTimeline = timeline;
    // Enregistrer la préférence de timeline
    this.saveUserResponse('timeline', timeline);
  }
  
  // Obtenir les projets filtrés par timeline
  getProjectsByTimeline(): FutureProject[] {
    return this.futureProjects.filter(project => project.timeline === this.selectedTimeline);
  }
  
  // Obtenir le libellé d'une timeline
  getTimelineLabel(timeline: string): string {
    switch(timeline) {
      case 'short': return 'Court terme (0-1 an)';
      case 'mid': return 'Moyen terme (1-3 ans)';
      case 'long': return 'Long terme (3-5 ans)';
      default: return '';
    }
  }
  
  // Ouvrir le panneau de notes
  toggleNotes(): void {
    this.noteService.toggleNotesVisibility();
  }
  
  // Calculer l'angle pour positionner un nœud dans la carte mentale
  getNodeAngle(index: number, total: number): string {
    if (total <= 1) return '0deg';
    // Distribuer les branches sur 360 degrés, mais commencer depuis le haut (270°)
    const angleDegrees = 270 + (index * (360 / total));
    return `${angleDegrees}deg`;
  }
  
  // Calculer l'angle pour positionner une sous-branche
  getSubNodeAngle(index: number, total: number): string {
    if (total <= 1) return '0deg';
    // Répartir les sous-branches sur un arc de 120 degrés (-60 à +60)
    const angleDegrees = -60 + (index * (120 / (total - 1)));
    return `${angleDegrees}deg`;
  }

  // Fonction pour vérifier si l'utilisateur peut accéder au quiz
canAccessQuiz(): boolean {
  // L'utilisateur peut accéder au quiz s'il a révélé au moins 2 sections sur 3
  let sectionsRevealed = 0;
  if (this.showAspirationsMap) sectionsRevealed++;
  if (this.showFutureProjects) sectionsRevealed++;
  if (this.showIdealProfile) sectionsRevealed++;
  
  return sectionsRevealed >= 2;
}

// Fonctions pour le quiz modal
openQuizModal(): void {
  // Réinitialiser le quiz
  this.quizCompleted = false;
  this.quizPassed = false;
  this.quizIndex = 0;
  this.quizType = this.quizTypes[0];
  this.quizScore = 0;
  
  // Initialiser les données du quiz
  this.initPrioritizationQuiz();
  this.initScenariosQuiz();
  this.initCompatibilityQuiz();
  
  // Ouvrir la modal
  this.isQuizModalOpen = true;
}

closeQuizModal(): void {
  this.isQuizModalOpen = false;
}

// Initialiser le quiz de priorisation
initPrioritizationQuiz(): void {
  // Mélanger les items de priorisation
  this.shuffleArray(this.prioritizationItems);
  this.prioritizationCompleted = false;
}

// Initialiser le quiz de scénarios
initScenariosQuiz(): void {
  this.currentScenarioIndex = 0;
  this.selectedScenarioOption = null;
  this.scenarioAnswered = false;
  this.scenarioScores = [];
}

// Initialiser le quiz de compatibilité
initCompatibilityQuiz(): void {
  // Réinitialiser les notations à 5 (milieu)
  this.compatibilityRatings = this.compatibilityItems.map(() => 5);
  this.compatibilityCompleted = false;
}

// Fonction pour mélanger un tableau
shuffleArray(array: any[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Gérer le drop dans le quiz de priorisation
dropPriority(event: CdkDragDrop<any[]>): void {
  if (this.prioritizationCompleted) return;
  
  moveItemInArray(this.prioritizationItems, event.previousIndex, event.currentIndex);
}

// Valider la priorisation
validatePrioritization(): void {
  this.prioritizationCompleted = true;
  
  // Sauvegarder l'ordre de priorisation
  this.saveUserResponse('prioritization_order', this.prioritizationItems.map(item => item.id));
}

// Sélectionner une option de scénario
selectScenarioOption(index: number): void {
  if (this.scenarioAnswered) return;
  this.selectedScenarioOption = index;
}

// Valider la réponse au scénario
validateScenarioAnswer(): void {
  if (this.selectedScenarioOption === null) return;
  
  this.scenarioAnswered = true;
  
  // Vérifier si la réponse est correcte
  const isCorrect = this.selectedScenarioOption === this.currentScenario.correctOption;
  this.scenarioScores.push(isCorrect);
  
  // Sauvegarder la réponse
  this.saveUserResponse(`scenario_${this.currentScenarioIndex}`, {
    selected: this.selectedScenarioOption,
    correct: isCorrect
  });
}

// Passer au scénario suivant
goToNextScenario(): void {
  if (this.currentScenarioIndex < this.scenarios.length - 1) {
    this.currentScenarioIndex++;
    this.selectedScenarioOption = null;
    this.scenarioAnswered = false;
  } else {
    // Fin des scénarios, passer au quiz suivant
    this.goToNextQuiz();
  }
}

// Valider l'évaluation de compatibilité
validateCompatibility(): void {
  this.compatibilityCompleted = true;
  
  // Sauvegarder les notations
  this.saveUserResponse('compatibility_ratings', this.compatibilityRatings);
}

// Passer au quiz suivant
goToNextQuiz(): void {
  if (this.quizIndex < this.quizTypes.length - 1) {
    this.quizIndex++;
    this.quizType = this.quizTypes[this.quizIndex];
  } else {
    // Terminer le quiz
    this.completeQuiz();
  }
}

// Récupérer le scénario actuel
get currentScenario(): Scenario {
  return this.scenarios[this.currentScenarioIndex];
}

// Calcul du score du quiz
completeQuiz(): void {
  this.quizCompleted = true;
  
  // Calculer le score de priorisation (40% du score total)
  let prioritizationScore = 0;
  this.prioritizationItems.forEach((item, index) => {
    // Plus l'item est proche de sa position correcte, plus le score est élevé
    const distance = Math.abs(index - item.correctRank);
    if (distance === 0) prioritizationScore += 1; // Position parfaite
    else if (distance === 1) prioritizationScore += 0.5; // Une position d'écart
  });
  const normalizedPrioritizationScore = (prioritizationScore / this.prioritizationItems.length) * 40;
  
  // Calculer le score des scénarios (40% du score total)
  const scenarioScore = (this.scenarioScores.filter(s => s).length / this.scenarios.length) * 40;
  
  // Calculer le score de compatibilité (20% du score total)
  let compatibilityScore = 0;
  this.compatibilityItems.forEach((item, index) => {
    const difference = Math.abs(this.compatibilityRatings[index] - item.correctRating);
    if (difference <= 1) compatibilityScore += 1; // Très proche
    else if (difference <= 2) compatibilityScore += 0.75; // Assez proche
    else if (difference <= 3) compatibilityScore += 0.5; // Différence modérée
    else compatibilityScore += 0.25; // Différence importante
  });
  const normalizedCompatibilityScore = (compatibilityScore / this.compatibilityItems.length) * 20;
  
  // Score final
  this.quizScore = Math.round(normalizedPrioritizationScore + scenarioScore + normalizedCompatibilityScore);
  
  // Quiz réussi si score >= 70%
  this.quizPassed = this.quizScore >= 70;
  
  // Sauvegarder le score
  this.saveUserResponse('quiz_score', this.quizScore);
  
  // Si le quiz est réussi, compléter le module
  if (this.quizPassed && !this.isModuleCompleted) {
    this.completeModule();
  }
}

// Recommencer le quiz
restartQuiz(): void {
  this.quizIndex = 0;
  this.quizType = this.quizTypes[0];
  this.quizCompleted = false;
  
  // Réinitialiser les quiz
  this.initPrioritizationQuiz();
  this.initScenariosQuiz();
  this.initCompatibilityQuiz();
}

// Naviguer vers la page suivante
navigateToNextPage(): void {
  this.closeQuizModal();
  this.router.navigate(['/personnalite']);
}
}