import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

// Import des services
import { SoundService } from './services/sound.service';
import { ProgressService, ModuleStatus } from './services/progress.service';
import { TimeTrackerService } from './services/time-tracker.service';
import { AppStateService } from './services/app-state.service';
import { NoteService } from './services/note.service';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'exploratory-website';
  
  private mouseX: number = 0;
  private mouseY: number = 0;
  private requestAnimationId: number | null = null;
  
  // État des modules pour la navigation
  moduleStatuses: ModuleStatus | null = null;
  completionPercentage: number = 0;
  elapsedTime: string = '00:00:00';
  isFirstVisit: boolean = true;
  isAuthenticated: boolean = false;

    // État des notes
    showNotes: boolean = false;
    notes: Array<{ content: string, timestamp: number }> = [];
    
    // Date actuelle pour les notes
    currentDate: Date = new Date();
  
  // Subscriptions pour gérer la mémoire
  private subscriptions: Subscription[] = [];
  
  constructor(
    private soundService: SoundService,
    private progressService: ProgressService,
    private timeTracker: TimeTrackerService,
    private appStateService: AppStateService,
    private noteService: NoteService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Initialiser les effets visuels
    this.initMouseLightEffect();
    this.animateBackground();

    // S'abonner à l'état d'authentification
    this.subscriptions.push(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

    if (!this.isAuthenticated){
      this.router.navigate(['/']);
    }
    
    // Vérifier et gérer le son
    if (!this.soundService.authSound) {
      const modal = document.getElementById('sound-modal');
      if (modal) {
        modal.classList.add('show');
      }
  
      // Bouton pour activer le son
      const enableSoundButton = document.getElementById('enable-sound-btn');
      enableSoundButton?.addEventListener('click', () => {
        this.soundService.playBackgroundMusic(0.3);
        this.soundService.toggleSound();
        modal?.classList.remove('show'); // Fermer la modale
      });
    }

     // S'abonner aux notes
     this.subscriptions.push(
      this.noteService.notes$.subscribe(notes => {
        this.notes = notes;
      })
    );

    // S'abonner à la visibilité des notes
    this.subscriptions.push(
      this.noteService.isNotesVisible$.subscribe(visible => {
        this.showNotes = visible;
      })
    );

    
    // S'abonner aux services pour obtenir l'état de l'application
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe(statuses => {
        this.moduleStatuses = statuses;
        this.completionPercentage = this.progressService.getCompletionPercentage();
      }),
      
      this.timeTracker.elapsedTime$.subscribe(time => {
        this.elapsedTime = time;
      }),
      
      this.appStateService.isFirstVisit$.subscribe(isFirst => {
        this.isFirstVisit = isFirst;
        
        // Si c'est la première visite, montrer peut-être un dialogue d'introduction?
        if (isFirst) {
          // Logique pour première visite
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    // Nettoyer les animations et les souscriptions
    if (this.requestAnimationId !== null) {
      cancelAnimationFrame(this.requestAnimationId);
    }
    
    document.removeEventListener('mousemove', this.handleMouseMove);
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Vérifier si un module est disponible
  isModuleAvailable(moduleName: keyof ModuleStatus): boolean {
    if (!this.moduleStatuses) return false;
    return this.progressService.isModuleAvailable(moduleName);
  }
  
  // Méthode pour gérer le mouvement de la souris
  handleMouseMove = (e: MouseEvent) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    
    const lightEffect = document.querySelector('.light-effect') as HTMLElement;
    if (lightEffect) {
      lightEffect.style.setProperty('--x', `${e.clientX}px`);
      lightEffect.style.setProperty('--y', `${e.clientY}px`);
    }
  }
  
  // Initialiser l'effet de lumière suivant la souris
  initMouseLightEffect(): void {
    document.addEventListener('mousemove', this.handleMouseMove);
  }
  
  // Animer le fond en fonction de la position de la souris
  animateBackground(): void {
    const animate = () => {
      // Animer les éléments de fond en fonction de la position de la souris
      const moveX = this.mouseX / window.innerWidth - 0.5;
      const moveY = this.mouseY / window.innerHeight - 0.5;
      
      const bgAnimation = document.querySelector('.background-animation');
      if (bgAnimation instanceof HTMLElement) {
        bgAnimation.style.transform = `translate(${moveX * 20}px, ${moveY * 20}px)`;
      }
      
      this.requestAnimationId = requestAnimationFrame(animate);
    };
    
    this.requestAnimationId = requestAnimationFrame(animate);
  }
  
  // Réinitialiser l'application (avec confirmation)
  resetApplication(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toute votre progression? Cette action est irréversible.')) {
      this.appStateService.resetApplication();
      // Déconnecter l'utilisateur également
      this.authService.logout();
    }
  }
  
  // Exporter les données de l'application
  exportData(): void {
    const jsonData = this.appStateService.exportAppData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `enquete_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Permettre l'importation des données
  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const jsonStr = e.target?.result as string;
        const success = this.appStateService.importAppData(jsonStr);
        
        if (success) {
          alert('Données importées avec succès!');
        } else {
          alert('Erreur lors de l\'importation des données. Format incorrect.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
        alert('Erreur lors de l\'importation des données.');
      }
    };
    
    reader.readAsText(file);
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