import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppStateService } from '../../services/app-state.service';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('terminalInput') terminalInput!: ElementRef;

  private subscriptions: Subscription = new Subscription();

  // États d'affichage
  showAuthScreen: boolean = true;
  showMainContent: boolean = false;
  showSystemModal: boolean = false;
  isSoundEnabled: boolean = false;

  // État d'authentification
  agentId: string = '2475';
  accessCode: string = '123456789';

  get isAuthenticating(): boolean { return this.authService.isAuthenticating; }
  get isScanning(): boolean { return this.authService.isScanning; }
  get scannerText(): string { return this.authService.scannerText; }
  
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
    // S'abonner au temps écoulé
    this.subscriptions.add(
      this.timeTrackerService.elapsedTime$.subscribe(time => {
        this.elapsedTime = time;
      })
    );

    // S'abonner au pourcentage de progression
    this.subscriptions.add(
      this.progressService.moduleStatuses$.subscribe(statuses => {
        this.moduleProgressPercentage = this.progressService.getCompletionPercentage();
      })
    );

    // Vérifier si c'est la première visite
    this.subscriptions.add(
      this.appStateService.isFirstVisit$.subscribe(isFirstVisit => {
        this.isFirstVisit = isFirstVisit;
      })
    );
    
    this.subscriptions.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.showAuthScreen = !isAuth;
        this.showMainContent = isAuth;
      })
    );

    // S'abonner à l'ID de l'agent
    this.subscriptions.add(
      this.authService.agentId$.subscribe(id => {
        if (id) {
          this.agentId = id;
        }
      })
    );

    // Charger les données sauvegardées
    this.loadSavedState();
  }

  ngAfterViewInit(): void {
    // Demander l'activation du son si pas encore fait
    setTimeout(() => {
      if (!this.isSoundEnabled) {
        const soundModal = document.getElementById('sound-modal');
        if (soundModal) {
          soundModal.style.display = 'flex';
        }
      }
    }, 1000);

    // Afficher un dialogue de bienvenue si c'est la première visite
    if (this.isFirstVisit && this.showMainContent) {
      this.showWelcomeDialog();
    }
  }

  ngOnDestroy(): void {
    // Se désabonner de tous les observables
    this.subscriptions.unsubscribe();
  }

  // Charger l'état sauvegardé
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('home');
    
    if (responses.length > 0) {
      // Charger les paramètres sauvegardés
      const agentIdResponse = responses.find(r => r.questionId === 'agent_id');
      if (agentIdResponse && typeof agentIdResponse.response === 'string') {
        this.agentId = agentIdResponse.response;
      }

      // Autres états si nécessaire
      const soundEnabledResponse = responses.find(r => r.questionId === 'sound_enabled');
      if (soundEnabledResponse && typeof soundEnabledResponse.response === 'boolean') {
        this.isSoundEnabled = soundEnabledResponse.response;
      }
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder l'ID de l'agent
    this.userDataService.saveResponse('home', 'agent_id', this.agentId);
    
    // Sauvegarder l'état du son
    this.userDataService.saveResponse('home', 'sound_enabled', this.isSoundEnabled);
  }

  // Afficher un dialogue de bienvenue
  showWelcomeDialog(): void {
    const welcomeMessage: DialogMessage = {
      text: "Bienvenue dans le système d'investigation Mystery-Link, Agent. Vous êtes autorisé à accéder aux dossiers confidentiels. Votre mission est de mener une enquête approfondie sur le profil qui vous a été assigné.",
      character: 'assistant',
      imageUrl: 'img/assistant.png'
    };

    this.dialogService.openDialog(welcomeMessage);
    
    // Effet de machine à écrire
    this.dialogService.startTypewriter(welcomeMessage.text, () => {
      // Fermer le dialogue après un délai
      setTimeout(() => {
        this.dialogService.closeDialog();
      }, 5000);
    });
  }

  // Processus d'authentification

  authenticate(): void {
    if (!this.agentId || !this.accessCode) {
      // Le service gère déjà cette validation, mais on peut la garder ici
      return;
    }

    this.authService.authenticate(this.agentId, this.accessCode)
      .then(success => {
        if (success) {
          // Sauvegarder l'état
          this.saveState();
          
          // Marquer le module home comme complété
          this.progressService.completeModule('home');
          
          // Afficher le message de bienvenue si c'est la première visite
          if (this.isFirstVisit) {
            setTimeout(() => {
              this.showWelcomeDialog();
            }, 1000);
          }
        }
      });
  }

  // Démarrer l'investigation (redirection vers le menu)
  startInvestigation(): void {
    setTimeout(() => {
      this.router.navigate(['/menu']);
    }, 500);
  }

  // Réinitialiser tous les progrès
  resetProgress(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toute votre progression ? Cette action est irréversible.')) {
      this.appStateService.resetApplication();
      alert('Progression réinitialisée. L\'application va redémarrer.');
      window.location.reload();
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
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
          alert('Données importées avec succès. L\'application va redémarrer.');
          window.location.reload();
        } else {
          alert('Erreur lors de l\'importation des données.');
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