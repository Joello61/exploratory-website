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
import { ProgressService } from '../../services/progress.service';
import { UserDataService } from '../../services/user-data.service';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { JobExperience } from '../../models/experiences/job-experience';
import { DialogMessage } from '../../models/others/dialod-message';
import { MatchingJobs } from '../../models/experiences/matching-jobs';
import { ChronologyJobs } from '../../models/experiences/chronology-jobs';
import { OriginalChronology } from '../../models/experiences/original-chronology';
import { JOBSDATA } from '../../database/experiences/jobs.data';
import { MATCHINGSKILLSDATA } from '../../database/experiences/matchingSkills.data';
import { MATCHINGJOBSDATA } from '../../database/experiences/matchingJobs.data';

@Component({
    selector: 'app-experience-pro',
    imports: [CommonModule, DragDropModule],
    standalone: true,
    templateUrl: './experience-pro.component.html',
    styleUrls: ['./experience-pro.component.css']
})
export class ExperienceProComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Pour gérer la destruction du composant
  private destroy$ = new Subject<void>();

  // Gérer les timeouts
  private introDialogTimeoutId: number | null = null;
  private closeDialogTimeoutId: number | null = null;
  private folderAnimationTimeoutId: number | null = null;
  private folderAnimationCleanupTimeoutId: number | null = null;
  private showDescriptionTimeoutId: number | null = null;
  private showStampTimeoutId: number | null = null;
  private clueDiscoveryTimeoutId: number | null = null;
  private incorrectMatchTimeoutId: number | null = null;
  private quizTransitionTimeoutId: number | null = null;

  // Texte du dialogue d'introduction
  private fullText: string =
    'Agent, approfondissons notre enquête. Le suspect a un parcours professionnel intéressant. Examinez ces dossiers confidentiels pour découvrir ses compétences, réalisations et contacts. Chaque indice compte pour établir son profil complet.';

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Données de progression et de temps
  isModuleCompleted: boolean = false;
  moduleProgressPercentage: number = 0;

  // État des jobs
  selectedJobIndex: number = 0;
  isDescriptionRevealed: boolean = false;
  isStampRevealed: boolean = false;
  discoveredClues: boolean[][] = [];
  jobCompletionStatus: number[] = [];

  // Propriétés pour le quiz modal
  isQuizModalOpen: boolean = false;
  quizCompleted: boolean = false;
  quizPassed: boolean = false;
  quizScore: number = 0;

  // Types de quiz disponibles
  quizTypes: string[] = ['matching', 'chronology'];
  quizType: string = 'matching';
  quizIndex: number = 0;

  selectedSkillIndex: number | null = null;
  selectedJobMatchIndex: number | null = null;
  skillMatched: boolean[] = [];
  jobMatched: boolean[] = [];
  skillToJobMapping: number[] = [];
  incorrectMatch: number | null = null;

  // Données pour le quiz de chronologie
  chronologyJobs: ChronologyJobs[] = [];
  originalChronology: OriginalChronology[] = [];
  chronologyChecked: boolean = false;
  isChronologyCorrect: boolean = false;

  //données

  // Données des expériences professionnelles
  jobs: JobExperience[] = JOBSDATA;

  // Données pour le quiz de matching (compétences/jobs)
  matchingSkills: string[] = MATCHINGSKILLSDATA;

  matchingJobs: MatchingJobs[] = MATCHINGJOBSDATA;

  constructor(
    private progressService: ProgressService,
    private router: Router,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('experience')) {
      console.warn("Ce module n'est pas encore disponible");
    }

    // Vérifier si le module est déjà complété avec takeUntil
    this.progressService.moduleStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statuses) => {
        this.isModuleCompleted = statuses.experience;
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();

        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadSavedState();
        } else {
          this.initializeExperienceData();
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
    // Utiliser le DialogService au lieu du typewriter manuel
    this.introDialogTimeoutId = window.setTimeout(() => {
      this.showIntroDialog();
      this.introDialogTimeoutId = null;
    }, 500);

    // Animation pour l'apparition progressive des éléments
    setTimeout(() => {
      const tabs = document.querySelectorAll('.folder-tab');
      tabs.forEach((tab, index) => {
        setTimeout(() => {
          tab.classList.add('appear');
        }, 150 * index);
      });
    }, 300);
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
    // Liste de tous les timeouts à nettoyer
    const timeouts = [
      this.introDialogTimeoutId,
      this.closeDialogTimeoutId,
      this.folderAnimationTimeoutId,
      this.folderAnimationCleanupTimeoutId,
      this.showDescriptionTimeoutId,
      this.showStampTimeoutId,
      this.clueDiscoveryTimeoutId,
      this.incorrectMatchTimeoutId,
      this.quizTransitionTimeoutId,
    ];

    // Nettoyer chaque timeout non-null
    timeouts.forEach((timeoutId) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    });
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

  // Charger l'état sauvegardé précédemment
  loadSavedState(): void {
    // Initialiser les structures de données
    this.initializeExperienceData();

    const responses = this.userDataService.getModuleResponses('experience');

    if (responses.length > 0) {
      // Charger l'index du job sélectionné
      const selectedJobResponse = responses.find(
        (r) => r.questionId === 'selected_job_index'
      );
      if (
        selectedJobResponse &&
        typeof selectedJobResponse.response === 'number'
      ) {
        this.selectedJobIndex = selectedJobResponse.response;
      }

      // Charger les indices découverts
      for (let jobIndex = 0; jobIndex < this.jobs.length; jobIndex++) {
        const cluesResponse = responses.find(
          (r) => r.questionId === `job_${jobIndex}_clues`
        );
        if (cluesResponse && Array.isArray(cluesResponse.response)) {
          // Conversion appropriée via unknown
          this.discoveredClues[jobIndex] = (
            cluesResponse.response as unknown[]
          ).map((val) => Boolean(val));
        }
      }

      // Charger les statuts de complétion
      const completionResponse = responses.find(
        (r) => r.questionId === 'job_completion_status'
      );
      if (completionResponse && Array.isArray(completionResponse.response)) {
        // Conversion appropriée via unknown
        this.jobCompletionStatus = (
          completionResponse.response as unknown[]
        ).map((val) => Number(val));
      }

      // Mettre à jour les états d'interface
      this.updateInterfaceStates();
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder l'index du job sélectionné
    this.userDataService.saveResponse(
      'experience',
      'selected_job_index',
      this.selectedJobIndex
    );

    // Sauvegarder les indices découverts pour chaque job
    for (let jobIndex = 0; jobIndex < this.jobs.length; jobIndex++) {
      // Convertir le tableau de booléens en tableau de chaînes "true"/"false"
      const cluesStringArray = this.discoveredClues[jobIndex].map((value) =>
        String(value)
      );
      this.userDataService.saveResponse(
        'experience',
        `job_${jobIndex}_clues`,
        cluesStringArray
      );
    }

    // Sauvegarder les statuts de complétion
    // Convertir le tableau de nombres en tableau de chaînes
    const completionStringArray = this.jobCompletionStatus.map((value) =>
      String(value)
    );
    this.userDataService.saveResponse(
      'experience',
      'job_completion_status',
      completionStringArray
    );

    // Vérifier si le module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si les conditions de complétion du module sont remplies
  checkModuleCompletion(): void {
    // Calculer le pourcentage global de complétion des jobs
    const totalJobs = this.jobs.length;
    const completedJobs = this.jobCompletionStatus.filter(
      (status) => status === 100
    ).length;

    // Si au moins 75% des jobs sont complètement explorés
    const completionThreshold = Math.ceil(totalJobs * 0.75);

    if (completedJobs >= completionThreshold && !this.isModuleCompleted) {
      this.completeModule();
    }
  }

  // Marquer le module comme complété
  completeModule(): void {
    this.progressService.completeModule('experience');
    this.isModuleCompleted = true;

    // Ajouter une note automatique pour résumer ce qui a été fait
    this.addCompletionNote();
  }

  // Ajouter une note récapitulative automatique
  addCompletionNote(): void {
    // Récupérer les compétences découvertes dans tous les jobs
    const allDiscoveredSkills = this.getAllDiscoveredSkills();

    // Récupérer les jobs où tous les indices ont été découverts
    const completedJobs = this.jobs
      .filter((_, index) => this.jobCompletionStatus[index] === 100)
      .map((job) => job.title);

    const noteContent = `
Module "Expérience Professionnelle" complété le ${new Date().toLocaleDateString()}.
Expériences explorées: ${completedJobs.join(', ')}.
Compétences principales identifiées: ${allDiscoveredSkills
      .slice(0, 5)
      .join(', ')}.
Réalisations notables: ${this.getCompletedAchievements().join(', ')}.
    `;

    this.noteService.addNote(noteContent.trim());
  }

  // Obtenir toutes les compétences découvertes
  getAllDiscoveredSkills(): string[] {
    const skills: string[] = [];

    this.jobs.forEach((job, jobIndex) => {
      job.clues.forEach((clue, clueIndex) => {
        if (this.discoveredClues[jobIndex][clueIndex]) {
          skills.push(clue.skill);
        }
      });
    });

    return [...new Set(skills)]; // Supprimer les doublons
  }

  // Obtenir les achievements des jobs complètement explorés
  getCompletedAchievements(): string[] {
    return this.jobs
      .filter((_, index) => this.jobCompletionStatus[index] === 100)
      .map((job) => job.achievement);
  }

  initializeExperienceData(): void {
    // Initialiser le tableau de statut pour chaque job
    this.jobCompletionStatus = new Array(this.jobs.length).fill(0);

    // Initialiser le tableau pour les indices découverts
    this.discoveredClues = this.jobs.map((job) =>
      new Array(job.clues.length).fill(false)
    );

    // Sélectionner le premier job par défaut
    this.selectedJob = this.jobs[this.selectedJobIndex];
  }

  // Mettre à jour les états d'interface en fonction des données chargées
  updateInterfaceStates(): void {
    // Sélectionner le job actif
    this.selectJob(this.selectedJobIndex);

    // Mettre à jour les états d'interface pour tous les jobs
    for (let i = 0; i < this.jobs.length; i++) {
      const completionRate = this.jobCompletionStatus[i];

      if (i === this.selectedJobIndex) {
        this.isDescriptionRevealed = completionRate > 20;
        this.isStampRevealed = completionRate === 100;
      }
    }
  }

  // Propriété pour le job actuellement sélectionné
  get selectedJob(): JobExperience | null {
    return this.jobs[this.selectedJobIndex] || null;
  }

  set selectedJob(job: JobExperience | null) {
    if (!job) return;

    const index = this.jobs.findIndex((j) => j.title === job.title);
    if (index >= 0) {
      this.selectedJobIndex = index;
    }
  }

  // Sélection d'un job
  selectJob(index: number): void {
    if (index < 0 || index >= this.jobs.length) return;

    this.selectedJobIndex = index;
    this.isDescriptionRevealed = this.jobCompletionStatus[index] > 20;
    this.isStampRevealed = this.jobCompletionStatus[index] === 100;

    // Sauvegarder la sélection
    this.userDataService.saveResponse(
      'experience',
      'selected_job_index',
      index
    );

    // Animation pour le changement de dossier
    // Nettoyer les timeouts précédents si existants
    if (this.folderAnimationTimeoutId !== null) {
      clearTimeout(this.folderAnimationTimeoutId);
    }
    if (this.folderAnimationCleanupTimeoutId !== null) {
      clearTimeout(this.folderAnimationCleanupTimeoutId);
    }

    this.folderAnimationTimeoutId = window.setTimeout(() => {
      const folderContent = document.querySelector('.folder-content');
      if (folderContent) {
        folderContent.classList.add('folder-change-animation');

        this.folderAnimationCleanupTimeoutId = window.setTimeout(() => {
          folderContent.classList.remove('folder-change-animation');
          this.folderAnimationCleanupTimeoutId = null;
        }, 500);
      }
      this.folderAnimationTimeoutId = null;
    }, 10);
  }

  // Révélation d'un indice
  revealClue(clueIndex: number): void {
    if (clueIndex < 0 || !this.selectedJob) return;

    // Marquer l'indice comme découvert
    if (!this.discoveredClues[this.selectedJobIndex][clueIndex]) {
      this.discoveredClues[this.selectedJobIndex][clueIndex] = true;

      // Animation pour la découverte
      this.clueDiscoveryTimeoutId = window.setTimeout(() => {
        const clueElements = document.querySelectorAll('.evidence-item');
        if (clueElements && clueElements.length > clueIndex) {
          clueElements[clueIndex].classList.add('discovered');
        }
        this.clueDiscoveryTimeoutId = null;
      }, 100);

      // Mettre à jour le pourcentage de complétion
      this.updateCompletionStatus();

      // Révéler la description après quelques indices
      if (this.getDiscoveredClueCount() >= 2 && !this.isDescriptionRevealed) {
        this.showDescriptionTimeoutId = window.setTimeout(() => {
          this.isDescriptionRevealed = true;
          this.showDescriptionTimeoutId = null;
        }, 500);
      }

      // Révéler le tampon quand tout est découvert
      if (this.jobCompletionStatus[this.selectedJobIndex] === 100) {
        this.showStampTimeoutId = window.setTimeout(() => {
          this.isStampRevealed = true;
          this.showStampTimeoutId = null;
        }, 1000);
      }

      // Sauvegarder l'état
      this.saveState();
    }
  }

  // Compter les indices découverts pour le job actuel
  getDiscoveredClueCount(): number {
    return (
      this.discoveredClues[this.selectedJobIndex]?.filter(Boolean).length || 0
    );
  }

  // Obtenir les compétences découvertes pour le job actuel
  getDiscoveredSkills(): string[] {
    if (!this.selectedJob) return [];

    return this.selectedJob.clues
      .filter((_, index) => this.discoveredClues[this.selectedJobIndex][index])
      .map((clue) => clue.skill);
  }

  // Mettre à jour le pourcentage de complétion
  updateCompletionStatus(): void {
    if (!this.selectedJob) return;

    const totalClues = this.selectedJob.clues.length;
    const discoveredCount = this.getDiscoveredClueCount();

    // Calculer le pourcentage (arrondi à la dizaine la plus proche)
    const percentage =
      Math.round(((discoveredCount / totalClues) * 100) / 10) * 10;
    this.jobCompletionStatus[this.selectedJobIndex] = percentage;

    // Sauvegarder les statuts de complétion
    // Convertir le tableau de nombres en tableau de chaînes
    const completionStringArray = this.jobCompletionStatus.map((value) =>
      String(value)
    );
    this.userDataService.saveResponse(
      'experience',
      'job_completion_status',
      completionStringArray
    );

    // Vérifier si module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si tous les dossiers sont complétés (déclassifiés)
  areAllFilesCompleted(): boolean {
    // Considérer qu'au moins 3 des 4 dossiers doivent être complets (100%)
    const completedFilesCount = this.jobCompletionStatus.filter(
      (status) => status === 100
    ).length;
    return completedFilesCount >= 3;
  }

  // Ouvrir le modal du quiz
  openQuizModal(): void {
    // Réinitialiser le quiz
    this.quizCompleted = false;
    this.quizPassed = false;
    this.quizIndex = 0;
    this.quizType = this.quizTypes[0];
    this.quizScore = 0;

    // Initialiser les données du quiz de matching
    this.initializeMatchingQuiz();

    // Initialiser les données du quiz de chronologie
    this.initializeChronologyQuiz();

    // Ouvrir la modal
    this.isQuizModalOpen = true;
  }

  // Fermer le modal du quiz
  closeQuizModal(): void {
    this.isQuizModalOpen = false;
  }

  // Initialiser le quiz de matching
  initializeMatchingQuiz(): void {
    this.selectedSkillIndex = null;
    this.selectedJobMatchIndex = null;
    this.skillMatched = new Array(this.matchingSkills.length).fill(false);
    this.jobMatched = new Array(this.matchingJobs.length).fill(false);
    this.skillToJobMapping = new Array(this.matchingSkills.length).fill(-1);
    this.incorrectMatch = null;
  }

  // Initialiser le quiz de chronologie
  initializeChronologyQuiz(): void {
    // Créer les objets pour le quiz de chronologie
    this.originalChronology = [
      {
        title: 'Stagiaire Développeur Web',
        company: 'Megasoft Sarl',
        order: 0,
      },
      {
        title: 'Stagiaire Consultant Informatique',
        company: 'SKOOVEL Sarl',
        order: 1,
      },
      {
        title: 'Alternant Développeur Fullstack',
        company: 'ANG Tech',
        order: 2,
      },
      {
        title: 'Futur Développeur Fullstack Senior',
        company: 'À déterminer',
        order: 3,
      },
    ];

    // Copier et mélanger le tableau
    this.chronologyJobs = [...this.originalChronology];
    this.shuffleArray(this.chronologyJobs);

    this.chronologyChecked = false;
    this.isChronologyCorrect = false;
  }

  // Mélanger un tableau (algorithme de Fisher-Yates)
  shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Sélectionner une compétence
  selectSkill(index: number): void {
    if (this.skillMatched[index]) return;
    this.selectedSkillIndex = index;
    this.incorrectMatch = null;

    // Si un job est déjà sélectionné, vérifier automatiquement l'association
    if (this.selectedJobMatchIndex !== null) {
      this.checkMatch();
    }
  }

  // Sélectionner un job
  selectJobMatch(index: number): void {
    if (this.jobMatched[index]) return;
    this.selectedJobMatchIndex = index;
    this.incorrectMatch = null;

    // Si une compétence est déjà sélectionnée, vérifier automatiquement l'association
    if (this.selectedSkillIndex !== null) {
      this.checkMatch();
    }
  }

  // Vérifier si l'association compétence-job est correcte
  checkMatch(): void {
    if (this.selectedSkillIndex === null || this.selectedJobMatchIndex === null)
      return;

    const skill = this.selectedSkillIndex;
    const job = this.selectedJobMatchIndex;

    // Vérifier si cette compétence est associée à ce job
    const isCorrect =
      this.matchingJobs[job].correctSkillIndices.includes(skill);

    if (isCorrect) {
      // Marquer comme associé
      this.skillMatched[skill] = true;
      this.skillToJobMapping[skill] = job;

      // Vérifier si toutes les compétences pour ce job sont associées
      const allJobSkillsMatched = this.matchingJobs[
        job
      ].correctSkillIndices.every(
        (skillIndex) => this.skillMatched[skillIndex]
      );

      if (allJobSkillsMatched) {
        this.jobMatched[job] = true;
      }

      // Réinitialiser la sélection
      this.selectedSkillIndex = null;
      this.selectedJobMatchIndex = null;

      // Vérifier si toutes les associations sont faites
      if (this.allSkillsMatched()) {
        // Nettoyer le timeout précédent si existant
        if (this.quizTransitionTimeoutId !== null) {
          clearTimeout(this.quizTransitionTimeoutId);
        }

        this.quizTransitionTimeoutId = window.setTimeout(() => {
          this.goToNextQuiz();
          this.quizTransitionTimeoutId = null;
        }, 1000);
      }
    } else {
      // Indiquer une erreur
      this.incorrectMatch = job;

      // Nettoyer le timeout précédent si existant
      if (this.incorrectMatchTimeoutId !== null) {
        clearTimeout(this.incorrectMatchTimeoutId);
      }

      this.incorrectMatchTimeoutId = window.setTimeout(() => {
        this.incorrectMatch = null;
        this.selectedSkillIndex = null;
        this.selectedJobMatchIndex = null;
        this.incorrectMatchTimeoutId = null;
      }, 800); // Délai plus court pour une meilleure expérience utilisateur
    }
  }

  // Vérifier si toutes les compétences sont associées
  allSkillsMatched(): boolean {
    return this.skillMatched.every((matched) => matched);
  }

  // Obtenir le nombre d'associations correctes
  getCorrectMatchesCount(): number {
    return this.skillMatched.filter((matched) => matched).length;
  }

  // Gérer le drop dans le quiz de chronologie
  dropJob(event: CdkDragDrop<any[]>): void {
    if (this.chronologyChecked) return;

    moveItemInArray(
      this.chronologyJobs,
      event.previousIndex,
      event.currentIndex
    );
    this.chronologyChecked = false;
  }

  // Vérifier si un job est à la bonne position dans la chronologie
  isJobInCorrectPosition(index: number): boolean {
    if (!this.chronologyChecked) return false;
    return this.chronologyJobs[index].order === index;
  }

  // Vérifier l'ordre chronologique
  checkChronologyOrder(): void {
    this.chronologyChecked = true;

    // Vérifier si l'ordre est correct
    this.isChronologyCorrect = this.chronologyJobs.every(
      (job, index) => job.order === index
    );

    if (this.isChronologyCorrect) {
      // Nettoyer le timeout précédent si existant
      if (this.quizTransitionTimeoutId !== null) {
        clearTimeout(this.quizTransitionTimeoutId);
      }

      this.quizTransitionTimeoutId = window.setTimeout(() => {
        this.goToNextQuiz();
        this.quizTransitionTimeoutId = null;
      }, 1000);
    }
  }

  // Réinitialiser le quiz de chronologie
  resetChronology(): void {
    this.chronologyChecked = false;
    this.shuffleArray(this.chronologyJobs);
  }

  // Passer au quiz suivant ou terminer
  goToNextQuiz(): void {
    if (this.quizIndex < this.quizTypes.length - 1) {
      this.quizIndex++;
      this.quizType = this.quizTypes[this.quizIndex];

      // Réinitialiser le quiz actuel
      if (this.quizType === 'matching') {
        this.initializeMatchingQuiz();
      } else if (this.quizType === 'chronology') {
        this.initializeChronologyQuiz();
      }
    } else {
      // Calculer le score final
      this.completeQuiz();
    }
  }

  // Terminer le quiz et calculer le score
  completeQuiz(): void {
    this.quizCompleted = true;

    // Calculer le score en pourcentage
    // 70% pour le matching, 30% pour la chronologie
    const matchingScore =
      (this.getCorrectMatchesCount() / this.matchingSkills.length) * 70;
    const chronologyScore = this.isChronologyCorrect ? 30 : 0;

    this.quizScore = Math.round(matchingScore + chronologyScore);

    // Le quiz est réussi si le score est supérieur à 70%
    this.quizPassed = this.quizScore >= 70;

    // Si le quiz est réussi, sauvegarder la progression
    if (this.quizPassed) {
      this.saveQuizResults();
    }
  }

  // Sauvegarder les résultats du quiz
  saveQuizResults(): void {
    // Sauvegarder les résultats du quiz
    this.userDataService.saveResponse('experience', 'quiz_completed', true);
    this.userDataService.saveResponse(
      'experience',
      'quiz_score',
      this.quizScore
    );

    // Si ce n'est pas déjà fait, compléter le module
    if (!this.isModuleCompleted) {
      this.completeModule();
    }
  }

  // Recommencer le quiz
  restartQuiz(): void {
    this.quizIndex = 0;
    this.quizType = this.quizTypes[0];
    this.quizCompleted = false;

    // Réinitialiser le quiz actuel
    if (this.quizType === 'matching') {
      this.initializeMatchingQuiz();
    } else if (this.quizType === 'chronology') {
      this.initializeChronologyQuiz();
    }
  }

  // Naviguer vers la page suivante
  navigateToNextPage(): void {
    this.closeQuizModal();
    this.router.navigate(['/attentes']);
  }
}
