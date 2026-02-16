import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from './ui/button';

interface VinylPlayerProps {
  compact?: boolean;
}

export default function VinylPlayer({ compact = false }: VinylPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio('/audio.mp3');
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

  const vinylSize = compact ? 'h-24 w-24 lg:h-32 lg:w-32' : 'h-64 w-64 lg:h-96 lg:w-96';
  const buttonSize = compact ? 'h-10 w-10 lg:h-12 lg:w-12' : 'h-16 w-16';
  const iconSize = compact ? 'h-5 w-5 lg:h-6 lg:w-6' : 'h-8 w-8';

  return (
    <div className="relative flex items-center justify-center">
      {/* Vinyl Image */}
      <div className="relative">
        <img
          src="/vinyl.png"
          alt="Vinyl record"
          className={`${vinylSize} transition-transform duration-1000 ease-linear ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}
          style={{
            animationDuration: isPlaying ? '3s' : '0s',
            animationIterationCount: 'infinite',
            imageRendering: 'crisp-edges',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== '/assets/generated/vinyl.dim_1200x1200.png') {
              target.src = '/assets/generated/vinyl.dim_1200x1200.png';
            }
          }}
        />

        {/* Play/Pause Button - Centered on Vinyl */}
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
