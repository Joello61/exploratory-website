import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Skill {
  name: string;
  icon: string;
  question: string;
  answers: { text: string; correct: boolean }[];
  isUnlocked: boolean;
}

@Component({
  selector: 'app-competences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competences.component.html',
  styleUrl: './competences.component.css'
})
export class CompetencesComponent {
  skills: Skill[] = [
    {
      name: 'Angular',
      icon: 'fab fa-angular',
      question: 'Je suis un framework puissant utilisé pour concevoir des applications web modernes. Grâce à moi, les développeurs peuvent créer des interfaces dynamiques et performantes basées sur des composants. Mon logo est une lettre stylisée et je suis développé par Google. Qui suis-je ?',
      answers: [
        { text: 'Angular', correct: true },
        { text: 'React', correct: false },
        { text: 'Vue.js', correct: false },
        { text: 'Django', correct: false }
      ],
      isUnlocked: false
    },
    {
      name: 'HTML/CSS',
      icon: 'fab fa-html5',
      question: 'Je suis le socle sur lequel repose tout site web. Grâce à moi, les développeurs structurent leurs pages et leur donnent une apparence agréable et harmonieuse. Mon premier rôle est de décrire le contenu (titres, paragraphes, images), tandis que mon compagnon s\'occupe de l’esthétique. Qui sommes-nous ?',
      answers: [
        { text: 'Python', correct: false },
        { text: 'Java', correct: false },
        { text: 'HTML/CSS', correct: true },
        { text: 'Navigateur', correct: false }
      ],
      isUnlocked: false
    },
    {
      name: 'Node.js',
      icon: 'fab fa-node-js',
      question: 'Je suis un environnement d’exécution qui permet aux développeurs d’utiliser JavaScript côté serveur. Grâce à moi, on peut créer des applications rapides et évolutives, notamment des API et des services en temps réel. Je suis basé sur le moteur V8 de Google Chrome. Qui suis-je ?',
      answers: [
        { text: 'PHP', correct: false },
        { text: 'C#', correct: false },
        { text: 'Git', correct: false },
        { text: 'Node.js', correct: true }
      ],
      isUnlocked: false
    },
    {
      name: 'Python',
      icon: 'fab fa-python',
      question: 'Si tu veux faire de l’intelligence artificielle, de l’analyse de données ou de l’automatisation, tu ne peux pas me rater ! Je suis un langage simple et puissant, utilisé aussi bien par les débutants que par les experts en machine learning. On me reconnaît à mon logo en forme de serpent. Qui suis-je ?',
      answers: [
        { text: 'Python', correct: true },
        { text: 'C++', correct: false },
        { text: 'Jenkins', correct: false },
        { text: 'Flask', correct: false }
      ],
      isUnlocked: false
    },
    {
      name: 'Git',
      icon: 'fab fa-git-alt',
      question: 'ravailler en équipe sur un projet informatique serait un chaos sans moi ! Je suis un outil de gestion de versions qui permet aux développeurs de suivre les modifications de leur code et de collaborer efficacement. Mon logo est une branche avec des connexions. Qui suis-je ?',
      answers: [
        { text: 'Rust', correct: false },
        { text: 'SQL', correct: false },
        { text: 'Git', correct: true },
        { text: 'Django', correct: false }
      ],
      isUnlocked: false
    },
    
    // Ajoutez d'autres compétences ici
  ];

  isModalOpen = false;
  currentSkill: Skill | null = null;
  countdown = 30;
  isAnswerSelected = false;
  jokersUsed: string[] = [];

  openModal(skill: Skill) {
    if (skill.isUnlocked) return;
    this.currentSkill = skill;
    this.isModalOpen = true;
    this.startCountdown();
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentSkill = null;
    this.countdown = 30;
    this.isAnswerSelected = false;
  }

  startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.closeModal();
      }
    }, 1000);
  }

  checkAnswer(answer: { text: string; correct: boolean }) {
    this.isAnswerSelected = true;
    if (answer.correct) {
      alert('Bravo, tu viens de débloquer une nouvelle compétence !');
      this.currentSkill!.isUnlocked = true;
    } else {
      alert('Dommage... essaie encore après quelques secondes.');
    }
    this.closeModal();
  }

  useJoker(type: string) {
    this.jokersUsed.push(type);
    // Implémentez la logique des jokers ici
  }
}
