import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';
import { Router } from '@angular/router';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { latLng, tileLayer, Map, marker, Marker, Popup, icon } from 'leaflet';

// Interfaces pour les données
interface LocationData {
  label: string;
  value: string;
}

interface Location {
  id: string;
  name: string;
  period: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  data: LocationData[];
  discovered?: boolean;
}

interface Education {
  id: string;
  years: string;
  title: string;
  institution: string;
  description: string;
  skills: string[];
  achievements: string[];
  discovered: boolean;
  expanded: boolean;
}

interface SkillEvolution {
  year: string;
  level: number;
  tooltip: string;
}

interface KeyIndicator {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

@Component({
  selector: 'app-itineraire',
  standalone: true,
  imports: [CommonModule, LeafletModule],
  templateUrl: './itineraire.component.html',
  styleUrls: ['./itineraire.component.css'],
})
export class ItineraireComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;
  @ViewChild('map') mapElement!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, cette section détaille l'itinéraire personnel et éducatif du sujet. Examinez attentivement ces informations pour comprendre son parcours. Certaines données sont encore cryptées et nécessitent une découverte progressive. Collectez tous les éléments pour obtenir une vision complète de sa formation et de ses origines.";
  private subscriptions: Subscription[] = [];

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Données de progression et temps
  elapsedTime: string = '00:00:00';
  isModuleCompleted: boolean = false;
  moduleProgressPercentage: number = 0;

  // Statistiques
  dataRecoveryPercentage: number = 35;

  // Coordonnées géographiques réelles pour les lieux
  originLocations: Location[] = [
    {
      id: 'loc1',
      name: 'Paris',
      period: '2010 - Présent',
      description:
        'Lieu de résidence principal où se déroule la majorité de la carrière professionnelle.',
      coordinates: { lat: 48.8566, lng: 2.3522 }, // Coordonnées réelles de Paris
      data: [
        { label: 'Influence', value: 'Haute' },
        { label: 'Réseau professionnel', value: 'Étendu' },
        { label: "Secteur d'activité", value: 'Technologie' },
      ],
      discovered: false,
    },
    {
      id: 'loc2',
      name: 'Montpellier',
      period: '2005 - 2010',
      description:
        'Lieu des études supérieures et des premières expériences professionnelles.',
      coordinates: { lat: 43.6112, lng: 3.8767 }, // Coordonnées réelles de Montpellier
      data: [
        { label: 'Influence', value: 'Moyenne' },
        { label: 'Formation principale', value: 'Ingénierie' },
        { label: 'Connexions', value: 'Académiques' },
      ],
      discovered: false,
    },
    {
      id: 'loc3',
      name: 'Toulouse',
      period: '1985 - 2005',
      description: "Lieu d'origine et de formation initiale.",
      coordinates: { lat: 43.6047, lng: 1.4442 }, // Coordonnées réelles de Toulouse
      data: [
        { label: 'Influence', value: 'Fondamentale' },
        { label: 'Formation initiale', value: 'Sciences' },
        { label: 'Environnement', value: 'Familial' },
      ],
      discovered: false,
    },
  ];

  selectedLocation: Location | null = null;

  // Données pour la timeline de formation
  educationTimeline: Education[] = [
    {
      id: 'edu1',
      years: '2008 - 2010',
      title: 'Master en Génie Logiciel',
      institution: "École Supérieure d'Informatique, Paris",
      description:
        "Formation spécialisée dans la conception et le développement de systèmes informatiques complexes, avec une orientation vers l'architecture logicielle et les méthodes agiles.",
      skills: [
        'Conception Orientée Objet',
        'Architecture Logicielle',
        'Java/J2EE',
        'Gestion de Projet Agile',
      ],
      achievements: [
        "Projet de fin d'études : Développement d'une plateforme de collaboration en temps réel",
        'Participation au concours de programmation inter-écoles (3ème place)',
        "Stage de fin d'études dans une entreprise leader du secteur",
      ],
      discovered: true,
      expanded: false,
    },
    {
      id: 'edu2',
      years: '2005 - 2008',
      title: 'Licence en Informatique',
      institution: 'Université de Montpellier',
      description:
        "Formation fondamentale couvrant les aspects théoriques et pratiques de l'informatique, avec une spécialisation progressive vers le développement web et les bases de données.",
      skills: [
        'Programmation Web',
        'Bases de Données',
        'Algorithmes',
        'Réseaux',
      ],
      achievements: [
        "Projet étudiant : Création d'un système de gestion de bibliothèque",
        'Participation à un hackathon régional',
        'Tutorat auprès des étudiants de première année',
      ],
      discovered: true,
      expanded: false,
    },
    {
      id: 'edu3',
      years: '2003 - 2005',
      title: 'DUT Informatique',
      institution: 'IUT de Toulouse',
      description:
        "Formation technique et pratique axée sur les fondamentaux de l'informatique et les technologies du web, combinant théorie et applications concrètes par le biais de nombreux projets.",
      skills: ['HTML/CSS', 'PHP', 'SQL', 'JavaScript'],
      achievements: [
        "Développement d'un site web pour une association locale",
        "Stage en entreprise de 3 mois : Refonte d'un intranet",
        'Projet interdisciplinaire avec le département Communication',
      ],
      discovered: true,
      expanded: false,
    },
    {
      id: 'edu4',
      years: '2000 - 2003',
      title: 'Baccalauréat Scientifique',
      institution: 'Lycée Pierre de Fermat, Toulouse',
      description:
        'Formation générale avec une spécialisation en mathématiques et sciences physiques, développant une approche analytique et logique des problèmes.',
      skills: [
        'Mathématiques',
        'Physique',
        'Logique',
        'Méthodologie scientifique',
      ],
      achievements: [
        'Mention Très Bien',
        "Option informatique : Création d'un jeu simple en langage Pascal",
        'Participation aux Olympiades de Mathématiques',
      ],
      discovered: true,
      expanded: false,
    },
  ];

  // Données pour les graphiques
  skillsEvolution: SkillEvolution[] = [
    { year: '2003', level: 20, tooltip: 'Compétences techniques basiques' },
    { year: '2005', level: 35, tooltip: 'Développement web fondamental' },
    {
      year: '2008',
      level: 60,
      tooltip: 'Maîtrise des bases de données et frameworks',
    },
    { year: '2010', level: 75, tooltip: 'Architecture logicielle avancée' },
    {
      year: '2015',
      level: 85,
      tooltip: 'Expertise technique et gestion de projets',
    },
    {
      year: '2020',
      level: 95,
      tooltip: 'Maîtrise complète et vision stratégique',
    },
  ];

  keyIndicators: KeyIndicator[] = [
    { label: 'Années de formation', value: '10', trend: 'neutral' },
    { label: 'Spécialisations', value: '3', trend: 'up' },
    { label: "Niveau d'expertise", value: 'Expert', trend: 'up' },
    { label: 'Mobilité géographique', value: '3 villes', trend: 'neutral' },
  ];

  isQuizModalOpen: boolean = false;

  quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      text: 'Quelle est la formation la plus récente du parcours éducatif ?',
      options: [
        'Licence en Informatique',
        'Master en Génie Logiciel',
        'DUT Informatique',
        'Baccalauréat Scientifique',
      ],
      correctOptionIndex: 1,
      feedback: {
        correct:
          'Correct ! Le Master en Génie Logiciel est la formation la plus récente (2008-2010).',
        incorrect:
          'Incorrect. Le Master en Génie Logiciel (2008-2010) est la formation la plus récente du parcours.',
      },
    },
    {
      id: 'q2',
      text: 'Dans quelle ville le sujet a-t-il effectué sa formation initiale ?',
      options: ['Paris', 'Montpellier', 'Toulouse', 'Lyon'],
      correctOptionIndex: 2,
      feedback: {
        correct:
          "Correct ! Toulouse est le lieu d'origine et de formation initiale (1985-2005).",
        incorrect:
          "Incorrect. Toulouse est le lieu d'origine et de formation initiale du sujet (1985-2005).",
      },
    },
    {
      id: 'q3',
      text: 'Quelle compétence a été acquise pendant le DUT Informatique ?',
      options: [
        'Architecture Logicielle',
        'Algorithmes',
        'JavaScript',
        'Conception Orientée Objet',
      ],
      correctOptionIndex: 2,
      feedback: {
        correct:
          'Correct ! JavaScript fait partie des compétences acquises pendant le DUT Informatique.',
        incorrect:
          'Incorrect. JavaScript fait partie des compétences acquises pendant le DUT Informatique, avec HTML/CSS, PHP et SQL.',
      },
    },
    {
      id: 'q4',
      text: "Quel est le pourcentage d'évolution des compétences techniques en 2015 ?",
      options: ['60%', '75%', '85%', '95%'],
      correctOptionIndex: 2,
      feedback: {
        correct:
          "Correct ! En 2015, le niveau d'expertise technique était de 85%.",
        incorrect:
          'Incorrect. En 2015, le niveau d\'expertise technique était de 85%, correspondant à "Expertise technique et gestion de projets".',
      },
    },
    {
      id: 'q5',
      text: 'Quel projet a été réalisé pendant la Licence en Informatique ?',
      options: [
        "Développement d'une plateforme de collaboration en temps réel",
        "Création d'un système de gestion de bibliothèque",
        "Refonte d'un intranet",
        "Développement d'un jeu en langage Pascal",
      ],
      correctOptionIndex: 1,
      feedback: {
        correct:
          "Correct ! La création d'un système de gestion de bibliothèque était un projet réalisé pendant la Licence.",
        incorrect:
          "Incorrect. La création d'un système de gestion de bibliothèque était un projet réalisé pendant la Licence en Informatique.",
      },
    },
  ];

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
        attribution: '&amp;copy; OpenStreetMap contributors'
      })
    ],
    zoom: 5,
    center: latLng([48.8566, 2.3522])
  };

  constructor(
    private progressService: ProgressService,
    private router: Router,
    private timeTrackerService: TimeTrackerService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('itineraire')) {
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
        this.isModuleCompleted = statuses.itineraire;
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();

        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadSavedState();
        } else {
          this.initializeData();
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

    // Créer les marqueurs à partir des localisations
  this.originLocations.forEach(loc => {
    const m = marker([loc.coordinates.lat, loc.coordinates.lng], {
      title: loc.name,
      icon: icon({
        iconUrl: 'leaflet/marker-icon.png', // par défaut Leaflet, ou personnalise ici
        shadowUrl: 'leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    });

    m.bindPopup(`<b>${loc.name}</b><br>${loc.period}<br>${loc.description}`);
    this.markers.push(m);
  });
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService au lieu du typewriter manuel
    setTimeout(() => {
      this.showIntroDialog();
    }, 500);
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions pour éviter les fuites de mémoire
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onMapReady(map: Map) {
    this.map = map;
    this.markers.forEach(m => m.addTo(this.map));
  }
  

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: '', // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective',
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
