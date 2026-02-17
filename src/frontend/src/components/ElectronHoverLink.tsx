import { useEffect, useRef } from 'react';

interface ElectronHoverLinkProps {
  originElement: HTMLElement | null;
  targetElement: HTMLElement | null;
}

interface Point {
  x: number;
  y: number;
}

interface BinaryGlyph {
  char: '0' | '1';
  x: number;
  y: number;
  opacity: number;
}

interface LastHoverState {
  path: Point[];
  pathLength: number;
  glyphs: BinaryGlyph[];
  endTime: number;
}

export function ElectronHoverLink({ originElement, targetElement }: ElectronHoverLinkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const binaryGlyphsRef = useRef<BinaryGlyph[]>([]);
  const lastHoverStateRef = useRef<LastHoverState | null>(null);
  const fadeOutDuration = 0.4; // 400ms fade-out

  // Calculate PCB-track path with max 45° bends (true 45° diagonals only)
  const calculatePCBPath = (startX: number, startY: number, endX: number, endY: number): Point[] => {
    const path: Point[] = [];
    
    // Start point
    path.push({ x: startX, y: startY });
    
    const dx = endX - startX;
    const dy = endY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    // Use a more direct routing strategy with only H/V segments and true 45° diagonals
    // True 45° means the diagonal segment has equal horizontal and vertical components
    
    // Determine if we should resolve X or Y first based on which is larger
    if (absDx > absDy) {
      // More horizontal distance - go horizontal first, then diagonal, then horizontal
      const diagonalLength = Math.min(absDy, absDx * 0.3); // Limit diagonal to 30% of horizontal distance
      const signX = dx > 0 ? 1 : -1;
      const signY = dy > 0 ? 1 : -1;
      
      // Horizontal segment to position for diagonal
      const horizontalDist = (absDx - diagonalLength) / 2;
      path.push({ x: startX + signX * horizontalDist, y: startY });
      
      // True 45° diagonal (equal dx and dy)
      path.push({ 
        x: startX + signX * (horizontalDist + diagonalLength), 
        y: startY + signY * diagonalLength 
      });
      
      // Final horizontal segment
      path.push({ x: endX, y: startY + signY * diagonalLength });
      
      // Vertical adjustment if needed
      if (Math.abs(endY - (startY + signY * diagonalLength)) > 1) {
        path.push({ x: endX, y: endY });
      }
    } else {
      // More vertical distance - go horizontal, then diagonal, then vertical
      const diagonalLength = Math.min(absDx, absDy * 0.3); // Limit diagonal to 30% of vertical distance
      const signX = dx > 0 ? 1 : -1;
      const signY = dy > 0 ? 1 : -1;
      
      // Horizontal segment
      const horizontalDist = absDx - diagonalLength;
      if (horizontalDist > 1) {
        path.push({ x: startX + signX * horizontalDist, y: startY });
      }
      
      // True 45° diagonal
      path.push({ 
        x: startX + signX * absDx, 
        y: startY + signY * diagonalLength 
      });
      
      // Final vertical segment
      path.push({ x: endX, y: endY });
    }
    
    return path;
  };

  // Calculate total path length
  const calculatePathLength = (path: Point[]): number => {
    let length = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  };

  // Get point along path at given distance
  const getPointAtDistance = (path: Point[], distance: number): Point => {
    let currentDistance = 0;
    
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      
      if (currentDistance + segmentLength >= distance) {
        const segmentProgress = (distance - currentDistance) / segmentLength;
        return {
          x: path[i - 1].x + dx * segmentProgress,
          y: path[i - 1].y + dy * segmentProgress,
        };
      }
      
      currentDistance += segmentLength;
    }
    
    return path[path.length - 1];
  };

  // Generate stable binary glyphs for the dashed tail
  const generateBinaryGlyphs = (path: Point[], pathLength: number): BinaryGlyph[] => {
    const glyphs: BinaryGlyph[] = [];
    const tailStartDistance = pathLength * 0.75; // Last 25% is the tail
    const glyphCount = 8; // Sparse placement
    
    for (let i = 0; i < glyphCount; i++) {
      const distance = tailStartDistance + (pathLength - tailStartDistance) * (i / glyphCount);
      const point = getPointAtDistance(path, distance);
      
      // Offset slightly from the line
      const offsetY = (Math.random() - 0.5) * 12;
      const offsetX = (Math.random() - 0.5) * 8;
      
      glyphs.push({
        char: Math.random() > 0.5 ? '1' : '0',
        x: point.x + offsetX,
        y: point.y + offsetY,
        opacity: 0.08 + Math.random() * 0.07, // Very low opacity: 0.08 to 0.15
      });
    }
    
    return glyphs;
  };

  // Animation loop
  useEffect(() => {
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

      const now = Date.now();
      let visibilityEnvelope = 0;
      let path: Point[] = [];
      let pathLength = 0;
      let glyphs: BinaryGlyph[] = [];
      let glowProgress = 0;

      // Check if we're actively hovering
      if (originElement && targetElement) {
        // Active hover - ramp in
        if (startTimeRef.current === 0) {
          startTimeRef.current = now;
        }

        const elapsed = (now - startTimeRef.current) / 1000;
        const fadeInDuration = 0.3; // 300ms fade-in
        visibilityEnvelope = Math.min(elapsed / fadeInDuration, 1.0);

        // Get positions
        const originRect = originElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const startX = originRect.left + originRect.width * 0.2;
        const startY = originRect.bottom - originRect.height * 0.2;
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;

        // Calculate PCB-track path with max 45° bends
        path = calculatePCBPath(startX, startY, endX, endY);
        pathLength = calculatePathLength(path);

        // Generate binary glyphs once per hover session
        if (binaryGlyphsRef.current.length === 0) {
          binaryGlyphsRef.current = generateBinaryGlyphs(path, pathLength);
        }
        glyphs = binaryGlyphsRef.current;

        // Calculate slow traveling glow progress (0 to 1 over 2 seconds)
        const travelDuration = 2.0; // 2 seconds for full travel
        glowProgress = Math.min(elapsed / travelDuration, 1.0);

        // Store state for fade-out
        lastHoverStateRef.current = {
          path,
          pathLength,
          glyphs,
          endTime: now,
        };
      } else if (lastHoverStateRef.current) {
        // Fade-out phase
        const fadeElapsed = (now - lastHoverStateRef.current.endTime) / 1000;
        visibilityEnvelope = Math.max(0, 1.0 - (fadeElapsed / fadeOutDuration));

        if (visibilityEnvelope <= 0) {
          // Fade-out complete
          lastHoverStateRef.current = null;
          if (animationFrameRef.current !== undefined) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
          }
          return;
        }

        // Use stored state
        path = lastHoverStateRef.current.path;
        pathLength = lastHoverStateRef.current.pathLength;
        glyphs = lastHoverStateRef.current.glyphs;
        glowProgress = 1.0; // Keep at end during fade-out
      } else {
        // Nothing to render
        if (animationFrameRef.current !== undefined) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        return;
      }

      // Apply visibility envelope to all drawing operations
      if (visibilityEnvelope <= 0 || path.length === 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Determine where the tail (dashed section) starts
      const tailStartDistance = pathLength * 0.75;

      // Draw main solid track (first 75% of path)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * visibilityEnvelope})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let currentDist = 0;
      ctx.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);
        
        if (currentDist + segmentLength <= tailStartDistance) {
          ctx.lineTo(path[i].x, path[i].y);
        } else if (currentDist < tailStartDistance) {
          // Partial segment
          const ratio = (tailStartDistance - currentDist) / segmentLength;
          const splitX = path[i - 1].x + dx * ratio;
          const splitY = path[i - 1].y + dy * ratio;
          ctx.lineTo(splitX, splitY);
          break;
        } else {
          break;
        }
        
        currentDist += segmentLength;
      }
      ctx.stroke();

      // Draw dashed tail (last 25% of path)
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * visibilityEnvelope})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]); // Dashed pattern: 6px dash, 4px gap
      ctx.beginPath();
      
      let tailDrawn = false;
      currentDist = 0;
      
      for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);
        
        if (currentDist + segmentLength > tailStartDistance) {
          if (!tailDrawn) {
            // Start of tail
            const ratio = (tailStartDistance - currentDist) / segmentLength;
            const splitX = path[i - 1].x + dx * ratio;
            const splitY = path[i - 1].y + dy * ratio;
            ctx.moveTo(splitX, splitY);
            tailDrawn = true;
          }
          ctx.lineTo(path[i].x, path[i].y);
        }
        
        currentDist += segmentLength;
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Draw binary glyphs along the dashed tail
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (const glyph of glyphs) {
        ctx.fillStyle = `rgba(255, 255, 255, ${glyph.opacity * visibilityEnvelope})`;
        ctx.fillText(glyph.char, glyph.x, glyph.y);
      }

      // Draw traveling glow segment (reduced intensity)
      if (glowProgress < 1.0) {
        const glowSegmentLength = pathLength * 0.15; // Glow covers 15% of path
        const glowDistance = pathLength * glowProgress;
        const glowStartDist = Math.max(0, glowDistance - glowSegmentLength);
        const glowEndDist = glowDistance;

        // Draw glow with gradient intensity (reduced alpha values)
        for (let dist = glowStartDist; dist <= glowEndDist; dist += 2) {
          const point = getPointAtDistance(path, dist);
          const distFromHead = glowEndDist - dist;
          const intensity = 1 - (distFromHead / glowSegmentLength);
          
          const glowSize = 10 * intensity;
          const glowAlpha = 0.25 * intensity * visibilityEnvelope; // Reduced from 0.4 to 0.25
          
          const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, glowSize);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${glowAlpha})`);
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${glowAlpha * 0.5})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw bright glow head (reduced intensity)
        const headPoint = getPointAtDistance(path, glowDistance);
        const headRadius = 8;
        const headGradient = ctx.createRadialGradient(headPoint.x, headPoint.y, 0, headPoint.x, headPoint.y, headRadius);
        headGradient.addColorStop(0, `rgba(255, 255, 255, ${0.65 * visibilityEnvelope})`); // Reduced from 0.9 to 0.65
        headGradient.addColorStop(0.3, `rgba(255, 255, 255, ${0.4 * visibilityEnvelope})`); // Reduced from 0.6 to 0.4
        headGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(headPoint.x, headPoint.y, headRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [originElement, targetElement]);

  // Reset state when hover starts fresh
  useEffect(() => {
    if (originElement && targetElement) {
      // New hover started
      if (startTimeRef.current === 0) {
        binaryGlyphsRef.current = [];
      }
    } else {
      // Hover ended - keep lastHoverStateRef for fade-out, but reset start time
      startTimeRef.current = 0;
      binaryGlyphsRef.current = [];
    }
  }, [originElement, targetElement]);

  // Always render canvas
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
