import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { Router } from '@angular/router';

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
  styleUrls: ['./competences.component.css'],
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
        'Travailler en équipe sur un projet informatique serait un chaos sans moi ! Je suis un outil de gestion de versions qui permet aux développeurs de suivre les modifications de leur code et de collaborer efficacement. Mon logo est une branche avec des connexions. Qui suis-je ?',
      answers: [
        { text: 'Rust', correct: false, hidden: false, votes: 0 },
        { text: 'SQL', correct: false, hidden: false, votes: 0 },
        { text: 'Git', correct: true, hidden: false, votes: 0 },
        { text: 'Django', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 1 : TypeScript
    {
      name: 'TypeScript',
      icon: 'fas fa-file-code',
      question:
        "Je suis un surensemble de JavaScript qui apporte le typage statique et des fonctionnalités avancées. Qui suis-je ?",
      answers: [
        { text: 'TypeScript', correct: true, hidden: false, votes: 0 },
        { text: 'JavaScript', correct: false, hidden: false, votes: 0 },
        { text: 'Python', correct: false, hidden: false, votes: 0 },
        { text: 'C#', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 2 : RxJS
    {
      name: 'RxJS',
      icon: 'fas fa-sync-alt',
      question:
        "Je suis une librairie pour la programmation réactive, permettant de gérer des flux de données asynchrones dans Angular. Qui suis-je ?",
      answers: [
        { text: 'RxJS', correct: true, hidden: false, votes: 0 },
        { text: 'Redux', correct: false, hidden: false, votes: 0 },
        { text: 'Lodash', correct: false, hidden: false, votes: 0 },
        { text: 'jQuery', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 3 : Sass/SCSS
    {
      name: 'Sass/SCSS',
      icon: 'fab fa-sass',
      question:
        "Je suis un préprocesseur CSS qui permet d'écrire des styles de manière plus efficace avec des variables, des mixins et une meilleure organisation. Qui suis-je ?",
      answers: [
        { text: 'Sass/SCSS', correct: true, hidden: false, votes: 0 },
        { text: 'Less', correct: false, hidden: false, votes: 0 },
        { text: 'Stylus', correct: false, hidden: false, votes: 0 },
        { text: 'PostCSS', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 4 : Bootstrap
    {
      name: 'Bootstrap',
      icon: 'fab fa-bootstrap',
      question:
        "Je suis un framework CSS qui facilite la création d'interfaces web responsives et élégantes avec des composants préconçus. Qui suis-je ?",
      answers: [
        { text: 'Bootstrap', correct: true, hidden: false, votes: 0 },
        { text: 'Foundation', correct: false, hidden: false, votes: 0 },
        { text: 'Tailwind', correct: false, hidden: false, votes: 0 },
        { text: 'Bulma', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 5 : Docker
    {
      name: 'Docker',
      icon: 'fab fa-docker',
      question:
        "Je suis une plateforme de conteneurisation qui permet d'empaqueter des applications et leurs dépendances dans des conteneurs isolés. Qui suis-je ?",
      answers: [
        { text: 'Docker', correct: true, hidden: false, votes: 0 },
        { text: 'Kubernetes', correct: false, hidden: false, votes: 0 },
        { text: 'VirtualBox', correct: false, hidden: false, votes: 0 },
        { text: 'VMware', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 6 : GraphQL
    {
      name: 'GraphQL',
      icon: 'fab fa-graphql',
      question:
        "Je suis un langage de requête pour les API qui permet de demander exactement les données nécessaires. Qui suis-je ?",
      answers: [
        { text: 'GraphQL', correct: true, hidden: false, votes: 0 },
        { text: 'REST', correct: false, hidden: false, votes: 0 },
        { text: 'SOAP', correct: false, hidden: false, votes: 0 },
        { text: 'gRPC', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 7 : Firebase
    {
      name: 'Firebase',
      icon: 'fas fa-fire',
      question:
        "Je suis une plateforme de développement d'applications web et mobiles qui offre une base de données en temps réel, l'authentification et l'hébergement. Qui suis-je ?",
      answers: [
        { text: 'Firebase', correct: true, hidden: false, votes: 0 },
        { text: 'Parse', correct: false, hidden: false, votes: 0 },
        { text: 'AWS Amplify', correct: false, hidden: false, votes: 0 },
        { text: 'Back4App', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 8 : Jest
    {
      name: 'Jest',
      icon: 'fas fa-vial',
      question:
        "Je suis un framework de tests pour JavaScript, connu pour ma simplicité et mon intégration avec React et d'autres frameworks. Qui suis-je ?",
      answers: [
        { text: 'Jest', correct: true, hidden: false, votes: 0 },
        { text: 'Mocha', correct: false, hidden: false, votes: 0 },
        { text: 'Chai', correct: false, hidden: false, votes: 0 },
        { text: 'Karma', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 9 : Tailwind CSS
    {
      name: 'Tailwind CSS',
      icon: 'fab fa-tailwind-css',
      question:
        "Je suis un framework CSS utility-first permettant de créer des interfaces modernes et responsives rapidement. Qui suis-je ?",
      answers: [
        { text: 'Tailwind CSS', correct: true, hidden: false, votes: 0 },
        { text: 'Bootstrap', correct: false, hidden: false, votes: 0 },
        { text: 'Bulma', correct: false, hidden: false, votes: 0 },
        { text: 'Foundation', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    },
    // Compétence supplémentaire 10 : Express.js
    {
      name: 'Express.js',
      icon: 'fas fa-server',
      question:
        "Je suis un framework minimaliste pour Node.js qui permet de gérer des routes et middlewares de manière simple et efficace. Qui suis-je ?",
      answers: [
        { text: 'Express.js', correct: true, hidden: false, votes: 0 },
        { text: 'Koa', correct: false, hidden: false, votes: 0 },
        { text: 'Nest.js', correct: false, hidden: false, votes: 0 },
        { text: 'Hapi', correct: false, hidden: false, votes: 0 },
      ],
      isUnlocked: false,
    }
  ];
  


  isModalOpen = false;
  currentSkill: Skill | null = null;
  countdown = 30;
  initialCountdown = 30;
  // Stocke la réponse sélectionnée
  selectedAnswer: { text: string; correct: boolean } | null = null;
  // Indicateurs pour la finalisation et l'évaluation
  finalized: boolean = false;
  finalAnswerCorrect: boolean = false;
  jokersUsed: string[] = [];
  showAudienceResults: boolean | undefined;
  timerSubscription: any;

  @ViewChild('modalContent', { static: false }) modalContent!: ElementRef;

  constructor(private router: Router) {}

  // Getter pour savoir si toutes les compétences sont débloquées
  get allSkillsUnlocked(): boolean {
    return this.skills.every(skill => skill.isUnlocked);
  }

  openModal(skill: Skill) {
    if (skill.isUnlocked) return;
    this.currentSkill = skill;
    this.isModalOpen = true;
    // Réinitialisation de l'état du modal
    this.selectedAnswer = null;
    this.finalized = false;
    this.finalAnswerCorrect = false;
    this.countdown = this.initialCountdown;
    // Animation d'ouverture de la modale
    setTimeout(() => {
      gsap.fromTo(
        this.modalContent.nativeElement,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }, 0);
    this.startCountdown();
  }

  closeModal() {
    if (this.modalContent) {
      gsap.to(this.modalContent.nativeElement, {
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          this.isModalOpen = false;
          this.currentSkill = null;
          this.resetModalState();
        },
      });
    } else {
      this.isModalOpen = false;
      this.currentSkill = null;
      this.resetModalState();
    }
  }

  resetModalState() {
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
      this.timerSubscription = null;
    }
    this.countdown = this.initialCountdown;
    this.showAudienceResults = false;
    this.selectedAnswer = null;
    this.finalized = false;
    this.finalAnswerCorrect = false;
    if (this.currentSkill) {
      this.currentSkill.answers.forEach(answer => (answer.hidden = false));
    }
  }

  startCountdown() {
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
    }
    this.timerSubscription = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timerSubscription);
        this.timerSubscription = null;
        this.finalizeAnswer();
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
      this.timerSubscription = null;
    }
  }

  getProgressBarWidth() {
    return (this.countdown / this.initialCountdown) * 100;
  }

  // Lorsqu'une réponse est cliquée, elle est sélectionnée (affichage en orange)
  selectAnswer(answer: { text: string; correct: boolean }) {
    this.selectedAnswer = answer;
  }

  // Permet à l'utilisateur de valider immédiatement sa réponse
  validateAnswer() {
    this.stopCountdown();
    this.finalizeAnswer();
  }

  // Évalue la réponse sélectionnée et lance l'animation de type roulette
  finalizeAnswer() {
    this.finalized = true;
    if (this.selectedAnswer && this.selectedAnswer.correct) {
      this.finalAnswerCorrect = true;
      this.playCorrectSound();
      gsap.to(this.modalContent.nativeElement, { borderColor: "#28a745", duration: 0.5 });
      if (this.currentSkill) {
        this.currentSkill.isUnlocked = true;
      }
    } else {
      this.finalAnswerCorrect = false;
      this.playWrongSound();
      gsap.to(this.modalContent.nativeElement, { borderColor: "#ff3333", duration: 0.5 });
    }
    // Après 3 secondes, fermer la modale
    setTimeout(() => {
      this.closeModal();
    }, 1500);
  }

  // Gestion des jokers globaux
  useJoker(type: string) {
    if (!this.jokersUsed.includes(type)) {
      this.jokersUsed.push(type);
    }
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
    let wrongAnswers = this.currentSkill.answers.filter(a => !a.correct);
    if (wrongAnswers.length > 2) {
      wrongAnswers = this.shuffleArray(wrongAnswers).slice(0, 2);
    }
    this.currentSkill.answers.forEach((answer, index) => {
      if (wrongAnswers.includes(answer)) {
        gsap.to(`.answers button[data-index="${index}"]`, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            answer.hidden = true;
          },
        });
      }
    });
  }

  shuffleArray(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
  }

  useAudienceHelp() {
    if (!this.currentSkill || !this.currentSkill.answers) return;
    let totalVotes = 100;
    let correctAnswer = this.currentSkill.answers.find(a => a.correct);
    let otherAnswers = this.currentSkill.answers.filter(a => !a.correct);
    let correctVote = Math.floor(Math.random() * 40) + 50; // entre 50% et 90%
    totalVotes -= correctVote;
    let otherVotes = otherAnswers.map(() => Math.floor(totalVotes / otherAnswers.length));
    this.currentSkill.answers.forEach(answer => {
      if (answer.correct) {
        answer.votes = correctVote;
      } else {
        answer.votes = otherVotes.pop();
      }
    });
    this.showAudienceResults = true;
  }

  pauseTimer() {
    this.stopCountdown();
    setTimeout(() => {
      this.startCountdown();
    }, 5000);
  }

  playCorrectSound() {
    const audio = document.getElementById('correct-sound') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.7;
      audio.play().catch(err => console.error("Audio playback error:", err));
    }
  }

  playWrongSound() {
    const audio = document.getElementById('wrong-sound') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.7;
      audio.play().catch(err => console.error("Audio playback error:", err));
    }
  }

  goToNextSection() {
    // Navigation vers la section suivante (ajustez la route selon vos besoins)
    this.router.navigate(['/itineraire']);
  }
}
