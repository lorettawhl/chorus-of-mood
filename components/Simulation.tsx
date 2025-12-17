import React, { useState, useEffect, useRef } from 'react';
import { ArousalLevel, SensorState } from '../types';
import SensorNode from './SensorNode';
import { soundEngine } from '../services/soundEngine';
import { Volume2, VolumeX, Play } from 'lucide-react';

const Simulation: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const [sensors, setSensors] = useState<SensorState[]>([
    { id: '1', level: ArousalLevel.LOW, isActive: false, color: 'green', label: 'Low Arousal', soundDescription: 'Natural Soundscape' },
    { id: '2', level: ArousalLevel.MID, isActive: false, color: 'blue', label: 'Mid Arousal', soundDescription: 'Relaxing Tunes' },
    { id: '3', level: ArousalLevel.HIGH, isActive: false, color: 'red', label: 'High Arousal', soundDescription: 'Rhythmic Beats' },
  ]);

  const [muted, setMuted] = useState(false);
  const lastToggleTime = useRef<number>(0);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setShowMobileOverlay(true);
      }
    };
    checkMobile();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    sensors.forEach(s => {
      if (s.isActive) {
        soundEngine.startSound(s.level);
      } else {
        soundEngine.stopSound(s.level);
      }
    });
  }, [sensors, isInitialized]);

  const handleMobileInitialize = () => {
    soundEngine.prepare();
    soundEngine.startAllTracks();
    setIsInitialized(true);
    setShowMobileOverlay(false);
  };

  const handleDesktopInitialize = () => {
    if (!isInitialized) {
      soundEngine.prepare();
      soundEngine.startAllTracks();
      setIsInitialized(true);
    }
  };

  const toggleSensor = (id: string) => {
    if (showMobileOverlay) return;

    const now = Date.now();
    if (now - lastToggleTime.current < 300) return;
    lastToggleTime.current = now;

    handleDesktopInitialize();
    
    setSensors(prev => prev.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const toggleMute = () => {
    handleDesktopInitialize();
    
    const newMuted = !muted;
    setMuted(newMuted);
    soundEngine.setMute(newMuted);
  };

  return (
    <section id="simulation" className="relative w-full min-h-[80vh] flex flex-col items-center justify-center py-20 overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-[#050505] opacity-50 z-0"></div>
      
      <div className="relative z-10 container mx-auto px-4 max-w-4xl flex flex-col items-center">
        
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-zinc-500">
            The Digital Experience
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Simulate the installation below. Activate sensors to layer sounds and merge emotional colors.
          </p>
        </div>

        <div className="relative w-full p-8 md:p-16 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-sm min-h-[400px] flex flex-col items-center justify-center overflow-hidden">
          
          {showMobileOverlay && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <p className="text-zinc-300 font-sans mb-6 max-w-xs">
                    Tap below to initialize the audio engine for this device.
                </p>
                <button 
                    onClick={handleMobileInitialize}
                    className="group relative px-8 py-4 bg-zinc-100 text-black font-bold font-display tracking-widest uppercase rounded-full hover:scale-105 transition-transform"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <Play size={16} className="fill-current" />
                        Enter Experience
                    </span>
                    <div className="absolute inset-0 rounded-full bg-white opacity-50 blur-lg group-hover:opacity-80 transition-opacity"></div>
                </button>
            </div>
          )}

          <div className="absolute top-6 right-6 opacity-100 z-40">
            <button 
              onClick={toggleMute}
              className="p-3 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 transition-colors"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          <div className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center w-full transition-all duration-700 ${showMobileOverlay ? 'opacity-30 blur-sm scale-95' : 'opacity-100 scale-100'}`}>
            {sensors.map(sensor => (
              <SensorNode 
                key={sensor.id} 
                sensor={sensor} 
                onToggle={toggleSensor} 
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default Simulation;
