import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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
  styleUrls: ['./competences.component.css']
})
export class CompetencesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string = "Agent, nous avons besoin d'une analyse complète des compétences techniques de notre sujet. Utilisez notre laboratoire d'analyse pour scanner et identifier ses capacités. Chaque domaine de compétence doit être examiné minutieusement pour évaluer son niveau d'expertise.";
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
    { id: 'devops', name: 'DevOps & Cloud', icon: 'bi-cloud' },
    { id: 'database', name: 'Base de données', icon: 'bi-database' },
    { id: 'softskills', name: 'Soft Skills', icon: 'bi-people' }
  ];

  // Compétences
  skills: Skill[] = [
    // Frontend
    {
      id: 'angular',
      name: 'Angular',
      category: 'frontend',
      level: 5,
      description: 'Développement avancé d\'applications SPA avec Angular, utilisant RxJS, NgRx pour la gestion d\'état, et Angular Material pour les composants UI.',
      icon: 'bi-code-slash',
      projects: ['Plateforme e-commerce', 'Dashboard analytique', 'Application de gestion de projet'],
      discovered: false
    },
    {
      id: 'react',
      name: 'React',
      category: 'frontend',
      level: 4,
      description: 'Création d\'interfaces utilisateur dynamiques avec React et Redux, en utilisant des hooks et des composants fonctionnels.',
      icon: 'bi-code-square',
      projects: ['Site vitrine interactif', 'Application de réservation'],
      discovered: false
    },
    {
      id: 'css',
      name: 'CSS/SASS',
      category: 'frontend',
      level: 4,
      description: 'Développement d\'interfaces responsives et animations avancées utilisant Flexbox, Grid, et animations CSS.',
      icon: 'bi-brush',
      projects: ['Refonte UI/UX', 'Thème personnalisé pour application SaaS'],
      discovered: false
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'frontend',
      level: 5,
      description: 'Utilisation approfondie du typage et des fonctionnalités avancées de TypeScript pour des applications robustes et maintenables.',
      icon: 'bi-braces',
      projects: ['Framework interne', 'Librairie de composants réutilisables'],
      discovered: false
    },
    
    // Backend
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'backend',
      level: 4,
      description: 'Développement de serveurs et APIs RESTful avec Express.js et NestJS, incluant l\'authentification et l\'autorisation.',
      icon: 'bi-hdd-network',
      projects: ['API gateway', 'Microservices pour système de paiement'],
      discovered: false
    },
    {
      id: 'spring',
      name: 'Spring Boot',
      category: 'backend',
      level: 3,
      description: 'Création de services backend robustes avec Spring Boot, JPA/Hibernate et Spring Security.',
      icon: 'bi-gear',
      projects: ['Système de gestion d\'inventaire', 'API pour application mobile'],
      discovered: false
    },
    {
      id: 'python',
      name: 'Python',
      category: 'backend',
      level: 3,
      description: 'Développement d\'outils d\'automatisation et scripts d\'analyse de données avec Python.',
      icon: 'bi-filetype-py',
      projects: ['Scripts ETL', 'Automatisation de déploiement'],
      discovered: false
    },
    
    // DevOps
    {
      id: 'docker',
      name: 'Docker',
      category: 'devops',
      level: 4,
      description: 'Conteneurisation d\'applications et orchestration avec Docker et Docker Compose.',
      icon: 'bi-box',
      projects: ['Infrastructure de développement', 'Pipeline CI/CD'],
      discovered: false
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      category: 'devops',
      level: 3,
      description: 'Déploiement et scaling d\'applications conteneurisées avec Kubernetes.',
      icon: 'bi-diagram-3',
      projects: ['Cluster de production', 'Système de déploiement blue/green'],
      discovered: false
    },
    {
      id: 'aws',
      name: 'AWS',
      category: 'devops',
      level: 4,
      description: 'Utilisation des services AWS pour l\'infrastructure cloud: EC2, S3, Lambda, CloudFormation.',
      icon: 'bi-cloud-check',
      projects: ['Architecture serverless', 'Système de stockage de données sécurisé'],
      discovered: false
    },
    {
      id: 'cicd',
      name: 'CI/CD',
      category: 'devops',
      level: 4,
      description: 'Mise en place de workflows d\'intégration et déploiement continus avec Jenkins, GitLab CI, et GitHub Actions.',
      icon: 'bi-arrow-repeat',
      projects: ['Pipeline de déploiement automatisé', 'Tests automatisés'],
      discovered: false
    },
    
    // Database
    {
      id: 'sql',
      name: 'SQL',
      category: 'database',
      level: 4,
      description: 'Conception et optimisation de bases de données relationnelles avec PostgreSQL et MySQL.',
      icon: 'bi-table',
      projects: ['Modélisation de base de données e-commerce', 'Optimisation de requêtes complexes'],
      discovered: false
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      category: 'database',
      level: 3,
      description: 'Développement de solutions NoSQL avec MongoDB, incluant l\'agrégation et le sharding.',
      icon: 'bi-file-earmark-binary',
      projects: ['Système de logging', 'API de contenu dynamique'],
      discovered: false
    },
    {
      id: 'orm',
      name: 'ORM / ODM',
      category: 'database',
      level: 4,
      description: 'Utilisation de Mongoose, TypeORM et Sequelize pour l\'abstraction de bases de données.',
      icon: 'bi-layers',
      projects: ['Module d\'accès aux données', 'Couche d\'abstraction multi-DB'],
      discovered: false
    },
    
    // Soft Skills
    {
      id: 'teamwork',
      name: 'Travail d\'équipe',
      category: 'softskills',
      level: 5,
      description: 'Collaboration efficace au sein d\'équipes multidisciplinaires, partage de connaissances et mentorat.',
      icon: 'bi-people-fill',
      projects: ['Direction technique d\'une équipe de 6 développeurs', 'Programme de mentorat'],
      discovered: false
    },
    {
      id: 'communication',
      name: 'Communication',
      category: 'softskills',
      level: 4,
      description: 'Communication claire des concepts techniques aux parties prenantes non techniques et documentation approfondie.',
      icon: 'bi-chat-dots',
      projects: ['Présentation technique aux clients', 'Documentation technique détaillée'],
      discovered: false
    },
    {
      id: 'problemsolving',
      name: 'Résolution de problèmes',
      category: 'softskills',
      level: 5,
      description: 'Analyse de problèmes complexes et développement de solutions créatives et efficaces.',
      icon: 'bi-puzzle',
      projects: ['Débogage de système legacy', 'Optimisation de performance'],
      discovered: false
    },
    {
      id: 'agile',
      name: 'Méthodologie Agile',
      category: 'softskills',
      level: 4,
      description: 'Expérience avec Scrum et Kanban, facilitation de cérémonies agiles et planification de sprint.',
      icon: 'bi-kanban',
      projects: ['Transformation Agile', 'Facilitation de rétrospectives'],
      discovered: false
    }
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
      console.warn('Ce module n\'est pas encore disponible');
      // Logique de redirection à implémenter si nécessaire
    }

    // Par défaut, aucune compétence n'est découverte sauf si on a des données sauvegardées
    this.skills = this.skills.map(skill => ({ ...skill, discovered: false }));

    // S'abonner au temps écoulé
    this.subscriptions.push(
      this.timeTrackerService.elapsedTime$.subscribe(time => {
        this.elapsedTime = time;
      })
    );

    // Vérifier si le module est déjà complété
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe(statuses => {
        this.isModuleCompleted = statuses.personnalite;
        this.moduleProgressPercentage = this.progressService.getCompletionPercentage();
        
        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted || this.userDataService.getModuleResponses('personnalite').length > 0) {
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
      const discoveredSkillsResponse = responses.find(r => r.questionId === 'discovered_skills');
      if (discoveredSkillsResponse && Array.isArray(discoveredSkillsResponse.response)) {
        const discoveredIds = discoveredSkillsResponse.response as string[];
        this.skills = this.skills.map(skill => ({
          ...skill,
          discovered: discoveredIds.includes(skill.id)
        }));
      }

      // Charger la catégorie sélectionnée
      const categoryResponse = responses.find(r => r.questionId === 'selected_category');
      if (categoryResponse && typeof categoryResponse.response === 'string') {
        this.selectedCategory = categoryResponse.response as string;
      }
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder les compétences découvertes
    const discoveredIds = this.skills
      .filter(skill => skill.discovered)
      .map(skill => skill.id);
    
    this.userDataService.saveResponse('personnalite', 'discovered_skills', discoveredIds);
    
    // Sauvegarder la catégorie sélectionnée
    if (this.selectedCategory) {
      this.userDataService.saveResponse('personnalite', 'selected_category', this.selectedCategory);
    }
    
    // Vérifier si le module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si les conditions de complétion du module sont remplies
  checkModuleCompletion(): void {
    // Par exemple, si un certain pourcentage des compétences sont découvertes
    const discoveryThreshold = Math.ceil(this.skills.length * 0.7); // 70% des compétences
    
    if (this.getDiscoveredSkillsCount() >= discoveryThreshold && !this.isModuleCompleted) {
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
      .map(skill => `${skill.name} (${skill.level}/5)`)
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
    this.userDataService.saveResponse('personnalite', 'selected_category', categoryId);
    
    // Animation pour le changement de catégorie
    const container = document.querySelector('.skill-visualization');
    if (container) {
      container.classList.add('category-change');
      setTimeout(() => {
        container.classList.remove('category-change');
      }, 500);
    }
  }
  
  // Démarrer un scan des compétences
  startSkillScan(): void {
    if (this.isScanning || !this.selectedCategory) return;
    
    this.isScanning = true;
    this.scanProgress = 0;
    this.scanningText = 'Scan en cours...';
    
    // Obtenir les compétences non découvertes pour la catégorie sélectionnée
    const undiscoveredSkills = this.getSkillsByCategory(this.selectedCategory).filter(skill => !skill.discovered);
    
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
    this.scannedSkillIndex = this.getSkillsByCategory(this.selectedCategory).findIndex(s => s.id === skillToDiscover.id);
    
    // Animation de scan
    const scanInterval = setInterval(() => {
      this.scanProgress += 2;
      
      if (this.scanProgress >= 100) {
        clearInterval(scanInterval);
        
        // Révéler la compétence
        this.revealSkill(skillToDiscover.id);
        
        // Réinitialiser l'état du scan
        setTimeout(() => {
          this.isScanning = false;
          this.scanProgress = 0;
          this.scannedSkillIndex = -1;
          this.scanningText = `Scan terminé - ${skillToDiscover.name} identifié`;
        }, 500);
      }
    }, 50);
  }
  
  // Révéler une compétence spécifique
  revealSkill(skillId: string): void {
    const skillIndex = this.skills.findIndex(s => s.id === skillId);
    if (skillIndex >= 0) {
      // Créer une nouvelle copie du tableau avec la compétence mise à jour
      const updatedSkills = [...this.skills];
      updatedSkills[skillIndex] = { ...updatedSkills[skillIndex], discovered: true };
      this.skills = updatedSkills;
      
      // Sauvegarder l'état
      this.saveState();
    }
  }
  
  // Obtenir le nom d'une catégorie par son ID
  getCategoryName(categoryId: string): string {
    const category = this.skillCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  }
  
  // Obtenir l'icône d'une catégorie par son ID
  getCategoryIcon(categoryId: string): string {
    const category = this.skillCategories.find(c => c.id === categoryId);
    return category ? category.icon : 'bi-question';
  }
  
  // Obtenir les compétences par catégorie
  getSkillsByCategory(categoryId: string): Skill[] {
    return this.skills.filter(skill => skill.category === categoryId);
  }
  
  // Obtenir le pourcentage de complétion d'une catégorie
  getCategoryCompletionPercentage(categoryId: string): number {
    const categorySkills = this.getSkillsByCategory(categoryId);
    if (categorySkills.length === 0) return 0;
    
    const discoveredCount = categorySkills.filter(skill => skill.discovered).length;
    return Math.round((discoveredCount / categorySkills.length) * 100);
  }
  
  // Obtenir le niveau moyen d'une catégorie (pour le graphique radar)
  getCategoryAverageLevel(categoryId: string): number {
    const discoveredSkills = this.getSkillsByCategory(categoryId).filter(skill => skill.discovered);
    if (discoveredSkills.length === 0) return 0;
    
    const sum = discoveredSkills.reduce((total, skill) => total + skill.level, 0);
    return sum / discoveredSkills.length;
  }
  
  // Obtenir le niveau moyen des compétences techniques (hors soft skills)
  getAverageTechnicalSkillLevel(): number {
    const technicalSkills = this.skills.filter(
      skill => skill.discovered && skill.category !== 'softskills'
    );
    
    if (technicalSkills.length === 0) return 0;
    
    const sum = technicalSkills.reduce((total, skill) => total + skill.level, 0);
    return parseFloat((sum / technicalSkills.length).toFixed(1));
  }
  
  // Obtenir les compétences les plus fortes (pour l'affichage des compétences clés)
  getTopSkills(limit: number = 6): Skill[] {
    return this.skills
      .filter(skill => skill.discovered)
      .sort((a, b) => b.level - a.level)
      .slice(0, limit);
  }
  
  // Obtenir le nombre total de compétences
  getTotalSkillsCount(): number {
    return this.skills.length;
  }
  
  // Obtenir le nombre de compétences découvertes
  getDiscoveredSkillsCount(): number {
    return this.skills.filter(skill => skill.discovered).length;
  }
  
  // Obtenir le pourcentage global de complétion
  getOverallCompletionPercentage(): number {
    return Math.round((this.getDiscoveredSkillsCount() / this.getTotalSkillsCount()) * 100);
  }
  
  // Obtenir une description textuelle du niveau de compétence
  getLevelDescription(level: number): string {
    switch (level) {
      case 1: return 'Notions de base';
      case 2: return 'Compétent';
      case 3: return 'Avancé';
      case 4: return 'Expert';
      case 5: return 'Maîtrise complète';
      default: return 'Inconnu';
    }
  }
  
  // Calculer l'angle pour positionner un nœud dans le graphique en étoile
  getNodeAngle(index: number, total: number): number {
    if (total <= 1) return 0;
    return (index * (360 / total));
  }
  
  // Calculer la distance depuis le centre en fonction du niveau de compétence
  getNodeDistance(level: number): number {
    // Normaliser le niveau pour qu'il soit entre 0.3 (plus proche du centre) et 1.0 (plus loin du centre)
    return 0.3 + ((level - 1) / 4) * 0.7;
  }
}