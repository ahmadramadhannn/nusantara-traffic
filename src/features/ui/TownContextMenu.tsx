import React, { useEffect, useRef } from 'react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { MapPin, Navigation, ArrowRightLeft, Car, Info, X } from 'lucide-react';

export const TownContextMenu: React.FC = () => {
  const contextMenu = useTrafficStore((s) => s.contextMenu);
  const closeContextMenu = useTrafficStore((s) => s.closeContextMenu);
  const setTripStartPoint = useTrafficStore((s) => s.setTripStartPoint);
  const setTripEndPoint = useTrafficStore((s) => s.setTripEndPoint);
  const swapTripPoints = useTrafficStore((s) => s.swapTripPoints);
  const startPoint = useTrafficStore((s) => s.startPoint);
  const endPoint = useTrafficStore((s) => s.endPoint);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen || !contextMenu.point) return null;

  const { point, screenX, screenY } = contextMenu;

  // Prevent menu from overflowing offscreen
  const posX = Math.min(window.innerWidth - 260, Math.max(16, screenX));
  const posY = Math.min(window.innerHeight - 240, Math.max(16, screenY));

  const isCurrentStart = startPoint.id === point.id;
  const isCurrentEnd = endPoint.id === point.id;

  return (
    <div
      ref={menuRef}
      style={{ top: `${posY}px`, left: `${posX}px` }}
      className="fixed z-50 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-slate-100 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header with Place Info */}
      <div className="flex items-start justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex-1 pr-2">
          <div className="text-xs font-bold text-white leading-tight font-display">{point.name}</div>
          {point.description && (
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{point.description}</p>
          )}
        </div>
        <button
          onClick={closeContextMenu}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Menu Options */}
      <div className="space-y-1">
        {/* Set as Start */}
        <button
          onClick={() => setTripStartPoint(point)}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
            isCurrentStart
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
              : 'hover:bg-emerald-500/10 hover:text-emerald-300 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Set as Start Point [A]</span>
          </div>
          {isCurrentStart && <span className="text-[10px] font-mono font-bold text-emerald-400">START</span>}
        </button>

        {/* Set as Destination */}
        <button
          onClick={() => setTripEndPoint(point)}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
            isCurrentEnd
              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/80'
              : 'hover:bg-rose-500/10 hover:text-rose-300 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-rose-400" />
            <span>Set as Destination [B]</span>
          </div>
          {isCurrentEnd && <span className="text-[10px] font-mono font-bold text-rose-400">DEST</span>}
        </button>

        {/* Swap */}
        <button
          onClick={() => {
            swapTripPoints();
            closeContextMenu();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
          <span>Swap Origin & Destination</span>
        </button>
      </div>

      {/* Coordinate & Tip */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <span>X: {point.position[0]}m, Z: {point.position[2]}m</span>
        <span className="text-sky-400">Live Traffic Linked</span>
      </div>
    </div>
  );
};
