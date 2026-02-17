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

    // Create 8 particles with staggered starting positions
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        progress: i * 0.125, // Stagger particles along the line
        intensity: Math.random() * 0.5 + 0.5, // Random starting intensity
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

      // Draw line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Update and draw particles
      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          // Update progress
          let newProgress = particle.progress + 0.008;
          if (newProgress > 1) {
            newProgress = 0;
          }

          // Update intensity with smooth oscillation
          let newIntensity = particle.intensity + particle.intensityDirection * 0.015;
          let newDirection = particle.intensityDirection;

          if (newIntensity > 1) {
            newIntensity = 1;
            newDirection = -1;
          } else if (newIntensity < 0.3) {
            newIntensity = 0.3;
            newDirection = 1;
          }

          // Calculate position along line
          const x = startX + (endX - startX) * newProgress;
          const y = startY + (endY - startY) * newProgress;

          // Draw particle
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${newIntensity * 0.9})`);
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${newIntensity * 0.5})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
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
