export type VehicleType = 'car' | 'motorcycle' | 'angkot' | 'bus' | 'truck';

export type WeatherType = 'clear' | 'rain' | 'fog';

export type TimeOfDay = 'morning_rush' | 'midday' | 'evening_rush' | 'night' | 'holiday';

export type CameraViewMode = 
  | 'birds_eye'
  | 'street_sudirman'
  | 'street_merdeka'
  | 'street_diponegoro'
  | 'street_kartini'
  | 'follow_vehicle'
  | 'free';

export interface Landmark {
  id: string;
  name: string;
  category: 'education' | 'market' | 'civic' | 'residential' | 'transit' | 'healthcare';
  position: [number, number, number];
  roadId: string;
  description: string;
  iconName: string;
}

export interface RoadNode {
  id: string;
  x: number;
  z: number;
  name?: string;
  isIntersection?: boolean;
}

export interface RoadSegment {
  id: string;
  name: string; // e.g., "Jl. Jenderal Sudirman"
  fromNodeId: string;
  toNodeId: string;
  length: number;
  lanes: number; // lanes in this direction
  speedLimit: number; // in km/h
  isPublicTransitPriority?: boolean;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  roadId: string;
  lane: number;
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number; // m/s
  targetSpeed: number; // m/s
  maxSpeed: number; // m/s
  acceleration: number; // m/s²
  progress: number; // distance along current segment in meters
  distanceToLead: number; // distance to car ahead in meters
  isBraking: boolean;
  color: string;
  capacity: number;
  passengers: number;
  routeNodeIds: string[];
  routeIndex: number;
  waitTime: number; // seconds spent waiting at red light or in traffic
  totalTravelTime: number; // seconds active
  totalDistanceTraveled: number;
  customLabel?: string;
}

export interface TrafficLightState {
  intersectionId: string;
  activeDirection: 'EW' | 'NS'; // East-West or North-South green
  phaseTime: number; // elapsed time in current phase
  durationGreen: number;
  durationYellow: number;
  isYellow: boolean;
}

export interface RouteTripSimulation {
  isActive: boolean;
  startLandmarkId: string;
  endLandmarkId: string;
  vehicleType: VehicleType;
  simulatedVehicleId?: string;
  distanceMeters: number;
  estimatedTimeClearMin: number;
  estimatedTimeCurrentMin: number;
  delayMinutes: number;
  currentProgressPct: number;
  isCompleted: boolean;
}

export interface SimulationStats {
  totalActiveVehicles: number;
  totalCommutersInTransit: number;
  averageSpeedKmh: number;
  congestionPercentage: number; // 0 - 100%
  averageTripTimeMinutes: number;
  schoolBusDelayMinutes: number;
  fuelWastedLitersPerHour: number;
  economicLossIdrPerHour: number; // in Indonesian Rupiah
  co2EmissionsKgPerHour: number;
  roadSpaceOccupiedM2: number;
  modeSplit: {
    privatePct: number;
    publicPct: number;
  };
}
