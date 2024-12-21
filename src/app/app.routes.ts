import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CvComponent } from './components/cv/cv.component';
import { CompetencesComponent } from './components/competences/competences.component';
import { CentresInteretComponent } from './components/centres-interet/centres-interet.component';
import { PersonnaliteComponent } from './components/personnalite/personnalite.component';
import { AttentesComponent } from './components/attentes/attentes.component';
import { ItineraireComponent } from './components/itineraire/itineraire.component';
import { MotivationSocioProComponent } from './components/motivation-socio-pro/motivation-socio-pro.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'cv', component: CvComponent },
    { path: 'competences', component: CompetencesComponent },
    { path: 'traits', component: PersonnaliteComponent },
    { path: 'centres', component: CentresInteretComponent },
    { path: 'attentes', component: AttentesComponent },
    {path: 'itinéraire', component: ItineraireComponent},
    { path: 'motivations', component: MotivationSocioProComponent}
  ];
