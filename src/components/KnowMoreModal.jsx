import React from 'react';
import { X } from 'lucide-react';
import LotusLogo from './LotusLogo';

export default function KnowMoreModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="bogar-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="bogar-modal-card bogar-modal-card--editorial"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bogar-modal-card__header">
          <div className="bogar-modal-card__brand">
            <LotusLogo size={28} color="#D4B675" />
            <div>
              <h2 className="bogar-modal-card__title">A Legacy of Wisdom</h2>
              <p className="bogar-modal-card__tagline">The Bogar Spiritual Heritage</p>
            </div>
          </div>
          <button
            type="button"
            className="bogar-modal-card__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bogar-modal-card__body bogar-modal-card__body--text">
          <div className="bogar-editorial-article">
            <p className="bogar-editorial-lead">
              Bogar is revered for his profound knowledge in spiritual practices, traditional medicine and a balanced way of living. Our offerings are inspired by his timeless legacy.
            </p>

            <h3>The Tradition of Sanctity & Poojas</h3>
            <p>
              In our sacred tradition, poojas are conducted with deep meditative focus, ancient mantras, and traditional offerings including sacred lamps, fragrant herbs, and pure oils. Each ritual is intended to harmonize the subtle energies of the individual and family.
            </p>

            <h3>Sattvic Botanical Teas & Offerings</h3>
            <p>
              Drawing inspiration from historical Siddha and Buddhist herbal knowledge, our tea and food preparations feature pure natural ingredients—holy tulsi, rare mountain botanicals, and hand-selected spices formulated to calm the senses and support contemplative living.
            </p>

            <h3>Traditional Thuni & Textiles</h3>
            <p>
              Our textiles preserve the meditative simplicity of traditional monk robes and meditation wraps, woven from organic handspun fibers dyed with botanical earthen pigments.
            </p>

            <h3>Chains & Sacred Adornments</h3>
            <p>
              Each chain and medallion brings together the serenity of Buddha-inspired motifs with the master craftsmanship of traditional South Indian temple artisans, serving as sacred reminders of mindfulness and devotion.
            </p>
          </div>

          <div className="bogar-editorial-footer">
            <button
              type="button"
              className="bogar-btn-book bogar-btn-book--hero"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
