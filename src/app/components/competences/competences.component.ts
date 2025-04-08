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
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js/auto';
import { Router } from '@angular/router';
import { Skill } from '../../models/competences/skill';
import { SkillCategory } from '../../models/competences/skill-category';
import { DialogMessage } from '../../models/others/dialod-message';
import { QuizQuestion } from '../../models/competences/quiz-question';
import { SKILLCATEGORIESDATA } from '../../database/competences/skillCategories.data';
import { SKILLSDATA } from '../../database/competences/skills.data';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-competences',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './competences.component.html',
  styleUrls: ['./competences.component.css'],
})
export class CompetencesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;
  private radarChart: Chart | null = null;

  // Pour gérer la destruction proprement
  private destroy$ = new Subject<void>();

  // Gérer les timeouts et intervalles
  private introDialogTimeoutId: number | null = null;
  private closeDialogTimeoutId: number | null = null;
  private categoryChangeTimeoutId: number | null = null;
  private scanCompletionTimeoutId: number | null = null;
  private scanIntervalId: number | null = null;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, nous avons besoin d'une analyse complète des compétences techniques de notre sujet. Utilisez notre laboratoire d'analyse pour scanner et identifier ses capacités. Chaque domaine de compétence doit être examiné minutieusement pour évaluer son niveau d'expertise.";

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

  // Nouvelles propriétés pour le jeu interactif
  isQuizModalOpen: boolean = false;
  quizCompleted: boolean = false;
  quizPassed: boolean = false;
  quizScore: number = 0;
  redirectInProgress: boolean = false;

  // Mode d'affichage
  selectedCategory: string | null = null;

  selectedQuizQuestion: number = 0;
  userAnswers: string[] = [];
  // Un jeu simple de matching de compétences avec leurs catégories
  quizQuestions: QuizQuestion[] = [];

  //données

  // Catégories de compétences
  skillCategories: SkillCategory[] = SKILLCATEGORIESDATA;

  // Compétences
  skills: Skill[] = SKILLSDATA;

  constructor(
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('competences')) {
      console.warn("Ce module n'est pas encore disponible");
    }

    // Initialiser les compétences avec le statut discovered = false
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
        // Utiliser la clé correcte pour le module de compétences
        this.isModuleCompleted = statuses.competences;
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();

        // Charger l'état si le module est complété ou si des réponses existent
        if (
          this.isModuleCompleted ||
          this.userDataService.getModuleResponses('competences').length > 0
        ) {
          this.loadSavedState();
          
          // Initialiser le graphique radar si le module est complété
          if (this.isModuleCompleted) {
            // Utiliser un setTimeout pour s'assurer que le ViewChild est disponible
            setTimeout(() => {
              this.initRadarChart();
            }, 0);
          }
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

    // Détruire le graphique pour libérer des ressources
    if (this.radarChart) {
      this.radarChart.destroy();
      this.radarChart = null; // Bonne pratique de mettre à null après destruction
    }
  }

  // Nettoyer tous les timeouts et intervalles
  private clearAllTimeoutsAndIntervals(): void {
    // Nettoyer les timeouts
    if (this.introDialogTimeoutId !== null) {
      window.clearTimeout(this.introDialogTimeoutId);
      this.introDialogTimeoutId = null;
    }

    if (this.closeDialogTimeoutId !== null) {
      window.clearTimeout(this.closeDialogTimeoutId);
      this.closeDialogTimeoutId = null;
    }

    if (this.categoryChangeTimeoutId !== null) {
      window.clearTimeout(this.categoryChangeTimeoutId);
      this.categoryChangeTimeoutId = null;
    }

    if (this.scanCompletionTimeoutId !== null) {
      window.clearTimeout(this.scanCompletionTimeoutId);
      this.scanCompletionTimeoutId = null;
    }

    // Nettoyer l'intervalle de scan
    if (this.scanIntervalId !== null) {
      window.clearInterval(this.scanIntervalId);
      this.scanIntervalId = null;
    }
  }

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: '', // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective',
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText, () => {
      // Nettoyer le timeout précédent s'il existe
      if (this.closeDialogTimeoutId !== null) {
        window.clearTimeout(this.closeDialogTimeoutId);
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
      window.clearTimeout(this.closeDialogTimeoutId);
      this.closeDialogTimeoutId = null;
    }
  }

  // Initialiser le graphique radar avec Chart.js
  initRadarChart(): void {
    if (!this.radarCanvas || !this.radarCanvas.nativeElement) {
      console.warn('Canvas pour le radar chart non disponible');
      return;
    }

    // Enregistrer les composants nécessaires de Chart.js
    Chart.register(
      RadarController,
      RadialLinearScale,
      PointElement,
      LineElement,
      Filler,
      Tooltip,
      Legend
    );

    const labels = this.skillCategories.map((category) => category.name);
    const data = this.skillCategories.map((category) =>
      this.getCategoryAverageLevel(category.id)
    );

    // Création d'un dégradé pour le fond du radar
    const ctx = this.radarCanvas.nativeElement.getContext('2d');

    // Vérification que ctx n'est pas null
    if (!ctx) {
      console.error("Impossible d'obtenir le contexte 2D du canvas");
      return;
    }

    const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, 'rgba(0, 191, 255, 0.3)');
    gradientFill.addColorStop(1, 'rgba(0, 115, 255, 0.1)');

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Niveau moyen',
          data: data,
          backgroundColor: gradientFill,
          borderColor: '#00bfff',
          borderWidth: 2,
          pointBackgroundColor: '#33ccff',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#00bfff',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
        },
      ],
    };

    const config: ChartConfiguration<'radar'> = {
      type: 'radar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#a0d8ff',
              font: {
                size: 14,
                family: 'Roboto, sans-serif',
              },
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 46, 0.8)',
            titleColor: '#00bfff',
            bodyColor: '#f5f5f5',
            borderColor: '#00bfff',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                return `Niveau: ${context.parsed.r}/5`;
              },
            },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 5,
            ticks: {
              stepSize: 1,
              display: true,
              backdropColor: 'transparent',
              color: '#80b9d8',
            },
            angleLines: {
              color: 'rgba(0, 191, 255, 0.1)',
              lineWidth: 1,
            },
            grid: {
              color: 'rgba(0, 191, 255, 0.15)',
              circular: true,
            },
            pointLabels: {
              color: '#d0f0ff',
              font: {
                size: 12,
                family: 'Roboto, sans-serif',
              },
            },
          },
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart',
        },
      },
      plugins: [
        {
          id: 'glowEffect',
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.shadowColor = 'rgba(0, 191, 255, 0.5)';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#00bfff';
            ctx.lineWidth = 2;
          },
          afterDraw: (chart) => {
            chart.ctx.restore();
          },
        },
      ],
    };

    // Vérifier si le graphique existe déjà et le détruire
    if (this.radarChart) {
      this.radarChart.destroy();
    }

    // Créer le nouveau graphique
    this.radarChart = new Chart(this.radarCanvas.nativeElement, config);
  }

  // Méthode pour mettre à jour le graphique après révélation d'une compétence
  updateRadarChart(): void {
    if (this.radarChart) {
      const data = this.skillCategories.map((category) => 
        this.getCategoryAverageLevel(category.id)
      );
      
      if (this.radarChart.data.datasets && this.radarChart.data.datasets.length > 0) {
        this.radarChart.data.datasets[0].data = data;
        this.radarChart.update();
      }
    } else if (this.isModuleCompleted) {
      // Si le graphique n'existe pas mais que le module est complété, l'initialiser
      this.initRadarChart();
    }
  }

  // Charger l'état sauvegardé précédemment
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('competences');

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
      'competences', // Correction: utilisé 'personnalite' avant
      'discovered_skills',
      discoveredIds
    );

    // Sauvegarder la catégorie sélectionnée
    if (this.selectedCategory) {
      this.userDataService.saveResponse(
        'competences', // Correction: utilisé 'personnalite' avant
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
  const discoveryThreshold = Math.ceil(this.skills.length * 0.5); // 50% des compétences

  if (
    this.getDiscoveredSkillsCount() >= discoveryThreshold &&
    !this.isModuleCompleted
  ) {
    // On complète le module, ce qui va aussi révéler toutes les compétences
    this.completeModule();
  }
}

// Marquer le module comme complété
completeModule(): void {
  // Marquer le module comme complété avant de révéler toutes les compétences
  this.progressService.completeModule('competences');
  this.isModuleCompleted = true;

  // Déverrouiller toutes les compétences non découvertes
  this.revealAllSkills();

  // Initialiser ou mettre à jour le graphique radar
  setTimeout(() => {
    this.initRadarChart();
  }, 0);

  // Ajouter une note automatique pour résumer ce qui a été fait
  this.addCompletionNote();

  this.alertService.success(
    `Module Compétences complété ! Toutes les compétences sont maintenant déverrouillées. 
    Cliquez maintenant sur le bouton "Continuer" au fond de la page pour faire le mini jeu et passer au module suivant.`,
    'Module terminé',
    true,
    20000
  );
}

// Révéler toutes les compétences non encore découvertes
revealAllSkills(): void {
  const updatedSkills = this.skills.map(skill => ({
    ...skill,
    discovered: true // Marquer toutes les compétences comme découvertes
  }));
  
  this.skills = updatedSkills;

  // sans déclencher le check de complétion qui créerait une boucle infinie
  const discoveredIds = this.skills.map(skill => skill.id);

  this.userDataService.saveResponse(
    'competences',
    'discovered_skills',
    discoveredIds
  );
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

    // Sauvegarder la sélection avec le bon module name
    this.userDataService.saveResponse(
      'competences',
      'selected_category',
      categoryId
    );

    // Animation pour le changement de catégorie
    const container = document.querySelector('.skill-visualization');
    if (container) {
      container.classList.add('category-change');

      // Nettoyer tout timeout précédent
      if (this.categoryChangeTimeoutId !== null) {
        window.clearTimeout(this.categoryChangeTimeoutId);
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
    const categorySkills = this.getSkillsByCategory(this.selectedCategory);
    this.scannedSkillIndex = categorySkills.findIndex((s) => s.id === skillToDiscover.id);

    // Animation de scan avec un intervalle géré
    this.scanIntervalId = window.setInterval(() => {
      this.scanProgress += 2;

      if (this.scanProgress >= 100) {
        // Nettoyer l'intervalle
        if (this.scanIntervalId !== null) {
          window.clearInterval(this.scanIntervalId);
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
          
          // Mettre à jour le radar chart si le module est complété
          if (this.isModuleCompleted) {
            this.updateRadarChart();
          }
        }, 500);
      }
    }, 50);
  }

  // Nettoyer les ressources du scan
  private clearScanResources(): void {
    // Nettoyer l'intervalle de scan
    if (this.scanIntervalId !== null) {
      window.clearInterval(this.scanIntervalId);
      this.scanIntervalId = null;
    }

    // Nettoyer le timeout de complétion du scan
    if (this.scanCompletionTimeoutId !== null) {
      window.clearTimeout(this.scanCompletionTimeoutId);
      this.scanCompletionTimeoutId = null;
    }
  }

  // Révéler une compétence spécifique
  revealSkill(skillId: string): void {
    const skillIndex = this.skills.findIndex((s) => s.id === skillId);
    if (skillIndex >= 0 && !this.skills[skillIndex].discovered) {
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
    return parseFloat((sum / discoveredSkills.length).toFixed(1));
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

  // Méthode pour ouvrir le modal du quiz
  openQuizModal(): void {
    if (this.redirectInProgress) return;

    // Générer les questions du quiz
    this.generateQuizQuestions();

    // Réinitialiser les états du quiz
    this.quizCompleted = false;
    this.quizPassed = false;
    this.quizScore = 0;
    this.selectedQuizQuestion = 0;
    this.userAnswers = new Array(this.quizQuestions.length).fill('');

    // Ouvrir la modal
    this.isQuizModalOpen = true;
  }

  // Générer les questions du quiz à partir des compétences découvertes
  generateQuizQuestions(): void {
    // Récupérer toutes les compétences découvertes
    const discoveredSkills = this.skills.filter((skill) => skill.discovered);
    
    // Vérifier qu'il y a assez de compétences découvertes
    if (discoveredSkills.length < 5) {
      console.warn("Pas assez de compétences découvertes pour le quiz");
      // Créer quelques questions de base si nécessaire
      this.quizQuestions = this.skills
        .filter(skill => skill.discovered)
        .slice(0, Math.min(5, discoveredSkills.length))
        .map(skill => ({
          skill: skill.name,
          category: skill.category,
          correctCategory: this.getCategoryName(skill.category)
        }));
      return;
    }

    // Mélanger les compétences et prendre les 10 premières (ou moins si pas assez)
    this.shuffleArray(discoveredSkills);
    const selectedSkills = discoveredSkills.slice(
      0,
      Math.min(10, discoveredSkills.length)
    );

    // Créer les questions
    this.quizQuestions = selectedSkills.map((skill) => ({
      skill: skill.name,
      category: skill.category,
      correctCategory: this.getCategoryName(skill.category)
    }));
  }

  // Mélanger un tableau (algorithme de Fisher-Yates)
  shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Répondre à une question du quiz
  answerQuestion(categoryId: string): void {
    if (this.selectedQuizQuestion >= this.quizQuestions.length) return;

    // Sauvegarder la réponse
    this.userAnswers[this.selectedQuizQuestion] = categoryId;

    // Passer à la question suivante ou terminer le quiz
    if (this.selectedQuizQuestion < this.quizQuestions.length - 1) {
      this.selectedQuizQuestion++;
    } else {
      this.completeQuiz();
    }
  }

// Terminer le quiz et calculer le score
completeQuiz(): void {
  let correctAnswers = 0;

  // Compter les réponses correctes
  for (let i = 0; i < this.quizQuestions.length; i++) {
    if (this.userAnswers[i] === this.quizQuestions[i].category) {
      correctAnswers++;
    }
  }

  // Calculer le score en pourcentage
  this.quizScore = Math.round(
    (correctAnswers / this.quizQuestions.length) * 100
  );

  // Déterminer si le quiz est réussi (>= 80%)
  this.quizPassed = this.quizScore >= 80;

  // Marquer le quiz comme terminé
  this.quizCompleted = true;

  // Si le quiz est réussi, marquer le module comme complété si ce n'est pas déjà fait
  // completeModule() va aussi déverrouiller toutes les compétences
  if (this.quizPassed && !this.isModuleCompleted) {
    this.completeModule();
  }
}

  // Méthode pour fermer le modal du quiz
  closeQuizModal(): void {
    this.isQuizModalOpen = false;
  }

  // Méthode pour naviguer vers le module suivant
  navigateToNextModule(): void {
    if (this.redirectInProgress) return;

    this.redirectInProgress = true;
    this.closeQuizModal();

    // Rediriger vers le module suivant
    setTimeout(() => {
      this.router.navigate(['/attentes']);
      this.redirectInProgress = false;
    }, 500);
  }
}