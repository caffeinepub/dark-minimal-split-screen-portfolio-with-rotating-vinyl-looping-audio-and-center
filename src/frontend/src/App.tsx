import { useState, useRef, useEffect } from 'react';
import { PortfolioShell, VinylPlayer, HDDHub, CategoryOverlay } from './components/StudioComponents';
import { ElectronHoverLink } from './components/ElectronHoverLink';
import { categories, type Category } from './data/categories';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const hddAnchorRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Update hovered element when hoveredCategoryId changes
  useEffect(() => {
    if (hoveredCategoryId) {
      const element = categoryRefs.current.get(hoveredCategoryId);
      setHoveredElement(element || null);
    } else {
      setHoveredElement(null);
    }
  }, [hoveredCategoryId]);

  return (
    <PortfolioShell>
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <div className="flex flex-1 flex-col justify-center px-8 py-16 lg:px-16 lg:py-24">
          {/* Header row with reduced gap and better alignment */}
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="space-y-2">
              <h1 className="text-5xl font-light tracking-tight text-white lg:text-6xl">
                shibhi.studio
              </h1>
              <p className="text-base font-light text-white/40 lg:text-lg">
                Experimental.
              </p>
            </div>

            {/* VinylPlayer closer to wordmark with vertical centering */}
            <div className="flex justify-start lg:ml-4 lg:justify-end lg:flex-shrink-0">
              <VinylPlayer />
            </div>
          </div>

          <div className="max-w-xl space-y-12">
            <p className="font-serif text-xl italic text-white/90 lg:text-2xl">
              Not just for a television, Teleport to where it's written.
            </p>

            <nav className="space-y-4" aria-label="Portfolio categories">
              {categories.map((category) => (
                <button
                  key={category.id}
                  ref={(el) => {
                    if (el) {
                      categoryRefs.current.set(category.id, el);
                    } else {
                      categoryRefs.current.delete(category.id);
                    }
                  }}
                  onClick={() => setSelectedCategory(category)}
                  onMouseEnter={() => setHoveredCategoryId(category.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  className="group block w-full text-left text-2xl font-light text-white transition-all duration-300 hover:translate-x-2 hover:text-white/80 focus:translate-x-2 focus:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent lg:text-3xl"
                >
                  <span className="inline-block transition-transform duration-300 group-hover:scale-105">
                    {category.name}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 py-16 lg:px-16 lg:py-24">
          <HDDHub
            hoveredCategoryId={hoveredCategoryId}
            selectedCategoryId={selectedCategory?.id || null}
            anchorRef={hddAnchorRef}
          />
        </div>
      </div>

      {/* Electron hover effect */}
      <ElectronHoverLink
        originElement={hddAnchorRef.current}
        targetElement={hoveredElement}
      />

      {selectedCategory && (
        <CategoryOverlay
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </PortfolioShell>
  );
}
