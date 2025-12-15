
import React, { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';

const Gallery: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  // Updated Video ID
  const videoId = "BYVIAtQubJw";

  return (
    <section className="w-full bg-[#050505] relative flex flex-col items-center justify-center min-h-screen py-24 md:py-32">
      
      {/* Immersive Video Container */}
      <div className="w-full px-4 md:px-8 max-w-[95%] flex flex-col items-center">
        
        {/* 
            Using 'aspect-video' ensures the container is always 16:9 
        */}
        <div className="relative w-full aspect-video bg-zinc-900 border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden group">
             
             {/* Futuristic Frame Accents */}
             <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/20 z-20 pointer-events-none opacity-50"></div>
             <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/20 z-20 pointer-events-none opacity-50"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/20 z-20 pointer-events-none opacity-50"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/20 z-20 pointer-events-none opacity-50"></div>

             {!isPlaying ? (
               /* THUMBNAIL STATE (Bypasses Load Errors) */
               <button 
                 onClick={() => setIsPlaying(true)}
                 className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer z-30"
                 aria-label="Play Video"
               >
                 {/* High Res Thumbnail with Fallback */}
                 <img 
                   src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                   alt="Installation Thumbnail"
                   className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                   onError={(e) => {
                     // Fallback to HQ default if Max Res doesn't exist
                     const target = e.target as HTMLImageElement;
                     target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                   }}
                 />
                 
                 {/* Play Button Overlay */}
                 <div className="relative z-10 w-24 h-24 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                    <Play className="w-8 h-8 text-white fill-white opacity-80" />
                 </div>
                 
                 {/* Glow Effect */}
                 <div className="absolute z-0 w-32 h-32 bg-indigo-500/30 blur-[60px] rounded-full group-hover:bg-indigo-400/50 transition-all duration-700"></div>
               </button>
             ) : (
               /* PLAYER STATE */
               <iframe 
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`} 
                title="Chorus of Mood Installation"
                className="absolute inset-0 w-full h-full z-40"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
             )}
        </div>

        {/* Minimal Fallback Link */}
        <a 
          href={`https://youtu.be/${videoId}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-12 flex items-center gap-2 text-zinc-700 hover:text-zinc-400 transition-colors text-[10px] uppercase tracking-[0.3em]"
        >
          <span>Watch on YouTube</span>
          <ExternalLink size={10} />
        </a>
      </div>

    </section>
  );
};

export default Gallery;
