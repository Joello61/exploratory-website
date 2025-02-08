import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

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
  styleUrl: './cv.component.css'
})
export class CvComponent implements OnInit {
  cvPieces: CvPiece[] = [];
  currentOrder: number[] = [];
  draggedPieceIndex: number | null = null;
  isCompleted: boolean = false;
  confettis: any[] = [];
  elapsedTime: number = 0;
  private timerInterval: any;

  cvFileUrl: string = 'doc/cv.pdf';

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
  }

  drop(index: number) {
    if (this.draggedPieceIndex !== null && this.draggedPieceIndex !== index) {
      this.swapPieces(this.draggedPieceIndex, index);
      this.draggedPieceIndex = null;
    }
  }

  allowDrop(event: Event) {
    event.preventDefault();
  }

  swapPieces(index1: number, index2: number) {
    const temp = this.cvPieces[index1].currentIndex;
    this.cvPieces[index1].currentIndex = this.cvPieces[index2].currentIndex;
    this.cvPieces[index2].currentIndex = temp;

    const tempPiece = this.cvPieces[index1];
    this.cvPieces[index1] = this.cvPieces[index2];
    this.cvPieces[index2] = tempPiece;

    this.updatePieceStatus();
  }

  updatePieceStatus() {
    this.cvPieces.forEach(piece => {
      piece.isCorrect = piece.currentIndex === piece.correctIndex;
    });

    this.isCompleted = this.cvPieces.every(piece => piece.isCorrect);
    if (this.isCompleted) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.elapsedTime++;
    }, 1000);
  }

  generateConfettis() {
    const colors = ['#ffcc00', '#ff6666', '#66ccff', '#99ff99', '#cc99ff'];
    this.confettis = Array.from({ length: 100 }, (_, i) => ({
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)]
      }
    }));
  }
}