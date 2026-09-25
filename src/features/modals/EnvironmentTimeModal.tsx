import React, { useState } from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { X, Sun, CloudRain, CloudFog, Sunrise, Sunset, Moon, Calendar, Sparkles } from 'lucide-react';
import { TimeOfDay, WeatherType } from '../../types';

export const EnvironmentTimeModal: React.FC = () => {
  const activeModal = useTrafficStore((s) => s.activeModal);
  const setActiveModal = useTrafficStore((s) => s.setActiveModal);
  const weather = useTrafficStore((s) => s.weather);
  const setWeather = useTrafficStore((s) => s.setWeather);
  const timeOfDay = useTrafficStore((s) => s.timeOfDay);
  const setTimeOfDay = useTrafficStore((s) => s.setTimeOfDay);

  const [activeTab, setActiveTab] = useState<'weather' | 'time'>('weather');

  if (activeModal !== 'environment') return null;

  const weatherOptions: { id: WeatherType; name: string; indonesian: string; icon: any; desc: string }[] = [
    {
      id: 'clear',
      name: 'Clear & Sunny',
      indonesian: 'Cerah Berawan',
      icon: Sun,
      desc: 'Standard road friction, full visibility, and normal driver speeds.',
    },
    {
      id: 'rain',
      name: 'Tropical Monsoon Rain',
      indonesian: 'Hujan Lebat Tropis',
      icon: CloudRain,
      desc: 'Wet asphalt reduces tire friction. Drivers brake earlier and speeds drop by ~28%. Severe gridlock if private cars surge.',
    },
    {
      id: 'fog',
      name: 'Morning Mist / Fog',
      indonesian: 'Kabut Pagi Hari',
      icon: CloudFog,
      desc: 'Reduced atmospheric visibility along outer bypass roads and early commute corridors.',
    },
  ];

  const timeOptions: { id: TimeOfDay; name: string; timeRange: string; icon: any; impact: string }[] = [
    {
      id: 'morning_rush',
      name: 'Morning School & Work Rush',
      timeRange: '06:30 – 08:30 WIB',
      icon: Sunrise,
      impact: 'Peak school bus trips to SD/SMP Negeri and commuter traffic to office & markets.',
    },
    {
      id: 'midday',
      name: 'Midday Normal Flow',
      timeRange: '11:30 – 14:00 WIB',
      icon: Sun,
      impact: 'Standard balanced flow with active market logistics and regular angkot frequency.',
    },
    {
      id: 'evening_rush',
      name: 'Evening Return Rush',
      timeRange: '16:30 – 19:00 WIB',
      icon: Sunset,
      impact: 'High commuter density from commercial districts returning home to Perumahan.',
    },
    {
      id: 'night',
      name: 'Night Time',
      timeRange: '20:30 – 05:00 WIB',
      icon: Moon,
      impact: 'Quiet roads, activated streetlights (PJU) and glowing vehicle headlights.',
    },
    {
      id: 'holiday',
      name: 'Public Holiday / Weekend',
      timeRange: 'Sabtu / Minggu',
      icon: Calendar,
      impact: 'Higher recreational trips towards Alun-Alun and Pasar Kuliner.',
    },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-white">
              Environment & Context Settings
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate how weather conditions and time periods compound traffic congestion.
            </p>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 my-4 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'weather'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            <span>Weather & Rain</span>
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'time'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sunrise className="w-4 h-4" />
            <span>Time of Day & Rush Hour</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {activeTab === 'weather' && (
            <div className="space-y-3">
              {weatherOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = weather === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setWeather(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500/80 shadow-md ring-1 ring-sky-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white">{opt.name}</span>
                          <span className="text-xs text-slate-400 ml-2">({opt.indonesian})</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[11px] font-semibold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 pl-11">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'time' && (
            <div className="space-y-3">
              {timeOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = timeOfDay === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTimeOfDay(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500/80 shadow-md ring-1 ring-sky-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white">{opt.name}</span>
                          <span className="text-xs font-mono text-amber-400 ml-2">{opt.timeRange}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[11px] font-semibold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 pl-11">{opt.impact}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveModal(null)}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
