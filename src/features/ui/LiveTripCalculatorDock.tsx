import React, { useState } from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import {
  MapPin,
  Navigation,
  ArrowRightLeft,
  Car,
  Bike,
  Bus,
  Clock,
  Gauge,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { VehicleType } from '../../types';

export const LiveTripCalculatorDock: React.FC = () => {
  const startPoint = useTrafficStore((s) => s.startPoint);
  const endPoint = useTrafficStore((s) => s.endPoint);
  const detailedRoute = useTrafficStore((s) => s.detailedRoute);
  const activeTripMode = useTrafficStore((s) => s.activeTripMode);
  const setActiveTripMode = useTrafficStore((s) => s.setActiveTripMode);
  const swapTripPoints = useTrafficStore((s) => s.swapTripPoints);
  const startTripSimulation = useTrafficStore((s) => s.startTripSimulation);
  const routeTrip = useTrafficStore((s) => s.routeTrip);
  const cancelTripSimulation = useTrafficStore((s) => s.cancelTripSimulation);

  const [isExpanded, setIsExpanded] = useState(true);
  const [showSegmentDetails, setShowSegmentDetails] = useState(false);

  const formatSec = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const validMode = (['car', 'motorcycle', 'angkot', 'bus'].includes(activeTripMode)
    ? activeTripMode
    : 'car') as 'car' | 'motorcycle' | 'angkot' | 'bus';

  const modeData = detailedRoute?.modeTimes?.[validMode] || {
    liveSec: 180,
    delaySec: 30,
    clearSec: 150,
  };

  const isDelaySevere = modeData.delaySec > 90;

  return (
    <div className="absolute top-18 right-6 z-20 max-w-sm w-full transition-all">
      <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-2xl p-4 text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold font-display uppercase tracking-wider text-sky-400">
              Live Route ETA Calculator
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {/* Origin & Destination Display with Quick Swap */}
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/90 space-y-2 relative">
              {/* Origin */}
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-400 shrink-0 text-[11px]">From [A]:</span>
                <span className="font-semibold text-white truncate">{startPoint.name}</span>
              </div>

              {/* Destination */}
              <div className="flex items-center gap-2 text-xs">
                <Navigation className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-slate-400 shrink-0 text-[11px]">To [B]:</span>
                <span className="font-semibold text-white truncate">{endPoint.name}</span>
              </div>

              {/* Swap Button */}
              <button
                onClick={swapTripPoints}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
                title="Swap Start & Destination"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hint for Right-Click picking */}
            <div className="text-[10px] text-sky-400 bg-sky-950/40 px-2.5 py-1.5 rounded-lg border border-sky-900/50 flex items-center gap-1.5">
              <span>💡</span>
              <span>
                <strong>Tip:</strong> Right-click any 3D building or ground to set Start or Destination!
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
              {[
                { id: 'car' as VehicleType, name: 'Mobil', icon: Car },
                { id: 'motorcycle' as VehicleType, name: 'Motor', icon: Bike },
                { id: 'angkot' as VehicleType, name: 'Angkot', icon: Bus },
                { id: 'bus' as VehicleType, name: 'Bus', icon: Bus },
              ].map((m) => {
                const IconComp = m.icon;
                const isSelected = activeTripMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveTripMode(m.id)}
                    className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-center transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 mb-0.5" />
                    <span className="text-[10px] leading-tight">{m.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Calculated Stats Hero Card */}
            <div className="p-3.5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Live Dynamic ETA:</span>
                <span className="font-mono text-2xl font-extrabold text-white">
                  {formatSec(modeData.liveSec)}
                </span>
              </div>

              {/* Details line */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div>
                  <div className="text-slate-400 text-[10px]">Distance</div>
                  <div className="font-mono font-semibold text-slate-200">
                    {detailedRoute.totalDistanceMeters} m
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[10px]">Clear Baseline</div>
                  <div className="font-mono font-semibold text-emerald-400">
                    {formatSec(modeData.clearSec)}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[10px]">Traffic Delay</div>
                  <div
                    className={`font-mono font-semibold ${
                      modeData.delaySec > 60 ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    +{formatSec(modeData.delaySec)}
                  </div>
                </div>
              </div>
            </div>

            {/* Segment Breakdown Toggle */}
            <div>
              <button
                onClick={() => setShowSegmentDetails(!showSegmentDetails)}
                className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-white py-1 transition-colors"
              >
                <span>
                  Corridor Breakdown ({detailedRoute.segmentBreakdowns.length} road sections)
                </span>
                {showSegmentDetails ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {showSegmentDetails && (
                <div className="mt-1 space-y-1 max-h-32 overflow-y-auto pr-1">
                  {detailedRoute.segmentBreakdowns.map((seg, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60 flex items-center justify-between text-[10px]"
                    >
                      <div>
                        <div className="font-medium text-slate-200 truncate max-w-[140px]">
                          {seg.segmentName}
                        </div>
                        <div className="text-slate-400 font-mono">
                          {seg.liveSpeedKmh} km/h{' '}
                          {seg.isRedLightWaiting && <span className="text-rose-400">· Red Light</span>}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold ${
                            seg.congestionPct > 50 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {seg.congestionPct}% Macet
                        </span>
                        <div className="text-slate-400 font-mono">{seg.traversalTimeSec}s</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-1">
              {routeTrip.isActive ? (
                <div className="space-y-2">
                  <div className="p-2 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs flex items-center justify-between">
                    <span className="text-emerald-300">
                      Driving in 3D: <strong>{routeTrip.currentProgressPct}%</strong>
                    </span>
                    <button
                      onClick={cancelTripSimulation}
                      className="px-2 py-1 bg-rose-900/80 hover:bg-rose-800 text-white rounded text-[10px] font-medium"
                    >
                      Stop Chase
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => startTripSimulation(activeTripMode)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl transition-colors shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch 3D Test Ride</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
