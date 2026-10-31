import React from 'react';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  LogOut,
  X,
  Hash,
  BadgeCheck,
} from 'lucide-react';
import LotusLogo from './LotusLogo';
import { useBogar } from '../context/BogarContext';

export default function UserProfileModal({ isOpen, onClose, onNavigate }) {
  const { currentUser, logout, cart, bookings, orders } = useBogar();

  if (!isOpen || !currentUser) return null;

  const totalOrders = orders?.length || 0;
  const totalBookings = bookings?.length || 0;
  const devoteeName = currentUser.fullName || currentUser.name || 'Devotee';
  const devoteePhone = currentUser.phone || currentUser.mobile || 'Not provided';
  const devoteeEmail = currentUser.email || 'Not provided';
  const devoteeId = currentUser.id || currentUser.user_id || 'DEV-BOGAR';
  const devoteeRole = (currentUser.role || 'Customer / Devotee').toUpperCase();

  const handleLogout = () => {
    logout();
    onClose();
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleNavigateRecords = () => {
    onClose();
    if (onNavigate) {
      onNavigate('my-records');
    }
  };

  const handleNavigateCart = () => {
    onClose();
    if (onNavigate) {
      onNavigate('cart');
    }
  };

  const initials = devoteeName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'D';

  return (
    <div
      className="bogar-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bogar-profile-title"
    >
      <div
        className="bogar-modal-card bogar-modal-card--profile"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bogar-modal-card__header">
          <div className="bogar-modal-card__brand">
            <LotusLogo size={28} color="#D4B675" />
            <div>
              <h3 id="bogar-profile-title" className="bogar-modal-card__title">
                Devotee Profile
              </h3>
              <p className="bogar-modal-card__tagline">BOGAR SACRED HERITAGE</p>
            </div>
          </div>
          <button
            type="button"
            className="bogar-modal-card__close"
            onClick={onClose}
            aria-label="Close Profile"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="bogar-profile-modal-body">
          {/* Avatar Banner */}
          <div className="bogar-profile-hero">
            <div className="bogar-profile-avatar">
              <span>{initials}</span>
            </div>
            <div className="bogar-profile-hero__text">
              <h4 className="bogar-profile-name">{devoteeName}</h4>
              <div className="bogar-profile-badge-row">
                <span className="bogar-profile-status-badge">
                  <ShieldCheck size={13} color="#D4B675" />
                  <span>Verified Devotee</span>
                </span>
                <span className="bogar-profile-role-badge">{devoteeRole}</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bogar-profile-details-card">
            <div className="bogar-profile-detail-row">
              <div className="bogar-profile-detail-label">
                <User size={15} color="#D4B675" />
                <span>Full Name</span>
              </div>
              <strong className="bogar-profile-detail-val">{devoteeName}</strong>
            </div>

            <div className="bogar-profile-detail-row">
              <div className="bogar-profile-detail-label">
                <Phone size={15} color="#D4B675" />
                <span>Mobile Number</span>
              </div>
              <strong className="bogar-profile-detail-val">{devoteePhone}</strong>
            </div>

            <div className="bogar-profile-detail-row">
              <div className="bogar-profile-detail-label">
                <Mail size={15} color="#D4B675" />
                <span>Email Address</span>
              </div>
              <strong className="bogar-profile-detail-val">{devoteeEmail}</strong>
            </div>

            <div className="bogar-profile-detail-row">
              <div className="bogar-profile-detail-label">
                <Hash size={15} color="#D4B675" />
                <span>Devotee ID</span>
              </div>
              <strong className="bogar-profile-detail-val bogar-profile-detail-val--gold">
                #{devoteeId}
              </strong>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bogar-profile-stats">
            <button
              type="button"
              className="bogar-profile-stat-box"
              onClick={handleNavigateRecords}
            >
              <Calendar size={18} color="#D4B675" />
              <div className="bogar-profile-stat-info">
                <span className="bogar-profile-stat-count">{totalOrders}</span>
                <span className="bogar-profile-stat-name">Purchased Orders</span>
              </div>
            </button>

            <button
              type="button"
              className="bogar-profile-stat-box"
              onClick={handleNavigateCart}
            >
              <ShoppingBag size={18} color="#D4B675" />
              <div className="bogar-profile-stat-info">
                <span className="bogar-profile-stat-count">{cart?.length || 0}</span>
                <span className="bogar-profile-stat-name">Sacred Cart Items</span>
              </div>
            </button>
          </div>

          {/* Action Buttons: Navigate to records & Logout */}
          <div className="bogar-profile-actions">
            <button
              type="button"
              className="bogar-btn-book bogar-btn-book--hero"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
              onClick={handleNavigateRecords}
            >
              <Calendar size={16} />
              <span>View My Orders & Bookings</span>
            </button>

            <button
              type="button"
              className="bogar-btn-logout-full"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout from Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

