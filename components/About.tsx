import React from 'react';

const About: React.FC = () => {
  return (
    <section className="py-24 bg-[#080808] text-left relative overflow-hidden">
      
      <div className="container mx-auto px-6 md:px-12 max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
        
        <div className="space-y-4 z-10 order-2 md:order-1">
          <div className="space-y-4 text-zinc-400 text-sm leading-relaxed font-sans text-center md:text-left">
            <p>
              Rooted in the hidden pressure of our daily lives, <strong className="text-white">Chorus of Mood</strong> rejects the silence we are forced to keep. Instead, it proposes a world where this internal tension is not a symptom to be cured, but a frequency to be heard. It envisions a reality where the invisible architecture of our anxiety becomes the foundation for a new form of connection.
            </p>
            <p>
              At the heart of Chorus of Mood lies an elemental encounter: trembling skin meeting the memory of stone. Three spheres of handcrafted jesmonite wait in the dark, not as passive tools, but as vessels that listen. When touched, this contact translates the body's hidden electricity—the Galvanic Skin Response—into a living soundscape. The installation acts as a bridge between the physical and the immaterial, reading the unspoken rise and fall of our emotions and turning them into a fleeting choreography of light. Here, the machine does not diagnose; it amplifies, turning the solitary act of feeling into a tangible presence in the room.
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

        <div className="relative h-[900px] w-full order-1 md:order-2">
          <div className="relative z-10 w-full h-full overflow-hidden">
            <img 
              src="/images/soundscape.jpg" 
              alt="Visual representation of the collective soundscape" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {['detail-1.jpg', 'detail-2.jpg', 'detail-3.jpg', 'detail-4.jpg'].map((filename, index) => (
            <div key={index} className="relative aspect-video md:aspect-[16/10] overflow-hidden group border-t border-b border-white/5 odd:border-r">
              <img 
                src={`/images/${filename}`}
                alt={`Installation Detail ${index + 1}`}
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

export default About;
