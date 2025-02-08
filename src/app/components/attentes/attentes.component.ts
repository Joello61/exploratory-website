import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';



@Component({
  selector: 'app-attentes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attentes.component.html',
  styleUrls: ['./attentes.component.css']
})
export class AttentesComponent {
  boxLocked = true; // La boîte est verrouillée par défaut
  isModalOpen = false; // Le modal est fermé par défaut
  isAnswerSelected = false; // Aucune réponse sélectionnée par défaut
  isCorrect = false; // La réponse n'est pas correcte par défaut

  // Question et options
  question = {
    text: 'Quelle est votre plus grande attente professionnelle ?',
    options: ['Innovation', 'Autonomie', 'Stabilité', 'Croissance'],
    correctAnswer: 'Innovation'
  };

  // Message révélé après déverrouillage
  expectationMessage = 'Je recherche un environnement où je peux innover et repousser les limites de la technologie.';

  // Ouvrir le modal
  openModal() {
    if (this.boxLocked) {
      this.isModalOpen = true;
    }
  }

  // Vérifier la réponse
  checkAnswer(selectedAnswer: string) {
    this.isAnswerSelected = true;
    if (selectedAnswer === this.question.correctAnswer) {
      this.isCorrect = true;
      this.boxLocked = false; // Déverrouiller la boîte
      this.isModalOpen = false; // Fermer le modal
    } else {
      this.isCorrect = false;
    }
  }
}
