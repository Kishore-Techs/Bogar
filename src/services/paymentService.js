/**
 * Dharani Herbals / Vandanmart Live Payment Gateway Integration
 * Base URL: https://api.codingboss.in/vandanmart/ & https://api.codingboss.in/herbal/
 *
 * Integrated Endpoints:
 * - POST /payglocal/create/ -> Live Online Payment Gateway (UPI, GPay, PhonePe, Paytm, Cards, NetBanking)
 * - GET /herbal/orders/?payment_id=<gid> -> Transaction Status Verification
 * - GET /herbal/orders/?search=<txn_id> -> Merchant Order Status Verification
 */

export const API_BASE_URL = 'https://api.codingboss.in/vandanmart';
export const HERBAL_BASE_URL = 'https://api.codingboss.in/herbal';

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

        const merchantTxnId =
          data.merchant_txn_id ||
          data.response?.data?.merchantTxnId ||
          `HERBAL_${Date.now()}`;

        const gid = data.gid || data.response?.gid || null;

        return {
          success: true,
          gateway: 'PayGlocal / Dharani Herbals Gateway',
          merchantTxnId,
          gid,
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

  /**
   * Verify Payment Gateway Transaction Status
   * @param {Object} params
   * @param {string} params.gid - PayGlocal GID
   * @param {string} params.merchantTxnId - Merchant Transaction ID
   * @param {string} params.customerPhone - Devotee Phone Number
   */
  async checkPaymentStatus({ gid, merchantTxnId, customerPhone }) {
    try {
      // 1. Check order by PayGlocal GID
      if (gid) {
        const res = await fetch(`${HERBAL_BASE_URL}/orders/?payment_id=${encodeURIComponent(gid)}`, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          const orders = data?.data || [];
          const matched = orders.find((o) => o.payment_id === gid);
          if (matched) {
            const st = (matched.payment_status || '').toLowerCase();
            if (st === 'success' || st === 'paid' || st === 'completed') {
              return { success: true, paymentStatus: 'success', order: matched };
            }
            if (st === 'failed' || st === 'cancelled' || st === 'rejected') {
              return { success: false, paymentStatus: 'failed', order: matched };
            }
          }
        }
      }

      // 2. Check order by merchantTxnId
      if (merchantTxnId) {
        const res = await fetch(`${HERBAL_BASE_URL}/orders/?search=${encodeURIComponent(merchantTxnId)}`, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          const orders = data?.data || [];
          const matched = orders.find(
            (o) => o.payment_id === gid || o.order_no === merchantTxnId
          );
          if (matched) {
            const st = (matched.payment_status || '').toLowerCase();
            if (st === 'success' || st === 'paid' || st === 'completed') {
              return { success: true, paymentStatus: 'success', order: matched };
            }
            if (st === 'failed' || st === 'cancelled' || st === 'rejected') {
              return { success: false, paymentStatus: 'failed', order: matched };
            }
          }
        }
      }

      return { success: false, paymentStatus: 'pending' };
    } catch (err) {
      console.warn('Payment status check error:', err);
      return { success: false, paymentStatus: 'unknown' };
    }
  },
};
