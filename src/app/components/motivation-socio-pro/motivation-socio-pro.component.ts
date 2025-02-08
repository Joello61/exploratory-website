import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Motivation {
  title: string;
  description: string;
  icon: string;
  revealed: boolean;
}

@Component({
  selector: 'app-motivations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motivation-socio-pro.component.html',
  styleUrls: ['./motivation-socio-pro.component.css']
})
export class MotivationSocioProComponent {
  // Liste de motivations socio‑professionnelles, initialement verrouillées
  motivations: Motivation[] = [
    {
      title: 'Innovation',
      description: 'Je suis motivé par la recherche constante de solutions innovantes pour résoudre des problèmes complexes et créer de la valeur dans un environnement professionnel en évolution.',
      icon: 'fas fa-rocket',
      revealed: false
    },
    {
      title: 'Collaboration',
      description: 'Travailler en équipe et partager des idées est essentiel pour réussir. La collaboration me permet d\'apprendre des autres et de co-construire des projets ambitieux.',
      icon: 'fas fa-users',
      revealed: false
    },
    {
      title: 'Excellence',
      description: 'J\'aspire à atteindre l\'excellence dans tout ce que j\'entreprends, en m\'efforçant d\'améliorer continuellement mes compétences et en veillant à la qualité du travail livré.',
      icon: 'fas fa-award',
      revealed: false
    },
    {
      title: 'Développement Personnel',
      description: 'Je crois fermement que le développement personnel est la clé de la réussite professionnelle. J\'investis constamment dans ma formation et mon épanouissement pour rester à la pointe.',
      icon: 'fas fa-user-graduate',
      revealed: false
    }
  ];

  // Méthode appelée lors du clic sur une carte de motivation
  revealMotivation(motivation: Motivation): void {
    if (!motivation.revealed) {
      motivation.revealed = true;
    }
  }
}
