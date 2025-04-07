import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserResponse } from '../models/others/user-response';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly STORAGE_KEY = 'enquete_user_responses';
  private userResponsesSubject = new BehaviorSubject<UserResponse[]>([]);

  public userResponses$: Observable<UserResponse[]> =
    this.userResponsesSubject.asObservable();

  constructor() {
    this.loadUserResponses();
  }

  /**
   * Charge les réponses utilisateur depuis le localStorage
   */
  private loadUserResponses(): void {
    try {
      const savedResponses = localStorage.getItem(this.STORAGE_KEY);
      if (savedResponses) {
        this.userResponsesSubject.next(JSON.parse(savedResponses));
      }
    } catch (error) {
      console.error(
        'Erreur lors du chargement des réponses utilisateur:',
        error
      );
    }
  }

  /**
   * Sauvegarde les réponses utilisateur dans le localStorage
   */
  private saveUserResponses(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.userResponsesSubject.value)
      );
    } catch (error) {
      console.error(
        'Erreur lors de la sauvegarde des réponses utilisateur:',
        error
      );
    }
  }

  /**
   * Ajoute ou met à jour une réponse utilisateur
   */
  saveResponse(
    moduleId: string,
    questionId: string,
    response: string | string[] | number | boolean
  ): void {
    const currentResponses = [...this.userResponsesSubject.value];
    const existingIndex = currentResponses.findIndex(
      (r) => r.moduleId === moduleId && r.questionId === questionId
    );

    const newResponse: UserResponse = {
      moduleId,
      questionId,
      response,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      currentResponses[existingIndex] = newResponse;
    } else {
      currentResponses.push(newResponse);
    }

    this.userResponsesSubject.next(currentResponses);
    this.saveUserResponses();
  }

  /**
   * Récupère une réponse utilisateur spécifique
   */
  getResponse(moduleId: string, questionId: string): UserResponse | undefined {
    return this.userResponsesSubject.value.find(
      (r) => r.moduleId === moduleId && r.questionId === questionId
    );
  }

  /**
   * Récupère toutes les réponses d'un module
   */
  getModuleResponses(moduleId: string): UserResponse[] {
    return this.userResponsesSubject.value.filter(
      (r) => r.moduleId === moduleId
    );
  }

  /**
   * Réinitialise toutes les réponses utilisateur
   */
  resetAllResponses(): void {
    this.userResponsesSubject.next([]);
    this.saveUserResponses();
  }
}
