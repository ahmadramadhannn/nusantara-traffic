import React from 'react';
import { TrafficCanvas } from './features/town-scene/TrafficCanvas';
import { TopNav } from './features/ui/TopNav';
import { QuickControlsHUD } from './features/ui/QuickControlsHUD';
import { StreetPerspectiveDock } from './features/ui/StreetPerspectiveDock';
import { LiveTripCalculatorDock } from './features/ui/LiveTripCalculatorDock';
import { TownContextMenu } from './features/ui/TownContextMenu';
import { VehicleFleetModal } from './features/modals/VehicleFleetModal';
import { EnvironmentTimeModal } from './features/modals/EnvironmentTimeModal';
import { RoutePlannerModal } from './features/route-marking/RoutePlannerModal';
import { ImpactStatsView } from './features/stats-page/ImpactStatsView';
import { ScenarioPresetsModal } from './features/stats-page/ScenarioPresetsModal';

export default function App() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Town Scene with Right-Click Support */}
      <TrafficCanvas />

      {/* Top Navigation Bar */}
      <TopNav />

      {/* Street Perspective & Camera Switcher Dock */}
      <StreetPerspectiveDock />

      {/* Live Dynamic Trip Calculator Panel */}
      <LiveTripCalculatorDock />

      {/* 3D Right-Click Context Menu */}
      <TownContextMenu />

      {/* Floating Bottom Simulation HUD */}
      <QuickControlsHUD />

      {/* Modals & Analytics Views */}
      <VehicleFleetModal />
      <EnvironmentTimeModal />
      <RoutePlannerModal />
      <ImpactStatsView />
      <ScenarioPresetsModal />
    </main>
  );
}
