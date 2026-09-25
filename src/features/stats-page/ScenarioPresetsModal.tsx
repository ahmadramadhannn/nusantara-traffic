import React from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { X, Sparkles, AlertTriangle, CloudRain, CheckCircle2, Moon, ArrowRight } from 'lucide-react';

export const ScenarioPresetsModal: React.FC = () => {
  const activeModal = useTrafficStore((s) => s.activeModal);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);
  const applyPreset = useTrafficStore((s) => s.applyPreset);

  if (activeModal !== 'presets') return null;

  const presets = [
    {
      id: 'car_dependent',
      title: '1. Severe Private Vehicle Dependency',
      indonesian: 'Ketergantungan Kendaraan Pribadi Tinggi',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      badge: 'High Congestion',
      badgeColor: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
      description: '90%+ of commuters use private cars & motorcycles. Road network collapses into gridlock. School buses delayed by 25+ minutes.',
      metrics: 'Cars: 46 | Bikes: 48 | Angkot: 2 | Bus: 1 | Congestion: ~85%',
    },
    {
      id: 'monsoon_gridlock',
      title: '2. Tropical Monsoon Rain Rush',
      indonesian: 'Hujan Lebat Jam Pulang Kantor',
      icon: CloudRain,
      iconColor: 'text-sky-400',
      badge: 'Weather Stress',
      badgeColor: 'bg-sky-950/60 text-sky-400 border-sky-800/60',
      description: 'Torrential tropical rain reduces tire friction and driver speeds. Rain combined with heavy private car reliance causes severe queue backlogs.',
      metrics: 'Rain: ON | Wet Roads | Speed: -28% | High Delay',
    },
    {
      id: 'balanced_town',
      title: '3. Balanced Indonesian Small Town',
      indonesian: 'Kota Seimbang & Terintegrasi',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      badge: 'Recommended',
      badgeColor: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
      description: 'Healthy 50% public transit share with 12 active Angkot routes and 5 city/school buses. Intersections clear within 1 green light cycle.',
      metrics: 'Angkot: 12 | Buses: 5 | Cars: 14 | Congestion: ~25%',
    },
    {
      id: 'public_transit_mastery',
      title: '4. Transit-First Smart Corridor',
      indonesian: 'Angkutan Umum Prioritas / Car-Free Day',
      icon: Sparkles,
      iconColor: 'text-amber-400',
      badge: 'Max Efficiency',
      badgeColor: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
      description: 'High-frequency feeder Angkots and dedicated School Buses transport 90% of town travelers. Virtually zero delays and minimal fuel waste.',
      metrics: 'Angkot: 16 | Buses: 8 | Cars: 6 | Congestion: ~10%',
    },
    {
      id: 'night_peace',
      title: '5. Quiet Night & Street Lighting',
      indonesian: 'Suasana Malam Kota Sukamaju',
      icon: Moon,
      iconColor: 'text-indigo-400',
      badge: 'Visual Experience',
      badgeColor: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/60',
      description: 'Observe dynamic vehicle headlights, taillight brake glows, and street lamps (PJU) illuminating the 4 streets at night.',
      metrics: 'Time: Night (21:00 WIB) | Light Traffic | Glowing Headlights',
    },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-white">
              Demonstration Scenarios & Presets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly configure the 3D town to demonstrate key urban transit phenomena.
            </p>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="space-y-3 my-5 max-h-[52vh] overflow-y-auto pr-1">
          {presets.map((p) => {
            const IconComp = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className="w-full text-left p-4 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 group-hover:border-slate-700">
                      <IconComp className={`w-4 h-4 ${p.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">{p.indonesian}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2 pl-11">
                  {p.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pl-11">
                  <span>{p.metrics}</span>
                  <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-sans font-medium">
                    Load Scenario <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveModal(null)}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
