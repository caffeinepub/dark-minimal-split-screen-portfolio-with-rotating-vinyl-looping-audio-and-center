import { type ReactNode, useState, useEffect } from 'react';
import { backgroundFallbacks } from '../lib/assetFallbacks';

interface PortfolioShellProps {
  children: ReactNode;
}

export default function PortfolioShell({ children }: PortfolioShellProps) {
  const [backgroundUrl, setBackgroundUrl] = useState(backgroundFallbacks[0]);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  useEffect(() => {
    // Preload background image with fallback chain
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
      {/* Background Image Layer with Dimming */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          filter: 'brightness(0.4)',
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
