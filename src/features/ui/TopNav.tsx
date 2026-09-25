import React from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { BarChart3, SlidersHorizontal, Compass, CloudSun } from 'lucide-react';
import { CameraViewMode } from '../../types';

export const TopNav: React.FC = () => {
  const cameraMode = useTrafficStore((s) => s.cameraMode);
  const setCameraMode = useTrafficStore((s) => s.setCameraMode);
  const activeModal = useTrafficStore((s) => s.activeModal);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);
  const stats = useTrafficStore((s) => s.stats);

  const navStreetLinks: { id: CameraViewMode; label: string }[] = [
    { id: 'birds_eye', label: "Bird's-Eye" },
    { id: 'street_sudirman', label: 'Jl. Sudirman' },
    { id: 'street_merdeka', label: 'Jl. Merdeka' },
    { id: 'street_diponegoro', label: 'Jl. Diponegoro' },
    { id: 'street_kartini', label: 'Jl. Kartini' },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single text element Brand Zone */}
      <div className="flex items-center gap-3">
        <span className="text-base font-bold tracking-tight text-white font-display">
          Nusantara Traffic Sim
        </span>
        <span className="hidden sm:inline-block text-xs text-slate-400 font-normal">
          Indonesian Public Transit Prototype
        </span>
      </div>

      {/* Zone 2: 4-6 clean single-line navigation / street perspective links */}
      <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
        {navStreetLinks.map((item) => (
          <button
            key={item.id}
            onClick={() => setCameraMode(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              cameraMode === item.id
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: Primary modal action triggers */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveModal(activeModal === 'environment' ? null : 'environment')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
            activeModal === 'environment'
              ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
          title="Weather & Context Settings"
        >
          <CloudSun className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Environment</span>
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'fleet' ? null : 'fleet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
            activeModal === 'fleet'
              ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
          title="Vehicle Fleet & Modal Split"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Vehicle Fleet</span>
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'route' ? null : 'route')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
            activeModal === 'route'
              ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
          title="Trip Route Simulator"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trip Planner</span>
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'stats' ? null : 'stats')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm ${
            activeModal === 'stats'
              ? 'bg-sky-600 text-white'
              : 'bg-sky-500 hover:bg-sky-400 text-white'
          }`}
          title="Real-People Impact Stats"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Impact Stats</span>
        </button>
      </div>
    </header>
  );
};
