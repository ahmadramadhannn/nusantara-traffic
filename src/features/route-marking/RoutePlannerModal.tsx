import React, { useState } from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { X, Navigation, MapPin, Car, Bike, Bus, Clock, Gauge, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { TOWN_LANDMARKS } from '../town-scene/constants';
import { VehicleType } from '../../types';

export const RoutePlannerModal: React.FC = () => {
  const activeModal = useTrafficStore((s) => s.activeModal);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);
  const routeTrip = useTrafficStore((s) => s.routeTrip);
  const startTripSimulation = useTrafficStore((s) => s.startTripSimulation);
  const cancelTripSimulation = useTrafficStore((s) => s.cancelTripSimulation);
  const stats = useTrafficStore((s) => s.stats);

  const [startId, setStartId] = useState(routeTrip.startLandmarkId || 'perumahan_griya');
  const [endId, setEndId] = useState(routeTrip.endLandmarkId || 'school_sdn01');
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('bus');

  if (activeModal !== 'route') return null;

  const startLandmark = TOWN_LANDMARKS.find((l) => l.id === startId) || TOWN_LANDMARKS[0];
  const endLandmark = TOWN_LANDMARKS.find((l) => l.id === endId) || TOWN_LANDMARKS[1];

  // Calculate comparative trip durations
  const calculateComparativeTimes = () => {
    const baseDistanceKm = 1.35;
    const congestionFactor = 1 + (stats.congestionPercentage / 100) * 2.6;

    const carClearMin = Math.round(((baseDistanceKm / 32) * 60) * 10) / 10;
    const carCongestedMin = Math.round((carClearMin * congestionFactor) * 10) / 10;

    const bikeClearMin = Math.round(((baseDistanceKm / 35) * 60) * 10) / 10;
    const bikeCongestedMin = Math.round((bikeClearMin * (1 + (stats.congestionPercentage / 100) * 1.4)) * 10) / 10;

    const angkotClearMin = Math.round(((baseDistanceKm / 28) * 60) * 10) / 10;
    const angkotCongestedMin = Math.round((angkotClearMin * congestionFactor) * 10) / 10;

    const busClearMin = Math.round(((baseDistanceKm / 26) * 60) * 10) / 10;
    const busCongestedMin = Math.round((busClearMin * congestionFactor) * 10) / 10;

    return {
      car: { clear: carClearMin, current: carCongestedMin, delay: Math.round((carCongestedMin - carClearMin) * 10) / 10 },
      motorcycle: { clear: bikeClearMin, current: bikeCongestedMin, delay: Math.round((bikeCongestedMin - bikeClearMin) * 10) / 10 },
      angkot: { clear: angkotClearMin, current: angkotCongestedMin, delay: Math.round((angkotCongestedMin - angkotClearMin) * 10) / 10 },
      bus: { clear: busClearMin, current: busCongestedMin, delay: Math.round((busCongestedMin - busClearMin) * 10) / 10 },
    };
  };

  const comp = calculateComparativeTimes();

  const handleStartSim = () => {
    startTripSimulation(startId, endId, selectedVehicleType);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-white">
              Trip Route Simulation & Delay Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an origin and destination in Sukamaju to test real trip commute times and camera chase.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
          {/* Origin */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Titik Awal (Origin)</span>
            </div>
            <select
              value={startId}
              onChange={(e) => setStartId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
            >
              {TOWN_LANDMARKS.map((lm) => (
                <option key={lm.id} value={lm.id} disabled={lm.id === endId}>
                  {lm.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{startLandmark.description}</p>
          </div>

          {/* Destination */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-rose-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Titik Tujuan (Destination)</span>
            </div>
            <select
              value={endId}
              onChange={(e) => setEndId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
            >
              {TOWN_LANDMARKS.map((lm) => (
                <option key={lm.id} value={lm.id} disabled={lm.id === startId}>
                  {lm.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{endLandmark.description}</p>
          </div>
        </div>

        {/* Mode Comparison Table */}
        <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 mb-5">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Mode Comparison for this Trip (~1.35 km corridor)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* School Bus */}
            <button
              onClick={() => setSelectedVehicleType('bus')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedVehicleType === 'bus'
                  ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                <Bus className="w-3.5 h-3.5" />
                <span>Bus Sekolah</span>
              </div>
              <div className="font-mono text-lg font-bold text-white">
                {comp.bus.current} <span className="text-xs font-normal text-slate-400">min</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Delay: <span className={comp.bus.delay > 5 ? 'text-rose-400 font-mono font-semibold' : 'text-emerald-400'}>+{comp.bus.delay}m</span>
              </div>
            </button>

            {/* Angkot */}
            <button
              onClick={() => setSelectedVehicleType('angkot')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedVehicleType === 'angkot'
                  ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-1">
                <Bus className="w-3.5 h-3.5" />
                <span>Angkot Kota</span>
              </div>
              <div className="font-mono text-lg font-bold text-white">
                {comp.angkot.current} <span className="text-xs font-normal text-slate-400">min</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Delay: <span className={comp.angkot.delay > 5 ? 'text-rose-400 font-mono font-semibold' : 'text-emerald-400'}>+{comp.angkot.delay}m</span>
              </div>
            </button>

            {/* Motorcycle */}
            <button
              onClick={() => setSelectedVehicleType('motorcycle')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedVehicleType === 'motorcycle'
                  ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
                <Bike className="w-3.5 h-3.5" />
                <span>Motor Matic</span>
              </div>
              <div className="font-mono text-lg font-bold text-white">
                {comp.motorcycle.current} <span className="text-xs font-normal text-slate-400">min</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Delay: <span className="text-amber-400 font-mono font-semibold">+{comp.motorcycle.delay}m</span>
              </div>
            </button>

            {/* Private Car */}
            <button
              onClick={() => setSelectedVehicleType('car')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedVehicleType === 'car'
                  ? 'bg-rose-950/50 border-rose-500 ring-1 ring-rose-500'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1">
                <Car className="w-3.5 h-3.5" />
                <span>Mobil Pribadi</span>
              </div>
              <div className="font-mono text-lg font-bold text-white">
                {comp.car.current} <span className="text-xs font-normal text-slate-400">min</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Delay: <span className="text-rose-400 font-mono font-semibold">+{comp.car.delay}m</span>
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
              Cancel
            </button>
            <button
              onClick={handleStartSim}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate & Chase Vehicle in 3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
