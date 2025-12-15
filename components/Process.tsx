import React from 'react';

const Process: React.FC = () => {
  return (
    <section className="w-full bg-[#050505] border-t border-white/5">
       <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {['process-1.jpg', 'process-2.jpg', 'process-3.jpg', 'process-4.jpg'].map((filename, index) => (
            <div key={index} className="relative aspect-video md:aspect-[16/10] overflow-hidden group border-b border-white/5 odd:border-r">
               {/* Image */}
               <img 
                 src={`/images/${filename}`}
                 alt={`Process Detail ${index + 1}`}
                 className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                 onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'absolute inset-0 bg-zinc-900 flex items-center justify-center';
                    fallback.innerHTML = `<span class="font-mono text-zinc-700 text-xs tracking-widest uppercase">Add ${filename}</span>`;
                    e.currentTarget.parentElement?.appendChild(fallback);
                 }}
               />
               
               {/* Hover Overlay */}
               <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;