export interface FutureProject {
    title: string;
    description: string;
    type: 'project' | 'opportunity';
    timeline: 'short' | 'mid' | 'long';
    priority: 'high' | 'medium' | 'low';
    tags: string[];
    objectives: string[];
}
