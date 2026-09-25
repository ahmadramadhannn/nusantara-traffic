import { create } from 'zustand';
import {
  CameraViewMode,
  RouteTripSimulation,
  SimulationStats,
  TimeOfDay,
  TrafficLightState,
  Vehicle,
  VehicleType,
  WeatherType,
} from '../types';
import {
  createVehicleInstance,
  findNodePath,
  initializeTrafficLights,
  stepTrafficSimulation,
  updateTrafficLights,
} from '../features/traffic-simulation/engine';
import { TOWN_LANDMARKS } from '../features/town-scene/constants';

export interface FleetConfig {
  privateCars: number;
  motorcycles: number;
  angkots: number;
  buses: number;
  trucks: number;
}

export interface TrafficStoreState {
  // Playback
  isPlaying: boolean;
  simSpeed: number; // 1x, 2x, 4x

  // Entities
  vehicles: Vehicle[];
  trafficLights: Record<string, TrafficLightState>;
  stats: SimulationStats;

  // Environment & Context
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  rainIntensity: number; // 0.0 - 1.0

  // Camera
  cameraMode: CameraViewMode;
  selectedVehicleId: string | null;

  // Fleet configuration
  fleetConfig: FleetConfig;

  // Route Trip Planning
  routeTrip: RouteTripSimulation;

  // UI Modal State
  activeModal: 'fleet' | 'environment' | 'stats' | 'route' | 'presets' | null;

  // History for charts/analytics
  statsHistory: { time: number; congestion: number; speed: number; delay: number }[];

  // Actions
  togglePlay: () => void;
  setSimSpeed: (speed: number) => void;
  setWeather: (weather: WeatherType) => void;
  setTimeOfDay: (timeOfDay: TimeOfDay) => void;
  setRainIntensity: (val: number) => void;
  setCameraMode: (mode: CameraViewMode, vehicleId?: string) => void;
  setSelectedVehicleId: (id: string | null) => void;
  setActiveModal: (modal: 'fleet' | 'environment' | 'stats' | 'route' | 'presets' | null) => void;

  setFleetCounts: (newConfig: Partial<FleetConfig>) => void;
  respawnFleet: () => void;
  applyPreset: (presetKey: string) => void;

  startTripSimulation: (startLandmarkId: string, endLandmarkId: string, vehicleType: VehicleType) => void;
  cancelTripSimulation: () => void;

  tickSimulation: (realDeltaTime: number) => void;
}

const INITIAL_FLEET: FleetConfig = {
  privateCars: 20,
  motorcycles: 28,
  angkots: 8,
  buses: 3,
  trucks: 3,
};

function buildFleetVehicles(config: FleetConfig): Vehicle[] {
  const list: Vehicle[] = [];

  // Special labeled School Bus
  list.push(createVehicleInstance('bus', undefined, 'Bus Sekolah SD/SMP'));
  for (let i = 1; i < config.buses; i++) {
    list.push(createVehicleInstance('bus', undefined, `Trans Sukamaju ${i}`));
  }

  // Angkots
  for (let i = 0; i < config.angkots; i++) {
    list.push(createVehicleInstance('angkot', undefined, `Angkot 0${(i % 4) + 1}`));
  }

  // Private Cars
  for (let i = 0; i < config.privateCars; i++) {
    list.push(createVehicleInstance('car'));
  }

  // Motorcycles
  for (let i = 0; i < config.motorcycles; i++) {
    list.push(createVehicleInstance('motorcycle'));
  }

  // Trucks
  for (let i = 0; i < config.trucks; i++) {
    list.push(createVehicleInstance('truck', undefined, 'Logistik Sayur'));
  }

  return list;
}

export const useTrafficStore = create<TrafficStoreState>((set, get) => {
  const initialLights = initializeTrafficLights();
  const initialVehicles = buildFleetVehicles(INITIAL_FLEET);
  const initialSim = stepTrafficSimulation(initialVehicles, initialLights, 'clear', 'morning_rush', 0.05);

  return {
    isPlaying: true,
    simSpeed: 1,

    vehicles: initialSim.vehicles,
    trafficLights: initialLights,
    stats: initialSim.stats,

    weather: 'clear',
    timeOfDay: 'morning_rush',
    rainIntensity: 0.8,

    cameraMode: 'birds_eye',
    selectedVehicleId: null,

    fleetConfig: INITIAL_FLEET,

    routeTrip: {
      isActive: false,
      startLandmarkId: 'perumahan_griya',
      endLandmarkId: 'school_sdn01',
      vehicleType: 'bus',
      distanceMeters: 1100,
      estimatedTimeClearMin: 3.2,
      estimatedTimeCurrentMin: 7.8,
      delayMinutes: 4.6,
      currentProgressPct: 0,
      isCompleted: false,
    },

    activeModal: null,

    statsHistory: [
      { time: 0, congestion: initialSim.stats.congestionPercentage, speed: initialSim.stats.averageSpeedKmh, delay: initialSim.stats.schoolBusDelayMinutes },
    ],

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setSimSpeed: (simSpeed) => set({ simSpeed }),
    setWeather: (weather) => set({ weather }),
    setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
    setRainIntensity: (rainIntensity) => set({ rainIntensity }),
    setCameraMode: (cameraMode, vehicleId) => {
      set({ cameraMode, selectedVehicleId: vehicleId ?? (cameraMode === 'follow_vehicle' ? get().selectedVehicleId : null) });
    },
    setSelectedVehicleId: (selectedVehicleId) => set({ selectedVehicleId }),
    setActiveModal: (activeModal) => set({ activeModal }),

    setFleetCounts: (newConfig) => {
      const updatedConfig = { ...get().fleetConfig, ...newConfig };
      const newVehicles = buildFleetVehicles(updatedConfig);
      const { vehicles, stats } = stepTrafficSimulation(
        newVehicles,
        get().trafficLights,
        get().weather,
        get().timeOfDay,
        0.05
      );
      set({
        fleetConfig: updatedConfig,
        vehicles,
        stats,
      });
    },

    respawnFleet: () => {
      const newVehicles = buildFleetVehicles(get().fleetConfig);
      const { vehicles, stats } = stepTrafficSimulation(
        newVehicles,
        get().trafficLights,
        get().weather,
        get().timeOfDay,
        0.05
      );
      set({ vehicles, stats });
    },

    applyPreset: (presetKey: string) => {
      let newConfig: FleetConfig = { ...INITIAL_FLEET };
      let newWeather: WeatherType = 'clear';
      let newTime: TimeOfDay = 'morning_rush';

      switch (presetKey) {
        case 'car_dependent': // Severe private car gridlock
          newConfig = {
            privateCars: 46,
            motorcycles: 48,
            angkots: 2,
            buses: 1,
            trucks: 4,
          };
          newWeather = 'clear';
          newTime = 'morning_rush';
          break;

        case 'monsoon_gridlock': // Heavy rain + high private vehicle usage
          newConfig = {
            privateCars: 42,
            motorcycles: 36,
            angkots: 3,
            buses: 1,
            trucks: 4,
          };
          newWeather = 'rain';
          newTime = 'evening_rush';
          break;

        case 'balanced_town': // Healthy mix of Angkot + Bus
          newConfig = {
            privateCars: 14,
            motorcycles: 20,
            angkots: 12,
            buses: 5,
            trucks: 2,
          };
          newWeather = 'clear';
          newTime = 'midday';
          break;

        case 'public_transit_mastery': // High transit shift: fluid streets & zero bus delays
          newConfig = {
            privateCars: 6,
            motorcycles: 10,
            angkots: 16,
            buses: 8,
            trucks: 2,
          };
          newWeather = 'clear';
          newTime = 'morning_rush';
          break;

        case 'night_peace': // Quiet evening night
          newConfig = {
            privateCars: 8,
            motorcycles: 12,
            angkots: 4,
            buses: 2,
            trucks: 2,
          };
          newWeather = 'clear';
          newTime = 'night';
          break;
      }

      const newVehicles = buildFleetVehicles(newConfig);
      const { vehicles, stats } = stepTrafficSimulation(
        newVehicles,
        get().trafficLights,
        newWeather,
        newTime,
        0.05
      );

      set({
        fleetConfig: newConfig,
        weather: newWeather,
        timeOfDay: newTime,
        vehicles,
        stats,
        activeModal: null,
      });
    },

    startTripSimulation: (startLandmarkId, endLandmarkId, vehicleType) => {
      const startLm = TOWN_LANDMARKS.find((l) => l.id === startLandmarkId) || TOWN_LANDMARKS[0];
      const endLm = TOWN_LANDMARKS.find((l) => l.id === endLandmarkId) || TOWN_LANDMARKS[1];

      // Spawn a designated test vehicle along this route
      const startRoad = startLm.roadId.split('_to_')[0] || 'sudirman_w';
      const endRoad = endLm.roadId.split('_to_')[1] || 'merdeka_n';
      const path = findNodePath(startRoad, endRoad);

      const testVehicle = createVehicleInstance(vehicleType, path, `Trip Test (${vehicleType.toUpperCase()})`);
      const existingVehicles = get().vehicles;

      const currentStats = get().stats;
      const baseSpeedKmh = vehicleType === 'motorcycle' ? 32 : vehicleType === 'car' ? 30 : 25;
      const congestionSpeedKmh = Math.max(4, baseSpeedKmh * (1 - currentStats.congestionPercentage / 130));
      const distanceKm = 1.35;
      const clearTimeMin = Math.round(((distanceKm / baseSpeedKmh) * 60) * 10) / 10;
      const currentTimeMin = Math.round(((distanceKm / congestionSpeedKmh) * 60) * 10) / 10;
      const delay = Math.max(0, Math.round((currentTimeMin - clearTimeMin) * 10) / 10);

      set({
        vehicles: [testVehicle, ...existingVehicles],
        selectedVehicleId: testVehicle.id,
        cameraMode: 'follow_vehicle',
        routeTrip: {
          isActive: true,
          startLandmarkId,
          endLandmarkId,
          vehicleType,
          simulatedVehicleId: testVehicle.id,
          distanceMeters: 1350,
          estimatedTimeClearMin: clearTimeMin,
          estimatedTimeCurrentMin: currentTimeMin,
          delayMinutes: delay,
          currentProgressPct: 0,
          isCompleted: false,
        },
      });
    },

    cancelTripSimulation: () => {
      set((state) => ({
        routeTrip: {
          ...state.routeTrip,
          isActive: false,
          isCompleted: false,
          currentProgressPct: 0,
        },
        cameraMode: 'birds_eye',
        selectedVehicleId: null,
      }));
    },

    tickSimulation: (realDeltaTime: number) => {
      const state = get();
      if (!state.isPlaying) return;

      // Clamp deltaTime for stability and apply sim speed
      const dt = Math.min(0.1, realDeltaTime) * state.simSpeed;

      const updatedLights = updateTrafficLights(state.trafficLights, dt);
      const { vehicles, stats } = stepTrafficSimulation(
        state.vehicles,
        updatedLights,
        state.weather,
        state.timeOfDay,
        dt
      );

      // Check active trip simulation progress
      let routeTrip = state.routeTrip;
      if (routeTrip.isActive && routeTrip.simulatedVehicleId) {
        const testVeh = vehicles.find((v) => v.id === routeTrip.simulatedVehicleId);
        if (testVeh) {
          const progressPct = Math.min(100, Math.round((testVeh.totalDistanceTraveled / routeTrip.distanceMeters) * 100));
          const isDone = progressPct >= 100;
          routeTrip = {
            ...routeTrip,
            currentProgressPct: progressPct,
            isCompleted: isDone,
          };
        }
      }

      // Record rolling history
      let statsHistory = state.statsHistory;
      if (Math.random() < 0.08) { // throttle history writes
        const lastEntry = statsHistory[statsHistory.length - 1];
        const newTime = lastEntry ? lastEntry.time + 1 : 1;
        statsHistory = [...statsHistory.slice(-24), {
          time: newTime,
          congestion: stats.congestionPercentage,
          speed: stats.averageSpeedKmh,
          delay: stats.schoolBusDelayMinutes,
        }];
      }

      set({
        trafficLights: updatedLights,
        vehicles,
        stats,
        routeTrip,
        statsHistory,
      });
    },
  };
});
