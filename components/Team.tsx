import React from 'react';

const Team: React.FC = () => {
  return (
    <section className="py-32 bg-[#050505] border-t border-white/5 flex flex-col items-center justify-center text-center">
      <div className="space-y-2 mb-16">
        <h3 className="text-xl md:text-2xl font-display font-bold text-zinc-100 tracking-wide">Melody Liu</h3>
        <h3 className="text-xl md:text-2xl font-display font-bold text-zinc-100 tracking-wide">Loretta Wong</h3>
        <h3 className="text-xl md:text-2xl font-display font-bold text-zinc-100 tracking-wide">Tila Tuzuturk</h3>
      </div>
      
      <p className="text-zinc-600 text-sm md:text-base font-mono tracking-widest uppercase">
        In collaboration with Central Saint Martins
      </p>
    </section>
  );
};

export default Team;