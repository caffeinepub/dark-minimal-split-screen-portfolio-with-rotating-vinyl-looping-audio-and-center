import { type ReactNode, useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, X, Upload, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { type Category } from '../data/categories';
import { categories } from '../data/categories';
import { getOverlayContent } from '../data/categoryOverlayContent';
import { useListImages, useUploadImage, useIsAdmin } from '../hooks/usePhotoGallery';
import {
  ASSET_PATHS,
  backgroundFallbacks,
  vinylFallbacks,
  hddBodyFallbacks,
  hddDiskFallbacks,
  hddArmFallbacks,
} from '../lib/assets';

// ============================================================================
// PortfolioShell Component
// ============================================================================

interface PortfolioShellProps {
  children: ReactNode;
}

export function PortfolioShell({ children }: PortfolioShellProps) {
  const [backgroundUrl, setBackgroundUrl] = useState(backgroundFallbacks[0]);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundFallbacks[fallbackIndex];
    
    img.onload = () => {
      setBackgroundUrl(backgroundFallbacks[fallbackIndex]);
    };
    
    img.onerror = () => {
      if (fallbackIndex < backgroundFallbacks.length - 1) {
        setFallbackIndex(prev => prev + 1);
      }
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [fallbackIndex]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          filter: 'brightness(0.4)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================================================
// VinylPlayer Component
// ============================================================================

interface VinylPlayerProps {
  compact?: boolean;
}

export function VinylPlayer({ compact = false }: VinylPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [vinylSrc, setVinylSrc] = useState(vinylFallbacks[0]);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(ASSET_PATHS.audio);
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Audio playback failed:', error);
      });
      setIsPlaying(true);
    }
  };

  const handleImageError = () => {
    if (fallbackIndex < vinylFallbacks.length - 1) {
      setFallbackIndex(prev => prev + 1);
      setVinylSrc(vinylFallbacks[fallbackIndex + 1]);
    }
  };

  // Inline placement: slightly larger vinyl, smaller button with reduced opacity
  const vinylSize = compact ? 'h-24 w-24 lg:h-32 lg:w-32' : 'h-48 w-48 lg:h-56 lg:w-56';
  const buttonSize = compact ? 'h-10 w-10 lg:h-12 lg:w-12' : 'h-12 w-12';
  const iconSize = compact ? 'h-5 w-5 lg:h-6 lg:w-6' : 'h-6 w-6';

  return (
    <div className="relative flex items-center justify-center">
      <div className="relative">
        <img
          src={vinylSrc}
          alt="Vinyl record"
          className={`${vinylSize} transition-transform duration-1000 ease-linear ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}
          style={{
            animationDuration: isPlaying ? '3s' : '0s',
            animationIterationCount: 'infinite',
            imageRendering: 'crisp-edges',
          }}
          onError={handleImageError}
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Button
            onClick={togglePlayPause}
            size="icon"
            className={`${buttonSize} rounded-full bg-white/60 text-black shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent`}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? (
              <Pause className={iconSize} fill="currentColor" />
            ) : (
              <Play className={iconSize} fill="currentColor" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HDDHub Component
// ============================================================================

interface HDDHubProps {
  hoveredCategoryId: string | null;
  selectedCategoryId: string | null;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
}

export function HDDHub({ hoveredCategoryId, selectedCategoryId, anchorRef }: HDDHubProps) {
  const [bodyFallbackIndex, setBodyFallbackIndex] = useState(0);
  const [diskFallbackIndex, setDiskFallbackIndex] = useState(0);
  const [armFallbackIndex, setArmFallbackIndex] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const diskRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const targetSpeedRef = useRef<number>(0);
  const currentSpeedRef = useRef<number>(0);

  const activeCategoryId = hoveredCategoryId || selectedCategoryId;

  const categoryToLaneIndex = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach((cat, index) => {
      map.set(cat.id, index);
    });
    return map;
  }, []);

  const activeLaneIndex = activeCategoryId ? categoryToLaneIndex.get(activeCategoryId) ?? null : null;

  // ARM_BASELINE_DEG: Visual correction so that 0° in the math corresponds to a horizontally placed arm in the UI.
  // Mirrored: Apply scaleX(-1) to flip the arm horizontally
  const ARM_BASELINE_DEG = -90;
  
  // Category angle mapping: 25° for first category (index 0) to achieve -65° final rotation, 20° for 13th category (index 12)
  // Special case: Photography category gets extra upward rotation (30° instead of mapped value)
  const FIRST_CATEGORY_ANGLE = 25;
  const LAST_CATEGORY_ANGLE = 20;
  const PHOTOGRAPHY_ANGLE = 30; // Extra upward rotation for photography
  const DEFAULT_ANGLE = 22.5; // Midpoint when no category is active

  const armRotation = useMemo(() => {
    let mappedAngleDeg: number;
    
    if (activeLaneIndex === null) {
      mappedAngleDeg = DEFAULT_ANGLE;
    } else {
      // Check if the active category is photography (only when hovering)
      const isPhotographyHovered = hoveredCategoryId === 'photography';
      
      if (isPhotographyHovered) {
        // Apply extra upward rotation for photography
        mappedAngleDeg = PHOTOGRAPHY_ANGLE;
      } else {
        const totalLanes = categories.length;
        // Linear mapping: index 0 → 25°, index 12 → 20°
        const rotation = FIRST_CATEGORY_ANGLE + (activeLaneIndex * (LAST_CATEGORY_ANGLE - FIRST_CATEGORY_ANGLE)) / (totalLanes - 1);
        // Clamp to ensure we stay within [20, 25]
        mappedAngleDeg = Math.max(LAST_CATEGORY_ANGLE, Math.min(FIRST_CATEGORY_ANGLE, rotation));
      }
    }
    
    // Apply baseline correction: finalRotationDeg = ARM_BASELINE_DEG + mappedAngleDeg
    const finalRotationDeg = ARM_BASELINE_DEG + mappedAngleDeg;
    return finalRotationDeg;
  }, [activeLaneIndex, hoveredCategoryId]);

  const diskActive = !!activeCategoryId;

  // Smooth disk rotation: static when inactive, accelerate from 0 to 3x on hover
  useEffect(() => {
    // Set target speed: 0 when inactive, 3 RPS when active
    targetSpeedRef.current = diskActive ? 3 : 0;

    // Only run animation if we need to change speed or if we're currently spinning
    if (currentSpeedRef.current === 0 && targetSpeedRef.current === 0) {
      // Fully stopped, no need to animate
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      lastTimeRef.current = 0;
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = timestamp;

      // Smoothly interpolate current speed towards target speed with faster acceleration
      const speedDiff = targetSpeedRef.current - currentSpeedRef.current;
      const acceleration = 12; // Faster acceleration (was 8)
      const speedChange = Math.sign(speedDiff) * Math.min(Math.abs(speedDiff), acceleration * deltaTime);
      currentSpeedRef.current += speedChange;

      // Clamp to prevent overshoot
      if (Math.abs(speedDiff) < 0.01) {
        currentSpeedRef.current = targetSpeedRef.current;
      }

      // Update rotation based on current speed (degrees per second)
      const degreesPerSecond = currentSpeedRef.current * 360;
      setCurrentRotation((prev) => (prev + degreesPerSecond * deltaTime) % 360);

      // Stop animation if we've reached 0 speed
      if (currentSpeedRef.current === 0 && targetSpeedRef.current === 0) {
        if (animationFrameRef.current !== undefined) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        lastTimeRef.current = 0;
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Reset timing when starting animation to prevent delta spikes
    lastTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [diskActive]);

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
      {/* Wrapper with reduced size (60% scale instead of 75%) */}
      <div 
        className="relative w-full max-w-[500px]" 
        style={{ 
          aspectRatio: '3 / 4',
          opacity: 0.75,
          transform: 'scale(0.6)',
        }}
      >
        {/* Body layer */}
        <img
          src={hddBodyFallbacks[bodyFallbackIndex]}
          alt="Hard disk body"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ imageRendering: 'crisp-edges' }}
          onError={handleBodyError}
        />

        {/* Platter layer with reduced brightness and 2% size reduction */}
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
            ref={diskRef}
            className="relative h-full w-full"
            style={{ 
              transformOrigin: 'center center',
              transform: `rotate(${currentRotation}deg)`,
            }}
          >
            {/* Inner wrapper for 2% size reduction */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: 'scale(0.98)' }}
            >
              <img
                src={hddDiskFallbacks[diskFallbackIndex]}
                alt="Hard disk platter"
                className="h-full w-full object-contain"
                style={{ 
                  imageRendering: 'crisp-edges',
                  filter: 'brightness(0.7)',
                }}
                onError={handleDiskError}
              />
            </div>
          </div>
        </div>

        {/* Arm shadow layer - mirrored with scaleX(-1) and reduced opacity */}
        <div
          className="absolute transition-transform duration-500 ease-out pointer-events-none hdd-arm-shadow"
          style={{
            left: '15%',
            top: '38%',
            width: '24%',
            aspectRatio: '1.6 / 4',
            transform: `scaleX(-1) rotate(${armRotation}deg)`,
            transformOrigin: 'center 90%',
            opacity: 0.5,
          }}
        />

        {/* Arm layer - mirrored with scaleX(-1) and reduced opacity */}
        <div
          className="absolute transition-transform duration-500 ease-out"
          style={{
            left: '15%',
            top: '38%',
            width: '24%',
            aspectRatio: '1.6 / 4',
            transform: `scaleX(-1) rotate(${armRotation}deg)`,
            transformOrigin: 'center 90%',
            opacity: 0.5,
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

        {/* Anchor point for electron effect (bottom-left of HDD) */}
        {anchorRef && (
          <div
            ref={anchorRef}
            className="absolute pointer-events-none"
            style={{
              left: '10%',
              bottom: '15%',
              width: '1px',
              height: '1px',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PhotoGalleryOverlayPanel Component
// ============================================================================

export function PhotoGalleryOverlayPanel() {
  const { data: images = [], isLoading, error } = useListImages();
  const { data: isAdmin = false } = useIsAdmin();
  const uploadMutation = useUploadImage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        title: title.trim(),
        description: description.trim(),
        onProgress: setUploadProgress,
      });

      // Reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load gallery images. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {isAdmin ? (
        <div className="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-medium text-white">Upload New Image</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file" className="text-white/80">
                Image File
              </Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 border-white/20 bg-white/5 text-white"
              />
            </div>

            <div>
              <Label htmlFor="title" className="text-white/80">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
                className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white/80">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
                className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-white/60 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-white/60">Uploading: {uploadProgress}%</p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !title.trim() || uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>
            This gallery is read-only. Only administrators can upload images.
          </AlertDescription>
        </Alert>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map(([id, metadata]) => (
            <div
              key={id.toString()}
              className="group relative overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm transition-all hover:border-white/40"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={metadata.blob.getDirectURL()}
                  alt={metadata.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h4 className="text-lg font-medium text-white">{metadata.title}</h4>
                {metadata.description && (
                  <p className="mt-1 text-sm text-white/80">{metadata.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="mb-4 h-12 w-12 text-white/40" />
          <p className="text-white/60">No images in the gallery yet.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CategoryOverlay Component
// ============================================================================

interface CategoryOverlayProps {
  category: Category;
  onClose: () => void;
}

export function CategoryOverlay({ category, onClose }: CategoryOverlayProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const overlayContent = getOverlayContent(category.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full max-w-6xl overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/20 p-6">
            <div>
              <h2 className="text-3xl font-light text-white">{category.name}</h2>
              <p className="mt-1 text-white/60">{category.description}</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {category.id === 'photography' ? (
                <PhotoGalleryOverlayPanel />
              ) : overlayContent ? (
                <div className="space-y-8">
                  {overlayContent.sections.map((section, index) => {
                    if (section.type === 'text') {
                      return (
                        <div key={index} className="prose prose-invert max-w-none">
                          <p className="text-white/80">{section.content}</p>
                        </div>
                      );
                    } else if (section.type === 'photos' && section.photos) {
                      return (
                        <div
                          key={index}
                          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        >
                          {section.photos.map((photo, photoIndex) => (
                            <div
                              key={photoIndex}
                              className="overflow-hidden rounded-lg border border-white/20 bg-white/5"
                              style={{ aspectRatio: photo.aspectRatio }}
                            >
                              <div className="flex h-full items-center justify-center text-white/40">
                                <ImageIcon className="h-12 w-12" />
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-white/60">Content coming soon...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
