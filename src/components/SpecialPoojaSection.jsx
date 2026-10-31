import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { RitualIcon, GuidanceIcon, FamilyIcon } from './SacredIcons';

export default function SpecialPoojaSection({ onBookPooja, onViewDetails }) {
  return (
    <section className="bogar-special-pooja-section" aria-label="Special Pooja">
      <div className="bogar-special-pooja-section__container">
        <div className="bogar-special-pooja-card">
          {/* Left Side: Traditional Pooja Image */}
          <div className="bogar-special-pooja-card__media">
            <img
              src="/assets/images/special-pooja.jpg"
              alt="Temple priest performing sacred flower offering to glowing brass deepam lamp"
              className="bogar-special-pooja-card__img"
              loading="lazy"
            />
            <div className="bogar-special-pooja-card__media-glow" />
          </div>

          {/* Right Side: Content & Actions */}
          <div className="bogar-special-pooja-card__content">
            <p className="bogar-special-pooja-card__eyebrow">SPECIAL POOJA</p>
            <h2 className="bogar-special-pooja-card__heading">Book a Special Pooja</h2>
            <p className="bogar-special-pooja-card__desc">
              Experience traditional poojas in the Bogar tradition. Book your special pooja and receive blessings.
            </p>

            {/* Subtle decorative icons matching reference */}
            <div className="bogar-special-pooja-card__badges">
              <div className="bogar-sacred-badge">
                <div className="bogar-sacred-badge__icon">
                  <RitualIcon size={34} color="#D4B675" />
                </div>
                <span className="bogar-sacred-badge__label">Traditional<br />Rituals</span>
              </div>

              <div className="bogar-sacred-badge">
                <div className="bogar-sacred-badge__icon">
                  <GuidanceIcon size={34} color="#D4B675" />
                </div>
                <span className="bogar-sacred-badge__label">Guidance</span>
              </div>

              <div className="bogar-sacred-badge">
                <div className="bogar-sacred-badge__icon">
                  <FamilyIcon size={34} color="#D4B675" />
                </div>
                <span className="bogar-sacred-badge__label">Personal /<br />Family</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bogar-special-pooja-card__actions">
              <button
                type="button"
                className="bogar-btn-book bogar-btn-book--hero"
                onClick={onBookPooja}
              >
                <Calendar size={16} />
                <span>Book Special Pooja</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="bogar-btn-secondary"
                onClick={onViewDetails}
              >
                <span>View Pooja Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
