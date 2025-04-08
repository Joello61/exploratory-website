import { PrioritizationItem } from "../../models/attentes/prioritization-time";

export const PRIORITIZATIONITEMSDATA: PrioritizationItem[] = [
    {
      id: 'expertise_fullstack',
      title: 'Expertise Full Stack',
      description:
        "Maîtriser les technologies front-end (Vue.js, Angular) et back-end (Spring Boot, Symfony) ainsi que l'intégration 3D",
      icon: 'bi-code-slash',
      correctRank: 0,
    },
    {
      id: 'reussite_alternance',
      title: 'Réussite en Alternance',
      description:
        "Équilibrer formation académique à l'Université de Toulouse Jean Jaurès et missions professionnelles",
      icon: 'bi-book',
      correctRank: 1,
    },
    {
      id: 'projets_techniques',
      title: 'Projets Techniques Complets',
      description:
        "Développer des applications web/mobile complètes avec intégration d'API et expérience 3D",
      icon: 'bi-layers',
      correctRank: 2,
    },
    {
      id: 'competences_devops',
      title: 'Compétences DevOps',
      description:
        'Renforcer les connaissances en Docker, CI/CD et bonnes pratiques de développement',
      icon: 'bi-gear',
      correctRank: 3,
    },
    {
      id: 'preparation_carriere',
      title: 'Préparation à la Carrière',
      description:
        'Développer les bases solides pour évoluer vers des rôles techniques avancés après le Master',
      icon: 'bi-graph-up',
      correctRank: 4,
    },
  ]