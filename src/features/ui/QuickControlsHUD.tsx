import React from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Clock,
  Gauge,
  Users,
} from 'lucide-react';

export const QuickControlsHUD: React.FC = () => {
  const isPlaying = useTrafficStore((s) => s.isPlaying);
  const togglePlay = useTrafficStore((s) => s.togglePlay);
  const simSpeed = useTrafficStore((s) => s.simSpeed);
  const setSimSpeed = useTrafficStore((s) => s.setSimSpeed);
  const respawnFleet = useTrafficStore((s) => s.respawnFleet);
  const stats = useTrafficStore((s) => s.stats);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);
  const applyPreset = useTrafficStore((s) => s.applyPreset);

  const getCongestionColor = (pct: number) => {
    if (pct < 30) return 'text-emerald-400';
    if (pct < 65) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 max-w-5xl w-[92%]">
      {/* Dynamic Alert Banner for School Bus Delays if severe */}
      {stats.schoolBusDelayMinutes > 10 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-950/85 backdrop-blur-md border border-rose-800/80 rounded-xl text-rose-200 text-xs shadow-lg animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Severe School Bus Delay:</strong> Children arriving ~{stats.schoolBusDelayMinutes} minutes late to SD Negeri 01 due to private vehicle gridlock.
          </span>
          <button
            onClick={() => applyPreset('public_transit_mastery')}
            className="ml-2 px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white font-medium rounded-md transition-colors"
          >
            Switch to Public Transit Mode
          </button>
        </div>
      )}

      {/* Main Glass HUD Bar */}
      <div className="w-full flex items-center justify-between gap-4 p-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-2xl text-white">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`p-2.5 rounded-xl font-medium transition-colors flex items-center justify-center ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold'
            }`}
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Speed Buttons */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  simSpeed === spd
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={respawnFleet}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg border border-slate-800/60 transition-colors"
            title="Reset Vehicle Positions"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Live Traffic Health Bar (Clean Unboxed Typography) */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-slate-400" />
            <span>Avg Speed</span>
            <span className="font-mono text-sm font-semibold text-white">
              {stats.averageSpeedKmh} <span className="text-[10px] text-slate-400">km/h</span>
            </span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center gap-2">
            <span>Congestion Level</span>
            <span className={`font-mono text-sm font-semibold ${getCongestionColor(stats.congestionPercentage)}`}>
              {stats.congestionPercentage}%
            </span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>School Bus Delay</span>
            <span className={`font-mono text-sm font-semibold ${stats.schoolBusDelayMinutes > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
              +{stats.schoolBusDelayMinutes} <span className="text-[10px] text-slate-400">min</span>
            </span>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Mode Share</span>
            <span className="font-mono text-xs font-semibold text-sky-400">
              {stats.modeSplit.publicPct}% Public
            </span>
            <span className="text-slate-500">/</span>
            <span className="font-mono text-xs text-slate-300">
              {stats.modeSplit.privatePct}% Private
            </span>
          </div>
        </div>

        {/* Right: Quick Presets Shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal('presets')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Scenarios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
