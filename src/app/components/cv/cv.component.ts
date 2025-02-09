import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { gsap } from 'gsap';

interface CvPiece {
  image: string;
  correctIndex: number;
  currentIndex: number;
  isCorrect: boolean;
}

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css']
})
export class CvComponent implements OnInit {
  cvPieces: CvPiece[] = [];
  currentOrder: number[] = [];
  draggedPieceIndex: number | null = null;
  isCompleted: boolean = false;
  showPuzzleSection: boolean = true;
  confettis: any[] = [];
  elapsedTime: number = 0;
  private timerInterval: any;

  cvFileUrl: string = 'doc/cv.pdf';

  @ViewChildren('puzzleItem', { read: ElementRef }) puzzleItems!: QueryList<ElementRef>;

  ngOnInit() {
    this.initializePuzzle();
    this.startTimer();
    this.generateConfettis();
  }

  initializePuzzle() {
    const pieces = [
      { image: 'img/cv_puzzle/P1.jpg', correctIndex: 0 },
      { image: 'img/cv_puzzle/P2.jpg', correctIndex: 1 },
      { image: 'img/cv_puzzle/P3.jpg', correctIndex: 2 },
      { image: 'img/cv_puzzle/P4.jpg', correctIndex: 3 },
      { image: 'img/cv_puzzle/P5.jpg', correctIndex: 4 },
      { image: 'img/cv_puzzle/P6.jpg', correctIndex: 5 },
      { image: 'img/cv_puzzle/P7.jpg', correctIndex: 6 },
      { image: 'img/cv_puzzle/P8.jpg', correctIndex: 7 },
      { image: 'img/cv_puzzle/P9.jpg', correctIndex: 8 },
    ];

    // Mélange aléatoire des indices
    this.currentOrder = Array.from({ length: pieces.length }, (_, i) => i).sort(() => Math.random() - 0.5);
    this.cvPieces = this.currentOrder.map((index, currentIndex) => ({
      ...pieces[index],
      currentIndex,
      isCorrect: false
    }));

    this.updatePieceStatus();
  }

  dragStart(index: number) {
    this.draggedPieceIndex = index;
    // Animation de mise en relief de la pièce sélectionnée
    const item = this.getPuzzleItemElement(index);
    if (item) {
      gsap.to(item, { scale: 1.1, duration: 0.2 });
    }
  }

  drop(index: number) {
    if (this.draggedPieceIndex !== null && this.draggedPieceIndex !== index) {
      this.swapPieces(this.draggedPieceIndex, index);
      // Animation de "rebond" lors du lâcher
      const item = this.getPuzzleItemElement(index);
      if (item) {
        gsap.to(item, { scale: 1, duration: 0.2, ease: "bounce.out" });
      }
      this.draggedPieceIndex = null;
    }
  }

  allowDrop(event: Event) {
    event.preventDefault();
  }

  swapPieces(index1: number, index2: number) {
    // Échange des données
    const temp = this.cvPieces[index1].currentIndex;
    this.cvPieces[index1].currentIndex = this.cvPieces[index2].currentIndex;
    this.cvPieces[index2].currentIndex = temp;

    const tempPiece = this.cvPieces[index1];
    this.cvPieces[index1] = this.cvPieces[index2];
    this.cvPieces[index2] = tempPiece;

    // Animation de feedback pour les pièces échangées
    const elem1 = this.getPuzzleItemElement(index1);
    const elem2 = this.getPuzzleItemElement(index2);

    if (elem1 && elem2) {
      gsap.fromTo([elem1, elem2], { scale: 0.8 }, { scale: 1, duration: 0.4, ease: "power2.out" });
    }

    this.updatePieceStatus();
  }

  updatePieceStatus() {
    this.cvPieces.forEach(piece => {
      piece.isCorrect = piece.currentIndex === piece.correctIndex;
    });

    const puzzleIsCorrect = this.cvPieces.every(piece => piece.isCorrect);
    if (puzzleIsCorrect && !this.isCompleted) {
      // On ne passe en mode "complété" qu'une seule fois
      clearInterval(this.timerInterval);
      // Animation de disparition de la section puzzle
      gsap.to('.puzzle-section', {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          // Une fois l'animation terminée, on masque la section puzzle
          this.showPuzzleSection = false;
          this.isCompleted = true;
          // Animation d'apparition de la section complétée
          gsap.fromTo(
            '.completed-section',
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)" }
          );
        }
      });
      // Lecture du son de félicitations
      this.playSuccessSound();
    }
  }
  

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.elapsedTime++;
    }, 1000);
  }

  generateConfettis() {
    const colors = ['#ffcc00', '#ff6666', '#66ccff', '#99ff99', '#cc99ff'];
    this.confettis = Array.from({ length: 100 }, () => ({
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)]
      }
    }));
  }

  getPuzzleItemElement(index: number): HTMLElement | null {
    // Récupération de l'élément DOM correspondant à la pièce via ViewChildren
    const item = this.puzzleItems.toArray()[index];
    return item ? item.nativeElement : null;
  }

  playSuccessSound() {
    const audio = document.getElementById('success-sound') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.7;
      audio.play().catch(err => console.error("Audio playback error:", err));
    }
  }
}
