import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from '../../services/dialog.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { DialogMessage } from '../../models/others/dialod-message';
import { ModuleStatus } from '../../models/others/modul-status';

@Component({
    selector: 'app-menu',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Pour gérer la destruction du composant
  private destroy$ = new Subject<void>();

  // Gérer les timeouts
  private introTimeoutId: number | null = null;
  private closeDialogTimeoutId: number | null = null;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Bienvenue, agent. Vous êtes maintenant connecté au système central d'investigation. Cette enquête vise à établir un profil complet du sujet à travers différents modules d'analyse. Parcourez chaque section pour collecter les données nécessaires et débloquer le rapport final. Votre perspicacité sera essentielle pour formuler des conclusions pertinentes.";

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Ordre des modules pour déterminer la progression
  moduleOrder = [
    'home', // Toujours débloqué par défaut
    'itineraire', // Se débloque après intro
    'experience', // Se débloque après itinéraire
    'competences', // Se débloque après expérience
    'attentes', // Se débloque après compétences
    'personnalite', // Se débloque après attentes
    'centres', // Se débloque après personnalité
    'motivations', // Se débloque après centres d'intérêt
    'conclusion', // Se débloque quand tout est complété
  ];

  // État des modules - maintenant récupéré depuis ProgressService
  moduleStatuses: ModuleStatus = {
    home: true, // L'intro est considérée comme complétée par défaut
    itineraire: false,
    experience: false,
    competences: false,
    attentes: false,
    personnalite: false,
    centres: false,
    //motivations: false,
    conclusion: false,
  };

  // Statistiques
  completionPercentage: number = 0;
  timeSpent: string = '00:00:00';
  modulesCompleted: number = 0;
  totalModules: number = 6; // Nombre total de modules (sans compter home, motivation et conclusion)

  constructor(
    private router: Router,
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    // S'abonner aux statuts des modules avec takeUntil
    this.progressService.moduleStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statuses) => {
        this.moduleStatuses = statuses;
        // Calculer les statistiques basées sur les statuts
        this.calculateStatistics();
      });

    // S'abonner au temps écoulé
    this.timeTrackerService.elapsedTime$
      .pipe(takeUntil(this.destroy$))
      .subscribe((time) => {
        this.timeSpent = time;
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
    // Utiliser le DialogService au lieu du typewriter manuel
    this.introTimeoutId = window.setTimeout(() => {
      this.showIntroDialog();
      this.introTimeoutId = null;
    }, 500);
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Nettoyer les timeouts
    if (this.introTimeoutId !== null) {
      clearTimeout(this.introTimeoutId);
    }

    if (this.closeDialogTimeoutId !== null) {
      clearTimeout(this.closeDialogTimeoutId);
    }

    // Fermer le dialogue s'il est ouvert
    if (this.isDialogOpen) {
      this.dialogService.closeDialog();
    }
  }

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: '', // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective',
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText, () => {
      this.closeDialogTimeoutId = window.setTimeout(() => {
        this.dialogService.closeDialog();
        this.closeDialogTimeoutId = null;
      }, 3000);
    });
  }

  // Fermer le dialogue
  closeDialogTypeWriter(): void {
    this.dialogService.closeDialog();

    // Si un timeout de fermeture est en cours, le nettoyer
    if (this.closeDialogTimeoutId !== null) {
      clearTimeout(this.closeDialogTimeoutId);
      this.closeDialogTimeoutId = null;
    }
  }

  // Obtenir l'index d'un module (pour l'affichage)
  getModuleIndex(moduleName: string): number {
    return this.moduleOrder.indexOf(moduleName) + 1;
  }

  // Vérifier si un module est disponible pour être activé
  isModuleAvailable(moduleName: string): boolean {
    return this.progressService.isModuleAvailable(
      moduleName as keyof ModuleStatus
    );
  }

  // Navigation vers les différentes sections
  navigateTo(route: string, moduleName: keyof ModuleStatus): void {
    // Vérifier si le module est disponible
    if (!this.isModuleAvailable(moduleName)) {
      console.log(
        `Le module ${moduleName} n'est pas encore disponible. Complétez les modules précédents.`
      );
      return;
    }

    // Navigation vers la route
    this.router.navigate([route]);
  }

  // Obtenir les classes CSS pour un module
  getModuleClasses(moduleName: string): string {
    let classes = '';

    // Si le module est complété
    if (this.moduleStatuses[moduleName as keyof ModuleStatus]) {
      classes += 'completed ';
    }

    // Si le module n'est pas disponible (verrouillé)
    if (!this.isModuleAvailable(moduleName as keyof ModuleStatus)) {
      classes += 'locked ';
    }

    return classes.trim();
  }

  // Vérifier si tous les modules sont complétés (sauf conclusion)
  allModulesCompleted(): boolean {
    return this.progressService.allModulesCompleted();
  }

  // Calculer les statistiques en fonction de l'état des modules
  calculateStatistics(): void {
    // Compter les modules complétés (sauf home et conclusion)
    this.modulesCompleted = Object.entries(this.moduleStatuses).filter(
      ([key, value]) => key !== 'home' && key !== 'conclusion' && value
    ).length;

    // Calculer le pourcentage de complétion
    this.completionPercentage = this.progressService.getCompletionPercentage();
  }
}
