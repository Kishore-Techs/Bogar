import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function AboutBogarSection({ onKnowMore }) {
  return (
    <section className="bogar-about" aria-label="About Bogar">
      <div className="bogar-about__container">
        {/* Left Column: Editorial Information */}
        <div className="bogar-about__text-col">
          <p className="bogar-about__eyebrow">ABOUT BOGAR</p>
          <h2 className="bogar-about__heading">A Legacy of Wisdom</h2>
          <p className="bogar-about__body">
            Bogar is revered for his profound knowledge in spiritual practices, traditional medicine and a balanced way of living. Our offerings are inspired by his timeless legacy.
          </p>

          <div className="bogar-about__action">
            <button
              type="button"
              className="bogar-about__btn"
              onClick={onKnowMore}
            >
              <span>Know More</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Column: Heritage Image Panorama */}
        <div className="bogar-about__media-col">
          <div className="bogar-about__img-wrapper">
            <img
              src="/assets/images/hero-bogar.jpg"
              alt="Sacred mountain sunrise and ancient stone temples reflecting the Bogar tradition"
              className="bogar-about__img"
              loading="lazy"
            />
            {/* Soft gradient fade seamlessly connecting into cream background */}
            <div className="bogar-about__fade-left" />
            <div className="bogar-about__fade-top" />
            <div className="bogar-about__fade-bottom" />
          </div>
        </div>
      </div>
    </section>
  );
}
