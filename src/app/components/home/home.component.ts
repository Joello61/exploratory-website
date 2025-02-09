import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from 'gsap';


@Component({
  selector: 'app-home',
  standalone: true,
    imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Texte complet à afficher en mode machine à écrire
  private fullText: string = "L'affaire la plus complexe de votre carrière vous attend. Les indices sont éparpillés, les mystères sont nombreux, et votre esprit est votre seul allié pour résoudre l'énigme qui se cache derrière un parcours fascinant et énigmatique...\n\nC'est vous le DETECTIVE, à vous de jouer ";
  private currentTextIndex: number = 0;
  private typingSpeed: number = 50; // Vitesse en ms par caractère

  constructor(private router: Router, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.initAmbianceSound();
    this.initMouseLightEffect();
  }

  ngAfterViewInit(): void {
    this.startTypewriterEffect();
  }

  startTypewriterEffect(): void {
    const element = this.typewriterText.nativeElement;
    // Création d'un curseur clignotant
    const cursor = this.renderer.createElement('span');
    this.renderer.addClass(cursor, 'cursor');
    this.renderer.appendChild(element.parentNode, cursor);

    this.typeNextCharacter(element, cursor);
  }

  typeNextCharacter(element: HTMLElement, cursor: HTMLElement): void {
    if (this.currentTextIndex < this.fullText.length) {
      element.textContent += this.fullText.charAt(this.currentTextIndex);
      this.currentTextIndex++;
      setTimeout(() => this.typeNextCharacter(element, cursor), this.typingSpeed);
    } else {
      // Fin de l'animation du texte : on retire le curseur et on lance une animation de révélation du contenu principal
      this.renderer.removeChild(element.parentNode, cursor);
      gsap.to('.content', { opacity: 1, duration: 1, delay: 0.3 });
    }
  }

  initAmbianceSound(): void {
    const audio = document.getElementById('ambiance-sound') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch(err => console.error("Audio playback error:", err));
    }
  }

  initMouseLightEffect(): void {
    document.addEventListener('mousemove', (e) => {
      const lightEffect = document.querySelector('.light-effect') as HTMLElement;
      if (lightEffect) {
        lightEffect.style.setProperty('--x', `${e.clientX}px`);
        lightEffect.style.setProperty('--y', `${e.clientY}px`);
      }
    });
  }

  // Utilisation de GSAP pour une transition fluide vers la page suivante
  commencerEnquete(): void {
    gsap.to('.accueil-container', {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        this.router.navigate(['/cv']);
      }
    });
  }
}