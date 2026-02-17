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

  // Inline placement: slightly larger vinyl, smaller button
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
            className={`${buttonSize} rounded-full bg-white/90 text-black shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent`}
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

  const activeCategoryId = hoveredCategoryId || selectedCategoryId;

  const categoryToLaneIndex = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach((cat, index) => {
      map.set(cat.id, index);
    });
    return map;
  }, []);

  const activeLaneIndex = activeCategoryId ? categoryToLaneIndex.get(activeCategoryId) ?? null : null;

  // Updated arm rotation: 42° for first category (index 0), 20° for 13th category (index 12)
  const FIRST_CATEGORY_ANGLE = 42;
  const LAST_CATEGORY_ANGLE = 20;
  const DEFAULT_ANGLE = 31; // Midpoint when no category is active

  const armRotation = useMemo(() => {
    if (activeLaneIndex === null) return DEFAULT_ANGLE;
    
    const totalLanes = categories.length;
    // Linear mapping: index 0 → 42°, index 12 → 20°
    const rotation = FIRST_CATEGORY_ANGLE + (activeLaneIndex * (LAST_CATEGORY_ANGLE - FIRST_CATEGORY_ANGLE)) / (totalLanes - 1);
    // Clamp to ensure we stay within [20, 42]
    return Math.max(LAST_CATEGORY_ANGLE, Math.min(FIRST_CATEGORY_ANGLE, rotation));
  }, [activeLaneIndex]);

  const diskSpinning = !!activeCategoryId;

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
      {/* Wrapper for 75% opacity and 25% scale reduction */}
      <div 
        className="relative w-full max-w-[500px]" 
        style={{ 
          aspectRatio: '3 / 4',
          opacity: 0.75,
          transform: 'scale(0.75)',
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
            className={`relative h-full w-full transition-transform duration-700 ${
              diskSpinning ? 'animate-disk-spin' : ''
            }`}
            style={{ transformOrigin: 'center center' }}
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

        {/* Arm shadow layer */}
        <div
          className="absolute transition-transform duration-500 ease-out pointer-events-none hdd-arm-shadow"
          style={{
            left: '15%',
            top: '38%',
            width: '24%',
            aspectRatio: '1.6 / 4',
            transform: `rotate(${armRotation}deg)`,
            transformOrigin: 'center 90%',
          }}
        />

        {/* Arm layer */}
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
  const { data: images, isLoading: imagesLoading, error: imagesError } = useListImages();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const uploadMutation = useUploadImage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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

      setSelectedFile(null);
      setPreviewUrl(null);
      setTitle('');
      setDescription('');
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (adminLoading || imagesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (imagesError) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load images. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {isAdmin ? (
        <div className="rounded-lg bg-white/5 p-6 backdrop-blur-sm lg:p-8">
          <h3 className="mb-6 text-xl font-light text-white">Upload New Image</h3>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="image-file" className="text-white/80">
                Image File
              </Label>
              <Input
                ref={fileInputRef}
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploadMutation.isPending}
                className="mt-2 bg-white/5 text-white border-white/20 file:text-white/80"
              />
            </div>

            {previewUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-white/5">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            <div>
              <Label htmlFor="image-title" className="text-white/80">
                Title
              </Label>
              <Input
                id="image-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploadMutation.isPending}
                className="mt-2 bg-white/5 text-white border-white/20"
                placeholder="Enter image title"
              />
            </div>

            <div>
              <Label htmlFor="image-description" className="text-white/80">
                Description
              </Label>
              <Textarea
                id="image-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploadMutation.isPending}
                className="mt-2 bg-white/5 text-white border-white/20"
                placeholder="Enter image description (optional)"
                rows={3}
              />
            </div>

            {uploadMutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-white/60 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || uploadMutation.isPending}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white"
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
              {selectedFile && (
                <Button
                  onClick={handleCancelUpload}
                  disabled={uploadMutation.isPending}
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 text-white border-white/20"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Alert className="bg-white/5 border-white/20">
          <ImageIcon className="h-4 w-4 text-white/60" />
          <AlertDescription className="text-white/80">
            This gallery is read-only. Only administrators can upload images.
          </AlertDescription>
        </Alert>
      )}

      {/* Image Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-light text-white">Gallery</h3>
        
        {images && images.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map(([id, metadata]) => (
              <div
                key={id.toString()}
                className="group relative aspect-video overflow-hidden rounded-lg bg-white/5"
              >
                <img
                  src={metadata.blob.getDirectURL()}
                  alt={metadata.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-lg font-medium text-white">{metadata.title}</h4>
                    {metadata.description && (
                      <p className="mt-1 text-sm text-white/80">{metadata.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-12 w-12 text-white/20" />
            <p className="mt-4 text-white/60">No images in the gallery yet.</p>
          </div>
        )}
      </div>
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
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white/10 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm lg:px-8">
          <h2 className="text-2xl font-light text-white lg:text-3xl">{category.name}</h2>
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close overlay"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(90vh-5rem)]">
          <div className="px-6 py-8 lg:px-8 lg:py-10">
            {category.id === 'photogallery' ? (
              <PhotoGalleryOverlayPanel />
            ) : overlayContent ? (
              <div className="space-y-8">
                {overlayContent.sections.map((section, index) => (
                  <div key={index}>
                    {section.type === 'photos' && section.photos ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {section.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="overflow-hidden rounded-lg bg-white/5"
                            style={{ aspectRatio: photo.aspectRatio }}
                          >
                            <div className="flex h-full w-full items-center justify-center text-white/40">
                              {photo.placeholder}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : section.type === 'text' && section.content ? (
                      <p className="text-lg leading-relaxed text-white/80">{section.content}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-white/80">{category.description}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-video overflow-hidden rounded-lg bg-white/5"
                    >
                      <div className="flex h-full w-full items-center justify-center text-white/40">
                        Placeholder {i}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
