import React, { useState, useEffect } from 'react';
import LotusLogo from './LotusLogo';
import { Calendar, Menu, X, ShoppingBag, User, LogOut } from 'lucide-react';
import { useBogar } from '../context/BogarContext';
import UserProfileModal from './UserProfileModal';

export default function Navbar({ activePage, onNavigate, onOpenBooking }) {
  const { currentUser, logout, cart, bookings, orders } = useBogar();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'poojas', label: 'Poojas' },
    { id: 'tea-food', label: 'Beverages' },
    { id: 'thuni', label: 'Clothes' },
    { id: 'chains', label: 'Chains' },
  ];

  const handleLinkClick = (id) => {
    setMobileMenuOpen(false);
    onNavigate(id);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalRecords = (bookings?.length || 0) + (orders?.length || 0);

  const isAuthPage = activePage === 'login' || activePage === 'signup';

  return (
    <>
      <header
        className={`bogar-navbar ${isAuthPage ? 'bogar-navbar--auth' : isScrolled ? 'bogar-navbar--scrolled' : 'bogar-navbar--transparent'}`}
      >
        <div className="bogar-navbar__container">
          {/* Brand Logo & Name */}
          <button
            type="button"
            className="bogar-navbar__brand"
            onClick={() => handleLinkClick('home')}
            aria-label="Bogar Home"
          >
            <LotusLogo size={32} color="#D4B675" className="bogar-navbar__lotus" />
            <span className="bogar-navbar__title">BOGAR</span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="bogar-navbar__nav" aria-label="Main Navigation">
            <ul className="bogar-navbar__links">
              {navLinks.map((link) => {
                const isActive =
                  activePage === link.id ||
                  ((activePage === 'login' || activePage === 'signup') && link.id === 'home');
                return (
                  <li key={link.id} className="bogar-navbar__item">
                    <button
                      type="button"
                      className={`bogar-navbar__link ${isActive ? 'bogar-navbar__link--active' : ''}`}
                      onClick={() => handleLinkClick(link.id)}
                    >
                      {link.label}
                      {isActive && <span className="bogar-navbar__active-indicator" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right Action: VIEW CART next to Login / Sign Up */}
          <div className="bogar-navbar__cta-wrapper">
            <button
              type="button"
              className={`bogar-btn-view-cart ${activePage === 'cart' ? 'bogar-btn-view-cart--active' : ''}`}
              onClick={() => handleLinkClick('cart')}
              aria-label="View Cart"
            >
              <ShoppingBag size={16} className="bogar-btn-view-cart__icon" />
              <span>VIEW CART</span>
              {cart && cart.length > 0 && (
                <span className="bogar-navbar__cart-badge">{cart.length}</span>
              )}
            </button>

            {currentUser ? (
              <button
                type="button"
                className="bogar-btn-book"
                onClick={() => setIsProfileModalOpen(true)}
                aria-label="Devotee Profile"
              >
                <User size={16} className="bogar-btn-book__icon" />
                <span>{(currentUser.fullName || currentUser.name || currentUser.email || 'Devotee').split(' ')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                className="bogar-btn-book"
                onClick={() => handleLinkClick('login')}
              >
                <Calendar size={16} className="bogar-btn-book__icon" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls: Hamburger Toggle */}
          <button
            type="button"
            className="bogar-navbar__toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={26} color="#D4B675" /> : <Menu size={26} color="#D4B675" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="bogar-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`bogar-mobile-menu ${mobileMenuOpen ? 'bogar-mobile-menu--open' : ''}`}>
        <div className="bogar-mobile-menu__header">
          <div className="bogar-navbar__brand">
            <LotusLogo size={28} color="#D4B675" />
            <span className="bogar-navbar__title">BOGAR</span>
          </div>
          <button
            type="button"
            className="bogar-mobile-menu__close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} color="#D4B675" />
          </button>
        </div>

        <nav className="bogar-mobile-menu__nav">
          <ul className="bogar-mobile-menu__links">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={`bogar-mobile-menu__link ${activePage === link.id ? 'bogar-mobile-menu__link--active' : ''}`}
                  onClick={() => handleLinkClick(link.id)}
                >
                  {link.label}
                </button>
              </li>
            ))}

            <li className="bogar-mobile-menu__divider" />

            {/* VIEW CART Link */}
            <li>
              <button
                type="button"
                className={`bogar-mobile-menu__link ${activePage === 'cart' ? 'bogar-mobile-menu__link--active' : ''}`}
                onClick={() => handleLinkClick('cart')}
              >
                <span>VIEW CART</span>
                {cart.length > 0 && <span className="bogar-mobile-menu__badge">{cart.length}</span>}
              </button>
            </li>

            {/* Devotee Account / Records */}
            {currentUser ? (
              <>
                <li>
                  <button
                    type="button"
                    className="bogar-mobile-menu__link"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                  >
                    <User size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    <span>My Profile ({(currentUser.fullName || currentUser.name || 'Devotee').split(' ')[0]})</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`bogar-mobile-menu__link ${activePage === 'my-records' ? 'bogar-mobile-menu__link--active' : ''}`}
                    onClick={() => handleLinkClick('my-records')}
                  >
                    <span>My Bookings & Orders</span>
                    {totalRecords > 0 && <span className="bogar-mobile-menu__badge">{totalRecords}</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="bogar-mobile-menu__link bogar-mobile-menu__link--logout"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      onNavigate('home');
                    }}
                  >
                    <LogOut size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  type="button"
                  className={`bogar-mobile-menu__link ${activePage === 'login' ? 'bogar-mobile-menu__link--active' : ''}`}
                  onClick={() => handleLinkClick('login')}
                >
                  <span>Devotee Login / Sign Up</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        <div className="bogar-mobile-menu__footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            className="bogar-btn-view-cart"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              setMobileMenuOpen(false);
              handleLinkClick('cart');
            }}
          >
            <ShoppingBag size={16} />
            <span>VIEW CART</span>
            {cart && cart.length > 0 && <span className="bogar-navbar__cart-badge">{cart.length}</span>}
          </button>
          <button
            type="button"
            className="bogar-btn-book bogar-btn-book--full"
            onClick={() => {
              setMobileMenuOpen(false);
              if (currentUser) {
                setIsProfileModalOpen(true);
              } else {
                handleLinkClick('login');
              }
            }}
          >
            {currentUser ? <User size={16} /> : <Calendar size={16} />}
            <span>{currentUser ? (currentUser.fullName || currentUser.name || 'Profile').split(' ')[0] : 'Login / Sign Up'}</span>
          </button>
        </div>
      </div>

      {/* Devotee Profile Details & Logout Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
}
