import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { ModuleStatus, ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string = "Bienvenue, agent. Vous êtes maintenant connecté au système central d'investigation. Cette enquête vise à établir un profil complet du sujet à travers différents modules d'analyse. Parcourez chaque section pour collecter les données nécessaires et débloquer le rapport final. Votre perspicacité sera essentielle pour formuler des conclusions pertinentes.";
  private subscriptions: Subscription[] = [];

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // Ordre des modules pour déterminer la progression
  moduleOrder = [
    'home',           // Toujours débloqué par défaut
    'itineraire',      // Se débloque après intro
    'experience',     // Se débloque après itinéraire
    'attentes',       // Se débloque après expérience pro
    'personnalite',   // Se débloque après attentes
    'centres',        // Se débloque après personnalité
    'motivations',    // Se débloque après centres d'intérêt
    'conclusion'      // Se débloque quand tout est complété
  ];

  // État des modules - maintenant récupéré depuis ProgressService
  moduleStatuses: ModuleStatus = {
    home: true, // L'intro est considérée comme complétée par défaut
    itineraire: false,
    experience: false,
    attentes: false,
    personnalite: false,
    competences: false,
    centres: false,
    motivations: false,
    conclusion: false
  };

  // Statistiques
  completionPercentage: number = 0;
  timeSpent: string = "00:00:00";
  modulesCompleted: number = 0;
  totalModules: number = 7; // Nombre total de modules (sans compter home)



  constructor(
    private router: Router,
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private dialogService: DialogService,
  ) {}

  ngOnInit() {
    // S'abonner aux statuts des modules
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe(statuses => {
        this.moduleStatuses = statuses;
        // Calculer les statistiques basées sur les statuts
        this.calculateStatistics();
      })
    );

    // S'abonner au temps écoulé
    this.subscriptions.push(
      this.timeTrackerService.elapsedTime$.subscribe(time => {
        this.timeSpent = time;
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

  // Obtenir l'index d'un module (pour l'affichage)
  getModuleIndex(moduleName: string): number {
    return this.moduleOrder.indexOf(moduleName) + 1;
  }

  // Vérifier si un module est disponible pour être activé
  isModuleAvailable(moduleName: string): boolean {
    return this.progressService.isModuleAvailable(moduleName as keyof ModuleStatus);
  }

  // Navigation vers les différentes sections
  navigateTo(route: string, moduleName: keyof ModuleStatus): void {
    // Vérifier si le module est disponible
    if (!this.isModuleAvailable(moduleName)) {
      console.log(`Le module ${moduleName} n'est pas encore disponible. Complétez les modules précédents.`);
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
    this.modulesCompleted = Object.entries(this.moduleStatuses)
      .filter(([key, value]) => key !== 'home' && key !== 'conclusion' && value)
      .length;
    
    // Calculer le pourcentage de complétion
    this.completionPercentage = this.progressService.getCompletionPercentage();
  }


}