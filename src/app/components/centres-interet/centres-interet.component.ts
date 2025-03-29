import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DialogService, DialogMessage } from '../../services/dialog.service';
import { NoteService } from '../../services/note.service';
import { ProgressService } from '../../services/progress.service';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { UserDataService } from '../../services/user-data.service';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Evidence {
  id: string;
  name: string;
  icon: string;
  description: string;
  discovered: boolean;
  unlocksInterests: string[];
}

interface InterestCategory {
  id: string;
  name: string;
  icon: string;
  requiredEvidences: number;
}

interface RelatedImage {
  url?: string;
  caption: string;
}

interface Interest {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  since?: string;
  frequency?: string;
  skillsRelated?: string[];
  relatedImages?: RelatedImage[];
  highlight?: string;
  requiredEvidence: string;
}

@Component({
  selector: 'app-centres-interet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centres-interet.component.html',
  styleUrls: ['./centres-interet.component.css'],
})
export class CentresInteretComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('typewriterText') typewriterText!: ElementRef;

  // Texte du dialogue d'introduction
  private fullText: string =
    "Agent, pour compléter le profil de notre sujet, nous devons analyser ses centres d'intérêt personnels. Ces activités hors travail peuvent révéler des aspects clés de sa personnalité, ses motivations et ses compétences transversales. Recueillez des indices et explorez chaque domaine en profondeur.";
  private subscriptions: Subscription[] = [];

  // Données de progression et de temps
  elapsedTime: string = '00:00:00';
  isModuleCompleted: boolean = false;
  moduleProgressPercentage: number = 0;

  // État du dialogue
  isDialogOpen: boolean = true;
  isTyping: boolean = false;
  dialogMessage: DialogMessage | null = null;

  // État de la photo polaroid
  isPhotoFlipped: boolean = false;

  // État des modals
  showEvidenceModal: boolean = false;
  currentEvidence: Evidence | null = null;

  // État des filtres et de la navigation
  showUndiscoveredInterests: boolean = false;
  selectedCategory: string | null = null;
  currentInterestIndex: number = 0;

  showQuizModal: boolean = false;
  quizStarted: boolean = false;
  currentQuizQuestion: number = 0;
  selectedAnswer: number | null = null;
  quizScore: number = 0;
  quizPassed: boolean = false;

  // Indices à découvrir
  evidenceItems: Evidence[] = [
    {
      id: 'evidence-tech',
      name: 'Abonnements à des newsletters tech',
      icon: 'bi-envelope-paper',
      description:
        "Plusieurs abonnements à des newsletters techniques spécialisées ont été découverts, révélant un intérêt constant pour l'actualité technologique et les tendances émergentes.",
      discovered: false,
      unlocksInterests: ['programming', 'tech-watch'],
    },
    {
      id: 'evidence-books',
      name: 'Collection de livres technique',
      icon: 'bi-book',
      description:
        "Une vaste collection de livres techniques et de développement personnel a été trouvée, démontrant un engagement dans l'apprentissage continu et le perfectionnement de compétences diverses.",
      discovered: false,
      unlocksInterests: ['reading', 'learning'],
    },
    {
      id: 'evidence-running',
      name: 'Participation à des courses',
      icon: 'bi-stopwatch',
      description:
        'Des dossards et médailles de courses à pied ont été retrouvés, indiquant une pratique régulière de la course à pied et une participation à des événements sportifs.',
      discovered: false,
      unlocksInterests: ['running', 'fitness'],
    },
    {
      id: 'evidence-cooking',
      name: 'Ustensiles de cuisine spécialisés',
      icon: 'bi-knife',
      description:
        "Un ensemble d'ustensiles de cuisine de qualité professionnelle et des ingrédients rares ont été découverts, suggérant une passion pour la gastronomie et la cuisine expérimentale.",
      discovered: false,
      unlocksInterests: ['cooking', 'gastronomy'],
    },
    {
      id: 'evidence-travel',
      name: 'Collection de souvenirs internationaux',
      icon: 'bi-airplane',
      description:
        'De nombreux souvenirs de différents pays et cultures ont été retrouvés, révélant un goût prononcé pour les voyages et la découverte de nouvelles cultures.',
      discovered: false,
      unlocksInterests: ['travel', 'photography'],
    },
    {
      id: 'evidence-music',
      name: 'Équipement audio haut de gamme',
      icon: 'bi-music-note-beamed',
      description:
        "Un système audio sophistiqué et une collection éclectique de musique ont été identifiés, démontrant une passion pour l'écoute musicale de qualité.",
      discovered: false,
      unlocksInterests: ['music', 'concerts'],
    },
    {
      id: 'evidence-gaming',
      name: 'Consoles et collection de jeux',
      icon: 'bi-controller',
      description:
        'Plusieurs consoles de jeux et une importante bibliothèque de jeux vidéo ont été retrouvées, révélant un intérêt pour le gaming et la culture vidéoludique.',
      discovered: false,
      unlocksInterests: ['gaming', 'esports'],
    },
    {
      id: 'evidence-nature',
      name: 'Équipement de randonnée',
      icon: 'bi-tree',
      description:
        "Du matériel de randonnée et de camping de qualité a été découvert, indiquant un attrait pour les activités de plein air et l'exploration de la nature.",
      discovered: false,
      unlocksInterests: ['hiking', 'nature'],
    },
  ];

  // Catégories d'intérêts
  interestCategories: InterestCategory[] = [
    {
      id: 'tech',
      name: 'Technologie & Innovation',
      icon: 'bi-cpu',
      requiredEvidences: 1,
    },
    {
      id: 'culture',
      name: 'Culture & Apprentissage',
      icon: 'bi-book',
      requiredEvidences: 1,
    },
    {
      id: 'outdoor',
      name: 'Activités de plein air',
      icon: 'bi-tree',
      requiredEvidences: 2,
    },
    {
      id: 'lifestyle',
      name: 'Art de vivre',
      icon: 'bi-cup-hot',
      requiredEvidences: 2,
    },
    {
      id: 'entertainment',
      name: 'Divertissement',
      icon: 'bi-controller',
      requiredEvidences: 2,
    },
  ];

  // Centres d'intérêt détaillés
  interests: Interest[] = [
    // Technologie & Innovation
    {
      id: 'programming',
      name: 'Programmation créative',
      icon: 'bi-code-slash',
      category: 'tech',
      description:
        "Exploration de projets personnels de programmation, allant des applications web aux scripts d'automatisation, en passant par des expérimentations avec des technologies émergentes.",
      since: '2015',
      frequency: 'Plusieurs heures par semaine',
      skillsRelated: [
        'Problem Solving',
        'Architecture Logicielle',
        'Créativité Technique',
      ],
      highlight:
        'A contribué à plusieurs projets open source et partage régulièrement des outils et solutions sur GitHub.',
      requiredEvidence: 'evidence-tech',
    },
    {
      id: 'tech-watch',
      name: 'Veille technologique',
      icon: 'bi-radar',
      category: 'tech',
      description:
        'Suivi régulier des tendances, innovations et évolutions du monde technologique à travers des newsletters spécialisées, conférences en ligne et communautés professionnelles.',
      frequency: 'Quotidienne',
      skillsRelated: [
        'Analyse de tendances',
        'Curiosité intellectuelle',
        'Adaptabilité',
      ],
      relatedImages: [
        { caption: 'Conférence tech 2023' },
        { caption: 'Meetup développeurs' },
      ],
      requiredEvidence: 'evidence-tech',
    },

    // Culture & Apprentissage
    {
      id: 'reading',
      name: 'Lecture technique et fiction',
      icon: 'bi-journal-richtext',
      category: 'culture',
      description:
        "Lecteur avide combinant ouvrages techniques pour le développement professionnel et littérature de fiction (science-fiction, thrillers) pour le plaisir et l'évasion.",
      frequency: 'Quotidienne',
      skillsRelated: [
        'Acquisition de connaissances',
        'Pensée critique',
        'Créativité',
      ],
      relatedImages: [
        { caption: 'Bibliothèque personnelle' },
        { caption: 'Dernières lectures' },
      ],
      highlight:
        'Participe activement à un club de lecture mensuel et maintient une liste de lecture constamment mise à jour.',
      requiredEvidence: 'evidence-books',
    },
    {
      id: 'learning',
      name: 'Apprentissage continu',
      icon: 'bi-mortarboard',
      category: 'culture',
      description:
        "Engagement dans un processus d'apprentissage permanent à travers des cours en ligne, webinaires, et certifications professionnelles dans divers domaines connexes à l'informatique.",
      since: '2017',
      frequency: 'Plusieurs heures par semaine',
      skillsRelated: ['Auto-formation', 'Discipline', 'Adaptabilité'],
      requiredEvidence: 'evidence-books',
    },

    // Activités de plein air
    {
      id: 'running',
      name: 'Course à pied',
      icon: 'bi-lightning',
      category: 'outdoor',
      description:
        'Pratique régulière de la course à pied avec participation à plusieurs événements sportifs comme des semi-marathons et courses urbaines.',
      since: '2019',
      frequency: '3-4 sessions par semaine',
      skillsRelated: ['Endurance', 'Persévérance', 'Gestion du stress'],
      relatedImages: [
        { caption: 'Semi-marathon 2022' },
        { caption: 'Course urbaine nocturne' },
      ],
      highlight:
        "A établi un record personnel de 1h45 au semi-marathon et continue de s'améliorer progressivement.",
      requiredEvidence: 'evidence-running',
    },
    {
      id: 'hiking',
      name: 'Randonnée et exploration',
      icon: 'bi-map',
      category: 'outdoor',
      description:
        "Amateur de randonnées en montagne et d'exploration de nouveaux sentiers, avec un intérêt particulier pour les paysages naturels préservés et la photographie de nature.",
      frequency: 'Mensuelle, intensifiée pendant les vacances',
      skillsRelated: [
        'Planification',
        'Orientation',
        'Appréciation de la nature',
      ],
      relatedImages: [
        { caption: 'Randonnée en montagne' },
        { caption: 'Sentier côtier' },
      ],
      requiredEvidence: 'evidence-nature',
    },
    {
      id: 'nature',
      name: 'Observation de la nature',
      icon: 'bi-binoculars',
      category: 'outdoor',
      description:
        "Intérêt pour l'observation de la faune et la flore locales, avec une attention particulière à la biodiversité et aux écosystèmes naturels.",
      frequency: 'Régulière',
      skillsRelated: [
        'Patience',
        'Attention aux détails',
        'Conscience environnementale',
      ],
      requiredEvidence: 'evidence-nature',
    },

    // Art de vivre
    {
      id: 'cooking',
      name: 'Cuisine expérimentale',
      icon: 'bi-egg-fried',
      category: 'lifestyle',
      description:
        "Passion pour la cuisine créative et l'expérimentation culinaire, avec un intérêt particulier pour les techniques modernes et les fusions de cuisines internationales.",
      since: '2018',
      frequency: 'Plusieurs fois par semaine',
      skillsRelated: ['Créativité', 'Précision', 'Adaptation'],
      relatedImages: [
        { caption: 'Plat fusion asiatique' },
        { caption: 'Dessert moléculaire' },
      ],
      highlight:
        "A participé à un atelier de cuisine avec un chef étoilé et continue d'explorer de nouvelles techniques culinaires.",
      requiredEvidence: 'evidence-cooking',
    },
    {
      id: 'gastronomy',
      name: 'Découverte gastronomique',
      icon: 'bi-cup-straw',
      category: 'lifestyle',
      description:
        'Exploration de nouvelles cuisines, restaurants et produits gastronomiques, avec un intérêt pour les accords mets et vins et les traditions culinaires régionales.',
      frequency: 'Bimensuelle',
      skillsRelated: [
        'Sens du goût développé',
        'Ouverture culturelle',
        'Connaissance des produits',
      ],
      requiredEvidence: 'evidence-cooking',
    },
    {
      id: 'travel',
      name: 'Voyages culturels',
      icon: 'bi-globe',
      category: 'lifestyle',
      description:
        "Passion pour la découverte de nouvelles cultures, traditions et gastronomies à travers des voyages ciblés sur l'immersion culturelle plutôt que le tourisme de masse.",
      since: '2010',
      frequency: '2-3 voyages significatifs par an',
      skillsRelated: [
        'Adaptabilité culturelle',
        'Communication interculturelle',
        'Organisation',
      ],
      relatedImages: [
        { caption: 'Marché local en Asie' },
        { caption: 'Architecture européenne' },
      ],
      highlight:
        'A visité plus de 20 pays sur 4 continents, avec une préférence pour les expériences authentiques et les rencontres locales.',
      requiredEvidence: 'evidence-travel',
    },

    // Divertissement
    {
      id: 'music',
      name: 'Musique & Concerts',
      icon: 'bi-music-note-list',
      category: 'entertainment',
      description:
        'Passionné de musique avec des goûts éclectiques allant du rock alternatif à la musique électronique, avec une attention particulière à la qualité du son et aux performances live.',
      frequency: '5-10 concerts par an',
      skillsRelated: [
        'Appréciation artistique',
        'Connaissance musicale',
        'Ouverture culturelle',
      ],
      relatedImages: [
        { caption: "Festival d'été 2023" },
        { caption: 'Concert indie rock' },
      ],
      requiredEvidence: 'evidence-music',
    },
    {
      id: 'gaming',
      name: 'Jeux vidéo narratifs',
      icon: 'bi-controller',
      category: 'entertainment',
      description:
        "Amateur de jeux vidéo avec une préférence pour les titres à forte composante narrative ou stratégique, appréciant particulièrement les RPG, jeux d'aventure et jeux indépendants innovants.",
      since: '2000',
      frequency: 'Quelques heures par semaine',
      skillsRelated: [
        'Résolution de problèmes',
        'Pensée stratégique',
        'Appréciation narrative',
      ],
      highlight:
        "Suit activement l'évolution artistique et technologique du medium vidéoludique comme forme d'expression culturelle.",
      requiredEvidence: 'evidence-gaming',
    },
    {
      id: 'photography',
      name: 'Photographie de voyage',
      icon: 'bi-camera',
      category: 'entertainment',
      description:
        "Pratique de la photographie lors des voyages et randonnées, avec un focus sur les paysages, l'architecture et la capture de moments culturels authentiques.",
      frequency: 'Lors des voyages et sorties',
      skillsRelated: [
        'Composition visuelle',
        'Attention aux détails',
        'Patience',
      ],
      relatedImages: [
        { caption: 'Coucher de soleil en montagne' },
        { caption: 'Scène de rue urbaine' },
      ],
      requiredEvidence: 'evidence-travel',
    },
    {
      id: 'esports',
      name: 'Suivi des compétitions e-sport',
      icon: 'bi-trophy',
      category: 'entertainment',
      description:
        "Intérêt pour les compétitions professionnelles de jeux vidéo, particulièrement dans les genres stratégiques et les jeux d'équipe, avec suivi des tournois majeurs.",
      frequency: 'Hebdomadaire, intensifié pendant les grands tournois',
      skillsRelated: [
        'Analyse stratégique',
        "Compréhension des dynamiques d'équipe",
        'Anticipation',
      ],
      requiredEvidence: 'evidence-gaming',
    },
  ];

  quizQuestions: QuizQuestion[] = [
    {
      question: "Quel centre d'intérêt est lié à la programmation créative?",
      options: [
        "Activités de plein air",
        "Technologie & Innovation",
        "Art de vivre",
        "Culture & Apprentissage"
      ],
      correctAnswer: 1
    },
    {
      question: "Depuis quand le sujet pratique-t-il la course à pied?",
      options: [
        "2015",
        "2018",
        "2019",
        "2010"
      ],
      correctAnswer: 2
    },
    {
      question: "Quel est le centre d'intérêt lié à l'observation de la nature?",
      options: [
        "Randonnée et exploration",
        "Course à pied",
        "Photographie de voyage",
        "Observation de la nature"
      ],
      correctAnswer: 3
    },
    {
      question: "Combien de pays le sujet a-t-il visité selon les informations disponibles?",
      options: [
        "Plus de 5",
        "Plus de 10",
        "Plus de 20",
        "Cette information n'est pas mentionnée"
      ],
      correctAnswer: 2
    },
    {
      question: "Quel indice révèle un intérêt pour la cuisine?",
      options: [
        "Collection de souvenirs internationaux",
        "Équipement audio haut de gamme",
        "Ustensiles de cuisine spécialisés",
        "Abonnements à des newsletters tech"
      ],
      correctAnswer: 2
    }
  ];

  constructor(
    private progressService: ProgressService,
    private timeTrackerService: TimeTrackerService,
    private userDataService: UserDataService,
    private dialogService: DialogService,
    private noteService: NoteService
  ) {}

  ngOnInit() {
    // Vérifier si le module est disponible
    if (!this.progressService.isModuleAvailable('centres')) {
      console.warn("Ce module n'est pas encore disponible");
      // Logique de redirection à implémenter si nécessaire
    }

    // S'abonner au temps écoulé
    this.subscriptions.push(
      this.timeTrackerService.elapsedTime$.subscribe((time) => {
        this.elapsedTime = time;
      })
    );

    // Vérifier si le module est déjà complété
    this.subscriptions.push(
      this.progressService.moduleStatuses$.subscribe((statuses) => {
        this.isModuleCompleted = statuses.centres;
        this.moduleProgressPercentage =
          this.progressService.getCompletionPercentage();

        // Si le module est déjà complété, on peut pré-charger les réponses utilisateur
        if (this.isModuleCompleted) {
          this.loadSavedState();
        }
      })
    );

    this.subscriptions.push(
      this.dialogService.isDialogOpen$.subscribe((isOpen) => {
        this.isDialogOpen = isOpen;
      }),
      this.dialogService.isTyping$.subscribe((isTyping) => {
        this.isTyping = isTyping;
      }),
      this.dialogService.currentMessage$.subscribe((message) => {
        this.dialogMessage = message;
      })
    );
  }

  ngAfterViewInit(): void {
    // Utiliser le DialogService au lieu du typewriter manuel
    setTimeout(() => {
      this.showIntroDialog();
    }, 500);
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions pour éviter les fuites de mémoire
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  showIntroDialog(): void {
    const dialogMessage: DialogMessage = {
      text: '', // Commencer avec un texte vide pour l'effet de machine à écrire
      character: 'detective',
    };
    this.dialogService.openDialog(dialogMessage);
    this.dialogService.startTypewriter(this.fullText);
  }

  // Fermer le dialogue
  closeDialogTypeWriter(): void {
    this.dialogService.closeDialog();
  }

  // Charger l'état sauvegardé précédemment
  loadSavedState(): void {
    const responses = this.userDataService.getModuleResponses('centres');

    if (responses.length > 0) {
      // Charger l'état des indices découverts
      const evidenceResponse = responses.find(
        (r) => r.questionId === 'evidence_discovered'
      );
      if (evidenceResponse && Array.isArray(evidenceResponse.response)) {
        const discoveredIds = evidenceResponse.response as string[];
        this.evidenceItems.forEach((item) => {
          item.discovered = discoveredIds.includes(item.id);
        });
      }

      // Charger la catégorie sélectionnée
      const categoryResponse = responses.find(
        (r) => r.questionId === 'selected_category'
      );
      if (categoryResponse && typeof categoryResponse.response === 'string') {
        this.selectedCategory = categoryResponse.response;
      }

      // Autres états si nécessaire (photo flippée, etc.)
      const photoFlippedResponse = responses.find(
        (r) => r.questionId === 'photo_flipped'
      );
      if (
        photoFlippedResponse &&
        typeof photoFlippedResponse.response === 'boolean'
      ) {
        this.isPhotoFlipped = photoFlippedResponse.response;
      }
    }
  }

  // Sauvegarder l'état actuel
  saveState(): void {
    // Sauvegarder les indices découverts
    const discoveredIds = this.evidenceItems
      .filter((item) => item.discovered)
      .map((item) => item.id);

    this.userDataService.saveResponse(
      'centres',
      'evidence_discovered',
      discoveredIds
    );

    // Sauvegarder la catégorie sélectionnée
    if (this.selectedCategory) {
      this.userDataService.saveResponse(
        'centres',
        'selected_category',
        this.selectedCategory
      );
    }

    // Sauvegarder l'état de la photo
    this.userDataService.saveResponse(
      'centres',
      'photo_flipped',
      this.isPhotoFlipped
    );

    // Vérifier si le module peut être complété
    this.checkModuleCompletion();
  }

  // Vérifier si les conditions de complétion du module sont remplies
  checkModuleCompletion(): void {
    // Par exemple, si tous les indices sont découverts ou si un nombre suffisant est découvert
    const allDiscovered = this.evidenceItems.every((item) => item.discovered);
    const discoveredCount = this.getDiscoveredCount();

    // Ou un seuil minimum (par exemple 75%)
    const discoveryThreshold = Math.ceil(this.evidenceItems.length * 0.75);

    if (
      (allDiscovered || discoveredCount >= discoveryThreshold) &&
      !this.isModuleCompleted
    ) {
      this.completeModule();
    }
  }

  // Marquer le module comme complété
  completeModule(): void {
    this.progressService.completeModule('centres');
    this.isModuleCompleted = true;

    // Ajouter une note automatique pour résumer ce qui a été fait
    this.addCompletionNote();
  }

  // Ajouter une note récapitulative automatique
  addCompletionNote(): void {
    const discoveredCount = this.getDiscoveredCount();
    const totalCount = this.evidenceItems.length;

    // Récupérer les catégories débloquées
    const unlockedCategories = this.interestCategories
      .filter((cat) => this.isCategoryUnlocked(cat.id))
      .map((cat) => cat.name)
      .join(', ');

    // Récupérer quelques centres d'intérêt clés découverts
    const keyInterests = this.interests
      .filter((int) => this.isInterestDiscovered(int.id))
      .slice(0, 3)
      .map((int) => int.name)
      .join(', ');

    const noteContent = `
Module "Centres d'intérêt" complété le ${new Date().toLocaleDateString()}.
${discoveredCount}/${totalCount} indices découverts.
Catégories débloquées: ${unlockedCategories}.
Principaux centres d'intérêt: ${keyInterests} et autres.
    `;

    this.noteService.addNote(noteContent.trim());
  }

  // Fonction pour retourner la photo polaroid
  flipPhoto(): void {
    this.isPhotoFlipped = !this.isPhotoFlipped;
    // Sauvegarder l'état
    this.userDataService.saveResponse(
      'centres',
      'photo_flipped',
      this.isPhotoFlipped
    );
  }

  // Fonction pour découvrir un indice
  discoverEvidence(index: number): void {
    if (index < 0 || index >= this.evidenceItems.length) return;

    const evidence = this.evidenceItems[index];
    if (evidence.discovered) return;

    // Marquer l'indice comme découvert
    evidence.discovered = true;

    // Afficher le modal de découverte
    this.currentEvidence = evidence;
    this.showEvidenceModal = true;

    // Débloquer les intérêts associés
    this.unlockInterests(evidence.unlocksInterests);

    // Sauvegarder l'état
    this.saveState();
  }

  // Débloquer les intérêts associés à un indice
  unlockInterests(interestIds: string[]): void {
    // Sauvegarder les intérêts débloqués
    interestIds.forEach((id) => {
      this.userDataService.saveResponse(
        'centres',
        `interest_${id}_unlocked`,
        true
      );
    });
  }

  // Fermer le modal d'indice
  closeEvidenceModal(): void {
    this.showEvidenceModal = false;
    this.currentEvidence = null;

    // Vérifier si le module peut être complété après chaque découverte
    this.checkModuleCompletion();
  }

  // Fonctions utilitaires (conservées inchangées)
  getDiscoveredCount(): number {
    return this.evidenceItems.filter((evidence) => evidence.discovered).length;
  }

  getDiscoveredPercentage(): number {
    return (this.getDiscoveredCount() / this.evidenceItems.length) * 100;
  }

  isCategoryUnlocked(categoryId: string): boolean {
    const category = this.interestCategories.find(
      (cat) => cat.id === categoryId
    );
    if (!category) return false;

    // Nombre d'indices découverts liés à cette catégorie
    const categoryInterests = this.interests.filter(
      (interest) => interest.category === categoryId
    );
    const unlockedInterests = categoryInterests.filter((interest) =>
      this.isInterestDiscovered(interest.id)
    );

    return unlockedInterests.length >= category.requiredEvidences;
  }

  isInterestDiscovered(interestId: string): boolean {
    const interest = this.interests.find((int) => int.id === interestId);
    if (!interest) return false;

    // Vérifier si l'indice requis a été découvert
    const requiredEvidence = this.evidenceItems.find(
      (ev) => ev.id === interest.requiredEvidence
    );
    return requiredEvidence ? requiredEvidence.discovered : false;
  }

  // Sélectionner une catégorie pour affichage
  selectCategory(categoryId: string): void {
    if (!this.isCategoryUnlocked(categoryId)) return;

    this.selectedCategory = categoryId;
    this.currentInterestIndex = 0;

    // Sauvegarder la sélection
    this.userDataService.saveResponse(
      'centres',
      'selected_category',
      categoryId
    );
  }

  // Ouvrir le panneau de notes
  toggleNotes(): void {
    this.noteService.toggleNotesVisibility();
  }

  // Fermer la fenêtre d'analyse
  closeAnalysisWindow(): void {
    this.selectedCategory = null;
    // Sauvegarder l'état
    this.userDataService.saveResponse('centres', 'selected_category', '');
  }

  // Fonctions getter inchangées
  getSelectedCategoryName(): string {
    if (!this.selectedCategory) return '';

    const category = this.interestCategories.find(
      (cat) => cat.id === this.selectedCategory
    );
    return category ? category.name : '';
  }

  getSelectedCategoryIcon(): string {
    if (!this.selectedCategory) return '';

    const category = this.interestCategories.find(
      (cat) => cat.id === this.selectedCategory
    );
    return category ? category.icon : '';
  }

  getInterestsByCategory(): Interest[] {
    if (!this.selectedCategory) return [];

    return this.interests.filter(
      (interest) => interest.category === this.selectedCategory
    );
  }

  getInterestName(interestId: string): string {
    const interest = this.interests.find((int) => int.id === interestId);
    return interest ? interest.name : 'Intérêt inconnu';
  }

  // Navigation entre les intérêts
  showNextInterest(): void {
    const interests = this.getInterestsByCategory();
    if (this.currentInterestIndex < interests.length - 1) {
      this.currentInterestIndex++;
    }
  }

  showPreviousInterest(): void {
    if (this.currentInterestIndex > 0) {
      this.currentInterestIndex--;
    }
  }

  startQuiz(): void {
    this.showQuizModal = true;
    this.quizStarted = true;
    this.currentQuizQuestion = 0;
    this.selectedAnswer = null;
    this.quizScore = 0;
  }
  
  // Sélectionner une réponse au quiz
  selectQuizAnswer(index: number): void {
    this.selectedAnswer = index;
  }
  
  // Valider la réponse au quiz et passer à la question suivante
  submitQuizAnswer(): void {
    if (this.selectedAnswer === null) return;
    
    // Vérifier si la réponse est correcte
    if (this.selectedAnswer === this.quizQuestions[this.currentQuizQuestion].correctAnswer) {
      this.quizScore++;
    }
    
    // Passer à la question suivante ou terminer le quiz
    if (this.currentQuizQuestion < this.quizQuestions.length - 1) {
      this.currentQuizQuestion++;
      this.selectedAnswer = null;
    } else {
      this.completeQuiz();
    }
  }
  
  // Terminer le quiz et afficher les résultats
  completeQuiz(): void {
    const passScore = Math.ceil(this.quizQuestions.length * 0.7); // 70% pour réussir
    this.quizPassed = this.quizScore >= passScore;
    
    if (this.quizPassed) {
      // Marquer le module comme complété
      this.isModuleCompleted = true;
      this.progressService.completeModule('centres');
      
      // Ajouter une note automatique
      this.addCompletionNote();
    }
    
    // Sauvegarder le résultat du quiz
    this.userDataService.saveResponse(
      'centres',
      'quiz_passed',
      this.quizPassed
    );
    
    this.userDataService.saveResponse(
      'centres',
      'quiz_score',
      this.quizScore
    );
  }
  
  // Fermer le modal du quiz
  closeQuizModal(): void {
    this.showQuizModal = false;
    
    // Si le quiz a été réussi, afficher un message de félicitations
    if (this.quizPassed) {
      const message = "Félicitations ! Vous avez correctement analysé les centres d'intérêt du sujet. Vous avez maintenant accès à l'ensemble des données et pouvez passer au module suivant.";
      
      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective'
      };
      
      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);
    }
  }
  
  // Obtenir le score de passage pour le quiz (70%)
  getPassScore(): number {
    return Math.ceil(this.quizQuestions.length * 0.7);
  }
  
  // Naviguer vers le module suivant
  continueToNextModule(): void {
    if (this.isModuleCompleted) {
      // Afficher un message de confirmation
      const message = "Module d'analyse des centres d'intérêt complété. Vous pouvez maintenant passer au module suivant.";
      
      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective'
      };
      
      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);
      
      // Rediriger vers le prochain module après un court délai
      // Cette partie dépendra de votre implémentation de navigation
      setTimeout(() => {
        // Navigation au module suivant - à adapter selon votre système de routing
        // Par exemple : this.router.navigate(['/next-module']);
        
        // Fermeture du dialogue
        this.dialogService.closeDialog();
      }, 5000);
    } else if (this.getDiscoveredCount() >= Math.ceil(this.evidenceItems.length * 0.75)) {
      // Si suffisamment d'indices ont été découverts mais le quiz n'a pas été réussi
      this.startQuiz();
    } else {
      // Si pas assez d'indices ont été découverts
      const message = "Vous devez découvrir plus d'indices avant de pouvoir passer au module suivant.";
      
      const dialogMessage: DialogMessage = {
        text: message,
        character: 'detective'
      };
      
      this.dialogService.openDialog(dialogMessage);
      this.dialogService.startTypewriter(message);
    }
  }

  getPinDistance(index: number): number {
    const totalItems = this.evidenceItems.length;
    
    const baseDistance = 200;
    let variation = 0;
    if (index % 2 === 0) {
      variation = 30;
    } else {
      variation = -20;
    }
    
    const angleAdjustment = Math.sin((index * (360 / totalItems)) * (Math.PI / 180)) * 10;
    
    return baseDistance + variation + angleAdjustment;
  }

getResponseLetter(index: number): string {
  return String.fromCharCode(65 + index);
}
}
