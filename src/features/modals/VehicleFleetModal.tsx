import React from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { X, Car, Bike, Bus, Truck, RotateCcw, ArrowRight } from 'lucide-react';
import { VEHICLE_CONFIGS } from '../traffic-simulation/engine';

export const VehicleFleetModal: React.FC = () => {
  const activeModal = useTrafficStore((s) => s.activeModal);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);
  const fleetConfig = useTrafficStore((s) => s.fleetConfig);
  const setFleetCounts = useTrafficStore((s) => s.setFleetCounts);
  const stats = useTrafficStore((s) => s.stats);

  if (activeModal !== 'fleet') return null;

  const totalVehicles =
    fleetConfig.privateCars +
    fleetConfig.motorcycles +
    fleetConfig.angkots +
    fleetConfig.buses +
    fleetConfig.trucks;

  const totalCommuters =
    fleetConfig.privateCars * VEHICLE_CONFIGS.car.capacity +
    fleetConfig.motorcycles * VEHICLE_CONFIGS.motorcycle.capacity +
    fleetConfig.angkots * VEHICLE_CONFIGS.angkot.capacity +
    fleetConfig.buses * VEHICLE_CONFIGS.bus.capacity;

  const publicCommuters =
    fleetConfig.angkots * VEHICLE_CONFIGS.angkot.capacity +
    fleetConfig.buses * VEHICLE_CONFIGS.bus.capacity;

  const publicSharePct = Math.round((publicCommuters / Math.max(1, totalCommuters)) * 100);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-white">
              Vehicle Fleet & Modal Split
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust private vehicles vs. public transport to observe traffic flow and queue lengths in real-time.
            </p>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Split Comparison Bar */}
        <div className="my-5 p-4 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">
              Total Commuters: <strong className="font-mono text-white">{Math.round(totalCommuters)} people</strong>
            </span>
            <span className="text-slate-400">
              Total Fleet: <strong className="font-mono text-white">{totalVehicles} vehicles</strong>
            </span>
          </div>

          {/* Mode Split Graphic Bar */}
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${publicSharePct}%` }}
              title={`Public Transit: ${publicSharePct}%`}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${100 - publicSharePct}%` }}
              title={`Private Vehicles: ${100 - publicSharePct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-2 font-mono">
            <span className="text-sky-400">Public Transit: {publicSharePct}%</span>
            <span className="text-rose-400">Private Vehicles: {100 - publicSharePct}%</span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-1">
          {/* 1. Private Cars */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-semibold text-white">Mobil Pribadi (Private Cars)</span>
                <span className="text-[11px] text-slate-400">~1.4 pax/car</span>
              </div>
              <span className="font-mono text-sm font-bold text-rose-400 bg-rose-950/50 px-2.5 py-0.5 rounded-md border border-rose-800/50">
                {fleetConfig.privateCars} unit
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={2}
              value={fleetConfig.privateCars}
              onChange={(e) => setFleetCounts({ privateCars: parseInt(e.target.value) })}
              className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* 2. Motorcycles */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">Sepeda Motor (Motorcycles)</span>
                <span className="text-[11px] text-slate-400">~1.1 pax/bike</span>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400 bg-amber-950/50 px-2.5 py-0.5 rounded-md border border-amber-800/50">
                {fleetConfig.motorcycles} unit
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={2}
              value={fleetConfig.motorcycles}
              onChange={(e) => setFleetCounts({ motorcycles: parseInt(e.target.value) })}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Angkot (Public Minivans) */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-sky-900/40 bg-sky-950/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-semibold text-white">Angkutan Kota (Angkot Minivans)</span>
                <span className="text-[11px] text-sky-300">12 pax/angkot (replaces ~10 private vehicles)</span>
              </div>
              <span className="font-mono text-sm font-bold text-sky-400 bg-sky-950/50 px-2.5 py-0.5 rounded-md border border-sky-800/50">
                {fleetConfig.angkots} unit
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={1}
              value={fleetConfig.angkots}
              onChange={(e) => setFleetCounts({ angkots: parseInt(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* 4. Buses (School & Transit Bus) */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-emerald-900/40 bg-emerald-950/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Bus Sekolah & City Trans</span>
                <span className="text-[11px] text-emerald-300">42 pax/bus (replaces ~30 private cars)</span>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-md border border-emerald-800/50">
                {fleetConfig.buses} unit
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={fleetConfig.buses}
              onChange={(e) => setFleetCounts({ buses: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* 5. Logistics Trucks */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-white">Pickup Sayur & Logistik Pasar</span>
              </div>
              <span className="font-mono text-sm font-bold text-slate-300 bg-slate-950/50 px-2.5 py-0.5 rounded-md border border-slate-800">
                {fleetConfig.trucks} unit
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              step={1}
              value={fleetConfig.trucks}
              onChange={(e) => setFleetCounts({ trucks: parseInt(e.target.value) })}
              className="w-full accent-slate-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={() => setFleetCounts({ privateCars: 20, motorcycles: 28, angkots: 8, buses: 3, trucks: 3 })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => setActiveModal(null)}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-sm"
          >
            Apply & View Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
