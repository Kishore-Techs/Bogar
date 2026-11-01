import React from 'react';
import { Calendar, Phone, Mail, MapPin, Clock, MessageSquare, ArrowRight, User, ShoppingBag } from 'lucide-react';
import LotusLogo from './LotusLogo';
import { BOGAR_CONFIG } from '../config/bogarConfig';
import { useBogar } from '../context/BogarContext';

export default function Footer({ onNavigate, onBookPooja, onKnowMore, isAuthPage }) {
  const { currentUser, logout, cart, bookings, orders } = useBogar();

  const totalRecords = (bookings?.length || 0) + (orders?.length || 0);

  return (
    <footer className={`bogar-footer ${isAuthPage ? 'bogar-footer--auth' : ''}`} aria-label="Footer">
      {!isAuthPage && (
        <div className="bogar-footer__top-ornament">
          <div className="bogar-footer__line" />
          <LotusLogo size={24} color="#D4B675" />
          <div className="bogar-footer__line" />
        </div>
      )}

      <div className="bogar-footer__container">
        {/* Column 1: Brand & About */}
        <div className="bogar-footer__col bogar-footer__col--brand">
          <div className="bogar-footer__brand">
            <img
              src="/assets/images/bogar-brand-logo.png"
              alt="BOGAR - Tradition • Heritage • Wisdom"
              className="bogar-footer__brand-logo"
            />
          </div>
          <p className="bogar-footer__tagline">{BOGAR_CONFIG.tagline}</p>
          <p className="bogar-footer__about-text">
            Revering the profound spiritual heritage of Bogar through sacred temple poojas, Buddha-inspired meditative herbal teas and traditional Tea Powder, pure monastic thuni, and consecrated traditional chains.
          </p>
          <button
            type="button"
            className="bogar-footer__link-btn"
            onClick={onKnowMore}
          >
            <span>Read About Bogar Legacy</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Column 2: Sacred Collections */}
        <div className="bogar-footer__col">
          <h3 className="bogar-footer__heading">Sacred Collections</h3>
          <ul className="bogar-footer__links">
            <li>
              <button type="button" onClick={() => onNavigate('poojas')}>
                Sacred Poojas & Rituals
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('tea-food')}>
                Herbal Beverages & Teas
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('thuni')}>
                Buddhist Thuni & Robes
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('chains')}>
                Traditional & Buddha Chains
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Temple Info */}
        <div className="bogar-footer__col">
          <h3 className="bogar-footer__heading">Contact & Temple Info</h3>
          <ul className="bogar-footer__contact-list">
            <li className="bogar-footer__contact-item">
              <Phone size={16} color="#D4B675" />
              <a href={`tel:${BOGAR_CONFIG.contact.phone.replace(/\s+/g, '')}`}>
                {BOGAR_CONFIG.contact.phoneDisplay}
              </a>
            </li>
            <li className="bogar-footer__contact-item">
              <MessageSquare size={16} color="#D4B675" />
              <a
                href={`https://wa.me/${BOGAR_CONFIG.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Temple Desk
              </a>
            </li>
            <li className="bogar-footer__contact-item">
              <Mail size={16} color="#D4B675" />
              <a href={`mailto:${BOGAR_CONFIG.contact.email}`}>
                {BOGAR_CONFIG.contact.email}
              </a>
            </li>
            <li className="bogar-footer__contact-item">
              <Clock size={16} color="#D4B675" />
              <span>{BOGAR_CONFIG.contact.timings}</span>
            </li>
            <li className="bogar-footer__contact-item">
              <MapPin size={16} color="#D4B675" />
              <span>{BOGAR_CONFIG.contact.location}</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Account & Sacred Orders / Bookings */}
        <div className="bogar-footer__col bogar-footer__col--action">
          <h3 className="bogar-footer__heading">Devotee Access</h3>
          <ul className="bogar-footer__links">
            <li>
              <button type="button" onClick={() => onNavigate('cart')}>
                <ShoppingBag size={14} style={{ display: 'inline', marginRight: '6px' }} />
                <span>Sacred Cart ({cart.length})</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('my-records')}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                <span>My Bookings / Orders {totalRecords > 0 ? `(${totalRecords})` : ''}</span>
              </button>
            </li>
            {currentUser ? (
              <li>
                <div className="bogar-footer__user-badge">
                  <span>Logged in as <strong>{currentUser.fullName || currentUser.name}</strong></span>
                  <button type="button" onClick={logout} className="bogar-footer__logout-btn">
                    Logout
                  </button>
                </div>
              </li>
            ) : (
              <li>
                <button type="button" onClick={() => onNavigate('login')}>
                  <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  <span>Devotee Login / Sign Up</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {!isAuthPage && (
        <div className="bogar-footer__bottom">
          <div className="bogar-footer__bottom-container">
            <p className="bogar-footer__copyright">
              © {new Date().getFullYear()} BOGAR. All rights reserved. A Timeless Tradition.
            </p>
            <p className="bogar-footer__subtext">
              Peace • Devotion • Traditional Craftsmanship
            </p>
          </div>
        </div>
      )}
    </footer>
  );
}
