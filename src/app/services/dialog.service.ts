import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DialogMessage } from '../models/others/dialod-message';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private isDialogOpenSubject = new BehaviorSubject<boolean>(false);
  private currentMessageSubject = new BehaviorSubject<DialogMessage | null>(
    null
  );
  private isTypingSubject = new BehaviorSubject<boolean>(false);

  public isDialogOpen$: Observable<boolean> =
    this.isDialogOpenSubject.asObservable();
  public currentMessage$: Observable<DialogMessage | null> =
    this.currentMessageSubject.asObservable();
  public isTyping$: Observable<boolean> = this.isTypingSubject.asObservable();

  // Vitesse de l'effet machine à écrire
  private typingSpeed: number = 50;
  private typewriterTimeouts: number[] = [];

  constructor() {}

  /**
   * Ouvre un dialogue avec un message
   */
  openDialog(message: DialogMessage): void {
    this.currentMessageSubject.next(message);
    this.isDialogOpenSubject.next(true);
  }

  /**
   * Ferme le dialogue et nettoie les timeouts
   */
  closeDialog(): void {
    this.isDialogOpenSubject.next(false);

    // Nettoyer tous les timeouts en cours
    this.clearTypewriterTimeouts();

    setTimeout(() => {
      this.currentMessageSubject.next(null);
      this.isTypingSubject.next(false);
    }, 300); // Petit délai pour l'animation de fermeture
  }

  /**
   * Nettoie les timeouts de l'effet machine à écrire
   */
  private clearTypewriterTimeouts(): void {
    this.typewriterTimeouts.forEach((timeoutId) =>
      window.clearTimeout(timeoutId)
    );
    this.typewriterTimeouts = [];
  }

  /**
   * Démarre l'effet machine à écrire
   */
  startTypewriter(text: string, callback?: () => void): void {
    // Nettoyer les timeouts précédents
    this.clearTypewriterTimeouts();

    let currentIndex = 0;
    const fullText = text;

    this.isTypingSubject.next(true);

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        const char = fullText.charAt(currentIndex);
        const isPunctuation = ['.', ',', '!', '?', ':'].includes(char);

        // Mettre à jour le message avec le texte partiellement tapé
        const currentMessage = this.currentMessageSubject.value;
        if (currentMessage) {
          this.currentMessageSubject.next({
            ...currentMessage,
            text: fullText.substring(0, currentIndex + 1),
          });
        }

        currentIndex++;

        // Pause plus longue après la ponctuation
        const delay = isPunctuation
          ? this.typingSpeed * 3
          : this.typingSpeed + Math.random() * 40 - 20;

        // Stocker l'ID du timeout pour pouvoir le nettoyer si nécessaire
        const timeoutId = window.setTimeout(typeNextChar, delay);
        this.typewriterTimeouts.push(timeoutId);
      } else {
        this.isTypingSubject.next(false);
        this.typewriterTimeouts = []; // Réinitialiser la liste des timeouts
        if (callback) callback();
      }
    };

    // Initialiser avec une chaîne vide
    const currentMessage = this.currentMessageSubject.value;
    if (currentMessage) {
      this.currentMessageSubject.next({
        ...currentMessage,
        text: '',
      });
    }

    // Commencer l'effet
    const initialTimeoutId = window.setTimeout(typeNextChar, 100);
    this.typewriterTimeouts.push(initialTimeoutId);
  }

  /**
   * Définit la vitesse de frappe pour l'effet machine à écrire
   */
  setTypingSpeed(speed: number): void {
    this.typingSpeed = speed;
  }
}
