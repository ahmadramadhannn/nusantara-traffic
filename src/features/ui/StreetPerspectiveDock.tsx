import React from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { Camera, Eye, Map, Video } from 'lucide-react';
import { CameraViewMode } from '../../types';

export const StreetPerspectiveDock: React.FC = () => {
  const cameraMode = useTrafficStore((s) => s.cameraMode);
  const setCameraMode = useTrafficStore((s) => s.setCameraMode);
  const vehicles = useTrafficStore((s) => s.vehicles);

  const streets: { id: CameraViewMode; name: string; tag: string }[] = [
    { id: 'birds_eye', name: "Bird's-Eye", tag: 'Overview' },
    { id: 'street_sudirman', name: 'Jl. Sudirman', tag: 'Alun-Alun' },
    { id: 'street_merdeka', name: 'Jl. Merdeka', tag: 'SD Negeri 01' },
    { id: 'street_diponegoro', name: 'Jl. Diponegoro', tag: 'Terminal Angkot' },
    { id: 'street_kartini', name: 'Jl. Kartini', tag: 'Pasar Tradisional' },
  ];

  const handleFollowAngkot = () => {
    const angkot = vehicles.find((v) => v.type === 'angkot');
    if (angkot) {
      setCameraMode('follow_vehicle', angkot.id);
    }
  };

  const handleFollowSchoolBus = () => {
    const bus = vehicles.find((v) => v.type === 'bus');
    if (bus) {
      setCameraMode('follow_vehicle', bus.id);
    }
  };

  return (
    <div className="absolute top-18 left-6 z-20 flex flex-col gap-2 max-w-xs">
      <div className="p-3 bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-xl text-white">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span>Camera & Street Views</span>
        </div>

        {/* Street List */}
        <div className="space-y-1">
          {streets.map((st) => {
            const isActive = cameraMode === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setCameraMode(st.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white font-semibold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <span>{st.name}</span>
                <span className={`text-[10px] ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                  {st.tag}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full h-px bg-slate-800 my-2" />

        {/* Live Follow Ride shortcuts */}
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
          Live Chase Cam
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleFollowSchoolBus}
            className={`px-2.5 py-1.5 text-xs rounded-lg border text-center transition-all ${
              cameraMode === 'follow_vehicle'
                ? 'bg-amber-950/60 border-amber-500/80 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🚌 Bus Sekolah
          </button>
          <button
            onClick={handleFollowAngkot}
            className="px-2.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-center transition-all"
          >
            🚐 Angkot 01
          </button>
        </div>
      </div>
    </div>
  );
};
