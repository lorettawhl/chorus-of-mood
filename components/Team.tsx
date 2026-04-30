import React from 'react';

const Team: React.FC = () => {
  const team = [
    { name: 'Loretta Wong', handle: 'moodcore.fx', url: 'https://instagram.com/moodcore.fx' },
    { name: 'Melody Liu', handle: 'ml.line.id', url: 'https://instagram.com/ml.line.id' },
    { name: 'Tila Tuzuturk', handle: 'designby.tila', url: 'https://instagram.com/designby.tila' },
  ];

  return (
    <section className="py-32 bg-[#050505] border-t border-white/5 flex flex-col items-center justify-center text-center">
      <p className="text-zinc-500 text-sm mb-10">Contacts & collaboration</p>

      <div className="space-y-6">
        {team.map((member) => (
          <a
            key={member.name}
            href={member.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group transition-opacity hover:opacity-70"
          >
            <h3 className="text-xl md:text-2xl font-display font-bold text-zinc-100 tracking-wide">
              {member.name}
            </h3>
            <div className="flex items-center justify-center gap-2 mt-1 text-zinc-500 text-sm font-mono group-hover:text-zinc-300 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>{member.handle}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Team;
