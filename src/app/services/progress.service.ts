import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModuleStatus {
  home: boolean;
  itineraire: boolean;
  experience: boolean;
  attentes: boolean;
  personnalite: boolean;
  centres: boolean;
  motivations: boolean;
  conclusion: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  private readonly STORAGE_KEY = 'enquete_module_statuses';
  private readonly moduleOrder = [
    'home',
    'itineraire',
    'experience',
    'attentes',
    'personnalite',
    'centres',
    'motivations',
    'conclusion'
  ];
  
  private moduleStatusesSubject = new BehaviorSubject<ModuleStatus>({
    home: true, // L'intro est considérée comme complétée par défaut
    itineraire: false,
    experience: false,
    attentes: false,
    personnalite: false,
    centres: false,
    motivations: false,
    conclusion: false
  });

  public moduleStatuses$: Observable<ModuleStatus> = this.moduleStatusesSubject.asObservable();
  
  constructor() {
    this.loadModuleStatus();
  }

  /**
   * Charge les statuts des modules depuis le localStorage
   */
  private loadModuleStatus(): void {
    try {
      const savedStatus = localStorage.getItem(this.STORAGE_KEY);
      if (savedStatus) {
        this.moduleStatusesSubject.next(JSON.parse(savedStatus));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statuts de module:', error);
    }
  }

  /**
   * Sauvegarde les statuts des modules dans le localStorage
   */
  private saveModuleStatus(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY, 
        JSON.stringify(this.moduleStatusesSubject.value)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statuts de module:', error);
    }
  }

  /**
   * Marque un module comme complété
   */
  completeModule(moduleName: keyof ModuleStatus): void {
    const currentStatuses = { ...this.moduleStatusesSubject.value };
    currentStatuses[moduleName] = true;
    this.moduleStatusesSubject.next(currentStatuses);
    this.saveModuleStatus();
  }

  /**
   * Vérifie si un module est disponible
   */
  isModuleAvailable(moduleName: keyof ModuleStatus): boolean {
    // L'accueil est toujours disponible
    if (moduleName === 'home') return true;
    
    // Pour la conclusion, tous les modules doivent être complétés
    if (moduleName === 'conclusion') return this.allModulesCompleted();
    
    // Pour les autres modules, vérifier que le module précédent est complété
    const moduleIndex = this.moduleOrder.indexOf(moduleName);
    if (moduleIndex <= 0) return false;
    
    const previousModule = this.moduleOrder[moduleIndex - 1] as keyof ModuleStatus;
    return this.moduleStatusesSubject.value[previousModule];
  }

  /**
   * Vérifie si tous les modules sont complétés (sauf conclusion)
   */
  allModulesCompleted(): boolean {
    const statuses = this.moduleStatusesSubject.value;
    return this.moduleOrder
      .filter(module => module !== 'conclusion')
      .every(module => statuses[module as keyof ModuleStatus]);
  }

  /**
   * Obtient le pourcentage de progression
   */
  getCompletionPercentage(): number {
    const completedCount = Object.values(this.moduleStatusesSubject.value)
      .filter(Boolean).length - 1; // -1 pour exclure l'accueil
    const totalModules = this.moduleOrder.length - 2; // -2 pour exclure l'accueil et la conclusion
    return Math.round((completedCount / totalModules) * 100);
  }

  /**
   * Réinitialise tous les modules (sauf l'accueil)
   */
  resetProgress(): void {
    const resetStatuses: ModuleStatus = {
      home: true,
      itineraire: false,
      experience: false,
      attentes: false,
      personnalite: false,
      centres: false,
      motivations: false,
      conclusion: false
    };
    
    this.moduleStatusesSubject.next(resetStatuses);
    this.saveModuleStatus();
  }

}
