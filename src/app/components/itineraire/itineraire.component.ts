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
import { UserDataService } from '../../services/user-data.service';
import { Router } from '@angular/router';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { latLng, tileLayer, Map, marker, Marker, icon } from 'leaflet';
import { Chart, TooltipItem } from 'chart.js/auto';

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
  isModuleCompleted: boolean = false;

  // Statistiques
  dataRecoveryPercentage: number = 35;

  // Coordonnées géographiques réelles pour les lieux
  originLocations: Location[] = [
    {
      id: 'loc1',
      name: 'Toulouse',
      period: '2024 - Présent',
      description:
        'Lieu de résidence actuel et ville d\'études pour le Master Informatique à l\'Université de Toulouse Jean Jaurès.',
      coordinates: { lat: 43.6047, lng: 1.4442 }, // Coordonnées réelles de Toulouse
      data: [
        { label: 'Influence', value: 'Actuelle' },
        { label: 'Formation', value: 'Master Informatique' },
        { label: "Secteur d'activité", value: 'Développement Fullstack' },
      ],
      discovered: false,
    },
    {
      id: 'loc2',
      name: 'Marseille',
      period: '2024 - Présent',
      description:
        'Lieu de l\'alternance chez ANG Tech, où se déroule l\'expérience professionnelle actuelle en développement Fullstack.',
      coordinates: { lat: 43.2965, lng: 5.3698 }, // Coordonnées réelles de Marseille
      data: [
        { label: 'Influence', value: 'Professionnelle' },
        { label: 'Expérience', value: 'Développement 3D' },
        { label: 'Connexions', value: 'Professionnelles' },
      ],
      discovered: false,
    },
    {
      id: 'loc3',
      name: 'Yaoundé, Cameroun',
      period: '2020 - 2023',
      description: 
        'Lieu des premières expériences professionnelles (stages chez SKOOVEL et Megasoft) et des études en Licence et DUT à l\'IUT de Bandjoun.',
      coordinates: { lat: 3.8480, lng: 11.5021 }, // Coordonnées réelles de Yaoundé
      data: [
        { label: 'Influence', value: 'Fondamentale' },
        { label: 'Formation initiale', value: 'Informatique' },
        { label: 'Expériences', value: 'Premières expériences professionnelles' },
      ],
      discovered: false,
    },
    {
      id: 'loc4',
      name: 'Bandjoun, Cameroun',
      period: '2020 - 2023',
      description: 
        'Site de l\'IUT où ont été suivies les formations de DUT Génie Logiciel et de Licence Informatique et réseau.',
      coordinates: { lat: 5.3772, lng: 10.4111 }, // Coordonnées approximatives de Bandjoun
      data: [
        { label: 'Influence', value: 'Académique' },
        { label: 'Formation', value: 'DUT et Licence' },
        { label: 'Environnement', value: 'Universitaire' },
      ],
      discovered: false,
    },
  ];

  selectedLocation: Location | null = null;

  // Données pour la timeline de formation
  educationTimeline: Education[] = [
    {
      id: 'edu1',
      years: '2024 - En cours',
      title: 'Master Informatique',
      institution: 'Université de Toulouse Jean Jaurès, Toulouse',
      description:
        "Formation avancée en informatique avec spécialisation en développement d'applications, réalisée en alternance pour combiner théorie et pratique professionnelle chez ANG Tech.",
      skills: [
        'Développement Fullstack',
        'Intégration 3D',
        'Architecture logicielle',
        'DevOps & CI/CD',
      ],
      achievements: [
        "Projet d'alternance : Développement d'une application web/mobile avec intégration 3D",
        "Mise en place de pipelines CI/CD avec GitLab",
        "Rédaction de documentation technique complète"
      ],
      discovered: true,
      expanded: false,
    },
    {
      id: 'edu2',
      years: '2022 - 2023',
      title: 'Licence Informatique et réseau',
      institution: 'IUT de Bandjoun, Cameroun',
      description:
        "Formation approfondie en informatique et réseaux, avec un focus sur les technologies web, les architectures de systèmes d'information et la sécurité informatique.",
      skills: [
        'Programmation avancée',
        'Architecture réseau',
        'Sécurité des systèmes',
        'Bases de données relationnelles',
      ],
      achievements: [
        "Stage de 10 mois chez SKOOVEL en tant que consultant informatique",
        "Projets académiques en développement web et gestion de bases de données",
        "Analyse de données et support technique en environnement professionnel"
      ],
      discovered: true,
      expanded: false,
    },
    {
      id: 'edu3',
      years: '2020 - 2022',
      title: 'DUT Génie Logiciel',
      institution: 'IUT de Bandjoun, Cameroun',
      description:
        "Formation technique axée sur le développement logiciel, les méthodologies de conception et la programmation, établissant des bases solides en développement d'applications.",
      skills: [
        'Java',
        'PHP',
        'JavaScript',
        'Conception orientée objet',
      ],
      achievements: [
        "Stage de 3 mois chez Megasoft Sarl en développement web",
        "Intégration d'API REST et maintenance d'applications",
        "Optimisation de requêtes SQL et tests unitaires"
      ],
      discovered: true,
      expanded: false,
    }
  ];

  // Données pour les graphiques
  skillsEvolution: SkillEvolution[] = [
    { year: '2020', level: 30, tooltip: 'Début DUT Génie Logiciel - Bases de programmation' },
    { year: '2021', level: 45, tooltip: 'Milieu DUT - Compétences web fondamentales' },
    { year: '2022', level: 60, tooltip: 'Stage Megasoft + Début Licence - Développement web et API' },
    { year: '2023', level: 75, tooltip: 'Stage SKOOVEL - Polyvalence technique et bases de données' },
    { year: '2024', level: 85, tooltip: 'Début Master et alternance - Développement Fullstack' },
    { year: '2025', level: 95, tooltip: 'Projection - Expertise 3D et DevOps avancé' },
  ];

  keyIndicators: KeyIndicator[] = [
    { label: 'Années de formation', value: '5', trend: 'up' },
    { label: 'Expériences professionnelles', value: '3', trend: 'up' },
    { label: "Niveau d'expertise fullstack", value: 'Intermédiaire', trend: 'up' },
    { label: 'Technologies maîtrisées', value: '10+', trend: 'up' },
    { label: 'Compétences 3D web', value: 'Spécialisation', trend: 'up' },
    { label: 'Mobilité géographique', value: '2 pays', trend: 'neutral' },
  ];

  isQuizModalOpen: boolean = false;

  quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      text: 'Quelle est la formation la plus récente du parcours éducatif ?',
      options: [
        'Licence Informatique et réseau',
        'Master Informatique',
        'DUT Génie Logiciel',
        'Stage chez SKOOVEL',
      ],
      correctOptionIndex: 1,
      feedback: {
        correct:
          'Correct ! Le Master Informatique à l\'Université de Toulouse Jean Jaurès est la formation la plus récente (2024-en cours).',
        incorrect:
          'Incorrect. Le Master Informatique à l\'Université de Toulouse Jean Jaurès (2024-en cours) est la formation la plus récente du parcours.',
      },
    },
    {
      id: 'q2',
      text: 'Dans quelle ville le développeur effectue-t-il actuellement son alternance ?',
      options: ['Toulouse', 'Yaoundé', 'Marseille', 'Bandjoun'],
      correctOptionIndex: 2,
      feedback: {
        correct:
          'Correct ! L\'alternance chez ANG Tech se déroule à Marseille.',
        incorrect:
          'Incorrect. L\'alternance chez ANG Tech se déroule à Marseille, tandis que le Master est suivi à Toulouse.',
      },
    },
    {
      id: 'q3',
      text: 'Quelle technologie spécifique est mise en avant dans le poste actuel d\'alternant ?',
      options: [
        'Intelligence artificielle',
        'Blockchain',
        'Intégration 3D',
        'Internet des objets (IoT)',
      ],
      correctOptionIndex: 2,
      feedback: {
        correct:
          'Correct ! L\'intégration 3D est une technologie clé dans le poste actuel chez ANG Tech, avec le développement d\'une application web/mobile incorporant des fonctionnalités 3D.',
        incorrect:
          'Incorrect. L\'intégration 3D est la technologie spécifique mise en avant dans le poste actuel, notamment pour l\'analyse des mesures corporelles.',
      },
    },
    {
      id: 'q4',
      text: 'Quel est le niveau d\'expertise fullstack atteint en 2024 selon l\'évolution des compétences ?',
      options: ['60%', '75%', '85%', '95%'],
      correctOptionIndex: 2,
      feedback: {
        correct:
          'Correct ! En 2024, le niveau d\'expertise fullstack est de 85%, correspondant au début du Master et de l\'alternance.',
        incorrect:
          'Incorrect. En 2024, le niveau d\'expertise fullstack est de 85%, marquant le début du Master Informatique et de l\'alternance chez ANG Tech.',
      },
    },
    {
      id: 'q5',
      text: 'Quel framework frontend est principalement utilisé dans le poste actuel ?',
      options: [
        'React',
        'Angular',
        'Vue.js',
        'Svelte',
      ],
      correctOptionIndex: 2,
      feedback: {
        correct:
          'Correct ! Vue.js est le framework frontend principal utilisé chez ANG Tech pour le développement de l\'application web/mobile avec intégration 3D.',
        incorrect:
          'Incorrect. Vue.js est le framework frontend principalement utilisé dans le poste actuel pour développer l\'interface utilisateur de l\'application avec intégration 3D.',
      },
    },
    {
      id: 'q6',
      text: 'Combien d\'expériences professionnelles figurent dans le parcours du développeur ?',
      options: [
        '1',
        '2',
        '3',
        '4',
      ],
      correctOptionIndex: 2,
      feedback: {
        correct:
          'Correct ! Le parcours comprend 3 expériences professionnelles : alternance chez ANG Tech, stage chez SKOOVEL et stage chez Megasoft.',
        incorrect:
          'Incorrect. Le parcours comprend 3 expériences professionnelles distinctes : l\'alternance actuelle chez ANG Tech, le stage de 10 mois chez SKOOVEL et le stage de 3 mois chez Megasoft.',
      },
    },
    {
      id: 'q7',
      text: 'Quel outil DevOps est utilisé pour les pipelines CI/CD dans le poste actuel ?',
      options: [
        'Jenkins',
        'GitHub Actions',
        'GitLab CI/CD',
        'Azure DevOps',
      ],
      correctOptionIndex: 2,
      feedback: {
        correct:
          'Correct ! GitLab CI/CD est l\'outil utilisé pour mettre en place des pipelines d\'intégration et de déploiement continus chez ANG Tech.',
        incorrect:
          'Incorrect. GitLab CI/CD est l\'outil DevOps utilisé dans le poste actuel pour automatiser les tests et déploiements.',
      },
    },
  ];

  statut: string = ""

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
    zoom: 3,
    center: latLng([30.8566, 2.3522])
  };

  constructor(
    private progressService: ProgressService,
    private router: Router,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('itineraire')) {
      console.warn("Ce module n'est pas encore disponible");
    }

    // Vérifier si le module est déjà complété
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe((statuses) => {
        this.isModuleCompleted = statuses.itineraire;

        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadSavedState();
          this.statut = "TERMINÉ"
        } else {
          this.initializeData();
          this.statut = "EN COURS"
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

    this.initSkillsChart();
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions pour éviter les fuites de mémoire
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  initSkillsChart() {
    const ctx = document.getElementById('skillsEvolutionChart') as HTMLCanvasElement;
    
    const skillsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.skillsEvolution.map(skill => skill.year),
        datasets: [{
          label: 'Niveau de compétence',
          data: this.skillsEvolution.map(skill => skill.level),
          backgroundColor: 'rgba(0, 191, 255, 0.6)',
          borderColor: 'rgba(0, 191, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'bar'>) => {
                const index = context.dataIndex;
                return this.skillsEvolution[index].tooltip;
              }
            }
          }
        }
      }
    });
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
