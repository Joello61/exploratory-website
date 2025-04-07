import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';
import { Router } from '@angular/router';
import Chart, { ChartConfiguration, ChartData, Legend, LinearScale, LineElement, PointElement, RadarController, RadialLinearScale, Tooltip } from 'chart.js/auto';

interface Evidence {
  id: string;
  title: string;
  icon: string;
  date: string;
  description: string;
  keywords?: string[];
  discovered: boolean;
  connections: string[];
}

interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index de la bonne réponse
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
}

interface IncorrectAnswer {
  questionId: number;
  userAnswer: number;
  correctAnswer: number;
  feedback: string; // Explication de la bonne réponse
}

interface Connection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface MotivationProfile {
  id: string;
  name: string;
  icon: string;
  description: string;
  aspects: ProfileAspect[];
}

interface ProfileAspect {
  title: string;
  icon: string;
  description: string;
}

interface MotivationFactor {
  name: string;
  icon: string;
  level: number; // 1-10
}

@Component({
  selector: 'app-motivation-socio-pro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motivation-socio-pro.component.html',
  styleUrls: ['./motivation-socio-pro.component.css'],
})
export class MotivationSocioProComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, nous entrons dans une phase critique de notre enquête. Nous devons maintenant analyser les motivations socio-professionnelles du sujet. Examinez les indices recueillis et établissez les connexions entre eux pour identifier les facteurs qui guident ses choix de carrière et ses aspirations. Cette analyse nous permettra de comprendre ce qui l'anime vraiment.";

  private subscriptions: Subscription[] = [];

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Données de progression et de temps
  elapsedTime: string = '00:00:00';
  isModuleCompleted: boolean = false;
  moduleProgressPercentage: number = 0;

  // État de l'investigation
  selectedEvidence: Evidence | null = null;
  showConnections: boolean = false;
  visibleConnections: Connection[] = [];
  boardWidth: number = 0;
  boardHeight: number = 0;

  // État de l'analyse
  analysisInProgress: boolean = false;
  analysisDone: boolean = false;
  currentStep: number = 0;
  selectedProfile: string | null = null;

  // Chart
  @ViewChild('radarChart') radarChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  // Résultats d'analyse
  analysisSummary: string =
    "L'analyse des motivations socio-professionnelles révèle un profil orienté vers l'innovation et la résolution de problèmes complexes, avec une forte valorisation de l'autonomie et de l'impact. Le sujet est principalement motivé par des défis intellectuels stimulants et des projets qui génèrent une valeur tangible, plutôt que par des facteurs de reconnaissance externe. Les éléments recueillis montrent également une aspiration à équilibrer la maîtrise technique avec une progression vers des responsabilités stratégiques.";

  analysisConclusion: string =
    "Le profil motivationnel indique une compatibilité optimale avec des environnements professionnels innovants qui valorisent l'autonomie et offrent des défis techniques significatifs. Le sujet s'épanouira dans des rôles où il peut contribuer à la fois à la résolution de problèmes complexes et à l'évolution stratégique des projets. L'équilibre entre collaboration et responsabilité individuelle semble être un facteur clé de satisfaction à long terme.";

  // Conditions optimales
  optimumConditions: string[] = [
    "Environnement favorisant l'innovation et l'exploration de nouvelles approches",
    "Autonomie décisionnelle et confiance accordée dans l'exécution des projets",
    'Projets ayant un impact concret et mesurable',
    'Équilibre entre expertise technique et implication stratégique',
    "Culture d'apprentissage continu et de développement professionnel",
    'Collaboration avec des équipes pluridisciplinaires talentueuses',
  ];

  // Indices motivationnels
  evidenceItems: Evidence[] = [
    {
      id: 'ev1',
      title: "Centres d'intérêt",
      icon: 'bi-heart',
      date: '2020-2024',
      description:
        "Les centres d'intérêt révèlent une forte attirance pour l'innovation technologique, l'apprentissage continu et les activités créatives. Ces inclinaisons personnelles montrent une motivation intrinsèque pour rester à la pointe des évolutions du domaine et explorer de nouvelles approches.",
      keywords: ['Innovation', 'Apprentissage', 'Créativité'],
      discovered: true,
      connections: ['ev2', 'ev5'],
    },
    {
      id: 'ev2',
      title: 'Personnalité',
      icon: 'bi-person-badge',
      date: 'Profil établi',
      description:
        "L'analyse de personnalité montre un profil analytique et orienté résolution de problèmes, avec une forte autonomie et une grande capacité d'adaptation. Ces traits sont cohérents avec une motivation pour les environnements professionnels offrant liberté d'action et défis intellectuels stimulants.",
      keywords: ['Autonomie', 'Adaptabilité', 'Analyse'],
      discovered: true,
      connections: ['ev1', 'ev3'],
    },
    {
      id: 'ev3',
      title: 'Itinéraire',
      icon: 'bi-map',
      date: '2015-2024',
      description:
        "Le parcours personnel et professionnel indique une progression délibérée vers des rôles demandant plus de responsabilité et d'impact. Les choix de carrière montrent une préférence claire pour des environnements innovants privilégiant l'excellence technique et l'évolution continue.",
      keywords: ['Progression', 'Impact', 'Évolution'],
      discovered: true,
      connections: ['ev4', 'ev6'],
    },
    {
      id: 'ev4',
      title: 'Expérience professionnelle',
      icon: 'bi-briefcase',
      date: '2016-2024',
      description:
        "L'analyse des expériences professionnelles révèle une constante recherche de défis techniques complexes et de projets à fort impact. Les transitions de carrière indiquent une motivation pour les environnements valorisant l'expertise technique combinée à une vision stratégique.",
      keywords: ['Expertise', 'Impact', 'Défis'],
      discovered: true,
      connections: ['ev3', 'ev5'],
    },
    {
      id: 'ev5',
      title: 'Compétences',
      icon: 'bi-tools',
      date: 'Évaluation récente',
      description:
        "Le profil de compétences montre un investissement significatif dans l'acquisition et le perfectionnement de savoir-faire techniques avancés, dépassant souvent les exigences immédiates des postes occupés. Cette démarche témoigne d'une motivation intrinsèque pour la maîtrise et l'excellence technique.",
      keywords: ['Maîtrise', 'Excellence', 'Développement'],
      discovered: true,
      connections: ['ev1', 'ev4'],
    },
    {
      id: 'ev6',
      title: 'Attentes professionnelles',
      icon: 'bi-arrow-up-circle',
      date: 'Projection future',
      description:
        "Les attentes professionnelles exprimées mettent en avant le désir d'équilibrer défis techniques stimulants et vision stratégique, avec une forte valorisation de l'autonomie et de l'impact concret. La recherche d'un environnement favorisant l'innovation et l'évolution continue est une constante.",
      keywords: ['Autonomie', 'Impact', 'Innovation'],
      discovered: true,
      connections: ['ev3'],
    },
  ];
  // Profils de motivation
  motivationProfiles: MotivationProfile[] = [
    {
      id: 'builder',
      name: 'Bâtisseur technique',
      icon: 'bi-tools',
      description:
        'Ce profil de motivation est caractérisé par un fort désir de créer des solutions techniques robustes et innovantes qui résolvent des problèmes complexes. Il combine expertise technique approfondie et vision architecturale pour construire des systèmes durables et évolutifs.',
      aspects: [
        {
          title: 'Excellence technique',
          icon: 'bi-award',
          description:
            "Recherche constante de qualité et d'optimisation dans les implémentations techniques, avec un souci particulier pour la maintenabilité et l'évolutivité des solutions.",
        },
        {
          title: 'Innovation pragmatique',
          icon: 'bi-lightbulb',
          description:
            "Équilibre entre exploration de nouvelles approches et solutions éprouvées, avec une préférence pour l'innovation ayant un impact concret sur les problématiques abordées.",
        },
        {
          title: 'Apprentissage continu',
          icon: 'bi-book',
          description:
            "Motivation intrinsèque pour l'acquisition de nouvelles compétences et la maîtrise approfondie des technologies, au-delà des exigences immédiates des projets.",
        },
      ],
    },
    {
      id: 'strategist',
      name: "Stratège d'innovation",
      icon: 'bi-graph-up',
      description:
        "Ce profil combine vision technique et compréhension stratégique pour identifier et développer des approches novatrices à fort impact. Il est motivé par la transformation des défis complexes en opportunités d'innovation avec des applications concrètes.",
      aspects: [
        {
          title: 'Vision systémique',
          icon: 'bi-intersect',
          description:
            'Capacité à percevoir les interconnexions entre différents domaines et à synthétiser des approches multidisciplinaires pour résoudre des problèmes complexes.',
        },
        {
          title: 'Impact mesurable',
          icon: 'bi-bullseye',
          description:
            'Forte motivation pour les projets générant une valeur tangible et des résultats mesurables, avec une préférence pour les solutions ayant un impact significatif.',
        },
        {
          title: 'Évolution constante',
          icon: 'bi-arrow-up-right',
          description:
            "Recherche permanente d'amélioration et d'évolution, tant au niveau personnel que des solutions développées, avec une vision à long terme.",
        },
      ],
    },
    {
      id: 'collaborator',
      name: 'Collaborateur autonome',
      icon: 'bi-people',
      description:
        "Ce profil valorise l'équilibre entre collaboration d'équipe efficace et autonomie personnelle. Il est motivé par les environnements qui favorisent l'échange d'expertise tout en offrant l'espace nécessaire pour explorer et développer des solutions de manière indépendante.",
      aspects: [
        {
          title: 'Autonomie responsable',
          icon: 'bi-person-check',
          description:
            "Préférence pour les contextes offrant une liberté décisionnelle encadrée par des objectifs clairs, permettant une expression optimale de la créativité et de l'expertise.",
        },
        {
          title: 'Synergie collective',
          icon: 'bi-puzzle',
          description:
            "Valorisation des dynamiques d'équipe qui permettent l'enrichissement mutuel et la combinaison des forces individuelles pour atteindre des résultats supérieurs.",
        },
        {
          title: "Partage d'expertise",
          icon: 'bi-share',
          description:
            "Motivation pour transmettre et recevoir des connaissances au sein d'un écosystème professionnel, contribuant à l'élévation collective des compétences.",
        },
      ],
    },
  ];

  userAnswers: number[] = [];
  quizResult: QuizResult | null = null;
  isQuizModalOpen: boolean = false;
  quizQuestions: QuizQuestion[] = [
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

  showCorrections: boolean = false;
  incorrectAnswers: IncorrectAnswer[] = [];

  // Facteurs de motivation
  motivationFactors: MotivationFactor[] = [
    { name: 'Défis techniques', icon: 'bi-code-square', level: 9 },
    { name: 'Autonomie', icon: 'bi-person-check', level: 8 },
    { name: 'Impact concret', icon: 'bi-graph-up', level: 9 },
    { name: 'Innovation', icon: 'bi-lightbulb', level: 8 },
    { name: 'Apprentissage', icon: 'bi-book', level: 9 },
    { name: 'Collaboration', icon: 'bi-people', level: 7 },
    { name: 'Reconnaissance', icon: 'bi-trophy', level: 5 },
    { name: 'Stabilité', icon: 'bi-shield', level: 4 },
  ];

  constructor(
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService,
    private router: Router
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('motivations')) {
      console.warn("Ce module n'est pas encore disponible");
    }

    // S'abonner au temps écoulé
    this.subscriptions.push(
      this.timeTrackerService.elapsedTime$.subscribe((time) => {
        this.elapsedTime = time;
      })
    );

    // Vérifier si le module est déjà complété
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe((statuses) => {
        this.isModuleCompleted = statuses.motivations;
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();

        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadSavedState();
        }
      })
    );

    this.subscriptions.push(
      this.dialogService.isDialogOpen$.subscribe((isOpen) => {
        this.isDialogOpen = isOpen;
      }),
      this.dialogService.isTyping$.subscribe((isTyping) => {
        this.isTyping = isTyping;
      }),
      this.dialogService.currentMessage$.subscribe((message) => {
        this.dialogMessage = message;
      })
    );
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService au lieu du typewriter manuel
    setTimeout(() => {
      this.showIntroDialog();
    }, 500);
    
    // Initialiser la taille du tableau pour les connexions
    setTimeout(() => {
      const board = document.querySelector('.evidence-board');
      if (board) {
        this.boardWidth = board.clientWidth;
        this.boardHeight = board.clientHeight;
      }
      
      // Si l'analyse est déjà terminée, initialiser le graphique
      if (this.analysisDone) {
        this.initRadarChart();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions pour éviter les fuites de mémoire
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: '', // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective',
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText, () => {
      setTimeout(() => {
        this.dialogService.closeDialog();
      }, 3000);
    });
  }

  // Fermer le dialogue
  closeDialogTypeWriter(): void {
    this.dialogService.closeDialog();
  }

  // Charger l'état sauvegardé précédemment
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('motivations');

    if (responses.length > 0) {
      // Charger les indices découverts
      const evidenceResponse = responses.find(
        (r) => r.questionId === 'discovered_evidence'
      );
      if (evidenceResponse && Array.isArray(evidenceResponse.response)) {
        const discoveredIds = evidenceResponse.response as string[];
        this.evidenceItems.forEach((item) => {
          item.discovered = discoveredIds.includes(item.id);
        });
      }

      // Charger l'état de l'analyse
      const analysisResponse = responses.find(
        (r) => r.questionId === 'analysis_done'
      );
      if (analysisResponse && typeof analysisResponse.response === 'boolean') {
        this.analysisDone = analysisResponse.response;
      }

      // Charger le profil sélectionné
      const profileResponse = responses.find(
        (r) => r.questionId === 'selected_profile'
      );
      if (profileResponse && typeof profileResponse.response === 'string') {
        this.selectedProfile = profileResponse.response;
      }
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder les indices découverts
    const discoveredIds = this.evidenceItems
      .filter((ev) => ev.discovered)
      .map((ev) => ev.id);

    this.userDataService.saveResponse(
      'motivations',
      'discovered_evidence',
      discoveredIds
    );

    // Sauvegarder l'état de l'analyse
    this.userDataService.saveResponse(
      'motivations',
      'analysis_done',
      this.analysisDone
    );

    // Sauvegarder le profil sélectionné
    if (this.selectedProfile) {
      this.userDataService.saveResponse(
        'motivations',
        'selected_profile',
        this.selectedProfile
      );
    }

    // Vérifier si le module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si les conditions de complétion du module sont remplies
  checkModuleCompletion(): void {
    // Le module est complété si l'analyse est terminée et qu'au moins 70% des indices sont découverts
    const evidenceThreshold = Math.ceil(this.evidenceItems.length * 0.7);

    if (
      this.analysisDone &&
      this.getDiscoveredCount() >= evidenceThreshold &&
      !this.isModuleCompleted
    ) {
      this.completeModule();
    }
  }

  // Marquer le module comme complété

  completeModule(): void {
    // Le module ne devrait être complété qu'après avoir réussi le quiz
    if (this.quizResult && this.quizResult.passed) {
      this.progressService.completeModule('motivations');
      this.isModuleCompleted = true;

      // Ajouter une note automatique pour résumer ce qui a été fait
      this.addCompletionNote();
    }
  }

  // Ajouter une note récapitulative automatique
  addCompletionNote(): void {
    // Récupérer le profil principal identifié de manière sécurisée
    const mainProfile = this.getSelectedProfile();
    const profileName = mainProfile ? mainProfile.name : 'Non identifié';

    // Récupérer les facteurs de motivation principaux (niveau >= 8)
    const topFactors = this.motivationFactors
      .filter((factor) => factor.level >= 8)
      .map((factor) => factor.name)
      .join(', ');

    // Récupérer le score du quiz
    const quizScore = this.quizResult ? this.quizResult.percentage : 0;

    const noteContent = `
Module "Motivations Socio-Professionnelles" complété le ${new Date().toLocaleDateString()}.
Indices analysés: ${this.getDiscoveredCount()}/${this.evidenceItems.length}.
Profil motivationnel dominant: ${profileName}.
Facteurs clés de motivation: ${topFactors}.
Environnement optimal: Combinaison d'autonomie, défis techniques et innovation.
Évaluation finale: ${quizScore}% de réponses correctes.
  `;

    this.noteService.addNote(noteContent.trim());
  }

  // Ouvrir le panneau de notes
  toggleNotes(): void {
    this.noteService.toggleNotesVisibility();
  }

  // Gestion des indices
  selectEvidence(evidence: Evidence): void {
    this.selectedEvidence = evidence;
    this.hideConnections();
  }

  discoverEvidence(evidence: Evidence): void {
    if (!evidence.discovered) {
      evidence.discovered = true;

      // Sauvegarder l'état
      this.saveState();

      // Si tous les indices sont découverts, permettre l'analyse finale
      if (this.getDiscoveredCount() === this.evidenceItems.length) {
        // Animation possible ici
      }
    }
  }

  investigateConnections(evidence: Evidence): void {
    if (!evidence.discovered) return;

    this.showConnections = true;
    this.visibleConnections = [];

    // Rechercher les éléments DOM des indices
    setTimeout(() => {
      const items = document.querySelectorAll('.evidence-item');
      const selectedIndex = this.getEvidenceIndex(evidence);

      if (selectedIndex >= 0 && items && items.length > 0) {
        const selectedItem = items[selectedIndex];
        const selectedRect = selectedItem.getBoundingClientRect();
        const boardRect = document
          .querySelector('.evidence-board')
          ?.getBoundingClientRect();

        if (!boardRect) return;

        // Position du centre de l'élément sélectionné
        const x1 = selectedRect.left + selectedRect.width / 2 - boardRect.left;
        const y1 = selectedRect.top + selectedRect.height / 2 - boardRect.top;

        // Pour chaque connexion
        for (const connId of evidence.connections) {
          const connIndex = this.evidenceItems.findIndex(
            (ev) => ev.id === connId
          );
          if (connIndex >= 0 && items[connIndex]) {
            const connItem = items[connIndex];
            const connRect = connItem.getBoundingClientRect();

            // Position du centre de l'élément connecté
            const x2 = connRect.left + connRect.width / 2 - boardRect.left;
            const y2 = connRect.top + connRect.height / 2 - boardRect.top;

            // Ajouter la connexion
            this.visibleConnections.push({ x1, y1, x2, y2 });
          }
        }
      }
    }, 100);
  }

  hideConnections(): void {
    this.showConnections = false;
    this.visibleConnections = [];
  }

  getEvidenceIndex(evidence: Evidence): number {
    return this.evidenceItems.findIndex((ev) => ev.id === evidence.id);
  }

  getDiscoveredCount(): number {
    return this.evidenceItems.filter((ev) => ev.discovered).length;
  }

  getDiscoveryPercentage(): number {
    return (this.getDiscoveredCount() / this.evidenceItems.length) * 100;
  }

  // Analyse des motivations
  canAnalyze(): boolean {
    // Au moins 3 indices doivent être découverts pour permettre l'analyse
    return this.getDiscoveredCount() >= 3;
  }

  analyzeMotivations(): void {
    if (this.analysisDone) {
      // Si l'analyse est déjà terminée, juste réafficher les résultats
      return;
    }
    
    if (!this.canAnalyze()) return;
    
    this.analysisInProgress = true;
    this.currentStep = 1;
    
    // Simulation de l'analyse avec progression des étapes
    setTimeout(() => this.currentStep = 2, 2000);
    setTimeout(() => this.currentStep = 3, 4000);
    setTimeout(() => this.currentStep = 4, 6000);
    
    setTimeout(() => {
      this.analysisInProgress = false;
      this.analysisDone = true;
      this.selectedProfile = this.motivationProfiles[0].id;
      
      // Initialiser le graphique radar avec Chart.js
      setTimeout(() => {
        this.initRadarChart();
      }, 300);
      
      // Sauvegarder l'état après l'analyse
      this.saveState();
    }, 8000);
  }

  // Profils de motivation
  selectProfile(profileId: string): void {
    this.selectedProfile = profileId;

    // Sauvegarder la sélection
    this.userDataService.saveResponse(
      'motivations',
      'selected_profile',
      profileId
    );
  }

  getSelectedProfile(): MotivationProfile | null {
    if (!this.selectedProfile) return null;
    return (
      this.motivationProfiles.find((p) => p.id === this.selectedProfile) || null
    );
  }

  // Utilitaires
  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Ajouter cette méthode
  analyzeEvidence(evidence: Evidence): void {
    // Fonction permettant d'afficher une analyse spécifique pour chaque type d'indice
    let analysisTitle = '';
    let analysisContent = '';

    switch (evidence.id) {
      case 'ev1': // Centres d'intérêt
        analysisTitle = "Impact motivationnel des centres d'intérêt";
        analysisContent =
          "L'analyse des centres d'intérêt révèle une forte motivation intrinsèque pour l'innovation et l'apprentissage continu. Ces facteurs personnels constituent le socle de la motivation professionnelle en favorisant un engagement durable et une attitude proactive face aux nouveaux défis. La valorisation de la créativité suggère également une préférence pour les environnements permettant l'expression d'idées originales et l'expérimentation.";
        break;
      case 'ev2': // Personnalité
        analysisTitle = 'Influence du profil de personnalité';
        analysisContent =
          "Les traits de personnalité identifiés indiquent une forte compatibilité avec des environnements professionnels valorisant l'autonomie et proposant des défis analytiques complexes. La combinaison d'indépendance et d'adaptabilité suggère une motivation pour des rôles permettant à la fois une grande latitude décisionnelle et la flexibilité nécessaire pour naviguer dans des contextes changeants.";
        break;
      case 'ev3': // Itinéraire
        analysisTitle = 'Significations motivationnelles du parcours';
        analysisContent =
          "L'analyse du parcours personnel et professionnel montre une recherche constante d'évolution et d'impact. Les choix effectués révèlent une motivation profonde pour des rôles permettant d'exercer une influence significative et de générer des résultats tangibles. La trajectoire observée indique également une valorisation des environnements favorisant l'excellence et le développement continu des compétences.";
        break;
      case 'ev4': // Expérience professionnelle
        analysisTitle = 'Enseignements motivationnels des expériences';
        analysisContent =
          "Les expériences professionnelles accumulées montrent une attraction constante vers les défis techniques complexes et les projets innovants. Cette tendance révèle une motivation forte pour les environnements stimulants intellectuellement et offrant l'opportunité de résoudre des problèmes non conventionnels. La progression de carrière indique également une valorisation croissante de l'impact stratégique au-delà de la pure exécution technique.";
        break;
      case 'ev5': // Compétences
        analysisTitle = 'Dimensions motivationnelles des compétences';
        analysisContent =
          "Le développement soutenu et autodidacte de compétences avancées révèle une motivation profonde pour la maîtrise technique et l'excellence dans son domaine. Cet investissement personnel, au-delà des exigences professionnelles immédiates, témoigne d'une volonté intrinsèque de progression et d'une satisfaction liée à l'acquisition de savoir-faire complexes. Ces facteurs suggèrent une compatibilité optimale avec des environnements valorisant l'expertise et l'apprentissage continu.";
        break;
      case 'ev6': // Attentes
        analysisTitle = 'Projection motivationnelle des attentes';
        analysisContent =
          "Les attentes professionnelles formulées révèlent une recherche d'équilibre entre défis techniques stimulants et impact stratégique concret. Cette orientation suggère une motivation pour des rôles combinant mise en œuvre d'expertise et contribution aux orientations plus larges des projets. La valorisation de l'autonomie et de l'innovation indique également une préférence pour les environnements encourageant l'initiative personnelle et les approches novatrices.";
        break;
    }

    // Afficher l'analyse dans une modal ou un panneau dédié
    this.dialogService.openDialog({
      text: `${analysisTitle}\n\n${analysisContent}`,
      character: 'detective',
    });

    // Après un certain temps, fermer automatiquement le dialogue
    setTimeout(() => {
      this.dialogService.closeDialog();
    }, 10000); // 10 secondes
  }

  openQuizModal(): void {
    // Réinitialiser le quiz
    this.userAnswers = new Array(this.quizQuestions.length).fill(-1);
    this.quizResult = null;
    this.isQuizModalOpen = true;
  }

  closeQuizModal(): void {
    this.isQuizModalOpen = false;
  }

  selectAnswer(questionIndex: number, answerIndex: number): void {
    this.userAnswers[questionIndex] = answerIndex;
  }

  submitQuiz(): void {
    // Vérifier si toutes les questions ont une réponse
    const unanswered = this.userAnswers.findIndex((answer) => answer === -1);
    if (unanswered !== -1) {
      // Afficher un message d'alerte
      this.dialogService.openDialog({
        text: `Veuillez répondre à toutes les questions avant de soumettre le quiz.`,
        character: 'detective',
      });

      setTimeout(() => {
        this.dialogService.closeDialog();
      }, 3000);

      return;
    }

    // Réinitialiser le tableau des réponses incorrectes
    this.incorrectAnswers = [];

    // Calculer le score
    let correctAnswers = 0;
    for (let i = 0; i < this.quizQuestions.length; i++) {
      if (this.userAnswers[i] === this.quizQuestions[i].correctAnswer) {
        correctAnswers++;
      } else {
        // Préparation des feedbacks personnalisés pour chaque question
        let feedback = '';

        switch (this.quizQuestions[i].id) {
          case 1:
            feedback =
              "Les défis techniques et l'impact concret sont identifiés comme les principaux facteurs de motivation, avec un score de 9/10 dans le rapport d'analyse. La reconnaissance externe n'est évaluée qu'à 5/10, tandis que la stabilité est à 4/10.";
            break;
          case 2:
            feedback =
              "L'analyse montre une forte préférence pour les environnements favorisant l'autonomie et l'innovation, comme en témoignent les conditions optimales identifiées et le profil motivationnel 'Collaborateur autonome'.";
            break;
          case 3:
            feedback =
              "L'indice 'Centres d'intérêt' révèle une forte attirance pour l'innovation technologique et l'apprentissage continu, ce qui constitue un facteur de motivation intrinsèque important dans le contexte professionnel.";
            break;
          case 4:
            feedback =
              "L'analyse de personnalité met en évidence l'autonomie et la capacité d'adaptation comme traits déterminants dans la motivation pour des environnements professionnels spécifiques, contrairement au besoin de validation externe.";
            break;
          case 5:
            feedback =
              "Dans le graphique radar des facteurs de motivation, les 'Défis techniques' atteignent un score de 9/10, à égalité avec 'Impact concret' et 'Apprentissage', tandis que 'Reconnaissance' n'est qu'à 5/10 et 'Stabilité' à 4/10.";
            break;
          default:
            feedback =
              "Consultez l'analyse complète pour mieux comprendre cette dimension du profil motivationnel.";
        }

        // Correction: s'assurer que userAnswer contient bien la réponse de l'utilisateur
        // et correctAnswer contient la réponse correcte
        this.incorrectAnswers.push({
          questionId: this.quizQuestions[i].id,
          userAnswer: this.userAnswers[i],
          correctAnswer: this.quizQuestions[i].correctAnswer,
          feedback: feedback,
        });
      }
    }

    const percentage = (correctAnswers / this.quizQuestions.length) * 100;
    const passed = percentage >= 80;

    this.quizResult = {
      score: correctAnswers,
      totalQuestions: this.quizQuestions.length,
      percentage: percentage,
      passed: passed,
    };

    // Afficher les corrections si l'utilisateur n'a pas tout bon
    this.showCorrections = this.incorrectAnswers.length > 0;

    // Sauvegarder le résultat
    this.userDataService.saveResponse('motivations', 'quiz_score', percentage);
    this.userDataService.saveResponse('motivations', 'quiz_passed', passed);

    // Si l'utilisateur a réussi, marquer le module comme complété
    if (passed) {
      this.completeModule();
    }
  }

  retryQuiz(): void {
    this.quizResult = null;
    this.userAnswers = new Array(this.quizQuestions.length).fill(-1);
    this.showCorrections = false;
    this.incorrectAnswers = [];
  }

  toggleCorrections(): void {
    this.showCorrections = !this.showCorrections;
  }

  // Ajouter cette méthode pour récupérer une question par ID
  getQuestionById(id: number): QuizQuestion | undefined {
    return this.quizQuestions.find((q) => q.id === id);
  }

  // Ajouter cette méthode au composant
  getAnswerText(questionId: number, answerIndex: number): string {
    const question = this.getQuestionById(questionId);
    if (
      !question ||
      !question.options ||
      answerIndex < 0 ||
      answerIndex >= question.options.length
    ) {
      return 'Réponse non disponible';
    }
    return question.options[answerIndex];
  }

  goToConclusion(): void {
    // Redirection vers la page de conclusion
    this.router.navigate(['/conclusion']);
  }

  initRadarChart(): void {
    // Enregistrez les composants nécessaires pour Chart.js
    Chart.register(RadarController, RadialLinearScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
    
    // Récupérez les données du graphique depuis les facteurs de motivation
    const labels = this.motivationFactors.map(factor => factor.name);
    const data = this.motivationFactors.map(factor => factor.level);
    
    // Configurez le graphique
    const chartData: ChartData = {
      labels: labels,
      datasets: [{
        label: 'Niveau de motivation',
        data: data,
        backgroundColor: 'rgba(0, 191, 255, 0.2)',
        borderColor: 'rgba(0, 191, 255, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 191, 255, 0.8)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(0, 191, 255, 1)',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    };
    
    // Options du graphique avec les types corrects
    const chartOptions = {
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 10,
          ticks: {
            stepSize: 1,  // Intervalle de 1 pour afficher tous les chiffres
            backdropColor: 'transparent',
            color: '#00bfff',
            font: {
              size: 10,
              weight: 'bold' as const  // Utilisation de 'as const' pour s'assurer que le type est correct
            },
            showLabelBackdrop: false
          },
          grid: {
            color: 'rgba(0, 191, 255, 0.1)'
          },
          angleLines: {
            color: 'rgba(0, 191, 255, 0.1)'
          },
          pointLabels: {
            color: '#d0f0ff',
            font: {
              size: 12
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 15, 26, 0.9)',
          titleColor: '#d0f0ff',
          bodyColor: '#a0d8ff',
          borderColor: 'rgba(0, 191, 255, 0.3)',
          borderWidth: 1,
          padding: 15,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function(tooltipItems: any) {
              return tooltipItems[0].label;
            },
            label: function(context: any) {
              return `Niveau: ${context.raw}/10`;
            }
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    };
    
    // Configuration complète
    const config: ChartConfiguration = {
      type: 'radar',
      data: chartData,
      options: chartOptions
    };
    
    // Créez le graphique
    const ctx = this.radarChartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, config);
    }
  }
  
  updateRadarChart(): void {
    if (this.chart) {
      const data = this.motivationFactors.map(factor => factor.level);
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }

}
