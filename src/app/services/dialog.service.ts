import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DialogMessage {
  text: string;
  character?: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private isDialogOpenSubject = new BehaviorSubject<boolean>(false);
  private currentMessageSubject = new BehaviorSubject<DialogMessage | null>(null);
  private isTypingSubject = new BehaviorSubject<boolean>(false);
  
  public isDialogOpen$: Observable<boolean> = this.isDialogOpenSubject.asObservable();
  public currentMessage$: Observable<DialogMessage | null> = this.currentMessageSubject.asObservable();
  public isTyping$: Observable<boolean> = this.isTypingSubject.asObservable();

  // Vitesse de l'effet machine à écrire
  private typingSpeed: number = 50;
  
  constructor() {}

  /**
   * Ouvre un dialogue avec un message
   */
  openDialog(message: DialogMessage): void {
    this.currentMessageSubject.next(message);
    this.isDialogOpenSubject.next(true);
  }

  /**
   * Ferme le dialogue
   */
  closeDialog(): void {
    this.isDialogOpenSubject.next(false);
    setTimeout(() => {
      this.currentMessageSubject.next(null);
    }, 300); // Petit délai pour l'animation de fermeture
  }

  /**
   * Démarre l'effet machine à écrire
   */
  startTypewriter(text: string, callback?: () => void): void {
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
            text: fullText.substring(0, currentIndex + 1)
          });
        }
        
        currentIndex++;
        
        // Pause plus longue après la ponctuation
        const delay = isPunctuation 
          ? this.typingSpeed * 3 
          : this.typingSpeed + Math.random() * 40 - 20;
        
        setTimeout(typeNextChar, delay);
      } else {
        this.isTypingSubject.next(false);
        if (callback) callback();
      }
    };
    
    // Initialiser avec une chaîne vide
    const currentMessage = this.currentMessageSubject.value;
    if (currentMessage) {
      this.currentMessageSubject.next({
        ...currentMessage,
        text: ''
      });
    }
    
    // Commencer l'effet
    setTimeout(typeNextChar, 100);
  }

  /**
   * Définit la vitesse de frappe pour l'effet machine à écrire
   */
  setTypingSpeed(speed: number): void {
    this.typingSpeed = speed;
  }

}
