import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Alert } from '../../models/others/alert';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ]
})
export class AlertComponent implements OnInit, OnDestroy{

  alerts: Alert[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.subscription = this.alertService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeAlert(id: number): void {
    this.alertService.removeAlert(id);
  }

}
