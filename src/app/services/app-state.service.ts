import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProgressService } from './progress.service';
import { TimeTrackerService } from './time-tracker.service';
import { UserDataService } from './user-data.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private isFirstVisitSubject = new BehaviorSubject<boolean>(true);
  public isFirstVisit$: Observable<boolean> =
    this.isFirstVisitSubject.asObservable();

  // Nouvelle clé pour la modale de son
  private readonly SOUND_MODAL_KEY = 'enquete_sound_modal_shown';

  constructor(
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private userDataService: UserDataService,
    private authService: AuthService,
  ) {
    this.checkFirstVisit();
  }

  /**
   * Vérifie si c'est la première visite de l'utilisateur
   */
  private checkFirstVisit(): void {
    const visited = localStorage.getItem('enquete_first_visit');
    if (!visited) {
      this.isFirstVisitSubject.next(true);
      localStorage.setItem('enquete_first_visit', 'false');
    } else {
      this.isFirstVisitSubject.next(false);
    }
  }

  /**
   * Vérifie si la modale de son a déjà été affichée
   */
  public wasSoundModalShown(): boolean {
    return localStorage.getItem(this.SOUND_MODAL_KEY) === 'true';
  }

  /**
   * Marque la modale de son comme ayant été affichée
   */
  public markSoundModalShown(): void {
    localStorage.setItem(this.SOUND_MODAL_KEY, 'true');
  }

  /**
   * Réinitialise complètement l'application
   */
  resetApplication(): void {
    this.progressService.resetProgress();
    this.timeTrackerService.resetTimer();
    this.userDataService.resetAllResponses();

    // Réinitialiser l'authentification
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('agentId');

    localStorage.removeItem('enquete_first_visit');
    localStorage.removeItem(this.SOUND_MODAL_KEY);
    this.isFirstVisitSubject.next(true);
    localStorage.setItem('enquete_first_visit', 'false');

    this.authService.logout();
  }

  /**
   * Exporte toutes les données de l'application
   */
  exportAppData(): string {
    const appData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      progress: localStorage.getItem('enquete_module_statuses'),
      responses: localStorage.getItem('enquete_user_responses'),
      notes: localStorage.getItem('enquete_notes'),
      startTime: localStorage.getItem('enquete_start_time'),
      soundModalShown: localStorage.getItem(this.SOUND_MODAL_KEY),
    };

    return JSON.stringify(appData);
  }

  /**
   * Importe les données de l'application
   */
  importAppData(jsonData: string): boolean {
    try {
      const appData = JSON.parse(jsonData);

      if (appData.progress) {
        localStorage.setItem('enquete_module_statuses', appData.progress);
      }

      if (appData.responses) {
        localStorage.setItem('enquete_user_responses', appData.responses);
      }

      if (appData.notes) {
        localStorage.setItem('enquete_notes', appData.notes);
      }

      if (appData.startTime) {
        localStorage.setItem('enquete_start_time', appData.startTime);
      }

      if (appData.soundModalShown) {
        localStorage.setItem(this.SOUND_MODAL_KEY, appData.soundModalShown);
      }

      // Recharger tous les services
      this.refreshAllServices();

      return true;
    } catch (error) {
      console.error("Erreur lors de l'importation des données:", error);
      return false;
    }
  }

  /**
   * Rafraîchit tous les services pour qu'ils rechargent leurs données
   */
  private refreshAllServices(): void {
    window.location.reload();
  }
}
