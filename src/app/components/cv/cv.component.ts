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
  isCompleted: boolean = false; // Indique si le puzzle est terminé

  // Chemin du fichier CV à télécharger
  cvFileUrl: string = 'doc/cv.pdf';

  ngOnInit() {
    this.initializePuzzle();
  }

  // Initialiser le puzzle
  initializePuzzle() {
    const pieces = [
      { image: 'img/cv_puzzle/P1.png', correctIndex: 0 },
      { image: 'img/cv_puzzle/P2.png', correctIndex: 1 },
      { image: 'img/cv_puzzle/P3.png', correctIndex: 2 },
      { image: 'img/cv_puzzle/P4.png', correctIndex: 3 },
      { image: 'img/cv_puzzle/P5.png', correctIndex: 4 },
      { image: 'img/cv_puzzle/P6.png', correctIndex: 5 },
      { image: 'img/cv_puzzle/P7.png', correctIndex: 6 },
      { image: 'img/cv_puzzle/P8.png', correctIndex: 7 },
      { image: 'img/cv_puzzle/P9.png', correctIndex: 8 },
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

    // Vérifier si toutes les pièces sont correctes
    this.isCompleted = this.cvPieces.every(piece => piece.isCorrect);
  }
}
