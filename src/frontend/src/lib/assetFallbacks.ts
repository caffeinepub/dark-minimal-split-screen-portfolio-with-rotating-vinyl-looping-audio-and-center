/**
 * Provides fallback strategies for images that fail to load.
 * Implements a cascade: canonical asset → generated fallback → inline SVG placeholder.
 */

import { ASSET_PATHS } from './assetUrls';

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
 * Fallback chain for background image
 */
export const backgroundFallbacks = [
  ASSET_PATHS.background,
  ASSET_PATHS.backgroundFallback,
  generatePlaceholderSvg(1920, 1080, 'Background'),
];

/**
 * Fallback chain for vinyl image
 */
export const vinylFallbacks = [
  ASSET_PATHS.vinyl,
  ASSET_PATHS.vinylFallback,
  generatePlaceholderSvg(1200, 1200, 'Vinyl'),
];

/**
 * Fallback chain for HDD body image
 */
export const hddBodyFallbacks = [
  ASSET_PATHS.hddBody,
  generatePlaceholderSvg(600, 800, 'HDD Body'),
];

/**
 * Fallback chain for HDD disk image
 */
export const hddDiskFallbacks = [
  ASSET_PATHS.hddDisk,
  generatePlaceholderSvg(800, 800, 'HDD Disk'),
];

/**
 * Fallback chain for HDD arm image
 */
export const hddArmFallbacks = [
  ASSET_PATHS.hddArm,
  generatePlaceholderSvg(320, 800, 'HDD Arm'),
];
