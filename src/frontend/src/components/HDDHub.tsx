import { useMemo } from 'react';
import { categories } from '../data/categories';

interface HDDHubProps {
  hoveredCategoryId: string | null;
  selectedCategoryId: string | null;
}

export default function HDDHub({ hoveredCategoryId, selectedCategoryId }: HDDHubProps) {
  // Determine active category (hover takes precedence over selected)
  const activeCategoryId = hoveredCategoryId || selectedCategoryId;

  // Map category IDs to lane indices (0-12 for 13 categories)
  const categoryToLaneIndex = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach((cat, index) => {
      map.set(cat.id, index);
    });
    return map;
  }, []);

  // Calculate active lane index
  const activeLaneIndex = activeCategoryId ? categoryToLaneIndex.get(activeCategoryId) ?? null : null;

  // Calculate arm rotation based on lane - constrained to 0° to 30° range
  // Distribute all 13 lanes evenly across this reduced range
  const armRotation = activeLaneIndex !== null ? 0 + (activeLaneIndex * 30) / 12 : 0;

  // Disk spin intensity based on hover/selection
  const diskSpinning = !!activeCategoryId;

  // Geometry constants:
  // - Platter is centered at 50% left, 30% top (moved up 20% from center)
  // - Arm pivot is at left 15%, top 70% (50% arm top + 20% arm height)
  const PLATTER_CENTER_LEFT_PERCENT = 50;
  const PLATTER_CENTER_TOP_PERCENT = 30;
  const ARM_PIVOT_LEFT_PERCENT = 15;
  const ARM_PIVOT_TOP_PERCENT = 70;
  const ARM_LENGTH_PERCENT = 40;

  // Calculate glow ring geometry: center on platter, radius to arm tip
  const glowRingGeometry = useMemo(() => {
    if (activeLaneIndex === null) return null;
    
    const angleRad = (armRotation * Math.PI) / 180;
    
    // Arm tip position in container coordinates
    const armTipX = ARM_PIVOT_LEFT_PERCENT + ARM_LENGTH_PERCENT * Math.cos(angleRad);
    const armTipY = ARM_PIVOT_TOP_PERCENT - ARM_LENGTH_PERCENT * Math.sin(angleRad);
    
    // Calculate distance from platter center to arm tip
    const dx = armTipX - PLATTER_CENTER_LEFT_PERCENT;
    const dy = armTipY - PLATTER_CENTER_TOP_PERCENT;
    const radiusPercent = Math.sqrt(dx * dx + dy * dy);
    
    // Clamp radius to stay within platter bounds (max ~35% of container = half of 70% platter)
    const clampedRadiusPercent = Math.min(radiusPercent, 35);
    
    return {
      centerX: PLATTER_CENTER_LEFT_PERCENT,
      centerY: PLATTER_CENTER_TOP_PERCENT,
      radius: clampedRadiusPercent,
    };
  }, [activeLaneIndex, armRotation]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* HDD Hub Container */}
      <div className="relative aspect-square w-full max-w-[500px]">
        {/* Base Layer - HDD Body (stationary) */}
        <img
          src="/bodyhdd.png"
          alt="Hard disk body"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {/* Middle Layer - Disk Platter (spinning) - square 1:1 aspect ratio, centered on itself */}
        <div 
          className="absolute"
          style={{
            left: '15%',
            top: '-5%',
            width: '70%',
            height: '70%',
          }}
        >
          <div
            className={`relative aspect-square w-full transition-transform duration-700 ${
              diskSpinning ? 'animate-disk-spin' : ''
            }`}
            style={{ transformOrigin: 'center center' }}
          >
            <img
              src="/disk.png"
              alt="Hard disk platter"
              className="h-full w-full object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        </div>

        {/* Lane Glow Effect - centered on platter, tangent to arm tip */}
        {glowRingGeometry && (
          <div
            className="pointer-events-none absolute transition-all duration-500 ease-out"
            style={{
              width: `${glowRingGeometry.radius * 2}%`,
              height: `${glowRingGeometry.radius * 2}%`,
              left: `${glowRingGeometry.centerX - glowRingGeometry.radius}%`,
              top: `${glowRingGeometry.centerY - glowRingGeometry.radius}%`,
            }}
          >
            <div
              className="h-full w-full rounded-full border-2 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              style={{
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            />
          </div>
        )}

        {/* Top Layer - Read/Write Arm - rotation constrained to 0°-30° */}
        <div
          className="absolute left-[15%] top-[50%] h-[20%] w-[40%] origin-bottom-left transition-transform duration-500 ease-out"
          style={{
            transform: `rotate(${armRotation}deg)`,
          }}
        >
          <img
            src="/arm.png"
            alt="Hard disk arm"
            className="h-full w-full object-contain object-bottom"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
      </div>
    </div>
  );
}
