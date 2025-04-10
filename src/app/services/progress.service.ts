import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModuleStatus } from '../models/others/modul-status';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private readonly STORAGE_KEY = 'enquete_module_statuses';
  private readonly moduleOrder = [
    'home',
    'itineraire',
    'experience',
    'competences',
    'attentes',
    'personnalite',
    'centres',
    //'motivations',
    'conclusion',
  ];

  private moduleStatusesSubject = new BehaviorSubject<ModuleStatus>({
    home: true, // L'intro est considérée comme complétée par défaut
    itineraire: false,
    experience: false,
    competences: false,
    attentes: false,
    personnalite: false,
    centres: false,
    //motivations: false,
    conclusion: false,
  });

  public moduleStatuses$: Observable<ModuleStatus> =
    this.moduleStatusesSubject.asObservable();

  constructor(private alertService: AlertService) {
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
      console.error(
        'Erreur lors de la sauvegarde des statuts de module:',
        error
      );
    }
  }

  /**
   * Marque un module comme complété et affiche une alerte
   */
  completeModule(moduleName: keyof ModuleStatus): void {
    const currentStatuses = { ...this.moduleStatusesSubject.value };
    
    // Vérifier si le module n'est pas déjà complété pour éviter des alertes en double
    if (!currentStatuses[moduleName]) {
      currentStatuses[moduleName] = true;
      this.moduleStatusesSubject.next(currentStatuses);
      this.saveModuleStatus();
      
      // Vérifier si des jalons de progression ont été atteints
      this.checkProgressMilestones();
      
      // Vérifier si tous les modules sont maintenant complétés
      if (this.allModulesCompleted()) {
        this.showAllModulesCompletedAlert();
      }
    }
  }


  /**
   * Vérifie si des jalons de progression ont été atteints
   */
  private checkProgressMilestones(): void {
    const percentage = this.getCompletionPercentage();
    
    // Alertes pour les jalons importants (25%, 50%, 75%)
    if (percentage === 25) {
      this.alertService.info(
        'Vous avez complété 25% de votre parcours. Continuez !',
        'Progression',
        true
      );
    } else if (percentage === 50) {
      this.alertService.info(
        'Vous êtes à mi-parcours ! 50% de votre parcours est maintenant complété.',
        'Progression',
        true
      );
    } else if (percentage === 75) {
      this.alertService.info(
        'Vous avez complété 75% de votre parcours. La fin est proche !',
        'Progression',
        true
      );
    }
  }

  /**
   * Affiche une alerte spéciale quand tous les modules sont complétés
   */
  private showAllModulesCompletedAlert(): void {
    this.alertService.success(
      'Félicitations ! Vous avez complété tous les modules principaux du parcours. Vous pouvez maintenant accéder à la conclusion.',
      'Parcours complété',
      false // Ne pas fermer automatiquement pour marquer l'importance
    );
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
    const moduleIndex = this.moduleOrder.indexOf(moduleName as string);
    if (moduleIndex <= 0) return false;

    const previousModule = this.moduleOrder[
      moduleIndex - 1
    ] as keyof ModuleStatus;
    return this.moduleStatusesSubject.value[previousModule];
  }

  /**
   * Vérifie si tous les modules sont complétés (sauf conclusion)
   */
  allModulesCompleted(): boolean {
    const statuses = this.moduleStatusesSubject.value;
    return this.moduleOrder
      .filter((module) => module !== 'conclusion' && module !== 'home')
      .every((module) => statuses[module as keyof ModuleStatus]);
  }

  /**
   * Obtient le pourcentage de progression
   */
  getCompletionPercentage(): number {
    const completedCount =
      Object.values(this.moduleStatusesSubject.value).filter(Boolean).length -
      1; // -1 pour exclure l'accueil
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
      competences: false,
      attentes: false,
      personnalite: false,
      centres: false,
      //motivations: false,
      conclusion: false,
    };

    this.moduleStatusesSubject.next(resetStatuses);
    this.saveModuleStatus();
    
    // Afficher une alerte de réinitialisation
    this.alertService.info(
      'Votre progression a été réinitialisée. Tous les modules (sauf l\'accueil) sont maintenant marqués comme non complétés.',
      'Progression réinitialisée',
      true
    );
  }
}