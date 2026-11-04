import React, { useState, useEffect, useRef } from 'react';
import { useBogar } from '../context/BogarContext';
import { authService } from '../services/authService';
import LotusLogo from './LotusLogo';
import { User, Phone, ArrowLeft, RotateCw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LoginView({ onNavigate, onLoginSuccess }) {
  const { loginWithPhone, pendingAction } = useBogar();

  // Step 1: 'details' (Name + Phone) | Step 2: 'otp' (6-digit verification)
  const [step, setStep] = useState('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [serverOtp, setServerOtp] = useState('');
  const [userId, setUserId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for Resend OTP (30 seconds)
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef([]);

  // Timer countdown effect in Step 2
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Focus first OTP input when transitioning to Step 2
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Dynamic context description based on where the user came from
  const getContextDescription = () => {
    if (pendingAction?.type === 'add_to_cart') {
      const prodName = pendingAction.payload?.product?.name || 'product';
      const qty = pendingAction.payload?.quantity || 1;
      return (
        <>
          Please sign in to add <strong>{prodName}</strong> (Qty: {qty}) to your cart.
          <br />
          Your selected item is safely preserved.
        </>
      );
    }
    if (pendingAction?.type === 'confirm_pooja') {
      return (
        <>
          Please sign in to complete your Special Pooja Booking.
          <br />
          Your booking details are safely preserved.
        </>
      );
    }
    if (pendingAction?.type === 'buy_now') {
      return (
        <>
          Please sign in to finalize your sacred order.
          <br />
          Your details are safely preserved.
        </>
      );
    }
    return (
      <>
        Sign in to access your devotee account and sacred orders.
      </>
    );
  };

  // STEP 1: Handle Name + Phone submission -> Get OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    const digits = cleanPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.requestOtp({ name: cleanName, phone: cleanPhone });
      if (res.success) {
        setStep('otp');
        setTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setServerOtp(res.otp || '');
        setUserId(res.userId || null);
        setSuccessMsg(res.message || `OTP sent to ${cleanPhone}`);
      } else {
        setError(res.message || 'Unable to request OTP. Please try again.');
      }
    } catch {
      setError('A connection error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Handle OTP input changes
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const char = cleaned.slice(-1); // Take last entered digit

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-advance to next box if digit was entered
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous box if current is empty
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);

    // Focus last filled box
    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyOtp({
        name: name.trim(),
        phone: phone.trim(),
        otp: otpCode,
        userId,
      });

      if (res.success) {
        // Save user into BogarContext & storage with API attributes
        const user = loginWithPhone({
          name: res.user?.name || name.trim(),
          phone: phone.trim(),
          user_id: res.userId || res.user?.id || userId,
          email: res.user?.email,
          role: res.user?.role,
          apiUser: res.user,
        });

        if (onLoginSuccess) {
          onLoginSuccess(user);
        } else if (onNavigate) {
          onNavigate('home');
        }
      } else {
        setError(res.message || 'Invalid OTP code.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await authService.resendOtp({
        name: name.trim(),
        phone: phone.trim(),
        userId,
      });
      if (res.success) {
        setTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        if (res.otp) setServerOtp(res.otp);
        if (res.userId) setUserId(res.userId);
        setSuccessMsg(res.message || 'Fresh OTP dispatched.');
        otpInputRefs.current[0]?.focus();
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch {
      setError('Network error while resending OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const fullOtpEntered = otp.every((d) => d !== '');

  return (
    <div className="bogar-auth-page">
      <div className="bogar-auth-page__bg-overlay" />

      <div className="bogar-auth-card">
        {/* Card Header */}
        <div className="bogar-auth-card__header">
          <div className="bogar-auth-card__logo-wrap">
            <img
              src="/assets/images/bogar-brand-logo.png"
              alt="BOGAR - Tradition • Heritage • Wisdom"
              className="bogar-auth-brand-logo"
            />
          </div>
          <h1 className="bogar-auth-card__title">
            {step === 'details' ? 'Login / Sign Up' : 'Verify OTP'}
          </h1>
          <p className="bogar-auth-card__subtitle">Tradition • Heritage • Wisdom</p>
          <p className="bogar-auth-card__description">
            {step === 'details' ? (
              getContextDescription()
            ) : (
              <>Enter the 6-digit verification code sent to your mobile number.</>
            )}
          </p>
        </div>

        {/* Alerts */}
        {error && <div className="bogar-auth-alert bogar-auth-alert--error">{error}</div>}
        {successMsg && <div className="bogar-auth-alert bogar-auth-alert--success">{successMsg}</div>}

        {/* STEP 1: USER DETAILS (Name + Phone) */}
        {step === 'details' && (
          <form onSubmit={handleRequestOtp} className="bogar-auth-form">
            {/* 1. Full Name */}
            <div className="bogar-auth-group">
              <label htmlFor="auth-name" className="bogar-auth-label">
                Name
              </label>
              <div className="bogar-auth-input-wrapper">
                <span className="bogar-auth-input-icon">
                  <User size={16} />
                </span>
                <input
                  id="auth-name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bogar-auth-input"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>

            {/* 2. Phone Number */}
            <div className="bogar-auth-group">
              <label htmlFor="auth-phone" className="bogar-auth-label">
                Phone Number
              </label>
              <div className="bogar-auth-input-wrapper">
                <span className="bogar-auth-input-icon">
                  <Phone size={16} />
                </span>
                <input
                  id="auth-phone"
                  type="tel"
                  required
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bogar-auth-input"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Continue / Get OTP button */}
            <button
              type="submit"
              className="bogar-auth-btn-submit"
              disabled={isLoading}
              style={{ marginTop: '0.4rem' }}
            >
              <span>{isLoading ? 'Sending OTP...' : 'Continue / Get OTP'}</span>
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="bogar-auth-form">
            {/* Phone Display with Edit Option */}
            <div className="bogar-auth-phone-display">
              <ShieldCheck size={16} color="#D4B675" />
              <span>
                Code sent to: <strong>{phone}</strong>
              </span>
              <button
                type="button"
                className="bogar-auth-btn-edit-phone"
                onClick={() => {
                  setStep('details');
                  setError('');
                  setSuccessMsg('');
                }}
                title="Change Phone Number"
              >
                (Edit)
              </button>
            </div>

            {/* 6-Digit OTP Input */}
            <div className="bogar-auth-group" style={{ textAlign: 'center' }}>
              <label className="bogar-auth-label" style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
                Enter 6-Digit OTP
              </label>
              <div className="bogar-auth-otp-row" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`bogar-auth-otp-box ${digit ? 'bogar-auth-otp-box--filled' : ''}`}
                    aria-label={`Digit ${idx + 1}`}
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            {/* Verify OTP Button */}
            <button
              type="submit"
              className="bogar-auth-btn-submit"
              disabled={!fullOtpEntered || isLoading}
              style={{ marginTop: '0.5rem' }}
            >
              <span>{isLoading ? 'Verifying...' : 'Verify OTP'}</span>
            </button>

            {/* Resend OTP & Countdown Timer */}
            <div className="bogar-auth-resend-row">
              {canResend ? (
                <>
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    className="bogar-auth-btn-resend"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </>
              ) : (
                <span>
                  Resend OTP in <strong>{timer}s</strong>
                </span>
              )}
            </div>

            {/* Back button to Step 1 */}
            <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              <button
                type="button"
                className="bogar-auth-link"
                onClick={() => {
                  setStep('details');
                  setError('');
                  setSuccessMsg('');
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ArrowLeft size={14} />
                <span>Back to Name & Phone</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
