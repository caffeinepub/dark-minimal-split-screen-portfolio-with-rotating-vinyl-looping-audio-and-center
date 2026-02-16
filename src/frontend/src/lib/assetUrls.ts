/**
 * Resolves public asset URLs to be base-path safe for deployment to subpaths (e.g., GitHub Pages).
 * Uses Vite's BASE_URL to construct correct paths regardless of deployment location.
 */

const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * Resolves a public asset path to a base-path-safe URL.
 * @param filename - The filename in the public directory (e.g., 'bg.png')
 * @returns A base-path-safe URL
 */
export function resolveAssetUrl(filename: string): string {
  // Remove leading slash if present
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  
  // Combine base URL with filename, ensuring no double slashes
  const baseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  return `${baseUrl}${cleanFilename}`;
}

/**
 * Canonical asset filenames used throughout the application
 */
export const ASSET_PATHS = {
  background: resolveAssetUrl('bg.png'),
  vinyl: resolveAssetUrl('vinyl.png'),
  hddBody: resolveAssetUrl('bodyhdd.png'),
  hddDisk: resolveAssetUrl('disk.png'),
  hddArm: resolveAssetUrl('arm.png'),
  audio: resolveAssetUrl('audio.mp3'),
  // Generated fallback assets
  backgroundFallback: resolveAssetUrl('assets/generated/bg.dim_1920x1080.png'),
  vinylFallback: resolveAssetUrl('assets/generated/vinyl.dim_1200x1200.png'),
} as const;
