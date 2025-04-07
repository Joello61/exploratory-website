import { LocationData } from "./location-data";

export interface Location {
  id: string;
  name: string;
  period: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  data: LocationData[];
  discovered?: boolean;
}

