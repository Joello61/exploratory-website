import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
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
  private subscriptions: Subscription = new Subscription();

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;

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
    centres: false,
    motivations: false,
    conclusion: false
  };

  // Statistiques
  completionPercentage: number = 0;
  timeSpent: string = "00:00:00";
  modulesCompleted: number = 0;
  totalModules: number = 7; // Nombre total de modules (sans compter home)

  // État des notes
  showNotes: boolean = false;
  notes: Array<{ content: string, timestamp: number }> = [];
  
  // Date actuelle pour les notes
  currentDate: Date = new Date();

  constructor(
    private router: Router,
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private dialogService: DialogService,
    private noteService: NoteService
  ) {}

  ngOnInit() {
    // S'abonner aux statuts des modules
    this.subscriptions.add(
      this.progressService.moduleStatuses$.subscribe(statuses => {
        this.moduleStatuses = statuses;
        // Calculer les statistiques basées sur les statuts
        this.calculateStatistics();
      })
    );

    // S'abonner au temps écoulé
    this.subscriptions.add(
      this.timeTrackerService.elapsedTime$.subscribe(time => {
        this.timeSpent = time;
      })
    );

    // S'abonner aux notes
    this.subscriptions.add(
      this.noteService.notes$.subscribe(notes => {
        this.notes = notes;
      })
    );

    // S'abonner à la visibilité des notes
    this.subscriptions.add(
      this.noteService.isNotesVisible$.subscribe(visible => {
        this.showNotes = visible;
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
    // Se désabonner de tous les observables pour éviter les fuites mémoire
    this.subscriptions.unsubscribe();
  }

  showIntroDialog(): void {
    const message: DialogMessage = {
      text: this.fullText,
      character: 'detective',
      imageUrl: '/img/detective.png'
    };

    this.dialogService.openDialog(message);
    
    // Démarrer l'effet de typewriter
    this.dialogService.startTypewriter(this.fullText, () => {
      // Callback une fois le typing terminé
      setTimeout(() => {
        this.dialogService.closeDialog();
        this.isDialogOpen = false;
      }, 5000);
    });

    // S'abonner au statut du typing
    this.subscriptions.add(
      this.dialogService.isTyping$.subscribe(isTyping => {
        this.isTyping = isTyping;
      })
    );
  }

  closeDialogTypeWriter(): void {
    this.dialogService.closeDialog();
    this.isDialogOpen = false;
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

  // Afficher/masquer les notes
  toggleNotes(): void {
    this.noteService.toggleNotesVisibility();
  }

  // Ajouter une note (pour le bouton d'ajout)
  addNote(content: string): void {
    this.noteService.addNote(content);
  }

  // Supprimer une note
  deleteNote(id: string): void {
    this.noteService.deleteNote(id);
  }
}