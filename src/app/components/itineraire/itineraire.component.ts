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

  //données

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

    // Créer les marqueurs à partir des localisations
    this.originLocations.forEach((loc) => {
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
      this.markers.push(m);
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
    this.map = map;
    this.markers.forEach((m) => m.addTo(this.map));
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

  nextQuestion(): void {
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
}
