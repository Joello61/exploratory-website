import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

// Import des services
import { SoundService } from './services/sound.service';
import { ProgressService } from './services/progress.service';
import { TimeTrackerService } from './services/time-tracker.service';
import { AppStateService } from './services/app-state.service';
import { NoteService } from './services/note.service';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ModuleStatus } from './models/others/modul-status';
import { Note } from './models/others/note';

@Component({
    selector: 'app-root',
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
  notes: Array<Note> = [];

  // Date actuelle pour les notes
  currentDate: Date = new Date();

  // Pour gérer la destruction proprement
  private destroy$ = new Subject<void>();

  // Stockage des gestionnaires d'événements DOM pour nettoyage
  private enableSoundButtonHandler: (() => void) | null = null;
  private closeSoundModalButtonHandler: (() => void) | null = null;

  // Stockage des timeouts
  private soundTimeoutId: number | null = null;

  constructor(
    public soundService: SoundService,
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
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuth) => {
        this.isAuthenticated = isAuth;

        // Vérifier l'authentification après réception de la valeur
        if (!isAuth) {
          this.router.navigate(['/']);
        }
      });

    // Vérifier et gérer le son - uniquement si la modale n'a pas déjà été affichée
    if (
      !this.soundService.isSoundEnabled &&
      !this.appStateService.wasSoundModalShown()
    ) {
      const modal = document.getElementById('sound-modal');
      if (modal) {
        modal.classList.add('show');

        // Bouton pour activer le son
        const enableSoundButton = document.getElementById('enable-sound-btn');
        if (enableSoundButton) {
          this.enableSoundButtonHandler = () => {
            // Activer le son dans le service
            this.soundService.toggleSound();

            // Nettoyer tout timeout existant avant d'en créer un nouveau
            if (this.soundTimeoutId !== null) {
              clearTimeout(this.soundTimeoutId);
            }

            // Jouer la musique après un petit délai
            this.soundTimeoutId = window.setTimeout(() => {
              this.soundService.playBackgroundMusic(0.3);
              this.soundTimeoutId = null;
            }, 100);

            // Fermer la modale
            modal.classList.remove('show');

            // Marquer la modale comme affichée
            this.appStateService.markSoundModalShown();
          };

          enableSoundButton.addEventListener(
            'click',
            this.enableSoundButtonHandler
          );
        }

        // Ajouter un gestionnaire pour le bouton de fermeture (s'il existe)
        const closeButton = document.getElementById('close-sound-modal-btn');
        if (closeButton) {
          this.closeSoundModalButtonHandler = () => {
            modal.classList.remove('show');
            this.appStateService.markSoundModalShown();
          };

          closeButton.addEventListener(
            'click',
            this.closeSoundModalButtonHandler
          );
        }
      }
    } else {
      // Si le son est déjà activé, jouer la musique
      if (this.soundService.isSoundEnabled) {
        this.soundService.playBackgroundMusic(0.3);
      }

      // Marquer la modale comme vue si ce n'est pas encore fait
      if (!this.appStateService.wasSoundModalShown()) {
        this.appStateService.markSoundModalShown();
      }
    }

    // S'abonner aux notes
    this.noteService.notes$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (notes) => {
        this.notes = notes as Array<Note>;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des notes:', err);
      },
    });

    // S'abonner à la visibilité des notes
    this.noteService.isNotesVisible$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (visible) => {
        this.showNotes = visible;
      },
      error: (err) => {
        console.error(
          'Erreur lors de la récupération de la visibilité des notes:',
          err
        );
      },
    });

    // S'abonner aux statuts des modules
    this.progressService.moduleStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statuses) => {
          this.moduleStatuses = statuses;
          this.completionPercentage =
            this.progressService.getCompletionPercentage();
        },
        error: (err) => {
          console.error(
            'Erreur lors de la récupération des statuts des modules:',
            err
          );
        },
      });

    // S'abonner au temps écoulé
    this.timeTracker.elapsedTime$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (time) => {
        this.elapsedTime = time;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du temps écoulé:', err);
      },
    });

    // S'abonner à l'état de première visite
    this.appStateService.isFirstVisit$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isFirst) => {
          this.isFirstVisit = isFirst;

          // Si c'est la première visite, montrer peut-être un dialogue d'introduction?
          if (isFirst) {
            // Logique pour première visite
          }
        },
        error: (err) => {
          console.error(
            'Erreur lors de la vérification de la première visite:',
            err
          );
        },
      });
  }

  ngOnDestroy(): void {
    // Émettre le signal de destruction pour tous les observables
    this.destroy$.next();
    this.destroy$.complete();

    // Nettoyer les animations
    if (this.requestAnimationId !== null) {
      cancelAnimationFrame(this.requestAnimationId);
      this.requestAnimationId = null;
    }

    // Nettoyer les écouteurs d'événements
    document.removeEventListener('mousemove', this.handleMouseMove);

    // Nettoyer les écouteurs de la modale son
    if (this.enableSoundButtonHandler) {
      const enableSoundButton = document.getElementById('enable-sound-btn');
      if (enableSoundButton) {
        enableSoundButton.removeEventListener(
          'click',
          this.enableSoundButtonHandler
        );
      }
      this.enableSoundButtonHandler = null;
    }

    if (this.closeSoundModalButtonHandler) {
      const closeButton = document.getElementById('close-sound-modal-btn');
      if (closeButton) {
        closeButton.removeEventListener(
          'click',
          this.closeSoundModalButtonHandler
        );
      }
      this.closeSoundModalButtonHandler = null;
    }

    // Nettoyer les timeouts
    if (this.soundTimeoutId !== null) {
      clearTimeout(this.soundTimeoutId);
      this.soundTimeoutId = null;
    }

    // Arrêter la musique
    if (this.soundService) {
      this.soundService.pauseBackgroundMusic();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onReload(): void {
    this.soundService.onReload();
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
  };

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
        bgAnimation.style.transform = `translate(${moveX * 20}px, ${
          moveY * 20
        }px)`;
      }

      this.requestAnimationId = requestAnimationFrame(animate);
    };

    this.requestAnimationId = requestAnimationFrame(animate);
  }

  // Réinitialiser l'application (avec confirmation)
  resetApplication(): void {
    if (
      confirm(
        'Êtes-vous sûr de vouloir réinitialiser toute votre progression? Cette action est irréversible.'
      )
    ) {
      this.appStateService.resetApplication();
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

    // Nettoyer les ressources
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
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
          alert("Erreur lors de l'importation des données. Format incorrect.");
        }
      } catch (error) {
        console.error("Erreur lors de l'importation:", error);
        alert("Erreur lors de l'importation des données.");
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
    // Vérifier que l'ID existe et qu'il correspond à une note
    if (id && this.notes.some((note) => note.id === id)) {
      this.noteService.deleteNote(id);
    } else {
      console.warn(
        "Tentative de suppression d'une note avec un ID invalide:",
        id
      );
    }
  }

  toggleSound(): void {
    this.soundService.toggleSound();

    // Si on active le son et qu'il n'y a pas de musique en cours, la démarrer
    if (
      this.soundService.isSoundEnabled &&
      !this.soundService.hasMusicLoaded()
    ) {
      this.soundService.playBackgroundMusic(0.3);
    }
  }
}
