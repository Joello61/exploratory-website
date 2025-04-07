import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimeTrackerService {
  private readonly STORAGE_KEY = 'enquete_start_time';
  private elapsedSecondsSubject = new BehaviorSubject<number>(0);
  private timer: any;

  public elapsedTime$: Observable<string> = this.elapsedSecondsSubject.pipe(
    map((seconds) => this.formatTime(seconds))
  );

  constructor() {
    this.initializeTimer();
  }

  /**
   * Initialise le timer
   */
  private initializeTimer(): void {
    const startTime = localStorage.getItem(this.STORAGE_KEY);

    if (!startTime) {
      // Premier démarrage de l'application
      localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
      this.elapsedSecondsSubject.next(0);
    } else {
      // Calcul du temps écoulé depuis le premier démarrage
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      this.elapsedSecondsSubject.next(elapsed);
    }

    // Mise à jour du timer toutes les secondes
    this.timer = interval(1000).subscribe(() => {
      this.elapsedSecondsSubject.next(this.elapsedSecondsSubject.value + 1);
    });
  }

  /**
   * Formate le temps en heures:minutes:secondes
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  }

  /**
   * Récupère le temps écoulé en secondes
   */
  getElapsedSeconds(): number {
    return this.elapsedSecondsSubject.value;
  }

  /**
   * Réinitialise le timer
   */
  resetTimer(): void {
    localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
    this.elapsedSecondsSubject.next(0);
  }

  /**
   * Nettoie le timer lors de la destruction du service
   */
  ngOnDestroy(): void {
    if (this.timer) {
      this.timer.unsubscribe();
    }
  }
}
