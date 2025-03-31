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
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { NoteService } from '../../services/note.service';

interface JobClue {
  title: string;
  detail: string;
  icon: string;
  skill: string;
}

interface JobExperience {
  title: string;
  company: string;
  period: string;
  description: string;
  clues: JobClue[];
  skills: string[];
  notes: string;
  conclusion: string;
  achievement: string;
}

@Component({
  selector: 'app-experience-pro',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './experience-pro.component.html',
  styleUrls: ['./experience-pro.component.css'],
})
export class ExperienceProComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string =
    'Agent, approfondissons notre enquête. Le suspect a un parcours professionnel intéressant. Examinez ces dossiers confidentiels pour découvrir ses compétences, réalisations et contacts. Chaque indice compte pour établir son profil complet.';
  private subscriptions: Subscription[] = [];

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Données de progression et de temps
  isModuleCompleted: boolean = false;
  moduleProgressPercentage: number = 0;

  // État des jobs
  selectedJobIndex: number = 0;
  isDescriptionRevealed: boolean = false;
  isStampRevealed: boolean = false;
  discoveredClues: boolean[][] = [];
  jobCompletionStatus: number[] = [];

  // Propriétés pour le quiz modal
  isQuizModalOpen: boolean = false;
  quizCompleted: boolean = false;
  quizPassed: boolean = false;
  quizScore: number = 0;

  // Types de quiz disponibles
  quizTypes: string[] = ['matching', 'chronology'];
  quizType: string = 'matching';
  quizIndex: number = 0;

  // Données des expériences professionnelles
  jobs: JobExperience[] = [
    {
      title: 'Développeur Full Stack',
      company: 'TechSolutions Inc.',
      period: 'Janvier 2020 - Présent',
      description:
        "Responsable du développement d'applications web complexes en utilisant les dernières technologies. Chef d'équipe sur plusieurs projets critiques pour des clients de premier plan dans le secteur financier et e-commerce.",
      clues: [
        {
          title: 'Projet Client 1',
          detail:
            "Refonte complète du système de paiement en ligne d'un grand détaillant, augmentation de 30% du taux de conversion",
          icon: 'bi-bank',
          skill: 'Angular',
        },
        {
          title: 'Architecture Système',
          detail:
            "Conception et implémentation d'une architecture microservices avec haute disponibilité et redondance",
          icon: 'bi-diagram-3',
          skill: 'Architecture Logicielle',
        },
        {
          title: 'Base de Code Legacy',
          detail:
            "Migration réussie d'une application monolithique vers une architecture moderne et extensible",
          icon: 'bi-code-square',
          skill: 'Refactoring',
        },
        {
          title: 'Innovation Technique',
          detail:
            "Implémentation d'un système de CI/CD complet réduisant le temps de déploiement de 80%",
          icon: 'bi-lightning',
          skill: 'DevOps',
        },
        {
          title: 'Leadership Technique',
          detail:
            "Mentorat de 5 développeurs juniors et direction technique d'une équipe de 8 personnes",
          icon: 'bi-people',
          skill: 'Leadership',
        },
      ],
      skills: [
        'Angular',
        'Architecture Logicielle',
        'Refactoring',
        'DevOps',
        'Leadership',
      ],
      notes:
        "Le suspect démontre une expertise technique remarquable et des capacités de leadership. Il semble particulièrement à l'aise avec les environnements technologiques complexes et la résolution de problèmes critiques. Son rôle de mentor suggère de bonnes compétences interpersonnelles.",
      conclusion:
        "L'analyse de cette expérience révèle un profil de développeur senior avec une forte orientation vers l'architecture et l'innovation technique. Les compétences acquises ici constituent un atout majeur pour des projets d'envergure nécessitant une expertise approfondie.",
      achievement: 'Expert en Architecture Système',
    },
    {
      title: 'Développeur Backend',
      company: 'DataFlow Systems',
      period: 'Mars 2017 - Décembre 2019',
      description:
        "Conception et développement de services backend robustes pour des applications à fort trafic. Spécialisation dans l'optimisation des performances et la sécurité des données sensibles.",
      clues: [
        {
          title: 'APIs RESTful',
          detail:
            "Développement de plus de 50 endpoints API pour diverses applications d'entreprise",
          icon: 'bi-hdd-network',
          skill: 'Node.js',
        },
        {
          title: 'Sécurité Données',
          detail:
            'Implémentation de protocoles de sécurité avancés pour la protection des données utilisateurs',
          icon: 'bi-shield-lock',
          skill: 'Cybersécurité',
        },
        {
          title: 'Performance',
          detail:
            "Optimisation d'une base de données qui a réduit les temps de réponse de 65%",
          icon: 'bi-speedometer',
          skill: 'Optimisation SQL',
        },
        {
          title: 'Cloud Computing',
          detail:
            "Migration d'applications on-premise vers des infrastructures cloud scalables",
          icon: 'bi-cloud',
          skill: 'AWS',
        },
      ],
      skills: ['Node.js', 'Cybersécurité', 'Optimisation SQL', 'AWS'],
      notes:
        "Cette période montre un développement significatif des compétences backend du suspect. L'accent mis sur la sécurité et les performances indique une compréhension approfondie des enjeux critiques du développement d'applications modernes.",
      conclusion:
        'Cette expérience a clairement renforcé les fondations techniques du suspect dans le domaine du backend. Sa maîtrise des APIs et des systèmes de bases de données est un atout précieux pour tout projet nécessitant stabilité et sécurité.',
      achievement: 'Architecte Backend Sécurisé',
    },
    {
      title: 'Développeur Frontend',
      company: 'WebCreative Studio',
      period: 'Juin 2015 - Février 2017',
      description:
        "Création d'interfaces utilisateur attractives et fonctionnelles pour divers clients. Spécialisation dans l'expérience utilisateur et les animations web avancées.",
      clues: [
        {
          title: 'UI/UX Design',
          detail:
            "Conception d'interfaces utilisateur intuitives en collaboration avec l'équipe de design",
          icon: 'bi-brush',
          skill: 'UI/UX Design',
        },
        {
          title: 'Animations Web',
          detail:
            "Création d'animations complexes pour améliorer l'expérience utilisateur et la conversion",
          icon: 'bi-stars',
          skill: 'CSS Avancé',
        },
        {
          title: 'Développement Mobile',
          detail: 'Adaptation de sites web pour une expérience mobile optimale',
          icon: 'bi-phone',
          skill: 'Design Responsive',
        },
        {
          title: 'Framework JavaScript',
          detail:
            "Développement d'applications single-page hautement interactives",
          icon: 'bi-code-slash',
          skill: 'React',
        },
      ],
      skills: ['UI/UX Design', 'CSS Avancé', 'Design Responsive', 'React'],
      notes:
        'Les compétences frontend du suspect sont particulièrement remarquables. Il semble avoir une sensibilité esthétique combinée à une rigueur technique, ce qui est rare dans ce domaine. Sa capacité à créer des interfaces à la fois belles et fonctionnelles est un atout majeur.',
      conclusion:
        "Cette période a permis au suspect de développer des compétences solides en développement frontend moderne, avec une attention particulière à l'expérience utilisateur. Sa maîtrise des technologies de présentation complète parfaitement ses compétences backend.",
      achievement: 'Expert UI/UX Frontend',
    },
    {
      title: 'Développeur Junior',
      company: 'StartupTech',
      period: 'Septembre 2013 - Mai 2015',
      description:
        'Premier poste professionnel dans une startup dynamique. Participation au développement de plusieurs projets web et mobiles, avec une forte implication dans tous les aspects du cycle de développement.',
      clues: [
        {
          title: 'Formation Initiale',
          detail:
            "Diplôme d'ingénieur en informatique avec spécialisation en développement web",
          icon: 'bi-mortarboard',
          skill: 'Formation Académique',
        },
        {
          title: 'Premiers Projets',
          detail:
            'Contribution à la création de 3 applications web de A à Z, y compris le frontend et le backend',
          icon: 'bi-rocket',
          skill: 'JavaScript',
        },
        {
          title: 'Méthodologie Agile',
          detail:
            "Participation active aux rituels agiles et à la mise en place d'une culture DevOps",
          icon: 'bi-kanban',
          skill: 'Méthodologie Agile',
        },
        {
          title: 'Intégration Équipe',
          detail:
            'Développement rapide des compétences techniques et relationnelles dans un environnement startup',
          icon: 'bi-patch-check',
          skill: 'Adaptabilité',
        },
      ],
      skills: [
        'Formation Académique',
        'JavaScript',
        'Méthodologie Agile',
        'Adaptabilité',
      ],
      notes:
        "Les débuts professionnels du suspect montrent une capacité d'apprentissage rapide et une adaptabilité remarquable. Son expérience dans une startup lui a permis de développer une approche polyvalente du développement logiciel, ainsi qu'une bonne compréhension des enjeux business.",
      conclusion:
        'Cette première expérience a constitué une base solide pour la carrière du suspect, lui fournissant non seulement des compétences techniques fondamentales, mais aussi une compréhension de la dynamique des projets technologiques et du travail en équipe agile.',
      achievement: 'Profil Polyvalent',
    },
  ];

  // Données pour le quiz de matching (compétences/jobs)
  matchingSkills: string[] = [
    'Angular',
    'Architecture Logicielle',
    'Leadership',
    'Node.js',
    'Cybersécurité',
    'UI/UX Design',
    'React',
    'Méthodologie Agile',
  ];
  matchingJobs: {
    title: string;
    company: string;
    correctSkillIndices: number[];
  }[] = [
    {
      title: 'Développeur Full Stack',
      company: 'TechSolutions Inc.',
      correctSkillIndices: [0, 1, 2],
    },
    {
      title: 'Développeur Backend',
      company: 'DataFlow Systems',
      correctSkillIndices: [3, 4],
    },
    {
      title: 'Développeur Frontend',
      company: 'WebCreative Studio',
      correctSkillIndices: [5, 6],
    },
    {
      title: 'Développeur Junior',
      company: 'StartupTech',
      correctSkillIndices: [7],
    },
  ];

  selectedSkillIndex: number | null = null;
  selectedJobMatchIndex: number | null = null;
  skillMatched: boolean[] = [];
  jobMatched: boolean[] = [];
  skillToJobMapping: number[] = [];
  incorrectMatch: number | null = null;

  // Données pour le quiz de chronologie
  chronologyJobs: { title: string; company: string; order: number }[] = [];
  originalChronology: { title: string; company: string; order: number }[] = [];
  chronologyChecked: boolean = false;
  isChronologyCorrect: boolean = false;

  constructor(
    private progressService: ProgressService,
    private router: Router,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('experience')) {
      console.warn("Ce module n'est pas encore disponible");
      // Logique de redirection à implémenter si nécessaire
    }

    // Vérifier si le module est déjà complété
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe((statuses) => {
        this.isModuleCompleted = statuses.experience;
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();

        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadSavedState();
        } else {
          this.initializeExperienceData();
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
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService au lieu du typewriter manuel
    setTimeout(() => {
      this.showIntroDialog();
    }, 500);

    // Animation pour l'apparition progressive des éléments
    setTimeout(() => {
      const tabs = document.querySelectorAll('.folder-tab');
      tabs.forEach((tab, index) => {
        setTimeout(() => {
          tab.classList.add('appear');
        }, 150 * index);
      });
    }, 300);
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
    // Initialiser les structures de données
    this.initializeExperienceData();

    const responses = this.userDataService.getModuleResponses('experience');

    if (responses.length > 0) {
      // Charger l'index du job sélectionné
      const selectedJobResponse = responses.find(
        (r) => r.questionId === 'selected_job_index'
      );
      if (
        selectedJobResponse &&
        typeof selectedJobResponse.response === 'number'
      ) {
        this.selectedJobIndex = selectedJobResponse.response;
      }

      // Charger les indices découverts
      for (let jobIndex = 0; jobIndex < this.jobs.length; jobIndex++) {
        const cluesResponse = responses.find(
          (r) => r.questionId === `job_${jobIndex}_clues`
        );
        if (cluesResponse && Array.isArray(cluesResponse.response)) {
          // Conversion appropriée via unknown
          this.discoveredClues[jobIndex] = (
            cluesResponse.response as unknown[]
          ).map((val) => Boolean(val));
        }
      }

      // Charger les statuts de complétion
      const completionResponse = responses.find(
        (r) => r.questionId === 'job_completion_status'
      );
      if (completionResponse && Array.isArray(completionResponse.response)) {
        // Conversion appropriée via unknown
        this.jobCompletionStatus = (
          completionResponse.response as unknown[]
        ).map((val) => Number(val));
      }

      // Mettre à jour les états d'interface
      this.updateInterfaceStates();
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder l'index du job sélectionné
    this.userDataService.saveResponse(
      'experience',
      'selected_job_index',
      this.selectedJobIndex
    );

    // Sauvegarder les indices découverts pour chaque job
    for (let jobIndex = 0; jobIndex < this.jobs.length; jobIndex++) {
      // Convertir le tableau de booléens en tableau de chaînes "true"/"false"
      const cluesStringArray = this.discoveredClues[jobIndex].map((value) =>
        String(value)
      );
      this.userDataService.saveResponse(
        'experience',
        `job_${jobIndex}_clues`,
        cluesStringArray
      );
    }

    // Sauvegarder les statuts de complétion
    // Convertir le tableau de nombres en tableau de chaînes
    const completionStringArray = this.jobCompletionStatus.map((value) =>
      String(value)
    );
    this.userDataService.saveResponse(
      'experience',
      'job_completion_status',
      completionStringArray
    );

    // Vérifier si le module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si les conditions de complétion du module sont remplies
  checkModuleCompletion(): void {
    // Calculer le pourcentage global de complétion des jobs
    const totalJobs = this.jobs.length;
    const completedJobs = this.jobCompletionStatus.filter(
      (status) => status === 100
    ).length;

    // Si au moins 75% des jobs sont complètement explorés
    const completionThreshold = Math.ceil(totalJobs * 0.75);

    if (completedJobs >= completionThreshold && !this.isModuleCompleted) {
      this.completeModule();
    }
  }

  // Marquer le module comme complété
  completeModule(): void {
    this.progressService.completeModule('experience');
    this.isModuleCompleted = true;

    // Ajouter une note automatique pour résumer ce qui a été fait
    this.addCompletionNote();
  }

  // Ajouter une note récapitulative automatique
  addCompletionNote(): void {
    // Récupérer les compétences découvertes dans tous les jobs
    const allDiscoveredSkills = this.getAllDiscoveredSkills();

    // Récupérer les jobs où tous les indices ont été découverts
    const completedJobs = this.jobs
      .filter((_, index) => this.jobCompletionStatus[index] === 100)
      .map((job) => job.title);

    const noteContent = `
Module "Expérience Professionnelle" complété le ${new Date().toLocaleDateString()}.
Expériences explorées: ${completedJobs.join(', ')}.
Compétences principales identifiées: ${allDiscoveredSkills
      .slice(0, 5)
      .join(', ')}.
Réalisations notables: ${this.getCompletedAchievements().join(', ')}.
    `;

    this.noteService.addNote(noteContent.trim());
  }

  // Obtenir toutes les compétences découvertes
  getAllDiscoveredSkills(): string[] {
    const skills: string[] = [];

    this.jobs.forEach((job, jobIndex) => {
      job.clues.forEach((clue, clueIndex) => {
        if (this.discoveredClues[jobIndex][clueIndex]) {
          skills.push(clue.skill);
        }
      });
    });

    return [...new Set(skills)]; // Supprimer les doublons
  }

  // Obtenir les achievements des jobs complètement explorés
  getCompletedAchievements(): string[] {
    return this.jobs
      .filter((_, index) => this.jobCompletionStatus[index] === 100)
      .map((job) => job.achievement);
  }

  initializeExperienceData(): void {
    // Initialiser le tableau de statut pour chaque job
    this.jobCompletionStatus = new Array(this.jobs.length).fill(0);

    // Initialiser le tableau pour les indices découverts
    this.discoveredClues = this.jobs.map((job) =>
      new Array(job.clues.length).fill(false)
    );

    // Sélectionner le premier job par défaut
    this.selectedJob = this.jobs[this.selectedJobIndex];
  }

  // Mettre à jour les états d'interface en fonction des données chargées
  updateInterfaceStates(): void {
    // Sélectionner le job actif
    this.selectJob(this.selectedJobIndex);

    // Mettre à jour les états d'interface pour tous les jobs
    for (let i = 0; i < this.jobs.length; i++) {
      const completionRate = this.jobCompletionStatus[i];

      if (i === this.selectedJobIndex) {
        this.isDescriptionRevealed = completionRate > 20;
        this.isStampRevealed = completionRate === 100;
      }
    }
  }

  // Propriété pour le job actuellement sélectionné
  get selectedJob(): JobExperience | null {
    return this.jobs[this.selectedJobIndex] || null;
  }

  set selectedJob(job: JobExperience | null) {
    if (!job) return;

    const index = this.jobs.findIndex((j) => j.title === job.title);
    if (index >= 0) {
      this.selectedJobIndex = index;
    }
  }

  // Sélection d'un job
  selectJob(index: number): void {
    if (index < 0 || index >= this.jobs.length) return;

    this.selectedJobIndex = index;
    this.isDescriptionRevealed = this.jobCompletionStatus[index] > 20;
    this.isStampRevealed = this.jobCompletionStatus[index] === 100;

    // Sauvegarder la sélection
    this.userDataService.saveResponse(
      'experience',
      'selected_job_index',
      index
    );

    // Animation pour le changement de dossier
    setTimeout(() => {
      document
        .querySelector('.folder-content')
        ?.classList.add('folder-change-animation');
      setTimeout(() => {
        document
          .querySelector('.folder-content')
          ?.classList.remove('folder-change-animation');
      }, 500);
    }, 10);
  }

  // Révélation d'un indice
  revealClue(clueIndex: number): void {
    if (clueIndex < 0 || !this.selectedJob) return;

    // Marquer l'indice comme découvert
    if (!this.discoveredClues[this.selectedJobIndex][clueIndex]) {
      this.discoveredClues[this.selectedJobIndex][clueIndex] = true;

      // Animation pour la découverte
      setTimeout(() => {
        const clueElement =
          document.querySelectorAll('.evidence-item')[clueIndex];
        clueElement?.classList.add('discovered');
      }, 100);

      // Mettre à jour le pourcentage de complétion
      this.updateCompletionStatus();

      // Révéler la description après quelques indices
      if (this.getDiscoveredClueCount() >= 2 && !this.isDescriptionRevealed) {
        setTimeout(() => {
          this.isDescriptionRevealed = true;
        }, 500);
      }

      // Révéler le tampon quand tout est découvert
      if (this.jobCompletionStatus[this.selectedJobIndex] === 100) {
        setTimeout(() => {
          this.isStampRevealed = true;
        }, 1000);
      }

      // Sauvegarder l'état
      this.saveState();
    }
  }

  // Compter les indices découverts pour le job actuel
  getDiscoveredClueCount(): number {
    return (
      this.discoveredClues[this.selectedJobIndex]?.filter(Boolean).length || 0
    );
  }

  // Obtenir les compétences découvertes pour le job actuel
  getDiscoveredSkills(): string[] {
    if (!this.selectedJob) return [];

    return this.selectedJob.clues
      .filter((_, index) => this.discoveredClues[this.selectedJobIndex][index])
      .map((clue) => clue.skill);
  }

  // Mettre à jour le pourcentage de complétion
  updateCompletionStatus(): void {
    if (!this.selectedJob) return;

    const totalClues = this.selectedJob.clues.length;
    const discoveredCount = this.getDiscoveredClueCount();

    // Calculer le pourcentage (arrondi à la dizaine la plus proche)
    const percentage =
      Math.round(((discoveredCount / totalClues) * 100) / 10) * 10;
    this.jobCompletionStatus[this.selectedJobIndex] = percentage;

    // Sauvegarder les statuts de complétion
    // Convertir le tableau de nombres en tableau de chaînes
    const completionStringArray = this.jobCompletionStatus.map((value) =>
      String(value)
    );
    this.userDataService.saveResponse(
      'experience',
      'job_completion_status',
      completionStringArray
    );

    // Vérifier si module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si tous les dossiers sont complétés (déclassifiés)
  areAllFilesCompleted(): boolean {
    // Considérer qu'au moins 3 des 4 dossiers doivent être complets (100%)
    const completedFilesCount = this.jobCompletionStatus.filter(
      (status) => status === 100
    ).length;
    return completedFilesCount >= 3;
  }

  // Ouvrir le modal du quiz
  openQuizModal(): void {
    // Réinitialiser le quiz
    this.quizCompleted = false;
    this.quizPassed = false;
    this.quizIndex = 0;
    this.quizType = this.quizTypes[0];
    this.quizScore = 0;

    // Initialiser les données du quiz de matching
    this.initializeMatchingQuiz();

    // Initialiser les données du quiz de chronologie
    this.initializeChronologyQuiz();

    // Ouvrir la modal
    this.isQuizModalOpen = true;
  }

  // Fermer le modal du quiz
  closeQuizModal(): void {
    this.isQuizModalOpen = false;
  }

  // Initialiser le quiz de matching
  initializeMatchingQuiz(): void {
    this.selectedSkillIndex = null;
    this.selectedJobMatchIndex = null;
    this.skillMatched = new Array(this.matchingSkills.length).fill(false);
    this.jobMatched = new Array(this.matchingJobs.length).fill(false);
    this.skillToJobMapping = new Array(this.matchingSkills.length).fill(-1);
    this.incorrectMatch = null;
  }

  // Initialiser le quiz de chronologie
  initializeChronologyQuiz(): void {
    // Créer les objets pour le quiz de chronologie
    this.originalChronology = [
      { title: 'Développeur Junior', company: 'StartupTech', order: 0 },
      {
        title: 'Développeur Frontend',
        company: 'WebCreative Studio',
        order: 1,
      },
      { title: 'Développeur Backend', company: 'DataFlow Systems', order: 2 },
      {
        title: 'Développeur Full Stack',
        company: 'TechSolutions Inc.',
        order: 3,
      },
    ];

    // Copier et mélanger le tableau
    this.chronologyJobs = [...this.originalChronology];
    this.shuffleArray(this.chronologyJobs);

    this.chronologyChecked = false;
    this.isChronologyCorrect = false;
  }

  // Mélanger un tableau (algorithme de Fisher-Yates)
  shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Sélectionner une compétence
  selectSkill(index: number): void {
    if (this.skillMatched[index]) return;
    this.selectedSkillIndex = index;
    this.incorrectMatch = null;
  }

  // Sélectionner un job
  selectJobMatch(index: number): void {
    if (this.jobMatched[index]) return;
    this.selectedJobMatchIndex = index;
    this.incorrectMatch = null;
  }

  // Vérifier si l'association compétence-job est correcte
  checkMatch(): void {
    if (this.selectedSkillIndex === null || this.selectedJobMatchIndex === null)
      return;

    const skill = this.selectedSkillIndex;
    const job = this.selectedJobMatchIndex;

    // Vérifier si cette compétence est associée à ce job
    const isCorrect =
      this.matchingJobs[job].correctSkillIndices.includes(skill);

    if (isCorrect) {
      // Marquer comme associé
      this.skillMatched[skill] = true;
      this.skillToJobMapping[skill] = job;

      // Vérifier si toutes les compétences pour ce job sont associées
      const allJobSkillsMatched = this.matchingJobs[
        job
      ].correctSkillIndices.every(
        (skillIndex) => this.skillMatched[skillIndex]
      );

      if (allJobSkillsMatched) {
        this.jobMatched[job] = true;
      }

      // Réinitialiser la sélection
      this.selectedSkillIndex = null;
      this.selectedJobMatchIndex = null;

      // Vérifier si toutes les associations sont faites
      if (this.allSkillsMatched()) {
        setTimeout(() => {
          this.goToNextQuiz();
        }, 1000);
      }
    } else {
      // Indiquer une erreur
      this.incorrectMatch = job;
      setTimeout(() => {
        this.incorrectMatch = null;
        this.selectedSkillIndex = null;
        this.selectedJobMatchIndex = null;
      }, 1500);
    }
  }

  // Vérifier si toutes les compétences sont associées
  allSkillsMatched(): boolean {
    return this.skillMatched.every((matched) => matched);
  }

  // Obtenir le nombre d'associations correctes
  getCorrectMatchesCount(): number {
    return this.skillMatched.filter((matched) => matched).length;
  }

  // Gérer le drop dans le quiz de chronologie
  dropJob(event: CdkDragDrop<any[]>): void {
    if (this.chronologyChecked) return;

    moveItemInArray(
      this.chronologyJobs,
      event.previousIndex,
      event.currentIndex
    );
    this.chronologyChecked = false;
  }

  // Vérifier si un job est à la bonne position dans la chronologie
  isJobInCorrectPosition(index: number): boolean {
    if (!this.chronologyChecked) return false;
    return this.chronologyJobs[index].order === index;
  }

  // Vérifier l'ordre chronologique
  checkChronologyOrder(): void {
    this.chronologyChecked = true;

    // Vérifier si l'ordre est correct
    this.isChronologyCorrect = this.chronologyJobs.every(
      (job, index) => job.order === index
    );

    if (this.isChronologyCorrect) {
      setTimeout(() => {
        this.goToNextQuiz();
      }, 1000);
    }
  }

  // Réinitialiser le quiz de chronologie
  resetChronology(): void {
    this.chronologyChecked = false;
    this.shuffleArray(this.chronologyJobs);
  }

  // Passer au quiz suivant ou terminer
  goToNextQuiz(): void {
    if (this.quizIndex < this.quizTypes.length - 1) {
      this.quizIndex++;
      this.quizType = this.quizTypes[this.quizIndex];

      // Réinitialiser le quiz actuel
      if (this.quizType === 'matching') {
        this.initializeMatchingQuiz();
      } else if (this.quizType === 'chronology') {
        this.initializeChronologyQuiz();
      }
    } else {
      // Calculer le score final
      this.completeQuiz();
    }
  }

  // Terminer le quiz et calculer le score
  completeQuiz(): void {
    this.quizCompleted = true;

    // Calculer le score en pourcentage
    // 70% pour le matching, 30% pour la chronologie
    const matchingScore =
      (this.getCorrectMatchesCount() / this.matchingSkills.length) * 70;
    const chronologyScore = this.isChronologyCorrect ? 30 : 0;

    this.quizScore = Math.round(matchingScore + chronologyScore);

    // Le quiz est réussi si le score est supérieur à 70%
    this.quizPassed = this.quizScore >= 70;

    // Si le quiz est réussi, sauvegarder la progression
    if (this.quizPassed) {
      this.saveQuizResults();
    }
  }

  // Sauvegarder les résultats du quiz
  saveQuizResults(): void {
    // Sauvegarder les résultats du quiz
    this.userDataService.saveResponse('experience', 'quiz_completed', true);
    this.userDataService.saveResponse(
      'experience',
      'quiz_score',
      this.quizScore
    );

    // Si ce n'est pas déjà fait, compléter le module
    if (!this.isModuleCompleted) {
      this.completeModule();
    }
  }

  // Recommencer le quiz
  restartQuiz(): void {
    this.quizIndex = 0;
    this.quizType = this.quizTypes[0];
    this.quizCompleted = false;

    // Réinitialiser le quiz actuel
    if (this.quizType === 'matching') {
      this.initializeMatchingQuiz();
    } else if (this.quizType === 'chronology') {
      this.initializeChronologyQuiz();
    }
  }

  // Naviguer vers la page suivante
  navigateToNextPage(): void {
    this.closeQuizModal();
    this.router.navigate(['/attentes']);
  }
}
