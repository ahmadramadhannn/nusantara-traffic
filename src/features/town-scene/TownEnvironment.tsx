import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTrafficStore } from '../../store/useTrafficStore';
import { ROAD_WIDTH, SIDEWALK_WIDTH, TOWN_LANDMARKS } from './constants';

export const TownEnvironment: React.FC = () => {
  const weather = useTrafficStore((s) => s.weather);
  const timeOfDay = useTrafficStore((s) => s.timeOfDay);
  const trafficLights = useTrafficStore((s) => s.trafficLights);
  const routeTrip = useTrafficStore((s) => s.routeTrip);

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
        positions[i * 3 + 1] -= delta * 55; // fall speed
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
        color: '#9A3412', // Genteng tanah liat / terracotta
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
        color: '#FEF08A', // Warna cat sekolah SD Indonesia khas kuning/putih
        roughness: 0.7,
      }),
    []
  );

  return (
    <group>
      {/* 1. Base Terrain Grass */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={grassMat} receiveShadow>
        <planeGeometry args={[260, 240]} />
      </mesh>

      {/* 2. Four Intersecting Town Roads */}
      {/* Jl. Sudirman (East-West at Z = -25) */}
      <group position={[0, 0, -25]}>
        {/* Asphalt Road */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={asphaltMat} receiveShadow>
          <planeGeometry args={[210, ROAD_WIDTH]} />
        </mesh>
        {/* North & South Sidewalks */}
        <mesh position={[0, 0.08, (ROAD_WIDTH + SIDEWALK_WIDTH) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[210, SIDEWALK_WIDTH]} />
        </mesh>
        <mesh position={[0, 0.08, -(ROAD_WIDTH + SIDEWALK_WIDTH) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={sidewalkMat} receiveShadow>
          <planeGeometry args={[210, SIDEWALK_WIDTH]} />
        </mesh>
        {/* Center dashed line */}
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
        [-35, -25], // int_nw
        [35, -25], // int_ne
        [-35, 35], // int_sw
        [35, 35], // int_se
      ].map(([x, z], idx) => (
        <group key={idx} position={[x, 0.04, z]}>
          {/* East Zebra */}
          <mesh position={[4.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.6, 6.0]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
          </mesh>
          {/* West Zebra */}
          <mesh position={[-4.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.6, 6.0]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
          </mesh>
          {/* North Zebra */}
          <mesh position={[0, 0, -4.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[1.6, 6.0]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
          </mesh>
          {/* South Zebra */}
          <mesh position={[0, 0, 4.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[1.6, 6.0]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
          </mesh>
        </group>
      ))}

      {/* 4. Active Dynamic Traffic Light Gantries */}
      {[
        { id: 'int_nw', pos: [-35, 0, -25] },
        { id: 'int_ne', pos: [35, 0, -25] },
        { id: 'int_sw', pos: [-35, 0, 35] },
        { id: 'int_se', pos: [35, 0, 35] },
      ].map(({ id, pos }) => {
        const light = trafficLights[id];
        const isEWGreen = light?.activeDirection === 'EW' && !light?.isYellow;
        const isEWYellow = light?.activeDirection === 'EW' && light?.isYellow;
        const isNSGreen = light?.activeDirection === 'NS' && !light?.isYellow;
        const isNSYellow = light?.activeDirection === 'NS' && light?.isYellow;

        return (
          <group key={id} position={[pos[0], 0, pos[1]]}>
            {/* Pole NW Corner */}
            <mesh position={[-4.8, 2.5, -4.8]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 5.0, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>

            {/* East-West Light Box */}
            <group position={[-4.8, 4.2, -4.8]} rotation={[0, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.3, 1.1, 0.3]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>
              {/* Red LED */}
              <mesh position={[0.16, 0.35, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={!isEWGreen && !isEWYellow ? '#EF4444' : '#450A0A'} />
              </mesh>
              {/* Yellow LED */}
              <mesh position={[0.16, 0.0, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={isEWYellow ? '#FACC15' : '#422006'} />
              </mesh>
              {/* Green LED */}
              <mesh position={[0.16, -0.35, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={isEWGreen ? '#22C55E' : '#052E16'} />
              </mesh>
            </group>

            {/* North-South Light Box */}
            <group position={[4.8, 4.2, 4.8]} rotation={[0, Math.PI / 2, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.3, 1.1, 0.3]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>
              {/* Red LED */}
              <mesh position={[0.16, 0.35, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={!isNSGreen && !isNSYellow ? '#EF4444' : '#450A0A'} />
              </mesh>
              {/* Yellow LED */}
              <mesh position={[0.16, 0.0, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={isNSYellow ? '#FACC15' : '#422006'} />
              </mesh>
              {/* Green LED */}
              <mesh position={[0.16, -0.35, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={isNSGreen ? '#22C55E' : '#052E16'} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* 5. Indonesian Town Buildings & Landmarks */}

      {/* A. SD NEGERI 01 & SMP SUKAMAJU (School Compound at [-65, 0, -60]) */}
      <group position={[-65, 0, -60]}>
        {/* Main 2-story Classroom Block */}
        <mesh position={[0, 3.5, 0]} material={schoolWallMat} castShadow receiveShadow>
          <boxGeometry args={[26, 7, 12]} />
        </mesh>
        {/* Hip Clay Tile Roof */}
        <mesh position={[0, 8.2, 0]} material={tileRoofMat} castShadow>
          <coneGeometry args={[18, 4, 4]} />
        </mesh>
        {/* Classroom windows */}
        <mesh position={[0, 4.5, 6.1]}>
          <boxGeometry args={[22, 1.8, 0.2]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.2} transparent opacity={0.8} />
        </mesh>
        {/* School Flagpole with Merah Putih Flag */}
        <group position={[0, 0, 10]}>
          <mesh position={[0, 4.5, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 9.0, 8]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.8} />
          </mesh>
          {/* Flag Red & White */}
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

      {/* B. ALUN-ALUN & MASJID AGUNG (Town Square & Great Mosque at [0, 0, -65]) */}
      <group position={[0, 0, -65]}>
        {/* Mosque Main Prayer Hall */}
        <mesh position={[0, 4, 0]} material={buildingWallMat} castShadow receiveShadow>
          <boxGeometry args={[22, 8, 22]} />
        </mesh>
        {/* Grand Emerald Dome */}
        <mesh position={[0, 9.5, 0]} castShadow>
          <sphereGeometry args={[6.5, 20, 16]} />
          <meshStandardMaterial color="#059669" metalness={0.3} roughness={0.2} />
        </mesh>
        {/* Crescent Finial */}
        <mesh position={[0, 16.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 2.5, 8]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Tall Minaret (Menara Masjid) */}
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
        {/* Twin Sacred Banyan Trees (Pohon Beringin Kembar) */}
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

      {/* C. PASAR TRADISIONAL SUKAMAJU (Market Hall & Warung at [-65, 0, 65]) */}
      <group position={[-65, 0, 65]}>
        {/* Open Market Hall Structure */}
        <mesh position={[0, 3, 0]} material={buildingWallMat} castShadow receiveShadow>
          <boxGeometry args={[28, 6, 20]} />
        </mesh>
        <mesh position={[0, 7, 0]} castShadow>
          <coneGeometry args={[19, 3.5, 4]} />
          <meshStandardMaterial color="#B45309" roughness={0.6} />
        </mesh>
        {/* Colorful Market Vendor Tents (Warung Tenda) */}
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

      {/* D. TERMINAL ANGKOT & TRANSIT HUB at [65, 0, 5] */}
      <group position={[65, 0, 5]}>
        {/* Terminal Canopy Shelters (Halte Bus & Angkot) */}
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[24, 0.4, 16]} />
          <meshStandardMaterial color="#0284C7" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Support Pillars */}
        {[-8, 8].flatMap((px) =>
          [-5, 5].map((pz, pIdx) => (
            <mesh key={`${px}_${pz}_${pIdx}`} position={[px, 1.6, pz]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 3.2, 8]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.7} />
            </mesh>
          ))
        )}
        {/* Terminal Station Building */}
        <mesh position={[0, 3, -13]} material={buildingWallMat} castShadow receiveShadow>
          <boxGeometry args={[22, 6, 8]} />
        </mesh>
        <mesh position={[0, 6.8, -13]} material={tileRoofMat} castShadow>
          <coneGeometry args={[14, 2.8, 4]} />
        </mesh>
      </group>

      {/* E. PERUMAHAN GRIYA ASRI (Residential Houses at [-75, 0, -10]) */}
      <group position={[-75, 0, -10]}>
        {[-10, 10].map((hZ, idx) => (
          <group key={idx} position={[0, 0, hZ]}>
            <mesh position={[0, 2.2, 0]} material={buildingWallMat} castShadow receiveShadow>
              <boxGeometry args={[12, 4.4, 10]} />
            </mesh>
            <mesh position={[0, 5.2, 0]} material={tileRoofMat} castShadow>
              <coneGeometry args={[8.5, 2.5, 4]} />
            </mesh>
            {/* Front Porch & Pagar Rumah */}
            <mesh position={[5.5, 1.2, 0]} castShadow>
              <boxGeometry args={[2.5, 2.4, 6]} />
              <meshStandardMaterial color="#E2E8F0" />
            </mesh>
          </group>
        ))}
      </group>

      {/* F. RSUD & PUSKESMAS SENTRAL at [65, 0, 60] */}
      <group position={[65, 0, 60]}>
        <mesh position={[0, 4.5, 0]} material={buildingWallMat} castShadow receiveShadow>
          <boxGeometry args={[24, 9, 16]} />
        </mesh>
        {/* Red Cross Signboard */}
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

      {/* G. RUKO PERTOKOAN (Commercial Shophouses along Jl. Sudirman Center) */}
      <group position={[0, 0, 5]}>
        {[-15, 0, 15].map((rukoX, idx) => (
          <group key={idx} position={[rukoX, 0, -12]}>
            <mesh position={[0, 3.8, 0]} material={buildingWallMat} castShadow receiveShadow>
              <boxGeometry args={[9, 7.6, 8]} />
            </mesh>
            {/* Colorful Storefront Awnings */}
            <mesh position={[0, 2.8, 4.5]} rotation={[0.4, 0, 0]} castShadow>
              <boxGeometry args={[8.6, 0.15, 1.8]} />
              <meshStandardMaterial color={idx === 0 ? '#E11D48' : idx === 1 ? '#0D9488' : '#EA580C'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Tropical Coconut Trees & Street Lamps */}
      {[
        [-18, -15], [18, -15], [-18, 25], [18, 25],
        [-52, -15], [52, -15], [-52, 25], [52, 25],
      ].map(([tx, tz], idx) => (
        <group key={idx} position={[tx, 0, tz]}>
          {/* Coconut Palm Trunk */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.35, 6.5, 8]} />
            <meshStandardMaterial color="#854D0E" roughness={0.9} />
          </mesh>
          {/* Coconut Palm Crown */}
          <mesh position={[0, 6.8, 0]} castShadow>
            <sphereGeometry args={[2.4, 8, 8]} />
            <meshStandardMaterial color="#15803D" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 7. Active Route Trip 3D glowing path indicator */}
      {routeTrip.isActive && (
        <group position={[0, 0.1, 0]}>
          <mesh position={[-35, 0, -25]}>
            <cylinderGeometry args={[2.5, 2.5, 0.1, 16]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* 8. Rain Particles */}
      {weather === 'rain' && (
        <points ref={rainRef} geometry={rainGeo}>
          <pointsMaterial color="#93C5FD" size={0.35} transparent opacity={0.75} />
        </points>
      )}
    </group>
  );
};
