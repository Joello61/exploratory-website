import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SoundService } from './services/sound.service';
import { ProgressionBarComponent } from "./components/progression-bar/progression-bar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProgressionBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  
  constructor(private soundService: SoundService){}
  
  
  ngOnInit(): void {
    
    if(this.soundService.authSound == false){
      const modal = document.getElementById('sound-modal');
      if (modal) {
        modal.classList.add('show');
      }
  
      // Bouton pour activer le son
      const enableSoundButton = document.getElementById('enable-sound-btn');
      enableSoundButton?.addEventListener('click', () => {
        this.playSound();
        this.soundService.toggleSound();
        modal?.classList.remove('show'); // Fermer la modale
      });
    }
  }
  
  title = 'exploratory-website';

  playSound() {
    const audio = new Audio();
    audio.src = "audio/song.mp3";
    audio.load();
    audio.play();
    audio.volume = 0.3;
    audio.loop = true;
  }
  


}
