import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  private readonly STORAGE_KEY = 'enquete_sound_enabled';
  private soundEnabledSubject = new BehaviorSubject<boolean>(false);
  
  public soundEnabled$: Observable<boolean> = this.soundEnabledSubject.asObservable();
  
  constructor() {
    this.loadSoundPreference();
  }

  /**
   * Charge la préférence de son depuis le localStorage
   */
  private loadSoundPreference(): void {
    try {
      const savedPreference = localStorage.getItem(this.STORAGE_KEY);
      if (savedPreference) {
        this.soundEnabledSubject.next(JSON.parse(savedPreference));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences de son:', error);
    }
  }

  /**
   * Sauvegarde la préférence de son dans le localStorage
   */
  private saveSoundPreference(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY, 
        JSON.stringify(this.soundEnabledSubject.value)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences de son:', error);
    }
  }

  /**
   * Active/désactive le son
   */
  toggleSound(): void {
    const newState = !this.soundEnabledSubject.value;
    this.soundEnabledSubject.next(newState);
    this.saveSoundPreference();
  }

  /**
   * Vérifie si le son est activé
   */
  get isSoundEnabled(): boolean {
    return this.soundEnabledSubject.value;
  }

  /**
   * Pour la compatibilité avec le code existant
   */
  get authSound(): boolean {
    return this.soundEnabledSubject.value;
  }

  /**
   * Joue un effet sonore
   * @param soundName Nom du fichier son à jouer
   * @param volume Volume (0-1)
   * @param loop Répéter en boucle
   */
  playSound(soundName: string, volume: number = 0.5, loop: boolean = false): HTMLAudioElement | null {
    if (!this.isSoundEnabled) return null;

    try {
      const audio = new Audio();
      audio.src = `audio/${soundName}`;
      audio.volume = Math.min(Math.max(volume, 0), 1); // Limiter entre 0 et 1
      audio.loop = loop;
      audio.load();
      audio.play();
      return audio;
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
      return null;
    }
  }

  /**
   * Joue la musique d'ambiance principale
   */
  playBackgroundMusic(volume: number = 0.3): HTMLAudioElement | null {
    return this.playSound('song.mp3', volume, true);
  }
}
