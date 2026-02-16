import { useMemo, useState } from 'react';
import { categories } from '../data/categories';
import { hddBodyFallbacks, hddDiskFallbacks, hddArmFallbacks } from '../lib/assetFallbacks';

interface HDDHubProps {
  hoveredCategoryId: string | null;
  selectedCategoryId: string | null;
}

export default function HDDHub({ hoveredCategoryId, selectedCategoryId }: HDDHubProps) {
  // Fallback state for each image layer
  const [bodyFallbackIndex, setBodyFallbackIndex] = useState(0);
  const [diskFallbackIndex, setDiskFallbackIndex] = useState(0);
  const [armFallbackIndex, setArmFallbackIndex] = useState(0);

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

  // Absolute rotation configuration: 45° (lane 1) → 35° (lane 13)
  const ANGLE_LANE_1 = 45; // Lane index 0 (1st category)
  const ANGLE_LANE_13 = 35; // Lane index 12 (13th category)
  const DEFAULT_ANGLE = ANGLE_LANE_1; // Rest position when nothing is hovered/selected

  // Calculate arm rotation based on lane - absolute linear mapping
  const armRotation = useMemo(() => {
    if (activeLaneIndex === null) return DEFAULT_ANGLE;
    
    const rotation = ANGLE_LANE_1 + (activeLaneIndex * (ANGLE_LANE_13 - ANGLE_LANE_1)) / 12;
    return Math.max(ANGLE_LANE_13, Math.min(ANGLE_LANE_1, rotation));
  }, [activeLaneIndex]);

  // Disk spin intensity based on hover/selection
  const diskSpinning = !!activeCategoryId;

  // Fallback handlers
  const handleBodyError = () => {
    if (bodyFallbackIndex < hddBodyFallbacks.length - 1) {
      setBodyFallbackIndex(prev => prev + 1);
    }
  };

  const handleDiskError = () => {
    if (diskFallbackIndex < hddDiskFallbacks.length - 1) {
      setDiskFallbackIndex(prev => prev + 1);
    }
  };

  const handleArmError = () => {
    if (armFallbackIndex < hddArmFallbacks.length - 1) {
      setArmFallbackIndex(prev => prev + 1);
    }
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* HDD Hub Container - 3:4 aspect ratio for body */}
      <div className="relative w-full max-w-[500px]" style={{ aspectRatio: '3 / 4' }}>
        {/* Base Layer - HDD Body (stationary) - 3:4 aspect ratio */}
        <img
          src={hddBodyFallbacks[bodyFallbackIndex]}
          alt="Hard disk body"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ imageRendering: 'crisp-edges' }}
          onError={handleBodyError}
        />

        {/* Middle Layer - Disk Platter (spinning) - strict 1:1 aspect ratio, 4% down from top, 35% larger */}
        <div 
          className="absolute"
          style={{
            left: '2.75%',
            top: '4%',
            width: '94.5%',
            aspectRatio: '1 / 1',
          }}
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 ${
              diskSpinning ? 'animate-disk-spin' : ''
            }`}
            style={{ transformOrigin: 'center center' }}
          >
            <img
              src={hddDiskFallbacks[diskFallbackIndex]}
              alt="Hard disk platter"
              className="h-full w-full object-contain"
              style={{ imageRendering: 'crisp-edges' }}
              onError={handleDiskError}
            />
          </div>
        </div>

        {/* Top Layer - Read/Write Arm - 1.6:4 aspect ratio, slightly smaller, absolute rotation 45°→35°, pivot slightly above bottom */}
        <div
          className="absolute transition-transform duration-500 ease-out"
          style={{
            left: '15%',
            top: '38%',
            width: '24%',
            aspectRatio: '1.6 / 4',
            transform: `rotate(${armRotation}deg)`,
            transformOrigin: 'center 90%',
          }}
        >
          <img
            src={hddArmFallbacks[armFallbackIndex]}
            alt="Hard disk arm"
            className="h-full w-full object-contain object-bottom"
            style={{ imageRendering: 'crisp-edges' }}
            onError={handleArmError}
          />
        </div>
      </div>
    </div>
  );
}
