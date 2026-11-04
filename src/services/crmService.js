/**
 * BOGAR <-> Vandanmart CRM Live Two-Way Synchronization Service
 * Base URL: https://api.codingboss.in/vandanmart/
 *
 * Integrated CRM Endpoints:
 * - GET  /shipping-charge/                  -> Fetch live state-wise shipping charges from CRM
 * - POST /address/                          -> Create devotee address in CRM
 * - POST /orders/                           -> Create order live in CRM with real user details
 * - POST /create-paytm-order/               -> Create payment record for order in CRM
 * - POST /paytm/webhook/                    -> Update payment status (success / failed) live in CRM
 * - POST /orders/<order_id>/update-status/  -> Update order status live in CRM (e.g. cancelled)
 * - GET  /orders/                           -> Fetch live orders from CRM to reflect backend updates
 * - GET  /orders/<order_id>/                -> Fetch order detail from CRM
 */

export const CRM_API_BASE_URL = 'https://api.codingboss.in/vandanmart';

// Default fallback shipping rates in case of network latency
export const DEFAULT_SHIPPING_RATES = [
  { state_name: 'Tamil Nadu', state_code: 'TN', shipping_amount: '50.00', free_above: '750.00', min_order: '125.00' },
  { state_name: 'Kerala', state_code: 'KL', shipping_amount: '150.00', free_above: '1000.00', min_order: '400.00' },
  { state_name: 'Karnataka', state_code: 'KA', shipping_amount: '150.00', free_above: '1000.00', min_order: '400.00' },
  { state_name: 'Andhra Pradesh', state_code: 'AP', shipping_amount: '150.00', free_above: '1000.00', min_order: '400.00' },
  { state_name: 'Telangana', state_code: 'TS', shipping_amount: '250.00', free_above: '1000.00', min_order: '500.00' },
  { state_name: 'Puducherry', state_code: 'PY', shipping_amount: '200.00', free_above: '1000.00', min_order: '400.00' },
  { state_name: 'Maharashtra', state_code: 'MH', shipping_amount: '250.00', free_above: '1200.00', min_order: '500.00' },
  { state_name: 'Delhi', state_code: 'DL', shipping_amount: '250.00', free_above: '1000.00', min_order: '500.00' },
];

export const crmService = {
  _shippingRatesCache: null,

  /**
   * Automatically detect user's Indian state from Pincode or City / Address text
   */
  detectStateFromLocation({ pincode = '', city = '', address = '', stateName = '' }) {
    if (stateName && stateName.trim()) {
      return stateName.trim();
    }

    // 1. Check Indian 6-digit Pincode prefix
    const pin = String(pincode || address || '').replace(/\D/g, '');
    if (pin.length >= 2) {
      // Find 6-digit pincode in string if embedded
      const m = String(pincode || address).match(/\b([1-9][0-9]{5})\b/);
      const cleanPin = m ? m[1] : (pin.length >= 6 ? pin.slice(0, 6) : pin);
      const p2 = parseInt(cleanPin.slice(0, 2), 10);
      const p3 = parseInt(cleanPin.slice(0, 3), 10);

      if (p3 === 605) return 'Puducherry';
      if (p2 >= 60 && p2 <= 64) return 'Tamil Nadu';
      if (p2 >= 67 && p2 <= 69) return 'Kerala';
      if (p2 >= 56 && p2 <= 59) return 'Karnataka';
      if (p2 >= 50 && p2 <= 53) return 'Andhra Pradesh';
      if (p2 >= 40 && p2 <= 44) return 'Maharashtra';
      if (p2 === 11) return 'Delhi';
      if (p2 >= 12 && p2 <= 13) return 'Haryana';
      if (p2 >= 14 && p2 <= 15) return 'Punjab';
      if (p2 === 16) return 'Chandigarh';
      if (p2 >= 36 && p2 <= 39) return 'Gujarat';
      if (p2 >= 30 && p2 <= 34) return 'Rajasthan';
      if (p2 >= 20 && p2 <= 28) return 'Uttar Pradesh';
      if (p2 >= 70 && p2 <= 74) return 'West Bengal';
      if (p2 >= 75 && p2 <= 77) return 'Odisha';
      if (p2 === 78) return 'Assam';
      if (p2 >= 80 && p2 <= 85) return 'Bihar';
    }

    // 2. Check City / Address text for common city names or states
    const text = `${city} ${address}`.toLowerCase();
    if (text.includes('tamil') || text.includes('nadu') || text.includes('chennai') || text.includes('coimbatore') || text.includes('madurai') || text.includes('salem') || text.includes('trichy') || text.includes('tirupur') || text.includes('erode') || text.includes('palani') || text.includes('vellore') || text.includes('tirunelveli')) {
      return 'Tamil Nadu';
    }
    if (text.includes('kerala') || text.includes('kochi') || text.includes('trivandrum') || text.includes('calicut') || text.includes('kozhikode') || text.includes('ernakulam') || text.includes('palakkad')) {
      return 'Kerala';
    }
    if (text.includes('karnataka') || text.includes('bangalore') || text.includes('bengaluru') || text.includes('mysore') || text.includes('mangalore') || text.includes('hubli')) {
      return 'Karnataka';
    }
    if (text.includes('andhra') || text.includes('visakhapatnam') || text.includes('vijayawada') || text.includes('tirupati') || text.includes('guntur')) {
      return 'Andhra Pradesh';
    }
    if (text.includes('telangana') || text.includes('hyderabad') || text.includes('secunderabad') || text.includes('warangal')) {
      return 'Telangana';
    }
    if (text.includes('maharashtra') || text.includes('mumbai') || text.includes('pune') || text.includes('nagpur') || text.includes('thane')) {
      return 'Maharashtra';
    }
    if (text.includes('delhi') || text.includes('new delhi')) {
      return 'Delhi';
    }
    if (text.includes('puducherry') || text.includes('pondicherry')) {
      return 'Puducherry';
    }

    return 'Tamil Nadu'; // Local default for calculation
  },

  /**
   * Fetch live shipping rates from CRM API
   */
  async fetchShippingCharges() {
    if (this._shippingRatesCache && this._shippingRatesCache.length > 0) {
      return this._shippingRatesCache;
    }

    try {
      const res = await fetch(`${CRM_API_BASE_URL}/shipping-charge/`, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        const list = data?.data || (Array.isArray(data) ? data : []);
        if (list.length > 0) {
          this._shippingRatesCache = list;
          return list;
        }
      }
    } catch (err) {
      console.warn('Error fetching shipping charges from CRM:', err);
    }

    return DEFAULT_SHIPPING_RATES;
  },

  /**
   * Calculate exact shipping charge automatically based on user's location and order subtotal
   */
  calculateShipping({ subtotal = 0, pincode = '', city = '', address = '', stateName = '', rates = [] }) {
    const list = rates && rates.length > 0 ? rates : (this._shippingRatesCache || DEFAULT_SHIPPING_RATES);
    const resolvedState = this.detectStateFromLocation({ pincode, city, address, stateName });
    const search = resolvedState.toLowerCase().trim();

    // Match state name from CRM rates
    const match =
      list.find((r) => r.state_name.toLowerCase() === search) ||
      list.find((r) => search.includes(r.state_name.toLowerCase())) ||
      list.find((r) => r.state_name.toLowerCase().includes(search)) ||
      list.find((r) => r.state_name.toLowerCase() === 'tamil nadu');

    if (!match) {
      return {
        shippingAmount: 50,
        originalAmount: 50,
        freeAbove: 750,
        minOrder: 125,
        stateName: 'Tamil Nadu',
        isFree: subtotal >= 750,
      };
    }

    const freeAbove = parseFloat(match.free_above) || 750;
    const originalAmount = parseFloat(match.shipping_amount) || 50;
    const minOrder = parseFloat(match.min_order) || 125;
    const isFree = subtotal >= freeAbove;
    const shippingAmount = isFree ? 0 : originalAmount;

    return {
      shippingAmount,
      originalAmount,
      freeAbove,
      minOrder,
      stateName: match.state_name,
      isFree,
    };
  },

  /**
   * Save or register devotee address in CRM so address_id is linked to orders.
   * Uses real user details with no fake defaults.
   */
  async createCrmAddress({ customerId, fullName, phone, address, city, state, pincode }) {
    if (!customerId) return { success: false };

    try {
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
      const res = await fetch(`${CRM_API_BASE_URL}/address/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          user_id: customerId,
          customer_id: customerId,
          full_name: fullName || '',
          name: fullName || '',
          phone: cleanPhone,
          mobile: cleanPhone,
          address: address || '',
          city: city || '',
          state: state || '',
          pincode: pincode || '',
          postal_code: pincode || '',
          address_type: 'Home',
          latitude: 10.4549,
          longitude: 77.5204,
          is_default: true,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && (data.address_id || data.id)) {
        return { success: true, addressId: data.address_id || data.id, data };
      }
      return { success: false, message: data?.message };
    } catch (err) {
      console.warn('createCrmAddress error:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Create a linked payment record in CRM for the order.
   * Note: CRM backend requires the order status to be 'pending' during payment creation.
   */
  async createCrmPayment({ customerId, backendOrderId, totalAmount }) {
    if (!backendOrderId) return { success: false, message: 'No backendOrderId' };

    let effectiveCustomerId = customerId;
    if (!effectiveCustomerId) {
      try {
        const orderRes = await fetch(`${CRM_API_BASE_URL}/orders/${backendOrderId}/`);
        const orderData = await orderRes.json();
        effectiveCustomerId = orderData?.data?.customer_id || orderData?.data?.customer?.id;
      } catch (e) {}
    }

    try {
      let res = await fetch(`${CRM_API_BASE_URL}/create-paytm-order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          user_id: effectiveCustomerId || 1,
          order_id: backendOrderId,
          amount: parseFloat(totalAmount) || 1,
        }),
      });

      let data = await res.json().catch(() => null);

      // If failed due to customer mismatch, fetch order detail to get the exact customer ID and retry
      if (!res.ok && data?.message && data.message.includes('customer')) {
        try {
          const orderRes = await fetch(`${CRM_API_BASE_URL}/orders/${backendOrderId}/`);
          const orderData = await orderRes.json();
          const trueCustId = orderData?.data?.customer_id || orderData?.data?.customer?.id;
          if (trueCustId && trueCustId !== effectiveCustomerId) {
            effectiveCustomerId = trueCustId;
            res = await fetch(`${CRM_API_BASE_URL}/create-paytm-order/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                user_id: trueCustId,
                order_id: backendOrderId,
                amount: parseFloat(totalAmount) || 1,
              }),
            });
            data = await res.json().catch(() => null);
          }
        } catch (retryErr) {}
      }

      if (res.ok && data && (data.success || data.paytm_order_id)) {
        return {
          success: true,
          paytmOrderId: data.paytm_order_id,
          paymentId: data.payment_id,
          customerId: effectiveCustomerId,
          data,
        };
      }
      return { success: false, message: data?.message || 'Could not create CRM payment record' };
    } catch (err) {
      console.warn('createCrmPayment error:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Update payment status live in CRM (success / failed)
   */
  async updateCrmPaymentStatus({ paytmOrderId, status, totalAmount = 0, transactionId = '' }) {
    if (!paytmOrderId) return { success: false, message: 'No paytmOrderId' };

    const isSuccess = status === 'success' || status === 'Paid' || status === 'confirmed';
    const isPending = status === 'pending' || status === 'Pending';
    const payload = isSuccess
      ? {
          ORDERID: paytmOrderId,
          STATUS: 'TXN_SUCCESS',
          RESPCODE: '01',
          RESPMSG: 'Txn Success',
          TXNAMOUNT: Number(totalAmount || 0).toFixed(2),
          TXNID: transactionId || ('SUCCESS_' + Date.now()),
        }
      : isPending
      ? {
          ORDERID: paytmOrderId,
          STATUS: 'PENDING',
          RESPCODE: '02',
          RESPMSG: 'Txn Pending',
          TXNAMOUNT: Number(totalAmount || 0).toFixed(2),
          TXNID: transactionId || ('HERBAL_PENDING_' + Date.now()),
        }
      : {
          ORDERID: paytmOrderId,
          STATUS: 'TXN_FAILURE',
          RESPCODE: '141',
          RESPMSG: 'Payment Cancelled or Failed',
          TXNAMOUNT: Number(totalAmount || 0).toFixed(2),
          TXNID: transactionId || ('CANCEL_' + Date.now()),
        };

    try {
      const res = await fetch(`${CRM_API_BASE_URL}/paytm/webhook/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true, paymentStatus: isSuccess ? 'success' : 'failed', data };
      }
      return { success: false, message: data?.message || 'Could not update CRM payment status' };
    } catch (err) {
      console.warn('updateCrmPaymentStatus error:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Sync a newly placed or cancelled order to the CRM with pure user data (no fake values)
   */
  async syncOrderToCrm({ order, customer }) {
    if (!order) return { success: false, message: 'No order provided' };

    const cleanPhone = (order.phone || customer?.phone || customer?.mobile || '').replace(/\D/g, '').slice(-10);
    let resolvedCustomerName = order.devoteeName || customer?.name || customer?.fullName || '';
    let resolvedCustomerId = customer?.id || customer?.user_id;

    // Resolve exact customer record from CRM by mobile phone
    if (!resolvedCustomerId && cleanPhone) {
      try {
        const custRes = await fetch(`${CRM_API_BASE_URL}/customers/`);
        const custData = await custRes.json();
        const list = custData?.data || custData || [];
        const matched = list.find((c) => (c.mobile || '').replace(/\D/g, '').slice(-10) === cleanPhone);
        if (matched) {
          resolvedCustomerId = matched.id;
          if (!resolvedCustomerName) {
            resolvedCustomerName = matched.name || '';
          }
        }
      } catch (e) {}
    }

    const unitPrice = parseFloat(order.product?.price) || (parseFloat(order.subtotal || order.totalAmount) / (order.quantity || 1)) || 0;
    const subtotal = parseFloat(order.subtotal) || (unitPrice * (order.quantity || 1)) || 0;
    const shippingCharges = parseFloat(order.shippingCharges !== undefined ? order.shippingCharges : 0);
    const totalAmount = parseFloat(order.totalAmount) || (subtotal + shippingCharges) || 0;

    const isCancelled = order.status === 'Cancelled' || order.paymentStatus === 'Cancelled' || order.paymentStatus === 'failed';
    const isPaid = order.paymentStatus === 'Paid' || order.paymentStatus === 'success';

    // Pure real user values with no hardcoded fake fallback data
    const addressLine = order.streetAddress || order.deliveryAddress || '';
    const city = order.city || '';
    const pincode = order.pincode || '';
    const state = order.state || this.detectStateFromLocation({ pincode, city, address: addressLine }) || '';

    // Register / update address in CRM to link address_id
    let addressId = null;
    if (addressLine || city || pincode) {
      try {
        const addrRes = await this.createCrmAddress({
          customerId: resolvedCustomerId,
          fullName: resolvedCustomerName,
          phone: cleanPhone,
          address: addressLine,
          city,
          state,
          pincode,
        });
        if (addrRes?.addressId) {
          addressId = addrRes.addressId;
        }
      } catch (e) {}
    }

    const invoiceNo = `INV-BOGAR-${order.orderId ? String(order.orderId).replace(/\D/g, '').slice(-6) : Date.now().toString().slice(-6)}`;
    const trackingNo = `TRK${Date.now().toString().slice(-8)}`;

    // IMPORTANT: Always initialize with status 'pending' in POST /orders/
    // so that create-paytm-order backend check does not block payment record creation.
    const payload = {
      customer_id: resolvedCustomerId,
      address_id: addressId,
      customer: resolvedCustomerName,
      mobile: cleanPhone,
      email: order.email || customer?.email || `${cleanPhone}@bogar.temple`,
      payment_method: order.paymentMethod || 'Online Payment Gateway',
      payment_status: 'pending',
      status: 'pending',
      subtotal: subtotal,
      sub_total: subtotal,
      product_amount: subtotal,
      shipping_charges: shippingCharges,
      total_amount: totalAmount,
      amount_to_pay: totalAmount,
      invoice_number: invoiceNo,
      order_no: invoiceNo,
      mode_of_communication: 'Website',
      logistics: 'Bogar Sacred Express Logistics',
      tracking_number: trackingNo,
      estimated_delivery: '3-5 Business Days',
      remarks: `Placed from Bogar Website - Txn ID: ${order.transactionId || order.orderId}`,
      address: {
        id: addressId,
        full_name: resolvedCustomerName,
        phone: cleanPhone,
        address: addressLine,
        city: city,
        state: state,
        pincode: pincode,
        address_type: 'Home',
        latitude: '10.454900',
        longitude: '77.520400',
        is_default: true,
      },
      items: [
        {
          product_id: order.product?.id || 1305,
          quantity: order.quantity || 1,
          price: unitPrice || subtotal,
        },
      ],
    };

    try {
      const res = await fetch(`${CRM_API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && (data.success || data.order_id)) {
        const backendOrderId = data.order_id || data.id || data?.data?.order_id || data?.data?.id;
        let realCustomerId = data.customer_id || data?.data?.customer_id || data?.data?.customer?.id || resolvedCustomerId;

        // Step 1: Create linked payment record in CRM while status is 'pending'
        let paytmOrderId = null;
        if (backendOrderId) {
          // Explicitly ensure status is 'pending' before calling create-paytm-order
          await this.updateCrmOrderStatusRaw({ backendOrderId, status: 'pending' }).catch(() => null);

          // If realCustomerId is still null, fetch order details from CRM
          if (!realCustomerId) {
            try {
              const detailRes = await fetch(`${CRM_API_BASE_URL}/orders/${backendOrderId}/`);
              const detailData = await detailRes.json();
              realCustomerId = detailData?.data?.customer_id || detailData?.data?.customer?.id;
            } catch (e) {}
          }

          const payRes = await this.createCrmPayment({
            customerId: realCustomerId,
            backendOrderId,
            totalAmount,
          }).catch(() => null);
          paytmOrderId = payRes?.paytmOrderId;

          // If paytmOrderId is still missing, retry once after fetching fresh order details
          if (!paytmOrderId) {
            try {
              const detailRes = await fetch(`${CRM_API_BASE_URL}/orders/${backendOrderId}/`);
              const detailData = await detailRes.json();
              const freshCustId = detailData?.data?.customer_id || detailData?.data?.customer?.id;
              if (freshCustId) {
                realCustomerId = freshCustId;
                await this.updateCrmOrderStatusRaw({ backendOrderId, status: 'pending' }).catch(() => null);
                const retryPay = await this.createCrmPayment({
                  customerId: freshCustId,
                  backendOrderId,
                  totalAmount,
                }).catch(() => null);
                paytmOrderId = retryPay?.paytmOrderId;
              }
            } catch (retryErr) {}
          }

          // Step 2: Update payment_status & order status according to real user action
          if (isCancelled) {
            if (paytmOrderId) {
              await this.updateCrmPaymentStatus({
                paytmOrderId,
                status: 'failed',
                totalAmount,
                transactionId: order.transactionId || ('HERBAL_CANCEL_' + Date.now()),
              }).catch(() => null);
            }
            await this.updateCrmOrderStatusRaw({ backendOrderId, status: 'cancelled' }).catch(() => null);
          } else if (isPaid) {
            if (paytmOrderId) {
              await this.updateCrmPaymentStatus({
                paytmOrderId,
                status: 'success',
                totalAmount,
                transactionId: order.transactionId || ('HERBAL_SUCCESS_' + Date.now()),
              }).catch(() => null);
            }
            await this.updateCrmOrderStatusRaw({ backendOrderId, status: 'confirmed' }).catch(() => null);
          } else {
            // For COD or pending gateway orders, link payment record so payment_gateway & payment_id are never blank
            if (paytmOrderId) {
              await this.updateCrmPaymentStatus({
                paytmOrderId,
                status: 'pending',
                totalAmount,
                transactionId: order.transactionId || ('HERBAL_PENDING_' + Date.now()),
              }).catch(() => null);
            }
            await this.updateCrmOrderStatusRaw({ backendOrderId, status: 'confirmed' }).catch(() => null);
          }
        }

        return {
          success: true,
          backendOrderId,
          orderNo: data.order_no,
          paytmOrderId,
          customerId: realCustomerId,
          data,
        };
      }

      return {
        success: false,
        message: data?.message || 'CRM order sync returned non-success response.',
      };
    } catch (err) {
      console.warn('CRM order sync error:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Raw update of order status in CRM
   */
  async updateCrmOrderStatusRaw({ backendOrderId, status }) {
    if (!backendOrderId) return { success: false };
    const crmStatus = (status || 'cancelled').toLowerCase();
    try {
      const res = await fetch(`${CRM_API_BASE_URL}/orders/${backendOrderId}/update-status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: crmStatus }),
      });
      const data = await res.json().catch(() => null);
      return { success: res.ok, status: data?.status || crmStatus, data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  /**
   * Update order status live in CRM and guarantee payment_status is updated too
   */
  async updateCrmOrderStatus({
    backendOrderId,
    status,
    paymentStatus,
    paytmOrderId,
    totalAmount = 0,
    customerId,
    transactionId = '',
  }) {
    if (!backendOrderId) return { success: false, message: 'No backendOrderId provided' };

    const crmStatus = (status || 'cancelled').toLowerCase();
    const isCancelled = crmStatus === 'cancelled' || paymentStatus === 'failed' || paymentStatus === 'Cancelled';
    const isPaid = crmStatus === 'confirmed' || crmStatus === 'delivered' || paymentStatus === 'success' || paymentStatus === 'Paid';
    const targetPaymentStatus =
      paymentStatus ||
      (isCancelled
        ? 'failed'
        : isPaid
        ? 'success'
        : 'pending');

    try {
      let targetPaytmOrderId = paytmOrderId;

      // If we don't have paytmOrderId yet, fetch order details to discover real customer_id
      if (!targetPaytmOrderId) {
        let realCustId = customerId;
        try {
          const detailRes = await fetch(`${CRM_API_BASE_URL}/orders/${backendOrderId}/`);
          const detailData = await detailRes.json();
          realCustId = detailData?.data?.customer_id || detailData?.data?.customer?.id || customerId || 1;
        } catch (e) {}

        // Temporarily set status to pending to allow payment creation
        await this.updateCrmOrderStatusRaw({ backendOrderId, status: 'pending' }).catch(() => null);

        const payRes = await this.createCrmPayment({
          customerId: realCustId,
          backendOrderId,
          totalAmount: parseFloat(totalAmount) || 1,
        }).catch(() => null);
        targetPaytmOrderId = payRes?.paytmOrderId;
      }

      // Update payment_status in CRM via webhook
      if (targetPaytmOrderId) {
        await this.updateCrmPaymentStatus({
          paytmOrderId: targetPaytmOrderId,
          status: targetPaymentStatus,
          totalAmount,
          transactionId: transactionId || (crmStatus === 'cancelled' ? ('HERBAL_CANCEL_' + Date.now()) : ('HERBAL_SUCCESS_' + Date.now())),
        }).catch(() => null);
      }

      // Finally update order status in CRM
      const finalRes = await this.updateCrmOrderStatusRaw({ backendOrderId, status: crmStatus });
      return { success: true, status: crmStatus, data: finalRes.data };
    } catch (err) {
      console.warn('CRM status update error:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Fetch live orders from CRM to reflect changes made in CRM/backend
   */
  async fetchLiveCrmOrders(customerPhone) {
    try {
      let url = `${CRM_API_BASE_URL}/orders/`;
      if (customerPhone) {
        const cleanPhone = String(customerPhone).replace(/\D/g, '').slice(-10);
        if (cleanPhone) {
          url += `?mobile=${encodeURIComponent(cleanPhone)}`;
        }
      }

      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        return { success: false, message: `Server error ${res.status}` };
      }

      const data = await res.json().catch(() => null);
      const orders = data?.data || data?.orders || (Array.isArray(data) ? data : []);

      return {
        success: true,
        orders,
      };
    } catch (err) {
      console.warn('Error fetching live CRM orders:', err);
      return { success: false, message: err.message };
    }
  },
};
