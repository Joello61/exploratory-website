import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.typewriterEffect();
  }

  commencerEnquete() {
    this.router.navigate(['/cv']);
  }

  playSound() {
    const audio = new Audio();
    audio.src = "audio/song.mp3";
    audio.load();
    audio.play();
    audio.volume = 0.3
  }

  typewriterEffect() {
    const text = "L'affaire la plus complexe de votre carrière vous attend. Les indices sont éparpillés, les mystères sont nombreux, et votre esprit est votre seul allié pour résoudre l'énigme qui se cache derrière un parcours fascinant et énigmatique... \n\n C'est vous le DETECTIVE 🕵️, à vous de jouer ";
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
  

}
