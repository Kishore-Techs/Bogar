import React from 'react';
import LoginView from './LoginView';

/**
 * Unified Login / Sign Up View
 * Uses the simplified 2-step OTP verification flow:
 * Step 1: Name + Phone Number -> Get OTP
 * Step 2: 6-digit OTP verification with countdown & resend
 */
export default function SignupView({ onNavigate, onSignupSuccess }) {
  return <LoginView onNavigate={onNavigate} onLoginSuccess={onSignupSuccess} />;
}
