import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Value {
  title: string;
  description: string;
  icon: string;
}

interface Passion {
  title: string;
  description: string;
  icon: string;
}

interface Interest {
  title: string;
  description: string;
  icon: string;
}

interface Quote {
  text: string;
  author: string;
}

@Component({
  selector: 'app-personnalite',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personnalite.component.html',
  styleUrl: './personnalite.component.css'
})
export class PersonnaliteComponent {

  values: Value[] = [
    {
      title: 'Créativité',
      description: 'J\'aime penser hors des sentiers battus et trouver des solutions innovantes.',
      icon: 'fas fa-lightbulb'
    },
    {
      title: 'Persévérance',
      description: 'Je ne lâche rien, même face aux défis les plus difficiles.',
      icon: 'fas fa-fist-raised'
    },
    {
      title: 'Empathie',
      description: 'Je mets un point d\'honneur à comprendre et à aider les autres.',
      icon: 'fas fa-heart'
    }
  ];

  passions: Passion[] = [
    {
      title: 'Musique',
      description: 'La musique est une source d\'inspiration et de détente pour moi.',
      icon: 'fas fa-music'
    },
    {
      title: 'Voyages',
      description: 'J\'adore découvrir de nouvelles cultures et de nouveaux horizons.',
      icon: 'fas fa-globe'
    },
    {
      title: 'Technologie',
      description: 'Je suis passionné par les innovations technologiques et leur impact sur le monde.',
      icon: 'fas fa-laptop'
    }
  ];

  interests: Interest[] = [
    {
      title: 'Lecture',
      description: 'Je lis des livres sur des sujets variés, de la science-fiction à la philosophie.',
      icon: 'fas fa-book'
    },
    {
      title: 'Sport',
      description: 'Je pratique régulièrement du sport pour garder un équilibre physique et mental.',
      icon: 'fas fa-running'
    },
    {
      title: 'Cuisine',
      description: 'J\'aime expérimenter de nouvelles recettes et cuisiner pour mes proches.',
      icon: 'fas fa-utensils'
    }
  ];

  quotes: Quote[] = [
    {
      text: 'La créativité, c\'est l\'intelligence qui s\'amuse.',
      author: 'Albert Einstein'
    },
    {
      text: 'Le succès, c\'est d\'aller d\'échec en échec sans perdre son enthousiasme.',
      author: 'Winston Churchill'
    },
    {
      text: 'La vie, c\'est comme une bicyclette, il faut avancer pour ne pas perdre l\'équilibre.',
      author: 'Albert Einstein'
    }
  ];

}
