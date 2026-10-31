import React from 'react';
import { ArrowLeft, Download, CheckCircle2, Printer } from 'lucide-react';
import LotusLogo from './LotusLogo';

export default function SpecialPoojaTicketView({ ticket, onBack, onNavigate }) {
  if (!ticket) {
    return (
      <div className="bogar-ticket-page">
        <div className="bogar-ticket-page__container">
          <div className="bogar-empty-state">
            <p className="bogar-empty-state__title">No bookings found.</p>
            <button
              type="button"
              className="bogar-btn-book bogar-btn-book--hero"
              onClick={() => onNavigate('home')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadReceipt = () => {
    window.print();
  };

  return (
    <div className="bogar-ticket-page">
      <div className="bogar-ticket-page__container">
        <div className="bogar-ticket-page__actions-top">
          <button
            type="button"
            className="bogar-cart-back-btn"
            onClick={onBack || (() => onNavigate('home'))}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        {/* The Exact Special Pooja Ticket Container - STRICTLY NO PRICE */}
        <div className="bogar-ticket-card" id="bogar-printable-ticket">
          {/* Header */}
          <div className="bogar-ticket-card__header">
            <LotusLogo size={38} color="#D4B675" />
            <h1 className="bogar-ticket-card__brand">BOGAR</h1>
            <p className="bogar-ticket-card__title">Special Pooja Ticket</p>
            <div className="bogar-ticket-card__status-badge">
              <CheckCircle2 size={16} />
              <span>{ticket.status || 'Confirmed'}</span>
            </div>
          </div>

          <div className="bogar-ticket-card__divider" />

          {/* Ticket Details Grid - ONLY permitted fields */}
          <div className="bogar-ticket-card__details">
            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Booking / Ticket ID:</span>
              <strong className="bogar-ticket-value bogar-ticket-value--highlight">
                {ticket.ticketId}
              </strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Pooja Name:</span>
              <strong className="bogar-ticket-value">{ticket.poojaName}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Devotee Name:</span>
              <strong className="bogar-ticket-value">{ticket.devoteeName}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Booking Date:</span>
              <strong className="bogar-ticket-value">{ticket.date}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Booked Time Slot:</span>
              <strong className="bogar-ticket-value">{ticket.timeSlot}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Phone Number:</span>
              <strong className="bogar-ticket-value">{ticket.phone}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Email:</span>
              <strong className="bogar-ticket-value">{ticket.email}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Booking Status:</span>
              <strong className="bogar-ticket-value bogar-ticket-value--confirmed">
                {ticket.status}
              </strong>
            </div>
          </div>

          <div className="bogar-ticket-card__divider" />

          {/* Actions: View Receipt / Download Receipt */}
          <div className="bogar-ticket-card__actions">
            <button
              type="button"
              className="bogar-btn-book bogar-btn-book--hero"
              onClick={handleDownloadReceipt}
            >
              <Download size={16} />
              <span>Download Receipt</span>
            </button>

            <button
              type="button"
              className="bogar-btn-secondary"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              <span>View Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
