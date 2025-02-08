import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Interest {
  title: string;
  description: string;
  icon: string;
  revealed: boolean;
}

@Component({
  selector: 'app-centres-interets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './centres-interet.component.html',
  styleUrls: ['./centres-interet.component.css']
})
export class CentresInteretComponent {
  interests: Interest[] = [
    {
      title: 'Lecture',
      description: 'Je me plonge dans des univers variés, allant de la science-fiction à la philosophie, pour nourrir ma curiosité et élargir mes horizons.',
      icon: 'fas fa-book-open',
      revealed: false
    },
    {
      title: 'Sport',
      description: 'Que ce soit en courant, en faisant du vélo ou en pratiquant des sports d’équipe, le sport me permet de garder l’esprit vif et le corps en forme.',
      icon: 'fas fa-running',
      revealed: false
    },
    {
      title: 'Cuisine',
      description: 'La cuisine est pour moi un laboratoire de créativité où j’expérimente de nouvelles recettes et savoure l’art de réunir les saveurs.',
      icon: 'fas fa-utensils',
      revealed: false
    },
    {
      title: 'Voyages',
      description: 'Explorer de nouveaux pays, rencontrer des cultures différentes et découvrir des paysages époustouflants sont autant d’expériences qui m’enrichissent.',
      icon: 'fas fa-plane',
      revealed: false
    }
  ];

  // Cette méthode "révèle" la carte, en simulant la résolution d’une énigme (ici, le clic suffit)
  revealInterest(interest: Interest): void {
    if (!interest.revealed) {
      interest.revealed = true;
    }
  }
}
