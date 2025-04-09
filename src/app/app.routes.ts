import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CompetencesComponent } from './components/competences/competences.component';
import { CentresInteretComponent } from './components/centres-interet/centres-interet.component';
import { PersonnaliteComponent } from './components/personnalite/personnalite.component';
import { AttentesComponent } from './components/attentes/attentes.component';
import { ItineraireComponent } from './components/itineraire/itineraire.component';
import { MotivationSocioProComponent } from './components/motivation-socio-pro/motivation-socio-pro.component';
import { ExperienceProComponent } from './components/experience-pro/experience-pro.component';
import { ConclusionComponent } from './components/conclusion/conclusion.component';
import { MenuComponent } from './components/menu/menu.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'menu', component: MenuComponent },
    { path: 'competences', component: CompetencesComponent },
    { path: 'personnalite', component: PersonnaliteComponent },
    { path: 'centres', component: CentresInteretComponent },
    { path: 'attentes', component: AttentesComponent },
    { path: 'itineraire', component: ItineraireComponent},
    { path: 'experience', component: ExperienceProComponent},
    /*{ path: 'motivations', component: MotivationSocioProComponent},*/
    {path: 'conclusion', component: ConclusionComponent}
  ];
