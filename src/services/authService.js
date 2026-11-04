/**
 * BOGAR Authentication & OTP Service
 *
 * Integrated strictly with Dharani Herbals / Vandanmart API:
 * Base URL: https://api.codingboss.in/vandanmart/
 *
 * Endpoints:
 * - POST /user-login/        -> Request OTP for mobile & name (dispatches real SMS via CRM)
 * - POST /verify-otp/        -> Verify real 6-digit OTP code & complete authentication
 * - POST /resend-otp/        -> Resend fresh OTP to mobile number
 */

export const API_BASE_URL = 'https://api.codingboss.in/vandanmart';

export const authService = {
  /**
   * Request OTP for the entered Name and 10-digit Phone Number from real CRM API
   */
  async requestOtp({ name, phone }) {
    const cleanPhone = (phone || '').trim();
    const cleanName = (name || '').trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '').slice(-10);

    if (phoneDigits.length < 10) {
      return {
        success: false,
        message: 'Please enter a valid 10-digit mobile number.',
      };
    }

    if (!cleanName) {
      return {
        success: false,
        message: 'Please enter your name.',
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneDigits,
          name: cleanName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success !== false) {
        return {
          success: true,
          message: data.message || `OTP sent successfully to ${phoneDigits}`,
          otp: data.otp || null,
          isNewUser: data.is_new_user ?? true,
          userId: data.user_id || null,
          data,
        };
      }

      return {
        success: false,
        message: data?.message || 'Unable to send OTP. Please check your mobile number.',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Network error. Please check your internet connection and try again.',
      };
    }
  },

  /**
   * Verify the 6-digit OTP code against real CRM API
   */
  async verifyOtp({ name, phone, otp, userId }) {
    const cleanOtp = String(otp || '').trim().replace(/\D/g, '');
    const cleanPhone = (phone || '').trim();
    const cleanName = (name || '').trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '').slice(-10);

    if (cleanOtp.length !== 6) {
      return {
        success: false,
        message: 'Please enter a complete 6-digit verification code.',
      };
    }

    try {
      const payload = {
        mobile: phoneDigits,
        otp: cleanOtp,
        name: cleanName,
      };
      if (userId) {
        payload.user_id = userId;
      }

      const response = await fetch(`${API_BASE_URL}/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success !== false) {
        const user = data.user || {
          id: data.user_id || userId,
          name: cleanName,
          fullName: cleanName,
          mobile: phoneDigits,
          phone: phoneDigits,
          email: `${phoneDigits}@bogar.temple`,
          role: 'customer',
        };

        return {
          success: true,
          message: data.message || 'Authentication successful.',
          user: {
            ...user,
            id: user.id || data.user_id || userId,
            name: user.name || cleanName,
            fullName: user.name || user.fullName || cleanName,
            phone: user.mobile || phoneDigits,
            email: user.email || `${phoneDigits}@bogar.temple`,
          },
          userId: data.user_id || user.id,
          data,
        };
      }

      return {
        success: false,
        message: data?.message || 'Invalid OTP. Please check the code and try again.',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Network error during verification. Please try again.',
      };
    }
  },

  /**
   * Resend fresh OTP via real CRM API
   */
  async resendOtp({ name, phone, userId }) {
    const cleanPhone = (phone || '').trim();
    const cleanName = (name || '').trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '').slice(-10);

    try {
      const response = await fetch(`${API_BASE_URL}/user-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneDigits,
          name: cleanName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success !== false) {
        return {
          success: true,
          message: data.message || `A fresh OTP has been sent to ${phoneDigits}.`,
          otp: data.otp || null,
          userId: data.user_id || userId,
          data,
        };
      }

      // Try resend-otp endpoint as alternative
      const altResponse = await fetch(`${API_BASE_URL}/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ mobile: phoneDigits }),
      });
      const altData = await altResponse.json().catch(() => null);

      if (altResponse.ok && altData && altData.success !== false) {
        return {
          success: true,
          message: altData.message || `A fresh OTP has been sent to ${phoneDigits}.`,
          otp: altData.otp || null,
          userId: userId,
          data: altData,
        };
      }

      return {
        success: false,
        message: data?.message || altData?.message || 'Failed to resend OTP. Please try again.',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  },
};
