import React, { useState } from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import {
  X,
  Sliders,
  Play,
  RotateCw,
  AlertOctagon,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  FastForward,
  Footprints,
  UserCheck,
} from 'lucide-react';
import { TrafficLightFsmState } from '../../types';

export const TrafficLightModal: React.FC = () => {
  const activeModal = useTrafficStore((s) => s.activeModal);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);
  const trafficLights = useTrafficStore((s) => s.trafficLights);
  const setTrafficLightFsmMode = useTrafficStore((s) => s.setTrafficLightFsmMode);
  const updateTrafficLightFsmConfig = useTrafficStore((s) => s.updateTrafficLightFsmConfig);
  const forceNextFsmPhase = useTrafficStore((s) => s.forceNextFsmPhase);
  const setAllTrafficLightsMode = useTrafficStore((s) => s.setAllTrafficLightsMode);
  const requestPedestrianCrossing = useTrafficStore((s) => s.requestPedestrianCrossing);

  const [selectedIntersectionId, setSelectedIntersectionId] = useState<string>('int_nw');

  if (activeModal !== 'traffic_lights') return null;

  const currentLight = trafficLights[selectedIntersectionId] || Object.values(trafficLights)[0];

  const intersectionsList = [
    { id: 'int_nw', name: 'Simpang Sudirman - Merdeka', desc: 'Barat Laut (Near Balai Kota & SDN 01)' },
    { id: 'int_ne', name: 'Simpang Sudirman - Diponegoro', desc: 'Timur Laut (Near Pasar Baru & Masjid)' },
    { id: 'int_sw', name: 'Simpang Kartini - Merdeka', desc: 'Barat Daya (Near RSUD Sukamaju)' },
    { id: 'int_se', name: 'Simpang Kartini - Diponegoro', desc: 'Tenggara (Near Terminal Bus & Angkot)' },
  ];

  const fsmSteps: {
    state: TrafficLightFsmState;
    label: string;
    corridor: string;
    color: string;
  }[] = [
    { state: 'EW_GREEN', label: '1. EW Green', corridor: 'Sudirman/Kartini', color: 'emerald' },
    { state: 'EW_YELLOW', label: '2. EW Yellow', corridor: 'Amber Clearance', color: 'amber' },
    { state: 'ALL_RED_AFTER_EW', label: '3. All-Red (Buffer)', corridor: 'Pembersihan Simpang', color: 'rose' },
    { state: 'NS_GREEN', label: '4. NS Green', corridor: 'Merdeka/Diponegoro', color: 'emerald' },
    { state: 'NS_YELLOW', label: '5. NS Yellow', corridor: 'Amber Clearance', color: 'amber' },
    { state: 'ALL_RED_AFTER_NS', label: '6. All-Red (Buffer)', corridor: 'Pembersihan Simpang', color: 'rose' },
    { state: 'PEDESTRIAN_CROSSING', label: '🚶 Pedestrian Walk', corridor: 'Semua Kendaraan MERAH', color: 'sky' },
  ];

  const isPedCrossing = currentLight?.fsmState === 'PEDESTRIAN_CROSSING';
  const isPedPending = currentLight?.pedestrianCallActive && !isPedCrossing;

  const triggerAllPedestrianCrossings = () => {
    intersectionsList.forEach((item) => {
      requestPedestrianCrossing(item.id);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <RotateCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Pengatur APILL / Traffic Signal FSM
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Finite State Machine
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Footprints className="w-3 h-3" />
                  Pedestrian Crosswalk Actuation
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Kontrol siklus FSM, masa kuning, interval all-red clearance, dan penyeberangan pejalan kaki pelican.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Global Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Skenario Global Seluruh Kota:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAllTrafficLightsMode('auto')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              >
                Auto FSM Terkoordinasi
              </button>
              <button
                onClick={triggerAllPedestrianCrossings}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors"
                title="Picu fase penyeberangan pejalan kaki (All-Red) serentak di 4 simpang"
              >
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>Panggil Penyeberang di Semua Simpang</span>
              </button>
              <button
                onClick={() => setAllTrafficLightsMode('flashing')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
              >
                Kuning Berkedip (Malam)
              </button>
              <button
                onClick={() => setAllTrafficLightsMode('all_red')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
              >
                Semua Merah (Emergency)
              </button>
            </div>
          </div>

          {/* Intersection Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {intersectionsList.map((int) => {
              const light = trafficLights[int.id];
              const isSelected = selectedIntersectionId === int.id;
              const isCrossing = light?.fsmState === 'PEDESTRIAN_CROSSING';
              return (
                <button
                  key={int.id}
                  onClick={() => setSelectedIntersectionId(int.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-sky-500 ring-1 ring-sky-500/50'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-white truncate">{int.name}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isCrossing
                          ? 'bg-emerald-400 animate-ping'
                          : light?.pedestrianCallActive
                          ? 'bg-amber-400 animate-pulse'
                          : light?.fsmState === 'FLASHING_YELLOW'
                          ? 'bg-amber-400 animate-ping'
                          : light?.isAllRed
                          ? 'bg-rose-500'
                          : light?.ewSignal === 'GREEN'
                          ? 'bg-emerald-400'
                          : 'bg-sky-400'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">{int.desc}</span>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span className="flex items-center gap-1 truncate">
                      {isCrossing ? (
                        <span className="text-emerald-300 font-bold flex items-center gap-0.5">
                          <Footprints className="w-3 h-3" /> PED CROSS
                        </span>
                      ) : (
                        light?.fsmState.replace(/_/g, ' ')
                      )}
                    </span>
                    <span className={`font-bold ${isCrossing ? 'text-emerald-400' : 'text-sky-400'}`}>
                      {light?.remainingTime}s
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Intersection Detail & Live FSM State */}
          {currentLight && (
            <div className="space-y-6 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
              
              {/* Header Info & State Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {currentLight.name}
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold border ${
                      isPedCrossing
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                        : isPedPending
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : currentLight.mode === 'auto'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : currentLight.mode === 'flashing'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {isPedCrossing
                        ? '🚶 PEDESTRIAN CROSSING (ALL-RED)'
                        : isPedPending
                        ? 'PEDESTRIAN CALL PENDING'
                        : currentLight.mode.toUpperCase()}
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Node Simpang 4 Kaki • Dilengkapi Tombol Pelican Penyeberangan Jalan & RHK Motor
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span className="text-xs text-slate-300">Countdown:</span>
                    <span className="font-mono text-base font-bold text-sky-400">
                      {currentLight.remainingTime}s
                    </span>
                  </div>

                  <button
                    onClick={() => forceNextFsmPhase(currentLight.intersectionId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-95"
                    title="Paksa FSM beralih ke tahap berikutnya dalam siklus"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Lompati Fase (Step)</span>
                  </button>
                </div>
              </div>

              {/* Pedestrian Crosswalk & Pelican Actuation Card */}
              <div className={`p-4 rounded-xl border transition-all ${
                isPedCrossing
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : isPedPending
                  ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${
                      isPedCrossing
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : isPedPending
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <Footprints className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        Sistem Penyeberangan Pelican (Pelican Crosswalk Actuation)
                        {isPedCrossing && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                            ACTIVE WALK
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Menekan tombol penyeberangan mengalihkan FSM APILL ke fase kuning lalu <strong className="text-rose-400">SEMUA MERAH</strong> bagi kendaraan untuk memberi jalan aman bagi pejalan kaki.
                      </p>
                    </div>
                  </div>

                  {/* Pelican Action Button */}
                  <button
                    onClick={() => requestPedestrianCrossing(currentLight.intersectionId)}
                    disabled={isPedCrossing || isPedPending}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-lg ${
                      isPedCrossing
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                        : isPedPending
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-95'
                    }`}
                  >
                    <Footprints className="w-4 h-4" />
                    <span>
                      {isPedCrossing
                        ? `Sedang Menyeberang (${currentLight.remainingTime}s)`
                        : isPedPending
                        ? 'Permintaan Terdaftar (Menyiapkan Kuning/Merah...)'
                        : '🚶 Tekan Tombol Pelican (Minta Seberang)'}
                    </span>
                  </button>
                </div>

                {/* Status indicator pill row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Sinyal Pelican:</span>
                    <span className={`font-bold font-mono ${
                      currentLight.pedestrianSignal === 'WALK'
                        ? 'text-emerald-400'
                        : currentLight.pedestrianSignal === 'FLASHING_DONT_WALK'
                        ? 'text-rose-400 animate-pulse'
                        : 'text-rose-500'
                    }`}>
                      {currentLight.pedestrianSignal === 'WALK'
                        ? '🟢 HIJAU (WALK)'
                        : currentLight.pedestrianSignal === 'FLASHING_DONT_WALK'
                        ? '🔴 BERKEDIP (CLEARING)'
                        : '🔴 MERAH (DON\'T WALK)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Status Kendaraan:</span>
                    <span className={`font-bold font-mono ${
                      isPedCrossing
                        ? 'text-rose-400'
                        : 'text-sky-400'
                    }`}>
                      {isPedCrossing ? '🔴 SEMUA JALUR MERAH' : '🟢 SIKLUS BERGANTIAN'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Waktu Penyeberangan:</span>
                    <span className="font-bold font-mono text-emerald-400">
                      {currentLight.config.pedestrianCrossingDuration}s (Konfigurasi)
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Dual-Corridor APILL Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* East-West Corridor (Jl. Sudirman / Jl. Kartini) */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-200">
                      Koridor Timur-Barat (EW)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Jl. Sudirman / Jl. Kartini</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Simulated 3-Lens APILL Head */}
                    <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <div
                        className={`w-6 h-6 rounded-full transition-all ${
                          currentLight.ewSignal === 'RED'
                            ? 'bg-rose-500 shadow-lg shadow-rose-500/50 scale-105'
                            : 'bg-slate-800 opacity-40'
                        }`}
                      />
                      <div
                        className={`w-6 h-6 rounded-full transition-all ${
                          currentLight.ewSignal === 'YELLOW'
                            ? 'bg-amber-400 shadow-lg shadow-amber-400/50 scale-105'
                            : 'bg-slate-800 opacity-40'
                        }`}
                      />
                      <div
                        className={`w-6 h-6 rounded-full transition-all ${
                          currentLight.ewSignal === 'GREEN'
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-105'
                            : 'bg-slate-800 opacity-40'
                        }`}
                      />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${
                        currentLight.ewSignal === 'GREEN'
                          ? 'text-emerald-400'
                          : currentLight.ewSignal === 'YELLOW'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {currentLight.ewSignal === 'GREEN'
                          ? '🟢 HIJAU (Lancar Masuk)'
                          : currentLight.ewSignal === 'YELLOW'
                          ? '🟡 KUNING (Peringatan Berhenti)'
                          : '🔴 MERAH (Berhenti di Garis)'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {currentLight.ewSignal === 'GREEN'
                          ? 'Kendaraan dari Timur & Barat melaju'
                          : isPedCrossing
                          ? 'Berhenti penuh untuk pejalan kaki di Zebra Cross'
                          : 'Menunggu di belakang garis henti RHK'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* North-South Corridor (Jl. Merdeka / Jl. Diponegoro) */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-200">
                      Koridor Utara-Selatan (NS)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Jl. Merdeka / Jl. Diponegoro</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Simulated 3-Lens APILL Head */}
                    <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <div
                        className={`w-6 h-6 rounded-full transition-all ${
                          currentLight.nsSignal === 'RED'
                            ? 'bg-rose-500 shadow-lg shadow-rose-500/50 scale-105'
                            : 'bg-slate-800 opacity-40'
                        }`}
                      />
                      <div
                        className={`w-6 h-6 rounded-full transition-all ${
                          currentLight.nsSignal === 'YELLOW'
                            ? 'bg-amber-400 shadow-lg shadow-amber-400/50 scale-105'
                            : 'bg-slate-800 opacity-40'
                        }`}
                      />
                      <div
                        className={`w-6 h-6 rounded-full transition-all ${
                          currentLight.nsSignal === 'GREEN'
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-105'
                            : 'bg-slate-800 opacity-40'
                        }`}
                      />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${
                        currentLight.nsSignal === 'GREEN'
                          ? 'text-emerald-400'
                          : currentLight.nsSignal === 'YELLOW'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {currentLight.nsSignal === 'GREEN'
                          ? '🟢 HIJAU (Lancar Masuk)'
                          : currentLight.nsSignal === 'YELLOW'
                          ? '🟡 KUNING (Peringatan Berhenti)'
                          : '🔴 MERAH (Berhenti di Garis)'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {currentLight.nsSignal === 'GREEN'
                          ? 'Kendaraan dari Utara & Selatan melaju'
                          : isPedCrossing
                          ? 'Berhenti penuh untuk pejalan kaki di Zebra Cross'
                          : 'Menunggu di belakang garis henti RHK'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Finite State Machine Cycle Flow Diagram */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                  Siklus Finite State Machine (FSM Diagram dengan Tahap Penyeberang):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {fsmSteps.map((step, idx) => {
                    const isActive = currentLight.fsmState === step.state;
                    const isStepPed = step.state === 'PEDESTRIAN_CROSSING';
                    return (
                      <div
                        key={step.state}
                        className={`relative p-2.5 rounded-xl border text-center transition-all ${
                          isActive
                            ? isStepPed
                              ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-[1.04]'
                              : 'bg-sky-950/80 border-sky-400 shadow-lg shadow-sky-500/20 scale-[1.03]'
                            : 'bg-slate-900/60 border-slate-800 opacity-70'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          Tahap {idx + 1}
                        </span>
                        <span className={`text-xs font-bold block ${
                          isActive ? (isStepPed ? 'text-emerald-300' : 'text-sky-300') : 'text-slate-200'
                        }`}>
                          {step.label}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                          {step.corridor}
                        </span>
                        {isActive && (
                          <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full animate-ping ${
                            isStepPed ? 'bg-emerald-400' : 'bg-sky-400'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mode Controls & Manual Overrides */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">
                  Override Manual Fase Khusus (Simpang Ini):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTrafficLightFsmMode(currentLight.intersectionId, 'auto')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      currentLight.mode === 'auto'
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    Auto FSM Normal
                  </button>
                  <button
                    onClick={() => requestPedestrianCrossing(currentLight.intersectionId)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-500/40 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                    Picu Penyeberangan (Walk Phase)
                  </button>
                  <button
                    onClick={() => setTrafficLightFsmMode(currentLight.intersectionId, 'manual', 'MANUAL_EW_GREEN')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      currentLight.fsmState === 'MANUAL_EW_GREEN'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    Tahan Hijau EW (Sudirman/Kartini)
                  </button>
                  <button
                    onClick={() => setTrafficLightFsmMode(currentLight.intersectionId, 'manual', 'MANUAL_NS_GREEN')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      currentLight.fsmState === 'MANUAL_NS_GREEN'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    Tahan Hijau NS (Merdeka/Diponegoro)
                  </button>
                  <button
                    onClick={() => setTrafficLightFsmMode(currentLight.intersectionId, 'manual', 'ALL_RED_MANUAL')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      currentLight.fsmState === 'ALL_RED_MANUAL'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    Tahan Semua Merah
                  </button>
                  <button
                    onClick={() => setTrafficLightFsmMode(currentLight.intersectionId, 'flashing')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      currentLight.mode === 'flashing'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    Kuning Flash (Hati-Hati)
                  </button>
                </div>
              </div>

              {/* Timing Sliders Configuration */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  Konfigurasi Durasi Waktu FSM (Detik):
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Pedestrian Crossing Duration */}
                  <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-200 font-semibold flex items-center gap-1">
                        <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                        Durasi Penyeberang (All-Red):
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{currentLight.config.pedestrianCrossingDuration}s</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={25}
                      step={1}
                      value={currentLight.config.pedestrianCrossingDuration}
                      onChange={(e) =>
                        updateTrafficLightFsmConfig(currentLight.intersectionId, {
                          pedestrianCrossingDuration: Number(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Lama waktu lampu merah bagi seluruh kendaraan saat pejalan kaki menyeberang
                    </span>
                  </div>

                  {/* EW Green */}
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Durasi Hijau Timur-Barat (EW):</span>
                      <span className="font-mono font-bold text-sky-400">{currentLight.config.greenDurationEW}s</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={35}
                      step={1}
                      value={currentLight.config.greenDurationEW}
                      onChange={(e) =>
                        updateTrafficLightFsmConfig(currentLight.intersectionId, {
                          greenDurationEW: Number(e.target.value),
                        })
                      }
                      className="w-full accent-sky-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Jl. Sudirman / Jl. Kartini
                    </span>
                  </div>

                  {/* NS Green */}
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Durasi Hijau Utara-Selatan (NS):</span>
                      <span className="font-mono font-bold text-sky-400">{currentLight.config.greenDurationNS}s</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={35}
                      step={1}
                      value={currentLight.config.greenDurationNS}
                      onChange={(e) =>
                        updateTrafficLightFsmConfig(currentLight.intersectionId, {
                          greenDurationNS: Number(e.target.value),
                        })
                      }
                      className="w-full accent-sky-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Jl. Merdeka / Jl. Diponegoro
                    </span>
                  </div>

                  {/* Yellow Clearance */}
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Durasi Kuning (Amber Warning):</span>
                      <span className="font-mono font-bold text-amber-400">{currentLight.config.yellowDurationEW}s</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={6}
                      step={0.5}
                      value={currentLight.config.yellowDurationEW}
                      onChange={(e) =>
                        updateTrafficLightFsmConfig(currentLight.intersectionId, {
                          yellowDurationEW: Number(e.target.value),
                          yellowDurationNS: Number(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Peringatan pengereman sebelum lampu merah
                    </span>
                  </div>

                  {/* All-Red Clearance */}
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Interval All-Red Antar Fase:</span>
                      <span className="font-mono font-bold text-rose-400">{currentLight.config.allRedDurationEW}s</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={0.5}
                      value={currentLight.config.allRedDurationEW}
                      onChange={(e) =>
                        updateTrafficLightFsmConfig(currentLight.intersectionId, {
                          allRedDurationEW: Number(e.target.value),
                          allRedDurationNS: Number(e.target.value),
                        })
                      }
                      className="w-full accent-rose-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Jeda pembersihan kotak simpang antar arah
                    </span>
                  </div>
                </div>
              </div>

              {/* Traffic Engineering Educational Note */}
              <div className="flex items-start gap-3 p-3.5 bg-sky-950/40 rounded-xl border border-sky-800/50 text-xs text-sky-200">
                <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Bagaimana Penyeberangan Pelican & FSM Bekerja Bersama?</strong> Ketika tombol Pelican ditekan (oleh warga yang menunggu di trotoar atau diklik oleh pengguna), sistem FSM tidak langsung mematikan lampu hijau secara mendadak demi keselamatan pengendara. FSM memberikan masa kuning (amber warning) 3,5 detik agar kendaraan melakukan pengereman bertahap di belakang garis henti RHK. Selanjutnya, simpang memasuki tahap <em>PEDESTRIAN_CROSSING</em> di mana seluruh sinyal kendaraan di semua arah berubah menjadi <strong>MERAH</strong>, menghentikan seluruh arus lalu lintas dan memberikan hak jalan penuh bagi pejalan kaki untuk melintasi zebra cross.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <span className="text-xs text-slate-400">
            Sistem APILL Kota Nusantara • Sesuai Standar Pedoman Teknis Perhubungan MKJI & Pelican Crossing
          </span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup Pengatur APILL
          </button>
        </div>

      </div>
    </div>
  );
};
