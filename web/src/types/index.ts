export type FacilityStatus = 'OPERATING' | 'FAULT' | 'MAINTENANCE' | 'UNKNOWN';

export type FacilityType =
  | 'elevator'
  | 'escalator'
  | 'moving_walk'
  | 'wheelchair_lift'
  | 'safety_board';

export type StaticFacilityType =
  | 'disabled_restroom'
  | 'sign_language_phone'
  | 'wheelchair_charger'
  | 'helper';

export type MobilityType =
  | 'electric_wheelchair'
  | 'manual_wheelchair'
  | 'elderly'
  | 'stroller';

export type AirQualityGrade = '좋음' | '보통' | '나쁨' | '매우나쁨';

export interface FacilitySummary {
  facility_id: string;
  location_detail: string;
  floor_from?: string;
  floor_to?: string;
  status: FacilityStatus;
  status_code: string;
}

export interface StaticFacilityItem {
  id: string;
  location: string;
  detail?: string;
}

export interface StationStatus {
  name: string;
  lines: string[];
  lat: number;
  lng: number;
  facilities: Partial<Record<FacilityType, FacilitySummary[]>>;
  disabled_restroom?: StaticFacilityItem[];
  sign_language_phone?: StaticFacilityItem[];
  wheelchair_charger?: StaticFacilityItem[];
  helper?: StaticFacilityItem[];
}

export interface FacilityTypeSummary {
  total: number;
  operating: number;
  fault: number;
}

export interface EnvironmentData {
  collected_at: string;
  pm10: number;
  pm25: number;
  pm10_grade: AirQualityGrade;
  pm25_grade: AirQualityGrade;
}

export interface LatestData {
  updated_at: string;
  data_age_minutes: number;
  is_stale: boolean;
  environment?: EnvironmentData;
  summary: Partial<Record<FacilityType, FacilityTypeSummary>>;
  stations: Record<string, StationStatus>;
}

export interface StationMeta {
  code: string;
  name: string;
  lines: string[];
  lat: number;
  lng: number;
}

export interface ExternalMapParams {
  stationName: string;
  lat: number;
  lng: number;
}
