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
import { CompatibilityEnvironment } from '../../models/conclusion/compatibility-environment';
import { CompatibilityFactor } from '../../models/conclusion/compatibility-factor';
import { CvAnnotation } from '../../models/conclusion/cv-annotation';
import { KeyFinding } from '../../models/conclusion/key-finding';
import { KeyStat } from '../../models/conclusion/key-stat';
import { Keyword } from '../../models/conclusion/keyword';
import { RecommendationCategory } from '../../models/conclusion/recommendation-category';
import { DialogMessage } from '../../models/others/dialod-message';

@Component({
  selector: 'app-conclusion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conclusion.component.html',
  styleUrls: ['./conclusion.component.css'],
})
export class ConclusionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Pour gérer la destruction proprement
  private destroy$ = new Subject<void>();

  // Gérer les timeouts
  private introDialogTimeoutId: number | null = null;
  private closeDialogTimeoutId: number | null = null;
  private chartInitTimeoutId: number | null = null;
  private annotationTimeoutId: number | null = null;
  private reportGenerationTimeoutId: number | null = null;
  private followUpTimeoutId: number | null = null;

  // Gestionnaire d'événement pour le resize
  private boundHandleResize: () => void;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Félicitations, agent. L'enquête motivationnelle est maintenant complète. Vous avez recueilli suffisamment d'indices pour dresser un portrait complet du profil. Ce rapport synthétise l'ensemble des découvertes et présente nos conclusions ainsi que des recommandations stratégiques. Examinez-le attentivement avant transmission au département des ressources humaines.";

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Données de progression et de temps
  totalElapsedSeconds: number = 0;
  moduleProgressPercentage: number = 100; // La conclusion est toujours à 100%

  // Taux de complétion global
  completionRate: number = 97;

  // Chart

  @ViewChild('compatibilityChart')
  compatibilityChartCanvas!: ElementRef<HTMLCanvasElement>;

  private compatibilityRadarChart: Chart | null = null;

  // Chemin vers l'image du CV
  cvImagePath: string = '/img/cv.jpg';

  // État de l'affichage
  viewMode: 'grid' | 'list' = 'grid';
  showCvModal: boolean = false;
  showAnnotations: boolean = true;

  // Contenu du résumé
  investigationSummary: string =
    "L'analyse approfondie du profil professionnel a révélé un <strong>développeur Fullstack en formation</strong> avec une passion pour les <strong>technologies web modernes</strong> et l'<strong>intégration 3D</strong>. Les éléments recueillis montrent un parcours académique solide complété par des <strong>expériences professionnelles complémentaires</strong>, témoignant d'une capacité d'<strong>adaptation</strong> et d'une <strong>curiosité technique</strong> remarquables.<br><br>Le profil démontre un équilibre entre <strong>compétences frontend et backend</strong>, avec un intérêt particulier pour les <strong>technologies Vue.js</strong> et les <strong>architectures API REST</strong>. L'investigation a également mis en évidence une <strong>rigueur méthodologique</strong> dans la documentation technique et une volonté d'<strong>amélioration continue</strong>. L'alternance actuelle lui permet d'appliquer ses connaissances académiques dans un contexte professionnel, tout en développant des compétences en <strong>technologies 3D</strong> et <strong>DevOps</strong>.";

  // Mots-clés du résumé
  summaryKeywords: Keyword[] = [
    { text: 'Fullstack', category: 'technical' },
    { text: 'Vue.js', category: 'technical' },
    { text: 'Intégration 3D', category: 'technical' },
    { text: 'API REST', category: 'technical' },
    { text: 'Documentation', category: 'soft' },
    { text: 'Alternance', category: 'preference' },
    { text: 'Adaptabilité', category: 'personality' },
    { text: 'Rigueur', category: 'soft' },
  ];

  // Statistiques clés
  keyStats: KeyStat[] = [
    {
      icon: 'bi-code-slash',
      value: '85%',
      label: 'Polyvalence technique',
      highlight: true,
    },
    {
      icon: 'bi-window',
      value: '90%',
      label: 'Maîtrise frontend',
      highlight: true,
    },
    {
      icon: 'bi-server',
      value: '80%',
      label: 'Compétences backend',
      highlight: false,
    },
    {
      icon: 'bi-mortarboard',
      value: '95%',
      label: "Potentiel d'apprentissage",
      highlight: true,
    },
  ];

  // Éléments clés
  keyFindings: KeyFinding[] = [
    {
      icon: 'bi-mortarboard',
      title: 'Formation et alternance',
      description:
        "Parcours académique complet du DUT au Master, avec choix stratégique de l'alternance pour combiner théorie et pratique professionnelle dans le développement d'applications.",
      source: 'Analyse du parcours académique et professionnel',
    },
    {
      icon: 'bi-box',
      title: 'Spécialisation 3D',
      description:
        "Développement d'une expertise distinctive en intégration 3D dans les applications web, montrant une capacité à maîtriser des technologies complexes et innovantes.",
      source: 'Expérience chez ANG Tech',
    },
    {
      icon: 'bi-code-slash',
      title: 'Polyvalence technique',
      description:
        "Maîtrise équilibrée des technologies frontend (Vue.js, Angular) et backend (Spring Boot, Symfony, Node.js), caractéristique d'un véritable profil Fullstack.",
      source: 'Analyse des compétences techniques',
    },
    {
      icon: 'bi-file-text',
      title: 'Documentation et méthodologie',
      description:
        'Attention particulière portée à la documentation technique et aux méthodologies de développement, démontrant une approche structurée et professionnelle.',
      source: 'Expériences professionnelles et compétences mentionnées',
    },
  ];

  // Facteurs de compatibilité
  compatibilityFactors: CompatibilityFactor[] = [
    { name: 'Développement Fullstack', level: 8 },
    { name: 'Technologies 3D', level: 9 },
    { name: 'Vue.js/Angular', level: 8 },
    { name: 'DevOps/CI-CD', level: 7 },
    { name: 'Documentation', level: 8 },
    { name: 'Adaptabilité', level: 9 },
  ];

  // Environnements de compatibilité
  compatibilityEnvironments: CompatibilityEnvironment[] = [
    { name: 'Agence web innovante', icon: 'bi-lightbulb', score: 95 },
    { name: 'Startup technologie 3D', icon: 'bi-box', score: 93 },
    { name: 'Équipe produit web/mobile', icon: 'bi-phone', score: 90 },
    { name: 'Service IT grande entreprise', icon: 'bi-building', score: 75 },
    { name: 'Freelance / Indépendant', icon: 'bi-person', score: 65 },
  ];

  // Texte d'introduction des recommandations
  recommendationsIntro: string =
    "En se basant sur l'analyse du profil et du parcours en cours, nous recommandons un environnement professionnel qui favorise le développement des compétences Fullstack tout en permettant l'approfondissement des technologies 3D. Les caractéristiques suivantes constitueraient un cadre optimal pour la poursuite du développement professionnel après l'obtention du Master.";

  // Catégories de recommandations
  recommendationCategories: RecommendationCategory[] = [
    {
      title: 'Environnement de travail',
      icon: 'bi-building',
      expanded: true,
      items: [
        {
          content:
            "Équipe technique pluridisciplinaire permettant d'échanger avec des experts en frontend, backend et 3D",
        },
        {
          content:
            "Culture valorisant l'équilibre entre études et travail pendant l'alternance",
        },
        {
          content: 'Structure offrant du mentorat par des développeurs seniors',
        },
        {
          content:
            "Environnement favorisant l'innovation technique et l'exploration des nouvelles technologies",
        },
      ],
    },
    {
      title: 'Type de projets',
      icon: 'bi-briefcase',
      expanded: false,
      items: [
        {
          content:
            "Applications web/mobile avec composante 3D ou traitement d'images",
        },
        {
          content:
            'Projets fullstack impliquant à la fois frontend Vue.js et backend API REST',
        },
        {
          content: 'Initiatives incluant des aspects DevOps et CI/CD',
        },
        {
          content: 'Projets nécessitant une documentation technique rigoureuse',
        },
      ],
    },
    {
      title: 'Développement professionnel',
      icon: 'bi-graph-up',
      expanded: false,
      items: [
        {
          content:
            'Évolution vers un rôle de développeur Fullstack senior avec spécialisation 3D',
        },
        {
          content:
            'Formation continue sur les frameworks frontend et backend modernes',
        },
        { content: 'Approfondissement des compétences DevOps et CI/CD' },
        {
          content:
            'Préparation à des responsabilités techniques et de gestion de projets',
        },
      ],
    },
    {
      title: 'Équilibre personnel',
      icon: 'bi-heart',
      expanded: false,
      items: [
        {
          content:
            "Environnement respectant l'équilibre entre vie professionnelle et personnelle",
        },
        {
          content:
            'Flexibilité pour concilier les passions (cuisine, chant, basketball)',
        },
        { content: 'Possibilité de travail hybride ou télétravail partiel' },
        {
          content:
            "Culture d'entreprise valorisant la créativité et l'expression personnelle",
        },
      ],
    },
  ];

  // Texte des prochaines étapes
  nextStepsText: string =
    "Pour tirer pleinement parti de cette analyse, nous recommandons de finaliser le Master Informatique en continuant à développer l'expertise en intégration 3D acquise chez ANG Tech. À l'issue de l'alternance, une orientation vers des entreprises combinant développement web innovant et technologies 3D permettrait de valoriser au mieux ce profil unique. L'accent devrait être mis sur des projets fullstack complets permettant d'exercer les compétences techniques dans leur ensemble.";

  // Annotations du CV
  cvAnnotations: CvAnnotation[] = [
    {
      id: '1',
      title: 'Formation académique',
      text: 'Parcours complet du DUT au Master, avec spécialisation progressive en développement Fullstack.',
      position: {
        top: 85,
        left: 50,
      },
    },
    {
      id: '2',
      title: 'Expérience en alternance',
      text: 'Poste actuel permettant de développer une expertise distinctive en intégration 3D et API REST.',
      position: {
        top: 40,
        left: 50,
      },
    },
    {
      id: '3',
      title: 'Compétences techniques',
      text: 'Profil Fullstack équilibré entre frontend, backend, et compétences complémentaires (DevOps, documentation).',
      position: {
        top: 45,
        left: 10,
      },
    },
    {
      id: '4',
      title: "Centres d'intérêt",
      text: "Personnalité équilibrée avec des intérêts variés (cuisine, chant, basketball, technologies) témoignant d'une ouverture d'esprit.",
      position: {
        top: 67,
        left: 10,
      },
    },
  ];

  constructor(
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService
  ) {
    this.boundHandleResize = this.handleResize.bind(this);
  }

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('conclusion')) {
      console.warn("Ce module n'est pas encore disponible");
    }

    // Récupérer le temps écoulé en secondes
    this.totalElapsedSeconds = this.timeTrackerService.getElapsedSeconds();

    // Vérifier si le module est déjà complété
    this.progressService.moduleStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statuses) => {
        // Si toutes les étapes précédentes ne sont pas complétées, ce composant ne devrait pas être accessible
        if (!this.progressService.allModulesCompleted()) {
          // Redirection ou message
        }

        // Charger les configurations sauvegardées si elles existent
        this.loadSavedState();
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

    // Charger le taux de progression global
    this.completionRate = this.progressService.getCompletionPercentage();

    // Ajouter le gestionnaire d'événement pour le redimensionnement
    window.addEventListener('resize', this.boundHandleResize);
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService pour l'intro avec un timeout géré
    this.introDialogTimeoutId = window.setTimeout(() => {
      this.showIntroDialog();
      this.introDialogTimeoutId = null;
    }, 500);

    // Initialiser le graphique radar avec un timeout géré
    this.chartInitTimeoutId = window.setTimeout(() => {
      this.initCompatibilityChart();
      this.chartInitTimeoutId = null;
    }, 1000);
  }

  ngOnDestroy(): void {
    // Émettre le signal de destruction pour tous les observables
    this.destroy$.next();
    this.destroy$.complete();

    // Nettoyer tous les timeouts
    this.clearAllTimeouts();

    // Détruire le graphique Chart.js
    this.destroyCompatibilityChart();

    // Supprimer le gestionnaire d'événement pour le redimensionnement
    window.removeEventListener('resize', this.boundHandleResize);
  }

  // Nettoyer tous les timeouts
  private clearAllTimeouts(): void {
    const timeouts = [
      this.introDialogTimeoutId,
      this.closeDialogTimeoutId,
      this.chartInitTimeoutId,
      this.annotationTimeoutId,
      this.reportGenerationTimeoutId,
      this.followUpTimeoutId,
    ];

    timeouts.forEach((timeoutId) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    });
  }

  handleResize(): void {
    if (this.showCvModal) {
      this.adjustAnnotationPositions();
    }
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

  // Mettre à jour le temps dans les statistiques
  updateTimeInStats(time: string): void {
    const timeStatIndex = this.keyStats.findIndex(
      (stat) => stat.label === "Temps d'enquête"
    );
    if (timeStatIndex >= 0) {
      this.keyStats[timeStatIndex].value = time;
    }
  }

  // Charger l'état sauvegardé précédemment
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('conclusion');

    if (responses.length > 0) {
      // Charger le mode d'affichage
      const viewModeResponse = responses.find(
        (r) => r.questionId === 'view_mode'
      );
      if (
        viewModeResponse &&
        (viewModeResponse.response === 'grid' ||
          viewModeResponse.response === 'list')
      ) {
        this.viewMode = viewModeResponse.response as 'grid' | 'list';
      }

      // Charger l'état des catégories de recommandations
      this.recommendationCategories.forEach((category) => {
        const categoryResponse = responses.find(
          (r) =>
            r.questionId ===
            `category_${category.title.toLowerCase().replace(/\s+/g, '_')}`
        );
        if (
          categoryResponse &&
          typeof categoryResponse.response === 'boolean'
        ) {
          category.expanded = categoryResponse.response;
        }
      });
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder le mode d'affichage
    this.userDataService.saveResponse('conclusion', 'view_mode', this.viewMode);

    // Sauvegarder l'état des catégories de recommandations
    this.recommendationCategories.forEach((category) => {
      const categoryId = category.title.toLowerCase().replace(/\s+/g, '_');
      this.userDataService.saveResponse(
        'conclusion',
        `category_${categoryId}`,
        category.expanded
      );
    });
  }

  // Marquer le module comme complété
  completeModule(): void {
    this.progressService.completeModule('conclusion');
    this.addCompletionNote();
  }

  // Ajouter une note récapitulative automatique
  addCompletionNote(): void {
    // Convertir le temps écoulé en format lisible
    const hours = Math.floor(this.totalElapsedSeconds / 3600);
    const minutes = Math.floor((this.totalElapsedSeconds % 3600) / 60);

    // Formater les principaux mots-clés
    const keyKeywords = this.summaryKeywords
      .slice(0, 5)
      .map((kw) => kw.text)
      .join(', ');

    const noteContent = `
Enquête complétée le ${new Date().toLocaleDateString()}.
Durée totale: ${hours}h ${minutes}min.
Taux de complétion: ${this.completionRate}%.
Profil identifié: ${keyKeywords}.
Environnement recommandé: ${this.compatibilityEnvironments[0].name} (${
      this.compatibilityEnvironments[0].score
    }% de compatibilité).
    `;

    this.noteService.addNote(noteContent.trim());
  }

  // Ouvrir le panneau de notes
  toggleNotes(): void {
    this.noteService.toggleNotesVisibility();
  }

  // Gestion de l'affichage
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    this.saveState();
  }

  toggleCvModal(): void {
    this.showCvModal = !this.showCvModal;
    this.userDataService.saveResponse('conclusion', 'cv_modal_opened', true);

    // Si la modal est ouverte, ajuster les positions des annotations
    if (this.showCvModal) {
      setTimeout(() => {
        this.adjustAnnotationPositions();
      }, 100); // Petit délai pour s'assurer que la modal est rendue
    }
  }

  toggleAnnotations(): void {
    // Inverser l'état d'affichage des annotations
    this.showAnnotations = !this.showAnnotations;

    // Sauvegarder l'état
    this.userDataService.saveResponse(
      'conclusion',
      'show_annotations',
      this.showAnnotations
    );

    // Si les annotations sont maintenant visibles, réajuster leur position
    if (this.showAnnotations) {
      // Nettoyer tout timeout précédent
      if (this.annotationTimeoutId !== null) {
        clearTimeout(this.annotationTimeoutId);
      }

      // Utiliser setTimeout pour s'assurer que le DOM est mis à jour avant l'ajustement
      this.annotationTimeoutId = window.setTimeout(() => {
        this.adjustAnnotationPositions();
        this.annotationTimeoutId = null;
      }, 50);
    }
  }

  // Gestion des recommandations
  toggleCategory(category: RecommendationCategory): void {
    category.expanded = !category.expanded;
    this.saveState();
  }

  // Utilitaires
  getScoreClass(score: number): string {
    if (score >= 85) return 'score-high';
    if (score >= 70) return 'score-medium';
    return 'score-low';
  }

  // Actions
  generateFullReport(): void {
    // Enregistrer l'action
    this.userDataService.saveResponse('conclusion', 'report_generated', true);

    // Préparer les données pour l'exportation
    const reportData = this.prepareReportData();

    // Nettoyer tout timeout précédent
    if (this.reportGenerationTimeoutId !== null) {
      clearTimeout(this.reportGenerationTimeoutId);
    }

    // Simuler la génération de rapport
    this.reportGenerationTimeoutId = window.setTimeout(() => {
      alert(
        'Rapport généré avec succès ! Le document a été préparé pour le département RH.'
      );
      this.reportGenerationTimeoutId = null;
    }, 1500);
  }

  initiateFollowUp(): void {
    // Enregistrer l'action
    this.userDataService.saveResponse(
      'conclusion',
      'follow_up_scheduled',
      true
    );

    // Nettoyer tout timeout précédent
    if (this.followUpTimeoutId !== null) {
      clearTimeout(this.followUpTimeoutId);
    }

    // Simuler la planification de suivi
    this.followUpTimeoutId = window.setTimeout(() => {
      alert(
        'Suivi planifié avec succès ! Une notification a été envoyée au responsable concerné.'
      );
      this.followUpTimeoutId = null;
    }, 1500);
  }

  // Préparer les données pour l'exportation
  private prepareReportData(): any {
    // Cette fonction pourrait extraire et formater toutes les données pertinentes
    // des différents modules pour générer un rapport complet
    return {
      timestamp: new Date().toISOString(),
      completionRate: this.completionRate,
      findings: this.keyFindings,
      recommendations: this.recommendationCategories,
      compatibility: this.compatibilityEnvironments,
      // Vous pourriez ajouter d'autres données ici
    };
  }

  downloadCV(): void {
    // Ici, utilisez l'URL de votre PDF
    const pdfUrl = '/doc/cv.pdf';

    // Créer un lien temporaire
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'CV_Tchinda_Tchoffo_Timothée_Joel.pdf'; // Nom du fichier lors du téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  initCompatibilityChart(): void {
    // Nettoyer le graphique existant s'il y en a un
    this.destroyCompatibilityChart();

    // Vérifier que le canvas existe
    if (
      !this.compatibilityChartCanvas ||
      !this.compatibilityChartCanvas.nativeElement
    ) {
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

    // Récupérer les données du graphique depuis les facteurs de compatibilité
    const labels = this.compatibilityFactors.map((factor) => factor.name);
    const data = this.compatibilityFactors.map((factor) => factor.level);

    // Configurer le graphique
    const chartData: ChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Niveau de compatibilité',
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
            stepSize: 1, // Intervalles de 1
            backdropColor: 'transparent',
            color: '#00bfff',
            font: {
              size: 10,
              weight: 'bold' as const,
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
            color: '#d0d0ff',
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
          backgroundColor: 'rgba(30, 30, 60, 0.95)',
          titleColor: '#d0d0ff',
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
      animation: {
        duration: 1500,
        easing: 'easeOutQuart' as const, // Utiliser 'as const' pour type littéral
      },
    };

    // Configuration complète
    const config: ChartConfiguration = {
      type: 'radar',
      data: chartData,
      options: chartOptions,
    };

    // Créer le graphique
    const ctx = this.compatibilityChartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.compatibilityRadarChart = new Chart(ctx, config);
    } else {
      console.warn("Impossible d'obtenir le contexte 2D du canvas");
    }
  }

  updateCompatibilityChart(): void {
    if (this.compatibilityRadarChart) {
      const data = this.compatibilityFactors.map((factor) => factor.level);
      this.compatibilityRadarChart.data.datasets[0].data = data;
      this.compatibilityRadarChart.update();
    }
  }

  destroyCompatibilityChart(): void {
    if (this.compatibilityRadarChart) {
      this.compatibilityRadarChart.destroy();
      this.compatibilityRadarChart = null;
    }
  }

  private positionAnnotations(
    cvImage: HTMLImageElement,
    container: HTMLElement
  ): void {
    const imageWidth = cvImage.offsetWidth;
    const imageHeight = cvImage.offsetHeight;

    // Redimensionner le conteneur d'annotations pour qu'il corresponde à l'image
    container.style.width = `${imageWidth}px`;
    container.style.height = `${imageHeight}px`;

    // Sélectionner toutes les annotations
    const annotationElements = container.querySelectorAll('.cv-note');

    // Appliquer les positions relatives en pourcentages
    annotationElements.forEach((elem, index) => {
      const annotation = this.cvAnnotations[index];
      if (annotation) {
        (elem as HTMLElement).style.top = `${annotation.position.top}%`;
        (elem as HTMLElement).style.left = `${annotation.position.left}%`;
      }
    });
  }

  adjustAnnotationPositions(): void {
    const cvImage = document.querySelector(
      '.full-cv-image'
    ) as HTMLImageElement;
    const annotationsContainer = document.querySelector(
      '.cv-annotations'
    ) as HTMLElement;

    if (!cvImage || !annotationsContainer) return;

    // Attendre que l'image soit chargée pour obtenir ses dimensions réelles
    if (cvImage.complete) {
      this.positionAnnotations(cvImage, annotationsContainer);
    } else {
      cvImage.onload = () => {
        this.positionAnnotations(cvImage, annotationsContainer);
      };
    }
  }
}
