import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppStateService } from '../../services/app-state.service';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
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
  traits: {
    extroversion: number;
    agreeableness: number;
    conscientiousness: number;
    openness: number;
  };
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
}

interface CollaborationAspect {
  name: string;
  icon: string;
  description: string;
}

interface WorkProcess {
  name: string;
  icon: string;
  description: string;
}

interface MotivationFactor {
  name: string;
  icon: string;
  description: string;
}

interface CoreValue {
  name: string;
  importance: number; // 1-10
}

interface WorkPreference {
  text: string;
  preferred: boolean;
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

  // Texte du dialogue d'introduction
  private readonly MODULE_ID = 'personnalite';
  private fullText: string = "Agent, nous avons besoin d'un profil psychologique détaillé du sujet. Ce dossier contient des tests de personnalité et des analyses comportementales qui nous aideront à comprendre ses traits de caractère, son style de travail et ses motivations principales. Ces informations sont cruciales pour évaluer sa compatibilité avec différents environnements professionnels.";
  
  // Subscriptions pour gestion de la mémoire
  private subscriptions: Subscription[] = [];
  
  // État du dialogue
  isDialogOpen: boolean = false;
  isTyping: boolean = false;

  // État de progression du module
  moduleAvailable: boolean = false;

  // Onglets du dossier
  activeTab: string = 'test';
  profileTabs: TabInfo[] = [
    { id: 'test', name: 'Évaluation', icon: 'bi-clipboard-check' },
    { id: 'profile', name: 'Profil', icon: 'bi-person-badge' },
    { id: 'style', name: 'Style de travail', icon: 'bi-briefcase' },
    { id: 'values', name: 'Motivations', icon: 'bi-stars' }
  ];

  // État du test
  testCompleted: boolean = false;
  currentScenarioIndex: number = 0;
  selectedResponse: number | null = null;
  traitScores = {
    extroversion: 0,
    agreeableness: 0,
    conscientiousness: 0,
    openness: 0
  };
  maxTraitScore: number = 10;

  // Scenarios du test
  scenarios: Scenario[] = [
    {
      id: 'scenario1',
      title: 'Réunion d\'équipe',
      description: 'Lors d\'une réunion d\'équipe importante, vous remarquez qu\'un collègue présente une idée que vous aviez partagée avec lui en privé il y a quelques jours, sans vous mentionner. Comment réagissez-vous?',
      responses: [
        {
          id: 'r1a',
          text: 'J\'interromps poliment pour préciser que c\'était initialement mon idée, assurant ainsi que ma contribution est reconnue.',
          traits: { extroversion: 8, agreeableness: 4, conscientiousness: 6, openness: 5 }
        },
        {
          id: 'r1b',
          text: 'J\'attends la fin de la réunion pour discuter en privé avec ce collègue de la situation et comprendre son point de vue.',
          traits: { extroversion: 5, agreeableness: 8, conscientiousness: 7, openness: 6 }
        },
        {
          id: 'r1c',
          text: 'Je reste silencieux pendant la réunion, mais j\'envoie ensuite un email à toute l\'équipe avec mes notes initiales sur l\'idée, datées.',
          traits: { extroversion: 3, agreeableness: 4, conscientiousness: 9, openness: 4 }
        },
        {
          id: 'r1d',
          text: 'Je laisse passer, considérant que l\'important est que l\'idée soit mise en œuvre, peu importe qui en reçoit le crédit.',
          traits: { extroversion: 4, agreeableness: 9, conscientiousness: 5, openness: 7 }
        }
      ]
    },
    {
      id: 'scenario2',
      title: 'Nouveau projet',
      description: 'Votre équipe vient de recevoir un nouveau projet avec un délai serré. Le chef de projet vous demande d\'estimer le temps nécessaire pour accomplir votre partie. Comment procédez-vous?',
      responses: [
        {
          id: 'r2a',
          text: 'Je donne une estimation prudente, ajoutant une marge de sécurité pour les imprévus, même si cela semble long.',
          traits: { extroversion: 5, agreeableness: 6, conscientiousness: 9, openness: 4 }
        },
        {
          id: 'r2b',
          text: 'Je propose un délai ambitieux pour montrer ma motivation, quitte à faire des heures supplémentaires plus tard.',
          traits: { extroversion: 7, agreeableness: 7, conscientiousness: 6, openness: 6 }
        },
        {
          id: 'r2c',
          text: 'J\'analyse en détail les exigences et présente différents scénarios avec leurs délais respectifs pour que l\'équipe puisse choisir.',
          traits: { extroversion: 6, agreeableness: 5, conscientiousness: 9, openness: 8 }
        },
        {
          id: 'r2d',
          text: 'Je suggère une approche agile avec des livrables progressifs, plutôt qu\'une estimation fixe, pour nous adapter en fonction de l\'avancement.',
          traits: { extroversion: 6, agreeableness: 6, conscientiousness: 7, openness: 9 }
        }
      ]
    },
    {
      id: 'scenario3',
      title: 'Feedback critique',
      description: 'Vous recevez un feedback critique sur un travail que vous avez réalisé avec beaucoup d\'efforts. Certains points semblent injustifiés selon vous. Quelle est votre réaction?',
      responses: [
        {
          id: 'r3a',
          text: 'Je défends mon travail point par point en expliquant mes choix et en contestant les critiques que je trouve injustifiées.',
          traits: { extroversion: 8, agreeableness: 4, conscientiousness: 7, openness: 5 }
        },
        {
          id: 'r3b',
          text: 'J\'écoute attentivement, prends note des points valides et demande des clarifications sur les aspects que je ne comprends pas.',
          traits: { extroversion: 6, agreeableness: 7, conscientiousness: 8, openness: 8 }
        },
        {
          id: 'r3c',
          text: 'Je remercie pour le feedback et demande du temps pour réfléchir avant d\'y répondre, afin de ne pas réagir émotionnellement.',
          traits: { extroversion: 5, agreeableness: 8, conscientiousness: 7, openness: 7 }
        },
        {
          id: 'r3d',
          text: 'Je demande des exemples concrets et des suggestions d\'amélioration pour transformer cette critique en opportunité d\'apprentissage.',
          traits: { extroversion: 7, agreeableness: 6, conscientiousness: 8, openness: 9 }
        }
      ]
    },
    {
      id: 'scenario4',
      title: 'Innovation vs Stabilité',
      description: 'Dans un projet en cours, vous identifiez une nouvelle approche qui pourrait améliorer significativement le résultat, mais qui nécessiterait de revoir une partie du travail déjà réalisé. Que faites-vous?',
      responses: [
        {
          id: 'r4a',
          text: 'Je présente immédiatement mon idée à l\'équipe, en soulignant les bénéfices potentiels qui justifient selon moi les changements nécessaires.',
          traits: { extroversion: 8, agreeableness: 5, conscientiousness: 6, openness: 9 }
        },
        {
          id: 'r4b',
          text: 'J\'évalue précisément l\'impact du changement, préparant une analyse coûts-bénéfices avant de proposer quoi que ce soit.',
          traits: { extroversion: 5, agreeableness: 6, conscientiousness: 9, openness: 7 }
        },
        {
          id: 'r4c',
          text: 'Je continue avec l\'approche actuelle pour ce projet, mais je documente mon idée pour l\'intégrer dans un futur projet.',
          traits: { extroversion: 4, agreeableness: 7, conscientiousness: 8, openness: 5 }
        },
        {
          id: 'r4d',
          text: 'Je teste mon idée en parallèle du projet principal pour démontrer sa valeur sans perturber l\'avancement actuel.',
          traits: { extroversion: 6, agreeableness: 5, conscientiousness: 7, openness: 9 }
        }
      ]
    },
    {
      id: 'scenario5',
      title: 'Travail d\'équipe',
      description: 'Vous travaillez sur un projet d\'équipe et vous remarquez qu\'un membre ne fournit pas sa part de travail, ce qui impacte l\'avancement. Comment gérez-vous cette situation?',
      responses: [
        {
          id: 'r5a',
          text: 'Je discute directement avec la personne pour comprendre ses difficultés et voir comment je peux l\'aider.',
          traits: { extroversion: 7, agreeableness: 8, conscientiousness: 7, openness: 6 }
        },
        {
          id: 'r5b',
          text: 'Je signale la situation au responsable du projet pour qu\'il intervienne et résolve le problème.',
          traits: { extroversion: 6, agreeableness: 5, conscientiousness: 8, openness: 4 }
        },
        {
          id: 'r5c',
          text: 'Je compense en prenant plus de travail, pour assurer le succès du projet, tout en documentant ma contribution supplémentaire.',
          traits: { extroversion: 4, agreeableness: 7, conscientiousness: 9, openness: 5 }
        },
        {
          id: 'r5d',
          text: 'Je propose une réorganisation des tâches en équipe, adaptant la répartition aux forces et faiblesses de chacun.',
          traits: { extroversion: 7, agreeableness: 7, conscientiousness: 6, openness: 8 }
        }
      ]
    }
  ];

  // Données de personnalité
  personalityTraits: PersonalityTrait[] = [
    {
      id: 'extroversion',
      name: 'Extraversion',
      icon: 'bi-people-fill',
      description: 'Niveau d\'aisance et d\'énergie en situations sociales, incluant l\'assurance en communication et la proactivité dans les interactions professionnelles.',
      manifestations: [
        'Communication ouverte et directe',
        'Facilité à établir des relations professionnelles',
        'Confort dans la prise de parole en public',
        'Initiative dans les interactions d\'équipe'
      ],
      workImpact: 'Favorise le networking, la collaboration active et la capacité à défendre ses idées en contexte professionnel. Contribue à une présence positive dans les dynamiques d\'équipe.'
    },
    {
      id: 'agreeableness',
      name: 'Coopération',
      icon: 'bi-hand-thumbs-up',
      description: 'Tendance à privilégier l\'harmonie sociale, la coopération et le soutien mutuel dans les relations de travail.',
      manifestations: [
        'Approche collaborative de la résolution de problèmes',
        'Capacité d\'écoute et d\'empathie',
        'Valorisation du consensus et de l\'harmonie d\'équipe',
        'Diplomatie dans la gestion des désaccords'
      ],
      workImpact: 'Facilite le travail d\'équipe, la gestion des tensions interpersonnelles et la création d\'un environnement de travail positif. Contribue à une culture d\'entraide et de respect mutuel.'
    },
    {
      id: 'conscientiousness',
      name: 'Rigueur',
      icon: 'bi-check2-square',
      description: 'Degré d\'organisation, de fiabilité et d\'attention aux détails dans l\'exécution des tâches professionnelles.',
      manifestations: [
        'Organisation méthodique du travail',
        'Respect scrupuleux des délais',
        'Souci du détail et de la qualité',
        'Planification à long terme des projets'
      ],
      workImpact: 'Assure la livraison fiable et qualitative des projets, même complexes. Permet une gestion efficace des ressources et une exécution méthodique des tâches, renforçant la confiance des collaborateurs et des clients.'
    },
    {
      id: 'openness',
      name: 'Ouverture',
      icon: 'bi-lightbulb',
      description: 'Réceptivité aux nouvelles idées, approches et technologies, associée à la créativité et à la curiosité intellectuelle.',
      manifestations: [
        'Curiosité pour les technologies émergentes',
        'Recherche active de nouvelles approches',
        'Adaptabilité face au changement',
        'Créativité dans la résolution de problèmes'
      ],
      workImpact: 'Favorise l\'innovation, l\'apprentissage continu et l\'adaptation aux évolutions technologiques et méthodologiques. Permet d\'envisager des solutions créatives aux défis complexes.'
    }
  ];

  // Points forts de personnalité
  personalityStrengths: string[] = [
    'Capacité à équilibrer rigueur méthodologique et créativité dans l\'approche des projets',
    'Forte propension à l\'apprentissage continu et à l\'adaptation aux nouvelles technologies',
    'Aptitude à communiquer efficacement avec différents types d\'interlocuteurs',
    'Résilience et persévérance face aux défis techniques complexes'
  ];

  // Contributions en équipe
  teamContributions: string[] = [
    'Apporte une perspective analytique tout en restant ouvert aux idées des autres',
    'Maintient un équilibre entre pragmatisme et innovation dans les prises de décision',
    'Contribue à la documentation et au partage de connaissances au sein de l\'équipe',
    'Favorise un environnement de collaboration constructive et de feedback mutuel'
  ];

  // Environnement de travail optimal
  workEnvironment: string[] = [
    'Culture valorisant l\'innovation et l\'amélioration continue',
    'Environnement offrant un équilibre entre autonomie et collaboration',
    'Structure encourageant le développement professionnel et l\'acquisition de nouvelles compétences',
    'Projets présentant des défis techniques stimulants avec un impact concret'
  ];

  // Aspects de collaboration
  collaborationAspects: CollaborationAspect[] = [
    {
      name: 'Résolution de conflits',
      icon: 'bi-shield-check',
      description: 'Approche équilibrée qui privilégie la compréhension des perspectives différentes tout en maintenant l\'objectif commun. Cherche des solutions constructives plutôt que des compromis superficiels.'
    },
    {
      name: 'Prise de décision',
      icon: 'bi-signpost-split',
      description: 'Processus analytique intégrant l\'évaluation des données disponibles et la consultation des parties prenantes. Décisions guidées par un équilibre entre innovation et faisabilité.'
    },
    {
      name: 'Partage d\'expertise',
      icon: 'bi-share',
      description: 'Communication proactive des connaissances techniques, couplée à une écoute active des contributions des autres. Documentation systématique pour faciliter l\'apprentissage collectif.'
    },
    {
      name: 'Feedback',
      icon: 'bi-chat-dots',
      description: 'Feedback précis et constructif, orienté vers l\'amélioration plutôt que la critique. Réceptivité aux suggestions et capacité à intégrer les retours pertinents.'
    }
  ];

  // Processus de travail
  workProcesses: WorkProcess[] = [
    {
      name: 'Analyse',
      icon: 'bi-search',
      description: 'Exploration approfondie des exigences et du contexte pour identifier les défis clés et les opportunités.'
    },
    {
      name: 'Conception',
      icon: 'bi-pencil-square',
      description: 'Élaboration de solutions structurées et évolutives, en anticipant les besoins futurs et les scénarios d\'utilisation.'
    },
    {
      name: 'Implémentation',
      icon: 'bi-code-slash',
      description: 'Développement méthodique avec focus sur la qualité du code, la maintenabilité et les tests.'
    },
    {
      name: 'Itération',
      icon: 'bi-arrow-repeat',
      description: 'Affinage continu basé sur les retours utilisateurs et l\'analyse des performances, avec amélioration incrémentale.'
    }
  ];

  // Facteurs de motivation
  motivationFactors: MotivationFactor[] = [
    {
      name: 'Autonomie & Responsabilité',
      icon: 'bi-journal-check',
      description: 'Motivation par la confiance accordée et la liberté d\'explorer différentes approches pour atteindre les objectifs fixés.'
    },
    {
      name: 'Défis techniques',
      icon: 'bi-puzzle',
      description: 'Stimulation par des problèmes complexes requérant créativité et expertise technique pour être résolus efficacement.'
    },
    {
      name: 'Impact concret',
      icon: 'bi-graph-up',
      description: 'Satisfaction de voir les solutions développées apporter une valeur tangible aux utilisateurs et à l\'organisation.'
    },
    {
      name: 'Progression & Apprentissage',
      icon: 'bi-ladder',
      description: 'Motivation par l\'acquisition continue de nouvelles compétences et la maîtrise progressive de domaines d\'expertise.'
    }
  ];

  // Valeurs professionnelles
  coreValues: CoreValue[] = [
    { name: 'Excellence technique', importance: 9 },
    { name: 'Innovation', importance: 8 },
    { name: 'Collaboration', importance: 7 },
    { name: 'Intégrité', importance: 10 },
    { name: 'Apprentissage continu', importance: 9 },
    { name: 'Pragmatisme', importance: 6 },
    { name: 'Équilibre', importance: 7 },
    { name: 'Impact', importance: 8 }
  ];

   // Préférences professionnelles
   workPreferences: WorkPreference[] = [
    { text: 'Environnement hautement structuré avec processus rigides', preferred: false },
    { text: 'Cadre flexible favorisant l\'autonomie et l\'initiative', preferred: true },
    { text: 'Travail principalement individuel', preferred: false },
    { text: 'Collaboration équilibrée avec espace pour le travail indépendant', preferred: true },
    { text: 'Projets stables et prévisibles', preferred: false },
    { text: 'Défis variés et évolutifs', preferred: true },
    { text: 'Focus exclusif sur l\'exécution technique', preferred: false },
    { text: 'Implication dans les décisions stratégiques', preferred: true }
  ];


  constructor(
    private progressService: ProgressService,
    private timeTracker: TimeTrackerService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService,
    private appStateService: AppStateService
  ) {}

  ngOnInit(): void {
    // Vérifier si le module est disponible
    this.moduleAvailable = this.progressService.isModuleAvailable(this.MODULE_ID);

    // Vérifier si le test a déjà été complété (charger depuis userDataService)
    this.loadUserProgress();

    // Souscrire au dialogue
    this.subscriptions.push(
      this.dialogService.isDialogOpen$.subscribe(isOpen => {
        this.isDialogOpen = isOpen;
      }),
      this.dialogService.isTyping$.subscribe(isTyping => {
        this.isTyping = isTyping;
      })
    );
  }

  ngAfterViewInit(): void {
    // Afficher le dialogue d'introduction pour les premières visites
    setTimeout(() => {
      this.showIntroDialog();
    }, 500);
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions pour éviter les fuites de mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Charger les réponses précédentes de l'utilisateur
  loadUserProgress(): void {
    // Vérifier si le test est déjà complété
    const testCompletionResponse = this.userDataService.getResponse(this.MODULE_ID, 'test_completed');
    if (testCompletionResponse) {
      this.testCompleted = testCompletionResponse.response as boolean;
    }

    // Charger les scores des traits si disponibles
    const traitScoresResponse = this.userDataService.getResponse(this.MODULE_ID, 'trait_scores');
    if (traitScoresResponse && this.testCompleted) {
      try {
        // La réponse est stockée sous forme de chaîne JSON
        if (typeof traitScoresResponse.response === 'string') {
          const parsedScores = JSON.parse(traitScoresResponse.response);
          
          // Vérifier si l'objet parsé a la bonne structure
          if (parsedScores && 
              typeof parsedScores === 'object' && 
              'extroversion' in parsedScores && 
              'agreeableness' in parsedScores &&
              'conscientiousness' in parsedScores &&
              'openness' in parsedScores) {
            
            this.traitScores = {
              extroversion: Number(parsedScores.extroversion),
              agreeableness: Number(parsedScores.agreeableness),
              conscientiousness: Number(parsedScores.conscientiousness),
              openness: Number(parsedScores.openness)
            };
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des scores de traits:', error);
      }
    }

    // Charger l'index du scénario actuel si le test est en cours
    const currentScenarioResponse = this.userDataService.getResponse(this.MODULE_ID, 'current_scenario');
    if (currentScenarioResponse && !this.testCompleted) {
      this.currentScenarioIndex = currentScenarioResponse.response as number;
    }
  }

  // Afficher le dialogue d'introduction
  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: this.fullText,
      character: 'detective'
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText);
  }

  // Fermer le dialogue
  closeDialogTypeWriter(): void {
    this.dialogService.closeDialog();
  }

  // Changement d'onglet
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  // Obtenir le statut du test
  getTestStatusText(): string {
    if (!this.testCompleted) {
      if (this.currentScenarioIndex === 0 && this.selectedResponse === null) {
        return 'Test non commencé';
      }
      return `Progression : ${this.currentScenarioIndex}/${this.scenarios.length}`;
    }
    return 'Test complété';
  }

  // Calcul du pourcentage de complétion du test
  getTestCompletionPercentage(): number {
    if (this.testCompleted) return 100;
    return Math.round((this.currentScenarioIndex / this.scenarios.length) * 100);
  }

  // Démarrer le test
  startTest(): void {
    this.currentScenarioIndex = 0;
    this.selectedResponse = null;
    // Sauvegarder l'état actuel
    this.saveCurrentScenarioState();
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
    
    // Sauvegarder la réponse sélectionnée
    if (this.currentScenario) {
      this.userDataService.saveResponse(
        this.MODULE_ID,
        `scenario_${this.currentScenario.id}`,
        index
      );
    }
  }

  // Sauvegarder l'état actuel du scénario
  saveCurrentScenarioState(): void {
    this.userDataService.saveResponse(
      this.MODULE_ID,
      'current_scenario',
      this.currentScenarioIndex
    );
  }

  // Passer au scénario suivant
  nextScenario(): void {
    if (this.selectedResponse === null) return;
    
    // Enregistrer les scores de traits
    this.updateTraitScores();
    
    // Passer au scénario suivant ou terminer le test
    if (this.currentScenarioIndex < this.scenarios.length - 1) {
      this.currentScenarioIndex++;
      this.selectedResponse = null;
      this.saveCurrentScenarioState();
    } else {
      this.completeTest();
    }
  }

  // Revenir au scénario précédent
  previousScenario(): void {
    if (this.currentScenarioIndex > 0) {
      this.currentScenarioIndex--;
      this.selectedResponse = null;
      this.saveCurrentScenarioState();
      
      // Récupérer la réponse précédente si elle existe
      if (this.currentScenario) {
        const previousResponse = this.userDataService.getResponse(
          this.MODULE_ID,
          `scenario_${this.currentScenario.id}`
        );
        
        if (previousResponse) {
          this.selectedResponse = previousResponse.response as number;
        }
      }
    }
  }

  // Mise à jour des scores de traits
  updateTraitScores(): void {
    if (this.selectedResponse === null || !this.currentScenario) return;
    
    const response = this.currentScenario.responses[this.selectedResponse];
    const traits = response.traits;
    
    // Accumulation des scores
    this.traitScores.extroversion += traits.extroversion;
    this.traitScores.agreeableness += traits.agreeableness;
    this.traitScores.conscientiousness += traits.conscientiousness;
    this.traitScores.openness += traits.openness;
  }

  // Terminer le test
  completeTest(): void {
    // Calculer les scores finaux (moyenne)
    this.traitScores.extroversion = Math.round(this.traitScores.extroversion / this.scenarios.length);
    this.traitScores.agreeableness = Math.round(this.traitScores.agreeableness / this.scenarios.length);
    this.traitScores.conscientiousness = Math.round(this.traitScores.conscientiousness / this.scenarios.length);
    this.traitScores.openness = Math.round(this.traitScores.openness / this.scenarios.length);
    
    this.testCompleted = true;
    
    // Sauvegarder l'état final du test
    this.userDataService.saveResponse(
      this.MODULE_ID,
      'test_completed',
      true
    );
    
    // Sauvegarder les scores de traits - conversion en JSON pour compatibilité de type
    this.userDataService.saveResponse(
      this.MODULE_ID,
      'trait_scores',
      JSON.stringify(this.traitScores)
    );
    
    // Marquer le module comme complété
    this.progressService.completeModule(this.MODULE_ID);
    
    // Afficher un message de confirmation
    this.dialogService.openDialog({
      text: "Excellent travail! L'évaluation psychologique est maintenant complète. Vous pouvez explorer les différentes sections du profil pour découvrir les analyses détaillées.",
      character: 'detective'
    });
    this.dialogService.startTypewriter("Excellent travail! L'évaluation psychologique est maintenant complète. Vous pouvez explorer les différentes sections du profil pour découvrir les analyses détaillées.");
  }

  // Redémarrer le test
  restartTest(): void {
    // Demander confirmation
    const confirmRestart = confirm("Êtes-vous sûr de vouloir recommencer le test? Vos réponses actuelles seront perdues.");
    
    if (confirmRestart) {
      this.testCompleted = false;
      this.currentScenarioIndex = 0;
      this.selectedResponse = null;
      this.traitScores = {
        extroversion: 0,
        agreeableness: 0,
        conscientiousness: 0,
        openness: 0
      };
      
      // Mettre à jour les données utilisateur
      this.userDataService.saveResponse(
        this.MODULE_ID,
        'test_completed',
        false
      );
      
      this.userDataService.saveResponse(
        this.MODULE_ID,
        'current_scenario',
        0
      );
      
      // Supprimer toutes les réponses précédentes aux scénarios
      this.scenarios.forEach(scenario => {
        const responseKey = `scenario_${scenario.id}`;
        // Nous ne pouvons pas vraiment supprimer, mais nous pouvons réinitialiser
        this.userDataService.saveResponse(
          this.MODULE_ID,
          responseKey,
          -1
        );
      });
    }
  }

  // Obtenir les traits sous forme de tableau
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
    // Génération dynamique en fonction des traits dominants
    const dominantTraits = this.getDominantTraits(2);
    const dominantTraitIds = dominantTraits.map(t => t.id);
    
    if (dominantTraitIds.includes('conscientiousness') && dominantTraitIds.includes('openness')) {
      return "Le profil présente un équilibre remarquable entre rigueur analytique et ouverture à l'innovation. Caractérisé par une approche méthodique du travail combinée à une curiosité intellectuelle prononcée, le sujet démontre une capacité à naviguer efficacement entre structure et créativité. Sa communication directe mais attentive facilite les interactions professionnelles, tandis que son orientation vers les résultats assure une exécution fiable des projets. Particulièrement adapté aux environnements techniques évolutifs nécessitant à la fois expertise approfondie et adaptabilité.";
    } else if (dominantTraitIds.includes('extroversion') && dominantTraitIds.includes('agreeableness')) {
      return "Le profil révèle une orientation sociale marquée avec une forte propension à la collaboration et à la communication. Le sujet se distingue par sa capacité à établir rapidement des relations de confiance et à favoriser un environnement de travail harmonieux. Sa nature extravertie couplée à sa diplomatie en fait un excellent médiateur et facilitateur au sein des équipes. Particulièrement efficace dans les rôles nécessitant une interface entre différentes parties prenantes et dans la résolution de conflits interpersonnels.";
    } else if (dominantTraitIds.includes('conscientiousness') && dominantTraitIds.includes('agreeableness')) {
      return "Le profil démontre une combinaison de fiabilité méthodique et d'esprit d'équipe. Caractérisé par un haut niveau d'organisation et une attention particulière à la qualité, le sujet excelle également dans la création d'environnements de travail collaboratifs et harmonieux. Sa rigueur s'accompagne d'une approche empathique qui facilite le travail d'équipe et la résolution consensuelle des problèmes. Particulièrement adapté aux environnements où la précision et la cohésion d'équipe sont essentielles à la réussite des projets.";
    } else {
      // Profil par défaut ou autres combinaisons
      return "Le profil présente une combinaison équilibrée de traits de personnalité qui s'adaptent à divers environnements professionnels. Le sujet démontre une capacité à ajuster son approche en fonction des exigences spécifiques des situations, combinant méthode, collaboration et innovation selon les besoins. Cette adaptabilité constitue un atout précieux dans des contextes professionnels évolutifs et des équipes pluridisciplinaires.";
    }
  }

  // Style de communication
  getCommunicationStyle(): { directness: number, factual: number, conciseness: number } {
    // Calculé à partir des scores de traits
    const directness = 50 + (this.traitScores.extroversion - 5) * 10;
    const factual = 50 + (10 - this.traitScores.agreeableness) * 8;
    const conciseness = 50 - (this.traitScores.conscientiousness - 5) * 10;
    
    return {
      directness: Math.min(Math.max(directness, 0), 100),
      factual: Math.min(Math.max(factual, 0), 100),
      conciseness: Math.min(Math.max(conciseness, 0), 100)
    };
  }

  // Résumé du style de communication
  getCommunicationSummary(): string {
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
      summary += "avec une préférence pour les explications détaillées ";
    } else if (style.conciseness < 35) {
      summary += "privilégiant la concision et l'efficacité ";
    } else {
      summary += "adaptant le niveau de détail au contexte ";
    }
    
    summary += "lorsque la complexité du sujet le justifie. Adapte naturellement son style selon le contexte et l'interlocuteur, privilégiant la clarté et la précision. Particulièrement efficace pour vulgariser des concepts techniques et faciliter la compréhension entre équipes techniques et non-techniques.";
    
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
}