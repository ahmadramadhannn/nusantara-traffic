import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { useTrafficStore } from '../../store/useTrafficStore';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const cameraMode = useTrafficStore((s) => s.cameraMode);
  const selectedVehicleId = useTrafficStore((s) => s.selectedVehicleId);
  const vehicles = useTrafficStore((s) => s.vehicles);

  // Target camera position and lookAt target for smooth transitions
  const targetPos = useRef(new THREE.Vector3(0, 110, 85));
  const targetLook = useRef(new THREE.Vector3(0, 0, 5));
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    switch (cameraMode) {
      case 'birds_eye':
        targetPos.current.set(0, 115, 80);
        targetLook.current.set(0, 0, 5);
        break;

      case 'street_sudirman':
        // 1-Point perspective down Jl. Sudirman looking East
        targetPos.current.set(-75, 3.6, -23.25);
        targetLook.current.set(65, 2.2, -23.25);
        break;

      case 'street_merdeka':
        // 1-Point perspective down Jl. Merdeka looking South (School corridor)
        targetPos.current.set(-33.25, 3.6, -75);
        targetLook.current.set(-33.25, 2.2, 70);
        break;

      case 'street_diponegoro':
        // 1-Point perspective down Jl. Diponegoro looking South (Transit corridor)
        targetPos.current.set(36.75, 3.6, -75);
        targetLook.current.set(36.75, 2.2, 70);
        break;

      case 'street_kartini':
        // 1-Point perspective down Jl. Kartini looking East (Market bypass)
        targetPos.current.set(-75, 3.6, 36.75);
        targetLook.current.set(65, 2.2, 36.75);
        break;

      case 'follow_vehicle':
      case 'free':
        // Handled in useFrame
        break;
    }
  }, [cameraMode]);

  useFrame((_, delta) => {
    if (cameraMode === 'follow_vehicle') {
      const selectedVeh = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
      if (selectedVeh) {
        const [vx, vy, vz] = selectedVeh.position;
        const [, yaw] = selectedVeh.rotation;

        // Position camera behind vehicle relative to heading
        const followDistance = selectedVeh.type === 'bus' ? 14 : 9;
        const followHeight = selectedVeh.type === 'bus' ? 6.5 : 4.5;

        const behindX = vx - Math.sin(yaw) * followDistance;
        const behindZ = vz - Math.cos(yaw) * followDistance;

        targetPos.current.set(behindX, vy + followHeight, behindZ);
        targetLook.current.set(vx, vy + 1.2, vz);
      }
    }

    if (cameraMode !== 'free') {
      // Smooth lerp camera position
      const lerpSpeed = Math.min(1.0, delta * 3.8);
      camera.position.lerp(targetPos.current, lerpSpeed);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLook.current, lerpSpeed);
        controlsRef.current.update();
      } else {
        camera.lookAt(targetLook.current);
      }
    }
  });

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={cameraMode === 'birds_eye' ? Math.PI / 2.15 : Math.PI / 2.02}
      minDistance={10}
      maxDistance={220}
      enabled={cameraMode === 'birds_eye' || cameraMode === 'free'}
    />
  );
};
