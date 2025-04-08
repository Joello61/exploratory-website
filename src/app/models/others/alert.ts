import { AlertType } from "../../types/alert.type";

export interface Alert {
    id: number;
    type: AlertType;
    message: string;
    title?: string;
    autoClose?: boolean;
    duration?: number;
    icon?: string;
  }