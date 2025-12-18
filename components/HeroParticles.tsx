
import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  size: number;
  vx: number;
  vy: number;
  baseAlpha: number; // Store original random alpha
}

const HeroParticles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null); 
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const textElement = textRef.current;
    
    if (!canvas || !container || !textElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    
    const particleDensity = window.innerWidth < 768 ? 3 : 4; 
    const ease = 0.08;

    const initParticles = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);

      particles = [];

      // 1. Measure text
      const rect = textElement.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(textElement);
      const fontSize = parseFloat(computedStyle.fontSize);
      const fontFamily = computedStyle.fontFamily;
      const letterSpacing = computedStyle.letterSpacing;
      const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.1;
      
      // 2. Draw to temp canvas
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = width;
      tempCanvas.height = height;

      tempCtx.font = `bold ${fontSize}px ${fontFamily}`;
      tempCtx.fillStyle = 'white';
      tempCtx.textBaseline = 'top'; 
      tempCtx.textAlign = 'center'; 
      
      if ('letterSpacing' in tempCtx) {
        tempCtx.letterSpacing = letterSpacing;
      }

      const textContent = textElement.innerText; 
      const lines = textContent.split('\n');
      
      const startY = rect.top + (rect.height - (lines.length * lineHeight)) / 2;
      const centerX = rect.left + rect.width / 2;

      lines.forEach((line, i) => {
        tempCtx.fillText(line.trim(), centerX, startY + (i * lineHeight));
      });

      // 3. Create Particles
      const imageData = tempCtx.getImageData(0, 0, width, height).data;
      
      for (let y = 0; y < height; y += particleDensity) {
        for (let x = 0; x < width; x += particleDensity) {
          const index = (y * width + x) * 4;
          const alpha = imageData[index + 3];
          
          if (alpha > 128) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              originX: Math.random() * width, 
              originY: Math.random() * height, 
              targetX: x,
              targetY: y,
              size: Math.random() * 1.2 + 0.5,
              vx: (Math.random() - 0.5) * 0.2,
              vy: (Math.random() - 0.5) * 0.2,
              baseAlpha: Math.random() * 0.5 + 0.3 // Random initial opacity
            });
          }
        }
      }
    };

    const timer = setTimeout(initParticles, 100);
    window.addEventListener('resize', initParticles);

    const render = () => {
      if (container) {
        const rect = container.getBoundingClientRect();
        const scrollDist = -rect.top;
        const maxScroll = rect.height - window.innerHeight;
        let p = Math.max(0, Math.min(1, scrollDist / (maxScroll * 0.85))); 
        setScrollProgress(p);

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Determine global Alpha Boost based on progress
        // When p > 0.8, we start boosting alpha to 1.0
        const solidThreshold = 0.8;
        const alphaBoost = p > solidThreshold ? (p - solidThreshold) / (1 - solidThreshold) : 0;

        particles.forEach(pt => {
            // Movement
            pt.originX += pt.vx;
            pt.originY += pt.vy - 0.2; 
            
            if (pt.originY < 0) pt.originY = window.innerHeight;
            if (pt.originX < 0) pt.originX = window.innerWidth;
            if (pt.originX > window.innerWidth) pt.originX = 0;

            let currentTargetX = pt.originX;
            let currentTargetY = pt.originY;

            if (p > 0.05) {
                const attraction = Math.min(1, (p - 0.05) * 1.2); 
                const easeValue = 1 - Math.pow(1 - attraction, 3);
                
                currentTargetX = pt.originX + (pt.targetX - pt.originX) * easeValue;
                currentTargetY = pt.originY + (pt.targetY - pt.originY) * easeValue;
            }

            const dx = currentTargetX - pt.x;
            const dy = currentTargetY - pt.y;
            pt.x += dx * ease;
            pt.y += dy * ease;

            // Dynamic Opacity: Interpolate from random baseAlpha to 1.0
            const currentAlpha = pt.baseAlpha + (1 - pt.baseAlpha) * alphaBoost;

            ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initParticles);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[300vh] bg-[#010101]">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {/* Ignition Backlight */}
        <div 
            className="absolute z-0 pointer-events-none transition-all duration-1000 ease-out"
            style={{ 
                opacity: scrollProgress > 0.9 ? 1 : 0,
                transform: `scale(${scrollProgress > 0.9 ? 1 : 0.8})`
            }}
        >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh] bg-indigo-900/30 blur-[120px] rounded-full"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[20vh] bg-blue-500/10 blur-[80px] rounded-full mix-blend-screen"></div>
        </div>

        {/* Canvas - The only thing rendering text */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

        {/* Ghost Text (Layout only) */}
        <div className="relative z-20 text-center pointer-events-none select-none">
             <h1 
                ref={textRef}
                className="text-5xl md:text-8xl font-display font-bold text-white tracking-tighter mb-6 opacity-0"
                aria-hidden="true" 
             >
               CHORUS<br/>OF MOOD
             </h1>
             
             {/* Subtitle */}
             <div 
                className="transition-all duration-1000 delay-300"
                style={{ 
                    opacity: scrollProgress > 0.95 ? 1 : 0,
                    transform: `translateY(${scrollProgress > 0.95 ? '0' : '20px'})`
                }}
             >
                <div className="w-16 h-[1px] bg-indigo-500 mx-auto mb-6 shadow-[0_0_10px_#6366f1]"></div>
                <p className="text-indigo-300 font-mono text-sm md:text-base tracking-[0.3em] uppercase">
                   What if emotions can sing?
                </p>
             </div>
        </div>

        {/* Scroll Prompt */}
        <div className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${scrollProgress > 0.1 ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-zinc-600 text-[10px] md:text-xs tracking-[0.4em] uppercase animate-pulse">Scroll to Initialize</p>
        </div>

      </div>
    </div>
  );
};

export default HeroParticles;
