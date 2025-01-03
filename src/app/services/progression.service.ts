import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProgressionService {
  private steps = ['accueil', 'cv', 'itinéraire', 'compétences', 'motivation-socio-pro', 'traits-personnalite', 'centres-interet'];
  private currentStepIndex = 0;

  getProgressPercentage(): number {
    return ((this.currentStepIndex + 1) / this.steps.length) * 100;
  }

  getCurrentStep(): string {
    return this.steps[this.currentStepIndex];
  }

  goToStep(step: string): void {
    const index = this.steps.indexOf(step);
    if (index !== -1) {
      this.currentStepIndex = index;
    }
  }

  nextStep(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
    }
  }

  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }
}
