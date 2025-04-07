export interface Evidence {
  id: string;
  title: string;
  icon: string;
  date: string;
  description: string;
  keywords?: string[];
  discovered: boolean;
  connections: string[];
}

