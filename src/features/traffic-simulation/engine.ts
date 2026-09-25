import {
  RoadNode,
  RoadSegment,
  TrafficLightState,
  Vehicle,
  VehicleType,
  WeatherType,
  TimeOfDay,
  SimulationStats,
} from '../../types';
import { ROAD_SEGMENTS, TOWN_NODES, NODE_CONNECTIONS, TOWN_LANDMARKS } from '../town-scene/constants';

// Vehicle specific properties
export const VEHICLE_CONFIGS: Record<
  VehicleType,
  {
    name: string;
    indonesianName: string;
    length: number;
    width: number;
    height: number;
    capacity: number;
    baseMaxSpeed: number; // m/s (10 m/s = 36 km/h)
    minGap: number; // minimum distance behind leader
    colorPool: string[];
    roadSpaceM2: number; // average footprint on road
    fuelConsumptionLPer100Km: number;
  }
> = {
  car: {
    name: 'Private Car',
    indonesianName: 'Mobil Pribadi (MPV/Sedan)',
    length: 4.2,
    width: 1.8,
    height: 1.5,
    capacity: 1.4, // average occupancy
    baseMaxSpeed: 10.5,
    minGap: 4.5,
    colorPool: ['#E2E8F0', '#0F172A', '#DC2626', '#475569', '#3B82F6', '#D97706', '#94A3B8'],
    roadSpaceM2: 8.5,
    fuelConsumptionLPer100Km: 9.0,
  },
  motorcycle: {
    name: 'Motorcycle',
    indonesianName: 'Sepeda Motor (Matic/Bebek)',
    length: 2.0,
    width: 0.8,
    height: 1.3,
    capacity: 1.1,
    baseMaxSpeed: 11.5,
    minGap: 2.5,
    colorPool: ['#EF4444', '#10B981', '#3B82F6', '#0F172A', '#F59E0B', '#8B5CF6'],
    roadSpaceM2: 2.2,
    fuelConsumptionLPer100Km: 2.5,
  },
  angkot: {
    name: 'Angkot (Minivan)',
    indonesianName: 'Angkutan Kota (Angkot 01 & 02)',
    length: 4.5,
    width: 1.9,
    height: 1.8,
    capacity: 12.0,
    baseMaxSpeed: 9.0,
    minGap: 5.0,
    colorPool: ['#0284C7', '#059669', '#EAB308', '#D97706'], // Iconic Indonesian angkot colors: Biru, Hijau, Kuning
    roadSpaceM2: 8.8,
    fuelConsumptionLPer100Km: 11.0,
  },
  bus: {
    name: 'School & City Bus',
    indonesianName: 'Bus Sekolah & Trans Sukamaju',
    length: 9.5,
    width: 2.4,
    height: 2.8,
    capacity: 42.0,
    baseMaxSpeed: 8.5,
    minGap: 7.0,
    colorPool: ['#F59E0B', '#F97316', '#2563EB', '#16A34A'], // Kuning Bus Sekolah, Oranye Trans
    roadSpaceM2: 23.0,
    fuelConsumptionLPer100Km: 28.0,
  },
  truck: {
    name: 'Logistics Pickup',
    indonesianName: 'Pickup Sayur / Logistik Pasar',
    length: 5.5,
    width: 2.0,
    height: 2.0,
    capacity: 1.0,
    baseMaxSpeed: 8.0,
    minGap: 6.0,
    colorPool: ['#334155', '#475569', '#1E293B', '#B45309'],
    roadSpaceM2: 12.0,
    fuelConsumptionLPer100Km: 13.5,
  },
};

// Find path of segments between two nodes using Breadth-First Search
export function findNodePath(startNodeId: string, targetNodeId: string): string[] {
  if (startNodeId === targetNodeId) return [startNodeId];

  const queue: { node: string; path: string[] }[] = [{ node: startNodeId, path: [startNodeId] }];
  const visited = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    const neighbors = NODE_CONNECTIONS[node] || [];

    for (const neighbor of neighbors) {
      if (neighbor === targetNodeId) {
        return [...path, neighbor];
      }
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ node: neighbor, path: [...path, neighbor] });
      }
    }
  }

  return [startNodeId];
}

// Map node pairs to corresponding road segment
export function getSegmentForNodePair(fromNodeId: string, toNodeId: string): RoadSegment | undefined {
  return ROAD_SEGMENTS.find((s) => s.fromNodeId === fromNodeId && s.toNodeId === toNodeId);
}

// Generate a random valid continuous route across town
export function generateRandomTownRoute(): string[] {
  const boundaryNodes = [
    'sudirman_w',
    'sudirman_e',
    'kartini_w',
    'kartini_e',
    'merdeka_n',
    'merdeka_s',
    'diponegoro_n',
    'diponegoro_s',
  ];
  const start = boundaryNodes[Math.floor(Math.random() * boundaryNodes.length)];
  let target = boundaryNodes[Math.floor(Math.random() * boundaryNodes.length)];
  while (target === start) {
    target = boundaryNodes[Math.floor(Math.random() * boundaryNodes.length)];
  }

  const path = findNodePath(start, target);
  return path.length > 1 ? path : ['sudirman_w', 'int_nw', 'int_ne', 'sudirman_e'];
}

// Calculate position [x, y, z] and rotation [yaw] along a road segment given progress in meters
export function calculateVehiclePose(
  segment: RoadSegment,
  progress: number,
  vehicleType: VehicleType,
  vehicleSeed: number
): { position: [number, number, number]; rotation: [number, number, number] } {
  const fromNode = TOWN_NODES[segment.fromNodeId];
  const toNode = TOWN_NODES[segment.toNodeId];

  if (!fromNode || !toNode) {
    return { position: [0, 0.4, 0], rotation: [0, 0, 0] };
  }

  const dx = toNode.x - fromNode.x;
  const dz = toNode.z - fromNode.z;
  const totalLength = Math.max(1, Math.sqrt(dx * dx + dz * dz));
  const t = Math.max(0, Math.min(1, progress / totalLength));

  // Base coordinate along center of road
  const baseX = fromNode.x + dx * t;
  const baseZ = fromNode.z + dz * t;

  // Direction angle
  const angle = Math.atan2(dx, dz); // Three.js yaw convention

  // Lane lateral offset (standard lane is on right-hand side in Indonesian left-hand driving)
  // Indonesia drives on LEFT side:
  // Moving North (dz < 0): Left side is X- (offset to left of motion)
  // Moving South (dz > 0): Left side is X+
  // Moving East (dx > 0): Left side is Z-
  // Moving West (dx < 0): Left side is Z+
  const dirX = dx / totalLength;
  const dirZ = dz / totalLength;

  // Left normal vector in 2D (X, Z) is (-dirZ, dirX)
  const leftNormalX = -dirZ;
  const leftNormalZ = dirX;

  // Indonesian Left-Hand Drive offset: 1.75 meters to the left of the centerline
  let lateralOffset = 1.75;
  if (vehicleType === 'motorcycle') {
    // Motorcycles stagger slightly left or right within the lane
    const stagger = ((vehicleSeed % 10) / 10 - 0.5) * 0.9;
    lateralOffset += stagger;
  }

  const finalX = baseX + leftNormalX * lateralOffset;
  const finalZ = baseZ + leftNormalZ * lateralOffset;

  return {
    position: [finalX, 0.35, finalZ],
    rotation: [0, angle, 0],
  };
}

// Initialize Traffic Lights with standard offset phases
export function initializeTrafficLights(): Record<string, TrafficLightState> {
  const intersections = ['int_nw', 'int_ne', 'int_sw', 'int_se'];
  const lights: Record<string, TrafficLightState> = {};

  intersections.forEach((id, index) => {
    lights[id] = {
      intersectionId: id,
      activeDirection: index % 2 === 0 ? 'EW' : 'NS',
      phaseTime: index * 3.5,
      durationGreen: 14.0,
      durationYellow: 3.0,
      isYellow: false,
    };
  });

  return lights;
}

// Update Traffic Lights by delta time
export function updateTrafficLights(
  lights: Record<string, TrafficLightState>,
  deltaTime: number
): Record<string, TrafficLightState> {
  const nextLights: Record<string, TrafficLightState> = { ...lights };

  for (const id of Object.keys(nextLights)) {
    const light = { ...nextLights[id] };
    light.phaseTime += deltaTime;

    const totalCycle = light.durationGreen + light.durationYellow;

    if (light.phaseTime < light.durationGreen) {
      light.isYellow = false;
    } else if (light.phaseTime < totalCycle) {
      light.isYellow = true;
    } else {
      // Switch green direction
      light.phaseTime = 0;
      light.isYellow = false;
      light.activeDirection = light.activeDirection === 'EW' ? 'NS' : 'EW';
    }

    nextLights[id] = light;
  }

  return nextLights;
}

// Check if a traffic light is RED for a vehicle approaching an intersection on a given segment
export function isLightRedForSegment(
  segment: RoadSegment,
  trafficLights: Record<string, TrafficLightState>
): boolean {
  const light = trafficLights[segment.toNodeId];
  if (!light) return false;

  const isEWSegment = segment.name.toLowerCase().includes('sudirman') || segment.name.toLowerCase().includes('kartini');

  if (isEWSegment) {
    // Road runs East-West: Green when activeDirection === 'EW' and NOT yellow
    return light.activeDirection !== 'EW' || light.isYellow;
  } else {
    // Road runs North-South: Green when activeDirection === 'NS' and NOT yellow
    return light.activeDirection !== 'NS' || light.isYellow;
  }
}

// Spawn a new vehicle on a chosen route
let vehicleCounter = 0;
export function createVehicleInstance(
  type: VehicleType,
  routeNodeIds?: string[],
  customLabel?: string
): Vehicle {
  vehicleCounter++;
  const config = VEHICLE_CONFIGS[type];
  const color = config.colorPool[vehicleCounter % config.colorPool.length];
  const route = routeNodeIds || generateRandomTownRoute();
  const currentSegment = getSegmentForNodePair(route[0], route[1]) || ROAD_SEGMENTS[0];

  const passengers = Math.max(
    1,
    Math.round(type === 'bus' ? 25 + Math.random() * 20 : type === 'angkot' ? 8 + Math.random() * 6 : config.capacity)
  );

  const pose = calculateVehiclePose(currentSegment, 0, type, vehicleCounter);

  return {
    id: `veh_${type}_${vehicleCounter}`,
    type,
    roadId: currentSegment.id,
    lane: 0,
    position: pose.position,
    rotation: pose.rotation,
    speed: config.baseMaxSpeed * (0.6 + Math.random() * 0.4),
    targetSpeed: config.baseMaxSpeed,
    maxSpeed: config.baseMaxSpeed,
    acceleration: 0,
    progress: Math.random() * Math.min(20, currentSegment.length * 0.4),
    distanceToLead: 999,
    isBraking: false,
    color,
    capacity: config.capacity,
    passengers,
    routeNodeIds: route,
    routeIndex: 0,
    waitTime: 0,
    totalTravelTime: 0,
    totalDistanceTraveled: 0,
    customLabel,
  };
}

// Step the vehicle physics and car-following simulation
export function stepTrafficSimulation(
  vehicles: Vehicle[],
  trafficLights: Record<string, TrafficLightState>,
  weather: WeatherType,
  timeOfDay: TimeOfDay,
  deltaTime: number
): { vehicles: Vehicle[]; stats: SimulationStats } {
  // Environmental weather multipliers
  let weatherSpeedMultiplier = 1.0;
  let weatherCautionGap = 1.0;
  if (weather === 'rain') {
    weatherSpeedMultiplier = 0.72; // rain reduces speed
    weatherCautionGap = 1.45; // larger stopping distance
  } else if (weather === 'fog') {
    weatherSpeedMultiplier = 0.85;
    weatherCautionGap = 1.2;
  }

  // Time of day speed limit adjustments
  let timeMultiplier = 1.0;
  if (timeOfDay === 'morning_rush' || timeOfDay === 'evening_rush') {
    timeMultiplier = 0.95;
  } else if (timeOfDay === 'night') {
    timeMultiplier = 1.1;
  }

  // Group vehicles by segment to find leader ahead
  const vehiclesBySegment: Record<string, Vehicle[]> = {};
  for (const veh of vehicles) {
    if (!vehiclesBySegment[veh.roadId]) {
      vehiclesBySegment[veh.roadId] = [];
    }
    vehiclesBySegment[veh.roadId].push(veh);
  }

  // Sort vehicles in each segment by progress (descending: highest progress is leader ahead)
  for (const segmentId of Object.keys(vehiclesBySegment)) {
    vehiclesBySegment[segmentId].sort((a, b) => b.progress - a.progress);
  }

  const updatedVehicles: Vehicle[] = [];
  let totalSpeed = 0;
  let stoppedCount = 0;
  let totalPassengers = 0;
  let totalFuelLitersPerHour = 0;
  let totalRoadSpaceM2 = 0;
  let schoolBusDelays: number[] = [];

  for (let i = 0; i < vehicles.length; i++) {
    const veh = { ...vehicles[i] };
    const config = VEHICLE_CONFIGS[veh.type];
    const segment = ROAD_SEGMENTS.find((s) => s.id === veh.roadId) || ROAD_SEGMENTS[0];

    // Find lead vehicle on this segment
    const segmentVehicles = vehiclesBySegment[veh.roadId] || [];
    const vehIndex = segmentVehicles.findIndex((v) => v.id === veh.id);
    let leadVehicle: Vehicle | null = null;
    let distanceToLead = 999;

    if (vehIndex > 0) {
      leadVehicle = segmentVehicles[vehIndex - 1];
      distanceToLead = leadVehicle.progress - veh.progress - (leadVehicle.type === 'bus' ? 9.5 : 4.5);
    }

    // Check intersection stop line
    const isApproachingIntersection = segment.length - veh.progress < 18;
    const isRedLight = isLightRedForSegment(segment, trafficLights);
    const mustStopAtLight = isApproachingIntersection && isRedLight;

    if (mustStopAtLight && distanceToLead > segment.length - veh.progress) {
      // Virtual obstacle at stop line
      distanceToLead = Math.max(0.1, segment.length - veh.progress);
    }

    veh.distanceToLead = distanceToLead;

    // Desired target speed with multipliers
    const speedLimitMps = (segment.speedLimit * 1000) / 3600;
    const desiredSpeed = Math.min(config.baseMaxSpeed, speedLimitMps) * weatherSpeedMultiplier * timeMultiplier;

    // IDM (Intelligent Driver Model) / Car following acceleration calculation
    const desiredMinGap = config.minGap * weatherCautionGap;
    const s0 = desiredMinGap;
    const T = 1.2; // safe time headway (seconds)
    const v = veh.speed;
    const deltaV = leadVehicle ? v - leadVehicle.speed : 0;

    // Dynamic desired gap
    const sStar = s0 + Math.max(0, v * T + (v * deltaV) / (2 * Math.sqrt(2.0 * 2.5)));

    // Free acceleration term
    const aMax = 2.0; // max acceleration m/s²
    const bComfort = 2.8; // comfortable deceleration m/s²
    let acceleration = aMax * (1 - Math.pow(Math.max(0, v / Math.max(0.1, desiredSpeed)), 4));

    // Interaction braking term with lead vehicle or red light
    if (distanceToLead < 60) {
      const brakeTerm = Math.pow(sStar / Math.max(0.2, distanceToLead), 2);
      acceleration -= bComfort * brakeTerm;
    }

    // Emergency hard braking if too close
    if (distanceToLead < s0 * 0.7) {
      acceleration = -5.0;
    }

    // Update speed
    veh.acceleration = acceleration;
    veh.speed = Math.max(0, Math.min(desiredSpeed * 1.15, veh.speed + acceleration * deltaTime));
    veh.isBraking = acceleration < -0.8;

    // Progress along current road segment
    veh.progress += veh.speed * deltaTime;
    veh.totalDistanceTraveled += veh.speed * deltaTime;
    veh.totalTravelTime += deltaTime;

    if (veh.speed < 1.0) {
      veh.waitTime += deltaTime;
      stoppedCount++;
    }

    // Check if vehicle has reached end of segment
    if (veh.progress >= segment.length) {
      // Transition to next segment in route
      const nextRouteIndex = veh.routeIndex + 1;

      if (nextRouteIndex + 1 < veh.routeNodeIds.length) {
        const nextFromNode = veh.routeNodeIds[nextRouteIndex];
        const nextToNode = veh.routeNodeIds[nextRouteIndex + 1];
        const nextSeg = getSegmentForNodePair(nextFromNode, nextToNode);

        if (nextSeg) {
          veh.roadId = nextSeg.id;
          veh.routeIndex = nextRouteIndex;
          veh.progress = 0.5;
        } else {
          // Route completed or blocked: generate new continuous route
          const newRoute = generateRandomTownRoute();
          veh.routeNodeIds = newRoute;
          veh.routeIndex = 0;
          const newSeg = getSegmentForNodePair(newRoute[0], newRoute[1]) || ROAD_SEGMENTS[0];
          veh.roadId = newSeg.id;
          veh.progress = 0;
        }
      } else {
        // Finished trip: loop with a new route
        const newRoute = generateRandomTownRoute();
        veh.routeNodeIds = newRoute;
        veh.routeIndex = 0;
        const newSeg = getSegmentForNodePair(newRoute[0], newRoute[1]) || ROAD_SEGMENTS[0];
        veh.roadId = newSeg.id;
        veh.progress = 0;
      }
    }

    // Update 3D pose
    const currentSeg = ROAD_SEGMENTS.find((s) => s.id === veh.roadId) || segment;
    const pose = calculateVehiclePose(currentSeg, veh.progress, veh.type, i);
    veh.position = pose.position;
    veh.rotation = pose.rotation;

    // Stats accumulation
    totalSpeed += veh.speed;
    totalPassengers += veh.passengers;
    totalRoadSpaceM2 += config.roadSpaceM2;

    // Fuel consumption: idle/stop and go uses significantly more fuel (L/hr)
    const baseLitersPerHour = (config.fuelConsumptionLPer100Km * Math.max(15, veh.speed * 3.6)) / 100;
    const idlePenalty = veh.speed < 2.0 ? 1.8 : 1.0;
    totalFuelLitersPerHour += baseLitersPerHour * idlePenalty;

    // School bus delay tracking
    if (veh.type === 'bus' && veh.customLabel?.includes('Sekolah')) {
      const freeFlowTime = veh.totalDistanceTraveled / (config.baseMaxSpeed || 1);
      const actualDelay = Math.max(0, (veh.totalTravelTime - freeFlowTime) / 60);
      schoolBusDelays.push(actualDelay);
    }

    updatedVehicles.push(veh);
  }

  // Calculate high-level simulation statistics
  const vehicleCount = Math.max(1, updatedVehicles.length);
  const avgSpeedMps = totalSpeed / vehicleCount;
  const avgSpeedKmh = avgSpeedMps * 3.6;

  // Congestion percentage: based on deviation from free flow speed (35 km/h standard)
  const freeFlowKmh = 35.0;
  const speedRatio = Math.min(1.0, avgSpeedKmh / freeFlowKmh);
  const stoppedRatio = stoppedCount / vehicleCount;
  const congestionPercentage = Math.round(
    Math.min(100, Math.max(0, (1 - speedRatio) * 70 + stoppedRatio * 30))
  );

  // Average travel time across town (approx 1.2km typical small town trip)
  const townTripDistanceKm = 1.2;
  const averageTripTimeMinutes = (townTripDistanceKm / Math.max(3.0, avgSpeedKmh)) * 60;

  // School bus delay (estimated average minutes delayed compared to clear flow)
  const avgBusDelay =
    schoolBusDelays.length > 0
      ? schoolBusDelays.reduce((a, b) => a + b, 0) / schoolBusDelays.length
      : Math.max(1.2, (congestionPercentage / 100) * 28.5);

  // Economic loss calculation (fuel in IDR @ Rp 14.500/liter Pertalite/Solar + lost productivity)
  const fuelCostIdr = totalFuelLitersPerHour * 14500;
  const timeLossIdr = (congestionPercentage / 100) * totalPassengers * 25000; // Rp 25k/hour value of time
  const economicLossIdrPerHour = Math.round(fuelCostIdr + timeLossIdr);

  // CO2 Emissions (approx 2.3 kg CO2 per liter of fuel)
  const co2EmissionsKgPerHour = Math.round(totalFuelLitersPerHour * 2.31 * 10) / 10;

  // Public vs Private Mode Split percentage
  const publicPassengers = updatedVehicles
    .filter((v) => v.type === 'angkot' || v.type === 'bus')
    .reduce((sum, v) => sum + v.passengers, 0);
  const totalCommuters = Math.max(1, totalPassengers);
  const publicPct = Math.round((publicPassengers / totalCommuters) * 100);
  const privatePct = 100 - publicPct;

  const stats: SimulationStats = {
    totalActiveVehicles: updatedVehicles.length,
    totalCommutersInTransit: totalCommuters,
    averageSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
    congestionPercentage,
    averageTripTimeMinutes: Math.round(averageTripTimeMinutes * 10) / 10,
    schoolBusDelayMinutes: Math.round(avgBusDelay * 10) / 10,
    fuelWastedLitersPerHour: Math.round(totalFuelLitersPerHour * 10) / 10,
    economicLossIdrPerHour,
    co2EmissionsKgPerHour,
    roadSpaceOccupiedM2: Math.round(totalRoadSpaceM2),
    modeSplit: {
      privatePct,
      publicPct,
    },
  };

  return { vehicles: updatedVehicles, stats };
}
