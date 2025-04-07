import { ProfileAspect } from "./profile-aspect";

export interface MotivationProfile {
  id: string;
  name: string;
  icon: string;
  description: string;
  aspects: ProfileAspect[];
}

