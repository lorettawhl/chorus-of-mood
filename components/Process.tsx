import React from 'react';

const Process: React.FC = () => {
  const processCaptions = [
    "Iterative development of the interface spheres. Shown (L-R): Silicone block molds for Jesmonite casting; initial 3D-printed form studies; and cast prototypes undergoing surface finishing and sanding for tactile optimization.",
    "Evolution of the structural form factor. Left: Low-fidelity structural mockup utilizing timber and PLA components. Right: High-fidelity prototype featuring a circular footprint, acrylic interface surface, and metallic finish to test final aesthetic integration.",
    "Detail of the final cast Jesmonite sphere, highlighting the integration of conductive GSR contact points and coiled cabling for robust signal transmission.",
    "Raspberry Pi terminal monitoring real-time serial communication from the Arduino. A custom Python script manages the audio engine, dynamically mixing the 18-track library over a continuous ambient drone based on incoming arousal data."
  ];

  return (
    <section className="w-full bg-[#050505] border-t border-white/5">
       <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {['process-1.jpg', 'process-2.jpg', 'process-3.jpg', 'process-4.jpg'].map((filename, index) => (
            <div key={index} className="relative aspect-video md:aspect-[16/10] overflow-hidden group border-b border-white/5 odd:border-r">
               <img 
                 src={`/images/${filename}`}
                 alt={`Process Detail ${index + 1}`}
                 className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
               />
               <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
               <div className={`absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${index < 2 ? 'bg-black/70 p-2 rounded' : ''}`}>
                 <p className="text-white text-[10px] font-sans leading-relaxed">{processCaptions[index]}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
