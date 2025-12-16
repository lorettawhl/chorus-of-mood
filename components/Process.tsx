import React from 'react';

const Process: React.FC = () => {
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
               <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <p className="text-white text-sm font-sans">Caption text here</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
