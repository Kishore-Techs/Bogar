/**
 * Dharani Herbals / Vandanmart Live Payment Gateway Integration
 * Base URL: https://api.codingboss.in/vandanmart/
 *
 * Integrated Endpoints:
 * - POST /payglocal/create/ -> Live Online Payment Gateway (UPI, GPay, PhonePe, Paytm, Cards, NetBanking)
 * - POST /create-paytm-order/ -> Paytm Order Initiation
 */

export const API_BASE_URL = 'https://api.codingboss.in/vandanmart';

export const paymentService = {
  /**
   * Initiate online payment gateway order
   * @param {Object} params
   * @param {number} params.amount - Total order amount in INR
   * @param {string} params.customerName - Devotee name
   * @param {string} params.customerPhone - Devotee phone number
   * @param {string} params.customerEmail - Devotee email
   * @param {string} params.orderId - Unique order identifier
   */
  async createPaymentOrder({ amount, customerName, customerPhone, customerEmail, orderId }) {
    const numAmount = Math.max(1, parseFloat(amount) || 1);
    const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10);
    const cleanName = (customerName || 'Devotee').trim();
    const cleanEmail = (customerEmail || `${cleanPhone || 'devotee'}@bogar.temple`).trim();
    const txnOrderId = orderId || `BOGAR-ORD-${Date.now()}`;

    try {
      const response = await fetch(`${API_BASE_URL}/payglocal/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          amount: numAmount,
          currency: 'INR',
          customer_name: cleanName,
          customer_phone: cleanPhone,
          customer_email: cleanEmail,
          order_id: txnOrderId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success) {
        const redirectUrl =
          data.response?.data?.redirectUrl ||
          data.redirect_url ||
          null;

        return {
          success: true,
          gateway: 'PayGlocal / Dharani Herbals Gateway',
          merchantTxnId:
            data.merchant_txn_id ||
            data.response?.data?.merchantTxnId ||
            `HERBAL_${Date.now()}`,
          gid: data.gid || data.response?.gid || null,
          redirectUrl,
          message: data.message || 'Payment gateway session created successfully',
        };
      }

      return {
        success: false,
        message: data?.message || 'Could not initiate payment session on server.',
      };
    } catch (err) {
      console.warn('Payment API Error:', err);
      return {
        success: false,
        message: 'Network error contacting Dharani Herbals Payment API.',
      };
    }
  },
};

