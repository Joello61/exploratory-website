import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
  styleUrls: ['./conclusion.component.css']
})
export class ConclusionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string = "Félicitations, agent. L'enquête motivationnelle est maintenant complète. Vous avez recueilli suffisamment d'indices pour dresser un portrait complet du profil. Ce rapport synthétise l'ensemble des découvertes et présente nos conclusions ainsi que des recommandations stratégiques. Examinez-le attentivement avant transmission au département des ressources humaines.";
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
  investigationSummary: string = "L'analyse approfondie du profil professionnel a révélé un <strong>candidat orienté vers l'innovation technique</strong> et les défis complexes, avec une forte propension à la <strong>résolution créative de problèmes</strong>. Les éléments recueillis montrent une trajectoire cohérente marquée par la <strong>recherche constante d'impact</strong> et une évolution vers des rôles offrant davantage d'<strong>autonomie décisionnelle</strong>.<br><br>Le profil démontre un équilibre rare entre <strong>expertise technique approfondie</strong> et <strong>vision stratégique</strong>, suggérant un potentiel significatif pour des postes à la frontière de ces deux domaines. L'investigation a également mis en évidence une motivation intrinsèque pour l'<strong>apprentissage continu</strong> et le <strong>partage de connaissances</strong>, des qualités essentielles dans un environnement professionnel en constante évolution.";

  // Mots-clés du résumé
  summaryKeywords: Keyword[] = [
    { text: 'Innovation', category: 'technical' },
    { text: 'Autonomie', category: 'soft' },
    { text: 'Impact', category: 'preference' },
    { text: 'Expertise technique', category: 'technical' },
    { text: 'Vision stratégique', category: 'soft' },
    { text: 'Apprentissage continu', category: 'personality' },
    { text: 'Résolution de problèmes', category: 'technical' },
    { text: 'Collaboratif', category: 'soft' }
  ];

  // Statistiques clés
  keyStats: KeyStat[] = [
    { icon: 'bi-stars', value: '92%', label: 'Indice de confiance', highlight: true },
    { icon: 'bi-bullseye', value: '87%', label: 'Précision du profil', highlight: false },
    { icon: 'bi-graph-up-arrow', value: '9/10', label: 'Potentiel d\'évolution', highlight: true },
    { icon: 'bi-puzzle', value: '85%', label: 'Adaptabilité', highlight: false }
  ];

  // Éléments clés
  keyFindings: KeyFinding[] = [
    {
      icon: 'bi-mortarboard',
      title: 'Formation et auto-apprentissage',
      description: 'Parcours académique structuré complété par une démarche continue d\'auto-formation, témoignant d\'une motivation intrinsèque pour la maîtrise et l\'évolution professionnelle.',
      source: 'Analyse des parcours académique et formation continue'
    },
    {
      icon: 'bi-graph-up-arrow',
      title: 'Évolution de carrière stratégique',
      description: 'Progression vers des rôles à plus forte autonomie et impact stratégique, guidée par la recherche de défis intellectuels croissants plutôt que par des considérations hiérarchiques.',
      source: 'Historique de carrière et transitions professionnelles'
    },
    {
      icon: 'bi-code-slash',
      title: 'Excellence technique et innovation',
      description: 'Pattern constant de recherche d\'équilibre entre optimisation technique et exploration créative, avec une préférence pour les solutions alliant rigueur et innovation.',
      source: 'Analyse des projets et contributions techniques'
    },
    {
      icon: 'bi-people',
      title: 'Équilibre collaboration/autonomie',
      description: 'Capacité démontrée à naviguer entre travail d\'équipe collaboratif et initiatives autonomes, avec une préférence pour les environnements offrant cette flexibilité.',
      source: 'Feedback d\'équipe et dynamiques de collaboration'
    }
  ];

  // Facteurs de compatibilité
  compatibilityFactors: CompatibilityFactor[] = [
    { name: 'Innovation', level: 9 },
    { name: 'Autonomie', level: 8 },
    { name: 'Expertise technique', level: 9 },
    { name: 'Vision stratégique', level: 7 },
    { name: 'Apprentissage', level: 9 },
    { name: 'Collaboration', level: 7 }
  ];

  // Environnements de compatibilité
  compatibilityEnvironments: CompatibilityEnvironment[] = [
    { name: 'Startup technologique', icon: 'bi-rocket', score: 95 },
    { name: 'Équipe R&D', icon: 'bi-lightbulb', score: 92 },
    { name: 'Direction technique', icon: 'bi-gear-wide-connected', score: 88 },
    { name: 'Consulting innovation', icon: 'bi-briefcase', score: 85 },
    { name: 'Structure traditionnelle', icon: 'bi-building', score: 65 }
  ];

  // Texte d'introduction des recommandations
  recommendationsIntro: string = "En se basant sur l'ensemble des données recueillies, nous recommandons un environnement professionnel qui valorise l'innovation technique tout en offrant un espace décisionnel autonome. Les caractéristiques suivantes constituent le cadre optimal pour maximiser le potentiel identifié et assurer un alignement durable avec les motivations intrinsèques du profil.";

  // Catégories de recommandations
  recommendationCategories: RecommendationCategory[] = [
    {
      title: 'Environnement de travail',
      icon: 'bi-building',
      expanded: true,
      items: [
        { content: 'Environnement favorisant l\'innovation et l\'exploration de nouvelles approches' },
        { content: 'Culture valorisant le partage de connaissances et l\'apprentissage continu' },
        { content: 'Structure flexible permettant une navigation entre expertise technique et vision stratégique' },
        { content: 'Équipes pluridisciplinaires avec une forte culture d\'excellence' }
      ]
    },
    {
      title: 'Type de missions',
      icon: 'bi-briefcase',
      expanded: false,
      items: [
        { content: 'Projets à fort impact présentant des défis techniques significatifs' },
        { content: 'Problématiques complexes nécessitant des approches innovantes' },
        { content: 'Initiatives permettant de concilier expertise technique et vision d\'ensemble' },
        { content: 'Responsabilités incluant à la fois conception et orientation stratégique' }
      ]
    },
    {
      title: 'Développement professionnel',
      icon: 'bi-graph-up',
      expanded: false,
      items: [
        { content: 'Trajectoire combinant approfondissement technique et élargissement stratégique' },
        { content: 'Opportunités régulières d\'exploration de nouvelles technologies' },
        { content: 'Mentorat et transmission de connaissances' },
        { content: 'Progression vers un rôle de leadership technique ou de direction technique' }
      ]
    }
  ];

  // Texte des prochaines étapes
  nextStepsText: string = "Pour tirer pleinement parti de cette analyse, nous recommandons d'élaborer un plan d'intégration ou d'évolution personnalisé qui capitalise sur les motivations identifiées. L'environnement professionnel doit être adapté pour offrir des défis techniques stimulants tout en permettant une implication progressive dans les orientations stratégiques.";

  // Annotations du CV
  cvAnnotations: CvAnnotation[] = [
    {
      id: '1',
      title: 'Formation académique',
      text: 'Parcours cohérent orienté vers la technique et l\'innovation, avec une spécialisation progressive.',
      position: {
        top: 15,
        left: 10
      }
    },
    {
      id: '2',
      title: 'Expérience professionnelle',
      text: 'Évolution vers des rôles à plus forte autonomie et responsabilité technique, avec une constante recherche d\'impact.',
      position: {
        top: 40,
        left: 68
      }
    },
    {
      id: '3',
      title: 'Compétences techniques',
      text: 'Maîtrise approfondie des technologies fondamentales complétée par des compétences émergentes, témoignant d\'une veille technologique active.',
      position: {
        top: 65,
        left: 20
      }
    },
    {
      id: '4',
      title: 'Projets personnels',
      text: 'Initiative d\'auto-formation et d\'exploration, révélatrice d\'une motivation intrinsèque pour l\'apprentissage et l\'innovation.',
      position: {
        top: 80,
        left: 60
      }
    }
  ];



  constructor(
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService,
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('conclusion')) {
      console.warn('Ce module n\'est pas encore disponible');
      // Logique de redirection à implémenter si nécessaire
    }

    // Récupérer le temps écoulé en secondes
    this.totalElapsedSeconds = this.timeTrackerService.getElapsedSeconds();

    // Vérifier si le module est déjà complété
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe(statuses => {
        // Si toutes les étapes précédentes ne sont pas complétées, ce composant ne devrait pas être accessible
        if (!this.progressService.allModulesCompleted()) {
          // Redirection ou message
        }
        
        // Charger les configurations sauvegardées si elles existent
        this.loadSavedState();
      })
    );

    this.subscriptions.push(
      this.dialogService.isDialogOpen$.subscribe(isOpen => {
        this.isDialogOpen = isOpen;
      }),
      this.dialogService.isTyping$.subscribe(isTyping => {
        this.isTyping = isTyping;
      }),
      this.dialogService.currentMessage$.subscribe(message => {
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
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: "", // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective'
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

  // Mettre à jour le temps dans les statistiques
  updateTimeInStats(time: string): void {
    const timeStatIndex = this.keyStats.findIndex(stat => stat.label === 'Temps d\'enquête');
    if (timeStatIndex >= 0) {
      this.keyStats[timeStatIndex].value = time;
    }
  }

  // Charger l'état sauvegardé précédemment
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('conclusion');
    
    if (responses.length > 0) {
      // Charger le mode d'affichage
      const viewModeResponse = responses.find(r => r.questionId === 'view_mode');
      if (viewModeResponse && (viewModeResponse.response === 'grid' || viewModeResponse.response === 'list')) {
        this.viewMode = viewModeResponse.response as 'grid' | 'list';
      }

      // Charger l'état des catégories de recommandations
      this.recommendationCategories.forEach(category => {
        const categoryResponse = responses.find(r => r.questionId === `category_${category.title.toLowerCase().replace(/\s+/g, '_')}`);
        if (categoryResponse && typeof categoryResponse.response === 'boolean') {
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
    this.recommendationCategories.forEach(category => {
      const categoryId = category.title.toLowerCase().replace(/\s+/g, '_');
      this.userDataService.saveResponse('conclusion', `category_${categoryId}`, category.expanded);
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
      .map(kw => kw.text)
      .join(', ');
    
    const noteContent = `
Enquête complétée le ${new Date().toLocaleDateString()}.
Durée totale: ${hours}h ${minutes}min.
Taux de complétion: ${this.completionRate}%.
Profil identifié: ${keyKeywords}.
Environnement recommandé: ${this.compatibilityEnvironments[0].name} (${this.compatibilityEnvironments[0].score}% de compatibilité).
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
      alert('Rapport généré avec succès ! Le document a été préparé pour le département RH.');
    }, 1500);
  }

  initiateFollowUp(): void {
    // Enregistrer l'action
    this.userDataService.saveResponse('conclusion', 'follow_up_scheduled', true);
    
    // Simuler la planification de suivi
    setTimeout(() => {
      alert('Suivi planifié avec succès ! Une notification a été envoyée au responsable concerné.');
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
}