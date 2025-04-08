import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Alert } from '../models/others/alert';
import { AlertType } from '../types/alert.type';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alerts = new BehaviorSubject<Alert[]>([]);
  private counter = 0;

  constructor() {}

  // Observable des alertes pour les composants qui s'y abonnent
  public getAlerts(): Observable<Alert[]> {
    return this.alerts.asObservable();
  }

  // Ajouter une alerte
  public addAlert(
    message: string, 
    type: AlertType = AlertType.Info, 
    title?: string, 
    autoClose: boolean = true, 
    duration: number = 5000,
    icon?: string
  ): number {
    const id = ++this.counter;
    
    const alert: Alert = {
      id,
      type,
      message,
      title,
      autoClose,
      duration,
      icon
    };

    const currentAlerts = this.alerts.getValue();
    this.alerts.next([...currentAlerts, alert]);

    if (autoClose) {
      setTimeout(() => this.removeAlert(id), duration);
    }

    return id;
  }

  // Ajouter une alerte de succès
  public success(
    message: string, 
    title?: string, 
    autoClose: boolean = true,
    duration: number = 5000
  ): number {
    return this.addAlert(message, AlertType.Success, title, autoClose, duration, 'bi bi-check-circle-fill');
  }

  // Ajouter une alerte d'information
  public info(
    message: string, 
    title?: string, 
    autoClose: boolean = true,
    duration: number = 5000
  ): number {
    return this.addAlert(message, AlertType.Info, title, autoClose, duration, 'bi bi-info-circle-fill');
  }

  // Ajouter une alerte d'avertissement
  public warning(
    message: string, 
    title?: string, 
    autoClose: boolean = true,
    duration: number = 5000
  ): number {
    return this.addAlert(message, AlertType.Warning, title, autoClose, duration, 'bi bi-exclamation-triangle-fill');
  }

  // Ajouter une alerte d'erreur
  public error(
    message: string, 
    title?: string, 
    autoClose: boolean = true,
    duration: number = 5000
  ): number {
    return this.addAlert(message, AlertType.Error, title, autoClose, duration, 'bi bi-x-circle-fill');
  }

  // Supprimer une alerte par son ID
  public removeAlert(id: number): void {
    const currentAlerts = this.alerts.getValue();
    this.alerts.next(currentAlerts.filter(alert => alert.id !== id));
  }

  // Supprimer toutes les alertes
  public clearAlerts(): void {
    this.alerts.next([]);
  }
}