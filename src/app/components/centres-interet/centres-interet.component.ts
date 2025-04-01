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
// Indices à découvrir adaptés au profil
evidenceItems: Evidence[] = [
  {
    id: 'evidence-tech',
    name: 'Abonnements à des newsletters tech',
    icon: 'bi-envelope-paper',
    description:
      "Plusieurs abonnements à des newsletters sur Vue.js, Angular et les technologies 3D Web ont été découverts, révélant un intérêt constant pour les frameworks frontend et les technologies que vous utilisez déjà.",
    discovered: false,
    unlocksInterests: ['frontend', 'tech-watch'],
  },
  {
    id: 'evidence-books',
    name: 'Collection de livres techniques',
    icon: 'bi-book',
    description:
      "Une collection de livres sur le développement Full Stack, Spring Boot et l'architecture API REST a été trouvée, démontrant votre engagement dans l'approfondissement de vos compétences techniques actuelles.",
    discovered: false,
    unlocksInterests: ['backend', 'architecture'],
  },
  {
    id: 'evidence-cooking',
    name: 'Ustensiles de cuisine spécialisés',
    icon: 'bi-egg-fried',
    description:
      "Un ensemble d'ustensiles de cuisine de qualité et des ingrédients pour la pâtisserie ont été découverts, en accord avec vos centres d'intérêt mentionnés dans votre CV.",
    discovered: false,
    unlocksInterests: ['cooking', 'pastry'],
  },
  {
    id: 'evidence-uni',
    name: 'Notes de cours et projets universitaires',
    icon: 'bi-mortarboard',
    description:
      "Des notes de cours bien organisées et des projets informatiques de votre Master à l'Université de Toulouse Jean Jaurès ont été retrouvés, témoignant de votre sérieux dans vos études.",
    discovered: false,
    unlocksInterests: ['academic', 'research'],
  },
  {
    id: 'evidence-music',
    name: 'Équipement audio et partitions',
    icon: 'bi-music-note-beamed',
    description:
      "Un microphone de qualité et des partitions de chant ont été identifiés, en lien avec votre intérêt pour le chant mentionné dans votre CV.",
    discovered: false,
    unlocksInterests: ['singing', 'music'],
  },
  {
    id: 'evidence-mobile',
    name: 'Applications mobiles en développement',
    icon: 'bi-phone',
    description:
      "Des prototypes d'applications mobiles et des notes de conception ont été trouvés, montrant votre intérêt pour étendre vos compétences web vers le développement mobile.",
    discovered: false,
    unlocksInterests: ['mobile-dev', 'ux-design'],
  },
  {
    id: 'evidence-cinema',
    name: 'Collection de films et analyses',
    icon: 'bi-film',
    description:
      "Une collection éclectique de films et des notes d'analyse cinématographique ont été découvertes, en accord avec votre centre d'intérêt pour le cinéma.",
    discovered: false,
    unlocksInterests: ['cinema', 'storytelling'],
  },
  {
    id: 'evidence-docs',
    name: 'Modèles de documentation technique',
    icon: 'bi-file-text',
    description:
      "Des modèles de documentation technique soigneusement élaborés ont été retrouvés, reflétant votre expérience en rédaction de documentation chez Arthur Ngaku.",
    discovered: false,
    unlocksInterests: ['technical-writing', 'knowledge-sharing'],
  },
];

  // Catégories d'intérêts
  interestCategories: InterestCategory[] = [
    {
      id: 'dev-fullstack',
      name: 'Développement Fullstack',
      icon: 'bi-code-slash',
      requiredEvidences: 1,
    },
    {
      id: 'mobile-3d',
      name: 'Mobile & Technologies 3D',
      icon: 'bi-phone',
      requiredEvidences: 1,
    },
    {
      id: 'education',
      name: 'Formation & Documentation',
      icon: 'bi-mortarboard',
      requiredEvidences: 1,
    },
    {
      id: 'culinary',
      name: 'Arts Culinaires',
      icon: 'bi-egg-fried',
      requiredEvidences: 1,
    },
    {
      id: 'arts',
      name: 'Arts & Culture',
      icon: 'bi-film',
      requiredEvidences: 1,
    },
  ];

  // Centres d'intérêt détaillés
  interests: Interest[] = [
    // Développement Fullstack
    {
      id: 'frontend',
      name: 'Développement Frontend',
      icon: 'bi-window',
      category: 'dev-fullstack',
      description:
        "Passion pour le développement d'interfaces utilisateur modernes et réactives avec Vue.js et Angular, en explorant les dernières tendances en matière d'expérience utilisateur.",
      since: '2020',
      frequency: 'Quotidienne (travail et projets personnels)',
      skillsRelated: [
        'UI/UX Design',
        'JavaScript/TypeScript',
        'Optimisation des performances'
      ],
      highlight:
        'A développé des interfaces frontend avancées chez Arthur Ngaku et expérimente régulièrement avec les nouvelles fonctionnalités de Vue.js.',
      requiredEvidence: 'evidence-tech',
    },
    {
      id: 'backend',
      name: 'Architecture Backend',
      icon: 'bi-server',
      category: 'dev-fullstack',
      description:
        'Intérêt pour la conception d\'architectures backend robustes et évolutives avec Spring Boot, Symfony et Node.js, en se concentrant sur les API REST sécurisées.',
      since: '2020',
      frequency: 'Régulière (professionnelle et académique)',
      skillsRelated: [
        'Conception API',
        'Bases de données PostgreSQL/MySQL',
        'Sécurité des applications'
      ],
      relatedImages: [
        { caption: 'Schéma d\'architecture microservices' },
        { caption: 'Documentation API Swagger' }
      ],
      requiredEvidence: 'evidence-books',
    },
  
    // Mobile & Technologies 3D
    {
      id: 'mobile-dev',
      name: 'Développement Mobile',
      icon: 'bi-phone',
      category: 'mobile-3d',
      description:
        'Exploration des technologies de développement mobile cross-platform en complément des compétences web, avec un intérêt particulier pour les applications hybrides.',
      since: '2022',
      frequency: 'Projets spécifiques et veille technologique',
      skillsRelated: [
        'Responsive Design',
        'Expérience utilisateur mobile',
        'Intégration API natives'
      ],
      requiredEvidence: 'evidence-mobile',
    },
    {
      id: 'tech-3d',
      name: 'Technologies 3D Web',
      icon: 'bi-cube',
      category: 'mobile-3d',
      description:
        'Expertise en développement d\'applications web intégrant des fonctionnalités 3D et des API de traitement d\'images, suite à l\'expérience acquise chez Arthur Ngaku.',
      since: '2023',
      frequency: 'Projets professionnels actuels',
      skillsRelated: [
        'WebGL',
        'Traitement d\'images',
        'Reconstruction 3D'
      ],
      highlight:
        'A implémenté une solution de visualisation 3D pour l\'analyse des mesures corporelles dans un contexte e-commerce.',
      requiredEvidence: 'evidence-tech',
    },
  
    // Formation & Documentation
    {
      id: 'academic',
      name: 'Formation Informatique',
      icon: 'bi-mortarboard',
      category: 'education',
      description:
        'Engagement dans la formation universitaire en informatique, avec un focus sur l\'approfondissement des connaissances théoriques et pratiques en développement logiciel.',
      since: '2020',
      frequency: 'Quotidienne (Master en alternance)',
      skillsRelated: [
        'Analyse algorithmique',
        'Méthodologies de développement',
        'Recherche et synthèse'
      ],
      highlight:
        'Poursuit un Master en Informatique à l\'Université de Toulouse Jean Jaurès tout en appliquant les connaissances acquises en contexte professionnel.',
      requiredEvidence: 'evidence-uni',
    },
    {
      id: 'technical-writing',
      name: 'Documentation Technique',
      icon: 'bi-file-text',
      category: 'education',
      description:
        'Intérêt pour la création de documentations techniques claires et complètes, développé lors de la rédaction de guides d\'architecture et de maintenance chez Arthur Ngaku.',
      since: '2023',
      frequency: 'Régulière (contexte professionnel)',
      skillsRelated: [
        'Communication technique',
        'Organisation de l\'information',
        'Pédagogie'
      ],
      requiredEvidence: 'evidence-docs',
    },
  
    // Arts Culinaires
    {
      id: 'cooking',
      name: 'Cuisine créative',
      icon: 'bi-egg-fried',
      category: 'culinary',
      description:
        'Passion pour l\'expérimentation culinaire et la préparation de plats créatifs, en explorant diverses techniques et influences internationales.',
      since: '2018',
      frequency: 'Plusieurs fois par semaine',
      skillsRelated: [
        'Créativité',
        'Précision',
        'Organisation'
      ],
      relatedImages: [
        { caption: 'Plat signature maison' },
        { caption: 'Préparation culinaire' }
      ],
      requiredEvidence: 'evidence-cooking',
    },
    {
      id: 'pastry',
      name: 'Pâtisserie',
      icon: 'bi-cake',
      category: 'culinary',
      description:
        'Intérêt particulier pour l\'art de la pâtisserie, en explorant les techniques précises et créatives de cette discipline culinaire exigeante.',
      frequency: 'Hebdomadaire',
      skillsRelated: [
        'Précision',
        'Patience',
        'Créativité visuelle'
      ],
      requiredEvidence: 'evidence-cooking',
    },
  
    // Arts & Culture
    {
      id: 'cinema',
      name: 'Cinéma',
      icon: 'bi-film',
      category: 'arts',
      description:
        'Passion pour le cinéma dans ses diverses formes et genres, avec un intérêt pour l\'analyse filmique et la découverte de nouvelles œuvres.',
      frequency: 'Hebdomadaire',
      skillsRelated: [
        'Analyse narrative',
        'Appréciation artistique',
        'Ouverture culturelle'
      ],
      relatedImages: [
        { caption: 'Festival de cinéma local' },
        { caption: 'Collection de films' }
      ],
      requiredEvidence: 'evidence-cinema',
    },
    {
      id: 'singing',
      name: 'Chant',
      icon: 'bi-mic',
      category: 'arts',
      description:
        'Pratique du chant comme expression artistique personnelle, avec un plaisir à explorer différents styles et techniques vocales.',
      frequency: 'Régulière',
      skillsRelated: [
        'Expression artistique',
        'Technique vocale',
        'Confiance en soi'
      ],
      requiredEvidence: 'evidence-music',
    }
  ];

  quizQuestions: QuizQuestion[] = [
    {
      question: "Quelle technologie frontend est particulièrement mise en avant dans le profil du développeur?",
      options: [
        "React",
        "Vue.js",
        "Ember",
        "jQuery"
      ],
      correctAnswer: 1
    },
    {
      question: "Depuis quand le développeur poursuit-il sa formation académique en informatique?",
      options: [
        "2018",
        "2019",
        "2020",
        "2022"
      ],
      correctAnswer: 2
    },
    {
      question: "Quel projet spécifique a été réalisé lors de l'alternance chez Arthur Ngaku?",
      options: [
        "Un système de gestion de base de données",
        "Une application de comptabilité",
        "Une plateforme e-commerce standard",
        "Une application avec intégration 3D et analyse des mesures corporelles"
      ],
      correctAnswer: 3
    },
    {
      question: "Quels sont les deux centres d'intérêt culinaires mentionnés dans le profil?",
      options: [
        "Cuisine et œnologie",
        "Cuisine et pâtisserie",
        "Pâtisserie et mixologie",
        "Gastronomie moléculaire et cuisine du monde"
      ],
      correctAnswer: 1
    },
    {
      question: "Quel indice révèle l'intérêt du développeur pour la documentation technique?",
      options: [
        "Collection de livres techniques",
        "Applications mobiles en développement",
        "Modèles de documentation technique",
        "Notes de cours universitaires"
      ],
      correctAnswer: 2
    },
    {
      question: "Quelle compétence DevOps fait partie du profil technique du développeur?",
      options: [
        "Jenkins",
        "Docker",
        "Kubernetes",
        "Terraform"
      ],
      correctAnswer: 1
    },
    {
      question: "Quel art est pratiqué par le développeur en complément de ses activités techniques?",
      options: [
        "Peinture",
        "Chant",
        "Danse",
        "Théâtre"
      ],
      correctAnswer: 1
    }
  ];

  constructor(
    private progressService: ProgressService,
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
    this.dialogService.startTypewriter(this.fullText, () => {
      setTimeout(() => {
        this.dialogService.closeDialog()
      }, 3000);
    });
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
