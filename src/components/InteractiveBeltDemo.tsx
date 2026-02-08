import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const InteractiveBeltDemo = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(true);
  const [showBeltSaver, setShowBeltSaver] = useState(false);
  const [beltOffset, setBeltOffset] = useState(0);
  const [wanderOffset, setWanderOffset] = useState(0);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Observe visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Belt animation loop
  useEffect(() => {
    if (!isRunning || !isVisible) return;

    const animate = () => {
      timeRef.current += 0.02;
      setBeltOffset((prev) => (prev + 1.5) % 40);

      // Without BeltSaver: erratic wander
      if (!showBeltSaver) {
        setWanderOffset(Math.sin(timeRef.current * 1.5) * 18 + Math.sin(timeRef.current * 3.7) * 6);
      } else {
        // With BeltSaver: smooth, near-zero tracking
        setWanderOffset((prev) => prev * 0.92);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, showBeltSaver, isVisible]);

  const damageLevel = showBeltSaver ? 0 : Math.min(100, Math.abs(wanderOffset) * 4);

  return (
    <section ref={containerRef} className="animate-slide-up">
      <div className="text-center mb-6">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
          Interactive Demo
        </span>
        <h2 className="text-2xl md:text-3xl industrial-title">
          See the <span className="text-primary">Difference</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Watch how belt tracking behaves with and without BeltSaver® technology — in real time.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Conveyor Visualization */}
        <div className="relative h-56 sm:h-64 bg-gradient-to-b from-secondary/50 to-background overflow-hidden">
          {/* Rollers */}
          <div className="absolute bottom-8 left-8 w-10 h-10 rounded-full border-2 border-muted-foreground/30 bg-secondary flex items-center justify-center">
            <div
              className="w-4 h-4 rounded-full border border-muted-foreground/20"
              style={{ transform: `rotate(${beltOffset * 9}deg)` }}
            >
              <div className="w-0.5 h-full bg-muted-foreground/20 mx-auto" />
            </div>
          </div>
          <div className="absolute bottom-8 right-8 w-14 h-14 rounded-full border-2 border-primary/40 bg-secondary flex items-center justify-center">
            {showBeltSaver && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">
                BeltSaver®
              </div>
            )}
            <div
              className={`w-6 h-6 rounded-full border ${showBeltSaver ? 'border-primary/50' : 'border-muted-foreground/20'}`}
              style={{ transform: `rotate(${beltOffset * 9}deg)` }}
            >
              <div className={`w-0.5 h-full mx-auto ${showBeltSaver ? 'bg-primary/40' : 'bg-muted-foreground/20'}`} />
            </div>
          </div>

          {/* Belt Path */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
            {/* Belt shadow / damage zone */}
            {!showBeltSaver && Math.abs(wanderOffset) > 8 && (
              <path
                d={`M 55 ${177 + wanderOffset * 0.6} Q 200 ${140 + wanderOffset} 345 ${177 + wanderOffset * 0.3}`}
                fill="none"
                stroke="hsl(0 84% 60% / 0.3)"
                strokeWidth="28"
                strokeLinecap="round"
              />
            )}
            {/* Main belt */}
            <path
              d={`M 55 ${177 + (showBeltSaver ? 0 : wanderOffset * 0.6)} Q 200 ${140 + (showBeltSaver ? 0 : wanderOffset)} 345 ${177 + (showBeltSaver ? 0 : wanderOffset * 0.3)}`}
              fill="none"
              stroke="hsl(var(--muted-foreground) / 0.6)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* Belt texture lines */}
            {Array.from({ length: 12 }).map((_, i) => {
              const t = ((i * 40 + beltOffset * 2) % 400) / 400;
              const x = 55 + t * 290;
              const baseY = 177;
              const controlY = 140;
              const yWander = showBeltSaver ? 0 : wanderOffset;
              const y = (1 - t) * (1 - t) * (baseY + yWander * 0.6) + 2 * (1 - t) * t * (controlY + yWander) + t * t * (baseY + yWander * 0.3);
              return (
                <line
                  key={i}
                  x1={x}
                  y1={y - 7}
                  x2={x}
                  y2={y + 7}
                  stroke="hsl(var(--muted-foreground) / 0.2)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>

          {/* Material flowing on belt */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all duration-500 ${
              showBeltSaver
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}>
              {showBeltSaver ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  Tracking Stable
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  Belt Wandering — Edge Damage Risk
                </span>
              )}
            </div>
          </div>

          {/* Damage Meter */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-wider mb-1">
              <span className="text-muted-foreground">Edge Damage Risk</span>
              <span className={damageLevel > 50 ? 'text-destructive font-bold' : 'text-primary font-bold'}>
                {Math.round(damageLevel)}%
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  damageLevel > 50 ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{ width: `${damageLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 border-t border-border space-y-4">
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${!showBeltSaver ? 'text-destructive' : 'text-muted-foreground/40'}`}>
              Without
            </span>
            <button
              onClick={() => setShowBeltSaver(!showBeltSaver)}
              className={`relative w-16 h-8 rounded-full transition-all duration-500 ${
                showBeltSaver ? 'bg-primary' : 'bg-destructive/60'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-foreground transition-all duration-300 ${
                showBeltSaver ? 'left-9' : 'left-1'
              }`} />
            </button>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${showBeltSaver ? 'text-primary' : 'text-muted-foreground/40'}`}>
              BeltSaver®
            </span>
          </div>

          {/* Play/Pause */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
              {isRunning ? 'Pause' : 'Play'} Simulation
            </button>
          </div>

          {/* Comparison Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className={`text-lg font-black ${showBeltSaver ? 'text-primary' : 'text-destructive'}`}>
                {showBeltSaver ? '0°' : `${Math.abs(wanderOffset).toFixed(0)}°`}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Tracking Drift</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className={`text-lg font-black ${showBeltSaver ? 'text-primary' : 'text-destructive'}`}>
                {showBeltSaver ? '$0' : `$${(damageLevel * 120).toFixed(0)}`}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Damage Cost/Mo</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className={`text-lg font-black ${showBeltSaver ? 'text-primary' : 'text-destructive'}`}>
                {showBeltSaver ? '100%' : `${Math.max(0, 100 - Math.round(damageLevel * 0.8))}%`}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Belt Life</div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center pt-2">
            <Button
              onClick={() => navigate('/beltsaver')}
              className="text-[10px] font-black uppercase tracking-widest rounded-xl gap-2"
            >
              Learn More About BeltSaver®
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveBeltDemo;
