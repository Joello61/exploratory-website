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
      title: 'Alternant Développeur Fullstack',
      company: 'Arthur Ngaku (ANG Tech)',
      period: 'Décembre 2024 - Actuel',
      description:
        "Poste en alternance dans le cadre du Master Informatique à l'Université de Toulouse Jean Jaurès. Développement d'une application web et mobile intégrant des technologies 3D et une API REST sécurisée.",
      clues: [
        {
          title: 'Intégration 3D',
          detail:
            "Développement d'une application web/mobile intégrant la 3D pour l'analyse des mesures corporelles dans un contexte e-commerce",
          icon: 'bi-box',
          skill: 'Technologies 3D',
        },
        {
          title: 'API Backend',
          detail:
            "Conception et implémentation d'une API REST sécurisée pour la communication entre le frontend et les services de traitement d'images",
          icon: 'bi-hdd-network',
          skill: 'Backend API',
        },
        {
          title: 'Frontend Vue.js',
          detail:
            "Développement du frontend en Vue.js avec une interface utilisateur intuitive pour manipuler des objets 3D et visualiser des analyses",
          icon: 'bi-window',
          skill: 'Vue.js',
        },
        {
          title: 'Pipelines CI/CD',
          detail:
            "Mise en place de pipelines CI/CD avec GitLab pour automatiser les tests et déploiements de l'application",
          icon: 'bi-gear-wide-connected',
          skill: 'DevOps',
        },
        {
          title: 'Documentation',
          detail:
            "Rédaction d'une documentation technique complète couvrant l'architecture, les guides utilisateur et les procédures de maintenance",
          icon: 'bi-file-text',
          skill: 'Documentation Technique',
        },
      ],
      skills: [
        'Vue.js',
        'API REST',
        'Technologies 3D',
        'DevOps',
        'Documentation Technique',
      ],
      notes:
        "Cette expérience en cours permet au candidat de combiner ses connaissances théoriques avec une application pratique dans un contexte professionnel. L'accent sur les technologies 3D et le développement fullstack enrichit considérablement son profil technique.",
      conclusion:
        "Cette alternance permet au candidat de développer des compétences avancées en intégration 3D et développement fullstack, tout en renforçant sa maîtrise des méthodologies DevOps et de la documentation technique, éléments essentiels pour un développeur fullstack moderne.",
      achievement: 'Développeur Fullstack 3D',
    },
    {
      title: 'Stagiaire Consultant Informatique',
      company: 'SKOOVEL Sarl',
      period: 'Octobre 2023 - Juillet 2024',
      description:
        "Stage de 10 mois en tant que consultant informatique, avec des missions diversifiées incluant l'analyse de données, le support technique, le développement et la gestion de sites web, et la formation des utilisateurs.",
      clues: [
        {
          title: 'Analyse de Données',
          detail:
            "Analyse et traitement de données pour extraire des informations pertinentes et faciliter la prise de décision",
          icon: 'bi-graph-up',
          skill: 'Analyse de Données',
        },
        {
          title: 'Développement Web',
          detail:
            "Développement et maintenance de sites web pour divers clients, en utilisant différentes technologies web",
          icon: 'bi-code-slash',
          skill: 'Développement Web',
        },
        {
          title: 'Gestion Bases de Données',
          detail:
            "Administration et optimisation de bases de données pour assurer des performances optimales et la sécurité des données",
          icon: 'bi-database',
          skill: 'Bases de Données',
        },
        {
          title: 'Formation Utilisateurs',
          detail:
            "Conception et animation de sessions de formation pour les utilisateurs finaux sur l'utilisation des systèmes informatiques",
          icon: 'bi-people',
          skill: 'Formation',
        },
        {
          title: 'Gestion de Projets',
          detail:
            "Coordination et suivi de divers projets informatiques, en assurant le respect des délais et des objectifs",
          icon: 'bi-kanban',
          skill: 'Gestion de Projets',
        },
      ],
      skills: [
        'Analyse de Données',
        'Développement Web',
        'Bases de Données',
        'Formation',
        'Gestion de Projets',
      ],
      notes:
        "Cette expérience a permis au candidat de développer une polyvalence technique et des compétences en communication client importantes. La diversité des missions a contribué à renforcer sa capacité d'adaptation et sa vision globale des problématiques informatiques.",
      conclusion:
        "Ce stage a constitué une expérience professionnelle enrichissante pour le candidat, lui permettant de découvrir différentes facettes du métier de consultant informatique et de développer des compétences transversales précieuses pour sa future carrière de développeur fullstack.",
      achievement: 'Polyvalence Technique',
    },
    {
      title: 'Stagiaire Développeur Web',
      company: 'Megasoft Sarl',
      period: 'Avril 2022 - Juin 2022',
      description:
        "Premier stage en entreprise d'une durée de 3 mois, axé sur le développement web, l'intégration d'API REST, la maintenance d'applications existantes et l'optimisation de requêtes SQL.",
      clues: [
        {
          title: 'Application Web/Mobile',
          detail:
            "Participation au développement d'une application web avec adaptation mobile pour un client du secteur commercial",
          icon: 'bi-phone',
          skill: 'Développement Web/Mobile',
        },
        {
          title: 'Intégration API',
          detail:
            "Intégration d'API REST externes pour enrichir les fonctionnalités de l'application et assurer l'interopérabilité avec d'autres services",
          icon: 'bi-link',
          skill: 'Intégration API',
        },
        {
          title: 'Maintenance',
          detail:
            "Correction de bugs et amélioration des fonctionnalités existantes sur des applications en production",
          icon: 'bi-wrench',
          skill: 'Maintenance Applicative',
        },
        {
          title: 'Requêtes SQL',
          detail:
            "Création et optimisation de requêtes SQL pour améliorer les performances et l'efficacité des applications",
          icon: 'bi-database',
          skill: 'SQL',
        },
        {
          title: 'Tests',
          detail:
            "Mise en place et exécution de tests unitaires et fonctionnels pour assurer la qualité des développements",
          icon: 'bi-check-circle',
          skill: 'Tests',
        },
      ],
      skills: [
        'Développement Web/Mobile',
        'Intégration API',
        'Maintenance Applicative',
        'SQL',
        'Tests',
      ],
      notes:
        "Ce premier stage a constitué une introduction pratique au monde professionnel du développement web pour le candidat. Il a pu mettre en application les connaissances théoriques acquises durant sa formation et découvrir les réalités du développement en entreprise.",
      conclusion:
        "Cette expérience initiale a permis au candidat de se familiariser avec le cycle de développement complet d'une application web, depuis la conception jusqu'aux tests, en passant par l'intégration d'API et l'optimisation des performances. Elle a posé les bases de sa carrière de développeur fullstack.",
      achievement: 'Fondamentaux du Développement Web',
    },
    {
      title: 'Formation Académique',
      company: 'Parcours Universitaire',
      period: 'Septembre 2020 - Actuel',
      description:
        "Parcours de formation complet en informatique, du DUT Génie Logiciel au Master Informatique à l'Université de Toulouse Jean Jaurès, avec une spécialisation progressive vers le développement fullstack.",
      clues: [
        {
          title: 'Master Informatique',
          detail:
            "Master en cours à l'Université de Toulouse Jean Jaurès, avec spécialisation en développement d'applications",
          icon: 'bi-mortarboard',
          skill: 'Formation Supérieure',
        },
        {
          title: 'Licence Informatique',
          detail:
            "Licence Informatique et réseau obtenue à l'IUT de Bandjoun au Cameroun, avec acquisition des fondamentaux théoriques",
          icon: 'bi-award',
          skill: 'Informatique Théorique',
        },
        {
          title: 'DUT Génie Logiciel',
          detail:
            "Formation initiale en Génie Logiciel à l'IUT de Bandjoun, avec introduction aux méthodes de développement et programmation",
          icon: 'bi-code-square',
          skill: 'Programmation',
        },
        {
          title: 'Projets Académiques',
          detail:
            "Réalisation de nombreux projets pratiques dans le cadre de la formation, permettant d'explorer différentes technologies",
          icon: 'bi-folder',
          skill: 'Gestion de Projets',
        },
        {
          title: 'Alternance',
          detail:
            "Choix d'un Master en alternance pour combiner formation théorique et expérience professionnelle concrète",
          icon: 'bi-briefcase',
          skill: 'Professionnalisation',
        },
      ],
      skills: [
        'Formation Supérieure',
        'Informatique Théorique',
        'Programmation',
        'Gestion de Projets',
        'Professionnalisation',
      ],
      notes:
        "Le parcours académique du candidat montre une progression constante et une spécialisation progressive vers le développement d'applications. L'alternance choisie pour le Master témoigne d'une volonté de confronter la théorie à la pratique professionnelle.",
      conclusion:
        "Cette solide formation académique, complétée par l'alternance en cours, constitue une base théorique et technique robuste pour le candidat. Elle lui permet d'aborder le développement fullstack avec à la fois des connaissances théoriques approfondies et une expérience pratique en constante évolution.",
      achievement: 'Fondements Théoriques Solides',
    }
  ];

  // Données pour le quiz de matching (compétences/jobs)
  matchingSkills: string[] = [
    'Vue.js',
    'Architecture API REST',
    'Technologies 3D',
    'Node.js',
    'Spring Boot',
    'Symfony',
    'PostgreSQL',
    'MySQL',
    'Documentation Technique',
    'DevOps CI/CD',
  ];

  matchingJobs: {
    title: string;
    company: string;
    correctSkillIndices: number[];
  }[] = [
    {
      title: 'Alternant Développeur Fullstack',
      company: 'Arthur Ngaku (ANG Tech)',
      correctSkillIndices: [0, 2, 9],
    },
    {
      title: 'Stagiaire Consultant Informatique',
      company: 'SKOOVEL Sarl',
      correctSkillIndices: [4, 5, 7, 8],
    },
    {
      title: 'Stagiaire Développeur Web',
      company: 'Megasoft Sarl',
      correctSkillIndices: [1, 3, 6],
    },
    {
      title: 'Formation Académique',
      company: 'Parcours Universitaire',
      correctSkillIndices: [0, 1, 3, 4, 5, 6],
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
