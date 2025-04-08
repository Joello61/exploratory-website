import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppStateService } from '../../services/app-state.service';
import { DialogService } from '../../services/dialog.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/auth.service';
import { DialogMessage } from '../../models/others/dialod-message';

@Component({
    selector: 'app-home',
    imports: [CommonModule, FormsModule],
    standalone: true,
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('terminalInput') terminalInput!: ElementRef;

  // Pour gérer la destruction du composant
  private destroy$ = new Subject<void>();

  // Gérer les timeouts
  private soundModalTimeoutId: number | null = null;
  private welcomeDialogTimeoutId: number | null = null;
  private dialogCloseTimeoutId: number | null = null;
  private navigationTimeoutId: number | null = null;

  // États d'affichage
  showAuthScreen: boolean = true;
  showMainContent: boolean = false;
  showSystemModal: boolean = false;
  isSoundEnabled: boolean = false;

  // État d'authentification
  agentId: string = '2475';
  accessCode: string = '123456789';

  get isAuthenticating(): boolean {
    return this.authService.isAuthenticating;
  }
  get isScanning(): boolean {
    return this.authService.isScanning;
  }
  get scannerText(): string {
    return this.authService.scannerText;
  }

  // Date actuelle pour les informations système
  currentDate: Date = new Date();

  // Données de progression et temps d'enquête
  elapsedTime: string = '00:00:00';
  moduleProgressPercentage: number = 0;
  isFirstVisit: boolean = true;

  constructor(
    private router: Router,
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private appStateService: AppStateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // S'abonner au temps écoulé avec takeUntil
    this.timeTrackerService.elapsedTime$
      .pipe(takeUntil(this.destroy$))
      .subscribe((time) => {
        this.elapsedTime = time;
      });

    // S'abonner au pourcentage de progression
    this.progressService.moduleStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statuses) => {
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();
      });

    // Vérifier si c'est la première visite
    this.appStateService.isFirstVisit$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isFirstVisit) => {
        this.isFirstVisit = isFirstVisit;
      });

    // S'abonner à l'état d'authentification
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuth) => {
        this.showAuthScreen = !isAuth;
        this.showMainContent = isAuth;
      });

    // S'abonner à l'ID de l'agent
    this.authService.agentId$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      if (id) {
        this.agentId = id;
      }
    });

    // Charger les données sauvegardées
    this.loadSavedState();
  }

  ngAfterViewInit(): void {
    // Demander l'activation du son si pas encore fait
    this.soundModalTimeoutId = window.setTimeout(() => {
      if (!this.isSoundEnabled) {
        const soundModal = document.getElementById('sound-modal');
        if (soundModal) {
          soundModal.style.display = 'flex';
        }
      }
      this.soundModalTimeoutId = null;
    }, 1000);

    // Afficher un dialogue de bienvenue si c'est la première visite
    if (this.isFirstVisit && this.showMainContent) {
      this.showWelcomeDialog();
    }
  }

  ngOnDestroy(): void {
    // Émettre le signal de destruction pour tous les observables
    this.destroy$.next();
    this.destroy$.complete();

    // Nettoyer tous les timeouts
    if (this.soundModalTimeoutId !== null) {
      clearTimeout(this.soundModalTimeoutId);
    }

    if (this.welcomeDialogTimeoutId !== null) {
      clearTimeout(this.welcomeDialogTimeoutId);
    }

    if (this.dialogCloseTimeoutId !== null) {
      clearTimeout(this.dialogCloseTimeoutId);
    }

    if (this.navigationTimeoutId !== null) {
      clearTimeout(this.navigationTimeoutId);
    }

    // Fermer tout dialogue ouvert
    this.dialogService.closeDialog();
  }

  // Charger l'état sauvegardé
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('home');

    if (responses.length > 0) {
      // Charger les paramètres sauvegardés
      const agentIdResponse = responses.find(
        (r) => r.questionId === 'agent_id'
      );
      if (agentIdResponse && typeof agentIdResponse.response === 'string') {
        this.agentId = agentIdResponse.response;
      }

      // Autres états si nécessaire
      const soundEnabledResponse = responses.find(
        (r) => r.questionId === 'sound_enabled'
      );
      if (
        soundEnabledResponse &&
        typeof soundEnabledResponse.response === 'boolean'
      ) {
        this.isSoundEnabled = soundEnabledResponse.response;
      }
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder l'ID de l'agent
    this.userDataService.saveResponse('home', 'agent_id', this.agentId);

    // Sauvegarder l'état du son
    this.userDataService.saveResponse(
      'home',
      'sound_enabled',
      this.isSoundEnabled
    );
  }

  // Afficher un dialogue de bienvenue
  showWelcomeDialog(): void {
    const welcomeMessage: DialogMessage = {
      text: "Bienvenue dans le système d'investigation Mystery-Link, Agent. Vous êtes autorisé à accéder aux dossiers confidentiels. Votre mission est de mener une enquête approfondie sur le profil qui vous a été assigné.",
      character: 'assistant',
      imageUrl: 'img/assistant.png',
    };

    this.dialogService.openDialog(welcomeMessage);

    // Effet de machine à écrire
    this.dialogService.startTypewriter(welcomeMessage.text, () => {
      // Fermer le dialogue après un délai
      this.dialogCloseTimeoutId = window.setTimeout(() => {
        this.dialogService.closeDialog();
        this.dialogCloseTimeoutId = null;
      }, 5000);
    });
  }

  // Processus d'authentification
  authenticate(): void {
    if (!this.agentId || !this.accessCode) {
      return;
    }

    this.authService
      .authenticate(this.agentId, this.accessCode)
      .then((success) => {
        if (success) {
          // Sauvegarder l'état
          this.saveState();

          // Marquer le module home comme complété
          this.progressService.completeModule('home');

          // Afficher le message de bienvenue si c'est la première visite
          if (this.isFirstVisit) {
            this.welcomeDialogTimeoutId = window.setTimeout(() => {
              this.showWelcomeDialog();
              this.welcomeDialogTimeoutId = null;
            }, 1000);
          }
        }
      })
      .catch((error) => {
        console.error("Erreur d'authentification:", error);
      });
  }

  // Démarrer l'investigation (redirection vers le menu)
  startInvestigation(): void {
    this.navigationTimeoutId = window.setTimeout(() => {
      this.router.navigate(['/menu']);
      this.navigationTimeoutId = null;
    }, 500);
  }

  // Réinitialiser tous les progrès
  resetProgress(): void {
    if (
      confirm(
        'Êtes-vous sûr de vouloir réinitialiser toute votre progression ? Cette action est irréversible.'
      )
    ) {
      this.appStateService.resetApplication();
      alert("Progression réinitialisée. L'application va redémarrer.");

      // Au lieu de recharger la page, naviguer vers la page d'accueil
      this.router.navigate(['/'], { replaceUrl: true });
    }
  }

  // Exporter les données de l'application
  exportData(): void {
    const appData = this.appStateService.exportAppData();

    // Créer un lien de téléchargement
    const blob = new Blob([appData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mystery-link-data.json';
    document.body.appendChild(a);
    a.click();

    // Nettoyer les ressources après utilisation
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  }

  // Importer des données
  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = this.appStateService.importAppData(jsonData);

        if (success) {
          alert("Données importées avec succès. L'application va redémarrer.");

          // Au lieu de recharger la page, naviguer vers la page d'accueil
          this.router.navigate(['/'], { replaceUrl: true });
        } else {
          alert("Erreur lors de l'importation des données.");
        }
      } catch (error) {
        console.error('Erreur de parsing JSON:', error);
        alert('Format de fichier invalide.');
      }
    };

    reader.readAsText(file);
  }

  // Ouvrir/fermer le modal système
  toggleSystemModal(): void {
    this.showSystemModal = !this.showSystemModal;
  }

  closeModal(): void {
    this.showSystemModal = false;
  }
}
