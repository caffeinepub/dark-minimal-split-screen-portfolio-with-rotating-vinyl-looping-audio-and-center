import { useState } from 'react';
import PortfolioShell from './components/PortfolioShell';
import VinylPlayer from './components/VinylPlayer';
import HDDHub from './components/HDDHub';
import CategoryModal from './components/CategoryModal';
import { categories, type Category } from './data/categories';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  return (
    <PortfolioShell>
      {/* Fixed Top-Right Vinyl Player Overlay */}
      <div className="fixed right-4 top-4 z-50 lg:right-8 lg:top-8">
        <VinylPlayer compact />
      </div>

      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Left Column */}
        <div className="flex flex-1 flex-col justify-center px-8 py-16 lg:px-16 lg:py-24">
          <div className="max-w-xl space-y-12">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-5xl font-light tracking-tight text-white lg:text-6xl">
                shibhi.studio
              </h1>
              <p className="text-base font-light text-white/40 lg:text-lg">
                Experimental.
              </p>
            </div>

            {/* Tagline */}
            <p className="font-serif text-xl italic text-white/90 lg:text-2xl">
              Not just for a television, Teleport to where it's written.
            </p>

            {/* Category List */}
            <nav className="space-y-4" aria-label="Portfolio categories">
              {categories.map((category) => (
                <button
                  key={category.id}
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

        {/* Right Column - HDD Hub */}
        <div className="flex flex-1 items-center justify-center px-8 py-16 lg:px-16 lg:py-24">
          <HDDHub
            hoveredCategoryId={hoveredCategoryId}
            selectedCategoryId={selectedCategory?.id || null}
          />
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        category={selectedCategory}
        open={!!selectedCategory}
        onOpenChange={(open) => {
          if (!open) setSelectedCategory(null);
        }}
      />
    </PortfolioShell>
  );
}
