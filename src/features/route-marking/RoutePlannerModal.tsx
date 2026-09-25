import React from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import {
  X,
  Navigation,
  MapPin,
  Car,
  Bike,
  Bus,
  Clock,
  Gauge,
  ArrowRight,
  Play,
  CheckCircle2,
  ArrowRightLeft,
} from 'lucide-react';
import { TOWN_PLACES } from '../town-scene/constants';
import { TripPoint, VehicleType } from '../../types';

export const RoutePlannerModal: React.FC = () => {
  const activeModal = useTrafficStore((s) => s.activeModal);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);
  const startPoint = useTrafficStore((s) => s.startPoint);
  const endPoint = useTrafficStore((s) => s.endPoint);
  const setTripStartPoint = useTrafficStore((s) => s.setTripStartPoint);
  const setTripEndPoint = useTrafficStore((s) => s.setTripEndPoint);
  const swapTripPoints = useTrafficStore((s) => s.swapTripPoints);
  const detailedRoute = useTrafficStore((s) => s.detailedRoute);
  const activeTripMode = useTrafficStore((s) => s.activeTripMode);
  const setActiveTripMode = useTrafficStore((s) => s.setActiveTripMode);
  const startTripSimulation = useTrafficStore((s) => s.startTripSimulation);
  const routeTrip = useTrafficStore((s) => s.routeTrip);
  const cancelTripSimulation = useTrafficStore((s) => s.cancelTripSimulation);

  if (activeModal !== 'route') return null;

  const formatSec = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleSelectStart = (id: string) => {
    const found = TOWN_PLACES.find((p) => p.id === id);
    if (found) setTripStartPoint(found as TripPoint);
  };

  const handleSelectEnd = (id: string) => {
    const found = TOWN_PLACES.find((p) => p.id === id);
    if (found) setTripEndPoint(found as TripPoint);
  };

  const handleStartSim = () => {
    startTripSimulation(activeTripMode);
    setActiveModal(null);
  };

  const modeTimes = detailedRoute.modeTimes || {
    car: { liveSec: 180, delaySec: 30, clearSec: 150 },
    motorcycle: { liveSec: 140, delaySec: 10, clearSec: 130 },
    angkot: { liveSec: 190, delaySec: 30, clearSec: 160 },
    bus: { liveSec: 200, delaySec: 30, clearSec: 170 },
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-white">
              Trip Route Planner & Live Traffic Calculation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Right-click any 3D building or select from the list to test real commute times across Sukamaju.
            </p>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Origin and Destination Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 relative">
          {/* Origin */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Titik Awal (Origin [A])</span>
            </div>
            <select
              value={startPoint.id}
              onChange={(e) => handleSelectStart(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
            >
              {TOWN_PLACES.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === endPoint.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
              {startPoint.description || `Koordinat [${startPoint.position[0]}, ${startPoint.position[2]}]`}
            </p>
          </div>

          {/* Destination */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-rose-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Titik Tujuan (Destination [B])</span>
            </div>
            <select
              value={endPoint.id}
              onChange={(e) => handleSelectEnd(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
            >
              {TOWN_PLACES.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === startPoint.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
              {endPoint.description || `Koordinat [${endPoint.position[0]}, ${endPoint.position[2]}]`}
            </p>
          </div>
        </div>

        {/* Live Route Summary Pill */}
        <div className="flex items-center justify-between p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs mb-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Distance:</span>{' '}
              <strong className="font-mono text-white">{detailedRoute.totalDistanceMeters} m</strong>
            </div>
            <div className="w-px h-3.5 bg-slate-800" />
            <div>
              <span className="text-slate-400">Corridor Segments:</span>{' '}
              <strong className="font-mono text-sky-400">{detailedRoute.segmentIds.length} streets</strong>
            </div>
          </div>

          <button
            onClick={swapTripPoints}
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Swap Route</span>
          </button>
        </div>

        {/* Live Dynamic Mode Comparison Table */}
        <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            <span>Dynamic Live ETAs by Transport Mode</span>
            <span className="text-[10px] text-emerald-400 font-mono">Live Traffic Linked</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Bus */}
            <button
              onClick={() => setActiveTripMode('bus')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTripMode === 'bus'
                  ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                <Bus className="w-3.5 h-3.5" />
                <span>Bus Sekolah</span>
              </div>
              <div className="font-mono text-lg font-bold text-white">
                {formatSec(modeTimes.bus.liveSec)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Delay: <span className={modeTimes.bus.delaySec > 60 ? 'text-rose-400 font-mono' : 'text-emerald-400'}>+{formatSec(modeTimes.bus.delaySec)}</span>
              </div>
            </button>

            {/* Angkot */}
            <button
              onClick={() => setActiveTripMode('angkot')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTripMode === 'angkot'
                  ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-1">
                <Bus className="w-3.5 h-3.5" />
                <span>Angkot Kota</span>
              </div>
              <div className="font-mono text-lg font-bold text-white">
                {formatSec(modeTimes.angkot.liveSec)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Delay: <span className={modeTimes.angkot.delaySec > 60 ? 'text-rose-400 font-mono' : 'text-emerald-400'}>+{formatSec(modeTimes.angkot.delaySec)}</span>
              </div>
            </button>

            {/* Motorcycle */}
            <button
              onClick={() => setActiveTripMode('motorcycle')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTripMode === 'motorcycle'
                  ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
                <Bike className="w-3.5 h-3.5" />
                <span>Sepeda Motor</span>
              </div>
              <div className="font-mono text-lg font-bold text-white">
                {formatSec(modeTimes.motorcycle.liveSec)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Delay: <span className="text-amber-400 font-mono">+{formatSec(modeTimes.motorcycle.delaySec)}</span>
              </div>
            </button>

            {/* Private Car */}
            <button
              onClick={() => setActiveTripMode('car')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTripMode === 'car'
                  ? 'bg-rose-950/50 border-rose-500 ring-1 ring-rose-500'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1">
                <Car className="w-3.5 h-3.5" />
                <span>Mobil Pribadi</span>
              </div>
              <div className="font-mono text-lg font-bold text-white">
                {formatSec(modeTimes.car.liveSec)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Delay: <span className="text-rose-400 font-mono font-semibold">+{formatSec(modeTimes.car.delaySec)}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {routeTrip.isActive && (
            <button
              onClick={cancelTripSimulation}
              className="text-xs text-rose-400 hover:text-rose-300"
            >
              Stop Current Trip Follow
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={handleStartSim}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate & Chase in 3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
