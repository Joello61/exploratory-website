import { MapQuestion } from "../../models/itineraire/map-question";

export const MAPQUESTIONSDATA: MapQuestion[] = [
    {
      id: 'q1',
      text: "Cette ville, capitale politique du Cameroun depuis 1969, est située dans la région du Centre. Entourée de sept collines, elle présente une architecture qui mélange bâtiments coloniaux et constructions modernes. Le sujet y a passé une grande partie de sa jeunesse, fréquentant les écoles locales et s'imprégnant de cette culture métropolitaine où cohabitent plus de 80 groupes ethniques différents. Dans quelle ville le sujet a-t-il grandi?",
      options: ["Douala", "Yaoundé", "Kribi", "Garoua"],
      correctOptionIndex: 1,
      locationId: "yaounde",
      feedback: {
        correct: "Exactement! Yaoundé est bien la ville où le sujet a passé sa jeunesse. Cette ville, avec son climat tempéré et son relief vallonné, a grandement influencé sa vision du monde.",
        incorrect: "Ce n'est pas la bonne réponse. La ville recherchée est Yaoundé, capitale du Cameroun où le sujet a grandi et fait ses premières études."
      }
    },
    {
      id: 'q2',
      text: "Cette localité de l'Ouest du Cameroun est le siège d'une importante chefferie traditionnelle Bamiléké. Renommée pour ses sculptures sur bois, ses tissus ndop et son architecture palatiale unique, elle maintient des traditions ancestrales très vivantes. Le sujet y possède de profondes racines familiales et y retourne régulièrement pour participer aux cérémonies traditionnelles. Ces visites ont fortement façonné son identité culturelle et son attachement aux valeurs traditionnelles. Quelle est cette commune qui représente le berceau familial du sujet?",
      options: ["Bandjoun", "Bafoussam", "Dschang", "Foumban"],
      correctOptionIndex: 0,
      locationId: "bandjoun",
      feedback: {
        correct: "Bravo! Bandjoun est bien la localité d'origine de la famille du sujet. Ce lieu est considéré comme sacré dans la culture Bamiléké et a profondément influencé les valeurs du sujet.",
        incorrect: "Ce n'est pas la bonne réponse. La localité recherchée est Bandjoun, chefferie traditionnelle Bamiléké qui constitue le berceau familial du sujet."
      }
    },
    {
      id: 'q3',
      text: "Cette ville portuaire méditerranéenne française, fondée par les Grecs vers 600 av. J.-C., est la deuxième plus grande ville de France. Connue pour son Vieux-Port, sa Basilique Notre-Dame de la Garde et son caractère cosmopolite, elle représente un important carrefour culturel. Le sujet y a effectué ses premières études supérieures entre 2005 et 2008, obtenant une licence en informatique à l'université locale. Cette période a été déterminante pour sa formation technique et son ouverture à la diversité culturelle. Quelle est cette ville aux accents chantants?",
      options: ["Nice", "Marseille", "Montpellier", "Toulon"],
      correctOptionIndex: 1,
      locationId: "marseille",
      feedback: {
        correct: "Excellent! Marseille est bien la ville où le sujet a fait ses premières études supérieures. Son ambiance méditerranéenne et multiculturelle a fortement marqué cette période de sa vie.",
        incorrect: "Ce n'est pas la bonne réponse. La ville recherchée est Marseille, où le sujet a obtenu sa licence en informatique entre 2005 et 2008."
      }
    },
    {
      id: 'q4',
      text: "Cette métropole du sud-ouest de la France, surnommée 'la ville rose' en raison de ses bâtiments en briques, est la capitale de la région Occitanie. Centre névralgique de l'industrie aéronautique et spatiale européenne, elle abrite le siège d'Airbus et de nombreux centres de recherche. Le sujet y a poursuivi et complété sa formation entre 2008 et 2010, obtenant un master spécialisé en intelligence artificielle et robotique. Cette formation de pointe lui a ouvert les portes vers une carrière internationale dans les technologies avancées. Quelle est cette ville au riche patrimoine scientifique?",
      options: ["Bordeaux", "Lyon", "Toulouse", "Nantes"],
      correctOptionIndex: 2,
      locationId: "toulouse",
      feedback: {
        correct: "Parfait! Toulouse est bien la ville où le sujet a perfectionné sa formation avec un master en intelligence artificielle et robotique. Ce pôle d'excellence technologique a été décisif pour son parcours professionnel.",
        incorrect: "Ce n'est pas la bonne réponse. La ville recherchée est Toulouse, où le sujet a obtenu son master spécialisé entre 2008 et 2010."
      }
    }
  ];