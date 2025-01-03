import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  constructor() { }

  authSound: boolean = true

  toggleSound(){
    this.authSound = !this.authSound;
  }
}
