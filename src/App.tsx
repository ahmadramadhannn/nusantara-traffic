import React from 'react';
import { TrafficCanvas } from './features/town-scene/TrafficCanvas';
import { TopNav } from './features/ui/TopNav';
import { QuickControlsHUD } from './features/ui/QuickControlsHUD';
import { StreetPerspectiveDock } from './features/ui/StreetPerspectiveDock';
import { TripSimulationBanner } from './features/ui/TripSimulationBanner';
import { VehicleFleetModal } from './features/modals/VehicleFleetModal';
import { EnvironmentTimeModal } from './features/modals/EnvironmentTimeModal';
import { RoutePlannerModal } from './features/route-marking/RoutePlannerModal';
import { ImpactStatsView } from './features/stats-page/ImpactStatsView';
import { ScenarioPresetsModal } from './features/stats-page/ScenarioPresetsModal';

export default function App() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Scene */}
      <TrafficCanvas />

      {/* Top 3-Zone Navigation Header */}
      <TopNav />

      {/* Street & Camera Perspective Switcher Dock */}
      <StreetPerspectiveDock />

      {/* Active Trip Follow Banner (if trip simulation is active) */}
      <TripSimulationBanner />

      {/* Floating Bottom HUD */}
      <QuickControlsHUD />

      {/* Interactive Modals & Stats Views */}
      <VehicleFleetModal />
      <EnvironmentTimeModal />
      <RoutePlannerModal />
      <ImpactStatsView />
      <ScenarioPresetsModal />
    </main>
  );
}
