import { useEffect, useState, useRef } from 'react';

interface ElectronHoverLinkProps {
  originElement: HTMLElement | null;
  targetElement: HTMLElement | null;
}

interface Particle {
  id: number;
  progress: number;
  intensity: number;
  intensityDirection: number;
}

export function ElectronHoverLink({ originElement, targetElement }: ElectronHoverLinkProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particleIdRef = useRef(0);

  // Initialize particles
  useEffect(() => {
    if (!originElement || !targetElement) {
      setParticles([]);
      return;
    }

    // Create 12 particles with staggered starting positions for more visible movement
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        progress: i * 0.083, // Stagger particles along the line
        intensity: Math.random() * 0.4 + 0.6, // Higher starting intensity
        intensityDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }
    setParticles(newParticles);
  }, [originElement, targetElement]);

  // Animation loop
  useEffect(() => {
    if (!originElement || !targetElement || particles.length === 0) {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Update canvas size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get positions
      const originRect = originElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      const startX = originRect.left + originRect.width * 0.2;
      const startY = originRect.bottom - originRect.height * 0.2;
      const endX = targetRect.left + targetRect.width / 2;
      const endY = targetRect.top + targetRect.height / 2;

      // Draw line with increased glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw second glow pass for enhanced brightness
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Reset shadow for particles
      ctx.shadowBlur = 0;

      // Update and draw particles
      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          // Update progress with faster speed for more visible movement
          let newProgress = particle.progress + 0.012;
          if (newProgress > 1) {
            newProgress = 0;
          }

          // Update intensity with smooth oscillation
          let newIntensity = particle.intensity + particle.intensityDirection * 0.02;
          let newDirection = particle.intensityDirection;

          if (newIntensity > 1) {
            newIntensity = 1;
            newDirection = -1;
          } else if (newIntensity < 0.5) {
            newIntensity = 0.5;
            newDirection = 1;
          }

          // Calculate position along line
          const x = startX + (endX - startX) * newProgress;
          const y = startY + (endY - startY) * newProgress;

          // Draw particle with enhanced glow
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${newIntensity})`);
          gradient.addColorStop(0.4, `rgba(255, 255, 255, ${newIntensity * 0.7})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();

          // Add bright core
          ctx.fillStyle = `rgba(255, 255, 255, ${newIntensity * 0.9})`;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();

          return {
            ...particle,
            progress: newProgress,
            intensity: newIntensity,
            intensityDirection: newDirection,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [originElement, targetElement, particles.length]);

  if (!originElement || !targetElement) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
