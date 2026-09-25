import React from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { Bus, Car, Bike, CheckCircle2, Clock, X, Gauge } from 'lucide-react';

export const TripSimulationBanner: React.FC = () => {
  const routeTrip = useTrafficStore((s) => s.routeTrip);
  const cancelTripSimulation = useTrafficStore((s) => s.cancelTripSimulation);

  if (!routeTrip.isActive) return null;

  const getVehicleIcon = () => {
    switch (routeTrip.vehicleType) {
      case 'bus':
        return <Bus className="w-4 h-4 text-emerald-400" />;
      case 'angkot':
        return <Bus className="w-4 h-4 text-sky-400" />;
      case 'motorcycle':
        return <Bike className="w-4 h-4 text-amber-400" />;
      case 'car':
      default:
        return <Car className="w-4 h-4 text-rose-400" />;
    }
  };

  const mins = Math.floor(routeTrip.elapsedTripSeconds / 60);
  const secs = Math.round(routeTrip.elapsedTripSeconds % 60);

  return (
    <div className="absolute top-18 right-6 z-20 max-w-sm w-full p-4 bg-slate-950/85 backdrop-blur-md border border-sky-500/50 rounded-2xl shadow-2xl text-white animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {getVehicleIcon()}
          <span className="text-xs font-bold font-display uppercase tracking-wider text-sky-400">
            Active 3D Chase Ride
          </span>
        </div>
        <button
          onClick={cancelTripSimulation}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="my-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Route:</span>
          <span className="font-semibold text-white truncate max-w-[200px]">
            {routeTrip.startPoint.name} → {routeTrip.endPoint.name}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Mode:</span>
          <span className="font-semibold capitalize text-white">{routeTrip.vehicleType}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Elapsed Time:</span>
          <span className="font-mono font-bold text-white">
            {mins}m {secs.toString().padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* Trip Progress Bar */}
      <div className="mt-2">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Route Progress</span>
          <span className="font-mono font-bold text-sky-400">{routeTrip.currentProgressPct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
            style={{ width: `${routeTrip.currentProgressPct}%` }}
          />
        </div>
      </div>

      {routeTrip.isCompleted && (
        <div className="mt-3 p-2 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Trip finished! Passenger arrived safely at destination.</span>
        </div>
      )}
    </div>
  );
};
