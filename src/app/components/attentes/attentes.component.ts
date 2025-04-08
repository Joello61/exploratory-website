import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { ProgressService } from '../../services/progress.service';
import { DialogService } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';
import { AspirationBranch } from '../../models/attentes/aspiration-branch';
import { CompatibilityItem } from '../../models/attentes/compatibility-item';
import { EnvironmentCategory } from '../../models/attentes/environment-category';
import { FutureProject } from '../../models/attentes/future-project';
import { Scenario } from '../../models/attentes/scenario';
import { TerminalLine } from '../../models/attentes/terminal-line';
import { PrioritizationItem } from '../../models/attentes/prioritization-time';
import { DialogMessage } from '../../models/others/dialod-message';
import { ASPIRATIONBRANCHESDATA } from '../../database/attentes/aspirationBranches.data';
import { AVAILABLECOMMANDSDATA } from '../../database/attentes/availableCommands.data';
import { AVAILABLETOPICSDATA } from '../../database/attentes/availableTopics.data';
import { COMPATIBILITYITEMSDATA } from '../../database/attentes/compatibilityItems.data';
import { FUTUREPROJECTSDATA } from '../../database/attentes/futureProjects.data';
import { IDEALENVIRONMENTDATA } from '../../database/attentes/idealEnvironment.data';
import { PRIORITIZATIONITEMSDATA } from '../../database/attentes/prioritizationItems.data';
import { SCENARIOSDATA } from '../../database/attentes/scenarios.data';

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

  // Pour gérer la destruction proprement
  private destroy$ = new Subject<void>();

  // Gérer les timeouts
  private introDialogTimeoutId: number | null = null;
  private closeDialogTimeoutId: number | null = null;
  private commandExecutionTimeoutId: number | null = null;
  private terminalScrollTimeoutId: number | null = null;
  private aspirationsTimeoutId: number | null = null;
  private projectsTimeoutId: number | null = null;
  private environmentTimeoutId: number | null = null;
  private branchRevealTimeouts: number[] = [];

  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, nous avons besoin d'une projection des intentions futures du sujet. Utilisez le terminal prédictif pour accéder à ses aspirations professionnelles, projets et environnement idéal. Ces informations sont cruciales pour comprendre sa trajectoire de carrière.";

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

  // Ajouter ces propriétés à la classe AttentesComponent
  isQuizModalOpen: boolean = false;
  quizCompleted: boolean = false;
  quizPassed: boolean = false;
  quizScore: number = 0;

  // Types de quiz
  quizTypes: string[] = ['prioritization', 'scenarios', 'compatibility'];
  quizType: string = 'prioritization';
  quizIndex: number = 0;

  compatibilityRatings: number[] = [5, 5, 5, 5, 5];
  compatibilityCompleted: boolean = false;

  currentScenarioIndex: number = 0;
  selectedScenarioOption: number | null = null;
  scenarioAnswered: boolean = false;
  scenarioScores: boolean[] = [];

  prioritizationCompleted: boolean = false;

  //données

  // Commandes disponibles
  availableCommands: string[] = AVAILABLECOMMANDSDATA;

  // Sujets disponibles pour explorer
  availableTopics: string[] = AVAILABLETOPICSDATA;

  // Données des aspirations professionnelles
  aspirationBranches: AspirationBranch[] = ASPIRATIONBRANCHESDATA;

  // Projets futurs
  futureProjects: FutureProject[] = FUTUREPROJECTSDATA;

  // Environnement idéal
  idealEnvironment: EnvironmentCategory[] = IDEALENVIRONMENTDATA;

  // Données pour le quiz de priorisation
  prioritizationItems: PrioritizationItem[] = PRIORITIZATIONITEMSDATA;

  // Données pour le quiz de scénarios
  scenarios: Scenario[] = SCENARIOSDATA;

  // Données pour le quiz de compatibilité
  compatibilityItems: CompatibilityItem[] = COMPATIBILITYITEMSDATA;

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
      console.warn("Ce module n'est pas encore disponible");
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
        active: true,
      },
    ];

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
        this.isModuleCompleted = statuses.attentes;
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();

        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadUserResponses();
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
  }

  ngOnDestroy(): void {
    // Émettre le signal de destruction pour tous les observables
    this.destroy$.next();
    this.destroy$.complete();

    // Nettoyer tous les timeouts
    this.clearAllTimeouts();

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
      this.commandExecutionTimeoutId,
      this.terminalScrollTimeoutId,
      this.aspirationsTimeoutId,
      this.projectsTimeoutId,
      this.environmentTimeoutId,
    ];

    // Nettoyer chaque timeout non-null
    timeouts.forEach((timeoutId) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    });

    // Nettoyer les timeouts des animations de branches
    this.branchRevealTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.branchRevealTimeouts = [];
  }

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: '', // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective',
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText, () => {
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

  // Enregistrer les réponses utilisateur
  saveUserResponse(questionId: string, response: any): void {
    this.userDataService.saveResponse('attentes', questionId, response);
  }

  // Charger les réponses utilisateur précédentes
  loadUserResponses(): void {
    const responses = this.userDataService.getModuleResponses('attentes');

    if (responses.length > 0) {
      // Exemple pour précharger des aspirations révélées
      const aspirationsResponse = responses.find(
        (r) => r.questionId === 'aspirations'
      );
      if (
        aspirationsResponse &&
        typeof aspirationsResponse.response === 'boolean' &&
        aspirationsResponse.response === true
      ) {
        this.showAspirationsMap = true;
        this.revealAllBranches();
      }

      // Exemple pour précharger des projets révélés
      const projectsResponse = responses.find(
        (r) => r.questionId === 'projects'
      );
      if (
        projectsResponse &&
        typeof projectsResponse.response === 'boolean' &&
        projectsResponse.response === true
      ) {
        this.showFutureProjects = true;
      }

      // Exemple pour précharger l'environnement idéal
      const environmentResponse = responses.find(
        (r) => r.questionId === 'environment'
      );
      if (
        environmentResponse &&
        typeof environmentResponse.response === 'boolean' &&
        environmentResponse.response === true
      ) {
        this.showIdealProfile = true;
      }

      // Précharger la timeline sélectionnée
      const timelineResponse = responses.find(
        (r) => r.questionId === 'timeline'
      );
      if (
        timelineResponse &&
        (timelineResponse.response === 'short' ||
          timelineResponse.response === 'mid' ||
          timelineResponse.response === 'long')
      ) {
        this.selectedTimeline = timelineResponse.response as
          | 'short'
          | 'mid'
          | 'long';
      }
    }
  }

  // Marquer le module comme complété
  completeModule(): void {
    if (
      !this.isModuleCompleted &&
      this.showAspirationsMap &&
      this.showFutureProjects &&
      this.showIdealProfile
    ) {
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

    // Annuler tout timeout d'exécution de commande précédent
    if (this.commandExecutionTimeoutId !== null) {
      clearTimeout(this.commandExecutionTimeoutId);
    }

    // Simuler la saisie
    this.commandExecutionTimeoutId = window.setTimeout(() => {
      // Ajouter la commande au terminal
      this.terminalLines.push({
        type: 'input',
        text: this.currentInput,
        active: true,
      });

      // Réinitialiser l'input
      this.currentInput = '';

      // Traiter la commande
      this.processCommand(command);

      // Faire défiler jusqu'au bas du terminal
      if (this.terminalScrollTimeoutId !== null) {
        clearTimeout(this.terminalScrollTimeoutId);
      }

      this.terminalScrollTimeoutId = window.setTimeout(() => {
        if (this.terminalOutput && this.terminalOutput.nativeElement) {
          this.terminalOutput.nativeElement.scrollTop =
            this.terminalOutput.nativeElement.scrollHeight;
        }
        this.terminalScrollTimeoutId = null;
      }, 100);

      this.commandExecutionTimeoutId = null;
    }, 500);
  }
  // Traitement des commandes
  processCommand(command: string): void {
    switch (command) {
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
    if (
      this.showAspirationsMap &&
      this.showFutureProjects &&
      this.showIdealProfile
    ) {
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
      active: true,
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
      active: true,
    });

    this.showAspirations = true;

    // Annuler tout timeout précédent
    if (this.aspirationsTimeoutId !== null) {
      clearTimeout(this.aspirationsTimeoutId);
    }

    // Montrer la carte des aspirations
    this.aspirationsTimeoutId = window.setTimeout(() => {
      this.showAspirationsMap = true;
      // Enregistrer la réponse utilisateur
      this.saveUserResponse('aspirations', true);
      this.executingCommand = false;

      // Révéler progressivement les branches
      this.revealBranchesProgressively();
      this.aspirationsTimeoutId = null;
    }, 1500);
  }

  // Révéler progressivement les branches
  revealBranchesProgressively(): void {
    // Nettoyer les timeouts existants
    this.branchRevealTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.branchRevealTimeouts = [];

    this.aspirationBranches.forEach((branch, index) => {
      const branchTimeoutId = window.setTimeout(() => {
        branch.revealed = true;

        // Révéler les sous-branches avec délai
        branch.subBranches.forEach((subBranch, subIndex) => {
          const subBranchTimeoutId = window.setTimeout(() => {
            subBranch.revealed = true;
          }, 300 * subIndex);

          this.branchRevealTimeouts.push(subBranchTimeoutId);
        });
      }, 500 * index);

      this.branchRevealTimeouts.push(branchTimeoutId);
    });
  }

  // Révéler toutes les branches immédiatement
  revealAllBranches(): void {
    this.aspirationBranches.forEach((branch) => {
      branch.revealed = true;
      branch.subBranches.forEach((subBranch) => {
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
      active: true,
    });

    // Annuler tout timeout précédent
    if (this.projectsTimeoutId !== null) {
      clearTimeout(this.projectsTimeoutId);
    }

    // Montrer les projets futurs
    this.projectsTimeoutId = window.setTimeout(() => {
      this.showFutureProjects = true;
      // Enregistrer la réponse utilisateur
      this.saveUserResponse('projects', true);
      this.executingCommand = false;
      this.projectsTimeoutId = null;
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
      active: true,
    });

    // Annuler tout timeout précédent
    if (this.environmentTimeoutId !== null) {
      clearTimeout(this.environmentTimeoutId);
    }

    // Montrer le profil idéal
    this.environmentTimeoutId = window.setTimeout(() => {
      this.showIdealProfile = true;
      // Enregistrer la réponse utilisateur
      this.saveUserResponse('environment', true);
      this.executingCommand = false;
      this.environmentTimeoutId = null;
    }, 1500);
  }

  // Commande pour effacer le terminal (inchangée)
  clearCommand(): void {
    this.terminalLines = [
      {
        type: 'output',
        text: "Terminal effacé. Tapez 'help' pour voir les commandes disponibles.",
        active: true,
      },
    ];
    this.executingCommand = false;
  }

  // Commande pour explorer un sujet spécifique
  exploreTopicCommand(topic: string): void {
    let outputText = '';

    switch (topic) {
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
      active: true,
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
      active: true,
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
    return this.futureProjects.filter(
      (project) => project.timeline === this.selectedTimeline
    );
  }

  // Obtenir le libellé d'une timeline
  getTimelineLabel(timeline: string): string {
    switch (timeline) {
      case 'short':
        return 'Court terme (0-1 an)';
      case 'mid':
        return 'Moyen terme (1-3 ans)';
      case 'long':
        return 'Long terme (3-5 ans)';
      default:
        return '';
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
    const angleDegrees = 270 + index * (360 / total);
    return `${angleDegrees}deg`;
  }

  // Calculer l'angle pour positionner une sous-branche
  getSubNodeAngle(index: number, total: number): string {
    if (total <= 1) return '0deg';
    // Répartir les sous-branches sur un arc de 120 degrés (-60 à +60)
    const angleDegrees = -60 + index * (120 / (total - 1));
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

    moveItemInArray(
      this.prioritizationItems,
      event.previousIndex,
      event.currentIndex
    );
  }

  // Valider la priorisation
  validatePrioritization(): void {
    this.prioritizationCompleted = true;

    // Sauvegarder l'ordre de priorisation
    this.saveUserResponse(
      'prioritization_order',
      this.prioritizationItems.map((item) => item.id)
    );
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
    const isCorrect =
      this.selectedScenarioOption === this.currentScenario.correctOption;
    this.scenarioScores.push(isCorrect);

    // Sauvegarder la réponse
    this.saveUserResponse(`scenario_${this.currentScenarioIndex}`, {
      selected: this.selectedScenarioOption,
      correct: isCorrect,
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
    const normalizedPrioritizationScore =
      (prioritizationScore / this.prioritizationItems.length) * 40;

    // Calculer le score des scénarios (40% du score total)
    const scenarioScore =
      (this.scenarioScores.filter((s) => s).length / this.scenarios.length) *
      40;

    // Calculer le score de compatibilité (20% du score total)
    let compatibilityScore = 0;
    this.compatibilityItems.forEach((item, index) => {
      const difference = Math.abs(
        this.compatibilityRatings[index] - item.correctRating
      );
      if (difference <= 1) compatibilityScore += 1; // Très proche
      else if (difference <= 2) compatibilityScore += 0.75; // Assez proche
      else if (difference <= 3) compatibilityScore += 0.5; // Différence modérée
      else compatibilityScore += 0.25; // Différence importante
    });
    const normalizedCompatibilityScore =
      (compatibilityScore / this.compatibilityItems.length) * 20;

    // Score final
    this.quizScore = Math.round(
      normalizedPrioritizationScore +
        scenarioScore +
        normalizedCompatibilityScore
    );

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
