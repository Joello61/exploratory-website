import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.typewriterEffect();
    this.initAmbianceSound();
    this.initMouseLightEffect();
  }

  commencerEnquete() {
    const container = document.querySelector('.accueil-container') as HTMLElement;
    container.classList.add('fade-out');
    setTimeout(() => {
      this.router.navigate(['/cv']);
    }, 1000); // Délai de 1 seconde pour la transition
  }

  typewriterEffect() {
    const text = "L'affaire la plus complexe de votre carrière vous attend. Les indices sont éparpillés, les mystères sont nombreux, et votre esprit est votre seul allié pour résoudre l'énigme qui se cache derrière un parcours fascinant et énigmatique... \n\n C'est vous le DETECTIVE, à vous de jouer ";
    let i = 0;
    let currentLine = '';
    const speed = 100;
    const maxWidth = 950;
    const typewriterTextContainer = document.getElementById('typewriter-text-container');
    const typewriterText = document.getElementById('typewriter-text');
  
    if (typewriterText && typewriterTextContainer) {
      const typing = setInterval(() => {
        currentLine += text.charAt(i);
        typewriterText.textContent = currentLine;
  
        if (typewriterText.offsetWidth > maxWidth) {
          currentLine += '\n'; 
          typewriterText.textContent = currentLine;
        }
  
        i++;
        if (i === text.length) {
          clearInterval(typing);
        }
      }, speed);
    }
  }

  initAmbianceSound() {
    const audio = document.getElementById('ambiance-sound') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.5; // Réduire le volume
      audio.play();
    }
  }

  initMouseLightEffect() {
    document.addEventListener('mousemove', (e) => {
      const lightEffect = document.querySelector('.light-effect') as HTMLElement;
      if (lightEffect) {
        lightEffect.style.setProperty('--x', `${e.clientX}px`);
        lightEffect.style.setProperty('--y', `${e.clientY}px`);
      }
    });
  }
}