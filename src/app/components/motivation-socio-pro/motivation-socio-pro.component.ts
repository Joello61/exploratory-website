import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';
import { Router } from '@angular/router';
import Chart, {
  ChartConfiguration,
  ChartData,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js/auto';
import { Evidence } from '../../models/motivations/evidence';
import { QuizQuestion } from '../../models/motivations/quiz-question';
import { Connection } from '../../models/motivations/connection';
import { IncorrectAnswer } from '../../models/motivations/incorrect-answer';
import { MotivationFactor } from '../../models/motivations/motivation-factor';
import { MotivationProfile } from '../../models/motivations/motivation-profile';
import { QuizResult } from '../../models/motivations/quiz-result';
import { DialogMessage } from '../../models/others/dialod-message';
import { OPTIMUMCONDITIONSDATA } from '../../database/motivations/optimumConditions.data';
import { EVIDENCEITEMSDATA } from '../../database/motivations/evidenceItems.data';
import { MOTIVATIONPROFILESDATA } from '../../database/motivations/motivationProfiles.data';
import { QUIZQUESTIONSDATA } from '../../database/motivations/quizQuestions.data';
import { MOTIVATIONFACTORSDATA } from '../../database/motivations/motivationFactors.data';


@Component({
    selector: 'app-motivation-socio-pro',
    imports: [CommonModule],
    templateUrl: './motivation-socio-pro.component.html',
    styleUrls: ['./motivation-socio-pro.component.css']
})
export class MotivationSocioProComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Pour gérer la destruction proprement
  private destroy$ = new Subject<void>();

  // Gérer les timeouts
  private introDialogTimeoutId: number | null = null;
  private closeDialogTimeoutId: number | null = null;
  private boardSizeTimeoutId: number | null = null;
  private chartInitTimeoutId: number | null = null;
  private connectionTimeoutId: number | null = null;
  private analysisStepTimeouts: number[] = [];
  private analysisCompletionTimeoutId: number | null = null;
  private quizFeedbackTimeoutId: number | null = null;
  private analysisEvidenceTimeoutId: number | null = null;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, nous entrons dans une phase critique de notre enquête. Nous devons maintenant analyser les motivations socio-professionnelles du sujet. Examinez les indices recueillis et établissez les connexions entre eux pour identifier les facteurs qui guident ses choix de carrière et ses aspirations. Cette analyse nous permettra de comprendre ce qui l'anime vraiment.";

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

  userAnswers: number[] = [];
  quizResult: QuizResult | null = null;
  isQuizModalOpen: boolean = false;

  showCorrections: boolean = false;
  incorrectAnswers: IncorrectAnswer[] = [];

  //données

  // Conditions optimales
  optimumConditions: string[] = OPTIMUMCONDITIONSDATA;

  // Indices motivationnels
  evidenceItems: Evidence[] = EVIDENCEITEMSDATA;
  // Profils de motivation
  motivationProfiles: MotivationProfile[] = MOTIVATIONPROFILESDATA;

  quizQuestions: QuizQuestion[] = QUIZQUESTIONSDATA;

  // Facteurs de motivation
  motivationFactors: MotivationFactor[] = MOTIVATIONFACTORSDATA;

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

    // S'abonner au temps écoulé avec takeUntil
    this.timeTrackerService.elapsedTime$
      .pipe(takeUntil(this.destroy$))
      .subscribe((time) => {
        this.elapsedTime = time;
      });

    // Vérifier si le module est déjà complété
    this.progressService.moduleStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statuses) => {
        this.isModuleCompleted = statuses.motivations;
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();

        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadSavedState();
        }
      });

    // S'abonner aux états du dialogue
    this.dialogService.isDialogOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isDialogOpen = isOpen;
      });

    this.dialogService.isTyping$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isTyping) => {
        this.isTyping = isTyping;
      });

    this.dialogService.currentMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        this.dialogMessage = message;
      });
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService avec un timeout géré
    this.introDialogTimeoutId = window.setTimeout(() => {
      this.showIntroDialog();
      this.introDialogTimeoutId = null;
    }, 500);

    // Initialiser la taille du tableau pour les connexions
    this.boardSizeTimeoutId = window.setTimeout(() => {
      const board = document.querySelector('.evidence-board');
      if (board) {
        this.boardWidth = board.clientWidth;
        this.boardHeight = board.clientHeight;
      }

      // Si l'analyse est déjà terminée, initialiser le graphique
      if (this.analysisDone) {
        this.chartInitTimeoutId = window.setTimeout(() => {
          this.initRadarChart();
          this.chartInitTimeoutId = null;
        }, 300);
      }

      this.boardSizeTimeoutId = null;
    }, 500);
  }

  ngOnDestroy(): void {
    // Émettre le signal de destruction pour tous les observables
    this.destroy$.next();
    this.destroy$.complete();

    // Nettoyer tous les timeouts
    this.clearAllTimeouts();

    // Détruire le graphique si existant
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Fermer tout dialogue ouvert
    if (this.isDialogOpen) {
      this.dialogService.closeDialog();
    }
  }

  // Nettoyer tous les timeouts
  private clearAllTimeouts(): void {
    const timeouts = [
      this.introDialogTimeoutId,
      this.closeDialogTimeoutId,
      this.boardSizeTimeoutId,
      this.chartInitTimeoutId,
      this.connectionTimeoutId,
      this.analysisCompletionTimeoutId,
      this.quizFeedbackTimeoutId,
      this.analysisEvidenceTimeoutId,
    ];

    // Nettoyer chaque timeout non-null
    timeouts.forEach((timeoutId) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    });

    // Nettoyer le tableau des timeouts d'étapes d'analyse
    this.analysisStepTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.analysisStepTimeouts = [];
  }

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: '', // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective',
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText, () => {
      // Nettoyer tout timeout précédent
      if (this.closeDialogTimeoutId !== null) {
        clearTimeout(this.closeDialogTimeoutId);
      }

      this.closeDialogTimeoutId = window.setTimeout(() => {
        this.dialogService.closeDialog();
        this.closeDialogTimeoutId = null;
      }, 3000);
    });
  }

  // Fermer le dialogue
  closeDialogTypeWriter(): void {
    this.dialogService.closeDialog();

    // Annuler tout timeout de fermeture programmé
    if (this.closeDialogTimeoutId !== null) {
      clearTimeout(this.closeDialogTimeoutId);
      this.closeDialogTimeoutId = null;
    }
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

  // Gestion des connexions
  investigateConnections(evidence: Evidence): void {
    if (!evidence.discovered) return;

    this.showConnections = true;
    this.visibleConnections = [];

    // Nettoyer tout timeout de connexion précédent
    if (this.connectionTimeoutId !== null) {
      clearTimeout(this.connectionTimeoutId);
    }

    // Rechercher les éléments DOM des indices
    this.connectionTimeoutId = window.setTimeout(() => {
      const items = document.querySelectorAll('.evidence-item');
      const selectedIndex = this.getEvidenceIndex(evidence);

      if (selectedIndex >= 0 && items && items.length > 0) {
        const selectedItem = items[selectedIndex];
        const boardElement = document.querySelector('.evidence-board');

        if (!boardElement || !selectedItem) {
          this.connectionTimeoutId = null;
          return;
        }

        const selectedRect = selectedItem.getBoundingClientRect();
        const boardRect = boardElement.getBoundingClientRect();

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

      this.connectionTimeoutId = null;
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

  // Analyse des motivations avec gestion propre des timeouts
  analyzeMotivations(): void {
    if (this.analysisDone) {
      // Si l'analyse est déjà terminée, juste réafficher les résultats
      return;
    }

    if (!this.canAnalyze()) return;

    // Nettoyer tous les timeouts d'analyse existants
    this.analysisStepTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.analysisStepTimeouts = [];

    if (this.analysisCompletionTimeoutId !== null) {
      clearTimeout(this.analysisCompletionTimeoutId);
    }

    this.analysisInProgress = true;
    this.currentStep = 1;

    // Simulation de l'analyse avec progression des étapes
    const step2TimeoutId = window.setTimeout(
      () => (this.currentStep = 2),
      2000
    );
    const step3TimeoutId = window.setTimeout(
      () => (this.currentStep = 3),
      4000
    );
    const step4TimeoutId = window.setTimeout(
      () => (this.currentStep = 4),
      6000
    );

    this.analysisStepTimeouts.push(
      step2TimeoutId,
      step3TimeoutId,
      step4TimeoutId
    );

    this.analysisCompletionTimeoutId = window.setTimeout(() => {
      this.analysisInProgress = false;
      this.analysisDone = true;
      this.selectedProfile = this.motivationProfiles[0].id;

      // Initialiser le graphique radar avec Chart.js
      this.chartInitTimeoutId = window.setTimeout(() => {
        this.initRadarChart();
        this.chartInitTimeoutId = null;
      }, 300);

      // Sauvegarder l'état après l'analyse
      this.saveState();

      this.analysisCompletionTimeoutId = null;
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

  // Analyser un indice spécifique
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
      // Autres cas...
      default:
        analysisTitle = "Analyse de l'élément";
        analysisContent = 'Aucune analyse disponible pour cet élément.';
    }

    // Afficher l'analyse dans une modal ou un panneau dédié
    this.dialogService.openDialog({
      text: `${analysisTitle}\n\n${analysisContent}`,
      character: 'detective',
    });

    // Nettoyer tout timeout précédent
    if (this.analysisEvidenceTimeoutId !== null) {
      clearTimeout(this.analysisEvidenceTimeoutId);
    }

    // Après un certain temps, fermer automatiquement le dialogue
    this.analysisEvidenceTimeoutId = window.setTimeout(() => {
      this.dialogService.closeDialog();
      this.analysisEvidenceTimeoutId = null;
    }, 10000);
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

  // Méthode du quiz avec gestion des timeouts
  submitQuiz(): void {
    // Vérifier si toutes les questions ont une réponse
    const unanswered = this.userAnswers.findIndex((answer) => answer === -1);
    if (unanswered !== -1) {
      // Afficher un message d'alerte
      this.dialogService.openDialog({
        text: `Veuillez répondre à toutes les questions avant de soumettre le quiz.`,
        character: 'detective',
      });

      // Nettoyer tout timeout précédent
      if (this.quizFeedbackTimeoutId !== null) {
        clearTimeout(this.quizFeedbackTimeoutId);
      }

      this.quizFeedbackTimeoutId = window.setTimeout(() => {
        this.dialogService.closeDialog();
        this.quizFeedbackTimeoutId = null;
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
    // Nettoyer le graphique existant s'il y en a un
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Vérifier que le canvas existe
    if (!this.radarChartCanvas || !this.radarChartCanvas.nativeElement) {
      console.warn('Canvas pour le radar chart non disponible');
      return;
    }

    // Enregistrer les composants nécessaires pour Chart.js
    Chart.register(
      RadarController,
      RadialLinearScale,
      LinearScale,
      PointElement,
      LineElement,
      Tooltip,
      Legend
    );

    // Récupérer les données du graphique depuis les facteurs de motivation
    const labels = this.motivationFactors.map((factor) => factor.name);
    const data = this.motivationFactors.map((factor) => factor.level);

    // Configurer le graphique
    const chartData: ChartData = {
      labels: labels,
      datasets: [
        {
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
          pointHoverRadius: 7,
        },
      ],
    };

    // Options du graphique avec les types corrects
    const chartOptions = {
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 10,
          ticks: {
            stepSize: 1, // Intervalle de 1 pour afficher tous les chiffres
            backdropColor: 'transparent',
            color: '#00bfff',
            font: {
              size: 10,
              weight: 'bold' as const, // Utilisation de 'as const' pour s'assurer que le type est correct
            },
            showLabelBackdrop: false,
          },
          grid: {
            color: 'rgba(0, 191, 255, 0.1)',
          },
          angleLines: {
            color: 'rgba(0, 191, 255, 0.1)',
          },
          pointLabels: {
            color: '#d0f0ff',
            font: {
              size: 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
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
            title: function (tooltipItems: any) {
              return tooltipItems[0].label;
            },
            label: function (context: any) {
              return `Niveau: ${context.raw}/10`;
            },
          },
        },
      },
      maintainAspectRatio: false,
      responsive: true,
    };

    // Configuration complète
    const config: ChartConfiguration = {
      type: 'radar',
      data: chartData,
      options: chartOptions,
    };

    // Créer le graphique en vérifiant le contexte
    const ctx = this.radarChartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, config);
    } else {
      console.warn("Impossible d'obtenir le contexte 2D du canvas");
    }
  }

  updateRadarChart(): void {
    if (this.chart) {
      const data = this.motivationFactors.map((factor) => factor.level);
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }
}
