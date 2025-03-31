import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';

interface Evidence {
  id: string;
  title: string;
  icon: string;
  date: string;
  description: string;
  keywords?: string[];
  discovered: boolean;
  connections: string[];
}

interface Connection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface MotivationProfile {
  id: string;
  name: string;
  icon: string;
  description: string;
  aspects: ProfileAspect[];
}

interface ProfileAspect {
  title: string;
  icon: string;
  description: string;
}

interface MotivationFactor {
  name: string;
  icon: string;
  level: number; // 1-10
}

@Component({
  selector: 'app-motivation-socio-pro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motivation-socio-pro.component.html',
  styleUrls: ['./motivation-socio-pro.component.css']
})
export class MotivationSocioProComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string = "Agent, nous entrons dans une phase critique de notre enquête. Nous devons maintenant analyser les motivations socio-professionnelles du sujet. Examinez les indices recueillis et établissez les connexions entre eux pour identifier les facteurs qui guident ses choix de carrière et ses aspirations. Cette analyse nous permettra de comprendre ce qui l'anime vraiment.";
  
  private subscriptions: Subscription[] = [];

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Données de progression et de temps
  elapsedTime: string = '00:00:00';
  isModuleCompleted: boolean = false;
  moduleProgressPercentage: number = 0;

  // État de l'investigation
  selectedEvidence: Evidence | null = null;
  showConnections: boolean = false;
  visibleConnections: Connection[] = [];
  boardWidth: number = 0;
  boardHeight: number = 0;

  // État de l'analyse
  analysisInProgress: boolean = false;
  analysisDone: boolean = false;
  currentStep: number = 0;
  selectedProfile: string | null = null;

  // Résultats d'analyse
  analysisSummary: string = "L'analyse des motivations socio-professionnelles révèle un profil orienté vers l'innovation et la résolution de problèmes complexes, avec une forte valorisation de l'autonomie et de l'impact. Le sujet est principalement motivé par des défis intellectuels stimulants et des projets qui génèrent une valeur tangible, plutôt que par des facteurs de reconnaissance externe. Les éléments recueillis montrent également une aspiration à équilibrer la maîtrise technique avec une progression vers des responsabilités stratégiques.";
  
  analysisConclusion: string = "Le profil motivationnel indique une compatibilité optimale avec des environnements professionnels innovants qui valorisent l'autonomie et offrent des défis techniques significatifs. Le sujet s'épanouira dans des rôles où il peut contribuer à la fois à la résolution de problèmes complexes et à l'évolution stratégique des projets. L'équilibre entre collaboration et responsabilité individuelle semble être un facteur clé de satisfaction à long terme.";

  // Conditions optimales
  optimumConditions: string[] = [
    "Environnement favorisant l'innovation et l'exploration de nouvelles approches",
    "Autonomie décisionnelle et confiance accordée dans l'exécution des projets",
    "Projets ayant un impact concret et mesurable",
    "Équilibre entre expertise technique et implication stratégique",
    "Culture d'apprentissage continu et de développement professionnel",
    "Collaboration avec des équipes pluridisciplinaires talentueuses"
  ];

  // Indices motivationnels
  evidenceItems: Evidence[] = [
    {
      id: 'ev1',
      title: 'Parcours académique',
      icon: 'bi-mortarboard',
      date: '09/2013',
      description: 'Orientation délibérée vers une formation à forte composante technique, complétée par des modules d\'innovation et de gestion de projet. Le choix des spécialisations révèle une préférence précoce pour les environnements combinant rigueur analytique et créativité conceptuelle.',
      keywords: ['Formation', 'Innovation', 'Technique'],
      discovered: true,
      connections: ['ev4', 'ev7']
    },
    {
      id: 'ev2',
      title: 'Projets personnels',
      icon: 'bi-gear-wide-connected',
      date: '2016-2024',
      description: 'Développement régulier de projets personnels en dehors du cadre professionnel, orientés vers l\'exploration de nouvelles technologies et méthodologies. Ces initiatives sont caractérisées par une forte composante d\'apprentissage autodidacte et d\'expérimentation.',
      keywords: ['Initiative', 'Apprentissage', 'Expérimentation'],
      discovered: false,
      connections: ['ev3', 'ev5']
    },
    {
      id: 'ev3',
      title: 'Choix technologiques',
      icon: 'bi-code-slash',
      date: '2017-2023',
      description: 'Analyse des technologies adoptées dans différents contextes, révélant une préférence pour des outils offrant un équilibre entre performance et flexibilité créative. Les choix semblent guidés par une recherche d\'efficacité sans compromettre le potentiel d\'innovation.',
      keywords: ['Innovation', 'Efficacité', 'Technologie'],
      discovered: false,
      connections: ['ev5', 'ev6']
    },
    {
      id: 'ev4',
      title: 'Évolution de carrière',
      icon: 'bi-graph-up-arrow',
      date: '2015-2024',
      description: 'L\'analyse des transitions de carrière montre une progression constante vers des rôles offrant davantage d\'autonomie décisionnelle et d\'impact sur des projets stratégiques. Les changements professionnels semblent motivés par la recherche de défis intellectuels croissants plutôt que par des considérations purement hiérarchiques.',
      keywords: ['Autonomie', 'Impact', 'Progression'],
      discovered: true,
      connections: ['ev1', 'ev8']
    },
    {
      id: 'ev5',
      title: 'Contributions techniques',
      icon: 'bi-braces-asterisk',
      date: '2018-2023',
      description: 'Le pattern des contributions techniques montre une préférence pour résoudre des problèmes complexes nécessitant une approche novatrice. L\'attention particulière portée à l\'optimisation et à la maintenabilité suggère une vision à long terme et un souci d\'excellence technique.',
      keywords: ['Excellence', 'Innovation', 'Complexité'],
      discovered: false,
      connections: ['ev2', 'ev3']
    },
    {
      id: 'ev6',
      title: 'Participation communautaire',
      icon: 'bi-people',
      date: '2017-2024',
      description: 'Implication dans des communautés professionnelles et technologiques, avec un focus sur le partage de connaissances et la collaboration. Cette participation révèle une valorisation de l\'apprentissage collectif et une reconnaissance de l\'importance des réseaux professionnels.',
      keywords: ['Collaboration', 'Partage', 'Communauté'],
      discovered: false,
      connections: ['ev3', 'ev8']
    },
    {
      id: 'ev7',
      title: 'Formation continue',
      icon: 'bi-book',
      date: '2016-2024',
      description: 'Pattern constant d\'auto-formation et d\'acquisition de nouvelles compétences, transcendant les exigences immédiates des positions occupées. Cette démarche d\'apprentissage continu démontre une motivation intrinsèque pour la maîtrise et l\'évolution professionnelle.',
      keywords: ['Apprentissage', 'Maîtrise', 'Évolution'],
      discovered: true,
      connections: ['ev1', 'ev9']
    },
    {
      id: 'ev8',
      title: 'Feedback d\'équipe',
      icon: 'bi-chat-quote',
      date: '2019-2023',
      description: 'Les retours d\'équipe collectés indiquent une capacité à naviguer entre expertise technique et vision stratégique, avec une préférence pour des environnements collaboratifs tout en maintenant une forte autonomie individuelle.',
      keywords: ['Équipe', 'Collaboration', 'Autonomie'],
      discovered: false,
      connections: ['ev4', 'ev6']
    },
    {
      id: 'ev9',
      title: 'Projets prioritaires',
      icon: 'bi-kanban',
      date: '2018-2024',
      description: 'L\'analyse des projets priorisés révèle une attirance pour ceux offrant un impact tangible et des défis techniques significatifs. La motivation semble particulièrement élevée lorsque les projets combinent innovation technique et valeur ajoutée clairement définie.',
      keywords: ['Impact', 'Innovation', 'Valeur'],
      discovered: false,
      connections: ['ev7']
    }
  ];

  // Profils de motivation
  motivationProfiles: MotivationProfile[] = [
    {
      id: 'builder',
      name: 'Bâtisseur technique',
      icon: 'bi-tools',
      description: 'Ce profil de motivation est caractérisé par un fort désir de créer des solutions techniques robustes et innovantes qui résolvent des problèmes complexes. Il combine expertise technique approfondie et vision architecturale pour construire des systèmes durables et évolutifs.',
      aspects: [
        {
          title: 'Excellence technique',
          icon: 'bi-award',
          description: 'Recherche constante de qualité et d\'optimisation dans les implémentations techniques, avec un souci particulier pour la maintenabilité et l\'évolutivité des solutions.'
        },
        {
          title: 'Innovation pragmatique',
          icon: 'bi-lightbulb',
          description: 'Équilibre entre exploration de nouvelles approches et solutions éprouvées, avec une préférence pour l\'innovation ayant un impact concret sur les problématiques abordées.'
        },
        {
          title: 'Apprentissage continu',
          icon: 'bi-book',
          description: 'Motivation intrinsèque pour l\'acquisition de nouvelles compétences et la maîtrise approfondie des technologies, au-delà des exigences immédiates des projets.'
        }
      ]
    },
    {
      id: 'strategist',
      name: 'Stratège d\'innovation',
      icon: 'bi-graph-up',
      description: 'Ce profil combine vision technique et compréhension stratégique pour identifier et développer des approches novatrices à fort impact. Il est motivé par la transformation des défis complexes en opportunités d\'innovation avec des applications concrètes.',
      aspects: [
        {
          title: 'Vision systémique',
          icon: 'bi-intersect',
          description: 'Capacité à percevoir les interconnexions entre différents domaines et à synthétiser des approches multidisciplinaires pour résoudre des problèmes complexes.'
        },
        {
          title: 'Impact mesurable',
          icon: 'bi-bullseye',
          description: 'Forte motivation pour les projets générant une valeur tangible et des résultats mesurables, avec une préférence pour les solutions ayant un impact significatif.'
        },
        {
          title: 'Évolution constante',
          icon: 'bi-arrow-up-right',
          description: 'Recherche permanente d\'amélioration et d\'évolution, tant au niveau personnel que des solutions développées, avec une vision à long terme.'
        }
      ]
    },
    {
      id: 'collaborator',
      name: 'Collaborateur autonome',
      icon: 'bi-people',
      description: 'Ce profil valorise l\'équilibre entre collaboration d\'équipe efficace et autonomie personnelle. Il est motivé par les environnements qui favorisent l\'échange d\'expertise tout en offrant l\'espace nécessaire pour explorer et développer des solutions de manière indépendante.',
      aspects: [
        {
          title: 'Autonomie responsable',
          icon: 'bi-person-check',
          description: 'Préférence pour les contextes offrant une liberté décisionnelle encadrée par des objectifs clairs, permettant une expression optimale de la créativité et de l\'expertise.'
        },
        {
          title: 'Synergie collective',
          icon: 'bi-puzzle',
          description: 'Valorisation des dynamiques d\'équipe qui permettent l\'enrichissement mutuel et la combinaison des forces individuelles pour atteindre des résultats supérieurs.'
        },
        {
          title: 'Partage d\'expertise',
          icon: 'bi-share',
          description: 'Motivation pour transmettre et recevoir des connaissances au sein d\'un écosystème professionnel, contribuant à l\'élévation collective des compétences.'
        }
      ]
    }
  ];

  // Facteurs de motivation
  motivationFactors: MotivationFactor[] = [
    { name: 'Défis techniques', icon: 'bi-code-square', level: 9 },
    { name: 'Autonomie', icon: 'bi-person-check', level: 8 },
    { name: 'Impact concret', icon: 'bi-graph-up', level: 9 },
    { name: 'Innovation', icon: 'bi-lightbulb', level: 8 },
    { name: 'Apprentissage', icon: 'bi-book', level: 9 },
    { name: 'Collaboration', icon: 'bi-people', level: 7 },
    { name: 'Reconnaissance', icon: 'bi-trophy', level: 5 },
    { name: 'Stabilité', icon: 'bi-shield', level: 4 }
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
    if (!this.progressService.isModuleAvailable('motivations')) {
      console.warn('Ce module n\'est pas encore disponible');
    }


    // S'abonner au temps écoulé
    this.subscriptions.push(
      this.timeTrackerService.elapsedTime$.subscribe(time => {
        this.elapsedTime = time;
      })
    );

    // Vérifier si le module est déjà complété
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe(statuses => {
        this.isModuleCompleted = statuses.motivations;
        this.moduleProgressPercentage = this.progressService.getCompletionPercentage();
        
        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadSavedState();
        }
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
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService au lieu du typewriter manuel
    setTimeout(() => {
      this.showIntroDialog();
    }, 500);
    
    // Initialiser la taille du tableau pour les connexions
    setTimeout(() => {
      const board = document.querySelector('.evidence-board');
      if (board) {
        this.boardWidth = board.clientWidth;
        this.boardHeight = board.clientHeight;
      }
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

  // Charger l'état sauvegardé précédemment
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('motivations');
    
    if (responses.length > 0) {
      // Charger les indices découverts
      const evidenceResponse = responses.find(r => r.questionId === 'discovered_evidence');
      if (evidenceResponse && Array.isArray(evidenceResponse.response)) {
        const discoveredIds = evidenceResponse.response as string[];
        this.evidenceItems.forEach(item => {
          item.discovered = discoveredIds.includes(item.id);
        });
      }

      // Charger l'état de l'analyse
      const analysisResponse = responses.find(r => r.questionId === 'analysis_done');
      if (analysisResponse && typeof analysisResponse.response === 'boolean') {
        this.analysisDone = analysisResponse.response;
      }

      // Charger le profil sélectionné
      const profileResponse = responses.find(r => r.questionId === 'selected_profile');
      if (profileResponse && typeof profileResponse.response === 'string') {
        this.selectedProfile = profileResponse.response;
      }
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder les indices découverts
    const discoveredIds = this.evidenceItems
      .filter(ev => ev.discovered)
      .map(ev => ev.id);
    
    this.userDataService.saveResponse('motivations', 'discovered_evidence', discoveredIds);
    
    // Sauvegarder l'état de l'analyse
    this.userDataService.saveResponse('motivations', 'analysis_done', this.analysisDone);
    
    // Sauvegarder le profil sélectionné
    if (this.selectedProfile) {
      this.userDataService.saveResponse('motivations', 'selected_profile', this.selectedProfile);
    }
    
    // Vérifier si le module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si les conditions de complétion du module sont remplies
  checkModuleCompletion(): void {
    // Le module est complété si l'analyse est terminée et qu'au moins 70% des indices sont découverts
    const evidenceThreshold = Math.ceil(this.evidenceItems.length * 0.7);
    
    if (this.analysisDone && this.getDiscoveredCount() >= evidenceThreshold && !this.isModuleCompleted) {
      this.completeModule();
    }
  }

  // Marquer le module comme complété
  completeModule(): void {
    this.progressService.completeModule('motivations');
    this.isModuleCompleted = true;
    
    // Ajouter une note automatique pour résumer ce qui a été fait
    this.addCompletionNote();
  }

  // Ajouter une note récapitulative automatique
  addCompletionNote(): void {
    // Récupérer le profil principal identifié
    const mainProfile = this.getSelectedProfile();
    
    // Récupérer les facteurs de motivation principaux (niveau >= 8)
    const topFactors = this.motivationFactors
      .filter(factor => factor.level >= 8)
      .map(factor => factor.name)
      .join(', ');
    
    const noteContent = `
Module "Motivations Socio-Professionnelles" complété le ${new Date().toLocaleDateString()}.
Indices analysés: ${this.getDiscoveredCount()}/${this.evidenceItems.length}.
Profil motivationnel dominant: ${mainProfile ? mainProfile.name : 'Non identifié'}.
Facteurs clés de motivation: ${topFactors}.
Environnement optimal: Combinaison d'autonomie, défis techniques et innovation.
    `;
    
    this.noteService.addNote(noteContent.trim());
  }

  // Ouvrir le panneau de notes
  toggleNotes(): void {
    this.noteService.toggleNotesVisibility();
  }

  // Gestion des indices
  selectEvidence(evidence: Evidence): void {
    this.selectedEvidence = evidence;
    this.hideConnections();
  }

  discoverEvidence(evidence: Evidence): void {
    if (!evidence.discovered) {
      evidence.discovered = true;
      
      // Sauvegarder l'état
      this.saveState();
      
      // Si tous les indices sont découverts, permettre l'analyse finale
      if (this.getDiscoveredCount() === this.evidenceItems.length) {
        // Animation possible ici
      }
    }
  }

  investigateConnections(evidence: Evidence): void {
    if (!evidence.discovered) return;
    
    this.showConnections = true;
    this.visibleConnections = [];
    
    // Rechercher les éléments DOM des indices
    setTimeout(() => {
      const items = document.querySelectorAll('.evidence-item');
      const selectedIndex = this.getEvidenceIndex(evidence);
      
      if (selectedIndex >= 0 && items && items.length > 0) {
        const selectedItem = items[selectedIndex];
        const selectedRect = selectedItem.getBoundingClientRect();
        const boardRect = document.querySelector('.evidence-board')?.getBoundingClientRect();
        
        if (!boardRect) return;
        
        // Position du centre de l'élément sélectionné
        const x1 = selectedRect.left + selectedRect.width / 2 - boardRect.left;
        const y1 = selectedRect.top + selectedRect.height / 2 - boardRect.top;
        
        // Pour chaque connexion
        for (const connId of evidence.connections) {
          const connIndex = this.evidenceItems.findIndex(ev => ev.id === connId);
          if (connIndex >= 0 && items[connIndex]) {
            const connItem = items[connIndex];
            const connRect = connItem.getBoundingClientRect();
            
            // Position du centre de l'élément connecté
            const x2 = connRect.left + connRect.width / 2 - boardRect.left;
            const y2 = connRect.top + connRect.height / 2 - boardRect.top;
            
            // Ajouter la connexion
            this.visibleConnections.push({ x1, y1, x2, y2 });
          }
        }
      }
    }, 100);
  }

  hideConnections(): void {
    this.showConnections = false;
    this.visibleConnections = [];
  }

  getEvidenceIndex(evidence: Evidence): number {
    return this.evidenceItems.findIndex(ev => ev.id === evidence.id);
  }

  getDiscoveredCount(): number {
    return this.evidenceItems.filter(ev => ev.discovered).length;
  }

  getDiscoveryPercentage(): number {
    return (this.getDiscoveredCount() / this.evidenceItems.length) * 100;
  }

  // Analyse des motivations
  canAnalyze(): boolean {
    // Au moins 3 indices doivent être découverts pour permettre l'analyse
    return this.getDiscoveredCount() >= 3;
  }

  analyzeMotivations(): void {
    if (this.analysisDone) {
      // Si l'analyse est déjà terminée, juste réafficher les résultats
      return;
    }
    
    if (!this.canAnalyze()) return;
    
    this.analysisInProgress = true;
    this.currentStep = 1;
    
    // Simulation de l'analyse avec progression des étapes
    setTimeout(() => this.currentStep = 2, 2000);
    setTimeout(() => this.currentStep = 3, 4000);
    setTimeout(() => this.currentStep = 4, 6000);
    
    setTimeout(() => {
      this.analysisInProgress = false;
      this.analysisDone = true;
      this.selectedProfile = this.motivationProfiles[0].id;
      
      // Sauvegarder l'état après l'analyse
      this.saveState();
    }, 8000);
  }

  // Profils de motivation
  selectProfile(profileId: string): void {
    this.selectedProfile = profileId;
    
    // Sauvegarder la sélection
    this.userDataService.saveResponse('motivations', 'selected_profile', profileId);
  }

  getSelectedProfile(): MotivationProfile | null {
    if (!this.selectedProfile) return null;
    return this.motivationProfiles.find(p => p.id === this.selectedProfile) || null;
  }

  // Utilitaires
  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}