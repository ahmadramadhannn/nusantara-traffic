import { create } from 'zustand';
import {
  CameraViewMode,
  ContextMenuState,
  DetailedRoute,
  RouteTripSimulation,
  SimulationStats,
  TimeOfDay,
  TrafficLightState,
  TripPoint,
  Vehicle,
  VehicleType,
  WeatherType,
} from '../types';
import {
  calculateDetailedRoute,
  createVehicleInstance,
  findNodePath,
  initializeTrafficLights,
  stepTrafficSimulation,
  updateTrafficLights,
} from '../features/traffic-simulation/engine';
import { findNearestRoadNode, TOWN_LANDMARKS } from '../features/town-scene/constants';

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

  // Real-Time Trip Planner Points & Detailed Route
  startPoint: TripPoint;
  endPoint: TripPoint;
  activeTripMode: VehicleType;
  detailedRoute: DetailedRoute;
  routeTrip: RouteTripSimulation;

  // Context Menu for right-clicking any building/place/ground
  contextMenu: ContextMenuState;

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

  // Dynamic Trip Planning Actions
  setTripStartPoint: (point: TripPoint) => void;
  setTripEndPoint: (point: TripPoint) => void;
  swapTripPoints: () => void;
  setActiveTripMode: (mode: VehicleType) => void;

  openContextMenu: (screenX: number, screenY: number, point: TripPoint) => void;
  closeContextMenu: () => void;

  startTripSimulation: (vehicleType?: VehicleType) => void;
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

const DEFAULT_START: TripPoint = {
  id: 'perumahan_griya',
  name: 'Perumahan Griya Asri',
  position: [-75, 0, -10],
  category: 'residential',
  description: 'Komplek pemukiman warga Sukamaju',
};

const DEFAULT_END: TripPoint = {
  id: 'school_sdn01',
  name: 'SD Negeri 01 Sukamaju',
  position: [-65, 0, -60],
  category: 'education',
  description: 'Sekolah Dasar Negeri 01 Sukamaju',
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

  const initialRoute = calculateDetailedRoute(
    DEFAULT_START,
    DEFAULT_END,
    initialSim.vehicles,
    initialLights,
    'clear'
  );

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

    startPoint: DEFAULT_START,
    endPoint: DEFAULT_END,
    activeTripMode: 'car',
    detailedRoute: initialRoute,

    routeTrip: {
      isActive: false,
      startPoint: DEFAULT_START,
      endPoint: DEFAULT_END,
      vehicleType: 'car',
      detailedRoute: initialRoute,
      currentProgressPct: 0,
      elapsedTripSeconds: 0,
      isCompleted: false,
    },

    contextMenu: {
      isOpen: false,
      screenX: 0,
      screenY: 0,
      point: DEFAULT_START,
    },

    activeModal: null,

    statsHistory: [
      {
        time: 0,
        congestion: initialSim.stats.congestionPercentage,
        speed: initialSim.stats.averageSpeedKmh,
        delay: initialSim.stats.schoolBusDelayMinutes,
      },
    ],

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setSimSpeed: (simSpeed) => set({ simSpeed }),
    setWeather: (weather) => {
      const state = get();
      const updatedRoute = calculateDetailedRoute(
        state.startPoint,
        state.endPoint,
        state.vehicles,
        state.trafficLights,
        weather
      );
      set({ weather, detailedRoute: updatedRoute });
    },
    setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
    setRainIntensity: (rainIntensity) => set({ rainIntensity }),
    setCameraMode: (cameraMode, vehicleId) => {
      set({
        cameraMode,
        selectedVehicleId:
          vehicleId ?? (cameraMode === 'follow_vehicle' ? get().selectedVehicleId : null),
      });
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
      const updatedRoute = calculateDetailedRoute(
        get().startPoint,
        get().endPoint,
        vehicles,
        get().trafficLights,
        get().weather
      );
      set({
        fleetConfig: updatedConfig,
        vehicles,
        stats,
        detailedRoute: updatedRoute,
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
      const updatedRoute = calculateDetailedRoute(
        get().startPoint,
        get().endPoint,
        vehicles,
        get().trafficLights,
        get().weather
      );
      set({ vehicles, stats, detailedRoute: updatedRoute });
    },

    applyPreset: (presetKey: string) => {
      let newConfig: FleetConfig = { ...INITIAL_FLEET };
      let newWeather: WeatherType = 'clear';
      let newTime: TimeOfDay = 'morning_rush';

      switch (presetKey) {
        case 'car_dependent':
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

        case 'monsoon_gridlock':
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

        case 'balanced_town':
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

        case 'public_transit_mastery':
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

        case 'night_peace':
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

      const updatedRoute = calculateDetailedRoute(
        get().startPoint,
        get().endPoint,
        vehicles,
        get().trafficLights,
        newWeather
      );

      set({
        fleetConfig: newConfig,
        weather: newWeather,
        timeOfDay: newTime,
        vehicles,
        stats,
        detailedRoute: updatedRoute,
        activeModal: null,
      });
    },

    setTripStartPoint: (point) => {
      const state = get();
      const updatedRoute = calculateDetailedRoute(
        point,
        state.endPoint,
        state.vehicles,
        state.trafficLights,
        state.weather
      );
      set({
        startPoint: point,
        detailedRoute: updatedRoute,
        contextMenu: { ...state.contextMenu, isOpen: false },
      });
    },

    setTripEndPoint: (point) => {
      const state = get();
      const updatedRoute = calculateDetailedRoute(
        state.startPoint,
        point,
        state.vehicles,
        state.trafficLights,
        state.weather
      );
      set({
        endPoint: point,
        detailedRoute: updatedRoute,
        contextMenu: { ...state.contextMenu, isOpen: false },
      });
    },

    swapTripPoints: () => {
      const state = get();
      const newStart = state.endPoint;
      const newEnd = state.startPoint;
      const updatedRoute = calculateDetailedRoute(
        newStart,
        newEnd,
        state.vehicles,
        state.trafficLights,
        state.weather
      );
      set({
        startPoint: newStart,
        endPoint: newEnd,
        detailedRoute: updatedRoute,
      });
    },

    setActiveTripMode: (activeTripMode) => {
      set({ activeTripMode });
    },

    openContextMenu: (screenX, screenY, point) => {
      set({
        contextMenu: {
          isOpen: true,
          screenX,
          screenY,
          point,
        },
      });
    },

    closeContextMenu: () => {
      set((state) => ({
        contextMenu: {
          ...state.contextMenu,
          isOpen: false,
        },
      }));
    },

    startTripSimulation: (vehicleType) => {
      const state = get();
      const vType = vehicleType || state.activeTripMode;
      const startNode = findNearestRoadNode(state.startPoint.position[0], state.startPoint.position[2]);
      const endNode = findNearestRoadNode(state.endPoint.position[0], state.endPoint.position[2]);
      const nodePath = findNodePath(startNode.id, endNode.id);

      const testVehicle = createVehicleInstance(
        vType,
        nodePath,
        `Trip Test (${vType.toUpperCase()})`
      );

      const updatedRoute = calculateDetailedRoute(
        state.startPoint,
        state.endPoint,
        state.vehicles,
        state.trafficLights,
        state.weather
      );

      set({
        vehicles: [testVehicle, ...state.vehicles],
        selectedVehicleId: testVehicle.id,
        cameraMode: 'follow_vehicle',
        activeTripMode: vType,
        routeTrip: {
          isActive: true,
          startPoint: state.startPoint,
          endPoint: state.endPoint,
          vehicleType: vType,
          simulatedVehicleId: testVehicle.id,
          detailedRoute: updatedRoute,
          currentProgressPct: 0,
          elapsedTripSeconds: 0,
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

      const dt = Math.min(0.1, realDeltaTime) * state.simSpeed;

      const updatedLights = updateTrafficLights(state.trafficLights, dt);
      const { vehicles, stats } = stepTrafficSimulation(
        state.vehicles,
        updatedLights,
        state.weather,
        state.timeOfDay,
        dt
      );

      // Re-calculate the live dynamic route ETA every ~0.15s (smoothed)
      let detailedRoute = state.detailedRoute;
      detailedRoute = calculateDetailedRoute(
        state.startPoint,
        state.endPoint,
        vehicles,
        updatedLights,
        state.weather
      );

      // Check active trip simulation progress
      let routeTrip = state.routeTrip;
      if (routeTrip.isActive && routeTrip.simulatedVehicleId) {
        const testVeh = vehicles.find((v) => v.id === routeTrip.simulatedVehicleId);
        if (testVeh) {
          const totalDist = detailedRoute.totalDistanceMeters || 1000;
          const progressPct = Math.min(
            100,
            Math.round((testVeh.totalDistanceTraveled / totalDist) * 100)
          );
          const isDone = progressPct >= 100;
          routeTrip = {
            ...routeTrip,
            detailedRoute,
            elapsedTripSeconds: testVeh.totalTravelTime,
            currentProgressPct: progressPct,
            isCompleted: isDone,
          };
        }
      }

      // Record rolling history
      let statsHistory = state.statsHistory;
      if (Math.random() < 0.08) {
        const lastEntry = statsHistory[statsHistory.length - 1];
        const newTime = lastEntry ? lastEntry.time + 1 : 1;
        statsHistory = [
          ...statsHistory.slice(-24),
          {
            time: newTime,
            congestion: stats.congestionPercentage,
            speed: stats.averageSpeedKmh,
            delay: stats.schoolBusDelayMinutes,
          },
        ];
      }

      set({
        trafficLights: updatedLights,
        vehicles,
        stats,
        detailedRoute,
        routeTrip,
        statsHistory,
      });
    },
  };
});
