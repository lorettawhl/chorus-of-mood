import React, { useState, useEffect } from 'react';

const Process: React.FC = () => {
  const slides = [
    {
      image: '/images/process-1.jpg',
      caption:
        'Iterative development of the interface spheres. Shown (L-R): Silicone block molds for Jesmonite casting; initial 3D-printed form studies; and cast prototypes undergoing surface finishing and sanding for tactile optimization.',
    },
    {
      image: '/images/process-2.jpg',
      caption:
        'Evolution of the structural form factor. Left: Low-fidelity structural mockup utilizing timber and PLA components. Right: High-fidelity prototype featuring a circular footprint, acrylic interface surface, and metallic finish to test final aesthetic integration.',
    },
    {
      image: '/images/process-3.jpg',
      caption:
        'Detail of the final cast Jesmonite sphere, highlighting the integration of conductive GSR contact points and coiled cabling for robust signal transmission.',
    },
    {
      image: '/images/process-4.jpg',
      caption:
        'Raspberry Pi terminal monitoring real-time serial communication from the Arduino. A custom Python script manages the audio engine, dynamically mixing the 18-track library over a continuous ambient drone based on incoming arousal data.',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 6 seconds; reset whenever activeIndex changes
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeIndex, slides.length, isPaused]);

  return (
    <section className="py-32 bg-[#010101] border-t border-white/5">
      <div className="container mx-auto px-6">
        <p className="text-zinc-500 text-sm md:text-base mb-12">Process:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left: Description */}
          <div key={activeIndex} className="space-y-4 process-fade">
            <p className="text-zinc-500 text-xs font-mono tracking-widest">
              {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </p>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
              {slides[activeIndex].caption}
            </p>
          </div>

          {/* Right: Slideshow */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#050505]">
              {slides.map((slide, i) => (
                <img
                  key={i}
                  src={slide.image}
                  alt={`Process step ${i + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    i === activeIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Show process step ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? 'bg-zinc-100 scale-110'
                      : 'bg-zinc-700 hover:bg-zinc-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes processFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .process-fade {
          animation: processFadeIn 0.6s ease-out;
        }
      `}</style>
    </section>
  );
};

export default Process;
