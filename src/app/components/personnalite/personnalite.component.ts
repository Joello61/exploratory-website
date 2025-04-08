import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { UserDataService } from '../../services/user-data.service';
import { Router } from '@angular/router';
import { Scenario } from '../../models/personnalite/scenario';
import { QuizQuestion } from '../../models/personnalite/quiz-question';
import { MotivationFactor } from '../../models/personnalite/motivation-factor';
import { CollaborationAspect } from '../../models/personnalite/collaboration-aspect';
import { CoreValue } from '../../models/personnalite/core-value';
import { PersonalityTrait } from '../../models/personnalite/personality-trait';
import { TabInfo } from '../../models/personnalite/tab-info';
import { WorkPreference } from '../../models/personnalite/work-preference';
import { WorkProcess } from '../../models/personnalite/work-process';
import { DialogMessage } from '../../models/others/dialod-message';
import { PROFILETABSDATA } from '../../database/personnalite/profileTabs.data';
import { SCENARIOSDATA } from '../../database/personnalite/scenarios.data';
import { QUIZQUESTIONSDATA } from '../../database/personnalite/quizQuestions.data';
import { PERSONALITYTRAITSDATA } from '../../database/personnalite/personalityTraits.data';
import { COLLABORATIONASPECTSDATA } from '../../database/personnalite/collaborationAspects.data';
import { WORKPROCESSESDATA } from '../../database/personnalite/workProcesses.data';
import { MOTIVATIONFACTORSDATA } from '../../database/personnalite/motivationFactors.data';
import { COREVALUESDATA } from '../../database/personnalite/coreValues.data';
import { WORKPREFERENCESDATA } from '../../database/personnalite/workPreferences.data';

@Component({
    selector: 'app-personnalite',
    imports: [CommonModule, FormsModule],
    standalone: true,
    templateUrl: './personnalite.component.html',
    styleUrls: ['./personnalite.component.css']
})
export class PersonnaliteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Pour gérer la destruction proprement
  private destroy$ = new Subject<void>();

  // Gérer les timeouts
  private introDialogTimeoutId: number | null = null;
  private closeDialogTimeoutId: number | null = null;
  private quizEnableTimeoutId: number | null = null;
  private navigationTimeoutId: number | null = null;

  // Identifiant du module
  private readonly MODULE_ID = 'personnalite';

  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, votre mission aujourd'hui est de découvrir mon profil psychologique. En explorant les différentes situations et indices, vous révélerez progressivement mes traits de personnalité, mon style de travail et mes motivations principales. Cette analyse est essentielle pour comprendre ma compatibilité avec votre équipe.";

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

  isUpdatingInsights: boolean = false;

  // État de l'investigation
  investigationProgress: number = 0;
  maxInvestigationProgress: number = 100;
  insightsDiscovered: number = 0;
  totalInsights: number = 18;
  currentScenarioIndex: number = 0;
  selectedResponse: number | null = null;

  // Scores des traits - à révéler progressivement
  traitScores = {
    extroversion: 7,
    agreeableness: 8,
    conscientiousness: 9,
    openness: 8,
  };

  // Visibilité des traits
  traitVisibility = {
    extroversion: false,
    agreeableness: false,
    conscientiousness: false,
    openness: false,
  };

  maxTraitScore: number = 10;
  // Onglets du dossier
  activeTab: string = 'investigation';

  //données

  profileTabs: TabInfo[] = PROFILETABSDATA;

  // Scenarios d'investigation
  scenarios: Scenario[] = SCENARIOSDATA;

  // Questions du quiz final
  quizQuestions: QuizQuestion[] = QUIZQUESTIONSDATA;

  // Données de personnalité
  personalityTraits: PersonalityTrait[] = PERSONALITYTRAITSDATA;

  // Aspects de collaboration
  collaborationAspects: CollaborationAspect[] = COLLABORATIONASPECTSDATA;

  // Processus de travail
  workProcesses: WorkProcess[] = WORKPROCESSESDATA;

  // Facteurs de motivation
  motivationFactors: MotivationFactor[] = MOTIVATIONFACTORSDATA;

  // Valeurs professionnelles
  coreValues: CoreValue[] = COREVALUESDATA;

  // Préférences professionnelles
  workPreferences: WorkPreference[] = WORKPREFERENCESDATA;

  constructor(
    private progressService: ProgressService,
    private userDataService: UserDataService,
    public dialogService: DialogService,
    public noteService: NoteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Charger les progrès précédents
    this.loadUserProgress();

    if (this.investigationProgress >= 70) {
      this.enableFinalQuiz();
    }

    // Souscrire au dialogue avec takeUntil
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
    // Afficher le dialogue d'introduction avec un timeout géré
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
      this.quizEnableTimeoutId,
      this.navigationTimeoutId,
    ];

    timeouts.forEach((timeoutId) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    });
  }

  // Charger les progrès précédents
  loadUserProgress(): void {
    // Vérifier les découvertes précédentes
    const progressResponse = this.userDataService.getResponse(
      this.MODULE_ID,
      'investigation_progress'
    );
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
    this.personalityTraits.forEach((trait) => {
      const traitResponse = this.userDataService.getResponse(
        this.MODULE_ID,
        `trait_${trait.id}`
      );
      if (traitResponse) {
        trait.discovered = traitResponse.response as boolean;
        this.traitVisibility[trait.id as keyof typeof this.traitVisibility] =
          trait.discovered;
      }
    });

    // Aspects de collaboration
    this.collaborationAspects.forEach((aspect, index) => {
      const aspectResponse = this.userDataService.getResponse(
        this.MODULE_ID,
        `collaboration_${index}`
      );
      if (aspectResponse) {
        aspect.discovered = aspectResponse.response as boolean;
      }
    });

    // Processus de travail
    this.workProcesses.forEach((process, index) => {
      const processResponse = this.userDataService.getResponse(
        this.MODULE_ID,
        `process_${index}`
      );
      if (processResponse) {
        process.discovered = processResponse.response as boolean;
      }
    });

    // Facteurs de motivation
    this.motivationFactors.forEach((factor, index) => {
      const factorResponse = this.userDataService.getResponse(
        this.MODULE_ID,
        `motivation_${index}`
      );
      if (factorResponse) {
        factor.discovered = factorResponse.response as boolean;
      }
    });

    // Valeurs
    this.coreValues.forEach((value, index) => {
      const valueResponse = this.userDataService.getResponse(
        this.MODULE_ID,
        `value_${index}`
      );
      if (valueResponse) {
        value.discovered = valueResponse.response as boolean;
      }
    });

    // Préférences
    this.workPreferences.forEach((pref, index) => {
      const prefResponse = this.userDataService.getResponse(
        this.MODULE_ID,
        `preference_${index}`
      );
      if (prefResponse) {
        pref.discovered = prefResponse.response as boolean;
      }
    });

    // Recalculer le nombre d'insights découverts
    this.updateInsightsDiscovered();
  }

  // Mettre à jour le nombre d'insights découverts - version améliorée

  updateInsightsDiscovered(): void {
    // Éviter la récursion
    if (this.isUpdatingInsights) {
      return;
    }

    this.isUpdatingInsights = true;

    let count = 0;

    // Compter tous les éléments découverts
    this.personalityTraits.forEach((trait) => {
      if (trait.discovered) count++;
    });

    this.collaborationAspects.forEach((aspect) => {
      if (aspect.discovered) count++;
    });

    this.workProcesses.forEach((process) => {
      if (process.discovered) count++;
    });

    this.motivationFactors.forEach((factor) => {
      if (factor.discovered) count++;
    });

    this.coreValues.forEach((value) => {
      if (value.discovered) count++;
    });

    this.workPreferences.forEach((pref) => {
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

    // Vérifier si le quiz peut être activé (à 70% de progression)
    if (this.investigationProgress >= 70 && !this.isQuizAvailable()) {
      this.enableFinalQuiz();
      this.showQuizAvailableMessage();
    }

    this.isUpdatingInsights = false;
  }

  // Version alternative plus simple pour éviter les boucles
  updateInsightsCount(): void {
    let count = 0;

    // Compter tous les éléments découverts
    this.personalityTraits.forEach((trait) => {
      if (trait.discovered) count++;
    });

    this.collaborationAspects.forEach((aspect) => {
      if (aspect.discovered) count++;
    });

    this.workProcesses.forEach((process) => {
      if (process.discovered) count++;
    });

    this.motivationFactors.forEach((factor) => {
      if (factor.discovered) count++;
    });

    this.coreValues.forEach((value) => {
      if (value.discovered) count++;
    });

    this.workPreferences.forEach((pref) => {
      if (pref.discovered) count++;
    });

    this.insightsDiscovered = count;

    // Mettre à jour la progression globale sans déclencher d'autres actions
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

    // Activer le quiz si nécessaire
    if (this.investigationProgress >= 70) {
      this.enableFinalQuiz();
    }
  }

  // Ajouter cette méthode pour notifier l'utilisateur
  showQuizAvailableMessage(): void {
    const message =
      "Vous avez découvert suffisamment d'insights pour tenter l'évaluation finale. Celle-ci est maintenant disponible dans la section d'investigation.";

    const dialogMessage: DialogMessage = {
      text: message,
      character: 'detective',
    };

    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(message);
  }

  // Révéler tous les traits
  revealAllTraits(): void {
    this.personalityTraits.forEach((trait) => {
      trait.discovered = true;
      this.traitVisibility[trait.id as keyof typeof this.traitVisibility] =
        true;

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
      this.userDataService.saveResponse(this.MODULE_ID, `value_${index}`, true);
    });

    this.workPreferences.forEach((pref, index) => {
      pref.discovered = true;
      this.userDataService.saveResponse(
        this.MODULE_ID,
        `preference_${index}`,
        true
      );
    });

    // Mettre à jour les insights découverts sans créer de boucle
    if (!this.isUpdatingInsights) {
      this.updateInsightsCount();
    }
  }

  // Afficher le dialogue d'introduction
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

  // Changement d'onglet
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  // Accéder au scénario actuel
  get currentScenario(): Scenario | null {
    if (
      this.currentScenarioIndex < 0 ||
      this.currentScenarioIndex >= this.scenarios.length
    ) {
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
      character: 'detective',
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(response.outcome, () => {
      setTimeout(() => {
        this.closeDialogTypeWriter();
      }, 3000);
    });

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

    insightIds.forEach((id) => {
      // Traits de personnalité
      if (
        id === 'extroversion' ||
        id === 'agreeableness' ||
        id === 'conscientiousness' ||
        id === 'openness'
      ) {
        const trait = this.personalityTraits.find((t) => t.id === id);
        if (trait) {
          trait.discovered = true;
          this.traitVisibility[id as keyof typeof this.traitVisibility] = true;
          this.userDataService.saveResponse(
            this.MODULE_ID,
            `trait_${id}`,
            true
          );
        }
      }
      // Aspects de collaboration
      else if (id.startsWith('collaboration')) {
        const index = parseInt(id.replace('collaboration', '')) - 1;
        if (index >= 0 && index < this.collaborationAspects.length) {
          this.collaborationAspects[index].discovered = true;
          this.userDataService.saveResponse(
            this.MODULE_ID,
            `collaboration_${index}`,
            true
          );
        }
      }
      // Processus de travail
      else if (id.startsWith('process')) {
        const index = parseInt(id.replace('process', '')) - 1;
        if (index >= 0 && index < this.workProcesses.length) {
          this.workProcesses[index].discovered = true;
          this.userDataService.saveResponse(
            this.MODULE_ID,
            `process_${index}`,
            true
          );
        }
      }
      // Facteurs de motivation
      else if (id.startsWith('motivation')) {
        const index = parseInt(id.replace('motivation', '')) - 1;
        if (index >= 0 && index < this.motivationFactors.length) {
          this.motivationFactors[index].discovered = true;
          this.userDataService.saveResponse(
            this.MODULE_ID,
            `motivation_${index}`,
            true
          );
        }
      }
      // Valeurs
      else if (id.startsWith('value')) {
        const index = parseInt(id.replace('value', '')) - 1;
        if (index >= 0 && index < this.coreValues.length) {
          this.coreValues[index].discovered = true;
          this.userDataService.saveResponse(
            this.MODULE_ID,
            `value_${index}`,
            true
          );
        }
      }
      // Préférences
      // Dans la méthode revealInsights
      else if (id.startsWith('preference')) {
        const index = parseInt(id.replace('preference', '')) - 1;
        if (index >= 0 && index < this.workPreferences.length) {
          // Débloquer toutes les préférences d'un coup
          this.workPreferences.forEach((pref, i) => {
            pref.discovered = true;
            this.userDataService.saveResponse(
              this.MODULE_ID,
              `preference_${i}`,
              true
            );
          });
        }
      }
      // Élément de communication
      else if (id === 'communication') {
        // La communication est un aspect transversal, pourrait affecter plusieurs catégories
        // Par exemple, révéler un aspect spécifique de collaboration lié à la communication
        if (!this.collaborationAspects[3]?.discovered) {
          if (this.collaborationAspects.length > 3) {
            this.collaborationAspects[3].discovered = true;
            this.userDataService.saveResponse(
              this.MODULE_ID,
              `collaboration_3`,
              true
            );
          }
        }
      }
    });

    // Mettre à jour le nombre d'insights découverts
    this.updateInsightsCount();
  }

  // Afficher un message lorsque l'investigation est suffisamment avancée
  // Afficher un message lorsque l'investigation est suffisamment avancée
  showCompleteInvestigationMessage(): void {
    const message =
      'Vous avez exploré suffisamment de scénarios pour dresser un profil psychologique complet. Vous pouvez maintenant consulter les différentes sections du dossier pour analyser en détail la personnalité du sujet.';

    const dialogMessage: DialogMessage = {
      text: message,
      character: 'detective',
    };

    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(message);

    // Nettoyer tout timeout précédent
    if (this.quizEnableTimeoutId !== null) {
      clearTimeout(this.quizEnableTimeoutId);
    }

    // Offrir la possibilité de passer le quiz final
    this.quizEnableTimeoutId = window.setTimeout(() => {
      this.enableFinalQuiz();
      this.quizEnableTimeoutId = null;
    }, 5000);
  }

  // Activer le quiz final
  enableFinalQuiz(): void {
    // Sauvegarder explicitement comme une valeur booléenne
    this.userDataService.saveResponse(this.MODULE_ID, 'quiz_available', true);
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
    if (
      this.selectedAnswer ===
      this.quizQuestions[this.currentQuizQuestion].correctAnswer
    ) {
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
      const message =
        "Félicitations ! Vous avez correctement analysé mon profil psychologique. Vous avez maintenant accès à l'ensemble des données et pouvez passer au module suivant.";

      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective',
      };

      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);
    }
  }

  // Obtenir les traits sous forme de tableau pour l'affichage
  getTraitsArray(): { id: string; name: string; score: number }[] {
    return [
      {
        id: 'extroversion',
        name: 'Extraversion',
        score: this.traitScores.extroversion,
      },
      {
        id: 'agreeableness',
        name: 'Coopération',
        score: this.traitScores.agreeableness,
      },
      {
        id: 'conscientiousness',
        name: 'Rigueur',
        score: this.traitScores.conscientiousness,
      },
      { id: 'openness', name: 'Ouverture', score: this.traitScores.openness },
    ];
  }

  // Obtenir l'icône d'un trait
  getTraitIcon(traitId: string): string {
    const trait = this.personalityTraits.find((t) => t.id === traitId);
    return trait ? trait.icon : 'bi-question';
  }

  // Obtenir la couleur d'un trait
  getTraitColor(traitId: string): string {
    switch (traitId) {
      case 'extroversion':
        return '#4c6ef5';
      case 'agreeableness':
        return '#37b24d';
      case 'conscientiousness':
        return '#f59f00';
      case 'openness':
        return '#ae3ec9';
      default:
        return '#aaaaaa';
    }
  }

  // Obtenir la description d'un trait
  getTraitDescription(traitId: string): string {
    const trait = this.personalityTraits.find((t) => t.id === traitId);
    return trait ? trait.description : '';
  }

  // Obtenir le score d'un trait
  getTraitScore(traitId: string): number {
    return this.traitScores[traitId as keyof typeof this.traitScores] || 0;
  }

  // Obtenir les traits dominants
  getDominantTraits(
    count: number = 2
  ): { id: string; name: string; score: number }[] {
    return this.getTraitsArray()
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  // Vérifier si un trait a été découvert
  isTraitDiscovered(traitId: string): boolean {
    return (
      this.traitVisibility[traitId as keyof typeof this.traitVisibility] ||
      false
    );
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
      day: 'numeric',
    });
  }

  // Résumé de personnalité
  getPersonalitySummary(): string {
    if (!this.canShowSummary()) {
      return "Analyse en cours... Poursuivez l'investigation pour obtenir un profil complet.";
    }

    // Génération dynamique en fonction des traits dominants
    const dominantTraits = this.getDominantTraits(2);
    const dominantTraitIds = dominantTraits.map((t) => t.id);

    if (
      dominantTraitIds.includes('conscientiousness') &&
      dominantTraitIds.includes('openness')
    ) {
      return "Le profil présente un équilibre remarquable entre rigueur analytique et ouverture à l'innovation. Caractérisé par une approche méthodique du travail combinée à une curiosité intellectuelle prononcée, le sujet démontre une capacité à naviguer efficacement entre structure et créativité. Sa communication directe mais attentive facilite les interactions professionnelles, tandis que son orientation vers les résultats assure une exécution fiable des projets. Particulièrement adapté aux environnements techniques évolutifs nécessitant à la fois expertise approfondie et adaptabilité.";
    } else if (
      dominantTraitIds.includes('conscientiousness') &&
      dominantTraitIds.includes('agreeableness')
    ) {
      return "Le profil révèle une combinaison distinctive de rigueur méthodologique et de coopération. Le sujet démontre un haut niveau d'organisation et de fiabilité, tout en maintenant d'excellentes capacités collaboratives. Cette dualité lui permet d'établir des processus structurés qui intègrent harmonieusement les contributions de l'équipe. Son approche consciencieuse des responsabilités, associée à une communication empathique et claire, en fait un élément stabilisateur et productif dans les environnements professionnels.";
    } else {
      // Profil par défaut ou autres combinaisons
      return "Le profil révèle un individu méthodique et rigoureux, avec une forte capacité d'adaptation et d'ouverture aux nouvelles idées. Sa communication équilibrée et son approche collaborative en font un atout précieux dans les environnements d'équipe. Particulièrement efficace dans la structuration et l'exécution de projets complexes, tout en restant réceptif à l'innovation et aux perspectives diverses.";
    }
  }

  // Style de communication
  getCommunicationStyle(): {
    directness: number;
    factual: number;
    conciseness: number;
  } {
    // Calculé à partir des scores de traits
    const directness = 60 + (this.traitScores.extroversion - 5) * 5;
    const factual = 65 + (this.traitScores.conscientiousness - 5) * 5;
    const conciseness = 60 - (this.traitScores.openness - 5) * 3;

    return {
      directness: Math.min(Math.max(directness, 0), 100),
      factual: Math.min(Math.max(factual, 0), 100),
      conciseness: Math.min(Math.max(conciseness, 0), 100),
    };
  }

  // Résumé du style de communication
  getCommunicationSummary(): string {
    if (!this.canShowSummary()) {
      return "Données insuffisantes. Continuez l'investigation pour déverrouiller cette analyse.";
    }

    const style = this.getCommunicationStyle();
    let summary = 'Communication ';

    // Directness
    if (style.directness > 65) {
      summary += 'principalement directe et ';
    } else if (style.directness < 35) {
      summary += 'généralement nuancée et ';
    } else {
      summary += 'équilibrée entre franchise et tact, ';
    }

    // Factual vs Emotional
    if (style.factual > 65) {
      summary += 'factuelle, ';
    } else if (style.factual < 35) {
      summary += 'émotionnellement engagée, ';
    } else {
      summary += 'combinant faits et contexte émotionnel, ';
    }

    // Conciseness
    if (style.conciseness > 65) {
      summary += 'préférant des explications concises et précises. ';
    } else if (style.conciseness < 35) {
      summary += 'incluant des explications détaillées lorsque nécessaire. ';
    } else {
      summary += 'adaptant le niveau de détail au contexte. ';
    }

    summary +=
      "Le sujet s'ajuste naturellement à son interlocuteur, privilégiant la clarté et la précision. Particulièrement efficace pour vulgariser des concepts techniques tout en maintenant un niveau de rigueur approprié.";

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
    const discovered = this.personalityTraits.filter(
      (t) => t.discovered
    ).length;
    return Math.round((discovered / this.personalityTraits.length) * 100);
  }

  // Vérifier si le quiz final est disponible
  isQuizAvailable(): boolean {
    // Vérifier d'abord si la valeur est déjà sauvegardée
    const quizAvailableResponse = this.userDataService.getResponse(
      this.MODULE_ID,
      'quiz_available'
    );

    // Si déjà sauvegardé comme disponible, retourner true
    if (quizAvailableResponse && quizAvailableResponse.response === true) {
      return true;
    }

    // Sinon, vérifier si la progression est suffisante (>= 70%)
    if (this.investigationProgress >= 70) {
      // Sauvegarder l'état pour les prochaines vérifications
      this.enableFinalQuiz();
      return true;
    }

    return false;
  }

  // Vérifier si le module est complété
  isModuleCompleted(): boolean {
    const quizPassedResponse = this.userDataService.getResponse(
      this.MODULE_ID,
      'quiz_passed'
    );
    return quizPassedResponse
      ? (quizPassedResponse.response as boolean)
      : false;
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
      const message =
        'Module de profil psychologique complété. Vous pouvez maintenant passer au module suivant avec une compréhension approfondie de ma personnalité.';

      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective',
      };

      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);

      // Nettoyer tout timeout précédent
      if (this.navigationTimeoutId !== null) {
        clearTimeout(this.navigationTimeoutId);
      }

      // Rediriger vers le prochain module après un court délai
      this.navigationTimeoutId = window.setTimeout(() => {
        // Nettoyer les ressources avant la navigation
        this.clearAllTimeouts();

        // Fermeture du dialogue
        this.dialogService.closeDialog();

        // Navigation au module suivant
        this.router.navigate(['/centres']);

        this.navigationTimeoutId = null;
      }, 5000);
    } else {
      // Si le module n'est pas complété, informer l'utilisateur
      const message =
        "Vous devez d'abord compléter l'évaluation finale pour continuer.";

      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective',
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
