import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Pedestrian, TrafficLightState } from '../../types';
import { useTrafficStore } from '../../store/useTrafficStore';
import { CrosswalkLocation } from './pedestrianEngine';

interface PedestrianMeshProps {
  pedestrian: Pedestrian;
}

export const PedestrianCharacter: React.FC<PedestrianMeshProps> = ({ pedestrian }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const requestPedestrianCrossing = useTrafficStore((s) => s.requestPedestrianCrossing);

  useFrame((state) => {
    if (pedestrian.status === 'crossing') {
      const t = state.clock.getElapsedTime() * 8.5;
      const legAngle = Math.sin(t) * 0.45;
      const armAngle = -legAngle * 0.55;

      if (leftLegRef.current) leftLegRef.current.rotation.x = legAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legAngle;
      if (leftArmRef.current) leftArmRef.current.rotation.x = armAngle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -armAngle;

      if (groupRef.current) {
        // Natural vertical walking bounce
        groupRef.current.position.y = pedestrian.position[1] + Math.abs(Math.sin(t * 2)) * 0.06;
      }
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;

      if (groupRef.current) {
        groupRef.current.position.y = pedestrian.position[1];
      }
    }
  });

  const isStudent = pedestrian.type === 'student';
  const isElderly = pedestrian.type === 'elderly';

  const handleClick = (e: any) => {
    e.stopPropagation();
    requestPedestrianCrossing(pedestrian.intersectionId);
  };

  return (
    <group
      ref={groupRef}
      position={pedestrian.position}
      rotation={[0, pedestrian.rotation, 0]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Ground contact shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Legs & Shoes */}
      <mesh ref={leftLegRef} position={[-0.12, 0.35, 0]} castShadow>
        <boxGeometry args={[0.13, 0.65, 0.16]} />
        <meshStandardMaterial
          color={isStudent ? '#B91C1C' : '#1E293B'}
          roughness={0.6}
        />
      </mesh>
      <mesh ref={rightLegRef} position={[0.12, 0.35, 0]} castShadow>
        <boxGeometry args={[0.13, 0.65, 0.16]} />
        <meshStandardMaterial
          color={isStudent ? '#B91C1C' : '#1E293B'}
          roughness={0.6}
        />
      </mesh>

      {/* Torso / Shirt */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.42, 0.6, 0.26]} />
        <meshStandardMaterial
          color={isStudent ? '#F8FAFC' : pedestrian.color}
          roughness={0.5}
        />
      </mesh>

      {/* Arms */}
      <mesh ref={leftArmRef} position={[-0.26, 0.92, 0]} castShadow>
        <boxGeometry args={[0.11, 0.55, 0.12]} />
        <meshStandardMaterial
          color={isStudent ? '#F8FAFC' : pedestrian.color}
          roughness={0.5}
        />
      </mesh>
      <mesh ref={rightArmRef} position={[0.26, 0.92, 0]} castShadow>
        <boxGeometry args={[0.11, 0.55, 0.12]} />
        <meshStandardMaterial
          color={isStudent ? '#F8FAFC' : pedestrian.color}
          roughness={0.5}
        />
      </mesh>

      {/* Walking Stick / Cane for Elderly */}
      {isElderly && (
        <group position={[0.28, 0.45, 0.12]} rotation={[0.15, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
            <meshStandardMaterial color="#854D0E" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.45, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.02, 8, 12, Math.PI]} />
            <meshStandardMaterial color="#B45309" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* Indonesian School Backpack for Students */}
      {isStudent && (
        <mesh position={[0, 0.96, -0.17]} castShadow>
          <boxGeometry args={[0.32, 0.42, 0.16]} />
          <meshStandardMaterial color="#1D4ED8" roughness={0.4} />
        </mesh>
      )}

      {/* Head */}
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#FDBA74" roughness={0.6} />
      </mesh>

      {/* Indonesian School Cap (Peci / Topi Merah-Putih) */}
      {isStudent && (
        <group position={[0, 1.54, 0.01]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.19, 0.1, 16]} />
            <meshStandardMaterial color="#DC2626" roughness={0.4} />
          </mesh>
          {/* Cap Visor */}
          <mesh position={[0, -0.03, 0.12]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.22, 0.03, 0.12]} />
            <meshStandardMaterial color="#DC2626" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* Floating 3D Human Status Badge */}
      <group position={[0, 1.95, 0]}>
        {/* Status Pill Plate */}
        <mesh>
          <boxGeometry args={[hovered ? 1.6 : 1.15, 0.28, 0.04]} />
          <meshBasicMaterial
            color={
              pedestrian.status === 'crossing'
                ? '#059669' // Emerald
                : pedestrian.status === 'waiting'
                ? hovered
                  ? '#0284C7'
                  : '#D97706' // Amber
                : '#0284C7' // Sky
            }
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Outer glowing border on hover */}
        {hovered && (
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[1.68, 0.36, 0.02]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={0.6} />
          </mesh>
        )}

        {/* Small pedestrian icon indicator */}
        <mesh position={[-0.4, 0, 0.03]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial
            color={pedestrian.status === 'crossing' ? '#34D399' : '#FEF08A'}
          />
        </mesh>
      </group>
    </group>
  );
};

interface PelicanPostProps {
  position: [number, number, number];
  rotation: number;
  intersectionId: string;
  light?: TrafficLightState;
}

export const PelicanPost: React.FC<PelicanPostProps> = ({
  position,
  rotation,
  intersectionId,
  light,
}) => {
  const requestPedestrianCrossing = useTrafficStore((s) => s.requestPedestrianCrossing);
  const [hovered, setHovered] = useState(false);

  const isWalk = light?.pedestrianSignal === 'WALK';
  const isFlashing = light?.pedestrianSignal === 'FLASHING_DONT_WALK';
  const isDontWalk = !isWalk && !isFlashing;
  const isCallActive = light?.pedestrianCallActive;
  const remaining = light?.pedestrianRemainingTime ?? 0;

  const handleClick = (e: any) => {
    e.stopPropagation();
    requestPedestrianCrossing(intersectionId);
  };

  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Yellow & Black Hazard Striped Sidewalk Post (Tiang APILL) */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, 2.2, 12]} />
        <meshStandardMaterial color="#EAB308" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.2, 12]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>

      {/* Decorative Black Bands */}
      {[0.4, 0.9, 1.4, 1.8].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.12, 12]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} />
        </mesh>
      ))}

      {/* 2. Pelican Crossing Push-Button Box (Unit Tombol Pejalan Kaki) */}
      <group position={[0, 1.05, 0.11]}>
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.36, 0.14]} />
          <meshStandardMaterial
            color={hovered ? '#FDE047' : '#FACC15'}
            roughness={0.3}
          />
        </mesh>

        {/* Push Button Face */}
        <mesh position={[0, 0.03, 0.075]}>
          <circleGeometry args={[0.07, 18]} />
          <meshStandardMaterial
            color={isCallActive ? '#38BDF8' : '#DC2626'}
            emissive={isCallActive ? '#38BDF8' : hovered ? '#DC2626' : '#000000'}
            emissiveIntensity={isCallActive ? 2.5 : hovered ? 1.0 : 0}
            roughness={0.2}
          />
        </mesh>

        {/* Instruction Label "TEKAN UNTUK MENYEBERANG" */}
        <mesh position={[0, -0.1, 0.072]}>
          <planeGeometry args={[0.22, 0.08]} />
          <meshBasicMaterial color="#0F172A" />
        </mesh>
      </group>

      {/* 3. Pelican Pedestrian Signal Box (Eye-Level 2-Aspect Head) */}
      <group position={[0, 1.95, 0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.32, 0.64, 0.16]} />
          <meshStandardMaterial color="#0A0E17" roughness={0.5} />
        </mesh>

        {/* Top Visor */}
        <mesh position={[0, 0.32, 0.14]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.3, 0.05, 0.16]} />
          <meshStandardMaterial color="#0A0E17" roughness={0.7} />
        </mesh>

        {/* Top: Red Standing Figure (DON'T WALK) */}
        <mesh position={[0, 0.16, 0.085]}>
          <circleGeometry args={[0.1, 18]} />
          <meshStandardMaterial
            color={isDontWalk || isFlashing ? '#EF4444' : '#141720'}
            emissive={isDontWalk || isFlashing ? '#EF4444' : '#000000'}
            emissiveIntensity={isDontWalk || isFlashing ? 2.8 : 0}
            roughness={0.2}
          />
        </mesh>

        {/* Middle Visor */}
        <mesh position={[0, -0.02, 0.14]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.3, 0.05, 0.16]} />
          <meshStandardMaterial color="#0A0E17" roughness={0.7} />
        </mesh>

        {/* Bottom: Green Walking Figure (WALK) */}
        <mesh position={[0, -0.16, 0.085]}>
          <circleGeometry args={[0.1, 18]} />
          <meshStandardMaterial
            color={isWalk ? '#10B981' : '#141720'}
            emissive={isWalk ? '#10B981' : '#000000'}
            emissiveIntensity={isWalk ? 2.8 : 0}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 4. Mini Digital Countdown Readout for Pedestrians */}
      {isWalk && remaining > 0 && (
        <group position={[0, 2.45, 0.12]}>
          <mesh>
            <boxGeometry args={[0.36, 0.24, 0.1]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <planeGeometry args={[0.32, 0.2]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
        </group>
      )}

      {/* Floating Interactive Prompt on Hover or Active Call */}
      {(hovered || isCallActive) && (
        <group position={[0, 2.65, 0]}>
          <mesh>
            <planeGeometry args={[2.2, 0.34]} />
            <meshBasicMaterial
              color={isCallActive ? '#0284C7' : '#0F172A'}
              transparent
              opacity={0.92}
            />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.26, 0.4]} />
            <meshBasicMaterial
              color={isCallActive ? '#38BDF8' : '#F59E0B'}
              transparent
              opacity={0.75}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

interface InteractiveZebraCrosswalkProps {
  location: CrosswalkLocation;
  light?: TrafficLightState;
}

export const InteractiveZebraCrosswalk: React.FC<InteractiveZebraCrosswalkProps> = ({
  location,
  light,
}) => {
  const requestPedestrianCrossing = useTrafficStore((s) => s.requestPedestrianCrossing);
  const [hovered, setHovered] = useState(false);

  const isEW = location.roadOrientation === 'EW';
  const isWalk = light?.pedestrianSignal === 'WALK';
  const isCallActive = light?.pedestrianCallActive;

  // Center position of the crosswalk
  const cx = (location.startPos[0] + location.targetPos[0]) / 2;
  const cz = (location.startPos[2] + location.targetPos[2]) / 2;

  const handleClick = (e: any) => {
    e.stopPropagation();
    requestPedestrianCrossing(location.intersectionId);
  };

  // Generate 8 full-width zebra bars across the road
  const stripes = [-3.15, -2.25, -1.35, -0.45, 0.45, 1.35, 2.25, 3.15];

  return (
    <group
      position={[cx, 0.045, cz]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Clickable Ground Hitbox */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={isEW ? [2.4, 7.6] : [7.6, 2.4]} />
        <meshBasicMaterial
          color={
            isWalk
              ? '#10B981'
              : isCallActive
              ? '#0284C7'
              : hovered
              ? '#F59E0B'
              : '#FFFFFF'
          }
          transparent
          opacity={hovered ? 0.35 : 0.001}
        />
      </mesh>

      {/* Crisp White Zebra Stripes */}
      {stripes.map((offset, idx) => (
        <mesh
          key={idx}
          position={isEW ? [0, 0.002, offset] : [offset, 0.002, 0]}
          rotation={[-Math.PI / 2, 0, isEW ? 0 : Math.PI / 2]}
        >
          <planeGeometry args={[1.8, 0.45]} />
          <meshBasicMaterial
            color={isWalk ? '#ECFDF5' : '#FFFFFF'}
            transparent
            opacity={isWalk ? 0.98 : 0.9}
          />
        </mesh>
      ))}

      {/* Floating Prompt above crosswalk when hovered */}
      {hovered && (
        <group position={[0, 2.4, 0]}>
          <mesh>
            <planeGeometry args={[2.8, 0.4]} />
            <meshBasicMaterial color="#0F172A" transparent opacity={0.92} />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.88, 0.48]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
};
