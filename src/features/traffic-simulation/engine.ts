import {
  RoadNode,
  RoadSegment,
  TrafficLightState,
  Vehicle,
  VehicleType,
  WeatherType,
  TimeOfDay,
  SimulationStats,
  TripPoint,
  DetailedRoute,
  RouteSegmentBreakdown,
} from '../../types';
import { ROAD_SEGMENTS, TOWN_NODES, NODE_CONNECTIONS, TOWN_LANDMARKS, findNearestRoadNode } from '../town-scene/constants';

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

  // Indonesian Left-Hand Drive (LHD):
  // When driving East (+X): Left lane is North (-Z)
  // When driving West (-X): Left lane is South (+Z)
  // When driving South (+Z): Left lane is East (+X)
  // When driving North (-Z): Left lane is West (-X)
  const dirX = dx / totalLength;
  const dirZ = dz / totalLength;

  // Correct 2D Left Normal Vector
  const leftNormalX = dirZ;
  const leftNormalZ = -dirX;

  // Indonesian Left-Hand Drive offset: 1.75 meters to the left of the road centerline
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

  const fromNode = TOWN_NODES[segment.fromNodeId];
  const toNode = TOWN_NODES[segment.toNodeId];

  // Determine East-West vs North-South based on geometry and name
  const isEastWest = fromNode && toNode
    ? Math.abs(toNode.x - fromNode.x) > Math.abs(toNode.z - fromNode.z)
    : segment.name.toLowerCase().includes('sudirman') || segment.name.toLowerCase().includes('kartini');

  if (isEastWest) {
    // East-West corridor (Jl. Sudirman & Jl. Kartini): Green only when activeDirection === 'EW' and NOT yellow
    return light.activeDirection !== 'EW' || light.isYellow;
  } else {
    // North-South corridor (Jl. Merdeka & Jl. Diponegoro): Green only when activeDirection === 'NS' and NOT yellow
    return light.activeDirection !== 'NS' || light.isYellow;
  }
}

// Helper to check if a vehicle is currently inside or traversing an intersection box
const INTERSECTION_POSITIONS: Record<string, { x: number; z: number }> = {
  int_nw: { x: -35, z: -25 },
  int_ne: { x: 35, z: -25 },
  int_sw: { x: -35, z: 35 },
  int_se: { x: 35, z: 35 },
};

export function isVehicleInsideIntersection(veh: Vehicle, intId: string, margin = 8.5): boolean {
  const center = INTERSECTION_POSITIONS[intId];
  if (!center) return false;
  const [vx, , vz] = veh.position;
  return Math.abs(vx - center.x) <= margin && Math.abs(vz - center.z) <= margin;
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
    Math.round(
      type === 'bus'
        ? 25 + Math.random() * 20
        : type === 'angkot'
        ? 8 + Math.random() * 6
        : config.capacity
    )
  );

  const initialProgress = Math.random() * Math.min(25, currentSegment.length * 0.45);
  const pose = calculateVehiclePose(currentSegment, initialProgress, type, vehicleCounter);

  return {
    id: `veh_${type}_${vehicleCounter}`,
    type,
    roadId: currentSegment.id,
    lane: 0,
    position: pose.position,
    rotation: pose.rotation,
    speed: config.baseMaxSpeed * (0.6 + Math.random() * 0.35),
    targetSpeed: config.baseMaxSpeed,
    maxSpeed: config.baseMaxSpeed,
    acceleration: 0,
    progress: initialProgress,
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

// Step the vehicle physics, collision avoidance, and intersection reservation simulation
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
    weatherSpeedMultiplier = 0.75;
    weatherCautionGap = 1.35;
  } else if (weather === 'fog') {
    weatherSpeedMultiplier = 0.88;
    weatherCautionGap = 1.15;
  }

  // Time of day speed limit adjustments
  let timeMultiplier = 1.0;
  if (timeOfDay === 'morning_rush' || timeOfDay === 'evening_rush') {
    timeMultiplier = 0.95;
  } else if (timeOfDay === 'night') {
    timeMultiplier = 1.08;
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

  // Track vehicles currently occupying each intersection box for collision-free reservation
  const intersectionOccupancy: Record<string, Vehicle[]> = {
    int_nw: [],
    int_ne: [],
    int_sw: [],
    int_se: [],
  };

  for (const v of vehicles) {
    for (const intId of Object.keys(intersectionOccupancy)) {
      if (isVehicleInsideIntersection(v, intId, 6.0)) {
        intersectionOccupancy[intId].push(v);
      }
    }
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
      const leadLength = leadVehicle.type === 'bus' ? 9.5 : leadVehicle.type === 'truck' ? 5.5 : 4.2;
      distanceToLead = leadVehicle.progress - veh.progress - leadLength;
    } else {
      // Check downstream segment if at head of current segment
      const nextRouteIndex = veh.routeIndex + 1;
      if (nextRouteIndex + 1 < veh.routeNodeIds.length) {
        const nextFrom = veh.routeNodeIds[nextRouteIndex];
        const nextTo = veh.routeNodeIds[nextRouteIndex + 1];
        const nextSeg = getSegmentForNodePair(nextFrom, nextTo);
        if (nextSeg && vehiclesBySegment[nextSeg.id]?.length > 0) {
          const downstreamVehicles = vehiclesBySegment[nextSeg.id];
          const downstreamLeader = downstreamVehicles[downstreamVehicles.length - 1];
          const leadLength = downstreamLeader.type === 'bus' ? 9.5 : 4.2;
          const distThroughInt = (segment.length - veh.progress) + downstreamLeader.progress - leadLength;
          if (distThroughInt < distanceToLead) {
            leadVehicle = downstreamLeader;
            distanceToLead = distThroughInt;
          }
        }
      }
    }

    // Stop Line & Intersection Reservation Logic
    const targetIntersectionId = segment.toNodeId;
    const isIntersectionApproach = TOWN_NODES[targetIntersectionId]?.isIntersection;
    const stopLinePosition = segment.length - 6.0; // Stop line is 6m before intersection center
    const distanceToStopLine = Math.max(0, stopLinePosition - veh.progress);

    if (isIntersectionApproach) {
      const isRedOrYellow = isLightRedForSegment(segment, trafficLights);

      // Condition 1: Must stop at Red or Yellow signal
      if (isRedOrYellow) {
        if (veh.progress <= stopLinePosition + 0.5) {
          distanceToLead = Math.min(distanceToLead, distanceToStopLine);
        }
      } else {
        // Condition 2: Signal is GREEN — Apply "Don't Block The Box" / Anti-Gridlock & Conflict Check
        if (distanceToStopLine < 14.0 && veh.progress <= stopLinePosition + 0.5) {
          const occupants = intersectionOccupancy[targetIntersectionId] || [];
          const conflictingOccupants = occupants.filter((occ) => occ.id !== veh.id && occ.roadId !== veh.roadId);

          // Check if another vehicle is also approaching the same intersection on green but is closer to stop line
          const approachingCompetitor = vehicles.find((other) => {
            if (other.id === veh.id) return false;
            const otherSeg = ROAD_SEGMENTS.find((s) => s.id === other.roadId);
            if (!otherSeg || otherSeg.toNodeId !== targetIntersectionId) return false;
            if (otherSeg.id === segment.id) return false; // same segment is handled by lead vehicle
            const otherStopLine = otherSeg.length - 6.0;
            const otherDist = otherStopLine - other.progress;
            return otherDist >= -1.0 && otherDist < distanceToStopLine;
          });

          // Check if downstream segment has queue blocking the exit
          const nextRouteIndex = veh.routeIndex + 1;
          let isNextSegmentBlocked = false;
          if (nextRouteIndex + 1 < veh.routeNodeIds.length) {
            const nextFrom = veh.routeNodeIds[nextRouteIndex];
            const nextTo = veh.routeNodeIds[nextRouteIndex + 1];
            const nextSeg = getSegmentForNodePair(nextFrom, nextTo);
            if (nextSeg && vehiclesBySegment[nextSeg.id]?.length > 0) {
              const slowestNearEntrance = vehiclesBySegment[nextSeg.id].find((v) => v.progress < 9.0 && v.speed < 1.5);
              if (slowestNearEntrance) {
                isNextSegmentBlocked = true;
              }
            }
          }

          if (conflictingOccupants.length > 0 || approachingCompetitor || isNextSegmentBlocked) {
            distanceToLead = Math.min(distanceToLead, Math.max(0.1, distanceToStopLine));
          }
        }
      }
    }

    veh.distanceToLead = distanceToLead;

    // Desired target speed
    const speedLimitMps = (segment.speedLimit * 1000) / 3600;
    const desiredSpeed = Math.min(config.baseMaxSpeed, speedLimitMps) * weatherSpeedMultiplier * timeMultiplier;

    // IDM (Intelligent Driver Model) car-following
    const s0 = config.minGap * weatherCautionGap;
    const T = 1.3;
    const v = veh.speed;
    const deltaV = leadVehicle ? v - leadVehicle.speed : 0;

    const sStar = s0 + Math.max(0, v * T + (v * deltaV) / (2 * Math.sqrt(2.2 * 3.0)));

    const aMax = 2.2;
    const bComfort = 3.2;
    let acceleration = aMax * (1 - Math.pow(Math.max(0, v / Math.max(0.1, desiredSpeed)), 4));

    if (distanceToLead < 50) {
      const brakeTerm = Math.pow(sStar / Math.max(0.3, distanceToLead), 2);
      acceleration -= bComfort * brakeTerm;
    }

    if (distanceToLead < s0 * 0.85) {
      acceleration = -6.0;
    }

    // Stop at red or waiting at intersection
    if (isIntersectionApproach) {
      const mustHoldAtStopLine =
        isLightRedForSegment(segment, trafficLights) ||
        (distanceToLead <= distanceToStopLine + 0.2 && distanceToStopLine < 1.5);

      if (mustHoldAtStopLine && veh.progress >= stopLinePosition - 1.0 && veh.progress <= stopLinePosition + 0.5) {
        acceleration = -8.0;
        veh.speed = 0;
      }
    }

    veh.acceleration = acceleration;
    veh.speed = Math.max(0, Math.min(desiredSpeed * 1.1, veh.speed + acceleration * deltaTime));
    veh.isBraking = acceleration < -1.0;

    veh.progress += veh.speed * deltaTime;

    // Strict Stop Line Clamping on Red / Yield
    if (isIntersectionApproach && (isLightRedForSegment(segment, trafficLights) || distanceToLead <= distanceToStopLine + 0.1)) {
      if (veh.progress > stopLinePosition && veh.progress <= stopLinePosition + 2.0) {
        veh.progress = stopLinePosition;
        veh.speed = 0;
      }
    }

    // Strict Same-Lane Leader Headway Clamping
    if (leadVehicle && leadVehicle.roadId === veh.roadId) {
      const leadLength = leadVehicle.type === 'bus' ? 9.5 : leadVehicle.type === 'truck' ? 5.5 : 4.2;
      const minProgressBehind = leadVehicle.progress - leadLength - (config.minGap * 0.75);
      if (veh.progress > minProgressBehind) {
        veh.progress = Math.max(0, minProgressBehind);
        veh.speed = Math.min(veh.speed, Math.max(0, leadVehicle.speed * 0.8));
      }
    }

    veh.totalDistanceTraveled += veh.speed * deltaTime;
    veh.totalTravelTime += deltaTime;

    if (veh.speed < 0.8) {
      veh.waitTime += deltaTime;
      stoppedCount++;
    }

    // Segment Transition
    if (veh.progress >= segment.length) {
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
          const newRoute = generateRandomTownRoute();
          veh.routeNodeIds = newRoute;
          veh.routeIndex = 0;
          const newSeg = getSegmentForNodePair(newRoute[0], newRoute[1]) || ROAD_SEGMENTS[0];
          veh.roadId = newSeg.id;
          veh.progress = 0;
        }
      } else {
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

    totalSpeed += veh.speed;
    totalPassengers += veh.passengers;
    totalRoadSpaceM2 += config.roadSpaceM2;

    const baseLitersPerHour = (config.fuelConsumptionLPer100Km * Math.max(15, veh.speed * 3.6)) / 100;
    const idlePenalty = veh.speed < 2.0 ? 1.8 : 1.0;
    totalFuelLitersPerHour += baseLitersPerHour * idlePenalty;

    if (veh.type === 'bus' && veh.customLabel?.includes('Sekolah')) {
      const freeFlowTime = veh.totalDistanceTraveled / (config.baseMaxSpeed || 1);
      const actualDelay = Math.max(0, (veh.totalTravelTime - freeFlowTime) / 60);
      schoolBusDelays.push(actualDelay);
    }

    updatedVehicles.push(veh);
  }

  // Global Proximity Collision Resolution & Physical Displacement Pass
  for (let a = 0; a < updatedVehicles.length; a++) {
    for (let b = a + 1; b < updatedVehicles.length; b++) {
      const vA = updatedVehicles[a];
      const vB = updatedVehicles[b];
      const dx = vA.position[0] - vB.position[0];
      const dz = vA.position[2] - vB.position[2];
      const dist = Math.hypot(dx, dz);

      const radA = vA.type === 'bus' ? 4.8 : vA.type === 'truck' ? 2.9 : vA.type === 'motorcycle' ? 1.2 : 2.2;
      const radB = vB.type === 'bus' ? 4.8 : vB.type === 'truck' ? 2.9 : vB.type === 'motorcycle' ? 1.2 : 2.2;
      const minDist = radA + radB + 0.4;

      if (dist < minDist && dist > 0.001) {
        // Decide which vehicle yields
        const yieldVeh = vA.speed <= vB.speed ? vA : vB;
        const leadVeh = yieldVeh === vA ? vB : vA;

        yieldVeh.speed = Math.max(0, yieldVeh.speed * 0.2);
        yieldVeh.isBraking = true;

        // Push yielding vehicle back along its segment progress to eliminate physical overlap
        const overlap = minDist - dist + 0.15;
        yieldVeh.progress = Math.max(0, yieldVeh.progress - overlap);
        const seg = ROAD_SEGMENTS.find((s) => s.id === yieldVeh.roadId);
        if (seg) {
          const newPose = calculateVehiclePose(seg, yieldVeh.progress, yieldVeh.type, 0);
          yieldVeh.position = newPose.position;
          yieldVeh.rotation = newPose.rotation;
        }
      }
    }
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

// Calculate high-precision route, 3D path polyline, and dynamic live-traffic ETAs
export function calculateDetailedRoute(
  startPoint: TripPoint,
  endPoint: TripPoint,
  vehicles: Vehicle[],
  trafficLights: Record<string, TrafficLightState>,
  weather: WeatherType
): DetailedRoute {
  const [sx, sy, sz] = startPoint.position;
  const [ex, ey, ez] = endPoint.position;

  // Find nearest entry and exit nodes on the road network
  const startNode = findNearestRoadNode(sx, sz);
  const endNode = findNearestRoadNode(ex, ez);

  const nodePath = findNodePath(startNode.id, endNode.id);
  const segmentBreakdowns: RouteSegmentBreakdown[] = [];
  const segmentIds: string[] = [];
  const pathPoints: [number, number, number][] = [];

  // Start with initial point
  pathPoints.push([sx, 0.4, sz]);

  // Connect to road entry node
  pathPoints.push([startNode.x, 0.35, startNode.z]);

  let totalDistanceMeters = Math.hypot(startNode.x - sx, startNode.z - sz);
  let totalFreeTimeSec = totalDistanceMeters / 6.0; // 6 m/s walking / local access
  let totalLiveTimeSec = totalFreeTimeSec;

  // Weather speed penalty
  const weatherMult = weather === 'rain' ? 0.72 : weather === 'fog' ? 0.85 : 1.0;

  // Traverse all segments in the path
  for (let i = 0; i < nodePath.length - 1; i++) {
    const fromId = nodePath[i];
    const toId = nodePath[i + 1];
    const segment = getSegmentForNodePair(fromId, toId);

    if (segment) {
      segmentIds.push(segment.id);
      const toNode = TOWN_NODES[toId];
      if (toNode) {
        pathPoints.push([toNode.x, 0.35, toNode.z]);
      }

      totalDistanceMeters += segment.length;

      // Calculate live speeds on this segment
      const vehiclesOnSegment = vehicles.filter((v) => v.roadId === segment.id);
      const freeSpeedMps = ((segment.speedLimit * 1000) / 3600) * weatherMult;
      const freeSpeedKmh = freeSpeedMps * 3.6;

      let liveSpeedMps = freeSpeedMps;
      let isWaitingAtRed = false;
      let lightWaitSec = 0;

      if (vehiclesOnSegment.length > 0) {
        const avgSpeed = vehiclesOnSegment.reduce((sum, v) => sum + v.speed, 0) / vehiclesOnSegment.length;
        liveSpeedMps = Math.max(1.2, avgSpeed);
      }

      // Check red light queue impact at segment exit
      const isRed = isLightRedForSegment(segment, trafficLights);
      if (isRed) {
        isWaitingAtRed = true;
        const queueCount = vehiclesOnSegment.filter((v) => v.speed < 2.0).length;
        lightWaitSec = 4.0 + Math.min(22, queueCount * 3.5);
      }

      const segFreeTime = segment.length / freeSpeedMps;
      const segLiveTime = segment.length / liveSpeedMps + lightWaitSec;

      totalFreeTimeSec += segFreeTime;
      totalLiveTimeSec += segLiveTime;

      const liveSpeedKmh = Math.round(liveSpeedMps * 3.6 * 10) / 10;
      const congestionPct = Math.round(Math.min(100, Math.max(0, (1 - liveSpeedMps / freeSpeedMps) * 100)));

      segmentBreakdowns.push({
        segmentId: segment.id,
        segmentName: segment.name,
        lengthMeters: segment.length,
        liveSpeedKmh,
        freeSpeedKmh: Math.round(freeSpeedKmh * 10) / 10,
        congestionPct,
        traversalTimeSec: Math.round(segLiveTime),
        isRedLightWaiting: isWaitingAtRed,
      });
    }
  }

  // Connect to final destination
  pathPoints.push([ex, 0.4, ez]);
  const exitDist = Math.hypot(ex - endNode.x, ez - endNode.z);
  totalDistanceMeters += exitDist;
  const exitAccessSec = exitDist / 6.0;
  totalFreeTimeSec += exitAccessSec;
  totalLiveTimeSec += exitAccessSec;

  const delaySeconds = Math.max(0, totalLiveTimeSec - totalFreeTimeSec);

  // Compute mode-specific accurate travel times
  const carLiveSec = Math.round(totalLiveTimeSec);
  const carClearSec = Math.round(totalFreeTimeSec);
  const carDelaySec = Math.round(delaySeconds);

  // Motorbike can filter through traffic (~35% less delay)
  const bikeLiveSec = Math.round(totalFreeTimeSec * 0.9 + delaySeconds * 0.45);
  const bikeClearSec = Math.round(totalFreeTimeSec * 0.9);
  const bikeDelaySec = Math.max(0, bikeLiveSec - bikeClearSec);

  // Angkot: fast boarding stops + standard traffic flow
  const angkotLiveSec = Math.round(totalLiveTimeSec * 1.05 + 12);
  const angkotClearSec = Math.round(totalFreeTimeSec * 1.05 + 12);
  const angkotDelaySec = Math.max(0, angkotLiveSec - angkotClearSec);

  // Bus: dedicated capacity, steady boarding
  const busLiveSec = Math.round(totalLiveTimeSec * 1.1 + 15);
  const busClearSec = Math.round(totalFreeTimeSec * 1.1 + 15);
  const busDelaySec = Math.max(0, busLiveSec - busClearSec);

  return {
    pathPoints,
    segmentIds,
    totalDistanceMeters: Math.round(totalDistanceMeters),
    freeFlowTimeSeconds: Math.round(totalFreeTimeSec),
    liveTrafficTimeSeconds: Math.round(totalLiveTimeSec),
    delaySeconds: Math.round(delaySeconds),
    segmentBreakdowns,
    modeTimes: {
      car: { liveSec: carLiveSec, delaySec: carDelaySec, clearSec: carClearSec },
      motorcycle: { liveSec: bikeLiveSec, delaySec: bikeDelaySec, clearSec: bikeClearSec },
      angkot: { liveSec: angkotLiveSec, delaySec: angkotDelaySec, clearSec: angkotClearSec },
      bus: { liveSec: busLiveSec, delaySec: busDelaySec, clearSec: busClearSec },
    },
  };
}

