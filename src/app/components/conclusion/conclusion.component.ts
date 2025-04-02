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

interface KeyStat {
  icon: string;
  value: string;
  label: string;
  highlight: boolean;
}

interface Keyword {
  text: string;
  category: string;
}

interface KeyFinding {
  icon: string;
  title: string;
  description: string;
  source: string;
}

interface CompatibilityFactor {
  name: string;
  level: number; // 1-10
}

interface CompatibilityEnvironment {
  name: string;
  icon: string;
  score: number; // percentage
}

interface RecommendationItem {
  content: string;
}

interface RecommendationCategory {
  title: string;
  icon: string;
  expanded: boolean;
  items: RecommendationItem[];
}

interface CvAnnotation {
  id: string;
  title: string;
  text: string;
  position: {
    top: number;
    left: number;
  };
}

@Component({
  selector: 'app-conclusion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conclusion.component.html',
  styleUrls: ['./conclusion.component.css'],
})
export class ConclusionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Félicitations, agent. L'enquête motivationnelle est maintenant complète. Vous avez recueilli suffisamment d'indices pour dresser un portrait complet du profil. Ce rapport synthétise l'ensemble des découvertes et présente nos conclusions ainsi que des recommandations stratégiques. Examinez-le attentivement avant transmission au département des ressources humaines.";
  private subscriptions: Subscription[] = [];

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Données de progression et de temps
  totalElapsedSeconds: number = 0;
  moduleProgressPercentage: number = 100; // La conclusion est toujours à 100%

  // Taux de complétion global
  completionRate: number = 97;

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
  label: 'Potentiel d\'apprentissage',
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
    'Développement d\'une expertise distinctive en intégration 3D dans les applications web, montrant une capacité à maîtriser des technologies complexes et innovantes.',
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
    "Attention particulière portée à la documentation technique et aux méthodologies de développement, démontrant une approche structurée et professionnelle.",
  source: "Expériences professionnelles et compétences mentionnées",
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
      content:
        'Structure offrant du mentorat par des développeurs seniors',
    },
    {
      content:
        'Environnement favorisant l\'innovation technique et l\'exploration des nouvelles technologies',
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
        'Applications web/mobile avec composante 3D ou traitement d\'images',
    },
    {
      content:
        'Projets fullstack impliquant à la fois frontend Vue.js et backend API REST',
    },
    {
      content:
        'Initiatives incluant des aspects DevOps et CI/CD',
    },
    {
      content:
        'Projets nécessitant une documentation technique rigoureuse',
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
        'Environnement respectant l\'équilibre entre vie professionnelle et personnelle',
    },
    {
      content:
        'Flexibilité pour concilier les passions (cuisine, chant, basketball)',
    },
    { content: 'Possibilité de travail hybride ou télétravail partiel' },
    {
      content:
        'Culture d\'entreprise valorisant la créativité et l\'expression personnelle',
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
  text: "Parcours complet du DUT au Master, avec spécialisation progressive en développement Fullstack.",
  position: {
    top: 260,
    left: 45,
  },
},
{
  id: '2',
  title: 'Expérience en alternance',
  text: "Poste actuel permettant de développer une expertise distinctive en intégration 3D et API REST.",
  position: {
    top: 120,
    left: 60,
  },
},
{
  id: '3',
  title: 'Compétences techniques',
  text: "Profil Fullstack équilibré entre frontend, backend, et compétences complémentaires (DevOps, documentation).",
  position: {
    top: 140,
    left: 10,
  },
},
{
  id: '4',
  title: 'Centres d\'intérêt',
  text: "Personnalité équilibrée avec des intérêts variés (cuisine, chant, basketball, technologies) témoignant d'une ouverture d'esprit.",
  position: {
    top: 210,
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
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('conclusion')) {
      console.warn("Ce module n'est pas encore disponible");
      // Logique de redirection à implémenter si nécessaire
    }

    // Récupérer le temps écoulé en secondes
    this.totalElapsedSeconds = this.timeTrackerService.getElapsedSeconds();

    // Vérifier si le module est déjà complété
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe((statuses) => {
        // Si toutes les étapes précédentes ne sont pas complétées, ce composant ne devrait pas être accessible
        if (!this.progressService.allModulesCompleted()) {
          // Redirection ou message
        }

        // Charger les configurations sauvegardées si elles existent
        this.loadSavedState();
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

    // Charger le taux de progression global
    this.completionRate = this.progressService.getCompletionPercentage();

    // Marquer le module comme complété s'il ne l'est pas déjà
    /*if (!this.progressService.moduleStatuses$.value.conclusion) {
      this.completeModule();
    }*/
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

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: '', // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective',
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText, () => {
      setTimeout(() => {
        this.dialogService.closeDialog();
      }, 3000);
    });
  }

  // Fermer le dialogue
  closeDialogTypeWriter(): void {
    this.dialogService.closeDialog();
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
  }

  toggleAnnotations(): void {
    this.showAnnotations = !this.showAnnotations;
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

    // Simuler la génération de rapport
    setTimeout(() => {
      alert(
        'Rapport généré avec succès ! Le document a été préparé pour le département RH.'
      );
    }, 1500);
  }

  initiateFollowUp(): void {
    // Enregistrer l'action
    this.userDataService.saveResponse(
      'conclusion',
      'follow_up_scheduled',
      true
    );

    // Simuler la planification de suivi
    setTimeout(() => {
      alert(
        'Suivi planifié avec succès ! Une notification a été envoyée au responsable concerné.'
      );
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
}
