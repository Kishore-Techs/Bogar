import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { BOGAR_CONFIG } from '../config/bogarConfig';
import { useBogar } from '../context/BogarContext';
import LotusLogo from './LotusLogo';

export default function PoojaBookingModal({
  isOpen,
  onClose,
  initialPoojaName = 'Special Bogar Pooja',
  onNavigate,
  onBookingSuccess,
}) {
  const { currentUser, setPendingAction, isSlotAvailable, createBooking } = useBogar();

  const [poojaName, setPoojaName] = useState(initialPoojaName);
  const [devoteeName, setDevoteeName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(BOGAR_CONFIG.availableTimeSlots[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSlotChecking, setIsSlotChecking] = useState(false);

  if (!isOpen) return null;

  const poojaOptions = [
    'Special Bogar Pooja',
    'Daily Temple Pooja',
    'Festival Sacred Pooja',
    'Navapashana Divine Abhishekam',
    'Palani Sanctum Lamp Prayer',
  ];

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!poojaName || !devoteeName.trim() || !phone.trim() || !email.trim() || !date || !timeSlot) {
      setErrorMessage('Please complete all booking fields.');
      return;
    }

    const bookingPayload = {
      poojaName,
      devoteeName: devoteeName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      date,
      timeSlot,
    };

    // STEP 1: Check whether user is logged in
    if (!currentUser) {
      setPendingAction({
        type: 'confirm_pooja',
        payload: bookingPayload,
      });
      onClose();
      onNavigate('login');
      return;
    }

    // STEP 2: Check Slot Availability
    setIsSlotChecking(true);
    const available = isSlotAvailable(date, timeSlot);
    setIsSlotChecking(false);

    if (!available) {
      setErrorMessage(
        `The slot "${timeSlot}" on ${date} is currently unavailable. Please select another slot.`
      );
      return;
    }

    // STEP 3: Create Booking
    const result = createBooking(bookingPayload);
    if (result.success) {
      onClose();
      if (onBookingSuccess) {
        onBookingSuccess(result.booking);
      } else {
        onNavigate('pooja-ticket');
      }
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="bogar-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="bogar-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bogar-modal-card__header">
          <div className="bogar-modal-card__brand">
            <LotusLogo size={28} color="#D4B675" />
            <div>
              <h2 className="bogar-modal-card__title">Special Pooja Booking</h2>
              <p className="bogar-modal-card__tagline">Bogar Tradition • Palani Heritage</p>
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

        {/* Modal Body */}
        <div className="bogar-modal-card__body">
          {errorMessage && (
            <div className="bogar-booking-alert bogar-booking-alert--error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleConfirmBooking} className="bogar-booking-form">
            {/* 1. Pooja Name */}
            <div className="bogar-form-group">
              <label htmlFor="modal-pooja-select">Pooja Name</label>
              <select
                id="modal-pooja-select"
                value={poojaName}
                onChange={(e) => setPoojaName(e.target.value)}
                className="bogar-form-input"
              >
                {poojaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Devotee Name (Person for whom Pooja is being booked) */}
            <div className="bogar-form-group">
              <label htmlFor="modal-devotee-name">
                Devotee Name <span className="bogar-form-sublabel">(Person for whom the Pooja is being booked)</span>
              </label>
              <input
                id="modal-devotee-name"
                type="text"
                required
                placeholder="Enter devotee name"
                value={devoteeName}
                onChange={(e) => setDevoteeName(e.target.value)}
                className="bogar-form-input"
              />
            </div>

            {/* 3. Phone Number & 4. Email */}
            <div className="bogar-form-row">
              <div className="bogar-form-group">
                <label htmlFor="modal-phone">Phone Number</label>
                <input
                  id="modal-phone"
                  type="tel"
                  required
                  placeholder="Enter contact phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bogar-form-input"
                />
              </div>

              <div className="bogar-form-group">
                <label htmlFor="modal-email">Email Address</label>
                <input
                  id="modal-email"
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bogar-form-input"
                />
              </div>
            </div>

            {/* 5. Preferred Date & 6. Preferred Time Slot */}
            <div className="bogar-form-row">
              <div className="bogar-form-group">
                <label htmlFor="modal-date">Preferred Date</label>
                <input
                  id="modal-date"
                  type="date"
                  required
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="bogar-form-input"
                />
              </div>

              <div className="bogar-form-group">
                <label htmlFor="modal-slot">Preferred Time Slot</label>
                <select
                  id="modal-slot"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="bogar-form-input"
                >
                  {BOGAR_CONFIG.availableTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSlotChecking}
              className="bogar-btn-book bogar-btn-book--full"
            >
              <Calendar size={18} />
              <span>{isSlotChecking ? 'Checking Availability...' : 'CONFIRM BOOKING'}</span>
            </button>
          </form>

          <div className="bogar-modal-card__footer-note">
            <p>
              Temple Sanctum Phone: <strong>{BOGAR_CONFIG.contact.phoneDisplay}</strong> | Email: <strong>{BOGAR_CONFIG.contact.email}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
