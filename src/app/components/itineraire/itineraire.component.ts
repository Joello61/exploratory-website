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
import { UserDataService } from '../../services/user-data.service';
import { Router } from '@angular/router';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { latLng, tileLayer, Map, marker, Marker, icon } from 'leaflet';
import { Chart, TooltipItem } from 'chart.js/auto';

import { Education } from '../../models/itineraire/education';
import { KeyIndicator } from '../../models/itineraire/key-indicator';
import { SkillEvolution } from '../../models/itineraire/skill-evolution';
import { Location } from '../../models/itineraire/location';
import { QuizQuestion } from '../../models/itineraire/quiz-question';
import { DialogMessage } from '../../models/others/dialod-message';
import { ORIGINLOCATIONSDATA } from '../../database/itineraire/originLocations.data';
import { EDUCATIONTIMELINEDATA } from '../../database/itineraire/educationTimeline.data';
import { SKILLSEVOLUTIONDATA } from '../../database/itineraire/skillsEvolution.data';
import { KEYINDICATORSDATA } from '../../database/itineraire/keyIndicators.data';
import { QUIZQUESTIONSDATA } from '../../database/itineraire/quizQuestions.data';
import { AlertService } from '../../services/alert.service';
import { MapQuestion } from '../../models/itineraire/map-question';
import { MAPQUESTIONSDATA } from '../../database/itineraire/mapQuestions.data';

@Component({
    selector: 'app-itineraire',
    imports: [CommonModule, LeafletModule],
    standalone: true,
    templateUrl: './itineraire.component.html',
    styleUrls: ['./itineraire.component.css']
})
export class ItineraireComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;
  @ViewChild('map') mapElement!: ElementRef;

  // Pour gérer la destruction du composant
  private destroy$ = new Subject<void>();

  // Gérer les timeouts
  private introDialogTimeoutId: number | null = null;
  private closeDialogTimeoutId: number | null = null;

  // Référence au graphique pour pouvoir le détruire
  private skillsChart: Chart | null = null;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, cette section détaille l'itinéraire personnel et éducatif du sujet. Examinez attentivement ces informations pour comprendre son parcours. Certaines données sont encore cryptées et nécessitent une découverte progressive. Collectez tous les éléments pour obtenir une vision complète de sa formation et de ses origines.";

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Données de progression et temps
  isModuleCompleted: boolean = false;

  // Statistiques
  dataRecoveryPercentage: number = 35;

  selectedLocation: Location | null = null;

  statut: string = '';

  currentQuestionIndex: number = 0;
  selectedOption: number | null = null;
  showFeedback: boolean = false;
  isAnswerCorrect: boolean = false;
  feedbackMessage: string = '';
  correctAnswersCount: number = 0;
  quizCompleted: boolean = false;
  quizPassed: boolean = false;

  map!: Map;
  markers: Marker[] = [];

  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&amp;copy; OpenStreetMap contributors',
      }),
    ],
    zoom: 3,
    center: latLng([30.8566, 2.3522]),
  };

isQuizModalOpen: boolean = false;

// Propriétés pour le jeu de questions sur la carte

currentMapQuestionIndex: number = 0;
currentMapQuestion: MapQuestion | null = null;
selectedMapOption: number | null = null;
showMapFeedback: boolean = false;
isMapAnswerCorrect: boolean = false;
mapFeedbackMessage: string = '';
displayedQuestionText: string = '';
isTypingQuestion: boolean = true;
typingSpeed: number = 100; // ms par caractère
typingTimeout: any = null;
allLocationsDiscovered: boolean = false;

questionState: 'ready' | 'asking' | 'feedback' = 'ready';
// Pour gérer la position du typewriter
currentCharIndex: number = 0;
isQuestionFullyTyped: boolean = false;
typingPaused: boolean = false;

correctMapAnswers: { questionId: string, correct: boolean }[] = [];

  //données

  mapQuestions: MapQuestion[] = MAPQUESTIONSDATA;

  // Coordonnées géographiques réelles pour les lieux
  originLocations: Location[] = ORIGINLOCATIONSDATA;

  // Données pour la timeline de formation
  educationTimeline: Education[] = EDUCATIONTIMELINEDATA;

  // Données pour les graphiques
  skillsEvolution: SkillEvolution[] = SKILLSEVOLUTIONDATA;

  keyIndicators: KeyIndicator[] = KEYINDICATORSDATA;

  quizQuestions: QuizQuestion[] = QUIZQUESTIONSDATA;

  constructor(
    private progressService: ProgressService,
    private router: Router,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {

    this.alertService.success(
      `Module Itinéraire complété ! L'itinéraire complet du sujet a été découvert. 
      Cliquez maintenant sur le bouton "Continuer" au fond de la page pour faire le mini jeu et passer au module suivant.`,
      'Module terminé',
      true,
      20000
    );
    
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('itineraire')) {
      console.warn("Ce module n'est pas encore disponible");
    }
  
    // Vérifier si le module est déjà complété
    this.progressService.moduleStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statuses) => {
        this.isModuleCompleted = statuses.itineraire;
  
        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadSavedState();
          this.statut = 'TERMINÉ';
        } else {
          this.initializeData();
          this.statut = 'EN COURS';
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
  
    // Initialiser la première question de carte
    this.setupNextMapQuestion();
    
    // Vérifier si toutes les localisations sont déjà découvertes
    this.checkAllLocationsDiscovered();
    
    console.log('ngOnInit terminé', {
      currentMapQuestion: this.currentMapQuestion,
      allLocationsDiscovered: this.allLocationsDiscovered,
      questionState: this.questionState,
      mapQuestions: this.mapQuestions,
      mapQuestionsLength: this.mapQuestions.length
    });
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService avec un timeout géré
    this.introDialogTimeoutId = window.setTimeout(() => {
      this.showIntroDialog();
      this.introDialogTimeoutId = null;
    }, 500);

    this.initSkillsChart();
  }

  ngOnDestroy(): void {
    // Émettre le signal de destruction pour tous les observables
    this.destroy$.next();
    this.destroy$.complete();

    // Nettoyer les timeouts
    if (this.introDialogTimeoutId !== null) {
      clearTimeout(this.introDialogTimeoutId);
    }

    if (this.closeDialogTimeoutId !== null) {
      clearTimeout(this.closeDialogTimeoutId);
    }

    // Détruire le graphique Chart.js
    if (this.skillsChart) {
      this.skillsChart.destroy();
      this.skillsChart = null;
    }

    // Nettoyer la carte Leaflet
    if (this.map) {
      try {
        // Supprimer les marqueurs
        if (this.markers) {
          this.markers.forEach(marker => {
            if (marker) marker.remove();
          });
        }
        
        // Démonter la carte et libérer les ressources
        this.map.remove();
      } catch (e) {
        console.warn('Erreur lors de la suppression de la carte:', e);
      }
    }

    // Fermer tout dialogue ouvert
    if (this.isDialogOpen) {
      this.dialogService.closeDialog();
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

// Initialiser la prochaine question de carte
  setupNextMapQuestion(): void {
  console.log('setupNextMapQuestion appelé', this.currentMapQuestionIndex, this.mapQuestions.length);
  
  // Si toutes les questions ont été posées ou si pas de questions, terminer
  if (!this.mapQuestions || this.mapQuestions.length === 0) {
    console.warn('Aucune question disponible');
    this.allLocationsDiscovered = true;
    return;
  }
  
  // Vérifier si l'index est hors limites
  if (this.currentMapQuestionIndex >= this.mapQuestions.length) {
    console.log('Toutes les questions ont été posées');
    this.allLocationsDiscovered = true;
    return;
  }
  
  // Récupérer la question actuelle
  this.currentMapQuestion = this.mapQuestions[this.currentMapQuestionIndex];
  console.log('Question actuelle:', this.currentMapQuestion);
  
  // Réinitialiser l'état de la question
  this.selectedMapOption = null;
  this.displayedQuestionText = '';
  this.isTypingQuestion = true;
  this.questionState = 'ready';
}

// Démarrer l'affichage de la question
startQuestion(): void {
  console.log('startQuestion appelé');
  this.questionState = 'asking';
  this.selectedMapOption = null;
  this.isQuestionFullyTyped = false;
  this.currentCharIndex = 0;
  this.displayedQuestionText = '';
  
  // Commencer l'animation de frappe
  this.typeQuestion();
}

  // Animation de frappe pour la question
  typeQuestion(): void {
    console.log('typeQuestion appelé');
    if (!this.currentMapQuestion) {
      console.error('Aucune question disponible pour le typewriter');
      return;
    }
    
    const fullText = this.currentMapQuestion.text;
    this.currentCharIndex = 0;
    this.isQuestionFullyTyped = false;
    this.typingPaused = false;
    this.isTypingQuestion = true;
    
    const typeChar = () => {
      // Si l'animation est en pause, on ne fait rien
      if (this.typingPaused) return;
      
      if (this.currentCharIndex < fullText.length) {
        this.displayedQuestionText = fullText.substring(0, this.currentCharIndex + 1);
        this.currentCharIndex++;
        this.typingTimeout = setTimeout(typeChar, this.typingSpeed);
      } else {
        this.isTypingQuestion = false;
        this.isQuestionFullyTyped = true;
        console.log('Animation typewriter terminée');
      }
    };
    
    typeChar();
  }
  
  // Méthode pour reprendre l'animation après une pause
  resumeTyping(): void {
    if (this.typingPaused && !this.isQuestionFullyTyped) {
      this.typingPaused = false;
      
      // Reprendre l'animation là où elle s'est arrêtée
      const fullText = this.currentMapQuestion?.text || '';
      
      const typeChar = () => {
        if (this.typingPaused) return;
        
        if (this.currentCharIndex < fullText.length) {
          this.displayedQuestionText = fullText.substring(0, this.currentCharIndex + 1);
          this.currentCharIndex++;
          this.typingTimeout = setTimeout(typeChar, this.typingSpeed);
        } else {
          this.isTypingQuestion = false;
          this.isQuestionFullyTyped = true;
        }
      };
      
      this.isTypingQuestion = true;
      typeChar();
    }
  }
  
  // Méthode pour mettre en pause l'animation
  pauseTyping(): void {
    this.typingPaused = true;
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  initSkillsChart() {
    const ctx = document.getElementById(
      'skillsEvolutionChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    this.skillsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.skillsEvolution.map((skill) => skill.year),
        datasets: [
          {
            label: 'Niveau de compétence',
            data: this.skillsEvolution.map((skill) => skill.level),
            backgroundColor: 'rgba(0, 191, 255, 0.6)',
            borderColor: 'rgba(0, 191, 255, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'bar'>) => {
                const index = context.dataIndex;
                return this.skillsEvolution[index].tooltip;
              },
            },
          },
        },
      },
    });
  }

  onMapReady(map: Map) {
    console.log('Carte initialisée');
    this.map = map;
    
    // Au début, on n'ajoute aucun marqueur
    // Les marqueurs seront ajoutés uniquement quand les lieux seront découverts
    this.updateMarkers();
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

  // Initialiser les données
  initializeData(): void {
    // Par défaut, tous les lieux ne sont pas découverts
    this.originLocations.forEach((location) => {
      location.discovered = false;
    });
  
    // Mettre à jour le pourcentage de récupération des données
    this.updateDataRecoveryPercentage();
  }

  // Charger l'état sauvegardé précédemment
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('itineraire');

    if (responses.length > 0) {
      // Charger les emplacements découverts
      const locationsResponse = responses.find(
        (r) => r.questionId === 'discovered_locations'
      );
      if (locationsResponse && Array.isArray(locationsResponse.response)) {
        const discoveredLocIds = locationsResponse.response as string[];
        this.originLocations.forEach((location) => {
          location.discovered = discoveredLocIds.includes(location.id);
        });
      }

      // Charger l'état de la timeline
      for (let i = 0; i < this.educationTimeline.length; i++) {
        const educResponse = responses.find(
          (r) => r.questionId === `education_${this.educationTimeline[i].id}`
        );
        if (educResponse && typeof educResponse.response === 'object') {
          // Conversion appropriée via unknown
          const responseData = educResponse.response as unknown;
          // Vérifier que l'objet a la structure attendue
          const state = responseData as {
            discovered: boolean;
            expanded: boolean;
          };
          if (
            typeof state.discovered === 'boolean' &&
            typeof state.expanded === 'boolean'
          ) {
            this.educationTimeline[i].discovered = state.discovered;
            this.educationTimeline[i].expanded = state.expanded;
          }
        }
      }

      // Charger le pourcentage de récupération
      const recoveryResponse = responses.find(
        (r) => r.questionId === 'data_recovery_percentage'
      );
      if (recoveryResponse && typeof recoveryResponse.response === 'number') {
        this.dataRecoveryPercentage = recoveryResponse.response;
      } else {
        this.updateDataRecoveryPercentage();
      }
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder les emplacements découverts
    const discoveredLocIds = this.originLocations
      .filter((loc) => loc.discovered)
      .map((loc) => loc.id);

    this.userDataService.saveResponse(
      'itineraire',
      'discovered_locations',
      discoveredLocIds
    );

    // Sauvegarder l'état de la timeline
    this.educationTimeline.forEach((educ) => {
      // Convertir l'objet en chaîne JSON pour le stocker
      const stateJson = JSON.stringify({
        discovered: educ.discovered,
        expanded: educ.expanded,
      });
      this.userDataService.saveResponse(
        'itineraire',
        `education_${educ.id}`,
        stateJson
      );
    });

    // Sauvegarder le pourcentage de récupération
    this.userDataService.saveResponse(
      'itineraire',
      'data_recovery_percentage',
      this.dataRecoveryPercentage
    );

    // Vérifier si le module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si les conditions de complétion du module sont remplies
  checkModuleCompletion(): void {
    // Par exemple, si toutes les formations sont découvertes et au moins 2 lieux
    const allEducationsDiscovered = this.educationTimeline.every(
      (educ) => educ.discovered
    );
    const discoveredLocationsCount = this.originLocations.filter(
      (loc) => loc.discovered
    ).length;

    // Conditions de complétion : toutes les formations + au moins 2 lieux
    if (
      allEducationsDiscovered &&
      discoveredLocationsCount >= 2 &&
      !this.isModuleCompleted
    ) {
      this.completeModule();
    }
  }

  // Marquer le module comme complété
  completeModule(): void {
    this.progressService.completeModule('itineraire');
    this.isModuleCompleted = true;

    this.alertService.success(
      `Module Itinéraire complété ! L'itinéraire complet du sujet a été découvert. 
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
    // Récupérer les formations découvertes
    const discoveredEducations = this.educationTimeline
      .filter((educ) => educ.discovered)
      .map((educ) => `${educ.title} (${educ.years})`);

    // Récupérer les lieux découverts
    const discoveredLocations = this.originLocations
      .filter((loc) => loc.discovered)
      .map((loc) => loc.name);

    const noteContent = `
Module "Itinéraire" complété le ${new Date().toLocaleDateString()}.
Formation: ${discoveredEducations.join(', ')}.
Lieux: ${discoveredLocations.join(', ')}.
Niveau d'expertise final: ${
      this.skillsEvolution[this.skillsEvolution.length - 1].tooltip
    }.
    `;

    this.noteService.addNote(noteContent.trim());
  }

  // Ouvrir le panneau de notes
  toggleNotes(): void {
    this.noteService.toggleNotesVisibility();
  }

  // Gestion de la carte
  selectLocation(location: Location): void {
    this.selectedLocation = location;

    // Si le lieu n'était pas découvert, le marquer comme découvert
    if (location && !location.discovered) {
      location.discovered = true;

      // Mettre à jour le pourcentage de récupération
      this.updateDataRecoveryPercentage();

      // Sauvegarder l'état
      this.saveState();
    }
  }

  closeLocationInfo(): void {
    this.selectedLocation = null;
  }

  // Gestion de la timeline
  toggleEducationDetails(education: Education, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Empêcher la propagation si appelé depuis un bouton
    }

    if (education.discovered) {
      education.expanded = !education.expanded;
      this.saveState();
    }
  }

  // Découvrir une formation si ce n'est pas déjà fait
  discoverEducation(education: Education): void {
    if (!education.discovered) {
      education.discovered = true;
      this.updateDataRecoveryPercentage();
      this.saveState();
    }
  }

  // Mettre à jour le pourcentage de récupération des données
  updateDataRecoveryPercentage(): void {
    // Compter les éléments découverts
    const discoveredLocations = this.originLocations.filter(
      (loc) => loc.discovered
    ).length;
    const discoveredEducations = this.educationTimeline.filter(
      (educ) => educ.discovered
    ).length;

    // Calculer le pourcentage
    const totalItems =
      this.originLocations.length + this.educationTimeline.length;
    const discoveredItems = discoveredLocations + discoveredEducations;

    this.dataRecoveryPercentage = Math.round(
      (discoveredItems / totalItems) * 100
    );

    // Sauvegarder le pourcentage
    this.userDataService.saveResponse(
      'itineraire',
      'data_recovery_percentage',
      this.dataRecoveryPercentage
    );
  }

  get currentQuestion(): QuizQuestion {
    return this.quizQuestions[this.currentQuestionIndex];
  }

  // Méthodes à ajouter dans la classe ItineraireComponent
  openQuizModal(): void {
    // Réinitialiser le quiz
    this.currentQuestionIndex = 0;
    this.selectedOption = null;
    this.showFeedback = false;
    this.correctAnswersCount = 0;
    this.quizCompleted = false;
    this.quizPassed = false;

    // Ouvrir la modal
    this.isQuizModalOpen = true;
  }

  closeQuizModal(): void {
    this.isQuizModalOpen = false;
  }

  selectOption(index: number): void {
    if (!this.showFeedback) {
      this.selectedOption = index;
    }
  }

  submitAnswer(): void {
    if (this.selectedOption !== null) {
      // Vérifier si la réponse est correcte
      this.isAnswerCorrect =
        this.selectedOption === this.currentQuestion.correctOptionIndex;

      // Mettre à jour le compteur de réponses correctes
      if (this.isAnswerCorrect) {
        this.correctAnswersCount++;
      }

      // Afficher le feedback
      this.feedbackMessage = this.isAnswerCorrect
        ? this.currentQuestion.feedback.correct
        : this.currentQuestion.feedback.incorrect;

      this.showFeedback = true;
    }
  }

  nextQuestionQuiz(): void {
    this.selectedOption = null;
    this.showFeedback = false;

    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      // Passer à la question suivante
      this.currentQuestionIndex++;
    } else {
      // Quiz terminé
      this.completeQuiz();
    }
  }

  completeQuiz(): void {
    this.quizCompleted = true;

    // Le quiz est réussi si l'utilisateur a au moins 3 bonnes réponses sur 5
    this.quizPassed = this.correctAnswersCount >= 3;

    // Si le quiz est réussi, sauvegarder la progression
    if (this.quizPassed) {
      // Note : on peut également ajouter d'autres actions ici si nécessaire
      this.saveQuizResults();
    }
  }

  saveQuizResults(): void {
    // Sauvegarder les résultats du quiz
    this.userDataService.saveResponse('itineraire', 'quiz_completed', true);
    this.userDataService.saveResponse(
      'itineraire',
      'quiz_score',
      this.correctAnswersCount
    );

    // Si ce n'est pas déjà fait, compléter le module
    if (!this.isModuleCompleted) {
      this.completeModule();
    }
  }

  restartQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedOption = null;
    this.showFeedback = false;
    this.correctAnswersCount = 0;
    this.quizCompleted = false;
  }

  navigateToNextPage(): void {
    this.closeQuizModal();
    this.router.navigate(['/experience']);
  }

  // Sélectionner une option
  selectMapOption(index: number): void {
    if (this.questionState !== 'asking') return;
    
    this.selectedMapOption = index;
    
    // Mettre en pause l'animation de frappe
    this.pauseTyping();
    
    // Vérifier si la réponse est correcte
    if (!this.currentMapQuestion) return;
    
    this.isMapAnswerCorrect = index === this.currentMapQuestion.correctOptionIndex;
    
    // Enregistrer la réponse pour les statistiques
    this.recordAnswer(this.currentMapQuestion.id, this.isMapAnswerCorrect);
    
    if (this.isMapAnswerCorrect) {
      // Si la réponse est correcte
      this.mapFeedbackMessage = this.currentMapQuestion.feedback.correct;
      this.questionState = 'feedback';
      
      // Marquer le lieu comme découvert
      const locationId = this.currentMapQuestion.locationId;
      const location = this.originLocations.find(loc => loc.id === locationId);
      
      if (location && !location.discovered) {
        location.discovered = true;
        this.updateMarkers();
        this.updateDataRecoveryPercentage();
        this.saveState();
        this.checkModuleCompletion();
      }
    } else {
      // Si la réponse est incorrecte
      if (this.isQuestionFullyTyped) {
        // Si la question est entièrement affichée, montrer la bonne réponse
        this.mapFeedbackMessage = this.currentMapQuestion.feedback.incorrect;
        this.questionState = 'feedback';
        
        // Révéler le lieu sur la carte même si la réponse est incorrecte
        const locationId = this.currentMapQuestion.locationId;
        const location = this.originLocations.find(loc => loc.id === locationId);
        
        if (location && !location.discovered) {
          location.discovered = true;
          this.updateMarkers();
          this.updateDataRecoveryPercentage();
          this.saveState();
        }
      } else {
        // Si la question est encore en train de s'écrire
        // Afficher un message d'erreur temporaire
        this.showTemporaryFeedback("Réponse incorrecte. Continuons la question...");
        
        // Reprendre l'animation de frappe après un court délai
        setTimeout(() => {
          this.resumeTyping();
        }, 1500);
      }
    }
  }
  
  // Afficher un feedback temporaire
  showTemporaryFeedback(message: string): void {
    // Cette méthode pourrait être implémentée de différentes façons
    // Par exemple, avec un toast ou une alerte temporaire
    this.alertService.info(message, '', false, 1500);
  }

// Vérifier la réponse
checkMapAnswer(): void {
  if (!this.currentMapQuestion || this.selectedMapOption === null) return;
  
  this.isMapAnswerCorrect = this.selectedMapOption === this.currentMapQuestion.correctOptionIndex;
  this.mapFeedbackMessage = this.isMapAnswerCorrect 
    ? this.currentMapQuestion.feedback.correct
    : this.currentMapQuestion.feedback.incorrect;
  this.questionState = 'feedback';
  
  if (this.isMapAnswerCorrect) {
    // Trouver et marquer le lieu comme découvert
    const locationId = this.currentMapQuestion.locationId;
    const location = this.originLocations.find(loc => loc.id === locationId);
    
    if (location && !location.discovered) {
      location.discovered = true;
      
      // Ajouter le marqueur sur la carte
      this.updateMarkers();
      
      // Mettre à jour les statistiques
      this.updateDataRecoveryPercentage();
      this.saveState();
      this.checkModuleCompletion();
    }
  } else {
    // Même si la réponse est incorrecte, on peut quand même révéler le lieu sur la carte
    const locationId = this.currentMapQuestion.locationId;
    const location = this.originLocations.find(loc => loc.id === locationId);
    
    if (location && !location.discovered) {
      location.discovered = true;
      this.updateMarkers();
      this.updateDataRecoveryPercentage();
      this.saveState();
    }
  }
}

// Passer à la question suivante
nextQuestion(): void {
  console.log('nextQuestion appelé', this.currentMapQuestionIndex);
  
  // Nettoyer tout timeout existant
  if (this.typingTimeout) {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = null;
  }
  
  // S'assurer que le lieu correspondant à la question actuelle est bien marqué comme découvert
  if (this.currentMapQuestion) {
    const locationId = this.currentMapQuestion.locationId;
    const location = this.originLocations.find(loc => loc.id === locationId);
    
    if (location && !location.discovered) {
      console.log(`Marquage de ${location.name} comme découvert avant de passer à la question suivante`);
      location.discovered = true;
      // Mettre à jour les marqueurs sur la carte
      this.updateMarkers();
    }
  }
  
  // Vérifier si nous avons déjà atteint la dernière question
  if (this.currentMapQuestionIndex >= this.mapQuestions.length - 1) {
    console.log('Dernière question déjà atteinte, passage en mode complétion');
    
    // S'assurer que tous les lieux sont marqués comme découverts
    this.mapQuestions.forEach(question => {
      const locationId = question.locationId;
      const location = this.originLocations.find(loc => loc.id === locationId);
      
      if (location && !location.discovered) {
        console.log(`Marquage final de ${location.name} comme découvert`);
        location.discovered = true;
      }
    });
    
    // Mettre à jour les marqueurs et statistiques
    this.updateMarkers();
    this.updateDataRecoveryPercentage();
    this.saveState();
    
    this.allLocationsDiscovered = true;
    this.checkModuleCompletion();
    return; // Important: arrêter l'exécution ici pour éviter la boucle
  }
  
  // Sinon, passer à la question suivante
  this.currentMapQuestionIndex++;
  this.setupNextMapQuestion();
  this.checkAllLocationsDiscovered();
}

// Mettre à jour les marqueurs sur la carte
updateMarkers(): void {
  if (!this.map) {
    console.log('Carte non initialisée');
    return;
  }
  
  console.log('Mise à jour des marqueurs', {
    découverts: this.originLocations.filter(loc => loc.discovered).length
  });
  
  // Supprimer tous les marqueurs actuels de la carte
  this.markers.forEach(m => {
    if (this.map) m.removeFrom(this.map);
  });
  this.markers = []; // Vider le tableau de marqueurs
  
  // Ajouter uniquement les marqueurs des lieux découverts
  this.originLocations.forEach(loc => {
    if (loc.discovered) {
      console.log(`Ajout du marqueur pour ${loc.name}`);
      const m = marker([loc.coordinates.lat, loc.coordinates.lng], {
        title: loc.name,
        icon: icon({
          iconUrl: 'leaflet/marker-icon.png',
          shadowUrl: 'leaflet/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      });
      
      m.bindPopup(`<b>${loc.name}</b><br>${loc.period}<br>${loc.description}`);
      m.addTo(this.map);
      this.markers.push(m);
    }
  });
}

// Vérifier si toutes les locations sont découvertes
// Vérifier si toutes les locations sont découvertes - version corrigée
checkAllLocationsDiscovered(): void {
  // Vérifier si toutes les questions ont été posées
  const allQuestionsAnswered = this.currentMapQuestionIndex >= this.mapQuestions.length;
  
  // S'assurer que tous les lieux correspondants aux questions répondues sont marqués comme découverts
  if (allQuestionsAnswered) {
    console.log("Vérification et mise à jour de l'état de découverte de tous les lieux");
    
    // Marquer tous les lieux correspondant aux questions comme découverts
    this.mapQuestions.forEach(question => {
      const locationId = question.locationId;
      const location = this.originLocations.find(loc => loc.id === locationId);
      
      if (location && !location.discovered) {
        console.log(`Marquage de ${location.name} comme découvert`);
        location.discovered = true;
      }
    });
    
    // Mettre à jour les marqueurs sur la carte
    this.updateMarkers();
    
    // Mettre à jour les statistiques
    this.updateDataRecoveryPercentage();
    this.saveState();
  }
  
  // Vérifier si tous les lieux sont maintenant découverts
  const allLocationsDiscoveredStatus = this.originLocations.every(loc => loc.discovered);
  
  console.log('checkAllLocationsDiscovered', { 
    allQuestionsAnswered,
    allLocationsDiscoveredStatus,
    currentIndex: this.currentMapQuestionIndex,
    totalQuestions: this.mapQuestions.length,
    locations: this.originLocations.map(loc => `${loc.name}: ${loc.discovered}`)
  });
  
  // Mettre à jour l'état de découverte
  this.allLocationsDiscovered = allQuestionsAnswered || allLocationsDiscoveredStatus;
  
  // Si tout est découvert, vérifier si le module peut être complété
  if (this.allLocationsDiscovered) {
    console.log('Toutes les locations sont découvertes ou toutes les questions sont répondues');
    this.checkModuleCompletion();
  }
}

// Méthode pour enregistrer une réponse
recordAnswer(questionId: string, isCorrect: boolean): void {
  this.correctMapAnswers.push({ 
    questionId: questionId, 
    correct: isCorrect 
  });
}

// Méthode pour obtenir le nombre de réponses correctes
getCorrectAnswersCount(): number {
  return this.correctMapAnswers.filter(answer => answer.correct).length;
}

// Méthode pour calculer le taux de réussite
calculateSuccessRate(): number {
  if (this.correctMapAnswers.length === 0) return 0;
  
  const correctCount = this.getCorrectAnswersCount();
  return Math.round((correctCount / this.mapQuestions.length) * 100);
}

// Obtenir le nombre de lieux découverts
// Ajouter cette méthode à la classe pour forcer la découverte de tous les lieux
forceDiscoverAllLocations(): void {
  console.log("Forçage de la découverte de tous les lieux");
  
  // Marquer tous les lieux comme découverts
  this.originLocations.forEach(location => {
    if (!location.discovered) {
      console.log(`Marquage forcé de ${location.name} comme découvert`);
      location.discovered = true;
    }
  });
  
  // Mettre à jour les marqueurs sur la carte
  this.updateMarkers();
  
  // Mettre à jour les statistiques
  this.updateDataRecoveryPercentage();
  this.saveState();
  
  // Marquer le module comme complété
  this.allLocationsDiscovered = true;
  this.checkModuleCompletion();
}

// Modifier la méthode getDiscoveredLocationsCount pour s'assurer qu'elle renvoie le bon nombre
getDiscoveredLocationsCount(): number {
  // Compter le nombre de lieux découverts
  const discoveredCount = this.originLocations.filter(loc => loc.discovered).length;
  console.log(`Nombre de lieux découverts: ${discoveredCount}/${this.originLocations.length}`);
  
  // Si toutes les questions ont été posées mais qu'aucun lieu n'est découvert, forcer la découverte
  if (this.currentMapQuestionIndex >= this.mapQuestions.length - 1 && discoveredCount === 0) {
    console.log("Détection d'anomalie: toutes les questions posées mais aucun lieu découvert");
    this.forceDiscoverAllLocations();
    return this.originLocations.length; // Retourner le nombre total après forçage
  }
  
  return discoveredCount;
}

// Obtenir la classe CSS pour le message de performance
getPerformanceClass(): string {
  const rate = this.calculateSuccessRate();
  if (rate >= 80) return 'performance-excellent';
  if (rate >= 60) return 'performance-good';
  return 'performance-needs-improvement';
}

// Obtenir l'icône pour le message de performance
getPerformanceIcon(): string {
  const rate = this.calculateSuccessRate();
  if (rate >= 80) return 'bi-trophy-fill';
  if (rate >= 60) return 'bi-hand-thumbs-up-fill';
  return 'bi-lightbulb-fill';
}

// Obtenir un message d'encouragement basé sur la performance
getPerformanceMessage(): string {
  const rate = this.calculateSuccessRate();
  const correctAnswers = this.getCorrectAnswersCount();
  const totalQuestions = this.mapQuestions.length;
  
  if (rate >= 80) {
    return `Excellent travail d'investigation ! Avec ${correctAnswers} réponses correctes sur ${totalQuestions}, vous avez démontré une connaissance exceptionnelle du parcours du sujet.`;
  }
  
  if (rate >= 60) {
    return `Bon travail ! Avec ${correctAnswers} réponses correctes sur ${totalQuestions}, vous avez bien cerné le parcours du sujet, même si quelques détails vous ont échappé.`;
  }
  
  return `Vous avez réussi à découvrir les origines du sujet avec ${correctAnswers} réponses correctes sur ${totalQuestions}. Vous pourriez approfondir votre connaissance de son parcours pour votre prochaine mission.`;
}
}
