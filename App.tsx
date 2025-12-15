import React from 'react';
import Simulation from './components/Simulation';
import About from './components/About';
import Gallery from './components/Gallery';
import Team from './components/Team';
import HeroParticles from './components/HeroParticles';
import Process from './components/Process';

const App: React.FC = () => {

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Navigation / Header - Fixed Overlay */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference pointer-events-none">
        <h1 className="text-xl font-display font-bold tracking-tight pointer-events-auto">CHORUS OF MOOD</h1>
      </nav>

      {/* Hero Section with Scroll Interaction */}
      <HeroParticles />

      {/* Main Content */}
      <main id="content-start" className="relative z-10 bg-[#050505]">
        <Gallery />
        <About />
        <Simulation />
        <Process />
        <Team />
      </main>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-white/5 text-center text-zinc-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Chorus of Mood.</p>
      </footer>
    </div>
  );
};

export default App;