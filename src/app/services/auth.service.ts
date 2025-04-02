import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Clés de stockage localStorage
  private readonly AUTH_STATUS = 'isAuthenticated';
  private readonly AGENT_ID = 'agentId';

  // BehaviorSubjects pour la réactivité
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
  
  private agentIdSubject = new BehaviorSubject<string>('');
  public agentId$: Observable<string> = this.agentIdSubject.asObservable();

  // Propriétés pour la visualisation de l'authentification
  public isAuthenticating: boolean = false;
  public isScanning: boolean = false;
  public scannerText: string = 'En attente d\'authentification...';

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  /**
   * Vérifie le statut d'authentification au démarrage
   */
  private checkAuthStatus(): void {
    const authStatus = localStorage.getItem(this.AUTH_STATUS);
    const agentId = localStorage.getItem(this.AGENT_ID);
    
    if (authStatus === 'true' && agentId) {
      this.isAuthenticatedSubject.next(true);
      this.agentIdSubject.next(agentId);
    } else {
      this.isAuthenticatedSubject.next(false);
      this.agentIdSubject.next('');
    }
  }

  /**
   * Authentifie l'utilisateur avec l'ID et le code d'accès
   */
  authenticate(agentId: string, accessCode: string): Promise<boolean> {
    this.isAuthenticating = true;
    this.isScanning = true;
    this.scannerText = 'Analyse des identifiants...';

    return new Promise((resolve) => {
      // Simuler le délai d'authentification
      setTimeout(() => {
        // Pour la démo, tout code est accepté si >= 4 caractères
        if (accessCode.length >= 4) {
          this.scannerText = 'Authentification réussie!';
          
          // Stocker les informations d'authentification
          localStorage.setItem(this.AUTH_STATUS, 'true');
          localStorage.setItem(this.AGENT_ID, agentId);
          
          // Mettre à jour les observables
          this.isAuthenticatedSubject.next(true);
          this.agentIdSubject.next(agentId);
          
          // Résoudre la promesse avec succès
          resolve(true);
        } else {
          this.scannerText = 'Erreur d\'authentification. Réessayez.';
          resolve(false);
        }

        // Réinitialiser les états d'authentification
        this.isAuthenticating = false;
        this.isScanning = false;
      }, 2000);
    });
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    localStorage.removeItem(this.AUTH_STATUS);
    localStorage.removeItem(this.AGENT_ID);
    
    this.isAuthenticatedSubject.next(false);
    this.agentIdSubject.next('');
    
    // Rediriger vers la page d'accueil
    this.router.navigate(['/']);
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Récupère l'ID de l'agent
   */
  getAgentId(): string {
    return this.agentIdSubject.value;
  }
}