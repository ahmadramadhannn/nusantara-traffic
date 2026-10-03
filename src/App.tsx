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
import { TrafficLightModal } from './features/modals/TrafficLightModal';
import { useTrafficStore } from './store/useTrafficStore';
import { Footprints } from 'lucide-react';

const ActiveCrosswalkBanner: React.FC = () => {
  const trafficLights = useTrafficStore((s) => s.trafficLights);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);

  const activeCrossingLight = Object.values(trafficLights).find(
    (l) => l.fsmState === 'PEDESTRIAN_CROSSING'
  );

  if (!activeCrossingLight) return null;

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 border border-emerald-500/50 rounded-2xl shadow-2xl backdrop-blur-md text-white animate-fade-in pointer-events-auto">
      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
        <Footprints className="w-4 h-4 animate-pulse" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">
            Penyeberangan Pejalan Kaki Aktif
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
            WALK: {activeCrossingLight.remainingTime}s
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            KENDARAAN: SEMUA MERAH
          </span>
        </div>
        <span className="text-[11px] text-slate-300">
          {activeCrossingLight.name} • Kendaraan berhenti di garis henti zebra cross
        </span>
      </div>
      <button
        onClick={() => setActiveModal('traffic_lights')}
        className="ml-2 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors"
      >
        Detail FSM
      </button>
    </div>
  );
};

export default function App() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Town Scene with Right-Click Support */}
      <TrafficCanvas />

      {/* Top Navigation Bar */}
      <TopNav />

      {/* Active Crosswalk Alert Banner */}
      <ActiveCrosswalkBanner />

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
      <TrafficLightModal />
      <RoutePlannerModal />
      <ImpactStatsView />
      <ScenarioPresetsModal />
    </main>
  );
}
