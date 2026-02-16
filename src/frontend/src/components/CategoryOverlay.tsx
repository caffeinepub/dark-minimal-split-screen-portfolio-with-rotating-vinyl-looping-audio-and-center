import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { type Category } from '../data/categories';
import { getOverlayContent } from '../data/categoryOverlayContent';

interface CategoryOverlayProps {
  category: Category | null;
  open: boolean;
  onClose: () => void;
}

export default function CategoryOverlay({ category, open, onClose }: CategoryOverlayProps) {
  // Handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!category || !open) return null;

  const overlayData = getOverlayContent(category.id);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Overlay Panel - Constrained to left side on desktop, avoiding VinylPlayer and HDDHub */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 lg:left-0 lg:right-auto lg:w-[55vw] lg:max-w-4xl lg:p-8 ${
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="glass-overlay-panel relative flex h-full max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl lg:max-h-[90vh]">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 border-b border-white/10 px-6 py-6 lg:px-8 lg:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <h2 className="text-3xl font-light tracking-tight text-white lg:text-4xl">
                  {category.name}
                </h2>
                <p className="text-base leading-relaxed text-white/70 lg:text-lg">
                  {category.description}
                </p>
              </div>
              <Button
                onClick={onClose}
                size="icon"
                variant="ghost"
                className="flex-shrink-0 rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0"
                aria-label="Close overlay"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <ScrollArea className="flex-1">
            <div className="space-y-8 px-6 py-6 lg:space-y-12 lg:px-8 lg:py-8">
              {overlayData?.sections.map((section, index) => (
                <div key={index}>
                  {section.type === 'photos' && section.photos && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                      {section.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
                          style={{ aspectRatio: photo.aspectRatio }}
                        >
                          {/* Placeholder content */}
                          <div className="flex h-full w-full items-center justify-center p-6">
                            <span className="text-center text-sm font-light text-white/40 transition-colors group-hover:text-white/60">
                              {photo.placeholder}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'text' && section.content && (
                    <div className="rounded-lg bg-white/5 p-6 backdrop-blur-sm lg:p-8">
                      <p className="text-base leading-relaxed text-white/80 lg:text-lg">
                        {section.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
