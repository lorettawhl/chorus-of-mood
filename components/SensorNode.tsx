import React from 'react';
import { SensorState } from '../types';
import { Fingerprint } from 'lucide-react';

interface SensorNodeProps {
  sensor: SensorState;
  onToggle: (id: string) => void;
}

const SensorNode: React.FC<SensorNodeProps> = ({ sensor, onToggle }) => {
  const getGlowColor = () => {
    switch (sensor.level) {
      case 'LOW': return 'shadow-[0_0_50px_rgba(16,185,129,0.5)] border-emerald-500';
      case 'MID': return 'shadow-[0_0_50px_rgba(59,130,246,0.5)] border-blue-500';
      case 'HIGH': return 'shadow-[0_0_50px_rgba(239,68,68,0.5)] border-red-500';
      default: return 'border-zinc-700';
    }
  };

  const getBgColor = () => {
    if (!sensor.isActive) return 'bg-zinc-900/40 text-zinc-600';
    switch (sensor.level) {
      case 'LOW': return 'bg-emerald-900/30 text-emerald-400';
      case 'MID': return 'bg-blue-900/30 text-blue-400';
      case 'HIGH': return 'bg-red-900/30 text-red-400';
      default: return '';
    }
  };

  // Dual handler: onTouchStart for iOS speed/unlocking, onClick for Desktop
  const handleInteraction = (e: React.SyntheticEvent) => {
    // Prevent double firing if both events happen
    // (e.g. touchstart often fires click later)
    // But we need the handler to fire. 
    // We rely on the parent logic or simple debouncing usually, 
    // but here we just want to ensure onToggle is called.
    // The safest way for audio unlocking is utilizing onTouchStart.
    
    // NOTE: We don't preventDefault() because it blocks scrolling on some devices 
    // if the button is large. However, for a button, we want the click.
    
    onToggle(sensor.id);
  };

  return (
    <div className="flex flex-col items-center gap-4 group">
      <button
        onClick={() => onToggle(sensor.id)}
        // Critical for iOS Audio Unlock:
        onTouchStart={() => onToggle(sensor.id)}
        className={`
          relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 transition-all duration-700 ease-out
          flex items-center justify-center backdrop-blur-md
          ${sensor.isActive ? getGlowColor() : 'border-zinc-800 hover:border-zinc-600'}
          ${getBgColor()}
        `}
        aria-label={`Toggle ${sensor.label}`}
      >
        <Fingerprint 
          className={`w-10 h-10 md:w-12 md:h-12 transition-all duration-500 ${sensor.isActive ? 'opacity-100 scale-110' : 'opacity-50 scale-100 group-hover:opacity-80'}`} 
        />
        
        {sensor.isActive && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current"></div>
        )}
      </button>
      
      <div className={`text-center transition-all duration-500 ${sensor.isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}`}>
        <h3 className="text-sm md:text-base font-display font-bold tracking-widest uppercase">{sensor.label}</h3>
        <p className="text-xs text-zinc-400 mt-1">{sensor.soundDescription}</p>
      </div>
    </div>
  );
};

export default SensorNode;