import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Skill {
  name: string;
  description: string;
  category: string;
  isUnlocked: boolean;
}

@Component({
  selector: 'app-competences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competences.component.html',
  styleUrl: './competences.component.css'
})
export class CompetencesComponent {
  skills: Skill[] = [];
  categories: string[] = [];
  unlockedCount: number = 0;
  currentClue: string | null = null;

  ngOnInit() {
    this.initializeSkills();
  }

  initializeSkills() {
    this.skills = [
      { name: 'Angular', description: 'Développement avec Angular', category: 'Techniques', isUnlocked: false },
      { name: 'Python', description: 'Langage Python pour l\'analyse', category: 'Techniques', isUnlocked: false },
      { name: 'Leadership', description: 'Gestion d\'équipes', category: 'Soft Skills', isUnlocked: false },
      { name: 'Communication', description: 'Compétence en communication efficace', category: 'Soft Skills', isUnlocked: false },
    ];
    this.categories = [...new Set(this.skills.map(skill => skill.category))];
  }

  unlockSkill(skill: Skill) {
    if (!skill.isUnlocked) {
      skill.isUnlocked = true;
      this.unlockedCount++;
      this.setClue();
    }
  }

  setClue() {
    const clues = [
      "Un indice trouvé : La clé de l'enquête est cachée dans les compétences techniques.",
      "Piste suivante : La communication est un atout essentiel dans cette enquête.",
      "Il est temps de prendre les rênes du projet, votre leadership est nécessaire."
    ];
    this.currentClue = clues[this.unlockedCount - 1] || null;
  }

  allSkillsUnlocked(): boolean {
    return this.skills.every(skill => skill.isUnlocked);
  }

  getSkillsByCategory(category: string): Skill[] {
    return this.skills.filter(skill => skill.category === category);
  }
}
