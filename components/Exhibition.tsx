import React from 'react';

const Exhibition: React.FC = () => {
  const exhibitions = [
    {
      year: '2026',
      name: 'BASE Milano · We Will Design 2026',
      url: 'https://base.milano.it/en/loretta-wong-melody-chen-tila-tuzuturk-chorus-of-mood/',
    },
  ];

  // 16 images, duplicated for seamless loop
  const images = Array.from({ length: 16 }, (_, i) => `/images/exhibition-${i + 1}.jpg`);
  const loopedImages = [...images, ...images];

  return (
    <section className="py-32 bg-[#050505] border-t border-white/5">
      <div className="container mx-auto px-6 mb-16">
        <p className="text-zinc-500 text-sm md:text-base mb-4">Exhibitions:</p>

        <div className="space-y-3">
          {exhibitions.map((ex) => (
            <a
              key={ex.year + ex.name}
              href={ex.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-zinc-400 text-sm md:text-base hover:text-zinc-100 transition-colors"
            >
              <span className="font-bold text-zinc-100">{ex.year}</span>
              <span>{ex.name}</span>
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
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      <div className="exhibition-marquee w-full overflow-hidden">
        <div className="exhibition-track flex">
          {loopedImages.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[70vw] md:w-[35vw] lg:w-[25vw] aspect-[3/4] mr-4 overflow-hidden"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .exhibition-track {
          width: max-content;
          animation: exhibition-scroll 90s linear infinite;
        }
        .exhibition-marquee:hover .exhibition-track {
          animation-play-state: paused;
        }
        @keyframes exhibition-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default Exhibition;
