import { PRODUCT_BG_MAP } from './productBgMap.js';

/**
 * Gets the precomputed background color for a given image source.
 * Defaults to '#FFFFFF' if the image has a white background or isn't in the map.
 */
function getSingleImageBg(imageSrc) {
  if (!imageSrc) return null;
  
  if (PRODUCT_BG_MAP[imageSrc]) {
    return PRODUCT_BG_MAP[imageSrc];
  }
  
  const normalized = imageSrc.replace(/\\/g, '/');
  if (PRODUCT_BG_MAP[normalized]) {
    return PRODUCT_BG_MAP[normalized];
  }

  const cleanPath = normalized.startsWith('http')
    ? normalized.replace(/^https?:\/\/[^/]+/, '').split('?')[0]
    : normalized.split('?')[0];

  if (PRODUCT_BG_MAP[cleanPath]) {
    return PRODUCT_BG_MAP[cleanPath];
  }

  const filename = cleanPath.split('/').pop();
  if (filename) {
    if (PRODUCT_BG_MAP[filename]) return PRODUCT_BG_MAP[filename];
    try {
      const decoded = decodeURIComponent(filename);
      if (PRODUCT_BG_MAP[decoded]) {
        return PRODUCT_BG_MAP[decoded];
      }
    } catch (e) {
      // Ignore decode error
    }
  }

  return null;
}

/**
 * Gets the precomputed background color for a given image source.
 * Defaults to '#FFFFFF' if the image has a white background or isn't in the map.
 */
export function getInitialImageBg(imageSrc, fallbackSrc) {
  const bg = getSingleImageBg(imageSrc) || getSingleImageBg(fallbackSrc);
  return bg || '#FFFFFF';
}

/**
 * Always returns 'contain' to ensure:
 * - Complete product visible
 * - No crop
 * - No cut-off
 * - No stretching
 * - No distortion
 * - Original aspect ratio preserved
 */
export function getInitialFitMode(_imageSrc) {
  return 'contain';
}

/**
 * Dynamically samples the edge background color of a loaded image element.
 * If the background is transparent or near-white, returns '#FFFFFF'.
 * If the image has any other background, returns the exact rgb color.
 */
export function sampleImageBgColor(imgElement) {
  try {
    if (!imgElement) return null;
    const precomputed = getSingleImageBg(imgElement.src) || getSingleImageBg(imgElement.getAttribute('src'));
    if (precomputed) {
      return precomputed;
    }
    if (!imgElement.naturalWidth || !imgElement.naturalHeight) {
      return null;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // Draw the image onto 4x4 canvas to sample 4 corners
    ctx.drawImage(imgElement, 0, 0, 4, 4);
    const imgData = ctx.getImageData(0, 0, 4, 4).data;
    
    // Sample corner offsets: (0,0), (3,0), (0,3), (3,3)
    const corners = [0, 3 * 4, 12 * 4, 15 * 4];
    let isWhite = true;
    for (const offset of corners) {
      const a = imgData[offset + 3];
      const r = imgData[offset];
      const g = imgData[offset + 1];
      const b = imgData[offset + 2];
      if (a > 0 && (r < 250 || g < 250 || b < 250)) {
        isWhite = false;
        break;
      }
    }
    if (isWhite) {
      return '#FFFFFF';
    }

    // Average corner colors
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    for (const offset of corners) {
      const a = imgData[offset + 3];
      if (a > 0) {
        totalR += imgData[offset];
        totalG += imgData[offset + 1];
        totalB += imgData[offset + 2];
        count++;
      }
    }
    if (count > 0) {
      return `rgb(${Math.round(totalR / count)}, ${Math.round(totalG / count)}, ${Math.round(totalB / count)})`;
    }
    return '#FFFFFF';
  } catch (err) {
    // Canvas tainted by CORS or unsupported -> gracefully keep initial
    return null;
  }
}

/**
 * Returns true if the image is determined to have a white background.
 */
export function isWhiteBackground(imageSrc) {
  return getInitialImageBg(imageSrc) === '#FFFFFF';
}

/**
 * Tests a loaded image element to determine if its background is white.
 */
export function isImageElementWhite(imgElement) {
  const sampled = sampleImageBgColor(imgElement);
  if (sampled === null) return null;
  return sampled === '#FFFFFF';
}


