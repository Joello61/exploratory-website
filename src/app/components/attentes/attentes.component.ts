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
    'technologies',
    'équipe',
    'management',
    'croissance',
    'équilibre'
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
          title: 'Maîtrise des Architectures Cloud',
          icon: 'bi-cloud',
          description: 'Développer une expertise approfondie dans la conception et l\'implémentation d\'architectures cloud modernes et évolutives.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Technologies Émergentes',
          icon: 'bi-lightbulb',
          description: 'Rester à la pointe des technologies web émergentes et des frameworks innovants pour maintenir une expertise technique de haut niveau.',
          priority: 'medium',
          revealed: false
        },
        {
          title: 'Optimisation Performance',
          icon: 'bi-speedometer2',
          description: 'Approfondir les connaissances en matière d\'optimisation de performance des applications web et mobile à grande échelle.',
          priority: 'medium',
          revealed: false
        }
      ]
    },
    {
      title: 'Leadership',
      icon: 'bi-people',
      priority: 'high',
      revealed: false,
      subBranches: [
        {
          title: 'Direction Technique',
          icon: 'bi-diagram-3',
          description: 'Évoluer vers un rôle de leadership technique avec la capacité de guider des équipes sur des projets complexes et novateurs.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Mentorat & Formation',
          icon: 'bi-mortarboard',
          description: 'Contribuer activement au développement professionnel des développeurs juniors à travers des programmes de mentorat structurés.',
          priority: 'medium',
          revealed: false
        },
        {
          title: 'Vision Stratégique',
          icon: 'bi-binoculars',
          description: 'Développer une vision stratégique permettant d\'aligner les solutions techniques avec les objectifs business à long terme.',
          priority: 'medium',
          revealed: false
        }
      ]
    },
    {
      title: 'Innovation',
      icon: 'bi-lightbulb',
      priority: 'high',
      revealed: false,
      subBranches: [
        {
          title: 'R&D Produit',
          icon: 'bi-puzzle',
          description: 'Participer activement à la recherche et au développement de nouvelles solutions et produits innovants avec un impact significatif.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Méthodologies Agiles',
          icon: 'bi-kanban',
          description: 'Explorer et implémenter des méthodologies agiles avancées pour optimiser les processus de développement.',
          priority: 'low',
          revealed: false
        },
        {
          title: 'Open Source',
          icon: 'bi-github',
          description: 'Contribuer à des projets open source stratégiques et potentiellement initier des projets communautaires.',
          priority: 'medium',
          revealed: false
        }
      ]
    },
    {
      title: 'Projet d\'Impact',
      icon: 'bi-bullseye',
      priority: 'medium',
      revealed: false,
      subBranches: [
        {
          title: 'Solutions à Grande Échelle',
          icon: 'bi-graph-up',
          description: 'Travailler sur des projets à forte visibilité avec un impact mesurable sur un grand nombre d\'utilisateurs.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Technologies Durables',
          icon: 'bi-globe',
          description: 'Contribuer au développement de solutions technologiques durables et respectueuses de l\'environnement.',
          priority: 'medium',
          revealed: false
        },
        {
          title: 'Innovation Sociale',
          icon: 'bi-heart',
          description: 'Participer à des projets ayant un impact social positif, utilisant la technologie pour résoudre des problèmes communautaires.',
          priority: 'low',
          revealed: false
        }
      ]
    },
    {
      title: 'Développement Personnel',
      icon: 'bi-graph-up',
      priority: 'medium',
      revealed: false,
      subBranches: [
        {
          title: 'Compétences Soft',
          icon: 'bi-chat',
          description: 'Renforcer les compétences de communication, de présentation et de négociation pour collaborer efficacement avec toutes les parties prenantes.',
          priority: 'medium',
          revealed: false
        },
        {
          title: 'Équilibre Pro/Perso',
          icon: 'bi-balance-scale',
          description: 'Maintenir un équilibre sain entre vie professionnelle et personnelle, même dans un environnement de haute performance.',
          priority: 'high',
          revealed: false
        },
        {
          title: 'Réseautage Professionnel',
          icon: 'bi-person-plus',
          description: 'Développer un réseau professionnel solide à travers des conférences, événements tech et communautés en ligne.',
          priority: 'low',
          revealed: false
        }
      ]
    }
  ];

   // Projets futurs
   futureProjects: FutureProject[] = [
    {
      title: 'Architecture Cloud Native',
      description: 'Concevoir et implémenter une architecture cloud native complète pour des applications à haute disponibilité.',
      type: 'project',
      timeline: 'short',
      priority: 'high',
      tags: ['AWS', 'Kubernetes', 'Microservices', 'DevOps'],
      objectives: [
        'Maîtriser le déploiement d\'applications sur Kubernetes',
        'Implémenter des pratiques GitOps pour le déploiement continu',
        'Concevoir des systèmes résilients avec une disponibilité de 99.9%'
      ]
    },
    {
      title: 'Leadership Technique',
      description: 'Évoluer vers un rôle de leadership technique en dirigeant des équipes sur des projets complexes.',
      type: 'opportunity',
      timeline: 'short',
      priority: 'high',
      tags: ['Leadership', 'Gestion d\'équipe', 'Architecture'],
      objectives: [
        'Diriger une équipe de développeurs sur un projet stratégique',
        'Mettre en place des pratiques de code review et de qualité',
        'Mentorer des développeurs juniors et intermédiaires'
      ]
    },
    {
      title: 'Plateforme SaaS Innovante',
      description: 'Contribuer au développement d\'une plateforme SaaS de nouvelle génération avec des fonctionnalités IA intégrées.',
      type: 'project',
      timeline: 'mid',
      priority: 'medium',
      tags: ['SaaS', 'IA', 'UX/UI', 'Architecture'],
      objectives: [
        'Concevoir une architecture extensible et modulaire',
        'Intégrer des algorithmes d\'IA pour l\'automatisation des tâches',
        'Optimiser l\'expérience utilisateur pour une adoption rapide'
      ]
    },
    {
      title: 'Formation et Conférences',
      description: 'Développer des compétences de présentation en partageant l\'expertise technique lors de conférences et de formations.',
      type: 'opportunity',
      timeline: 'mid',
      priority: 'medium',
      tags: ['Formation', 'Communication', 'Visibilité'],
      objectives: [
        'Présenter à au moins deux conférences techniques par an',
        'Créer du contenu éducatif pour la communauté tech',
        'Animer des ateliers internes pour le transfert de connaissances'
      ]
    },
    {
      title: 'Startup Tech Innovante',
      description: 'Rejoindre ou co-fonder une startup innovante dans un domaine technologique émergent.',
      type: 'opportunity',
      timeline: 'long',
      priority: 'high',
      tags: ['Entrepreneuriat', 'Innovation', 'Technologie émergente'],
      objectives: [
        'Identifier un secteur tech en croissance avec des opportunités d\'innovation',
        'Développer un réseau de contacts dans l\'écosystème startup',
        'Acquérir des compétences en business development et stratégie produit'
      ]
    },
    {
      title: 'Projet Open Source Significatif',
      description: 'Initier ou contribuer de manière significative à un projet open source à fort impact dans la communauté tech.',
      type: 'project',
      timeline: 'long',
      priority: 'medium',
      tags: ['Open Source', 'Communauté', 'Innovation'],
      objectives: [
        'Créer une librairie ou un framework répondant à un besoin non comblé',
        'Bâtir une communauté active autour du projet',
        'Maintenir des standards élevés de qualité et de documentation'
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
          title: 'Innovation et créativité',
          description: 'Environnement qui valorise l\'expérimentation, tolère l\'échec comme partie du processus d\'apprentissage et encourage les idées nouvelles.',
          icon: 'bi-lightbulb'
        },
        {
          title: 'Autonomie et confiance',
          description: 'Culture basée sur la confiance qui permet aux équipes de s\'auto-organiser et de prendre des décisions de manière autonome.',
          icon: 'bi-shield'
        },
        {
          title: 'Transparence',
          description: 'Communication ouverte sur la stratégie, les objectifs et les défis de l\'entreprise pour permettre à chacun de s\'aligner et de contribuer efficacement.',
          icon: 'bi-eye'
        }
      ]
    },
    {
      title: 'Équipe et collaboration',
      icon: 'bi-people',
      items: [
        {
          title: 'Expertise diversifiée',
          description: 'Équipe pluridisciplinaire avec différents niveaux d\'expertise permettant un apprentissage continu et des perspectives variées.',
          icon: 'bi-people-fill'
        },
        {
          title: 'Collaboration sans silos',
          description: 'Structure qui facilite la collaboration entre les départements, avec des objectifs partagés plutôt que des intérêts concurrents.',
          icon: 'bi-diagram-3'
        },
        {
          title: 'Feedback constructif',
          description: 'Culture du feedback continu et constructif pour favoriser l\'amélioration personnelle et collective.',
          icon: 'bi-chat-dots'
        }
      ]
    },
    {
      title: 'Projets et défis techniques',
      icon: 'bi-code-slash',
      items: [
        {
          title: 'Problèmes complexes',
          description: 'Projets qui posent des défis techniques stimulants et nécessitent des solutions innovantes.',
          icon: 'bi-puzzle'
        },
        {
          title: 'Impact significatif',
          description: 'Travail sur des produits ou services qui ont un impact réel et mesurable pour les utilisateurs ou la société.',
          icon: 'bi-graph-up'
        },
        {
          title: 'Qualité technique',
          description: 'Engagement envers l\'excellence technique, avec des standards élevés de qualité de code et d\'architecture.',
          icon: 'bi-award'
        }
      ]
    },
    {
      title: 'Croissance et développement',
      icon: 'bi-arrow-up-right',
      items: [
        {
          title: 'Apprentissage continu',
          description: 'Opportunités et ressources pour développer de nouvelles compétences, explorer des technologies émergentes et se former continuellement.',
          icon: 'bi-book'
        },
        {
          title: 'Évolution de carrière',
          description: 'Parcours de progression clairs, que ce soit vers des rôles techniques spécialisés ou des positions de leadership.',
          icon: 'bi-ladder'
        },
        {
          title: 'Mentorat et coaching',
          description: 'Accès à des mentors expérimentés et opportunités de mentorer d\'autres membres de l\'équipe.',
          icon: 'bi-person-check'
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
    id: 'expertise',
    title: 'Expertise Technique',
    description: 'Développer des compétences approfondies en architecture et technologies modernes',
    icon: 'bi-code-slash',
    correctRank: 0
  },
  {
    id: 'leadership',
    title: 'Leadership Technique',
    description: 'Diriger des équipes et influencer les décisions techniques stratégiques',
    icon: 'bi-people',
    correctRank: 1
  },
  {
    id: 'innovation',
    title: 'Innovation',
    description: 'Créer et implémenter des solutions novatrices à impact significatif',
    icon: 'bi-lightbulb',
    correctRank: 2
  },
  {
    id: 'impact',
    title: 'Projets d\'Impact',
    description: 'Travailler sur des projets à forte visibilité et à impact mesurable',
    icon: 'bi-bullseye',
    correctRank: 3
  },
  {
    id: 'growth',
    title: 'Développement Personnel',
    description: 'Équilibrer compétences techniques et soft skills pour une progression de carrière optimale',
    icon: 'bi-graph-up',
    correctRank: 4
  }
];
prioritizationCompleted: boolean = false;

// Données pour le quiz de scénarios
scenarios: Scenario[] = [
  {
    title: 'Opportunité de projet',
    description: 'Le sujet a le choix entre diriger un projet technique complexe avec une équipe junior ou rejoindre un projet établi en tant qu\'expert technique. Quelle option préférerait-il?',
    options: [
      'Diriger le projet complexe avec l\'équipe junior',
      'Rejoindre le projet établi en tant qu\'expert',
      'Proposer une solution alternative',
      'Refuser les deux options'
    ],
    correctOption: 0,
    feedback: {
      correct: 'Correct! Le profil du sujet montre une forte aspiration vers le leadership technique combiné à l\'attrait pour les défis complexes.',
      incorrect: 'Le profil du sujet révèle une préférence pour le leadership et les défis, ce qui le pousserait à choisir de diriger le projet complexe.'
    }
  },
  {
    title: 'Évolution technologique',
    description: 'Une nouvelle technologie émerge dans le domaine du sujet. Quelle serait sa réaction la plus probable?',
    options: [
      'Attendre que la technologie fasse ses preuves avant de l\'explorer',
      'L\'adopter immédiatement dans tous ses projets',
      'Mener un projet pilote pour évaluer son potentiel',
      'Ignorer cette technologie si elle ne s\'aligne pas avec sa spécialisation actuelle'
    ],
    correctOption: 2,
    feedback: {
      correct: 'Exact! Le profil du sujet indique un équilibre entre innovation et pragmatisme, favorisant une approche d\'évaluation contrôlée.',
      incorrect: 'Le profil du sujet suggère qu\'il serait enthousiaste face à l\'innovation mais conserverait une approche méthodique via un projet pilote.'
    }
  },
  {
    title: 'Culture d\'entreprise',
    description: 'Parmi ces environnements professionnels, lequel correspondrait le mieux aux aspirations du sujet?',
    options: [
      'Une grande entreprise stable avec des processus bien établis',
      'Une startup innovante travaillant sur des technologies de rupture',
      'Une entreprise de taille moyenne axée sur l\'excellence technique',
      'Une organisation à but non lucratif avec une mission sociale forte'
    ],
    correctOption: 2,
    feedback: {
      correct: 'Correct! Le profil environnemental idéal du sujet met l\'accent sur l\'excellence technique combinée à des pratiques structurées.',
      incorrect: 'L\'environnement idéal du sujet privilégie la qualité technique et les processus structurés sans les contraintes d\'une grande organisation.'
    }
  }
];
currentScenarioIndex: number = 0;
selectedScenarioOption: number | null = null;
scenarioAnswered: boolean = false;
scenarioScores: boolean[] = [];

// Données pour le quiz de compatibilité
compatibilityItems: CompatibilityItem[] = [
  {
    title: 'Travail en autonomie',
    description: 'Capacité à travailler de manière indépendante avec peu de supervision',
    icon: 'bi-person-check',
    correctRating: 8
  },
  {
    title: 'Environnement collaboratif',
    description: 'Préférence pour le travail en équipe et la collaboration pluridisciplinaire',
    icon: 'bi-people',
    correctRating: 9
  },
  {
    title: 'Innovation continue',
    description: 'Capacité à s\'adapter rapidement aux changements et à l\'évolution technologique',
    icon: 'bi-lightning',
    correctRating: 9
  },
  {
    title: 'Stabilité et prévisibilité',
    description: 'Préférence pour un environnement de travail structuré et des processus établis',
    icon: 'bi-building',
    correctRating: 6
  },
  {
    title: 'Challenges techniques',
    description: 'Affinité pour les problèmes complexes et les défis techniques',
    icon: 'bi-puzzle',
    correctRating: 10
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