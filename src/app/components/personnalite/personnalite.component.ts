import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { UserDataService } from '../../services/user-data.service';

interface Scenario {
  id: string;
  title: string;
  description: string;
  responses: Response[];
}

interface Response {
  id: string;
  text: string;
  outcome: string;
  insightRevealed: string[];
}

interface TabInfo {
  id: string;
  name: string;
  icon: string;
}

interface PersonalityTrait {
  id: string;
  name: string;
  icon: string;
  description: string;
  manifestations: string[];
  workImpact: string;
  discovered: boolean;
}

interface CollaborationAspect {
  name: string;
  icon: string;
  description: string;
  discovered: boolean;
}

interface WorkProcess {
  name: string;
  icon: string;
  description: string;
  discovered: boolean;
}

interface MotivationFactor {
  name: string;
  icon: string;
  description: string;
  discovered: boolean;
}

interface CoreValue {
  name: string;
  importance: number; // 1-10
  discovered: boolean;
}

interface WorkPreference {
  text: string;
  preferred: boolean;
  discovered: boolean;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

@Component({
  selector: 'app-personnalite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personnalite.component.html',
  styleUrls: ['./personnalite.component.css']
})
export class PersonnaliteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Identifiant du module
  private readonly MODULE_ID = 'personnalite';
  
  // Texte du dialogue d'introduction
  private fullText: string = "Agent, votre mission aujourd'hui est de découvrir mon profil psychologique. En explorant les différentes situations et indices, vous révélerez progressivement mes traits de personnalité, mon style de travail et mes motivations principales. Cette analyse est essentielle pour comprendre ma compatibilité avec votre équipe.";
  
  // Subscriptions pour gestion de la mémoire
  private subscriptions: Subscription[] = [];
  
  // État du dialogue
  isDialogOpen: boolean = false;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // État de progression du module
  moduleAvailable: boolean = true;
  moduleCompleted: boolean = false;

  // État du quiz modal
  showQuizModal: boolean = false;
  quizStarted: boolean = false;
  currentQuizQuestion: number = 0;
  selectedAnswer: number | null = null;
  quizScore: number = 0;
  quizPassed: boolean = false;

  // Onglets du dossier
  activeTab: string = 'investigation';
  profileTabs: TabInfo[] = [
    { id: 'investigation', name: 'Investigation', icon: 'bi-search' },
    { id: 'profile', name: 'Profil', icon: 'bi-person-badge' },
    { id: 'style', name: 'Style de travail', icon: 'bi-briefcase' },
    { id: 'values', name: 'Motivations', icon: 'bi-stars' }
  ];

  // État de l'investigation
  investigationProgress: number = 0;
  maxInvestigationProgress: number = 100;
  insightsDiscovered: number = 0;
  totalInsights: number = 20;
  currentScenarioIndex: number = 0;
  selectedResponse: number | null = null;
  
  // Scores des traits - à révéler progressivement
  traitScores = {
    extroversion: 7,
    agreeableness: 8,
    conscientiousness: 9,
    openness: 8
  };
  
  // Visibilité des traits
  traitVisibility = {
    extroversion: false,
    agreeableness: false,
    conscientiousness: false,
    openness: false
  };
  
  maxTraitScore: number = 10;

  // Scenarios d'investigation
  scenarios: Scenario[] = [
    {
      id: 'scenario1',
      title: 'Réunion de projet',
      description: 'Vous observez le sujet lors d\'une réunion où une idée qu\'il avait partagée en privé est présentée par un collègue sans le mentionner. Comment le sujet réagit-il?',
      responses: [
        {
          id: 'r1a',
          text: 'Observer sa réaction immédiate',
          outcome: 'Le sujet ne semble pas perturbé et continue à prendre des notes. Il hoche occasionnellement la tête en signe d\'approbation.',
          insightRevealed: ['agreeableness']
        },
        {
          id: 'r1b',
          text: 'Surveiller ses interactions après la réunion',
          outcome: 'Après la réunion, le sujet discute calmement avec le collègue. Leur conversation semble cordiale mais sérieuse, et se termine par une poignée de main.',
          insightRevealed: ['collaboration1']
        },
        {
          id: 'r1c',
          text: 'Examiner ses communications écrites suite à l\'incident',
          outcome: 'Le sujet envoie un email à l\'équipe avec des informations complémentaires sur l\'idée, mentionnant subtilement son implication initiale dans sa conception, tout en soulignant la valeur des contributions de tous.',
          insightRevealed: ['communication', 'value1']
        }
      ]
    },
    {
      id: 'scenario2',
      title: 'Gestion de crise technique',
      description: 'Un problème majeur survient sur un projet critique avec un délai imminent. Comment le sujet gère-t-il cette situation de crise?',
      responses: [
        {
          id: 'r2a',
          text: 'Observer son processus de résolution de problème',
          outcome: 'Le sujet commence par évaluer méthodiquement la situation, identifiant les causes potentielles. Il documente chaque étape de son analyse et teste systématiquement différentes hypothèses.',
          insightRevealed: ['conscientiousness', 'process1']
        },
        {
          id: 'r2b',
          text: 'Analyser sa communication avec l\'équipe pendant la crise',
          outcome: 'Le sujet reste calme et fournit des mises à jour claires et régulières à l\'équipe. Il communique de manière factuelle sans rejeter la faute sur qui que ce soit, tout en encourageant les contributions.',
          insightRevealed: ['extroversion', 'communication']
        },
        {
          id: 'r2c',
          text: 'Évaluer ses décisions sous pression',
          outcome: 'Face à des options limitées, le sujet prend une décision réfléchie mais rapide. Il propose une solution innovante qui n\'avait pas été envisagée initialement, permettant de respecter le délai tout en maintenant la qualité.',
          insightRevealed: ['openness', 'value2']
        }
      ]
    },
    {
      id: 'scenario3',
      title: 'Projet d\'innovation',
      description: 'Le sujet participe à un atelier d\'innovation où des idées radicales sont proposées pour transformer un produit existant. Comment réagit-il face à ces nouvelles perspectives?',
      responses: [
        {
          id: 'r3a',
          text: 'Observer sa participation aux discussions créatives',
          outcome: 'Le sujet écoute attentivement chaque proposition avant d\'intervenir. Il pose des questions pertinentes pour approfondir les idées des autres avant de suggérer ses propres améliorations, souvent en combinant différents concepts.',
          insightRevealed: ['openness', 'collaboration2']
        },
        {
          id: 'r3b',
          text: 'Examiner ses propositions et contributions',
          outcome: 'Ses suggestions montrent un équilibre entre créativité et pragmatisme. Il propose des idées novatrices mais s\'assure toujours qu\'elles restent réalisables techniquement et alignées avec les objectifs du projet.',
          insightRevealed: ['conscientiousness', 'motivation1']
        },
        {
          id: 'r3c',
          text: 'Analyser son suivi post-atelier',
          outcome: 'Après l\'atelier, le sujet prend l\'initiative de formaliser les idées retenues dans un document structuré avec des étapes concrètes de mise en œuvre et une analyse des risques potentiels.',
          insightRevealed: ['process2', 'motivation2']
        }
      ]
    },
    {
      id: 'scenario4',
      title: 'Feedback critique',
      description: 'Un client important exprime des critiques sévères sur un livrable récent. Comment le sujet traite-t-il ce feedback négatif?',
      responses: [
        {
          id: 'r4a',
          text: 'Observer sa réaction initiale au feedback',
          outcome: 'Le sujet écoute les critiques sans interruption ni défensive. Il prend des notes détaillées et remercie sincèrement le client pour sa franchise.',
          insightRevealed: ['agreeableness', 'value3']
        },
        {
          id: 'r4b',
          text: 'Analyser son plan d\'action suite au feedback',
          outcome: 'Il élabore rapidement un plan de remédiation structuré avec des délais précis, priorisant les points les plus critiques. Il propose également des check-points réguliers pour s\'assurer que les corrections répondent aux attentes.',
          insightRevealed: ['conscientiousness', 'process3']
        },
        {
          id: 'r4c',
          text: 'Examiner comment il communique ce feedback à l\'équipe',
          outcome: 'Lors de la réunion d\'équipe, il présente le feedback de manière constructive, sans pointer du doigt les responsables. Il transforme les critiques en opportunités d\'amélioration et implique toute l\'équipe dans la solution.',
          insightRevealed: ['collaboration3', 'extroversion']
        }
      ]
    },
    {
      id: 'scenario5',
      title: 'Opportunité de formation',
      description: 'Le sujet a l\'opportunité de participer à une formation avancée qui nécessiterait un investissement personnel significatif en dehors des heures de travail. Comment réagit-il?',
      responses: [
        {
          id: 'r5a',
          text: 'Examiner son processus de décision',
          outcome: 'Il évalue méticuleusement le contenu de la formation, recherchant les avis d\'anciens participants et analysant comment ces nouvelles compétences pourraient s\'appliquer concrètement à ses projets actuels et futurs.',
          insightRevealed: ['openness', 'motivation3']
        },
        {
          id: 'r5b',
          text: 'Observer son organisation personnelle pour intégrer cette formation',
          outcome: 'Il réorganise proactivement son emploi du temps, créant un plan d\'étude structuré qui équilibre ses responsabilités professionnelles, ses engagements personnels et les exigences de la formation.',
          insightRevealed: ['conscientiousness', 'preference1']
        },
        {
          id: 'r5c',
          text: 'Analyser comment il partage ses nouvelles connaissances',
          outcome: 'Après la formation, il prend l\'initiative d\'organiser un atelier interne pour partager les connaissances acquises avec ses collègues, adaptant le contenu aux besoins spécifiques de l\'équipe.',
          insightRevealed: ['extroversion', 'value4']
        }
      ]
    }
  ];

  // Questions du quiz final
  quizQuestions: QuizQuestion[] = [
    {
      question: "Quel est mon niveau de Conscienciosité (Rigueur) selon le profil psychologique ?",
      options: ["5/10", "7/10", "9/10", "6/10"],
      correctAnswer: 2
    },
    {
      question: "Comment est-ce que je réagis face à un feedback critique ?",
      options: [
        "Je défends vigoureusement mon travail et conteste les critiques",
        "J'accepte passivement toutes les critiques sans discussion",
        "J'écoute attentivement, remercie pour la franchise et élabore un plan d'action",
        "J'ignore généralement les critiques que je trouve injustifiées"
      ],
      correctAnswer: 2
    },
    {
      question: "Quelle est ma principale force en situation de crise ?",
      options: [
        "Improvisation créative",
        "Analyse méthodique et communication claire",
        "Délégation efficace des tâches",
        "Capacité à travailler sans interruption pendant de longues périodes"
      ],
      correctAnswer: 1
    },
    {
      question: "Quelle valeur professionnelle est particulièrement importante pour moi ?",
      options: [
        "Compétition et reconnaissance individuelle",
        "Stabilité et prévisibilité",
        "Équilibre entre créativité et pragmatisme",
        "Autonomie complète dans le travail"
      ],
      correctAnswer: 2
    },
    {
      question: "Comment est-ce que j'aborde les nouvelles idées dans un projet ?",
      options: [
        "Je préfère m'en tenir aux méthodes éprouvées",
        "J'adopte toutes les nouveautés sans analyse critique",
        "J'écoute attentivement puis je pose des questions pertinentes pour approfondir",
        "Je m'intéresse uniquement aux idées venant de sources reconnues"
      ],
      correctAnswer: 2
    }
  ];

  // Données de personnalité
  personalityTraits: PersonalityTrait[] = [
    {
      id: 'extroversion',
      name: 'Extraversion',
      icon: 'bi-people-fill',
      description: 'Niveau modérément élevé d\'aisance sociale et d\'énergie dans les interactions professionnelles. Communique efficacement et avec assurance, tout en sachant écouter.',
      manifestations: [
        'Communication claire et directe, mais sans dominer les échanges',
        'Facilité à établir des relations professionnelles de confiance',
        'Présentation assurée d\'idées et concepts en réunion',
        'Équilibre entre prise de parole et écoute active'
      ],
      workImpact: 'Capacité à collaborer efficacement tout en maintenant une autonomie productive. Favorise un environnement d\'équipe positif où les idées peuvent être librement partagées et discutées.',
      discovered: false
    },
    {
      id: 'agreeableness',
      name: 'Coopération',
      icon: 'bi-hand-thumbs-up',
      description: 'Niveau élevé de coopération, valorisant l\'harmonie d\'équipe et les approches collaboratives. Montre une forte capacité d\'empathie tout en restant objectif.',
      manifestations: [
        'Recherche active de solutions mutuellement bénéfiques lors de désaccords',
        'Écoute attentive des différentes perspectives avant de formuler des conclusions',
        'Soutien aux collègues tout en maintenant des attentes élevées',
        'Communication constructive même lors de discussions difficiles'
      ],
      workImpact: 'Contribue à un environnement de travail respectueux et productif où les conflits sont résolus constructivement. Favorise la cohésion d\'équipe sans sacrifier l\'exigence de qualité.',
      discovered: false
    },
    {
      id: 'conscientiousness',
      name: 'Rigueur',
      icon: 'bi-check2-square',
      description: 'Niveau très élevé d\'organisation, de fiabilité et d\'attention aux détails. Approche méthodique et structurée du travail, avec un fort engagement envers la qualité.',
      manifestations: [
        'Planification méticuleuse des projets avec anticipation des risques',
        'Documentation systématique des processus et décisions',
        'Respect scrupuleux des délais et engagements',
        'Vérification approfondie avant validation finale'
      ],
      workImpact: 'Garantit une exécution fiable et de haute qualité des projets complexes. Instaure des standards élevés tout en maintenant une progression constante vers les objectifs définis.',
      discovered: false
    },
    {
      id: 'openness',
      name: 'Ouverture',
      icon: 'bi-lightbulb',
      description: 'Niveau élevé d\'ouverture aux nouvelles idées et approches, combinant curiosité intellectuelle et pragmatisme. Intérêt marqué pour l\'innovation applicable.',
      manifestations: [
        'Recherche proactive de nouvelles méthodes et technologies pertinentes',
        'Évaluation équilibrée des innovations, considérant à la fois le potentiel et la faisabilité',
        'Apprentissage continu et auto-dirigé dans des domaines variés',
        'Capacité à reconceptualiser les problèmes pour trouver des solutions originales'
      ],
      workImpact: 'Apporte une perspective à la fois innovante et réaliste aux défis professionnels. Contribue à l\'évolution des pratiques tout en assurant leur applicabilité concrète.',
      discovered: false
    }
  ];

  // Aspects de collaboration
  collaborationAspects: CollaborationAspect[] = [
    {
      name: 'Résolution de conflits',
      icon: 'bi-shield-check',
      description: 'Approche la résolution de conflits avec diplomatie et objectivité, cherchant à comprendre les perspectives sous-jacentes avant de proposer des solutions. Maintient le focus sur les intérêts communs plutôt que sur les positions individuelles.',
      discovered: false
    },
    {
      name: 'Prise de décision collective',
      icon: 'bi-people',
      description: 'Favorise un processus décisionnel inclusif qui valorise les contributions diverses tout en maintenant l\'efficacité. Sait équilibrer la consultation et la progression vers une conclusion.',
      discovered: false
    },
    {
      name: 'Partage d\'expertise',
      icon: 'bi-share',
      description: 'Partage proactivement ses connaissances avec l\'équipe à travers des présentations claires et une documentation accessible. Reconnaît ouvertement les contributions et l\'expertise des autres.',
      discovered: false
    }
  ];

  // Processus de travail
  workProcesses: WorkProcess[] = [
    {
      name: 'Analyse de problème',
      icon: 'bi-search',
      description: 'Approche méthodique et approfondie de l\'analyse des problèmes, incluant la collecte systématique de données, l\'identification des causes racines et la consultation des parties prenantes pertinentes.',
      discovered: false
    },
    {
      name: 'Planification',
      icon: 'bi-calendar-check',
      description: 'Développement de plans structurés avec des jalons clairs, des contingences pour les risques identifiés et une allocation réaliste des ressources. Révise régulièrement pour s\'adapter aux nouvelles informations.',
      discovered: false
    },
    {
      name: 'Exécution et suivi',
      icon: 'bi-graph-up',
      description: 'Mise en œuvre disciplinée avec suivi régulier des progrès par rapport aux objectifs. Maintient une documentation claire et communique proactivement sur l\'avancement et les ajustements nécessaires.',
      discovered: false
    }
  ];

  // Facteurs de motivation
  motivationFactors: MotivationFactor[] = [
    {
      name: 'Développement et maîtrise',
      icon: 'bi-arrow-up-circle',
      description: 'Fortement motivé par l\'acquisition de nouvelles compétences et l\'amélioration continue de son expertise. Recherche des défis qui permettent d\'approfondir sa compréhension et d\'élargir ses capacités.',
      discovered: false
    },
    {
      name: 'Impact et utilité',
      icon: 'bi-lightning',
      description: 'Valorise particulièrement les projets ayant un impact concret et mesurable. Trouve sa motivation dans la création de solutions qui répondent efficacement à des besoins réels et apportent une valeur tangible.',
      discovered: false
    },
    {
      name: 'Excellence et qualité',
      icon: 'bi-trophy',
      description: 'Aspire à atteindre et maintenir des standards élevés dans tous ses travaux. Tire une satisfaction intrinsèque de la production d\'un travail bien fait, robuste et élégant dans sa conception.',
      discovered: false
    }
  ];

  // Valeurs professionnelles
  coreValues: CoreValue[] = [
    { name: 'Intégrité', importance: 10, discovered: false },
    { name: 'Excellence', importance: 9, discovered: false },
    { name: 'Collaboration', importance: 8, discovered: false },
    { name: 'Innovation pragmatique', importance: 8, discovered: false }
  ];

  // Préférences professionnelles
  workPreferences: WorkPreference[] = [
    { text: 'Environnement permettant un équilibre entre structure et flexibilité', preferred: true, discovered: false },
    { text: 'Projets présentant des défis intellectuels stimulants', preferred: true, discovered: false },
    { text: 'Culture valorisant à la fois la performance individuelle et la réussite collective', preferred: true, discovered: false },
    { text: 'Opportunités régulières d\'apprentissage et de développement', preferred: true, discovered: false }
  ];

  constructor(
    private progressService: ProgressService,
    private userDataService: UserDataService,
    public dialogService: DialogService,
    public noteService: NoteService,
  ) {}

  ngOnInit(): void {
    // Charger les progrès précédents
    this.loadUserProgress();

    // Souscrire au dialogue
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
  }

  ngAfterViewInit(): void {
    // Afficher le dialogue d'introduction
    setTimeout(() => {
      this.showIntroDialog();
    }, 500);
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Charger les progrès précédents
  loadUserProgress(): void {
    // Vérifier les découvertes précédentes
    const progressResponse = this.userDataService.getResponse(this.MODULE_ID, 'investigation_progress');
    if (progressResponse) {
      this.investigationProgress = progressResponse.response as number;
      
      // Si progression à 100%, marquer comme complété
      if (this.investigationProgress >= this.maxInvestigationProgress) {
        this.revealAllTraits();
      }
    }

    // Charger les traits découverts
    this.loadDiscoveredTraits();
  }

  // Charger les traits découverts
  loadDiscoveredTraits(): void {
    // Traits de personnalité
    this.personalityTraits.forEach(trait => {
      const traitResponse = this.userDataService.getResponse(this.MODULE_ID, `trait_${trait.id}`);
      if (traitResponse) {
        trait.discovered = traitResponse.response as boolean;
        this.traitVisibility[trait.id as keyof typeof this.traitVisibility] = trait.discovered;
      }
    });

    // Aspects de collaboration
    this.collaborationAspects.forEach((aspect, index) => {
      const aspectResponse = this.userDataService.getResponse(this.MODULE_ID, `collaboration_${index}`);
      if (aspectResponse) {
        aspect.discovered = aspectResponse.response as boolean;
      }
    });

    // Processus de travail
    this.workProcesses.forEach((process, index) => {
      const processResponse = this.userDataService.getResponse(this.MODULE_ID, `process_${index}`);
      if (processResponse) {
        process.discovered = processResponse.response as boolean;
      }
    });

    // Facteurs de motivation
    this.motivationFactors.forEach((factor, index) => {
      const factorResponse = this.userDataService.getResponse(this.MODULE_ID, `motivation_${index}`);
      if (factorResponse) {
        factor.discovered = factorResponse.response as boolean;
      }
    });

    // Valeurs
    this.coreValues.forEach((value, index) => {
      const valueResponse = this.userDataService.getResponse(this.MODULE_ID, `value_${index}`);
      if (valueResponse) {
        value.discovered = valueResponse.response as boolean;
      }
    });

    // Préférences
    this.workPreferences.forEach((pref, index) => {
      const prefResponse = this.userDataService.getResponse(this.MODULE_ID, `preference_${index}`);
      if (prefResponse) {
        pref.discovered = prefResponse.response as boolean;
      }
    });

    // Recalculer le nombre d'insights découverts
    this.updateInsightsDiscovered();
  }

  // Mettre à jour le nombre d'insights découverts
  updateInsightsDiscovered(): void {
    let count = 0;
    
    // Compter tous les éléments découverts
    this.personalityTraits.forEach(trait => {
      if (trait.discovered) count++;
    });
    
    this.collaborationAspects.forEach(aspect => {
      if (aspect.discovered) count++;
    });
    
    this.workProcesses.forEach(process => {
      if (process.discovered) count++;
    });
    
    this.motivationFactors.forEach(factor => {
      if (factor.discovered) count++;
    });
    
    this.coreValues.forEach(value => {
      if (value.discovered) count++;
    });
    
    this.workPreferences.forEach(pref => {
      if (pref.discovered) count++;
    });
    
    this.insightsDiscovered = count;
    
    // Mettre à jour la progression globale
    this.investigationProgress = Math.min(
      Math.round((this.insightsDiscovered / this.totalInsights) * 100),
      this.maxInvestigationProgress
    );
    
    // Sauvegarder la progression
    this.userDataService.saveResponse(
      this.MODULE_ID,
      'investigation_progress',
      this.investigationProgress
    );
    
    // Si progression à 100%, marquer comme complété
    if (this.investigationProgress >= this.maxInvestigationProgress) {
      this.revealAllTraits();
    }
  }

  // Révéler tous les traits
  revealAllTraits(): void {
    this.personalityTraits.forEach(trait => {
      trait.discovered = true;
      this.traitVisibility[trait.id as keyof typeof this.traitVisibility] = true;
      
      this.userDataService.saveResponse(
        this.MODULE_ID,
        `trait_${trait.id}`,
        true
      );
    });
    
    this.collaborationAspects.forEach((aspect, index) => {
      aspect.discovered = true;
      this.userDataService.saveResponse(
        this.MODULE_ID,
        `collaboration_${index}`,
        true
      );
    });
    
    this.workProcesses.forEach((process, index) => {
      process.discovered = true;
      this.userDataService.saveResponse(
        this.MODULE_ID,
        `process_${index}`,
        true
      );
    });
    
    this.motivationFactors.forEach((factor, index) => {
      factor.discovered = true;
      this.userDataService.saveResponse(
        this.MODULE_ID,
        `motivation_${index}`,
        true
      );
    });
    
    this.coreValues.forEach((value, index) => {
      value.discovered = true;
      this.userDataService.saveResponse(
        this.MODULE_ID,
        `value_${index}`,
        true
      );
    });
    
    this.workPreferences.forEach((pref, index) => {
      pref.discovered = true;
      this.userDataService.saveResponse(
        this.MODULE_ID,
        `preference_${index}`,
        true
      );
    });
    
    this.updateInsightsDiscovered();
  }

  // Afficher le dialogue d'introduction
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

  // Changement d'onglet
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  // Accéder au scénario actuel
  get currentScenario(): Scenario | null {
    if (this.currentScenarioIndex < 0 || this.currentScenarioIndex >= this.scenarios.length) {
      return null;
    }
    return this.scenarios[this.currentScenarioIndex];
  }

  // Lettre pour l'option de réponse
  getResponseLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  // Sélectionner une réponse
  selectResponse(index: number): void {
    this.selectedResponse = index;
  }

  // Explorer une réponse (révéler l'outcome)
  exploreResponse(): void {
    if (this.selectedResponse === null || !this.currentScenario) return;
    
    const response = this.currentScenario.responses[this.selectedResponse];
    
    // Révéler les insights associés à cette réponse
    this.revealInsights(response.insightRevealed);
    
    // Afficher l'outcome dans un dialogue
    const dialogMessage: DialogMessage = {
      text: response.outcome,
      character: 'detective'
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(response.outcome);
    
    // Marquer cette réponse comme explorée dans les données utilisateur
    this.userDataService.saveResponse(
      this.MODULE_ID,
      `explored_${this.currentScenario.id}_${response.id}`,
      true
    );
  }

  // Continuer au scénario suivant
  nextScenario(): void {
    if (this.currentScenarioIndex < this.scenarios.length - 1) {
      this.currentScenarioIndex++;
      this.selectedResponse = null;
      
      // Sauvegarder la progression
      this.userDataService.saveResponse(
        this.MODULE_ID,
        'current_scenario',
        this.currentScenarioIndex
      );
    } else {
      // Tous les scénarios ont été explorés
      if (this.investigationProgress >= 70) {
        this.showCompleteInvestigationMessage();
      }
    }
  }

  // Revenir au scénario précédent
  previousScenario(): void {
    if (this.currentScenarioIndex > 0) {
      this.currentScenarioIndex--;
      this.selectedResponse = null;
      
      // Sauvegarder la progression
      this.userDataService.saveResponse(
        this.MODULE_ID,
        'current_scenario',
        this.currentScenarioIndex
      );
    }
  }

  // Révéler des insights basés sur les ID
  revealInsights(insightIds: string[]): void {
    if (!insightIds || insightIds.length === 0) return;
    
    insightIds.forEach(id => {
      // Traits de personnalité
      if (id === 'extroversion' || id === 'agreeableness' || id === 'conscientiousness' || id === 'openness') {
        const trait = this.personalityTraits.find(t => t.id === id);
        if (trait) {
          trait.discovered = true;
          this.traitVisibility[id as keyof typeof this.traitVisibility] = true;
          this.userDataService.saveResponse(this.MODULE_ID, `trait_${id}`, true);
        }
      }
      // Aspects de collaboration
      else if (id.startsWith('collaboration')) {
        const index = parseInt(id.replace('collaboration', '')) - 1;
        if (index >= 0 && index < this.collaborationAspects.length) {
          this.collaborationAspects[index].discovered = true;
          this.userDataService.saveResponse(this.MODULE_ID, `collaboration_${index}`, true);
        }
      }
      // Processus de travail
      else if (id.startsWith('process')) {
        const index = parseInt(id.replace('process', '')) - 1;
        if (index >= 0 && index < this.workProcesses.length) {
          this.workProcesses[index].discovered = true;
          this.userDataService.saveResponse(this.MODULE_ID, `process_${index}`, true);
        }
      }
      // Facteurs de motivation
      else if (id.startsWith('motivation')) {
        const index = parseInt(id.replace('motivation', '')) - 1;
        if (index >= 0 && index < this.motivationFactors.length) {
          this.motivationFactors[index].discovered = true;
          this.userDataService.saveResponse(this.MODULE_ID, `motivation_${index}`, true);
        }
      }
      // Valeurs
      else if (id.startsWith('value')) {
        const index = parseInt(id.replace('value', '')) - 1;
        if (index >= 0 && index < this.coreValues.length) {
          this.coreValues[index].discovered = true;
          this.userDataService.saveResponse(this.MODULE_ID, `value_${index}`, true);
        }
      }
      // Préférences
      else if (id.startsWith('preference')) {
        const index = parseInt(id.replace('preference', '')) - 1;
        if (index >= 0 && index < this.workPreferences.length) {
          this.workPreferences[index].discovered = true;
          this.userDataService.saveResponse(this.MODULE_ID, `preference_${index}`, true);
        }
      }
      // Élément de communication
      else if (id === 'communication') {
        // La communication est un aspect transversal, pourrait affecter plusieurs catégories
        // Par exemple, révéler un aspect spécifique de collaboration lié à la communication
        if (!this.collaborationAspects[3]?.discovered) {
          if (this.collaborationAspects.length > 3) {
            this.collaborationAspects[3].discovered = true;
            this.userDataService.saveResponse(this.MODULE_ID, `collaboration_3`, true);
          }
        }
      }
    });
    
    // Mettre à jour le nombre d'insights découverts
    this.updateInsightsDiscovered();
  }

  // Afficher un message lorsque l'investigation est suffisamment avancée
  showCompleteInvestigationMessage(): void {
    const message = "Vous avez exploré suffisamment de scénarios pour dresser un profil psychologique complet. Vous pouvez maintenant consulter les différentes sections du dossier pour analyser en détail la personnalité du sujet.";
    
    const dialogMessage: DialogMessage = {
      text: message,
      character: 'detective'
    };
    
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(message);
    
    // Offrir la possibilité de passer le quiz final
    setTimeout(() => {
      this.enableFinalQuiz();
    }, 5000);
  }

  // Activer le quiz final
  enableFinalQuiz(): void {
    this.userDataService.saveResponse(
      this.MODULE_ID,
      'quiz_available',
      true
    );
  }

  // Démarrer le quiz final
  startQuiz(): void {
    this.showQuizModal = true;
    this.quizStarted = true;
    this.currentQuizQuestion = 0;
    this.selectedAnswer = null;
    this.quizScore = 0;
  }

  // Sélectionner une réponse au quiz
  selectQuizAnswer(index: number): void {
    this.selectedAnswer = index;
  }

  // Valider la réponse au quiz et passer à la question suivante
  submitQuizAnswer(): void {
    if (this.selectedAnswer === null) return;
    
    // Vérifier si la réponse est correcte
    if (this.selectedAnswer === this.quizQuestions[this.currentQuizQuestion].correctAnswer) {
      this.quizScore++;
    }
    
    // Passer à la question suivante ou terminer le quiz
    if (this.currentQuizQuestion < this.quizQuestions.length - 1) {
      this.currentQuizQuestion++;
      this.selectedAnswer = null;
    } else {
      this.completeQuiz();
    }
  }

  // Terminer le quiz et afficher les résultats
  completeQuiz(): void {
    const passScore = Math.ceil(this.quizQuestions.length * 0.7); // 70% pour réussir
    this.quizPassed = this.quizScore >= passScore;
    
    if (this.quizPassed) {
      // Marquer le module comme complété
      this.moduleCompleted = true;
      this.progressService.completeModule(this.MODULE_ID);
      
      // Révéler tous les traits si pas déjà fait
      if (this.investigationProgress < 100) {
        this.revealAllTraits();
      }
    }
    
    // Sauvegarder le résultat du quiz
    this.userDataService.saveResponse(
      this.MODULE_ID,
      'quiz_passed',
      this.quizPassed
    );
    
    this.userDataService.saveResponse(
      this.MODULE_ID,
      'quiz_score',
      this.quizScore
    );
  }

  // Fermer le modal du quiz
  closeQuizModal(): void {
    this.showQuizModal = false;
    
    // Si le quiz a été réussi, afficher un message de félicitations
    if (this.quizPassed) {
      const message = "Félicitations ! Vous avez correctement analysé mon profil psychologique. Vous avez maintenant accès à l'ensemble des données et pouvez passer au module suivant.";
      
      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective'
      };
      
      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);
    }
  }

  // Obtenir les traits sous forme de tableau pour l'affichage
  getTraitsArray(): { id: string, name: string, score: number }[] {
    return [
      { id: 'extroversion', name: 'Extraversion', score: this.traitScores.extroversion },
      { id: 'agreeableness', name: 'Coopération', score: this.traitScores.agreeableness },
      { id: 'conscientiousness', name: 'Rigueur', score: this.traitScores.conscientiousness },
      { id: 'openness', name: 'Ouverture', score: this.traitScores.openness }
    ];
  }

  // Obtenir l'icône d'un trait
  getTraitIcon(traitId: string): string {
    const trait = this.personalityTraits.find(t => t.id === traitId);
    return trait ? trait.icon : 'bi-question';
  }

  // Obtenir la couleur d'un trait
  getTraitColor(traitId: string): string {
    switch (traitId) {
      case 'extroversion': return '#4c6ef5';
      case 'agreeableness': return '#37b24d';
      case 'conscientiousness': return '#f59f00';
      case 'openness': return '#ae3ec9';
      default: return '#aaaaaa';
    }
  }

  // Obtenir la description d'un trait
  getTraitDescription(traitId: string): string {
    const trait = this.personalityTraits.find(t => t.id === traitId);
    return trait ? trait.description : '';
  }

  // Obtenir le score d'un trait
  getTraitScore(traitId: string): number {
    return this.traitScores[traitId as keyof typeof this.traitScores] || 0;
  }

  // Obtenir les traits dominants
  getDominantTraits(count: number = 2): { id: string, name: string, score: number }[] {
    return this.getTraitsArray()
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  // Vérifier si un trait a été découvert
  isTraitDiscovered(traitId: string): boolean {
    return this.traitVisibility[traitId as keyof typeof this.traitVisibility] || false;
  }

  // Vérifier si le profil est assez complet pour afficher un résumé
  canShowSummary(): boolean {
    return this.investigationProgress >= 50;
  }

  // Date actuelle formatée
  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Résumé de personnalité
  getPersonalitySummary(): string {
    if (!this.canShowSummary()) {
      return "Analyse en cours... Poursuivez l'investigation pour obtenir un profil complet.";
    }
    
    // Génération dynamique en fonction des traits dominants
    const dominantTraits = this.getDominantTraits(2);
    const dominantTraitIds = dominantTraits.map(t => t.id);
    
    if (dominantTraitIds.includes('conscientiousness') && dominantTraitIds.includes('openness')) {
      return "Le profil présente un équilibre remarquable entre rigueur analytique et ouverture à l'innovation. Caractérisé par une approche méthodique du travail combinée à une curiosité intellectuelle prononcée, le sujet démontre une capacité à naviguer efficacement entre structure et créativité. Sa communication directe mais attentive facilite les interactions professionnelles, tandis que son orientation vers les résultats assure une exécution fiable des projets. Particulièrement adapté aux environnements techniques évolutifs nécessitant à la fois expertise approfondie et adaptabilité.";
    } else if (dominantTraitIds.includes('conscientiousness') && dominantTraitIds.includes('agreeableness')) {
      return "Le profil révèle une combinaison distinctive de rigueur méthodologique et de coopération. Le sujet démontre un haut niveau d'organisation et de fiabilité, tout en maintenant d'excellentes capacités collaboratives. Cette dualité lui permet d'établir des processus structurés qui intègrent harmonieusement les contributions de l'équipe. Son approche consciencieuse des responsabilités, associée à une communication empathique et claire, en fait un élément stabilisateur et productif dans les environnements professionnels.";
    } else {
      // Profil par défaut ou autres combinaisons
      return "Le profil révèle un individu méthodique et rigoureux, avec une forte capacité d'adaptation et d'ouverture aux nouvelles idées. Sa communication équilibrée et son approche collaborative en font un atout précieux dans les environnements d'équipe. Particulièrement efficace dans la structuration et l'exécution de projets complexes, tout en restant réceptif à l'innovation et aux perspectives diverses.";
    }
  }

  // Style de communication
  getCommunicationStyle(): { directness: number, factual: number, conciseness: number } {
    // Calculé à partir des scores de traits
    const directness = 60 + (this.traitScores.extroversion - 5) * 5;
    const factual = 65 + (this.traitScores.conscientiousness - 5) * 5;
    const conciseness = 60 - (this.traitScores.openness - 5) * 3;
    
    return {
      directness: Math.min(Math.max(directness, 0), 100),
      factual: Math.min(Math.max(factual, 0), 100),
      conciseness: Math.min(Math.max(conciseness, 0), 100)
    };
  }

  // Résumé du style de communication
  getCommunicationSummary(): string {
    if (!this.canShowSummary()) {
      return "Données insuffisantes. Continuez l'investigation pour déverrouiller cette analyse.";
    }
    
    const style = this.getCommunicationStyle();
    let summary = "Communication ";
    
    // Directness
    if (style.directness > 65) {
      summary += "principalement directe et ";
    } else if (style.directness < 35) {
      summary += "généralement nuancée et ";
    } else {
      summary += "équilibrée entre franchise et tact, ";
    }
    
    // Factual vs Emotional
    if (style.factual > 65) {
      summary += "factuelle, ";
    } else if (style.factual < 35) {
      summary += "émotionnellement engagée, ";
    } else {
      summary += "combinant faits et contexte émotionnel, ";
    }
    
    // Conciseness
    if (style.conciseness > 65) {
      summary += "préférant des explications concises et précises. ";
    } else if (style.conciseness < 35) {
      summary += "incluant des explications détaillées lorsque nécessaire. ";
    } else {
      summary += "adaptant le niveau de détail au contexte. ";
    }
    
    summary += "Le sujet s'ajuste naturellement à son interlocuteur, privilégiant la clarté et la précision. Particulièrement efficace pour vulgariser des concepts techniques tout en maintenant un niveau de rigueur approprié.";
    
    return summary;
  }

  // Taille de police pour les valeurs (nuage de valeurs)
  getValueFontSize(importance: number): number {
    // Calcul d'une taille de police entre 14 et 24px en fonction de l'importance
    return 14 + (importance / 10) * 10;
  }
  
  // Ajouter une note
  addNote(content: string): void {
    this.noteService.addNote(content);
    this.noteService.toggleNotesVisibility();
  }

  // Progression de l'investigation
  getInvestigationProgress(): number {
    return this.investigationProgress;
  }

  // Pourcentage de traits découverts
  getTraitsDiscoveredPercentage(): number {
    const discovered = this.personalityTraits.filter(t => t.discovered).length;
    return Math.round((discovered / this.personalityTraits.length) * 100);
  }

  // Vérifier si le quiz final est disponible
  isQuizAvailable(): boolean {
    const quizAvailableResponse = this.userDataService.getResponse(this.MODULE_ID, 'quiz_available');
    return quizAvailableResponse ? (quizAvailableResponse.response as boolean) : false;
  }

  // Vérifier si le module est complété
  isModuleCompleted(): boolean {
    const quizPassedResponse = this.userDataService.getResponse(this.MODULE_ID, 'quiz_passed');
    return quizPassedResponse ? (quizPassedResponse.response as boolean) : false;
  }
  
  // Fonction pour continuer au module suivant
  continueToNextModule(): void {
    if (this.isModuleCompleted()) {
      // Vérifier que toutes les données sont bien sauvegardées
      this.userDataService.saveResponse(
        this.MODULE_ID,
        'module_completed',
        true
      );
      
      // Marquer officiellement le module comme complété dans le service de progression
      this.progressService.completeModule(this.MODULE_ID);
      
      // Envoyer un message de confirmation
      const message = "Module de profil psychologique complété. Vous pouvez maintenant passer au module suivant avec une compréhension approfondie de ma personnalité.";
      
      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective'
      };
      
      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);
      
      // Rediriger vers le prochain module après un court délai
      // Cette partie dépendra de votre implémentation de navigation
      setTimeout(() => {
        // Navigation au module suivant - à adapter selon votre système de routing
        // Par exemple : this.router.navigate(['/next-module']);
        
        // Fermeture du dialogue
        this.dialogService.closeDialog();
      }, 5000);
    } else {
      // Si le module n'est pas complété, informer l'utilisateur
      const message = "Vous devez d'abord compléter l'évaluation finale pour continuer.";
      
      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective'
      };
      
      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);
    }
  }
  getCollaborationDiscoveredCount(): number {
    let count = 0;
    for (const aspect of this.collaborationAspects) {
      if (aspect.discovered) {
        count++;
      }
    }
    return count;
  }
  
  // Obtenir le nombre de processus de travail découverts
  getProcessDiscoveredCount(): number {
    let count = 0;
    for (const process of this.workProcesses) {
      if (process.discovered) {
        count++;
      }
    }
    return count;
  }
  
  // Obtenir le nombre de facteurs de motivation découverts
  getMotivationDiscoveredCount(): number {
    let count = 0;
    for (const factor of this.motivationFactors) {
      if (factor.discovered) {
        count++;
      }
    }
    return count;
  }
  
  // Obtenir le score de passage pour le quiz (70%)
  getPassScore(): number {
    return Math.ceil(this.quizQuestions.length * 0.7);
  }
}