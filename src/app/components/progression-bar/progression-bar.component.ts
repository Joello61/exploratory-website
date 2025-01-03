import { Component } from '@angular/core';
import { ProgressionService } from '../../services/progression.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progression-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progression-bar.component.html',
  styleUrl: './progression-bar.component.css'
})
export class ProgressionBarComponent {

  progressPercentage = 0;

  constructor(private progressService: ProgressionService) {}

  ngOnInit(): void {
    this.updateProgress();
  }

  updateProgress(): void {
    this.progressPercentage = this.progressService.getProgressPercentage();
  }

}
