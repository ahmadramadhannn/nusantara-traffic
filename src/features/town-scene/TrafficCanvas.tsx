import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTrafficStore } from '../../store/useTrafficStore';
import { TownEnvironment } from './TownEnvironment';
import { VehicleMesh } from '../vehicles/VehicleMesh';
import { CameraController } from '../camera-controls/CameraController';

const SimulationLoop: React.FC = () => {
  const tickSimulation = useTrafficStore((s) => s.tickSimulation);

  useFrame((_, delta) => {
    tickSimulation(delta);
  });

  return null;
};

export const TrafficCanvas: React.FC = () => {
  const vehicles = useTrafficStore((s) => s.vehicles);
  const selectedVehicleId = useTrafficStore((s) => s.selectedVehicleId);
  const timeOfDay = useTrafficStore((s) => s.timeOfDay);
  const weather = useTrafficStore((s) => s.weather);

  // Dynamic environmental colors based on time & weather
  const getEnvironmentSettings = () => {
    switch (timeOfDay) {
      case 'night':
        return {
          bgColor: '#090D16',
          fogColor: '#090D16',
          ambientIntensity: 0.25,
          sunColor: '#93C5FD',
          sunIntensity: 0.6,
          sunPos: [20, 40, -20] as [number, number, number],
        };
      case 'evening_rush':
        return {
          bgColor: weather === 'rain' ? '#1E293B' : '#7C2D12',
          fogColor: weather === 'rain' ? '#1E293B' : '#C2410C',
          ambientIntensity: 0.65,
          sunColor: '#F97316',
          sunIntensity: 1.6,
          sunPos: [-80, 25, 40] as [number, number, number],
        };
      case 'morning_rush':
        return {
          bgColor: weather === 'rain' ? '#334155' : '#1E3A8A',
          fogColor: weather === 'rain' ? '#334155' : '#38BDF8',
          ambientIntensity: 0.75,
          sunColor: '#FEF08A',
          sunIntensity: 1.8,
          sunPos: [80, 35, -40] as [number, number, number],
        };
      case 'midday':
      default:
        return {
          bgColor: weather === 'rain' ? '#475569' : '#0284C7',
          fogColor: weather === 'rain' ? '#475569' : '#BAE6FD',
          ambientIntensity: 0.9,
          sunColor: '#FFFFFF',
          sunIntensity: 2.0,
          sunPos: [30, 80, 30] as [number, number, number],
        };
    }
  };

  const env = getEnvironmentSettings();

  return (
    <div
      className="relative w-full h-full bg-slate-950"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas
        shadows
        camera={{ position: [0, 115, 80], fov: 42, near: 0.5, far: 500 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[env.bgColor]} />
        <fog attach="fog" args={[env.fogColor, 60, weather === 'fog' ? 140 : 280]} />

        {/* Studio & Directional Lighting */}
        <ambientLight intensity={env.ambientIntensity} />
        <directionalLight
          position={env.sunPos}
          intensity={env.sunIntensity}
          color={env.sunColor}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-110}
          shadow-camera-right={110}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-camera-near={0.5}
          shadow-camera-far={260}
          shadow-bias={-0.0003}
        />
        {/* Soft fill light */}
        <directionalLight position={[-40, 30, -40]} intensity={0.4} color="#94A3B8" />

        <Suspense fallback={null}>
          <CameraController />
          <TownEnvironment />

          {/* Render All Active Vehicles */}
          {vehicles.map((veh) => (
            <VehicleMesh
              key={veh.id}
              vehicle={veh}
              isSelected={veh.id === selectedVehicleId}
            />
          ))}

          <SimulationLoop />
        </Suspense>
      </Canvas>
    </div>
  );
};
