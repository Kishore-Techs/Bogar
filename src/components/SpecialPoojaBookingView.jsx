import React, { useState } from 'react';
import { useBogar } from '../context/BogarContext';
import { BOGAR_CONFIG } from '../config/bogarConfig';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import LotusLogo from './LotusLogo';

export default function SpecialPoojaBookingView({
  initialPoojaName = 'Special Bogar Pooja',
  onNavigate,
  onBookingSuccess,
}) {
  const { currentUser, pendingAction, setPendingAction, isSlotAvailable, createBooking } = useBogar();

  // Restore preserved form info if returning from login
  const savedPoojaData = pendingAction?.type === 'confirm_pooja' ? pendingAction.payload : null;

  const [poojaName, setPoojaName] = useState(savedPoojaData?.poojaName || initialPoojaName);
  const [devoteeName, setDevoteeName] = useState(savedPoojaData?.devoteeName || currentUser?.name || '');
  const [phone, setPhone] = useState(savedPoojaData?.phone || currentUser?.phone || '');
  const [email, setEmail] = useState(savedPoojaData?.email || currentUser?.email || '');
  const [date, setDate] = useState(savedPoojaData?.date || '');
  const [timeSlot, setTimeSlot] = useState(savedPoojaData?.timeSlot || BOGAR_CONFIG.availableTimeSlots[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSlotChecking, setIsSlotChecking] = useState(false);

  // Available pooja options
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

    // Validation
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
      // Preserve entered booking information and navigate to Login
      setPendingAction({
        type: 'confirm_pooja',
        payload: bookingPayload,
      });
      onNavigate('login');
      return;
    }

    // STEP 2: Check Slot Availability
    setIsSlotChecking(true);
    const available = isSlotAvailable(date, timeSlot);
    setIsSlotChecking(false);

    if (!available) {
      setErrorMessage(
        `The slot "${timeSlot}" on ${date} is currently unavailable. Please select another date or time slot.`
      );
      return;
    }

    // STEP 3: Create Booking (after auth & slot availability check)
    const result = createBooking(bookingPayload);
    if (result.success) {
      // Clear pending action
      setPendingAction(null);
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
    <div className="bogar-booking-page">
      <div className="bogar-booking-page__container">
        <button
          type="button"
          className="bogar-cart-back-btn"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="bogar-booking-page__card">
          <div className="bogar-booking-page__header">
            <LotusLogo size={36} color="#D4B675" />
            <h1 className="bogar-booking-page__title">Special Pooja Booking</h1>
            <p className="bogar-booking-page__subtitle">
              Traditional ritual reservation in accordance with Bogar tradition
            </p>
          </div>

          {errorMessage && (
            <div className="bogar-booking-alert bogar-booking-alert--error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleConfirmBooking} className="bogar-booking-form">
            {/* 1. Pooja Name */}
            <div className="bogar-form-group">
              <label htmlFor="pooja-name">Pooja Name</label>
              <select
                id="pooja-name"
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

            {/* 2. Devotee Name (MUST remain: person for whom Pooja is being booked) */}
            <div className="bogar-form-group">
              <label htmlFor="devotee-name">
                Devotee Name <span className="bogar-form-sublabel">(Person for whom the Pooja is being booked)</span>
              </label>
              <input
                id="devotee-name"
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
                <label htmlFor="booking-phone">Phone Number</label>
                <input
                  id="booking-phone"
                  type="tel"
                  required
                  placeholder="Enter contact phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bogar-form-input"
                />
              </div>

              <div className="bogar-form-group">
                <label htmlFor="booking-email">Email Address</label>
                <input
                  id="booking-email"
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
                <label htmlFor="booking-date">Preferred Date</label>
                <input
                  id="booking-date"
                  type="date"
                  required
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="bogar-form-input"
                />
              </div>

              <div className="bogar-form-group">
                <label htmlFor="booking-slot">Preferred Time Slot</label>
                <select
                  id="booking-slot"
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
              <span>{isSlotChecking ? 'Checking Slot Availability...' : 'CONFIRM BOOKING'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
