import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Skill {
  name: string;
  icon: string;
  question: string;
  answers: {
    text: string;
    correct: boolean;
    hidden: boolean;
    votes: number | undefined;
  }[];
  isUnlocked: boolean;
}

@Component({
  selector: 'app-competences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competences.component.html',
  styleUrl: './competences.component.css',
})
export class CompetencesComponent {
  skills: Skill[] = [
    {
      name: 'Angular',
      icon: 'fab fa-angular',
      question:
        'Je suis un framework puissant utilisé pour concevoir des applications web modernes. Grâce à moi, les développeurs peuvent créer des interfaces dynamiques et performantes basées sur des composants. Mon logo est une lettre stylisée et je suis développé par Google. Qui suis-je ?',
      answers: [
        { text: 'Angular', correct: true, hidden: false, votes: 0 },
        { text: 'React', correct: false, hidden: false, votes: 0 },
        { text: 'Vue.js', correct: false, hidden: false, votes: 0 },
        { text: 'Django', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    {
      name: 'HTML/CSS',
      icon: 'fab fa-html5',
      question:
        "Je suis le socle sur lequel repose tout site web. Grâce à moi, les développeurs structurent leurs pages et leur donnent une apparence agréable et harmonieuse. Mon premier rôle est de décrire le contenu (titres, paragraphes, images), tandis que mon compagnon s'occupe de l’esthétique. Qui sommes-nous ?",
      answers: [
        { text: 'Python', correct: false, hidden: false, votes: 0 },
        { text: 'Java', correct: false, hidden: false, votes: 0 },
        { text: 'HTML/CSS', correct: true, hidden: false, votes: 0 },
        { text: 'Navigateur', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    {
      name: 'Node.js',
      icon: 'fab fa-node-js',
      question:
        'Je suis un environnement d’exécution qui permet aux développeurs d’utiliser JavaScript côté serveur. Grâce à moi, on peut créer des applications rapides et évolutives, notamment des API et des services en temps réel. Je suis basé sur le moteur V8 de Google Chrome. Qui suis-je ?',
      answers: [
        { text: 'PHP', correct: false, hidden: false, votes: 0 },
        { text: 'C#', correct: false, hidden: false, votes: 0 },
        { text: 'Git', correct: false, hidden: false, votes: 0 },
        { text: 'Node.js', correct: true, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    {
      name: 'Python',
      icon: 'fab fa-python',
      question:
        'Si tu veux faire de l’intelligence artificielle, de l’analyse de données ou de l’automatisation, tu ne peux pas me rater ! Je suis un langage simple et puissant, utilisé aussi bien par les débutants que par les experts en machine learning. On me reconnaît à mon logo en forme de serpent. Qui suis-je ?',
      answers: [
        { text: 'Python', correct: true, hidden: false, votes: 0 },
        { text: 'C++', correct: false, hidden: false, votes: 0 },
        { text: 'Jenkins', correct: false, hidden: false, votes: 0 },
        { text: 'Flask', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    {
      name: 'Git',
      icon: 'fab fa-git-alt',
      question:
        'ravailler en équipe sur un projet informatique serait un chaos sans moi ! Je suis un outil de gestion de versions qui permet aux développeurs de suivre les modifications de leur code et de collaborer efficacement. Mon logo est une branche avec des connexions. Qui suis-je ?',
      answers: [
        { text: 'Rust', correct: false, hidden: false, votes: 0 },
        { text: 'SQL', correct: false, hidden: false, votes: 0 },
        { text: 'Git', correct: true, hidden: false, votes: 0 },
        { text: 'Django', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },

    // Ajoutez d'autres compétences ici
  ];

  isModalOpen = false;
  currentSkill: Skill | null = null;
  countdown = 30;
  isAnswerSelected = false;
  jokersUsed: string[] = [];
  showAudienceResults: boolean | undefined;
  timerSubscription: any;

  openModal(skill: Skill) {
    if (skill.isUnlocked) return;
    this.currentSkill = skill;
    this.isModalOpen = true;
    this.startCountdown();
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentSkill = null;
    this.isAnswerSelected = false;

    // Stopper le chronomètre s'il est actif
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
      this.timerSubscription = null;
    }

    this.countdown = 30;

    // Réinitialiser les jokers et leur état
    this.jokersUsed = [];
    this.showAudienceResults = false;

    if (this.currentSkill) {
      (this.currentSkill as Skill).answers.forEach(
        (answer) => (answer.hidden = false)
      );
    }
  }

  startCountdown() {
    // Empêche le lancement de plusieurs timers
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
    }

    this.timerSubscription = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timerSubscription);
        this.closeModal();
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
      this.timerSubscription = null;
    }
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

    switch (type) {
      case '50-50':
        this.useFiftyFifty();
        break;
      case 'audience':
        this.useAudienceHelp();
        break;
      case 'pause':
        this.pauseTimer();
        break;
      default:
        console.log('Joker inconnu');
    }
  }

  useFiftyFifty() {
    if (!this.currentSkill || !this.currentSkill.answers) return;

    // Filtrer les mauvaises réponses
    let wrongAnswers = this.currentSkill.answers.filter((a) => !a.correct);

    // Sélectionner deux mauvaises réponses aléatoires
    if (wrongAnswers.length > 2) {
      wrongAnswers = this.shuffleArray(wrongAnswers).slice(0, 2);
    }

    // Masquer ces réponses (en ajoutant une propriété `hidden`)
    this.currentSkill.answers.forEach((answer) => {
      if (wrongAnswers.includes(answer)) {
        answer.hidden = true;
      }
    });
  }

  // Fonction pour mélanger un tableau
  shuffleArray(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
  }

  useAudienceHelp() {
    if (!this.currentSkill || !this.currentSkill.answers) return;

    let totalVotes = 100;
    let correctAnswer = this.currentSkill.answers.find((a) => a.correct);
    let otherAnswers = this.currentSkill.answers.filter((a) => !a.correct);

    let correctVote = Math.floor(Math.random() * 40) + 50; // Entre 50% et 90%
    totalVotes -= correctVote;

    let otherVotes = otherAnswers.map(() =>
      Math.floor(totalVotes / otherAnswers.length)
    );

    // Attribuer les votes
    this.currentSkill.answers.forEach((answer) => {
      if (answer.correct) {
        answer.votes = correctVote;
      } else {
        answer.votes = otherVotes.pop();
      }
    });

    this.showAudienceResults = true;
  }

  pauseTimer() {
    this.stopCountdown(); // Arrête le timer

    setTimeout(() => {
      this.startCountdown(); // Redémarre après 5 secondes
    }, 5000);
  }
}
