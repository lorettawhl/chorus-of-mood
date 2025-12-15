import React from 'react';

const About: React.FC = () => {
  return (
    <section className="py-24 bg-[#080808] text-left relative overflow-hidden">
      
      {/* TOP SECTION: Narrative & Portrait */}
      {/* Added specific padding here since we removed it from the parent section to allow full-width grid */}
      <div className="container mx-auto px-6 md:px-12 max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
        
        {/* Text Content */}
        <div className="space-y-8 z-10 order-2 md:order-1">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight text-center md:text-left">
            From Biological Data <br />
            <span className="text-zinc-600">to Collective Soundscape</span>
          </h2>
          <div className="space-y-6 text-zinc-400 text-lg leading-relaxed font-sans text-center md:text-left">
            <p>
              <strong className="text-white">Chorus of Mood</strong> is an interactive sound installation that turns unseen emotional data into a shared sonic experience.
            </p>
            <p>
              By placing their fingers on illuminated sensor stations, participants contribute unique layers to a constantly evolving composition. We use <span className="text-indigo-400">Galvanic Skin Response (GSR)</span> technology to translate physiological arousal into sound: low arousal creates ambient drones, mid arousal generates rhythmic pulses, and high arousal weaves relaxing textures.
            </p>
            <p>
              Rather than suppressing emotion, the work honors each participant's state, guiding strangers toward a shared sonic equilibrium. It is a celebration of individuality finding harmony.
            </p>
          </div>
        </div>

        {/* Main Image Display */}
        <div className="relative h-[500px] w-full order-1 md:order-2 group perspective-1000">
           
           {/* Ambient Glows behind the image */}
           <div className="absolute w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -top-10 -right-10 animate-pulse-slow z-0"></div>
           <div className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -bottom-10 -left-10 animate-float z-0"></div>
           
           {/* The Image Container */}
           <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl transition-transform duration-700 hover:scale-[1.02]">
             <div className="absolute inset-0 bg-zinc-900 animate-pulse z-0"></div> {/* Loading placeholder color */}
             <img 
              src="/images/soundscape.jpg" 
              alt="Visual representation of the collective soundscape" 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
              onError={(e) => {
                // Fallback if image is missing
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                const msg = document.createElement('div');
                msg.innerHTML = '<div class="text-white/20 font-display text-4xl font-bold p-8 text-center">SOUNDSCAPE<br/>JPG MISSING</div>';
                e.currentTarget.parentElement?.appendChild(msg);
              }}
             />
             
             {/* Overlay Gradient */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
           </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Immersive 2x2 Grid */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {['detail-1.jpg', 'detail-2.jpg', 'detail-3.jpg', 'detail-4.jpg'].map((filename, index) => (
            <div key={index} className="relative aspect-video md:aspect-[16/10] overflow-hidden group border-t border-b border-white/5 odd:border-r">
               {/* Image */}
               <img 
                 src={`/images/${filename}`}
                 alt={`Installation Detail ${index + 1}`}
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
               
               {/* Subtle border highlight on hover */}
               <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default About;