/**
 * Consolidated asset URL resolution and fallback strategies.
 * Provides base-path-safe URLs for all public assets and fallback chains for missing images.
 */

const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * Resolves a public asset path to a base-path-safe URL.
 * @param filename - The filename in the public directory (e.g., 'bg.png')
 * @returns A base-path-safe URL
 */
export function resolveAssetUrl(filename: string): string {
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  const baseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  return `${baseUrl}${cleanFilename}`;
}

/**
 * Canonical asset filenames used throughout the application
 */
export const ASSET_PATHS = {
  background: resolveAssetUrl('assets/bg.png'),
  vinyl: resolveAssetUrl('assets/vinyl.png'),
  hddBody: resolveAssetUrl('assets/bodyhdd.png'),
  hddDisk: resolveAssetUrl('assets/disk.png'),
  hddArm: resolveAssetUrl('assets/arm.png'),
  audio: resolveAssetUrl('assets/audio.mp3'),
  backgroundFallback: resolveAssetUrl('assets/generated/bg.dim_1920x1080.png'),
  vinylFallback: resolveAssetUrl('assets/generated/vinyl.dim_1200x1200.png'),
} as const;

/**
 * Generates a minimal visible SVG placeholder as a data URL.
 * @param width - Width of the placeholder
 * @param height - Height of the placeholder
 * @param label - Text label to display in the placeholder
 * @returns Data URL for an inline SVG
 */
export function generatePlaceholderSvg(width: number, height: number, label: string): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="oklch(0.3 0.05 240)" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
            fill="oklch(0.7 0.05 240)" font-family="system-ui" font-size="16">
        ${label}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Fallback chains for all images
 */
export const backgroundFallbacks = [
  ASSET_PATHS.background,
  ASSET_PATHS.backgroundFallback,
  generatePlaceholderSvg(1920, 1080, 'Background'),
];

export const vinylFallbacks = [
  ASSET_PATHS.vinyl,
  ASSET_PATHS.vinylFallback,
  generatePlaceholderSvg(1200, 1200, 'Vinyl'),
];

export const hddBodyFallbacks = [
  ASSET_PATHS.hddBody,
  generatePlaceholderSvg(600, 800, 'HDD Body'),
];

export const hddDiskFallbacks = [
  ASSET_PATHS.hddDisk,
  generatePlaceholderSvg(800, 800, 'HDD Disk'),
];

export const hddArmFallbacks = [
  ASSET_PATHS.hddArm,
  generatePlaceholderSvg(320, 800, 'HDD Arm'),
];
