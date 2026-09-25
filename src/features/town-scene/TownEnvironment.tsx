import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useTrafficStore } from '../../store/useTrafficStore';
import { ROAD_WIDTH, SIDEWALK_WIDTH, TOWN_PLACES } from './constants';
import { TripPoint } from '../../types';

export const TownEnvironment: React.FC = () => {
  const weather = useTrafficStore((s) => s.weather);
  const timeOfDay = useTrafficStore((s) => s.timeOfDay);
  const trafficLights = useTrafficStore((s) => s.trafficLights);
  const startPoint = useTrafficStore((s) => s.startPoint);
  const endPoint = useTrafficStore((s) => s.endPoint);
  const detailedRoute = useTrafficStore((s) => s.detailedRoute);
  const openContextMenu = useTrafficStore((s) => s.openContextMenu);
  const setTripStartPoint = useTrafficStore((s) => s.setTripStartPoint);
  const setTripEndPoint = useTrafficStore((s) => s.setTripEndPoint);

  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  // Rain particles system
  const rainCount = 1800;
  const rainGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 1] = Math.random() * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const rainRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (weather === 'rain' && rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= delta * 55;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 40 + Math.random() * 5;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Materials
  const asphaltMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: weather === 'rain' ? '#111827' : '#1E293B',
        roughness: weather === 'rain' ? 0.2 : 0.7,
        metalness: weather === 'rain' ? 0.4 : 0.1,
      }),
    [weather]
  );

  const sidewalkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#64748B',
        roughness: 0.8,
      }),
    []
  );

  const grassMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: timeOfDay === 'night' ? '#064E3B' : '#15803D',
        roughness: 0.9,
      }),
    [timeOfDay]
  );

  const tileRoofMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#9A3412',
        roughness: 0.6,
      }),
    []
  );

  const buildingWallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#F8FAFC',
        roughness: 0.6,
      }),
    []
  );

  const schoolWallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FEF08A',
        roughness: 0.7,
      }),
    []
  );

  // Right-click / Context Menu Handler for 3D elements
  const handlePlaceContextMenu = (e: ThreeEvent<MouseEvent>, place: TripPoint) => {
    e.stopPropagation();
    // nativeEvent gives true clientX & clientY on the browser window
    const nativeEv = e.nativeEvent as MouseEvent;
    openContextMenu(nativeEv.clientX, nativeEv.clientY, place);
  };

  // Ground right-click for arbitrary custom coordinates
  const handleGroundContextMenu = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const point: [number, number, number] = [
      Math.round(e.point.x * 10) / 10,
      0,
      Math.round(e.point.z * 10) / 10,
    ];
    const customPlace: TripPoint = {
      id: `custom_${point[0]}_${point[2]}`,
      name: `Lokasi (${point[0]}, ${point[2]})`,
      position: point,
      category: 'custom',
      description: 'Titik koordinat kustom di Kota Sukamaju',
    };
    const nativeEv = e.nativeEvent as MouseEvent;
    openContextMenu(nativeEv.clientX, nativeEv.clientY, customPlace);
  };

  // Build the 3D route path tube / line
  const routeLineGeometry = useMemo(() => {
    if (!detailedRoute || detailedRoute.pathPoints.length < 2) return null;

    const vectors = detailedRoute.pathPoints.map((p) => new THREE.Vector3(p[0], 0.28, p[2]));
    // Create CatmullRomCurve3 with mild tension for clean street turns
    const curve = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.15);
    return new THREE.TubeGeometry(curve, 120, 0.45, 8, false);
  }, [detailedRoute]);

  return (
    <group onPointerMissed={() => {}}>
      {/* 1. Base Terrain Grass with Right-Click support */}
      <mesh
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={grassMat}
        receiveShadow
        onContextMenu={handleGroundContextMenu}
      >
        <planeGeometry args={[260, 240]} />
      </mesh>

      {/* 2. Four Intersecting Town Roads */}
      {/* Jl. Sudirman (East-West at Z = -25) */}
      <group position={[0, 0, -25]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={asphaltMat} receiveShadow>
          <planeGeometry args={[210, ROAD_WIDTH]} />
        </mesh>
        <mesh position={[0, 0.08, (ROAD_WIDTH + SIDEWALK_WIDTH) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[210, SIDEWALK_WIDTH]} />
        </mesh>
        <mesh position={[0, 0.08, -(ROAD_WIDTH + SIDEWALK_WIDTH) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[210, SIDEWALK_WIDTH]} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[210, 0.2]} />
          <meshBasicMaterial color="#F8FAFC" />
        </mesh>
      </group>

      {/* Jl. Kartini (East-West at Z = 35) */}
      <group position={[0, 0, 35]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={asphaltMat} receiveShadow>
          <planeGeometry args={[210, ROAD_WIDTH]} />
        </mesh>
        <mesh position={[0, 0.08, (ROAD_WIDTH + SIDEWALK_WIDTH) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[210, SIDEWALK_WIDTH]} />
        </mesh>
        <mesh position={[0, 0.08, -(ROAD_WIDTH + SIDEWALK_WIDTH) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[210, SIDEWALK_WIDTH]} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[210, 0.2]} />
          <meshBasicMaterial color="#F8FAFC" />
        </mesh>
      </group>

      {/* Jl. Merdeka (North-South at X = -35) */}
      <group position={[-35, 0, 0]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} material={asphaltMat} receiveShadow>
          <planeGeometry args={[190, ROAD_WIDTH]} />
        </mesh>
        <mesh position={[(ROAD_WIDTH + SIDEWALK_WIDTH) / 2, 0.08, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[190, SIDEWALK_WIDTH]} />
        </mesh>
        <mesh position={[-(ROAD_WIDTH + SIDEWALK_WIDTH) / 2, 0.08, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[190, SIDEWALK_WIDTH]} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[190, 0.2]} />
          <meshBasicMaterial color="#F8FAFC" />
        </mesh>
      </group>

      {/* Jl. Diponegoro (North-South at X = 35) */}
      <group position={[35, 0, 0]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} material={asphaltMat} receiveShadow>
          <planeGeometry args={[190, ROAD_WIDTH]} />
        </mesh>
        <mesh position={[(ROAD_WIDTH + SIDEWALK_WIDTH) / 2, 0.08, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[190, SIDEWALK_WIDTH]} />
        </mesh>
        <mesh position={[-(ROAD_WIDTH + SIDEWALK_WIDTH) / 2, 0.08, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[190, SIDEWALK_WIDTH]} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[190, 0.2]} />
          <meshBasicMaterial color="#F8FAFC" />
        </mesh>
      </group>

      {/* 3. Four Intersections Zebra Crossings */}
      {[
        [-35, -25],
        [35, -25],
        [-35, 35],
        [35, 35],
      ].map(([x, z], idx) => (
        <group key={idx} position={[x, 0.04, z]}>
          <mesh position={[4.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.6, 6.0]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
          </mesh>
          <mesh position={[-4.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.6, 6.0]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0, -4.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[1.6, 6.0]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0, 4.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[1.6, 6.0]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
          </mesh>
        </group>
      ))}

      {/* 4. Active Indonesian L-Pole Cantilever Traffic Lights (Tiang APILL Mast-Arm) & Stop Lines */}
      {[
        { id: 'int_nw', x: -35, z: -25 },
        { id: 'int_ne', x: 35, z: -25 },
        { id: 'int_sw', x: -35, z: 35 },
        { id: 'int_se', x: 35, z: 35 },
      ].map(({ id, x, z }) => {
        const light = trafficLights[id];
        const isEWGreen = light?.activeDirection === 'EW' && !light?.isYellow;
        const isEWYellow = light?.activeDirection === 'EW' && light?.isYellow;
        const isEWRed = !isEWGreen && !isEWYellow;

        const isNSGreen = light?.activeDirection === 'NS' && !light?.isYellow;
        const isNSYellow = light?.activeDirection === 'NS' && light?.isYellow;
        const isNSRed = !isNSGreen && !isNSYellow;

        return (
          <group key={id} position={[x, 0, z]}>
            {/* Soft point light for ambient signal glow at the intersection */}
            <pointLight
              position={[0, 4.5, 0]}
              intensity={timeOfDay === 'night' ? 2.5 : 0.8}
              distance={18}
              color={light?.isYellow ? '#FACC15' : light?.activeDirection === 'EW' ? '#22C55E' : '#EF4444'}
            />

            {/* A. Glowing Dynamic Asphalt Stop Lines (Indonesian Road Markings) */}
            {/* 1. Eastbound Approach Stop Line (North lane Z = -1.75, at X = -6.0) */}
            <mesh position={[-6.0, 0.05, -1.75]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.5, 3.2]} />
              <meshBasicMaterial
                color={isEWGreen ? '#22C55E' : isEWYellow ? '#FACC15' : '#EF4444'}
                transparent
                opacity={0.95}
              />
            </mesh>

            {/* 2. Westbound Approach Stop Line (South lane Z = 1.75, at X = 6.0) */}
            <mesh position={[6.0, 0.05, 1.75]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.5, 3.2]} />
              <meshBasicMaterial
                color={isEWGreen ? '#22C55E' : isEWYellow ? '#FACC15' : '#EF4444'}
                transparent
                opacity={0.95}
              />
            </mesh>

            {/* 3. Southbound Approach Stop Line (East lane X = 1.75, at Z = -6.0) */}
            <mesh position={[1.75, 0.05, -6.0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[0.5, 3.2]} />
              <meshBasicMaterial
                color={isNSGreen ? '#22C55E' : isNSYellow ? '#FACC15' : '#EF4444'}
                transparent
                opacity={0.95}
              />
            </mesh>

            {/* 4. Northbound Approach Stop Line (West lane X = -1.75, at Z = 6.0) */}
            <mesh position={[-1.75, 0.05, 6.0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[0.5, 3.2]} />
              <meshBasicMaterial
                color={isNSGreen ? '#22C55E' : isNSYellow ? '#FACC15' : '#EF4444'}
                transparent
                opacity={0.95}
              />
            </mesh>

            {/* B. Four Authentic Indonesian Cantilever Mast-Arm APILL Poles */}

            {/* 1. Eastbound Approach Mast Arm (Pole on North Sidewalk at X=-6.5, Z=-4.8) */}
            <group position={[-6.5, 0, -4.8]}>
              {/* Pole Base with warning stripes */}
              <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.26, 0.6, 12]} />
                <meshStandardMaterial color="#EAB308" roughness={0.4} />
              </mesh>
              {/* Vertical Column */}
              <mesh position={[0, 3.0, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.16, 6.0, 10]} />
                <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Cantilever Horizontal Arm reaching South over Eastbound lane (to Z=+3.05 -> Z=-1.75 in intersection coords) */}
              <mesh position={[0, 5.8, 1.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.11, 3.1, 10]} />
                <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
              </mesh>

              {/* Overhead Signal Head over lane, facing West (rotation -PI/2) towards oncoming Eastbound traffic */}
              <group position={[0, 5.3, 3.05]} rotation={[0, -Math.PI / 2, 0]}>
                {/* Signal Housing Backplate */}
                <mesh castShadow>
                  <boxGeometry args={[0.65, 1.8, 0.38]} />
                  <meshStandardMaterial color="#090D16" roughness={0.5} />
                </mesh>
                <mesh position={[0, 0, -0.05]}>
                  <boxGeometry args={[0.82, 1.95, 0.05]} />
                  <meshStandardMaterial color="#F59E0B" roughness={0.6} />
                </mesh>
                {/* Red Light + Visor */}
                <mesh position={[0, 0.55, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isEWRed ? '#EF4444' : '#450A0A'}
                    emissive={isEWRed ? '#EF4444' : '#000000'}
                    emissiveIntensity={isEWRed ? 5.0 : 0}
                    roughness={0.2}
                  />
                </mesh>
                {/* Yellow Light + Visor */}
                <mesh position={[0, 0.0, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isEWYellow ? '#FACC15' : '#422006'}
                    emissive={isEWYellow ? '#FACC15' : '#000000'}
                    emissiveIntensity={isEWYellow ? 5.0 : 0}
                    roughness={0.2}
                  />
                </mesh>
                {/* Green Light + Visor */}
                <mesh position={[0, -0.55, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isEWGreen ? '#22C55E' : '#052E16'}
                    emissive={isEWGreen ? '#22C55E' : '#000000'}
                    emissiveIntensity={isEWGreen ? 5.0 : 0}
                    roughness={0.2}
                  />
                </mesh>
              </group>

              {/* Lower Auxiliary Signal Head on Pole facing West */}
              <group position={[0, 2.6, 0.25]} rotation={[0, -Math.PI / 2, 0]}>
                <mesh>
                  <boxGeometry args={[0.42, 1.2, 0.25]} />
                  <meshStandardMaterial color="#090D16" />
                </mesh>
                <mesh position={[0, 0.35, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color={isEWRed ? '#EF4444' : '#450A0A'}
                    emissive={isEWRed ? '#EF4444' : '#000000'}
                    emissiveIntensity={isEWRed ? 4.0 : 0}
                  />
                </mesh>
                <mesh position={[0, 0.0, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color={isEWYellow ? '#FACC15' : '#422006'}
                    emissive={isEWYellow ? '#FACC15' : '#000000'}
                    emissiveIntensity={isEWYellow ? 4.0 : 0}
                  />
                </mesh>
                <mesh position={[0, -0.35, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color={isEWGreen ? '#22C55E' : '#052E16'}
                    emissive={isEWGreen ? '#22C55E' : '#000000'}
                    emissiveIntensity={isEWGreen ? 4.0 : 0}
                  />
                </mesh>
              </group>
            </group>

            {/* 2. Westbound Approach Mast Arm (Pole on South Sidewalk at X=6.5, Z=4.8) */}
            <group position={[6.5, 0, 4.8]}>
              {/* Pole Base */}
              <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.26, 0.6, 12]} />
                <meshStandardMaterial color="#EAB308" roughness={0.4} />
              </mesh>
              {/* Column */}
              <mesh position={[0, 3.0, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.16, 6.0, 10]} />
                <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Cantilever Arm reaching North over Westbound lane (to Z=-3.05 -> Z=1.75 in intersection coords) */}
              <mesh position={[0, 5.8, -1.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.11, 3.1, 10]} />
                <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
              </mesh>

              {/* Overhead Signal Head facing East (rotation +PI/2) towards oncoming Westbound traffic */}
              <group position={[0, 5.3, -3.05]} rotation={[0, Math.PI / 2, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.65, 1.8, 0.38]} />
                  <meshStandardMaterial color="#090D16" roughness={0.5} />
                </mesh>
                <mesh position={[0, 0, -0.05]}>
                  <boxGeometry args={[0.82, 1.95, 0.05]} />
                  <meshStandardMaterial color="#F59E0B" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.55, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isEWRed ? '#EF4444' : '#450A0A'}
                    emissive={isEWRed ? '#EF4444' : '#000000'}
                    emissiveIntensity={isEWRed ? 5.0 : 0}
                  />
                </mesh>
                <mesh position={[0, 0.0, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isEWYellow ? '#FACC15' : '#422006'}
                    emissive={isEWYellow ? '#FACC15' : '#000000'}
                    emissiveIntensity={isEWYellow ? 5.0 : 0}
                  />
                </mesh>
                <mesh position={[0, -0.55, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isEWGreen ? '#22C55E' : '#052E16'}
                    emissive={isEWGreen ? '#22C55E' : '#000000'}
                    emissiveIntensity={isEWGreen ? 5.0 : 0}
                  />
                </mesh>
              </group>

              {/* Lower Auxiliary Signal Head facing East */}
              <group position={[0, 2.6, -0.25]} rotation={[0, Math.PI / 2, 0]}>
                <mesh>
                  <boxGeometry args={[0.42, 1.2, 0.25]} />
                  <meshStandardMaterial color="#090D16" />
                </mesh>
                <mesh position={[0, 0.35, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color={isEWRed ? '#EF4444' : '#450A0A'}
                    emissive={isEWRed ? '#EF4444' : '#000000'}
                    emissiveIntensity={isEWRed ? 4.0 : 0}
                  />
                </mesh>
                <mesh position={[0, 0.0, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color={isEWYellow ? '#FACC15' : '#422006'}
                    emissive={isEWYellow ? '#FACC15' : '#000000'}
                    emissiveIntensity={isEWYellow ? 4.0 : 0}
                  />
                </mesh>
                <mesh position={[0, -0.35, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color={isEWGreen ? '#22C55E' : '#052E16'}
                    emissive={isEWGreen ? '#22C55E' : '#000000'}
                    emissiveIntensity={isEWGreen ? 4.0 : 0}
                  />
                </mesh>
              </group>
            </group>

            {/* 3. Southbound Approach Mast Arm (Pole on East Sidewalk at X=4.8, Z=-6.5) */}
            <group position={[4.8, 0, -6.5]}>
              {/* Pole Base */}
              <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.26, 0.6, 12]} />
                <meshStandardMaterial color="#EAB308" roughness={0.4} />
              </mesh>
              {/* Column */}
              <mesh position={[0, 3.0, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.16, 6.0, 10]} />
                <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Cantilever Arm reaching West over Southbound lane (to X=-3.05 -> X=1.75 in intersection coords) */}
              <mesh position={[-1.55, 5.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.09, 0.11, 3.1, 10]} />
                <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
              </mesh>

              {/* Overhead Signal Head facing North (rotation Math.PI) towards oncoming Southbound traffic */}
              <group position={[-3.05, 5.3, 0]} rotation={[0, Math.PI, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.65, 1.8, 0.38]} />
                  <meshStandardMaterial color="#090D16" roughness={0.5} />
                </mesh>
                <mesh position={[0, 0, -0.05]}>
                  <boxGeometry args={[0.82, 1.95, 0.05]} />
                  <meshStandardMaterial color="#F59E0B" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.55, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isNSRed ? '#EF4444' : '#450A0A'}
                    emissive={isNSRed ? '#EF4444' : '#000000'}
                    emissiveIntensity={isNSRed ? 5.0 : 0}
                  />
                </mesh>
                <mesh position={[0, 0.0, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isNSYellow ? '#FACC15' : '#422006'}
                    emissive={isNSYellow ? '#FACC15' : '#000000'}
                    emissiveIntensity={isNSYellow ? 5.0 : 0}
                  />
                </mesh>
                <mesh position={[0, -0.55, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isNSGreen ? '#22C55E' : '#052E16'}
                    emissive={isNSGreen ? '#22C55E' : '#000000'}
                    emissiveIntensity={isNSGreen ? 5.0 : 0}
                  />
                </mesh>
              </group>

              {/* Lower Auxiliary Signal Head facing North */}
              <group position={[-0.25, 2.6, 0]} rotation={[0, Math.PI, 0]}>
                <mesh>
                  <boxGeometry args={[0.42, 1.2, 0.25]} />
                  <meshStandardMaterial color="#090D16" />
                </mesh>
                <mesh position={[0, 0.35, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color={isNSRed ? '#EF4444' : '#450A0A'}
                    emissive={isNSRed ? '#EF4444' : '#000000'}
                    emissiveIntensity={isNSRed ? 4.0 : 0}
                  />
                </mesh>
                <mesh position={[0, 0.0, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color={isNSYellow ? '#FACC15' : '#422006'}
                    emissive={isNSYellow ? '#FACC15' : '#000000'}
                    emissiveIntensity={isNSYellow ? 4.0 : 0}
                  />
                </mesh>
                <mesh position={[0, -0.35, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color={isNSGreen ? '#22C55E' : '#052E16'}
                    emissive={isNSGreen ? '#22C55E' : '#000000'}
                    emissiveIntensity={isNSGreen ? 4.0 : 0}
                  />
                </mesh>
              </group>
            </group>

            {/* 4. Northbound Approach Mast Arm (Pole on West Sidewalk at X=-4.8, Z=6.5) */}
            <group position={[-4.8, 0, 6.5]}>
              {/* Pole Base */}
              <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.26, 0.6, 12]} />
                <meshStandardMaterial color="#EAB308" roughness={0.4} />
              </mesh>
              {/* Column */}
              <mesh position={[0, 3.0, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.16, 6.0, 10]} />
                <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Cantilever Arm reaching East over Northbound lane (to X=3.05 -> X=-1.75 in intersection coords) */}
              <mesh position={[1.55, 5.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.09, 0.11, 3.1, 10]} />
                <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
              </mesh>

              {/* Overhead Signal Head facing South (rotation 0) towards oncoming Northbound traffic */}
              <group position={[3.05, 5.3, 0]} rotation={[0, 0, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.65, 1.8, 0.38]} />
                  <meshStandardMaterial color="#090D16" roughness={0.5} />
                </mesh>
                <mesh position={[0, 0, -0.05]}>
                  <boxGeometry args={[0.82, 1.95, 0.05]} />
                  <meshStandardMaterial color="#F59E0B" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.55, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isNSRed ? '#EF4444' : '#450A0A'}
                    emissive={isNSRed ? '#EF4444' : '#000000'}
                    emissiveIntensity={isNSRed ? 5.0 : 0}
                  />
                </mesh>
                <mesh position={[0, 0.0, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isNSYellow ? '#FACC15' : '#422006'}
                    emissive={isNSYellow ? '#FACC15' : '#000000'}
                    emissiveIntensity={isNSYellow ? 5.0 : 0}
                  />
                </mesh>
                <mesh position={[0, -0.55, 0.22]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={isNSGreen ? '#22C55E' : '#052E16'}
                    emissive={isNSGreen ? '#22C55E' : '#000000'}
                    emissiveIntensity={isNSGreen ? 5.0 : 0}
                  />
                </mesh>
              </group>

              {/* Lower Auxiliary Signal Head facing South */}
              <group position={[0.25, 2.6, 0]} rotation={[0, 0, 0]}>
                <mesh>
                  <boxGeometry args={[0.42, 1.2, 0.25]} />
                  <meshStandardMaterial color="#090D16" />
                </mesh>
                <mesh position={[0, 0.35, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshBasicMaterial
                    color={isNSRed ? '#EF4444' : '#450A0A'}
                  />
                </mesh>
                <mesh position={[0, 0.0, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshBasicMaterial
                    color={isNSYellow ? '#FACC15' : '#422006'}
                  />
                </mesh>
                <mesh position={[0, -0.35, 0.14]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshBasicMaterial
                    color={isNSGreen ? '#22C55E' : '#052E16'}
                  />
                </mesh>
              </group>
            </group>
          </group>
        );
      })}

      {/* 5. Indonesian Town Buildings with Interactive Right-Click Events */}

      {/* A. SD NEGERI 01 & SMP SUKAMAJU */}
      <group
        position={[-65, 0, -60]}
        onContextMenu={(e) =>
          handlePlaceContextMenu(e, {
            id: 'school_sdn01',
            name: 'SD Negeri 01 & SMP Sukamaju',
            position: [-65, 0, -60],
            category: 'education',
            description: 'Sekolah Dasar dan Menengah favorit Sukamaju',
          })
        }
        onPointerOver={() => setHoveredPlaceId('school_sdn01')}
        onPointerOut={() => setHoveredPlaceId(null)}
      >
        <mesh position={[0, 3.5, 0]} material={schoolWallMat} castShadow receiveShadow>
          <boxGeometry args={[26, 7, 12]} />
        </mesh>
        <mesh position={[0, 8.2, 0]} material={tileRoofMat} castShadow>
          <coneGeometry args={[18, 4, 4]} />
        </mesh>
        <mesh position={[0, 4.5, 6.1]}>
          <boxGeometry args={[22, 1.8, 0.2]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.2} transparent opacity={0.8} />
        </mesh>
        <group position={[0, 0, 10]}>
          <mesh position={[0, 4.5, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 9.0, 8]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.8} />
          </mesh>
          <mesh position={[0.7, 7.8, 0]}>
            <planeGeometry args={[1.4, 0.5]} />
            <meshBasicMaterial color="#DC2626" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.7, 7.3, 0]}>
            <planeGeometry args={[1.4, 0.5]} />
            <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* B. ALUN-ALUN & MASJID AGUNG */}
      <group
        position={[0, 0, -65]}
        onContextMenu={(e) =>
          handlePlaceContextMenu(e, {
            id: 'alun_alun',
            name: 'Alun-Alun & Masjid Agung',
            position: [0, 0, -65],
            category: 'civic',
            description: 'Jantung kota Sukamaju dan ruang terbuka hijau',
          })
        }
        onPointerOver={() => setHoveredPlaceId('alun_alun')}
        onPointerOut={() => setHoveredPlaceId(null)}
      >
        <mesh position={[0, 4, 0]} material={buildingWallMat} castShadow receiveShadow>
          <boxGeometry args={[22, 8, 22]} />
        </mesh>
        <mesh position={[0, 9.5, 0]} castShadow>
          <sphereGeometry args={[6.5, 20, 16]} />
          <meshStandardMaterial color="#059669" metalness={0.3} roughness={0.2} />
        </mesh>
        <mesh position={[0, 16.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 2.5, 8]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.2} />
        </mesh>
        <group position={[14, 0, 12]}>
          <mesh position={[0, 10, 0]} castShadow>
            <cylinderGeometry args={[1.6, 2.2, 20, 12]} />
            <meshStandardMaterial color="#F8FAFC" />
          </mesh>
          <mesh position={[0, 20.8, 0]}>
            <coneGeometry args={[2.0, 3.5, 12]} />
            <meshStandardMaterial color="#059669" />
          </mesh>
        </group>
        {[-8, 8].map((treeX, idx) => (
          <group key={idx} position={[treeX, 0, 18]}>
            <mesh position={[0, 2.2, 0]} castShadow>
              <cylinderGeometry args={[0.6, 0.9, 4.5, 8]} />
              <meshStandardMaterial color="#78350F" roughness={0.9} />
            </mesh>
            <mesh position={[0, 5.8, 0]} castShadow>
              <sphereGeometry args={[4.2, 12, 10]} />
              <meshStandardMaterial color="#166534" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* C. PASAR TRADISIONAL SUKAMAJU */}
      <group
        position={[-65, 0, 65]}
        onContextMenu={(e) =>
          handlePlaceContextMenu(e, {
            id: 'pasar_tradisional',
            name: 'Pasar Tradisional Sukamaju',
            position: [-65, 0, 65],
            category: 'market',
            description: 'Pusat niaga komoditas pangan & kuliner pagi',
          })
        }
        onPointerOver={() => setHoveredPlaceId('pasar_tradisional')}
        onPointerOut={() => setHoveredPlaceId(null)}
      >
        <mesh position={[0, 3, 0]} material={buildingWallMat} castShadow receiveShadow>
          <boxGeometry args={[28, 6, 20]} />
        </mesh>
        <mesh position={[0, 7, 0]} castShadow>
          <coneGeometry args={[19, 3.5, 4]} />
          <meshStandardMaterial color="#B45309" roughness={0.6} />
        </mesh>
        {[-8, 0, 8].map((tentX, idx) => (
          <group key={idx} position={[tentX, 0, 13]}>
            <mesh position={[0, 1.8, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 3.6, 6]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 2.6, 0]} castShadow>
              <coneGeometry args={[2.8, 1.4, 4]} />
              <meshStandardMaterial color={idx === 0 ? '#DC2626' : idx === 1 ? '#F59E0B' : '#2563EB'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* D. TERMINAL ANGKOT & HALTE BUS */}
      <group
        position={[65, 0, 5]}
        onContextMenu={(e) =>
          handlePlaceContextMenu(e, {
            id: 'terminal_angkot',
            name: 'Terminal Angkot & Halte Bus',
            position: [65, 0, 5],
            category: 'transit',
            description: 'Hub integrasi angkutan umum kota & feeder bus',
          })
        }
        onPointerOver={() => setHoveredPlaceId('terminal_angkot')}
        onPointerOut={() => setHoveredPlaceId(null)}
      >
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[24, 0.4, 16]} />
          <meshStandardMaterial color="#0284C7" roughness={0.4} metalness={0.2} />
        </mesh>
        {[-8, 8].flatMap((px) =>
          [-5, 5].map((pz, pIdx) => (
            <mesh key={`${px}_${pz}_${pIdx}`} position={[px, 1.6, pz]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 3.2, 8]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.7} />
            </mesh>
          ))
        )}
        <mesh position={[0, 3, -13]} material={buildingWallMat} castShadow receiveShadow>
          <boxGeometry args={[22, 6, 8]} />
        </mesh>
        <mesh position={[0, 6.8, -13]} material={tileRoofMat} castShadow>
          <coneGeometry args={[14, 2.8, 4]} />
        </mesh>
      </group>

      {/* E. PERUMAHAN GRIYA ASRI */}
      <group
        position={[-75, 0, -10]}
        onContextMenu={(e) =>
          handlePlaceContextMenu(e, {
            id: 'perumahan_griya',
            name: 'Perumahan Griya Asri',
            position: [-75, 0, -10],
            category: 'residential',
            description: 'Komplek pemukiman keluarga pekerja dan pegawai',
          })
        }
        onPointerOver={() => setHoveredPlaceId('perumahan_griya')}
        onPointerOut={() => setHoveredPlaceId(null)}
      >
        {[-10, 10].map((hZ, idx) => (
          <group key={idx} position={[0, 0, hZ]}>
            <mesh position={[0, 2.2, 0]} material={buildingWallMat} castShadow receiveShadow>
              <boxGeometry args={[12, 4.4, 10]} />
            </mesh>
            <mesh position={[0, 5.2, 0]} material={tileRoofMat} castShadow>
              <coneGeometry args={[8.5, 2.5, 4]} />
            </mesh>
            <mesh position={[5.5, 1.2, 0]} castShadow>
              <boxGeometry args={[2.5, 2.4, 6]} />
              <meshStandardMaterial color="#E2E8F0" />
            </mesh>
          </group>
        ))}
      </group>

      {/* F. RSUD & PUSKESMAS SENTRAL */}
      <group
        position={[65, 0, 60]}
        onContextMenu={(e) =>
          handlePlaceContextMenu(e, {
            id: 'rsud_hospital',
            name: 'RSUD & Puskesmas Sentral',
            position: [65, 0, 60],
            category: 'healthcare',
            description: 'Pusat layanan medis gawat darurat kota',
          })
        }
        onPointerOver={() => setHoveredPlaceId('rsud_hospital')}
        onPointerOut={() => setHoveredPlaceId(null)}
      >
        <mesh position={[0, 4.5, 0]} material={buildingWallMat} castShadow receiveShadow>
          <boxGeometry args={[24, 9, 16]} />
        </mesh>
        <group position={[0, 6.8, 8.2]}>
          <mesh>
            <boxGeometry args={[0.6, 2.0, 0.1]} />
            <meshBasicMaterial color="#DC2626" />
          </mesh>
          <mesh>
            <boxGeometry args={[2.0, 0.6, 0.1]} />
            <meshBasicMaterial color="#DC2626" />
          </mesh>
        </group>
      </group>

      {/* G. RUKO PERTOKOAN SUDIRMAN */}
      <group position={[0, 0, 5]}>
        {[-15, 0, 15].map((rukoX, idx) => (
          <group
            key={idx}
            position={[rukoX, 0, -12]}
            onContextMenu={(e) =>
              handlePlaceContextMenu(e, {
                id: `ruko_${idx}`,
                name: `Ruko Sudirman #${idx + 1}`,
                position: [rukoX, 0, -7],
                category: 'commercial',
                description: 'Kawasan pertokoan dan kuliner Jl. Sudirman',
              })
            }
          >
            <mesh position={[0, 3.8, 0]} material={buildingWallMat} castShadow receiveShadow>
              <boxGeometry args={[9, 7.6, 8]} />
            </mesh>
            <mesh position={[0, 2.8, 4.5]} rotation={[0.4, 0, 0]} castShadow>
              <boxGeometry args={[8.6, 0.15, 1.8]} />
              <meshStandardMaterial color={idx === 0 ? '#E11D48' : idx === 1 ? '#0D9488' : '#EA580C'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Tropical Coconut Trees */}
      {[
        [-18, -15], [18, -15], [-18, 25], [18, 25],
        [-52, -15], [52, -15], [-52, 25], [52, 25],
      ].map(([tx, tz], idx) => (
        <group key={idx} position={[tx, 0, tz]}>
          <mesh position={[0, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.35, 6.5, 8]} />
            <meshStandardMaterial color="#854D0E" roughness={0.9} />
          </mesh>
          <mesh position={[0, 6.8, 0]} castShadow>
            <sphereGeometry args={[2.4, 8, 8]} />
            <meshStandardMaterial color="#15803D" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 7. Accurate 3D Glowing Route Ribbon */}
      {routeLineGeometry && (
        <group position={[0, 0.05, 0]}>
          <mesh geometry={routeLineGeometry}>
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#0284C7"
              emissiveIntensity={1.2}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </group>
      )}

      {/* 8. 3D Origin Pin [A] (Green) */}
      {startPoint && (
        <group position={startPoint.position}>
          {/* Ground Pulsing Wave Ring */}
          <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 2.2, 32]} />
            <meshBasicMaterial color="#10B981" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          {/* Pin Stem & Beacon */}
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 7.0, 8]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
          <mesh position={[0, 7.2, 0]}>
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.5} />
          </mesh>
        </group>
      )}

      {/* 9. 3D Destination Pin [B] (Red) */}
      {endPoint && (
        <group position={endPoint.position}>
          {/* Ground Pulsing Wave Ring */}
          <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 2.2, 32]} />
            <meshBasicMaterial color="#EF4444" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          {/* Pin Stem & Beacon */}
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 7.0, 8]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
          <mesh position={[0, 7.2, 0]}>
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} />
          </mesh>
        </group>
      )}

      {/* 10. Rain Particles */}
      {weather === 'rain' && (
        <points ref={rainRef} geometry={rainGeo}>
          <pointsMaterial color="#93C5FD" size={0.35} transparent opacity={0.75} />
        </points>
      )}
    </group>
  );
};
