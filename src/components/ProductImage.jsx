import React, { useRef, useEffect, useState } from 'react';
import { getInitialImageBg } from '../config/imageBgHelper';

/**
 * ProductImage component:
 * - All product containers are strictly EQUAL in size across all product pages (small/medium uniform height).
 * - Full product image displayed cleanly with contain so nothing is cropped.
 * - Neutral beige/cream background behind the product image — matches reference design.
 */
export default function ProductImage({
  src,
  fallbackSrc,
  alt = '',
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync currentSrc if src prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setImgLoaded(false);
    setHasError(false);
  }, [src]);

  const handleImageLoad = () => {
    setImgLoaded(true);
  };

  const handleImageError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bogar-product-image-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#F5F0E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {/* Product Image: contain so full product is visible without cropping */}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className="bogar-product-card__image bogar-product-card__image--contain"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          display: 'block',
          padding: '12px',
          opacity: hasError ? 0 : (imgLoaded ? 1 : 0.8),
          transition: 'opacity 0.2s ease-in-out, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />
    </div>
  );
}
