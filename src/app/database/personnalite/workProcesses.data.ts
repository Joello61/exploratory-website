import { WorkProcess } from "../../models/personnalite/work-process";

export const WORKPROCESSESDATA: WorkProcess[] = [
    {
      name: 'Analyse de problème',
      icon: 'bi-search',
      description:
        "Approche méthodique et approfondie de l'analyse des problèmes, incluant la collecte systématique de données, l'identification des causes racines et la consultation des parties prenantes pertinentes.",
      discovered: false,
    },
    {
      name: 'Planification',
      icon: 'bi-calendar-check',
      description:
        "Développement de plans structurés avec des jalons clairs, des contingences pour les risques identifiés et une allocation réaliste des ressources. Révise régulièrement pour s'adapter aux nouvelles informations.",
      discovered: false,
    },
    {
      name: 'Exécution et suivi',
      icon: 'bi-graph-up',
      description:
        "Mise en œuvre disciplinée avec suivi régulier des progrès par rapport aux objectifs. Maintient une documentation claire et communique proactivement sur l'avancement et les ajustements nécessaires.",
      discovered: false,
    },
  
];
