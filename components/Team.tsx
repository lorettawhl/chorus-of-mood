import React from 'react';

const Team: React.FC = () => {
  const team = [
    { name: 'Melody Liu' },
    { name: 'Loretta Wong' },
    { name: 'Tila Uzunturk' },
  ];

  return (
    <footer className="py-16 bg-[#050505] border-t border-white/5">
      <div className="container mx-auto px-6 text-center">
        <p className="text-zinc-500 text-sm mb-4">Produced by</p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {team.map((member) => (
            <span key={member.name} className="text-zinc-400 text-sm font-sans">
              {member.name}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Team;
