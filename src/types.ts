export type WaterActivity = 
  | 'fishing_charter'
  | 'jetski'
  | 'yacht'
  | 'kayak_sup'
  | 'wakeboard';

export interface TideEvent {
  id?: number;
  date: string;
  tide_time: string;
  height_metres: string;
  tide_type: 'high' | 'low';
}

export interface TideData {
  today?: TideEvent[];
  tomorrow?: TideEvent[];
  currentEstimatedHeight?: number;
  stage?: 'rising' | 'falling' | 'peak' | 'slack';
  nextEvent?: TideEvent;
}

export interface UVData {
  current?: {
    id?: number;
    uv_value: number;
    category: string;
    timestamp: string;
  };
  history?: Array<{
    reading_time: string;
    uv_value: number;
    band: string;
  }>;
}

export interface HeatStressData {
  current?: {
    id?: number;
    wbgt_value: string;
    category: string;
    timestamp: string;
  };
  history?: Array<{
    reading_time?: string;
    wbgt_value: string;
    category: string;
  }>;
}

export interface WindStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  directionDeg?: number;
  speedKnots?: number;
}

export interface CoastalSpot {
  id: string;
  name: string;
  chineseName?: string;
  area: 'Southern Islands' | 'East Coast' | 'Changi Straits' | 'Pasir Ris' | 'Marina Bay' | 'Northern Straits' | 'Western Straits';
  latitude: number;
  longitude: number;
  popularActivities: WaterActivity[];
  description: string;
  launchFacilities: string[];
  nearbyStationId: string;
  fishingSpecies?: string[];
  tideSensitivity: 'high' | 'medium' | 'low';
}

export interface SpotSuitability {
  score: number; // 0 - 100
  level: 'optimal' | 'moderate' | 'caution' | 'unfavorable';
  headline: string;
  reasons: string[];
  matchedWind?: {
    speedKnots: number;
    directionDeg: number;
    stationName: string;
  };
  activitySuitability: Record<WaterActivity, {
    status: 'optimal' | 'good' | 'caution' | 'unfavorable';
    reason: string;
  }>;
}

export interface PartnerVendor {
  id: string;
  name: string;
  category: 'fishing_charter' | 'boat_charter' | 'jetski_equipment' | 'kayak_watersports' | 'yacht_club';
  categoryLabel: string;
  spotId: string;
  spotName: string;
  marina: string;
  fleet: string[];
  priceRange: string;
  pricingExample: string;
  verified: boolean;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  todayAvailableSlots: number;
  recommendedTide: string;
  badge: string;
  royaltyRate: string;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  empty: boolean;
  slow: boolean;
  refused: boolean;
  lastUpdated: string | null;
}

export interface UserSubscription {
  status: 'free_trial' | 'active_monthly' | 'active_annual' | 'expired';
  trialDaysLeft: number;
  planName: string;
  expiryDate: string;
  hasCharterAssurance: boolean;
}
