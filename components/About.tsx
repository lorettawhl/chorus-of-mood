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
              Rooted in the hidden pressure of our daily lives, <strong className="text-white">Chorus of Mood</strong> rejects the silence we are forced to keep. Instead, it proposes a world where this internal tension is not a symptom to be cured, but a frequency to be heard. It envisions a reality where the invisible architecture of our anxiety becomes the foundation for a new form of connection.
            </p>
            <p>
              At the heart of Chorus of Mood lies an elemental encounter: trembling skin meeting the memory of stone. Three spheres of handcrafted jesmonite wait in the dark, not as passive tools, but as vessels that listen. When touched, this contact translates the body's hidden electricity—the <span className="text-indigo-400">Galvanic Skin Response</span>—into a living soundscape. The installation acts as a bridge between the physical and the immaterial, reading the unspoken rise and fall of our emotions and turning them into a fleeting choreography of light. Here, the machine does not diagnose; it amplifies, turning the solitary act of feeling into a tangible presence in the room.
            </p>
            <p>
              Over the experience, the soundscape evolves and thickens as individual rhythms collide. The rapid pulse of one stranger weaves into the steady hum of another, creating a complex, living harmony that no single person could create alone. It reminds us that our connection lies not in being the same, but in the friction and harmony of our differences.
            </p>
            <p>
              Chorus of Mood amplifies the voices of our silent bodies, inviting us into an empathetic relationship with our own vulnerability. It asks: What if we stopped hiding our shadows? What if the very emotions we suppress are the essential notes required to enrich the world? In this chord of difference, the participant is not a user but a composer; anxiety is not a flaw but a texture; and the installation is a vessel for shared resonance.
            </p>
            <p>
              Chorus of Mood opens a portal into the invisible landscape of feeling, teaching us that to inhabit the abyss together is to find a shared pulse amidst the darkness.
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
                    e.currentTarget.parentElement?.appendChil
