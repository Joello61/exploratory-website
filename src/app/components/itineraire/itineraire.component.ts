import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Puzzle {
  question: string;
  options: string[];
  answer: string;
}

interface TimelineItem {
  title: string;
  date: string;
  description: string;
  details: string;
  icon: string;
  locked: boolean;      // Indique si l'étape est verrouillée
  puzzle?: Puzzle;      // L'énigme associée à l'étape
}

@Component({
  selector: 'app-itineraire',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itineraire.component.html',
  styleUrls: ['./itineraire.component.css']
})
export class ItineraireComponent {
  timelineItems: TimelineItem[] = [
    {
      title: 'Diplôme en Informatique',
      date: '2015 - 2018',
      description: 'Obtention de mon diplôme en informatique à l\'Université X. Une période de découvertes intensives dans le domaine du numérique.',
      details: 'Pendant ces années, j\'ai approfondi mes connaissances en développement web, algorithmique et gestion de bases de données. Ce fut le début de ma passion pour l\'informatique.',
      icon: 'fas fa-graduation-cap',
      locked: true,
      puzzle: {
        question: "Pour débloquer cette étape, répondez : Quel élément symbolise le passage à l'excellence académique dans le domaine numérique ?",
        options: ["Un diplôme", "Un stage", "Un code", "Un projet"],
        answer: "Un diplôme"
      }
    },
    {
      title: 'Développeur Full Stack',
      date: '2018 - 2020',
      description: 'Intégration chez Y Company en tant que développeur Full Stack, où j’ai participé à des projets d’envergure.',
      details: 'J’ai contribué à la création d’applications web en utilisant Angular pour le front-end et Node.js pour le back-end. Ce poste m’a permis d\'acquérir une expérience solide dans le développement complet d’applications.',
      icon: 'fas fa-laptop-code',
      locked: true,
      puzzle: {
        question: "Pour révéler cette étape, dites-nous : Quel terme décrit le mieux un développeur capable de travailler sur le front-end et le back-end ?",
        options: ["Développeur Front", "Développeur Back", "Magicien du Full Stack", "Codeur"],
        answer: "Magicien du Full Stack"
      }
    },
    {
      title: 'Freelance',
      date: '2020 - Présent',
      description: 'Travail en freelance pour divers clients, créant des solutions sur mesure.',
      details: 'En tant que freelance, j’ai pu explorer différents secteurs et technologies, ce qui m\'a permis d\'affiner mes compétences et d\'acquérir une grande polyvalence dans la gestion de projets informatiques.',
      icon: 'fas fa-user-tie',
      locked: true,
      puzzle: {
        question: "Pour débloquer cette dernière étape, répondez : Quel mode de travail symbolise la liberté créative et l\'indépendance professionnelle ?",
        options: ["Télétravail", "Freelance", "CDD", "Stage"],
        answer: "Freelance"
      }
    }
  ];

  isModalOpen = false;
  selectedItem: TimelineItem | null = null;
  showPuzzle = false;
  currentPuzzle: Puzzle | undefined;
  puzzleResponseMessage: string = '';

  openDetails(item: TimelineItem) {
    this.selectedItem = item;
    if (item.locked && item.puzzle) {
      this.currentPuzzle = item.puzzle;
      this.showPuzzle = true;
    } else {
      this.showPuzzle = false;
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedItem = null;
    this.currentPuzzle = undefined;
    this.puzzleResponseMessage = '';
  }

  checkPuzzleAnswer(selectedOption: string) {
    if (this.currentPuzzle && this.selectedItem) {
      if (selectedOption === this.currentPuzzle.answer) {
        this.puzzleResponseMessage = 'Bien joué, détective ! Cette étape est maintenant débloquée.';
        this.selectedItem.locked = false;
        setInterval(() => {
          this.closeModal();
        }, 1500); // Déverrouille l'étape
      } else {
        this.puzzleResponseMessage = 'Mauvaise réponse... Réessayez ou utilisez un joker.';
      }
    }
  }
}
