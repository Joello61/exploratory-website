import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Note } from '../models/others/note';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly STORAGE_KEY = 'enquete_notes';
  private isNotesVisibleSubject = new BehaviorSubject<boolean>(false);
  private notesSubject = new BehaviorSubject<Note[]>([]);

  public isNotesVisible$: Observable<boolean> =
    this.isNotesVisibleSubject.asObservable();
  public notes$: Observable<Note[]> = this.notesSubject.asObservable();

  constructor() {
    this.loadNotes();
  }

  /**
   * Charge les notes depuis le localStorage
   */
  private loadNotes(): void {
    try {
      const savedNotes = localStorage.getItem(this.STORAGE_KEY);
      if (savedNotes) {
        this.notesSubject.next(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    }
  }

  /**
   * Sauvegarde les notes dans le localStorage
   */
  private saveNotes(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.notesSubject.value)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
    }
  }

  /**
   * Affiche/masque le panneau de notes
   */
  toggleNotesVisibility(): void {
    this.isNotesVisibleSubject.next(!this.isNotesVisibleSubject.value);
  }

  /**
   * Ajoute une nouvelle note
   */
  addNote(content: string): void {
    const newNote: Note = {
      id: this.generateId(),
      content,
      timestamp: Date.now(),
    };

    const currentNotes = [...this.notesSubject.value, newNote];
    this.notesSubject.next(currentNotes);
    this.saveNotes();
  }

  /**
   * Met à jour une note existante
   */
  updateNote(id: string, content: string): void {
    const currentNotes = [...this.notesSubject.value];
    const noteIndex = currentNotes.findIndex((note) => note.id === id);

    if (noteIndex >= 0) {
      currentNotes[noteIndex] = {
        ...currentNotes[noteIndex],
        content,
        timestamp: Date.now(),
      };

      this.notesSubject.next(currentNotes);
      this.saveNotes();
    }
  }

  /**
   * Supprime une note
   */
  deleteNote(id: string): void {
    const currentNotes = this.notesSubject.value.filter(
      (note) => note.id !== id
    );
    this.notesSubject.next(currentNotes);
    this.saveNotes();
  }

  /**
   * Génère un ID unique pour une note
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
