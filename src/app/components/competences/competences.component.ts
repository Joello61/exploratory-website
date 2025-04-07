import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';

interface SkillCategory {
  id: string;
  name: string;
  icon: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  description: string;
  icon: string;
  projects: string[];
  discovered: boolean;
}

@Component({
  selector: 'app-competences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competences.component.html',
  styleUrls: ['./competences.component.css'],
})
export class CompetencesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Pour gérer la destruction proprement
  private destroy$ = new Subject<void>();

  // Gérer les timeouts et intervalles
  private introDialogTimeoutId: number | null = null;
  private categoryChangeTimeoutId: number | null = null;
  private scanCompletionTimeoutId: number | null = null;
  private scanIntervalId: number | null = null;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, nous avons besoin d'une analyse complète des compétences techniques de notre sujet. Utilisez notre laboratoire d'analyse pour scanner et identifier ses capacités. Chaque domaine de compétence doit être examiné minutieusement pour évaluer son niveau d'expertise.";
  private subscriptions: Subscription[] = [];

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Données de progression et de temps
  elapsedTime: string = '00:00:00';
  isModuleCompleted: boolean = false;
  moduleProgressPercentage: number = 0;

  // État du scan
  isScanning: boolean = false;
  scanProgress: number = 0;
  scanningText: string = 'En attente de scan';
  scannedSkillIndex: number = -1;

  // Mode d'affichage
  selectedCategory: string | null = null;

  // Catégories de compétences
  skillCategories: SkillCategory[] = [
    { id: 'frontend', name: 'Développement Frontend', icon: 'bi-window' },
    { id: 'backend', name: 'Développement Backend', icon: 'bi-server' },
    { id: 'mobile3d', name: 'Mobile & 3D', icon: 'bi-phone' },
    { id: 'devops', name: 'DevOps & CI/CD', icon: 'bi-gear-wide-connected' },
    { id: 'database', name: 'Bases de données', icon: 'bi-database' },
    {
      id: 'documentation',
      name: 'Documentation & Gestion',
      icon: 'bi-file-text',
    },
    { id: 'softskills', name: 'Soft Skills', icon: 'bi-people' },
  ];

  // Compétences
  skills: Skill[] = [
    // Frontend
    {
      id: 'vue',
      name: 'Vue.js',
      category: 'frontend',
      level: 4,
      description:
        "Développement d'interfaces utilisateur réactives avec Vue.js, utilisé notamment pour le frontend de l'application 3D chez ANG Tech.",
      icon: 'bi-code-slash',
      projects: [
        'Application web/mobile avec intégration 3D',
        'Interfaces utilisateur réactives',
      ],
      discovered: false,
    },
    {
      id: 'angular',
      name: 'Angular',
      category: 'frontend',
      level: 3,
      description:
        "Création d'applications web dynamiques avec Angular, en utilisant TypeScript et les composants réutilisables.",
      icon: 'bi-code-square',
      projects: ['Projets académiques', "Composants d'interface utilisateur"],
      discovered: false,
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'frontend',
      level: 3,
      description:
        'Utilisation de TypeScript pour le développement frontend structuré et typé, permettant une meilleure maintenabilité du code.',
      icon: 'bi-braces',
      projects: ['Applications Vue.js', 'Projets Angular'],
      discovered: false,
    },
    {
      id: 'responsive',
      name: 'Responsive Design',
      category: 'frontend',
      level: 3,
      description:
        "Création d'interfaces adaptatives pour différents appareils en utilisant les techniques modernes de CSS et les frameworks responsive.",
      icon: 'bi-layout-split',
      projects: ['Applications web/mobile', 'Sites adaptés multi-écrans'],
      discovered: false,
    },

    // Backend
    {
      id: 'spring',
      name: 'Spring Boot',
      category: 'backend',
      level: 3,
      description:
        "Développement de services backend robustes avec Spring Boot, incluant la création d'API REST sécurisées.",
      icon: 'bi-gear',
      projects: ['Backend pour application 3D', 'API sécurisées'],
      discovered: false,
    },
    {
      id: 'symfony',
      name: 'Symfony',
      category: 'backend',
      level: 3,
      description:
        "Conception d'applications PHP structurées et performantes avec le framework Symfony.",
      icon: 'bi-code-slash',
      projects: ['Applications web', 'Services backend'],
      discovered: false,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'backend',
      level: 3,
      description:
        'Création de serveurs et APIs avec Node.js et Express, pour des applications web modernes.',
      icon: 'bi-hdd-network',
      projects: ['Services web', 'API REST'],
      discovered: false,
    },
    {
      id: 'python',
      name: 'Python',
      category: 'backend',
      level: 2,
      description:
        "Utilisation de Python pour le développement backend avec Flask, l'analyse de données et l'automatisation.",
      icon: 'bi-filetype-py',
      projects: ["Scripts d'analyse", 'Applications web avec Flask'],
      discovered: false,
    },

    // Mobile & 3D
    {
      id: 'mobile-web',
      name: 'Développement Web Mobile',
      category: 'mobile3d',
      level: 3,
      description:
        "Création d'applications web adaptées aux appareils mobiles, avec une expérience utilisateur optimisée.",
      icon: 'bi-phone',
      projects: [
        'Applications web/mobile chez ANG Tech',
        'Interfaces responsives',
      ],
      discovered: false,
    },
    {
      id: '3d-integration',
      name: 'Intégration 3D Web',
      category: 'mobile3d',
      level: 3,
      description:
        "Intégration de technologies 3D dans des applications web, incluant l'utilisation d'API de traitement d'images.",
      icon: 'bi-box',
      projects: [
        "Application d'analyse de mesures corporelles 3D",
        'Visualisation 3D web',
      ],
      discovered: false,
    },
    {
      id: 'api-integration',
      name: "Intégration d'API",
      category: 'mobile3d',
      level: 3,
      description:
        "Intégration d'API externes et développement d'API personnalisées pour les applications web et mobiles.",
      icon: 'bi-link',
      projects: ["API de traitement d'images", "Services d'intégration"],
      discovered: false,
    },

    // DevOps & CI/CD
    {
      id: 'docker',
      name: 'Docker',
      category: 'devops',
      level: 2,
      description:
        "Conteneurisation d'applications avec Docker pour faciliter le déploiement et assurer la cohérence des environnements.",
      icon: 'bi-box',
      projects: [
        'Environnements de développement',
        "Configurations d'applications",
      ],
      discovered: false,
    },
    {
      id: 'git',
      name: 'Git',
      category: 'devops',
      level: 3,
      description:
        'Gestion de versions et collaboration avec Git, incluant les workflows de branches et les stratégies de fusion.',
      icon: 'bi-git',
      projects: ['Gestion de code source', "Collaboration d'équipe"],
      discovered: false,
    },
    {
      id: 'cicd',
      name: 'CI/CD GitLab',
      category: 'devops',
      level: 3,
      description:
        'Configuration et utilisation de pipelines CI/CD avec GitLab pour automatiser les tests et déploiements.',
      icon: 'bi-arrow-repeat',
      projects: ['Pipelines CI/CD chez ANG Tech', 'Automatisation de tests'],
      discovered: false,
    },

    // Bases de données
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'database',
      level: 3,
      description:
        "Conception et gestion de bases de données PostgreSQL, incluant l'optimisation de requêtes complexes.",
      icon: 'bi-database',
      projects: [
        "Bases de données d'application",
        'Stockage de données structurées',
      ],
      discovered: false,
    },
    {
      id: 'mysql',
      name: 'MySQL',
      category: 'database',
      level: 3,
      description:
        'Administration et optimisation de bases de données MySQL pour des applications web et mobiles.',
      icon: 'bi-database-fill',
      projects: [
        'Systèmes de stockage relationnels',
        'Bases de données applicatives',
      ],
      discovered: false,
    },
    {
      id: 'sql-optimization',
      name: 'Optimisation SQL',
      category: 'database',
      level: 2,
      description:
        'Création et optimisation de requêtes SQL pour améliorer les performances des applications.',
      icon: 'bi-speedometer2',
      projects: ['Requêtes complexes', 'Amélioration de performance'],
      discovered: false,
    },

    // Documentation & Gestion
    {
      id: 'tech-documentation',
      name: 'Documentation Technique',
      category: 'documentation',
      level: 3,
      description:
        "Rédaction de documentation technique claire et complète, incluant l'architecture, les guides utilisateur et la maintenance.",
      icon: 'bi-file-text',
      projects: ['Documentation chez ANG Tech', 'Guides techniques'],
      discovered: false,
    },
    {
      id: 'project-management',
      name: 'Gestion de Projets',
      category: 'documentation',
      level: 2,
      description:
        "Planification et suivi de projets techniques, coordination d'équipe et gestion des délais.",
      icon: 'bi-kanban',
      projects: [
        'Gestion de projets chez SKOOVEL',
        "Coordination d'activités techniques",
      ],
      discovered: false,
    },
    {
      id: 'testing',
      name: 'Tests et Qualité',
      category: 'documentation',
      level: 2,
      description:
        'Mise en place et exécution de tests unitaires et fonctionnels pour assurer la qualité des applications.',
      icon: 'bi-check-circle',
      projects: ['Tests automatisés', 'Validation de fonctionnalités'],
      discovered: false,
    },

    // Soft Skills
    {
      id: 'teamwork',
      name: "Travail d'équipe",
      category: 'softskills',
      level: 4,
      description:
        "Collaboration efficace au sein d'équipes de développement, partage de connaissances et adaptation aux environnements d'équipe.",
      icon: 'bi-people-fill',
      projects: ['Projets collaboratifs', 'Développement en équipe'],
      discovered: false,
    },
    {
      id: 'adaptability',
      name: 'Adaptabilité',
      category: 'softskills',
      level: 4,
      description:
        "Capacité à s'adapter rapidement à de nouvelles technologies, environnements et exigences de projet.",
      icon: 'bi-shuffle',
      projects: [
        'Alternance études-travail',
        'Multiples environnements techniques',
      ],
      discovered: false,
    },
    {
      id: 'critical-thinking',
      name: 'Esprit critique',
      category: 'softskills',
      level: 3,
      description:
        'Analyse approfondie des problèmes techniques et évaluation objective des solutions possibles.',
      icon: 'bi-lightbulb',
      projects: [
        'Résolution de problèmes complexes',
        'Optimisation de solutions',
      ],
      discovered: false,
    },
    {
      id: 'time-management',
      name: 'Gestion du temps',
      category: 'softskills',
      level: 3,
      description:
        "Organisation efficace du temps entre les responsabilités académiques et professionnelles dans le cadre de l'alternance.",
      icon: 'bi-clock',
      projects: ['Équilibre études-travail', 'Respect des délais'],
      discovered: false,
    },
    {
      id: 'creativity',
      name: 'Créativité technique',
      category: 'softskills',
      level: 3,
      description:
        'Approche créative dans la résolution de problèmes techniques et le développement de fonctionnalités innovantes.',
      icon: 'bi-palette',
      projects: ['Solutions innovantes', 'Approches alternatives'],
      discovered: false,
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
    if (!this.progressService.isModuleAvailable('competences')) {
      console.warn("Ce module n'est pas encore disponible");
    }

    // Par défaut, aucune compétence n'est découverte sauf si on a des données sauvegardées
    this.skills = this.skills.map((skill) => ({ ...skill, discovered: false }));

    // S'abonner au temps écoulé avec takeUntil
    this.timeTrackerService.elapsedTime$
      .pipe(takeUntil(this.destroy$))
      .subscribe((time) => {
        this.elapsedTime = time;
      });

    // Vérifier si le module est déjà complété
    this.progressService.moduleStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statuses) => {
        this.isModuleCompleted = statuses.personnalite;
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();

        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (
          this.isModuleCompleted ||
          this.userDataService.getModuleResponses('personnalite').length > 0
        ) {
          this.loadSavedState();
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
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService avec un timeout géré
    this.introDialogTimeoutId = window.setTimeout(() => {
      this.showIntroDialog();
      this.introDialogTimeoutId = null;
    }, 500);
  }

  ngOnDestroy(): void {
    // Émettre le signal de destruction pour tous les observables
    this.destroy$.next();
    this.destroy$.complete();

    // Nettoyer tous les timeouts et intervalles
    this.clearAllTimeoutsAndIntervals();

    // Fermer tout dialogue ouvert
    if (this.isDialogOpen) {
      this.dialogService.closeDialog();
    }
  }

  // Nettoyer tous les timeouts et intervalles
  private clearAllTimeoutsAndIntervals(): void {
    // Nettoyer les timeouts
    if (this.introDialogTimeoutId !== null) {
      clearTimeout(this.introDialogTimeoutId);
      this.introDialogTimeoutId = null;
    }

    if (this.categoryChangeTimeoutId !== null) {
      clearTimeout(this.categoryChangeTimeoutId);
      this.categoryChangeTimeoutId = null;
    }

    if (this.scanCompletionTimeoutId !== null) {
      clearTimeout(this.scanCompletionTimeoutId);
      this.scanCompletionTimeoutId = null;
    }

    // Nettoyer l'intervalle de scan
    if (this.scanIntervalId !== null) {
      clearInterval(this.scanIntervalId);
      this.scanIntervalId = null;
    }
  }

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: '', // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective',
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText);
  }

  // Fermer le dialogue
  closeDialogTypeWriter(): void {
    this.dialogService.closeDialog();
  }

  // Charger l'état sauvegardé précédemment
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('personnalite');

    if (responses.length > 0) {
      // Charger les compétences découvertes
      const discoveredSkillsResponse = responses.find(
        (r) => r.questionId === 'discovered_skills'
      );
      if (
        discoveredSkillsResponse &&
        Array.isArray(discoveredSkillsResponse.response)
      ) {
        const discoveredIds = discoveredSkillsResponse.response as string[];
        this.skills = this.skills.map((skill) => ({
          ...skill,
          discovered: discoveredIds.includes(skill.id),
        }));
      }

      // Charger la catégorie sélectionnée
      const categoryResponse = responses.find(
        (r) => r.questionId === 'selected_category'
      );
      if (categoryResponse && typeof categoryResponse.response === 'string') {
        this.selectedCategory = categoryResponse.response as string;
      }
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder les compétences découvertes
    const discoveredIds = this.skills
      .filter((skill) => skill.discovered)
      .map((skill) => skill.id);

    this.userDataService.saveResponse(
      'personnalite',
      'discovered_skills',
      discoveredIds
    );

    // Sauvegarder la catégorie sélectionnée
    if (this.selectedCategory) {
      this.userDataService.saveResponse(
        'personnalite',
        'selected_category',
        this.selectedCategory
      );
    }

    // Vérifier si le module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si les conditions de complétion du module sont remplies
  checkModuleCompletion(): void {
    // Par exemple, si un certain pourcentage des compétences sont découvertes
    const discoveryThreshold = Math.ceil(this.skills.length * 0.7); // 70% des compétences

    if (
      this.getDiscoveredSkillsCount() >= discoveryThreshold &&
      !this.isModuleCompleted
    ) {
      this.completeModule();
    }
  }

  // Marquer le module comme complété
  completeModule(): void {
    this.progressService.completeModule('personnalite');
    this.isModuleCompleted = true;

    // Ajouter une note automatique pour résumer ce qui a été fait
    this.addCompletionNote();
  }

  // Ajouter une note récapitulative automatique
  addCompletionNote(): void {
    const discoveredCount = this.getDiscoveredSkillsCount();
    const totalCount = this.getTotalSkillsCount();

    // Récupérer les compétences principales découvertes
    const topSkills = this.getTopSkills(5)
      .map((skill) => `${skill.name} (${skill.level}/5)`)
      .join(', ');

    const noteContent = `
Module "Compétences" complété le ${new Date().toLocaleDateString()}.
${discoveredCount}/${totalCount} compétences identifiées.
Compétences clés: ${topSkills}.
Niveau moyen des compétences techniques: ${this.getAverageTechnicalSkillLevel()}/5.
    `;

    this.noteService.addNote(noteContent.trim());
  }

  // Ouvrir le panneau de notes
  toggleNotes(): void {
    this.noteService.toggleNotesVisibility();
  }

  // Sélection d'une catégorie
  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;

    // Sauvegarder la sélection
    this.userDataService.saveResponse(
      'personnalite',
      'selected_category',
      categoryId
    );

    // Animation pour le changement de catégorie
    const container = document.querySelector('.skill-visualization');
    if (container) {
      container.classList.add('category-change');

      // Nettoyer tout timeout précédent
      if (this.categoryChangeTimeoutId !== null) {
        clearTimeout(this.categoryChangeTimeoutId);
      }

      this.categoryChangeTimeoutId = window.setTimeout(() => {
        if (container) {
          container.classList.remove('category-change');
        }
        this.categoryChangeTimeoutId = null;
      }, 500);
    }
  }

  // Démarrer un scan des compétences
  startSkillScan(): void {
    if (this.isScanning || !this.selectedCategory) return;

    // Nettoyer tout scan précédent
    this.clearScanResources();

    this.isScanning = true;
    this.scanProgress = 0;
    this.scanningText = 'Scan en cours...';

    // Obtenir les compétences non découvertes pour la catégorie sélectionnée
    const undiscoveredSkills = this.getSkillsByCategory(
      this.selectedCategory
    ).filter((skill) => !skill.discovered);

    if (undiscoveredSkills.length === 0) {
      // Toutes les compétences sont déjà découvertes
      this.scanningText = 'Scan terminé - Toutes les compétences identifiées';
      this.isScanning = false;
      return;
    }

    // Choisir une compétence au hasard à découvrir
    const randomIndex = Math.floor(Math.random() * undiscoveredSkills.length);
    const skillToDiscover = undiscoveredSkills[randomIndex];

    // Index dans la liste complète des compétences de la catégorie
    this.scannedSkillIndex = this.getSkillsByCategory(
      this.selectedCategory
    ).findIndex((s) => s.id === skillToDiscover.id);

    // Animation de scan avec un intervalle géré
    this.scanIntervalId = window.setInterval(() => {
      this.scanProgress += 2;

      if (this.scanProgress >= 100) {
        // Nettoyer l'intervalle
        if (this.scanIntervalId !== null) {
          clearInterval(this.scanIntervalId);
          this.scanIntervalId = null;
        }

        // Révéler la compétence
        this.revealSkill(skillToDiscover.id);

        // Réinitialiser l'état du scan
        this.scanCompletionTimeoutId = window.setTimeout(() => {
          this.isScanning = false;
          this.scanProgress = 0;
          this.scannedSkillIndex = -1;
          this.scanningText = `Scan terminé - ${skillToDiscover.name} identifié`;
          this.scanCompletionTimeoutId = null;
        }, 500);
      }
    }, 50);
  }

  // Nettoyer les ressources du scan
  private clearScanResources(): void {
    // Nettoyer l'intervalle de scan
    if (this.scanIntervalId !== null) {
      clearInterval(this.scanIntervalId);
      this.scanIntervalId = null;
    }

    // Nettoyer le timeout de complétion du scan
    if (this.scanCompletionTimeoutId !== null) {
      clearTimeout(this.scanCompletionTimeoutId);
      this.scanCompletionTimeoutId = null;
    }
  }

  // Révéler une compétence spécifique
  revealSkill(skillId: string): void {
    const skillIndex = this.skills.findIndex((s) => s.id === skillId);
    if (skillIndex >= 0) {
      // Créer une nouvelle copie du tableau avec la compétence mise à jour
      const updatedSkills = [...this.skills];
      updatedSkills[skillIndex] = {
        ...updatedSkills[skillIndex],
        discovered: true,
      };
      this.skills = updatedSkills;

      // Sauvegarder l'état
      this.saveState();
    }
  }

  // Obtenir le nom d'une catégorie par son ID
  getCategoryName(categoryId: string): string {
    const category = this.skillCategories.find((c) => c.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  }

  // Obtenir l'icône d'une catégorie par son ID
  getCategoryIcon(categoryId: string): string {
    const category = this.skillCategories.find((c) => c.id === categoryId);
    return category ? category.icon : 'bi-question';
  }

  // Obtenir les compétences par catégorie
  getSkillsByCategory(categoryId: string): Skill[] {
    return this.skills.filter((skill) => skill.category === categoryId);
  }

  // Obtenir le pourcentage de complétion d'une catégorie
  getCategoryCompletionPercentage(categoryId: string): number {
    const categorySkills = this.getSkillsByCategory(categoryId);
    if (categorySkills.length === 0) return 0;

    const discoveredCount = categorySkills.filter(
      (skill) => skill.discovered
    ).length;
    return Math.round((discoveredCount / categorySkills.length) * 100);
  }

  // Obtenir le niveau moyen d'une catégorie (pour le graphique radar)
  getCategoryAverageLevel(categoryId: string): number {
    const discoveredSkills = this.getSkillsByCategory(categoryId).filter(
      (skill) => skill.discovered
    );
    if (discoveredSkills.length === 0) return 0;

    const sum = discoveredSkills.reduce(
      (total, skill) => total + skill.level,
      0
    );
    return sum / discoveredSkills.length;
  }

  // Obtenir le niveau moyen des compétences techniques (hors soft skills)
  getAverageTechnicalSkillLevel(): number {
    const technicalSkills = this.skills.filter(
      (skill) => skill.discovered && skill.category !== 'softskills'
    );

    if (technicalSkills.length === 0) return 0;

    const sum = technicalSkills.reduce(
      (total, skill) => total + skill.level,
      0
    );
    return parseFloat((sum / technicalSkills.length).toFixed(1));
  }

  // Obtenir les compétences les plus fortes (pour l'affichage des compétences clés)
  getTopSkills(limit: number = 6): Skill[] {
    return this.skills
      .filter((skill) => skill.discovered)
      .sort((a, b) => b.level - a.level)
      .slice(0, limit);
  }

  // Obtenir le nombre total de compétences
  getTotalSkillsCount(): number {
    return this.skills.length;
  }

  // Obtenir le nombre de compétences découvertes
  getDiscoveredSkillsCount(): number {
    return this.skills.filter((skill) => skill.discovered).length;
  }

  // Obtenir le pourcentage global de complétion
  getOverallCompletionPercentage(): number {
    return Math.round(
      (this.getDiscoveredSkillsCount() / this.getTotalSkillsCount()) * 100
    );
  }

  // Obtenir une description textuelle du niveau de compétence
  getLevelDescription(level: number): string {
    switch (level) {
      case 1:
        return 'Notions de base';
      case 2:
        return 'Compétent';
      case 3:
        return 'Avancé';
      case 4:
        return 'Expert';
      case 5:
        return 'Maîtrise complète';
      default:
        return 'Inconnu';
    }
  }

  // Calculer l'angle pour positionner un nœud dans le graphique en étoile
  getNodeAngle(index: number, total: number): number {
    if (total <= 1) return 0;
    return index * (360 / total);
  }

  // Calculer la distance depuis le centre en fonction du niveau de compétence
  getNodeDistance(level: number): number {
    // Normaliser le niveau pour qu'il soit entre 0.3 (plus proche du centre) et 1.0 (plus loin du centre)
    return 0.3 + ((level - 1) / 4) * 0.7;
  }
}
