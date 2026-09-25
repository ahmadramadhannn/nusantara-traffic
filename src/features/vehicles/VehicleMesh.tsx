import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Vehicle } from '../../types';

interface VehicleMeshProps {
  vehicle: Vehicle;
  isSelected?: boolean;
}

export const VehicleMesh: React.FC<VehicleMeshProps> = ({ vehicle, isSelected = false }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Wheel geometry & material reuse
  const wheelGeom = useMemo(() => new THREE.CylinderGeometry(0.26, 0.26, 0.22, 12), []);
  const wheelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.8 }), []);
  const rimMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.7, roughness: 0.3 }), []);

  // Glass material
  const glassMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1E293B',
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.75,
      }),
    []
  );

  // Headlight and brake light materials
  const headlightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FEF08A',
        emissive: '#FEF08A',
        emissiveIntensity: 0.8,
        roughness: 0.2,
      }),
    []
  );

  const brakeLightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: vehicle.isBraking ? '#EF4444' : '#991B1B',
        emissive: vehicle.isBraking ? '#EF4444' : '#450A0A',
        emissiveIntensity: vehicle.isBraking ? 1.5 : 0.2,
        roughness: 0.3,
      }),
    [vehicle.isBraking]
  );

  // Primary body material
  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: vehicle.color,
        roughness: 0.3,
        metalness: 0.2,
      }),
    [vehicle.color]
  );

  const renderVehicleBody = () => {
    switch (vehicle.type) {
      case 'angkot':
        // Indonesian Angkot (Minivan with roof signboard and side stripe)
        return (
          <group position={[0, 0, 0]}>
            {/* Main lower chassis */}
            <mesh position={[0, 0.5, 0]} material={bodyMat} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.7, 4.2]} />
            </mesh>
            {/* Passenger cabin with windows */}
            <mesh position={[0, 1.15, -0.2]} material={bodyMat} castShadow>
              <boxGeometry args={[1.75, 0.75, 2.9]} />
            </mesh>
            {/* Windshield & side glass */}
            <mesh position={[0, 1.15, -0.2]} material={glassMat}>
              <boxGeometry args={[1.82, 0.65, 2.7]} />
            </mesh>
            {/* Front slanted hood */}
            <mesh position={[0, 0.75, 1.5]} material={bodyMat} castShadow>
              <boxGeometry args={[1.75, 0.35, 0.9]} />
            </mesh>
            {/* Roof Rack & Angkot Signboard */}
            <mesh position={[0, 1.62, 0.5]} castShadow>
              <boxGeometry args={[1.1, 0.22, 0.6]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
            </mesh>
            <mesh position={[0, 1.62, 0.5]}>
              <boxGeometry args={[1.12, 0.16, 0.62]} />
              <meshStandardMaterial color="#0284C7" roughness={0.5} />
            </mesh>
            {/* Headlights (Front is +Z) */}
            <mesh position={[-0.65, 0.55, 2.12]} material={headlightMat}>
              <boxGeometry args={[0.28, 0.18, 0.08]} />
            </mesh>
            <mesh position={[0.65, 0.55, 2.12]} material={headlightMat}>
              <boxGeometry args={[0.28, 0.18, 0.08]} />
            </mesh>
            {/* Brake lights (Back is -Z) */}
            <mesh position={[-0.7, 0.55, -2.12]} material={brakeLightMat}>
              <boxGeometry args={[0.24, 0.16, 0.08]} />
            </mesh>
            <mesh position={[0.7, 0.55, -2.12]} material={brakeLightMat}>
              <boxGeometry args={[0.24, 0.16, 0.08]} />
            </mesh>
            {/* Wheels */}
            <mesh position={[-0.88, 0.26, 1.15]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.28, 0.28, 0.18, 12]} />
            </mesh>
            <mesh position={[0.88, 0.26, 1.15]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.28, 0.28, 0.18, 12]} />
            </mesh>
            <mesh position={[-0.88, 0.26, -1.15]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.28, 0.28, 0.18, 12]} />
            </mesh>
            <mesh position={[0.88, 0.26, -1.15]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.28, 0.28, 0.18, 12]} />
            </mesh>
          </group>
        );

      case 'bus':
        // School & City Bus (Yellow / Orange large transit body)
        return (
          <group position={[0, 0, 0]}>
            {/* Main bus body */}
            <mesh position={[0, 1.45, 0]} material={bodyMat} castShadow receiveShadow>
              <boxGeometry args={[2.4, 2.3, 9.2]} />
            </mesh>
            {/* Window ribbon */}
            <mesh position={[0, 1.85, 0]} material={glassMat}>
              <boxGeometry args={[2.46, 0.9, 8.6]} />
            </mesh>
            {/* Front windshield */}
            <mesh position={[0, 1.6, 4.52]} material={glassMat}>
              <boxGeometry args={[2.2, 1.3, 0.2]} />
            </mesh>
            {/* Roof AC units */}
            <mesh position={[0, 2.7, 0]} castShadow>
              <boxGeometry args={[1.4, 0.35, 2.5]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
            </mesh>
            {/* Headlights */}
            <mesh position={[-0.85, 0.6, 4.65]} material={headlightMat}>
              <boxGeometry args={[0.4, 0.25, 0.1]} />
            </mesh>
            <mesh position={[0.85, 0.6, 4.65]} material={headlightMat}>
              <boxGeometry args={[0.4, 0.25, 0.1]} />
            </mesh>
            {/* Taillights */}
            <mesh position={[-0.9, 0.7, -4.62]} material={brakeLightMat}>
              <boxGeometry args={[0.35, 0.45, 0.1]} />
            </mesh>
            <mesh position={[0.9, 0.7, -4.62]} material={brakeLightMat}>
              <boxGeometry args={[0.35, 0.45, 0.1]} />
            </mesh>
            {/* Bus Wheels (6 wheels for heavy transit) */}
            {[-3.0, 0, 2.8].map((zPos, idx) => (
              <React.Fragment key={idx}>
                <mesh position={[-1.2, 0.45, zPos]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
                  <cylinderGeometry args={[0.45, 0.45, 0.32, 14]} />
                </mesh>
                <mesh position={[1.2, 0.45, zPos]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
                  <cylinderGeometry args={[0.45, 0.45, 0.32, 14]} />
                </mesh>
              </React.Fragment>
            ))}
          </group>
        );

      case 'motorcycle':
        // Indonesian Scooter / Motor Matic with rider figure & helmet
        return (
          <group position={[0, 0, 0]}>
            {/* Scooter body */}
            <mesh position={[0, 0.45, 0]} material={bodyMat} castShadow>
              <boxGeometry args={[0.55, 0.4, 1.8]} />
            </mesh>
            <mesh position={[0, 0.75, 0.5]} material={bodyMat} castShadow>
              <boxGeometry args={[0.48, 0.45, 0.4]} />
            </mesh>
            {/* Front & Rear Wheels */}
            <mesh position={[0, 0.28, 0.75]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.26, 0.26, 0.16, 12]} />
            </mesh>
            <mesh position={[0, 0.28, -0.65]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.26, 0.26, 0.16, 12]} />
            </mesh>
            {/* Handlebars */}
            <mesh position={[0, 0.95, 0.45]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.75, 8]} />
              <meshStandardMaterial color="#0F172A" />
            </mesh>
            {/* Headlight */}
            <mesh position={[0, 0.75, 0.72]} material={headlightMat}>
              <sphereGeometry args={[0.12, 8, 8]} />
            </mesh>
            {/* Taillight */}
            <mesh position={[0, 0.6, -0.92]} material={brakeLightMat}>
              <boxGeometry args={[0.2, 0.1, 0.06]} />
            </mesh>
            {/* Rider torso */}
            <mesh position={[0, 1.05, -0.1]} castShadow>
              <boxGeometry args={[0.42, 0.55, 0.3]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            {/* Rider Indonesian Helmet (Helm SNI) */}
            <mesh position={[0, 1.5, -0.05]} castShadow>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial color="#EF4444" roughness={0.3} metalness={0.4} />
            </mesh>
            <mesh position={[0, 1.48, 0.1]}>
              <boxGeometry args={[0.26, 0.14, 0.16]} />
              <meshStandardMaterial color="#0F172A" roughness={0.1} />
            </mesh>
          </group>
        );

      case 'truck':
        // Pickup Sayur / Logistics Truck
        return (
          <group position={[0, 0, 0]}>
            {/* Cabin */}
            <mesh position={[0, 0.95, 1.2]} material={bodyMat} castShadow>
              <boxGeometry args={[2.0, 1.3, 1.6]} />
            </mesh>
            <mesh position={[0, 1.2, 1.3]} material={glassMat}>
              <boxGeometry args={[2.04, 0.7, 1.3]} />
            </mesh>
            {/* Cargo Flatbed */}
            <mesh position={[0, 0.65, -0.8]} castShadow receiveShadow>
              <boxGeometry args={[2.1, 0.7, 3.2]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
            {/* Cargo Wooden Crates */}
            <mesh position={[0, 1.2, -0.8]} castShadow>
              <boxGeometry args={[1.7, 0.8, 2.6]} />
              <meshStandardMaterial color="#92400E" roughness={0.9} />
            </mesh>
            {/* Headlights & Taillights */}
            <mesh position={[-0.7, 0.6, 2.02]} material={headlightMat}>
              <boxGeometry args={[0.3, 0.2, 0.08]} />
            </mesh>
            <mesh position={[0.7, 0.6, 2.02]} material={headlightMat}>
              <boxGeometry args={[0.3, 0.2, 0.08]} />
            </mesh>
            <mesh position={[-0.8, 0.5, -2.42]} material={brakeLightMat}>
              <boxGeometry args={[0.25, 0.15, 0.08]} />
            </mesh>
            <mesh position={[0.8, 0.5, -2.42]} material={brakeLightMat}>
              <boxGeometry args={[0.25, 0.15, 0.08]} />
            </mesh>
            {/* Wheels */}
            <mesh position={[-1.0, 0.35, 1.3]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.36, 0.36, 0.24, 12]} />
            </mesh>
            <mesh position={[1.0, 0.35, 1.3]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.36, 0.36, 0.24, 12]} />
            </mesh>
            <mesh position={[-1.0, 0.35, -1.2]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.36, 0.36, 0.24, 12]} />
            </mesh>
            <mesh position={[1.0, 0.35, -1.2]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.36, 0.36, 0.24, 12]} />
            </mesh>
          </group>
        );

      case 'car':
      default:
        // Private Car (Family MPV / Avanza / Sedan)
        return (
          <group position={[0, 0, 0]}>
            {/* Lower car body */}
            <mesh position={[0, 0.45, 0]} material={bodyMat} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.55, 4.0]} />
            </mesh>
            {/* Upper cabin & roof */}
            <mesh position={[0, 0.95, -0.3]} material={bodyMat} castShadow>
              <boxGeometry args={[1.6, 0.55, 2.2]} />
            </mesh>
            {/* Glass windows */}
            <mesh position={[0, 0.93, -0.3]} material={glassMat}>
              <boxGeometry args={[1.64, 0.5, 2.05]} />
            </mesh>
            {/* Headlights */}
            <mesh position={[-0.65, 0.48, 2.02]} material={headlightMat}>
              <boxGeometry args={[0.26, 0.16, 0.08]} />
            </mesh>
            <mesh position={[0.65, 0.48, 2.02]} material={headlightMat}>
              <boxGeometry args={[0.26, 0.16, 0.08]} />
            </mesh>
            {/* Taillights */}
            <mesh position={[-0.65, 0.52, -2.02]} material={brakeLightMat}>
              <boxGeometry args={[0.24, 0.16, 0.08]} />
            </mesh>
            <mesh position={[0.65, 0.52, -2.02]} material={brakeLightMat}>
              <boxGeometry args={[0.24, 0.16, 0.08]} />
            </mesh>
            {/* Wheels */}
            <mesh position={[-0.88, 0.25, 1.1]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.26, 0.26, 0.18, 12]} />
            </mesh>
            <mesh position={[0.88, 0.25, 1.1]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.26, 0.26, 0.18, 12]} />
            </mesh>
            <mesh position={[-0.88, 0.25, -1.1]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.26, 0.26, 0.18, 12]} />
            </mesh>
            <mesh position={[0.88, 0.25, -1.1]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
              <cylinderGeometry args={[0.26, 0.26, 0.18, 12]} />
            </mesh>
          </group>
        );
    }
  };

  return (
    <group
      ref={groupRef}
      position={vehicle.position}
      rotation={vehicle.rotation}
    >
      {renderVehicleBody()}

      {/* Highlight ring if selected for camera follow or trip simulation */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 2.0, 24]} />
          <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Floating passenger / vehicle type tag when hovered or special */}
      {vehicle.customLabel && (
        <mesh position={[0, vehicle.type === 'bus' ? 3.4 : 2.4, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
      )}
    </group>
  );
};
