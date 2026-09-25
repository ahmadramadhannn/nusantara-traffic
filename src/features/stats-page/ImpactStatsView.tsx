import React, { useState } from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import {
  X,
  Clock,
  Gauge,
  TrendingDown,
  Fuel,
  Users,
  AlertCircle,
  GraduationCap,
  Store,
  HeartPulse,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const ImpactStatsView: React.FC = () => {
  const activeModal = useTrafficStore((s) => s.activeModal);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);
  const stats = useTrafficStore((s) => s.stats);
  const fleetConfig = useTrafficStore((s) => s.fleetConfig);
  const applyPreset = useTrafficStore((s) => s.applyPreset);

  const [hypotheticalShiftPct, setHypotheticalShiftPct] = useState(30);

  if (activeModal !== 'stats') return null;

  // Format currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Hypothetical shift calculations
  const simulatedReductionInCongestion = Math.max(
    5,
    Math.round(stats.congestionPercentage * (1 - hypotheticalShiftPct / 110))
  );
  const savedMinutesPerTrip = Math.max(
    0.5,
    Math.round((stats.averageTripTimeMinutes - (stats.averageTripTimeMinutes * (1 - (stats.congestionPercentage - simulatedReductionInCongestion) / 100))) * 10) / 10
  );
  const savedRupiahPerHour = Math.round((stats.economicLossIdrPerHour * (hypotheticalShiftPct / 100)) * 0.85);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Public Transit Impact & Human Evidence</span>
            </div>
            <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">
              Real-World Impact on Indonesian Town Lives
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Visualizing how shifting trips from private motor vehicles to collective transit (Angkot & Bus) transforms daily life, child education, and household economics.
            </p>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 4 Key Human Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          {/* 1. School Bus Delay */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">School Bus Delay</span>
              <GraduationCap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-mono text-3xl font-extrabold text-white">
              +{stats.schoolBusDelayMinutes} <span className="text-sm font-normal text-slate-400">min</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {stats.schoolBusDelayMinutes > 8
                ? '⚠️ Students arrive late, missing morning flag ceremony & 1st period.'
                : '✅ On time arrival for SD & SMP Sukamaju students.'}
            </p>
          </div>

          {/* 2. Town Travel Time */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Avg Town Crossing</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="font-mono text-3xl font-extrabold text-white">
              {stats.averageTripTimeMinutes} <span className="text-sm font-normal text-slate-400">min</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Free flow baseline is <strong className="text-emerald-400">3.8 min</strong> across the 1.2km town corridor.
            </p>
          </div>

          {/* 3. Congestion Index */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Congestion Index</span>
              <Gauge className="w-4 h-4 text-rose-400" />
            </div>
            <div className={`font-mono text-3xl font-extrabold ${stats.congestionPercentage > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {stats.congestionPercentage}%
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Current town average speed: <strong className="font-mono text-white">{stats.averageSpeedKmh} km/h</strong>.
            </p>
          </div>

          {/* 4. Economic Loss per Hour */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Town Economic Loss</span>
              <Fuel className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-mono text-xl font-bold text-amber-300 mt-1">
              {formatRupiah(stats.economicLossIdrPerHour)}
              <span className="text-xs font-normal text-slate-400">/hr</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {stats.fuelWastedLitersPerHour} L fuel wasted + lost productive hours.
            </p>
          </div>
        </div>

        {/* Section 2: What This Means for Real People (Human Stories) */}
        <div className="my-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
            What This Means For Real People
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Story 1: Adit & SD Students */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Adit & Maya (SD Negeri 01)</h4>
                  <p className="text-[11px] text-slate-400">Primary School Pupils</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When 40+ parents drive individual cars to drop off children on Jl. Merdeka, the road bottlenecks. A single school bus carries all 40 children, clearing 35 cars off the morning school gate.
              </p>
            </div>

            {/* Story 2: Pak Joko (Angkot Driver) */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Pak Joko (Sopir Angkot 01)</h4>
                  <p className="text-[11px] text-slate-400">Public Transit Operator</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                With fluid public transit priority, Pak Joko completes 8 full loops a day instead of 3 stuck in traffic, earning a dignified livelihood while keeping fares affordable for market workers.
              </p>
            </div>

            {/* Story 3: Puskesmas Ambulance */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Layanan Ambulans RSUD</h4>
                  <p className="text-[11px] text-slate-400">Emergency Healthcare</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gridlocked intersections on Jl. Sudirman delay critical emergency transport. Reducing private vehicle clutter ensures unobstructed life-saving corridors.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Road Space Efficiency Geometry */}
        <div className="my-6 p-5 bg-slate-950 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-1">
            Road Space Footprint Comparison
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            How much road area (m²) is required to transport one citizen across town:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-rose-900/40">
              <div className="text-xs text-rose-300 font-semibold mb-1">Mobil Pribadi (Car)</div>
              <div className="font-mono text-2xl font-bold text-rose-400">6.1 m² <span className="text-xs font-normal text-slate-400">/ person</span></div>
              <p className="text-[11px] text-slate-400 mt-1">Carries only 1.4 people on average, occupying huge road buffer.</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-sky-900/40">
              <div className="text-xs text-sky-300 font-semibold mb-1">Angkot (Minivan)</div>
              <div className="font-mono text-2xl font-bold text-sky-400">0.73 m² <span className="text-xs font-normal text-slate-400">/ person</span></div>
              <p className="text-[11px] text-slate-400 mt-1">8.3x more space-efficient than single-occupancy private cars.</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/40">
              <div className="text-xs text-emerald-300 font-semibold mb-1">Bus Sekolah / Trans</div>
              <div className="font-mono text-2xl font-bold text-emerald-400">0.55 m² <span className="text-xs font-normal text-slate-400">/ person</span></div>
              <p className="text-[11px] text-slate-400 mt-1">11.1x more space-efficient. 1 bus clears an entire street block.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Interactive "What-If" Calculator */}
        <div className="p-5 bg-gradient-to-r from-sky-950/40 via-slate-950 to-slate-900 rounded-2xl border border-sky-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">
                Interactive Policy Simulator: Shift Private Trips to Public Transit
              </h4>
              <p className="text-xs text-slate-400">
                Slide to see how shifting a percentage of car/motorcycle trips to Angkot & Bus frees the town:
              </p>
            </div>
            <span className="font-mono text-lg font-bold text-sky-400 bg-sky-950 px-3 py-1 rounded-xl border border-sky-800 shrink-0">
              {hypotheticalShiftPct}% Shifted
            </span>
          </div>

          <input
            type="range"
            min={5}
            max={80}
            step={5}
            value={hypotheticalShiftPct}
            onChange={(e) => setHypotheticalShiftPct(parseInt(e.target.value))}
            className="w-full accent-sky-400 bg-slate-800 h-2.5 rounded-lg cursor-pointer mb-4"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="text-slate-400">Projected Congestion</div>
              <div className="font-mono text-lg font-bold text-emerald-400 mt-0.5">
                {simulatedReductionInCongestion}% <span className="text-xs text-slate-400">({stats.congestionPercentage - simulatedReductionInCongestion}% drop)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="text-slate-400">Time Saved per Citizen</div>
              <div className="font-mono text-lg font-bold text-sky-400 mt-0.5">
                {savedMinutesPerTrip} min <span className="text-xs text-slate-400">per trip</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="text-slate-400">Town Economic Savings</div>
              <div className="font-mono text-base font-bold text-amber-300 mt-0.5">
                {formatRupiah(savedRupiahPerHour)} <span className="text-xs text-slate-400">/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-800">
          <button
            onClick={() => applyPreset('public_transit_mastery')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Apply Transit-First Preset in 3D</span>
          </button>

          <button
            onClick={() => setActiveModal(null)}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Back to Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
