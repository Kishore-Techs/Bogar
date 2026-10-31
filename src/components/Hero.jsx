import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  // 3 Automatic Hero Slides (Slide 1: Existing, Slide 2: Temple Sanctum Aarti, Slide 3: Rudraksha Mala & Ornaments)
  const slides = [
    {
      image: '/assets/images/hero-bogar.jpg',
      alt: 'Sage Bogar and Ancient South Indian Temple at Sunrise',
    },
    {
      image: '/assets/images/hero-slide-2.jpg',
      alt: 'Ancient Tamil Temple Inner Sanctum with Sacred Flame Aarti',
    },
    {
      image: '/assets/images/hero-slide-3.jpg',
      alt: 'Traditional Tamil Sacred Rudraksha Mala and Temple Ornaments',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollToCollections = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('collections');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="bogar-hero" aria-label="Hero">
      {/* Background Slides Container: Separate individual slides */}
      <div className="bogar-hero__bg">
        {slides.map((slide, idx) => (
          <div
            key={slide.image}
            className={`bogar-hero__slide ${idx === currentSlide ? 'bogar-hero__slide--active' : ''}`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="bogar-hero__image"
              fetchPriority={idx === 0 ? 'high' : 'low'}
            />
          </div>
        ))}
        {/* Cinematic gradient overlays */}
        <div className="bogar-hero__overlay bogar-hero__overlay--top" />
        <div className="bogar-hero__overlay bogar-hero__overlay--vignette" />
      </div>

      {/* Hero Content aligned center-right */}
      <div className="bogar-hero__container">
        <div className="bogar-hero__content">
          <p className="bogar-hero__eyebrow">A TIMELESS TRADITION</p>
          <h1 className="bogar-hero__title">BOGAR</h1>
          <p className="bogar-hero__subtitle">Tradition • Heritage • Wisdom</p>
          <p className="bogar-hero__description">
            Explore the sacred world of Bogar through poojas, Buddha-inspired traditional food and tea, Buddhist thuni and timeless traditional chains.
          </p>

          <div className="bogar-hero__cta-wrapper">
            <button
              type="button"
              className="bogar-hero__btn-explore"
              onClick={scrollToCollections}
            >
              <span>Explore Our Collections</span>
              <ArrowRight size={18} className="bogar-hero__btn-arrow" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="bogar-hero__slide-dots" aria-hidden="true">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`bogar-hero__dot ${idx === currentSlide ? 'bogar-hero__dot--active' : ''}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Subtle Scroll Down Indicator on the bottom right */}
      <div className="bogar-hero__scroll-indicator" onClick={scrollToCollections} role="button" tabIndex={0}>
        <div className="bogar-hero__mouse">
          <div className="bogar-hero__wheel" />
        </div>
        <span className="bogar-hero__scroll-text">Scroll Down</span>
      </div>
    </section>
  );
}
