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
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { UserDataService } from '../../services/user-data.service';
import { Router } from '@angular/router';
import { Evidence } from '../../models/centres/evidence';
import { Interest } from '../../models/centres/interest';
import { InterestCategory } from '../../models/centres/interest-category';
import { QuizQuestion } from '../../models/centres/quiz-question';
import { DialogMessage } from '../../models/others/dialod-message';
import { EVIDENCEITEMSDATA } from '../../database/centres/evidenceItems.data';
import { INTERESTCATEGORIESDATA } from '../../database/centres/interestCategories.data';
import { INTERESTSDATA } from '../../database/centres/interests.data';
import { QUIZQUESTIONSDATA } from '../../database/centres/quizQuestions.data';
import { AlertService } from '../../services/alert.service';


@Component({
    selector: 'app-centres-interet',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './centres-interet.component.html',
    styleUrls: ['./centres-interet.component.css']
})
export class CentresInteretComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Pour gérer la destruction proprement
  private destroy$ = new Subject<void>();

  // Gérer les timeouts
  private introDialogTimeoutId: number | null = null;
  private closeDialogTimeoutId: number | null = null;
  private congratulationTimeoutId: number | null = null;
  private navigationTimeoutId: number | null = null;

  // Identifiant du module
  private readonly MODULE_ID = 'centres';
  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, pour compléter le profil de notre sujet, nous devons analyser ses centres d'intérêt personnels. Ces activités hors travail peuvent révéler des aspects clés de sa personnalité, ses motivations et ses compétences transversales. Recueillez des indices et explorez chaque domaine en profondeur.";

  // Données de progression et de temps
  isModuleCompleted: boolean = false;
  moduleProgressPercentage: number = 0;

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // État de la photo polaroid
  isPhotoFlipped: boolean = false;

  // État des modals
  showEvidenceModal: boolean = false;
  currentEvidence: Evidence | null = null;

  // État des filtres et de la navigation
  showUndiscoveredInterests: boolean = false;
  selectedCategory: string | null = null;
  currentInterestIndex: number = 0;

  showQuizModal: boolean = false;
  quizStarted: boolean = false;
  currentQuizQuestion: number = 0;
  selectedAnswer: number | null = null;
  quizScore: number = 0;
  quizPassed: boolean = false;

  //données

  // Indices à découvrir
  evidenceItems: Evidence[] = EVIDENCEITEMSDATA;

  // Catégories d'intérêts
  interestCategories: InterestCategory[] = INTERESTCATEGORIESDATA;

  // Centres d'intérêt détaillés
  interests: Interest[] = INTERESTSDATA;

  quizQuestions: QuizQuestion[] = QUIZQUESTIONSDATA;

  constructor(
    private progressService: ProgressService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('centres')) {
      console.warn("Ce module n'est pas encore disponible");
    }

    // Vérifier si le module est déjà complété
    this.progressService.moduleStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statuses) => {
        this.isModuleCompleted = statuses.centres;
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
      this.congratulationTimeoutId,
      this.navigationTimeoutId,
    ];

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
    const responses = this.userDataService.getModuleResponses('centres');

    if (responses.length > 0) {
      // Charger l'état des indices découverts
      const evidenceResponse = responses.find(
        (r) => r.questionId === 'evidence_discovered'
      );
      if (evidenceResponse && Array.isArray(evidenceResponse.response)) {
        const discoveredIds = evidenceResponse.response as string[];
        this.evidenceItems.forEach((item) => {
          item.discovered = discoveredIds.includes(item.id);
        });
      }

      // Charger la catégorie sélectionnée
      const categoryResponse = responses.find(
        (r) => r.questionId === 'selected_category'
      );
      if (categoryResponse && typeof categoryResponse.response === 'string') {
        this.selectedCategory = categoryResponse.response;
      }

      // Autres états si nécessaire (photo flippée, etc.)
      const photoFlippedResponse = responses.find(
        (r) => r.questionId === 'photo_flipped'
      );
      if (
        photoFlippedResponse &&
        typeof photoFlippedResponse.response === 'boolean'
      ) {
        this.isPhotoFlipped = photoFlippedResponse.response;
      }
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder les indices découverts
    const discoveredIds = this.evidenceItems
      .filter((item) => item.discovered)
      .map((item) => item.id);

    this.userDataService.saveResponse(
      'centres',
      'evidence_discovered',
      discoveredIds
    );

    // Sauvegarder la catégorie sélectionnée
    if (this.selectedCategory) {
      this.userDataService.saveResponse(
        'centres',
        'selected_category',
        this.selectedCategory
      );
    }

    // Sauvegarder l'état de la photo
    this.userDataService.saveResponse(
      'centres',
      'photo_flipped',
      this.isPhotoFlipped
    );

    // Vérifier si le module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si les conditions de complétion du module sont remplies
  checkModuleCompletion(): void {
    // Par exemple, si tous les indices sont découverts ou si un nombre suffisant est découvert
    const allDiscovered = this.evidenceItems.every((item) => item.discovered);
    const discoveredCount = this.getDiscoveredCount();

    // Ou un seuil minimum (par exemple 75%)
    const discoveryThreshold = Math.ceil(this.evidenceItems.length * 0.75);

    if (
      (allDiscovered || discoveredCount >= discoveryThreshold) &&
      !this.isModuleCompleted
    ) {
      this.completeModule();
    }
  }

  // Marquer le module comme complété
  completeModule(): void {
    this.progressService.completeModule('centres');
    this.isModuleCompleted = true;

    this.alertService.success(
      `Module Centres d'intérêt complété ! Tous les centres d'intérêt ont été découverts. 
      Cliquez maintenant sur le bouton "Continuer" au fond de la page pour faire le mini jeu et passer au module suivant.`,
      'Module terminé',
      true,
      20000
    );

    // Ajouter une note automatique pour résumer ce qui a été fait
    this.addCompletionNote();
  }

  // Ajouter une note récapitulative automatique
  addCompletionNote(): void {
    const discoveredCount = this.getDiscoveredCount();
    const totalCount = this.evidenceItems.length;

    // Récupérer les catégories débloquées
    const unlockedCategories = this.interestCategories
      .filter((cat) => this.isCategoryUnlocked(cat.id))
      .map((cat) => cat.name)
      .join(', ');

    // Récupérer quelques centres d'intérêt clés découverts
    const keyInterests = this.interests
      .filter((int) => this.isInterestDiscovered(int.id))
      .slice(0, 3)
      .map((int) => int.name)
      .join(', ');

    const noteContent = `
Module "Centres d'intérêt" complété le ${new Date().toLocaleDateString()}.
${discoveredCount}/${totalCount} indices découverts.
Catégories débloquées: ${unlockedCategories}.
Principaux centres d'intérêt: ${keyInterests} et autres.
    `;

    this.noteService.addNote(noteContent.trim());
  }

  // Fonction pour retourner la photo polaroid
  flipPhoto(): void {
    this.isPhotoFlipped = !this.isPhotoFlipped;
    // Sauvegarder l'état
    this.userDataService.saveResponse(
      'centres',
      'photo_flipped',
      this.isPhotoFlipped
    );
  }

  // Fonction pour découvrir un indice
  discoverEvidence(index: number): void {
    if (index < 0 || index >= this.evidenceItems.length) return;

    const evidence = this.evidenceItems[index];
    if (evidence.discovered) return;

    // Marquer l'indice comme découvert
    evidence.discovered = true;

    // Afficher le modal de découverte
    this.currentEvidence = evidence;
    this.showEvidenceModal = true;

    // Débloquer les intérêts associés
    this.unlockInterests(evidence.unlocksInterests);

    // Sauvegarder l'état
    this.saveState();
  }

  // Débloquer les intérêts associés à un indice
  unlockInterests(interestIds: string[]): void {
    // Sauvegarder les intérêts débloqués
    interestIds.forEach((id) => {
      this.userDataService.saveResponse(
        'centres',
        `interest_${id}_unlocked`,
        true
      );
    });
  }

  // Fermer le modal d'indice
  closeEvidenceModal(): void {
    this.showEvidenceModal = false;
    this.currentEvidence = null;

    // Vérifier si le module peut être complété après chaque découverte
    this.checkModuleCompletion();
  }

  // Fonctions utilitaires (conservées inchangées)
  getDiscoveredCount(): number {
    return this.evidenceItems.filter((evidence) => evidence.discovered).length;
  }

  getDiscoveredPercentage(): number {
    return (this.getDiscoveredCount() / this.evidenceItems.length) * 100;
  }

  isCategoryUnlocked(categoryId: string): boolean {
    const category = this.interestCategories.find(
      (cat) => cat.id === categoryId
    );
    if (!category) return false;

    // Nombre d'indices découverts liés à cette catégorie
    const categoryInterests = this.interests.filter(
      (interest) => interest.category === categoryId
    );
    const unlockedInterests = categoryInterests.filter((interest) =>
      this.isInterestDiscovered(interest.id)
    );

    return unlockedInterests.length >= category.requiredEvidences;
  }

  isInterestDiscovered(interestId: string): boolean {
    const interest = this.interests.find((int) => int.id === interestId);
    if (!interest) return false;

    // Vérifier si l'indice requis a été découvert
    const requiredEvidence = this.evidenceItems.find(
      (ev) => ev.id === interest.requiredEvidence
    );
    return requiredEvidence ? requiredEvidence.discovered : false;
  }

  // Sélectionner une catégorie pour affichage
  selectCategory(categoryId: string): void {
    if (!this.isCategoryUnlocked(categoryId)) return;

    this.selectedCategory = categoryId;
    this.currentInterestIndex = 0;

    // Sauvegarder la sélection
    this.userDataService.saveResponse(
      'centres',
      'selected_category',
      categoryId
    );
  }

  // Ouvrir le panneau de notes
  toggleNotes(): void {
    this.noteService.toggleNotesVisibility();
  }

  // Fermer la fenêtre d'analyse
  closeAnalysisWindow(): void {
    this.selectedCategory = null;
    // Sauvegarder l'état
    this.userDataService.saveResponse('centres', 'selected_category', '');
  }

  // Fonctions getter inchangées
  getSelectedCategoryName(): string {
    if (!this.selectedCategory) return '';

    const category = this.interestCategories.find(
      (cat) => cat.id === this.selectedCategory
    );
    return category ? category.name : '';
  }

  getSelectedCategoryIcon(): string {
    if (!this.selectedCategory) return '';

    const category = this.interestCategories.find(
      (cat) => cat.id === this.selectedCategory
    );
    return category ? category.icon : '';
  }

  getInterestsByCategory(): Interest[] {
    if (!this.selectedCategory) return [];

    return this.interests.filter(
      (interest) => interest.category === this.selectedCategory
    );
  }

  getInterestName(interestId: string): string {
    const interest = this.interests.find((int) => int.id === interestId);
    return interest ? interest.name : 'Intérêt inconnu';
  }

  // Navigation entre les intérêts
  showNextInterest(): void {
    const interests = this.getInterestsByCategory();
    if (this.currentInterestIndex < interests.length - 1) {
      this.currentInterestIndex++;
    }
  }

  showPreviousInterest(): void {
    if (this.currentInterestIndex > 0) {
      this.currentInterestIndex--;
    }
  }

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
      this.isModuleCompleted = true;
      this.progressService.completeModule('centres');

      // Ajouter une note automatique
      this.addCompletionNote();
    }

    // Sauvegarder le résultat du quiz
    this.userDataService.saveResponse(
      'centres',
      'quiz_passed',
      this.quizPassed
    );

    this.userDataService.saveResponse('centres', 'quiz_score', this.quizScore);
  }

  // Fermer le modal du quiz
  closeQuizModal(): void {
    this.showQuizModal = false;

    // Si le quiz a été réussi, afficher un message de félicitations
    if (this.quizPassed) {
      const message =
        "Félicitations ! Vous avez correctement analysé les centres d'intérêt du sujet. Vous avez maintenant accès à l'ensemble des données et pouvez passer au module suivant.";

      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective',
      };

      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);
    }
  }

  // Obtenir le score de passage pour le quiz (70%)
  getPassScore(): number {
    return Math.ceil(this.quizQuestions.length * 0.7);
  }

  // Naviguer vers le module suivant
  continueToNextModule(): void {
    if (this.isModuleCompleted) {
      // Sauvegarder l'état du module
      this.userDataService.saveResponse(
        this.MODULE_ID,
        'module_completed',
        true
      );

      // Marquer officiellement le module comme complété
      this.progressService.completeModule(this.MODULE_ID);

      // Afficher un message de confirmation
      const message =
        "Module d'analyse des centres d'intérêt complété. Vous pouvez maintenant passer au module suivant.";

      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective',
      };

      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);

      // D'abord fermer le modal
      this.closeQuizModal();

      // Nettoyer tout timeout de navigation précédent
      if (this.navigationTimeoutId !== null) {
        clearTimeout(this.navigationTimeoutId);
      }

      // Puis rediriger vers le prochain module après un court délai
      this.navigationTimeoutId = window.setTimeout(() => {
        // Nettoyer les ressources avant la navigation
        this.clearAllTimeouts();

        // Naviguer vers le module suivant
        //this.router.navigate(['/motivations']);
        this.router.navigate(['/conclusion']);

        this.navigationTimeoutId = null;
      }, 5000);
    } else if (
      this.getDiscoveredCount() >= Math.ceil(this.evidenceItems.length * 0.75)
    ) {
      // Si suffisamment d'indices ont été découverts mais le quiz n'a pas été réussi
      this.startQuiz();
    } else {
      // Si pas assez d'indices ont été découverts
      const message =
        "Vous devez découvrir plus d'indices avant de pouvoir passer au module suivant.";

      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective',
      };

      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);
    }
  }

  getPinDistance(index: number): number {
    const totalItems = this.evidenceItems.length;

    // Calculer l'angle du pin en radians (distribué uniformément autour du cercle)
    const angle = (index * 2 * Math.PI) / totalItems;

    // Dimensions du polaroid
    const polaroidWidth = 200;
    const polaroidHeight = 300;

    const baseDistance = 90; // Distance minimale depuis le bord du polaroid

    // Calculer une distance qui suit approximativement le contour du rectangle
    const horizontalComponent = Math.abs(Math.cos(angle)) * (polaroidWidth / 2);
    const verticalComponent = Math.abs(Math.sin(angle)) * (polaroidHeight / 2);

    // Utiliser la plus grande des deux composantes pour déterminer la distance
    const rectangleRadius = Math.max(horizontalComponent, verticalComponent);

    return rectangleRadius + baseDistance;
  }

  getResponseLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
