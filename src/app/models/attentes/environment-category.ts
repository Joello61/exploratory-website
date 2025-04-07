import { EnvironmentItem } from "./environment-item";

export interface EnvironmentCategory {
    title: string;
    icon: string;
    items: EnvironmentItem[];
}
