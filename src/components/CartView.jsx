import React, { useState, useMemo } from 'react';
import { useBogar } from '../context/BogarContext';
import {
  ShoppingBag,
  Package,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Printer,
  X,
  Calendar,
  Phone,
  Mail,
  FileText,
  Info,
  Sparkles,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Check,
  Truck,
  MapPin,
  Clock,
  Navigation,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import LotusLogo from './LotusLogo';
import { getInitialImageBg } from '../config/imageBgHelper';
import { paymentService } from '../services/paymentService';
import { crmService, DEFAULT_SHIPPING_RATES } from '../services/crmService';

export default function CartView({ onNavigate, onOrderSuccess, initialTab = 'cart' }) {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    checkoutCart,
    createProductOrder,
    currentUser,
    setPendingAction,
    orders,
    cancelOrder,
    removeOrder,
    addToCart,
  } = useBogar();

  const [activeTab, setActiveTab] = useState(initialTab); // 'cart' or 'orders'
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [devoteeName, setDevoteeName] = useState(currentUser?.name || currentUser?.fullName || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [pincode, setPincode] = useState(currentUser?.pincode || '');
  const [shippingRates, setShippingRates] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelNotice, setCancelNotice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gateway'); // 'gateway' | 'cod'
  const [gatewayModalData, setGatewayModalData] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState('ready'); // 'ready' | 'paying' | 'confirm_cancel' | 'cancelled' | 'opened' | 'checking' | 'verify_prompt' | 'success' | 'failed'
  const [gatewayStatusMessage, setGatewayStatusMessage] = useState('');
  const [cancelCountdown, setCancelCountdown] = useState(5);
  const [gatewayError, setGatewayError] = useState('');
  const [desktopNotice, setDesktopNotice] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [selectedUpiType, setSelectedUpiType] = useState('gpay');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCartItemId, setSelectedCartItemId] = useState(null); // ID of specific item opened for dispatch

  // Find the specific active item selected by devotee
  const activeCartItem = useMemo(() => {
    if (!selectedCartItemId) return null;
    return cart.find((c) => c.product.id === selectedCartItemId) || null;
  }, [cart, selectedCartItemId]);

  const activeItemPrice = activeCartItem ? parseFloat(activeCartItem.product.price) || 0 : 0;
  const activeItemQuantity = activeCartItem ? activeCartItem.quantity : 1;
  const activeItemTotal = activeItemPrice * activeItemQuantity;

  // Fetch live shipping charges from CRM API
  React.useEffect(() => {
    crmService.fetchShippingCharges().then((rates) => {
      if (rates && rates.length > 0) {
        setShippingRates(rates);
      }
    });
  }, []);

  // Live Shipping Charge Calculation based on user's location (pincode, city, address) and Subtotal
  const shippingCalculation = useMemo(() => {
    return crmService.calculateShipping({
      subtotal: activeItemTotal,
      pincode,
      city,
      address: deliveryAddress,
      rates: shippingRates,
    });
  }, [activeItemTotal, pincode, city, deliveryAddress, shippingRates]);

  const currentShippingCharge = shippingCalculation.shippingAmount;
  const finalOrderTotal = activeItemTotal + currentShippingCharge;

  // Sync with current user profile if available
  React.useEffect(() => {
    if (currentUser) {
      if (!devoteeName && (currentUser.name || currentUser.fullName)) {
        setDevoteeName(currentUser.name || currentUser.fullName || '');
      }
      if (!phone && currentUser.phone) {
        setPhone(currentUser.phone || '');
      }
      if (!email && currentUser.email) {
        setEmail(currentUser.email || '');
      }
      if (!deliveryAddress && currentUser.address) {
        setDeliveryAddress(currentUser.address || '');
      }
      if (!city && currentUser.city) {
        setCity(currentUser.city || '');
      }
      if (!pincode && currentUser.pincode) {
        setPincode(currentUser.pincode || '');
      }
    }
  }, [currentUser]);

  // Reset selected item if it is no longer in cart
  React.useEffect(() => {
    if (selectedCartItemId && !cart.some((c) => c.product.id === selectedCartItemId)) {
      setSelectedCartItemId(null);
    }
  }, [cart, selectedCartItemId]);

  const handleCancelOrder = (orderId) => {
    if (window.confirm(`Are you sure you want to cancel Order ${orderId}?`)) {
      cancelOrder(orderId);
      setCancelNotice(`Order ${orderId} has been successfully cancelled.`);
      if (selectedOrderForDetails && selectedOrderForDetails.orderId === orderId) {
        setSelectedOrderForDetails((prev) => (prev ? { ...prev, status: 'Cancelled', paymentStatus: 'Cancelled' } : null));
      }
      setTimeout(() => setCancelNotice(''), 4500);
    }
  };

  const handleRemoveOrder = (orderId) => {
    if (window.confirm(`Remove order ${orderId} from your records?`)) {
      if (removeOrder) {
        removeOrder(orderId);
      }
      setCancelNotice(`Order ${orderId} has been removed from My Orders.`);
      if (selectedOrderForDetails && selectedOrderForDetails.orderId === orderId) {
        setSelectedOrderForDetails(null);
      }
      setTimeout(() => setCancelNotice(''), 3500);
    }
  };

  // Modals for "View Details" & "Live Tracking"
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);

  const getTrackingNumber = (orderId) => {
    const cleanId = (orderId || '').replace(/[^0-9A-Z]/gi, '');
    return 'BOG-AWB-' + (cleanId || '784920');
  };

  const getEstimatedDeliveryDate = (orderDateStr, addDays = 2) => {
    try {
      const baseDate = orderDateStr ? new Date(orderDateStr) : new Date();
      baseDate.setDate(baseDate.getDate() + addDays);
      return baseDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return 'Within 2-3 Business Days';
    }
  };

  // Filter ONLY current logged-in user's real orders
  const userOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const userPhone = (currentUser?.phone || currentUser?.mobile || phone || '').replace(/\D/g, '').slice(-10);
    const userEmail = (currentUser?.email || email || '').toLowerCase().trim();
    if (!userPhone && !userEmail) return [];
    return orders.filter((o) => {
      const oPhone = (o.phone || '').replace(/\D/g, '').slice(-10);
      const oEmail = (o.email || '').toLowerCase().trim();
      return (userPhone && oPhone === userPhone) || (userEmail && oEmail === userEmail);
    });
  }, [orders, currentUser, email, phone]);

  // Cart Totals calculation
  const { subtotal, totalItems } = useMemo(() => {
    let sum = 0;
    let count = 0;
    cart.forEach((item) => {
      const price = parseFloat(item.product.price) || 0;
      sum += price * item.quantity;
      count += item.quantity;
    });
    return { subtotal: sum, totalItems: count };
  }, [cart]);

  // Handle Checkout for ONLY the clicked product
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!activeCartItem) return;

    const formEl = e.currentTarget;
    const domName = formEl?.elements?.['cart-devotee-name']?.value || '';
    const domPhone = formEl?.elements?.['cart-phone']?.value || '';
    const domAddress = formEl?.elements?.['cart-address']?.value || '';
    const domCity = formEl?.elements?.['cart-city']?.value || '';
    const domPincode = formEl?.elements?.['cart-pincode']?.value || '';

    const checkoutName = domName || devoteeName || currentUser?.name || currentUser?.fullName || '';
    const checkoutPhone = domPhone || phone || currentUser?.phone || '';
    const checkoutAddress = domAddress || deliveryAddress || currentUser?.address || '';
    const checkoutCity = domCity || city || currentUser?.city || '';
    const checkoutPincode = domPincode || pincode || currentUser?.pincode || '';
    const checkoutState = crmService.detectStateFromLocation({
      pincode: checkoutPincode,
      city: checkoutCity,
      address: checkoutAddress,
    });
    const checkoutEmail = email || currentUser?.email || '';

    if (!checkoutName.trim()) {
      alert('Please enter your name.');
      return;
    }

    if (!checkoutPhone.trim() || checkoutPhone.replace(/\D/g, '').length !== 10) {
      alert('Please enter a valid 10-digit contact mobile number.');
      return;
    }

    if (!checkoutAddress.trim()) {
      alert('Please enter your street / door no and area delivery address.');
      return;
    }

    if (!checkoutCity.trim()) {
      alert('Please enter your City / Town.');
      return;
    }

    if (!checkoutPincode.trim() || checkoutPincode.replace(/\D/g, '').length !== 6) {
      alert('Please enter a valid 6-digit Pincode.');
      return;
    }

    // Calculate exact shipping charge based on user's location and subtotal
    const calc = crmService.calculateShipping({
      subtotal: activeItemTotal,
      pincode: checkoutPincode,
      city: checkoutCity,
      address: checkoutAddress,
      rates: shippingRates,
    });
    const orderShipping = calc.shippingAmount;
    const orderPayableTotal = activeItemTotal + orderShipping;

    setGatewayError('');
    setIsProcessing(true);

    if (paymentMethod === 'gateway') {
      // Connect to Dharani Herbals / Vandanmart Payment Gateway API for this item including shipping
      const payRes = await paymentService.createPaymentOrder({
        amount: orderPayableTotal,
        customerName: checkoutName,
        customerPhone: checkoutPhone,
        customerEmail: checkoutEmail,
        orderId: 'BOGAR-ORD-' + Date.now(),
      });

      setIsProcessing(false);

      if (payRes.success) {
        setGatewayModalData({
          redirectUrl: payRes.redirectUrl,
          merchantTxnId: payRes.merchantTxnId,
          gid: payRes.gid,
          amount: orderPayableTotal,
          subtotal: activeItemTotal,
          shippingCharges: orderShipping,
          customerName: checkoutName,
          customerPhone: checkoutPhone,
          customerEmail: checkoutEmail,
          deliveryAddress: checkoutAddress,
          streetAddress: checkoutAddress,
          city: checkoutCity,
          state: checkoutState,
          pincode: checkoutPincode,
          gateway: payRes.gateway,
          targetProduct: activeCartItem.product,
          targetQuantity: activeCartItem.quantity,
        });
        setGatewayStatus('paying');
        setGatewayStatusMessage('');
      } else {
        setGatewayError(payRes.message || 'Payment Gateway temporary error. You can also select Cash on Delivery.');
      }
    } else {
      // Cash on Delivery for this specific product only
      const res = createProductOrder({
        product: activeCartItem.product,
        quantity: activeCartItem.quantity,
        subtotal: activeItemTotal,
        shippingCharges: orderShipping,
        totalAmount: orderPayableTotal,
        phone: checkoutPhone,
        email: checkoutEmail,
        devoteeName: checkoutName,
        deliveryAddress: checkoutAddress,
        streetAddress: checkoutAddress,
        city: checkoutCity,
        state: checkoutState,
        pincode: checkoutPincode,
        paymentMethod: 'Cash on Delivery',
        transactionId: 'COD-' + Date.now().toString(36).toUpperCase(),
      });
      setIsProcessing(false);

      if (res.success) {
        removeFromCart(activeCartItem.product.id);
        if (checkoutPhone) setPhone(checkoutPhone);
        if (checkoutName) setDevoteeName(checkoutName);
        if (checkoutAddress) setDeliveryAddress(checkoutAddress);
        if (checkoutCity) setCity(checkoutCity);
        if (checkoutPincode) setPincode(checkoutPincode);
        setSelectedCartItemId(null);
        setActiveTab('orders');
        if (res.order) {
          setSelectedOrderForDetails(res.order);
        }
        if (onOrderSuccess) {
          onOrderSuccess(res.order);
        }
      }
    }
  };

  // Background polling for payment status when gateway is active
  React.useEffect(() => {
    if (!gatewayModalData || (gatewayStatus !== 'opened' && gatewayStatus !== 'paying' && gatewayStatus !== 'ready')) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const res = await paymentService.checkPaymentStatus({
          gid: gatewayModalData.gid,
          merchantTxnId: gatewayModalData.merchantTxnId,
          customerPhone: gatewayModalData.customerPhone,
        });

        if (res.paymentStatus === 'success') {
          clearInterval(interval);
          setGatewayStatus('success');
          setGatewayStatusMessage('Payment verified successfully from Dharani Herbals Gateway!');
        } else if (res.paymentStatus === 'failed') {
          clearInterval(interval);
          handleConfirmCancel();
        }
      } catch (err) {
        console.warn('Polling status error:', err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [gatewayModalData, gatewayStatus]);

  // Listen for message events from payment iframe (if supported by gateway)
  React.useEffect(() => {
    if (!gatewayModalData || (gatewayStatus !== 'paying' && gatewayStatus !== 'ready')) return;

    const handleWindowMessage = (event) => {
      try {
        const data = event.data;
        if (!data) return;
        if (typeof data === 'string') {
          if (data.includes('PAYMENT_SUCCESS') || data.toLowerCase().includes('success')) {
            setGatewayStatus('success');
          } else if (data.includes('CUSTOMER_CANCELLED') || data.toLowerCase().includes('cancel') || data.toLowerCase().includes('failed')) {
            handleConfirmCancel();
          }
        } else if (typeof data === 'object') {
          if (data.status === 'success' || data.event === 'payment.success') {
            setGatewayStatus('success');
          } else if (data.status === 'failed' || data.status === 'cancelled' || data.event === 'payment.cancelled') {
            handleConfirmCancel();
          }
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [gatewayModalData, gatewayStatus]);

  // 5-second auto-redirect countdown for Payment Cancelled screen (Reference Image 2)
  React.useEffect(() => {
    if (gatewayStatus !== 'cancelled') return;

    setCancelCountdown(5);
    const interval = setInterval(() => {
      setCancelCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGatewayModalData(null);
          setGatewayStatus('ready');
          setActiveTab('orders'); // Show My Orders live with cancelled order!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gatewayStatus]);

  // When gateway status turns to success, automatically finalize order after 2.2s
  React.useEffect(() => {
    if (gatewayStatus === 'success' && gatewayModalData) {
      const timer = setTimeout(() => {
        handleGatewaySuccess();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [gatewayStatus, gatewayModalData]);

  const upiQrUri = useMemo(() => {
    if (!gatewayModalData) return '';
    const amountStr = gatewayModalData.amount.toFixed(2);
    const txnId = gatewayModalData.merchantTxnId || ('BOGAR' + Date.now());
    return `upi://pay?pa=apoonkodipay@kotakpay&pn=${encodeURIComponent('Dharani Herbals')}&mc=5499&tr=${txnId}&am=${amountStr}&cu=INR&tn=${encodeURIComponent('Bogar Sacred Order')}`;
  }, [gatewayModalData]);

  const getUpiUriForApp = (appType) => {
    if (!gatewayModalData) return '';
    const amountStr = gatewayModalData.amount.toFixed(2);
    const txnId = gatewayModalData.merchantTxnId || ('BOGAR' + Date.now());
    const payeeVpa = 'apoonkodipay@kotakpay';
    const payeeName = 'Dharani Herbals';
    const note = 'Bogar Sacred Order';

    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      if (appType === 'gpay') {
        return `intent://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&mc=5499&tr=${txnId}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(note)}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end;`;
      }
      if (appType === 'phonepe') {
        return `intent://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&mc=5499&tr=${txnId}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(note)}#Intent;scheme=upi;package=com.phonepe.app;end;`;
      }
      if (appType === 'paytm') {
        return `intent://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&mc=5499&tr=${txnId}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(note)}#Intent;scheme=upi;package=net.one97.paytm;end;`;
      }
      return `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&mc=5499&tr=${txnId}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(note)}`;
    }

    // Standard NPCI UPI URI
    return `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&mc=5499&tr=${txnId}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  const handleLaunchUpiApp = (appType) => {
    if (!gatewayModalData) return;
    const amountStr = gatewayModalData.amount.toFixed(2);
    const appDisplayName = appType === 'gpay' ? 'Google Pay' : appType === 'phonepe' ? 'PhonePe' : appType === 'paytm' ? 'Paytm' : 'UPI App';
    setSelectedUpiApp(appDisplayName);
    setSelectedUpiType(appType);
    setGatewayStatus('upi_waiting');
    setGatewayStatusMessage(`Paying ₹${amountStr} via ${appDisplayName}...`);

    const payeeVpa = 'apoonkodipay@kotakpay';
    try {
      navigator.clipboard?.writeText(payeeVpa);
      setCopiedVpa(true);
    } catch (e) {}

    // Check if on Desktop / Windows PC
    const isDesktopPc =
      /Windows|Win32|Win64|Macintosh|MacIntel|Linux x86_64/i.test(navigator.userAgent) ||
      (typeof navigator.platform === 'string' && /Win|Mac/i.test(navigator.platform)) ||
      (window.navigator?.userAgentData?.platform === 'Windows') ||
      (window.navigator?.userAgentData?.platform === 'macOS');

    if (isDesktopPc) {
      // On desktop, do not trigger native mobile app scheme to prevent browser unregistered scheme error
      return;
    }

    // On real Android / iOS mobile: directly launch the native UPI app!
    const targetUri = getUpiUriForApp(appType);
    window.location.href = targetUri;
  };

  const handleRequestCancel = () => {
    setGatewayStatus('confirm_cancel');
  };

  const handleConfirmCancel = () => {
    if (gatewayModalData) {
      const targetProd = gatewayModalData.targetProduct || activeCartItem?.product;
      const targetQty = gatewayModalData.targetQuantity || activeCartItem?.quantity || 1;

      if (gatewayModalData.customerPhone) setPhone(gatewayModalData.customerPhone);
      if (gatewayModalData.customerEmail) setEmail(gatewayModalData.customerEmail);
      if (gatewayModalData.customerName) setDevoteeName(gatewayModalData.customerName);
      if (gatewayModalData.deliveryAddress) setDeliveryAddress(gatewayModalData.deliveryAddress);
      if (gatewayModalData.city) setCity(gatewayModalData.city);
      if (gatewayModalData.pincode) setPincode(gatewayModalData.pincode);

      // Create a live record in My Orders with status 'Cancelled'
      createProductOrder({
        product: targetProd,
        quantity: targetQty,
        subtotal: gatewayModalData.subtotal,
        shippingCharges: gatewayModalData.shippingCharges,
        totalAmount: gatewayModalData.amount,
        phone: gatewayModalData.customerPhone,
        email: gatewayModalData.customerEmail,
        devoteeName: gatewayModalData.customerName,
        deliveryAddress: gatewayModalData.deliveryAddress,
        streetAddress: gatewayModalData.streetAddress || gatewayModalData.deliveryAddress,
        city: gatewayModalData.city,
        state: gatewayModalData.state,
        pincode: gatewayModalData.pincode,
        paymentMethod: 'Online Payment Gateway',
        transactionId: gatewayModalData.merchantTxnId,
        status: 'Cancelled',
        paymentStatus: 'Cancelled',
      });
    }

    setGatewayStatus('cancelled');
    setGatewayStatusMessage('Payment cancelled by customer.');
  };

  const handleReturnToPayment = () => {
    setGatewayStatus('ready');
  };

  const handleReturnToBogar = () => {
    setGatewayModalData(null);
    setGatewayStatus('ready');
    setActiveTab('orders'); // Show My Orders live!
  };

  const handleManualCheckStatus = async () => {
    if (!gatewayModalData) return;
    setGatewayStatus('checking');
    try {
      const res = await paymentService.checkPaymentStatus({
        gid: gatewayModalData.gid,
        merchantTxnId: gatewayModalData.merchantTxnId,
        customerPhone: gatewayModalData.customerPhone,
      });

      if (res.paymentStatus === 'success') {
        setGatewayStatus('success');
        setGatewayStatusMessage('Payment verified successfully from Dharani Herbals Gateway!');
      } else if (res.paymentStatus === 'failed') {
        setGatewayStatus('cancelled');
        setGatewayStatusMessage('Payment was cancelled or failed.');
      } else {
        setGatewayStatus('verify_prompt');
      }
    } catch {
      setGatewayStatus('verify_prompt');
    }
  };

  const handleUserMarkPaid = () => {
    setGatewayStatus('success');
    setGatewayStatusMessage('Payment confirmed by devotee.');
  };

  const handleUserMarkFailed = () => {
    setGatewayStatus('cancelled');
    setGatewayStatusMessage('Payment cancelled.');
  };

  const handleSwitchToCodFromGateway = () => {
    if (!gatewayModalData) return;
    const targetProd = gatewayModalData.targetProduct || activeCartItem?.product;
    const targetQty = gatewayModalData.targetQuantity || activeCartItem?.quantity || 1;

    const res = createProductOrder({
      product: targetProd,
      quantity: targetQty,
      subtotal: gatewayModalData.subtotal,
      shippingCharges: gatewayModalData.shippingCharges,
      totalAmount: gatewayModalData.amount,
      phone: gatewayModalData.customerPhone,
      email: gatewayModalData.customerEmail,
      devoteeName: gatewayModalData.customerName,
      deliveryAddress: gatewayModalData.deliveryAddress,
      streetAddress: gatewayModalData.streetAddress || gatewayModalData.deliveryAddress,
      city: gatewayModalData.city,
      state: gatewayModalData.state,
      pincode: gatewayModalData.pincode,
      paymentMethod: 'Cash on Delivery',
      transactionId: 'COD-' + Date.now().toString(36).toUpperCase(),
    });

    if (targetProd?.id) {
      removeFromCart(targetProd.id);
    }

    setGatewayModalData(null);
    setGatewayStatus('ready');

    if (res.success) {
      setSelectedCartItemId(null);
      setActiveTab('orders');
      if (res.order) {
        setSelectedOrderForDetails(res.order);
      }
      if (onOrderSuccess) {
        onOrderSuccess(res.order);
      }
    }
  };

  const handleRetryGateway = () => {
    setGatewayStatus('ready');
    setGatewayStatusMessage('');
  };

  const handleGatewaySuccess = () => {
    if (!gatewayModalData) return;
    const targetProd = gatewayModalData.targetProduct || activeCartItem?.product;
    const targetQty = gatewayModalData.targetQuantity || activeCartItem?.quantity || 1;

    const res = createProductOrder({
      product: targetProd,
      quantity: targetQty,
      subtotal: gatewayModalData.subtotal,
      shippingCharges: gatewayModalData.shippingCharges,
      totalAmount: gatewayModalData.amount,
      phone: gatewayModalData.customerPhone,
      email: gatewayModalData.customerEmail,
      devoteeName: gatewayModalData.customerName,
      deliveryAddress: gatewayModalData.deliveryAddress,
      streetAddress: gatewayModalData.streetAddress || gatewayModalData.deliveryAddress,
      city: gatewayModalData.city,
      state: gatewayModalData.state,
      pincode: gatewayModalData.pincode,
      paymentMethod: 'PayGlocal / Online Gateway (Paid)',
      transactionId: gatewayModalData.merchantTxnId,
      status: 'Confirmed',
      paymentStatus: 'Paid',
    });

    if (targetProd?.id) {
      removeFromCart(targetProd.id);
    }

    setGatewayModalData(null);
    setGatewayStatus('ready');

    if (res.success) {
      if (gatewayModalData.customerPhone) setPhone(gatewayModalData.customerPhone);
      if (gatewayModalData.customerEmail) setEmail(gatewayModalData.customerEmail);
      if (gatewayModalData.customerName) setDevoteeName(gatewayModalData.customerName);
      if (gatewayModalData.deliveryAddress) setDeliveryAddress(gatewayModalData.deliveryAddress);
      setSelectedCartItemId(null);
      setActiveTab('orders');
      if (res.order) {
        setSelectedOrderForDetails(res.order);
      }
      if (onOrderSuccess) {
        onOrderSuccess(res.order);
      }
    }
  };

  const handlePrintReceipt = (order) => {
    setSelectedOrderForDetails(order);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="bogar-cart-page">
      <div className="bogar-cart-container">
        {/* Navigation & Header */}
        <div className="bogar-cart-header">
          <button
            type="button"
            className="bogar-cart-back-btn"
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          <div className="bogar-cart-title-wrapper">
            <LotusLogo size={32} color="#D4B675" />
            <h1 className="bogar-cart-title">Sacred Cart & Orders</h1>
          </div>
          <p className="bogar-cart-subtitle">
            Manage your sacred offerings and review your verified purchase records
          </p>

          {/* Unified Tabs on the SAME Page */}
          <div className="bogar-cart-tabs" role="tablist" aria-label="Cart and Orders Navigation">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'cart'}
              className={`bogar-cart-tab-btn ${
                activeTab === 'cart' ? 'bogar-cart-tab-btn--active' : ''
              }`}
              onClick={() => setActiveTab('cart')}
            >
              <ShoppingBag size={18} />
              <span>YOUR CART</span>
              {cart.length > 0 && (
                <span className="bogar-cart-tab-badge">{cart.length}</span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'orders'}
              className={`bogar-cart-tab-btn ${
                activeTab === 'orders' ? 'bogar-cart-tab-btn--active' : ''
              }`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} />
              <span>MY ORDERS</span>
              {userOrders.length > 0 && (
                <span className="bogar-cart-tab-badge">{userOrders.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* ==========================================================
            TAB 1: YOUR CART
            ========================================================== */}
        {activeTab === 'cart' && (
          <div className="bogar-cart-tab-panel">
            {cart.length === 0 ? (
              <div className="bogar-empty-state">
                <div className="bogar-empty-state__icon-wrap">
                  <ShoppingBag size={48} color="#D4B675" />
                </div>
                <h2 className="bogar-empty-state__title">Your cart is currently empty.</h2>
                <p className="bogar-empty-state__desc">
                  Explore our sacred temple collections of tea powders, wholesome foods, hair elixirs,
                  herbal skin remedies, and devotional adornments.
                </p>
                <button
                  type="button"
                  className="bogar-btn-book bogar-btn-book--hero"
                  onClick={() => onNavigate('home')}
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              <div className="bogar-cart-content-wrapper">
                {/* 1. Standalone Product List: Shown when NO product is clicked yet */}
                {!activeCartItem && (
                  <div className="bogar-cart-items-column bogar-cart-items-column--standalone">
                    <div className="bogar-cart-items-header">
                      <h2 className="bogar-cart-section-title">
                        My Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                      </h2>
                      <span className="bogar-cart-items-note">
                        Click on any product to proceed to its dispatch & order details
                      </span>
                    </div>

                    <div className="bogar-cart-items-list">
                      {cart.map((item) => {
                        const unitPrice = parseFloat(item.product.price) || 0;
                        const itemTotal = unitPrice * item.quantity;
                        const category =
                          item.product.categoryLabel ||
                          item.product.category ||
                          item.product.categoryId ||
                          'Sacred Offering';

                        const itemBg = getInitialImageBg(
                          item.product.image,
                          item.product.fallbackImage
                        );

                        return (
                          <div
                            key={item.id}
                            className="bogar-cart-card bogar-cart-card--clickable"
                            onClick={() => setSelectedCartItemId(item.product.id)}
                            title={`Click to checkout ${item.product.name}`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedCartItemId(item.product.id);
                              }
                            }}
                          >
                            {/* 1. Product Image */}
                            <div
                              className="bogar-cart-card__media"
                              style={{ backgroundColor: itemBg }}
                            >
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="bogar-cart-card__img"
                                onError={(e) => {
                                  if (
                                    item.product.fallbackImage &&
                                    e.currentTarget.src !== item.product.fallbackImage
                                  ) {
                                    e.currentTarget.src = item.product.fallbackImage;
                                  }
                                }}
                              />
                            </div>

                            {/* 2. Product Details */}
                            <div className="bogar-cart-card__content">
                              <div className="bogar-cart-card__top">
                                <span className="bogar-cart-card__category">{category}</span>
                                <h3 className="bogar-cart-card__name">{item.product.name}</h3>
                                <p className="bogar-cart-card__desc">
                                  {item.product.shortDescription || item.product.description}
                                </p>
                              </div>

                              {/* 3. Pricing: Individual & Total */}
                              <div className="bogar-cart-card__pricing">
                                <div className="bogar-cart-card__price-row">
                                  <span className="bogar-cart-card__price-label">Price:</span>
                                  <span className="bogar-cart-card__price-value">
                                    ₹{unitPrice.toFixed(2)}
                                  </span>
                                </div>
                                <div className="bogar-cart-card__price-row bogar-cart-card__price-row--total">
                                  <span className="bogar-cart-card__price-label">Item Total:</span>
                                  <span className="bogar-cart-card__price-value bogar-cart-card__price-value--bold">
                                    ₹{itemTotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              {/* 4. Controls: Quantity - / +, View Details, Remove, Order */}
                              <div className="bogar-cart-card__actions">
                                <div className="bogar-cart-card__qty-group">
                                  <span className="bogar-cart-card__qty-label">Qty:</span>
                                  <div className="bogar-qty-box" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      className="bogar-qty-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateCartQuantity(item.product.id, item.quantity - 1);
                                      }}
                                      aria-label={`Decrease quantity of ${item.product.name}`}
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <span className="bogar-qty-value">{item.quantity}</span>
                                    <button
                                      type="button"
                                      className="bogar-qty-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateCartQuantity(item.product.id, item.quantity + 1);
                                      }}
                                      aria-label={`Increase quantity of ${item.product.name}`}
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </div>

                                <div className="bogar-cart-card__buttons">
                                  <button
                                    type="button"
                                    className="bogar-cart-btn-details"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProductForDetails(item.product);
                                    }}
                                    aria-label={`View Details for ${item.product.name}`}
                                  >
                                    <Info size={14} />
                                    <span>Details</span>
                                  </button>

                                  <button
                                    type="button"
                                    className="bogar-cart-btn-remove"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromCart(item.product.id);
                                    }}
                                    aria-label={`Remove ${item.product.name} from cart`}
                                  >
                                    <Trash2 size={14} />
                                    <span>Remove</span>
                                  </button>

                                  <button
                                    type="button"
                                    className="bogar-cart-btn-proceed-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCartItemId(item.product.id);
                                    }}
                                    title={`Order ${item.product.name}`}
                                  >
                                    <Sparkles size={13} />
                                    <span>Order</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Dispatch & Order Summary: Opens ONLY for the clicked product */}
                {activeCartItem && (
                  <div className="bogar-single-dispatch-container" id="bogar-dispatch-summary">
                    <div className="bogar-cart-summary-card bogar-cart-summary-card--single-view">
                      <div className="bogar-cart-summary-nav">
                        <button
                          type="button"
                          className="bogar-cart-back-to-items-btn"
                          onClick={() => setSelectedCartItemId(null)}
                          aria-label="Back to My Cart"
                        >
                          <ArrowLeft size={15} />
                          <span>Back to My Cart</span>
                        </button>
                        <span className="bogar-cart-step-pill">Product Dispatch & Checkout</span>
                      </div>

                      {/* Selected Item Preview */}
                      <div className="bogar-selected-item-card">
                        <div
                          className="bogar-selected-item-media"
                          style={{
                            backgroundColor: getInitialImageBg(
                              activeCartItem.product.image,
                              activeCartItem.product.fallbackImage
                            ),
                          }}
                        >
                          <img
                            src={activeCartItem.product.image}
                            alt={activeCartItem.product.name}
                            className="bogar-selected-item-img"
                            onError={(e) => {
                              if (
                                activeCartItem.product.fallbackImage &&
                                e.currentTarget.src !== activeCartItem.product.fallbackImage
                              ) {
                                e.currentTarget.src = activeCartItem.product.fallbackImage;
                              }
                            }}
                          />
                        </div>
                        <div className="bogar-selected-item-info">
                          <span className="bogar-cart-card__category">
                            {activeCartItem.product.categoryLabel ||
                              activeCartItem.product.category ||
                              'Sacred Offering'}
                          </span>
                          <h3 className="bogar-selected-item-title">
                            {activeCartItem.product.name}
                          </h3>
                          <div className="bogar-selected-item-meta">
                            <span>Qty: <strong>{activeCartItem.quantity}</strong></span>
                            <span>•</span>
                            <span>Unit: <strong>₹{activeItemPrice.toFixed(2)}</strong></span>
                            <span>•</span>
                            <span className="bogar-selected-item-highlight">
                              Subtotal: <strong>₹{activeItemTotal.toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <h2 className="bogar-cart-summary__title" style={{ marginTop: '1.25rem' }}>
                        Dispatch & Order Summary
                      </h2>

                      {/* Summary Breakdown ONLY for this selected product */}
                      <div className="bogar-cart-summary__breakdown">
                        <div className="bogar-summary-row">
                          <span>Selected Product</span>
                          <strong>{activeCartItem.product.name}</strong>
                        </div>
                        <div className="bogar-summary-row">
                          <span>Quantity</span>
                          <span>{activeCartItem.quantity}</span>
                        </div>
                        <div className="bogar-summary-row">
                          <span>Product Subtotal</span>
                          <span>₹{activeItemTotal.toFixed(2)}</span>
                        </div>
                        <div className="bogar-summary-row">
                          <span>Shipping Charges ({shippingCalculation.stateName})</span>
                          <span
                            className={shippingCalculation.isFree ? 'bogar-summary-highlight' : ''}
                            style={{
                              fontWeight: '700',
                              color: shippingCalculation.isFree ? '#10B981' : '#D4B675',
                            }}
                          >
                            {shippingCalculation.isFree ? 'FREE' : `₹${currentShippingCharge.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="bogar-summary-divider" />
                        <div className="bogar-summary-row bogar-summary-row--total">
                          <strong>Total Amount</strong>
                          <strong className="bogar-summary-total-amt">
                            ₹{finalOrderTotal.toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      <form onSubmit={handleCheckout} className="bogar-cart-summary__form">
                        <div className="bogar-form-group">
                          <label htmlFor="cart-devotee-name">Devotee Name</label>
                          <input
                            id="cart-devotee-name"
                            name="cart-devotee-name"
                            type="text"
                            required
                            placeholder="Enter your name"
                            value={devoteeName}
                            onChange={(e) => setDevoteeName(e.target.value)}
                            className="bogar-form-input"
                          />
                        </div>

                        <div className="bogar-form-group">
                          <label htmlFor="cart-phone">Contact Phone Number</label>
                          <input
                            id="cart-phone"
                            name="cart-phone"
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            placeholder="Enter 10-digit mobile number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bogar-form-input"
                          />
                        </div>

                        <div className="bogar-form-group">
                          <label htmlFor="cart-address">Street / Door No & Area</label>
                          <input
                            id="cart-address"
                            name="cart-address"
                            type="text"
                            required
                            placeholder="Door No, Street Name, Area / Landmark"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="bogar-form-input"
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div className="bogar-form-group">
                            <label htmlFor="cart-city">City / Town</label>
                            <input
                              id="cart-city"
                              name="cart-city"
                              type="text"
                              required
                              placeholder="City / Town"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="bogar-form-input"
                            />
                          </div>
                          <div className="bogar-form-group">
                            <label htmlFor="cart-pincode">Pincode</label>
                            <input
                              id="cart-pincode"
                              name="cart-pincode"
                              type="text"
                              required
                              pattern="[0-9]{6}"
                              placeholder="6-digit Pincode"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              className="bogar-form-input"
                            />
                          </div>
                        </div>

                        {/* Auto-detected Shipping Charge based on user's location */}
                        <div style={{
                          margin: '0.75rem 0 1rem 0',
                          padding: '10px 14px',
                          background: 'rgba(212, 182, 117, 0.08)',
                          border: '1px solid rgba(212, 182, 117, 0.25)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E5D5B8', fontSize: '0.85rem' }}>
                            <MapPin size={16} color="#D4B675" style={{ flexShrink: 0 }} />
                            <span>
                              {pincode || city ? (
                                <>Delivery to: <strong style={{ color: '#F5EEDB' }}>{shippingCalculation.stateName}</strong></>
                              ) : (
                                <span style={{ color: '#9CA3AF' }}>Enter Pincode / City to compute shipping</span>
                              )}
                            </span>
                          </div>
                          <span style={{
                            fontWeight: '700',
                            fontSize: '0.88rem',
                            color: shippingCalculation.isFree ? '#10B981' : '#D4B675',
                            whiteSpace: 'nowrap',
                          }}>
                            {shippingCalculation.isFree ? '🎉 FREE Delivery' : `+ ₹${currentShippingCharge.toFixed(2)} Shipping`}
                          </span>
                        </div>
                        {shippingCalculation.freeAbove > activeItemTotal && !shippingCalculation.isFree && (
                          <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '-0.5rem', marginBottom: '1rem', paddingLeft: '4px' }}>
                            💡 Add ₹{(shippingCalculation.freeAbove - activeItemTotal).toFixed(2)} more for FREE shipping in {shippingCalculation.stateName}!
                          </div>
                        )}

                        {/* Payment Method Selector */}
                        <div className="bogar-form-group">
                          <label>Select Payment Method</label>
                          <div className="bogar-payment-options">
                            <label
                              className={`bogar-payment-option ${
                                paymentMethod === 'gateway' ? 'bogar-payment-option--active' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="gateway"
                                checked={paymentMethod === 'gateway'}
                                onChange={() => setPaymentMethod('gateway')}
                                className="bogar-payment-radio"
                              />
                              <div className="bogar-payment-option__info">
                                <div className="bogar-payment-option__title-row">
                                  <CreditCard size={17} color="#D4B675" />
                                  <strong>Online Payment Gateway</strong>
                                  <span className="bogar-payment-badge">LIVE API</span>
                                </div>
                                <span className="bogar-payment-option__desc">
                                  UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking
                                </span>
                              </div>
                            </label>

                            <label
                              className={`bogar-payment-option ${
                                paymentMethod === 'cod' ? 'bogar-payment-option--active' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                                className="bogar-payment-radio"
                              />
                              <div className="bogar-payment-option__info">
                                <div className="bogar-payment-option__title-row">
                                  <Package size={17} color="#D4B675" />
                                  <strong>Cash on Delivery</strong>
                                </div>
                                <span className="bogar-payment-option__desc">
                                  Pay in cash upon delivery of your products
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {gatewayError && (
                          <div className="bogar-alert bogar-alert--error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                            <span>{gatewayError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="bogar-btn-book bogar-btn-book--full"
                        >
                          {paymentMethod === 'gateway' ? (
                            <>
                              <CreditCard size={16} />
                              <span>
                                {isProcessing
                                  ? 'Connecting to Payment Gateway...'
                                  : `Proceed to Payment Gateway • ₹${finalOrderTotal.toFixed(2)}`}
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              <span>
                                {isProcessing
                                  ? 'Processing Order...'
                                  : `Place Order (Cash on Delivery) • ₹${finalOrderTotal.toFixed(2)}`}
                              </span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
            TAB 2: MY ORDERS
            ========================================================== */}
        {activeTab === 'orders' && (
          <div className="bogar-cart-tab-panel">
            {!currentUser && userOrders.length === 0 ? (
              <div className="bogar-empty-state">
                <div className="bogar-empty-state__icon-wrap">
                  <Package size={48} color="#D4B675" />
                </div>
                <h2 className="bogar-empty-state__title">Devotee Authentication Required</h2>
                <p className="bogar-empty-state__desc">
                  Please log in or create your devotee account to view your confirmed product orders
                  and receipt downloads.
                </p>
                <div className="bogar-empty-state__actions">
                  <button
                    type="button"
                    className="bogar-btn-book bogar-btn-book--hero"
                    onClick={() => onNavigate('login')}
                  >
                    Login / Sign Up
                  </button>
                </div>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="bogar-empty-state">
                <div className="bogar-empty-state__icon-wrap">
                  <Package size={48} color="#D4B675" />
                </div>
                <h2 className="bogar-empty-state__title">No Purchased Orders Found</h2>
                <p className="bogar-empty-state__desc">
                  You have not purchased any products yet. As soon as you complete an order from
                  your Sacred Cart, it will appear here with full receipt details.
                </p>
                <button
                  type="button"
                  className="bogar-btn-book bogar-btn-book--hero"
                  onClick={() => setActiveTab('cart')}
                >
                  Return to Your Cart
                </button>
              </div>
            ) : (
              <div className="bogar-orders-section">
                <div className="bogar-orders-header">
                  <h2 className="bogar-cart-section-title">
                    Your Purchased Orders ({userOrders.length}{' '}
                    {userOrders.length === 1 ? 'order' : 'orders'})
                  </h2>
                  <p className="bogar-orders-subtitle">
                    Official verified purchase records for devotee{' '}
                    <strong>{currentUser?.name || currentUser?.email || email}</strong>
                  </p>
                </div>

                {cancelNotice && (
                  <div className="bogar-auth-alert bogar-auth-alert--success" style={{ marginBottom: '1rem' }}>
                    {cancelNotice}
                  </div>
                )}

                <div className="bogar-orders-list">
                  {userOrders.map((order) => {
                    const orderProduct = order.product;
                    const orderImg =
                      orderProduct?.image ||
                      order.image ||
                      '/assets/images/temple_herbal_leaf.png';
                    const orderBg = getInitialImageBg(orderImg);

                    return (
                      <div key={order.orderId} className="bogar-order-card">
                        <div className="bogar-order-card__header">
                          <div className="bogar-order-card__id-badge">
                            <span className="bogar-order-label">ORDER ID:</span>
                            <strong className="bogar-order-id">{order.orderId}</strong>
                          </div>
                          <div
                            className={`bogar-order-status-badge ${order.status === 'Cancelled' ? 'bogar-order-status-badge--cancelled' : ''}`}
                          >
                            {order.status === 'Cancelled' ? (
                              <>
                                <XCircle size={14} color="#E63946" />
                                <span>Cancelled</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={14} />
                                <span>{order.status || 'Confirmed'}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bogar-order-card__body">
                          {/* Product Image */}
                          <div
                            className="bogar-order-card__media"
                            style={{ backgroundColor: orderBg }}
                          >
                            <img
                              src={orderImg}
                              alt={order.productName}
                              className="bogar-order-card__img"
                            />
                          </div>

                          {/* Order Details */}
                          <div className="bogar-order-card__info">
                            <h3 className="bogar-order-card__title">{order.productName}</h3>

                            <div className="bogar-order-meta-grid">
                              <div className="bogar-order-meta-item">
                                <span className="bogar-order-meta-label">Quantity:</span>
                                <strong className="bogar-order-meta-val">{order.quantity}</strong>
                              </div>
                              <div className="bogar-order-meta-item">
                                <span className="bogar-order-meta-label">Order Date:</span>
                                <strong className="bogar-order-meta-val">{order.orderDate}</strong>
                              </div>
                              <div className="bogar-order-meta-item">
                                <span className="bogar-order-meta-label">Phone:</span>
                                <strong className="bogar-order-meta-val">{order.phone}</strong>
                              </div>
                              <div className="bogar-order-meta-item">
                                <span className="bogar-order-meta-label">Email:</span>
                                <strong className="bogar-order-meta-val">{order.email}</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="bogar-order-card__actions">
                          <button
                            type="button"
                            className="bogar-btn-order-action bogar-btn-order-action--track"
                            onClick={() => setSelectedOrderForTracking(order)}
                            aria-label={`Live Tracking for ${order.orderId}`}
                          >
                            <Truck size={15} />
                            <span>Live Tracking</span>
                            <span className="bogar-live-pulse-dot" />
                          </button>

                          <button
                            type="button"
                            className="bogar-btn-order-action bogar-btn-order-action--view"
                            onClick={() => setSelectedOrderForDetails(order)}
                            aria-label={`View Details for ${order.orderId}`}
                          >
                            <Eye size={15} />
                            <span>View Details</span>
                          </button>

                          {order.status === 'Cancelled' ? (
                            <button
                              type="button"
                              className="bogar-btn-order-action bogar-btn-order-action--remove"
                              onClick={() => handleRemoveOrder(order.orderId)}
                              aria-label={`Remove Order ${order.orderId}`}
                            >
                              <Trash2 size={15} />
                              <span>Remove</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="bogar-btn-order-action bogar-btn-order-action--cancel"
                              onClick={() => handleCancelOrder(order.orderId)}
                              aria-label={`Cancel Order for ${order.orderId}`}
                            >
                              <XCircle size={15} />
                              <span>Cancel Order</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==========================================================
          MODAL 1: COMPLETE PRODUCT DETAILS ("View Details")
          ========================================================== */}
      {selectedProductForDetails && (
        <div
          className="bogar-modal-backdrop"
          onClick={() => setSelectedProductForDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bogar-modal-card bogar-modal-card--product-details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bogar-modal-card__header">
              <div className="bogar-modal-card__brand">
                <LotusLogo size={24} color="#D4B675" />
                <div>
                  <h3 className="bogar-modal-card__title">Product Details</h3>
                  <p className="bogar-modal-card__tagline">
                    {selectedProductForDetails.categoryLabel ||
                      selectedProductForDetails.category ||
                      'Sacred Herbal Offering'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="bogar-modal-card__close"
                onClick={() => setSelectedProductForDetails(null)}
                aria-label="Close product details dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bogar-modal-card__body bogar-product-modal-body">
              <div
                className="bogar-product-modal-media"
                style={{
                  backgroundColor: getInitialImageBg(
                    selectedProductForDetails.image,
                    selectedProductForDetails.fallbackImage
                  ),
                }}
              >
                <img
                  src={selectedProductForDetails.image}
                  alt={selectedProductForDetails.name}
                  className="bogar-product-modal-img"
                  onError={(e) => {
                    if (
                      selectedProductForDetails.fallbackImage &&
                      e.currentTarget.src !== selectedProductForDetails.fallbackImage
                    ) {
                      e.currentTarget.src = selectedProductForDetails.fallbackImage;
                    }
                  }}
                />
              </div>

              <div className="bogar-product-modal-info">
                <h2 className="bogar-product-modal-name">{selectedProductForDetails.name}</h2>

                <div className="bogar-product-modal-price-wrap">
                  <span className="bogar-product-modal-currency">₹</span>
                  <span className="bogar-product-modal-price">
                    {parseFloat(selectedProductForDetails.price || 0).toFixed(2)}
                  </span>
                </div>

                <div className="bogar-product-modal-section">
                  <h4 className="bogar-modal-subtitle">Description</h4>
                  <p className="bogar-product-modal-desc">
                    {selectedProductForDetails.fullDescription ||
                      selectedProductForDetails.description ||
                      selectedProductForDetails.shortDescription}
                  </p>
                </div>

                {selectedProductForDetails.shortDescription &&
                  selectedProductForDetails.fullDescription && (
                    <div className="bogar-product-modal-section">
                      <h4 className="bogar-modal-subtitle">Sacred Formulation</h4>
                      <p className="bogar-product-modal-subdesc">
                        {selectedProductForDetails.shortDescription}
                      </p>
                    </div>
                  )}

                <div className="bogar-product-modal-actions">
                  <button
                    type="button"
                    className="bogar-btn-book bogar-btn-book--hero"
                    onClick={() => {
                      addToCart(selectedProductForDetails, 1);
                      setSelectedProductForDetails(null);
                    }}
                  >
                    <ShoppingBag size={16} />
                    <span>Add Another to Cart</span>
                  </button>
                  <button
                    type="button"
                    className="bogar-btn-secondary"
                    onClick={() => setSelectedProductForDetails(null)}
                  >
                    <span>Back to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 2: COMPLETE ORDER DETAILS ("View Details")
          ========================================================== */}
      {selectedOrderForDetails && (
        <div
          className="bogar-modal-backdrop"
          onClick={() => setSelectedOrderForDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bogar-modal-card bogar-modal-card--order-details"
            onClick={(e) => e.stopPropagation()}
            id="bogar-order-details-printable"
          >
            <div className="bogar-modal-card__header">
              <div className="bogar-modal-card__brand">
                <LotusLogo size={28} color="#D4B675" />
                <div>
                  <h3 className="bogar-modal-card__title">Order Details & Receipt</h3>
                  <p className="bogar-modal-card__tagline">BOGAR Sacred Heritage Delivery</p>
                </div>
              </div>
              <button
                type="button"
                className="bogar-modal-card__close"
                onClick={() => setSelectedOrderForDetails(null)}
                aria-label="Close order details dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bogar-modal-card__body bogar-order-modal-body">
              <div className="bogar-order-modal-receipt-header">
                <div className="bogar-order-badge-row">
                  <span className="bogar-order-pill">OFFICIAL DEVOTEE RECEIPT</span>
                  <div
                    className={`bogar-order-status-badge ${selectedOrderForDetails.status === 'Cancelled' ? 'bogar-order-status-badge--cancelled' : ''}`}
                    style={selectedOrderForDetails.status === 'Cancelled' ? { background: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444', color: '#EF4444' } : {}}
                  >
                    {selectedOrderForDetails.status === 'Cancelled' ? (
                      <>
                        <XCircle size={14} color="#EF4444" />
                        <span>Cancelled</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>{selectedOrderForDetails.status || 'Confirmed'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bogar-order-modal-rows">
                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Order ID:</span>
                  <strong className="bogar-order-row__val bogar-order-row__val--highlight">
                    {selectedOrderForDetails.orderId}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Product Name:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.productName}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Quantity:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.quantity}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Order Date:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.orderDate}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Contact Phone:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.phone}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Contact Email:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.email}
                  </strong>
                </div>

                {selectedOrderForDetails.deliveryAddress && (
                  <div className="bogar-order-row">
                    <span className="bogar-order-row__label">Delivery Address:</span>
                    <strong
                      className="bogar-order-row__val"
                      style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                    >
                      {selectedOrderForDetails.deliveryAddress}
                    </strong>
                  </div>
                )}

                {selectedOrderForDetails.paymentMethod && (
                  <div className="bogar-order-row">
                    <span className="bogar-order-row__label">Payment Method:</span>
                    <strong className="bogar-order-row__val">
                      {selectedOrderForDetails.paymentMethod}
                    </strong>
                  </div>
                )}

                {selectedOrderForDetails.transactionId && (
                  <div className="bogar-order-row">
                    <span className="bogar-order-row__label">Transaction ID:</span>
                    <strong
                      className="bogar-order-row__val"
                      style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--color-antique-gold)' }}
                    >
                      {selectedOrderForDetails.transactionId}
                    </strong>
                  </div>
                )}

                {selectedOrderForDetails.subtotal !== undefined && (
                  <div className="bogar-order-row">
                    <span className="bogar-order-row__label">Product Subtotal:</span>
                    <strong className="bogar-order-row__val">
                      ₹{parseFloat(selectedOrderForDetails.subtotal).toFixed(2)}
                    </strong>
                  </div>
                )}

                {selectedOrderForDetails.shippingCharges !== undefined && (
                  <div className="bogar-order-row">
                    <span className="bogar-order-row__label">Shipping Charges:</span>
                    <strong className="bogar-order-row__val" style={{ color: parseFloat(selectedOrderForDetails.shippingCharges) === 0 ? '#10B981' : '#D4B675' }}>
                      {parseFloat(selectedOrderForDetails.shippingCharges) === 0
                        ? 'FREE'
                        : `₹${parseFloat(selectedOrderForDetails.shippingCharges).toFixed(2)}`}
                    </strong>
                  </div>
                )}

                <div className="bogar-order-row" style={{ borderTop: '1px dashed rgba(212, 182, 117, 0.3)', paddingTop: '6px' }}>
                  <span className="bogar-order-row__label" style={{ fontWeight: '700' }}>Total Amount:</span>
                  <strong className="bogar-order-row__val bogar-order-row__val--highlight" style={{ fontSize: '1.05rem' }}>
                    ₹{parseFloat(selectedOrderForDetails.totalAmount || selectedOrderForDetails.subtotal || 0).toFixed(2)}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Payment Status:</span>
                  <strong
                    className="bogar-order-row__val"
                    style={{
                      color: selectedOrderForDetails.status === 'Cancelled' || selectedOrderForDetails.paymentStatus === 'Cancelled' || selectedOrderForDetails.paymentStatus === 'failed'
                        ? '#EF4444'
                        : selectedOrderForDetails.paymentStatus === 'Paid' || selectedOrderForDetails.paymentStatus === 'success'
                        ? '#10B981'
                        : '#F59E0B',
                      fontWeight: '700',
                    }}
                  >
                    {selectedOrderForDetails.status === 'Cancelled' || selectedOrderForDetails.paymentStatus === 'Cancelled' || selectedOrderForDetails.paymentStatus === 'failed'
                      ? 'Cancelled / Failed'
                      : (selectedOrderForDetails.paymentStatus || 'Pending')}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Dispatch Status:</span>
                  <strong
                    className={`bogar-order-row__val ${selectedOrderForDetails.status === 'Cancelled' ? 'bogar-order-row__val--cancelled' : 'bogar-order-row__val--confirmed'}`}
                    style={{
                      color: selectedOrderForDetails.status === 'Cancelled' ? '#EF4444' : '#10B981',
                      fontWeight: '700',
                    }}
                  >
                    {selectedOrderForDetails.status || 'Confirmed'}
                  </strong>
                </div>
              </div>

              <div className="bogar-order-modal-actions">
                <button
                  type="button"
                  className="bogar-btn-order-action bogar-btn-order-action--track"
                  style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                  onClick={() => {
                    const ord = selectedOrderForDetails;
                    setSelectedOrderForDetails(null);
                    setSelectedOrderForTracking(ord);
                  }}
                >
                  <Truck size={16} />
                  <span>Live Tracking</span>
                  <span className="bogar-live-pulse-dot" />
                </button>

                {selectedOrderForDetails.status !== 'Cancelled' ? (
                  <button
                    type="button"
                    className="bogar-btn-order-action bogar-btn-order-action--cancel"
                    style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                    onClick={() => handleCancelOrder(selectedOrderForDetails.orderId)}
                  >
                    <XCircle size={16} />
                    <span>Cancel Order</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bogar-btn-order-action bogar-btn-order-action--cancelled"
                    disabled
                    style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                  >
                    <XCircle size={16} />
                    <span>Order Cancelled</span>
                  </button>
                )}
                <button
                  type="button"
                  className="bogar-btn-secondary"
                  onClick={() => setSelectedOrderForDetails(null)}
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 3: LIVE ORDER TRACKING
          ========================================================== */}
      {selectedOrderForTracking && (
        <div
          className="bogar-modal-backdrop"
          onClick={() => setSelectedOrderForTracking(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bogar-modal-card bogar-modal-card--tracking"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px' }}
          >
            <div className="bogar-modal-card__header">
              <div className="bogar-modal-card__brand">
                <LotusLogo size={28} color="#D4B675" />
                <div>
                  <h3 className="bogar-modal-card__title">Live Order Tracking</h3>
                  <p className="bogar-modal-card__tagline">
                    REAL-TIME TEMPLE DISPATCH & LOGISTICS
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="bogar-modal-card__close"
                onClick={() => setSelectedOrderForTracking(null)}
                aria-label="Close tracking dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bogar-modal-card__body bogar-tracking-modal-body">
              {/* Top Status Banner */}
              <div className="bogar-tracking-status-banner">
                <div className="bogar-tracking-status-left">
                  <span className="bogar-tracking-chip">
                    <span className="bogar-live-pulse-dot" /> LIVE TRACKING
                  </span>
                  <h4 className="bogar-tracking-headline">
                    {selectedOrderForTracking.status === 'Cancelled'
                      ? 'Order Cancelled'
                      : 'In Transit • Moving towards Delivery Hub'}
                  </h4>
                  <span className="bogar-tracking-sub">
                    AWB Tracking No: <strong>{getTrackingNumber(selectedOrderForTracking.orderId)}</strong>
                  </span>
                </div>
                {selectedOrderForTracking.status !== 'Cancelled' && (
                  <div className="bogar-tracking-eta-badge">
                    <Clock size={16} color="#8C6D2D" />
                    <div>
                      <span className="bogar-tracking-eta-label">Estimated Delivery</span>
                      <strong className="bogar-tracking-eta-val">
                        {getEstimatedDeliveryDate(selectedOrderForTracking.orderDate, 2)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Snippet Bar */}
              <div className="bogar-tracking-product-bar">
                <div
                  className="bogar-tracking-product-media"
                  style={{
                    backgroundColor: getInitialImageBg(
                      selectedOrderForTracking.product?.image || selectedOrderForTracking.image
                    ),
                  }}
                >
                  <img
                    src={
                      selectedOrderForTracking.product?.image ||
                      selectedOrderForTracking.image ||
                      '/assets/images/temple_herbal_leaf.png'
                    }
                    alt={selectedOrderForTracking.productName}
                    className="bogar-tracking-product-img"
                  />
                </div>
                <div className="bogar-tracking-product-info">
                  <h4 className="bogar-tracking-product-title">
                    {selectedOrderForTracking.productName}
                  </h4>
                  <div className="bogar-tracking-product-meta">
                    <span>Qty: <strong>{selectedOrderForTracking.quantity}</strong></span>
                    <span>•</span>
                    <span>Order ID: <code style={{ color: '#8C6D2D', fontWeight: 700 }}>{selectedOrderForTracking.orderId}</code></span>
                  </div>
                  {selectedOrderForTracking.deliveryAddress && (
                    <div className="bogar-tracking-product-addr">
                      <MapPin size={13} color="#D4B675" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{selectedOrderForTracking.deliveryAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrderForTracking.status !== 'Cancelled' ? (
                <>
                  {/* Visual Route & Progress Bar */}
                  <div className="bogar-tracking-progress-container">
                    <div className="bogar-tracking-progress-bar">
                      <div className="bogar-tracking-progress-fill">
                        <div className="bogar-tracking-truck-pin">
                          <Truck size={15} />
                        </div>
                      </div>
                    </div>
                    <div className="bogar-tracking-progress-labels">
                      <span>Palani Consecration Hub</span>
                      <span className="bogar-tracking-current-node">Coimbatore Sorting Hub</span>
                      <span>Devotee Doorstep</span>
                    </div>
                  </div>

                  {/* Live Stepper Timeline */}
                  <div className="bogar-tracking-timeline">
                    {/* Step 1 */}
                    <div className="bogar-tracking-step bogar-tracking-step--done">
                      <div className="bogar-tracking-step__icon bogar-tracking-step__icon--done">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="bogar-tracking-step__content">
                        <div className="bogar-tracking-step__header">
                          <strong>Order Confirmed & Verified</strong>
                          <span className="bogar-tracking-step__time">
                            {selectedOrderForTracking.orderDate} • 09:30 AM
                          </span>
                        </div>
                        <p>Order received and sanctified at Bogar Heritage Centre, Palani.</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bogar-tracking-step bogar-tracking-step--done">
                      <div className="bogar-tracking-step__icon bogar-tracking-step__icon--done">
                        <Package size={16} />
                      </div>
                      <div className="bogar-tracking-step__content">
                        <div className="bogar-tracking-step__header">
                          <strong>Consecrated Packaging Completed</strong>
                          <span className="bogar-tracking-step__time">
                            {selectedOrderForTracking.orderDate} • 01:45 PM
                          </span>
                        </div>
                        <p>Packed securely with protective sacred materials and sealed for dispatch.</p>
                      </div>
                    </div>

                    {/* Step 3 - Active */}
                    <div className="bogar-tracking-step bogar-tracking-step--active">
                      <div className="bogar-tracking-step__icon bogar-tracking-step__icon--active">
                        <Truck size={16} />
                      </div>
                      <div className="bogar-tracking-step__content">
                        <div className="bogar-tracking-step__header">
                          <strong>In Transit • Dispatched (Live)</strong>
                          <span className="bogar-tracking-step__badge">ACTIVE STAGE</span>
                        </div>
                        <p>
                          Handed over to Sacred Logistics Courier Partner (Delhivery Express). Departed Coimbatore Regional Sorting Hub.
                        </p>
                        <div className="bogar-tracking-step__beacon">
                          <Navigation size={13} color="#2E7D32" />
                          <span>Moving towards destination delivery hub</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="bogar-tracking-step bogar-tracking-step--pending">
                      <div className="bogar-tracking-step__icon bogar-tracking-step__icon--pending">
                        <MapPin size={16} />
                      </div>
                      <div className="bogar-tracking-step__content">
                        <div className="bogar-tracking-step__header">
                          <strong>Out for Doorstep Delivery</strong>
                          <span className="bogar-tracking-step__time">
                            Expected {getEstimatedDeliveryDate(selectedOrderForTracking.orderDate, 1)}
                          </span>
                        </div>
                        <p>Delivery agent assigned for doorstep sacred delivery.</p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="bogar-tracking-step bogar-tracking-step--pending">
                      <div className="bogar-tracking-step__icon bogar-tracking-step__icon--pending">
                        <Sparkles size={16} />
                      </div>
                      <div className="bogar-tracking-step__content">
                        <div className="bogar-tracking-step__header">
                          <strong>Delivered to Devotee</strong>
                          <span className="bogar-tracking-step__time">
                            Expected {getEstimatedDeliveryDate(selectedOrderForTracking.orderDate, 2)}
                          </span>
                        </div>
                        <p>Handover of sacred offerings directly to your residence.</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bogar-tracking-cancelled-box">
                  <XCircle size={40} color="#E63946" />
                  <h4>This order has been cancelled</h4>
                  <p>Tracking has ceased because this order was cancelled by devotee.</p>
                </div>
              )}

              {/* Close Button */}
              <div className="bogar-tracking-footer" style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="bogar-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setSelectedOrderForTracking(null)}
                >
                  <span>Close Tracking</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          PAYMENT GATEWAY MODAL (PayGlocal / Dharani Herbals API)
          ========================================================== */}
      {gatewayModalData && (
        <div
          className="bogar-modal-backdrop"
          onClick={() => {
            if (gatewayStatus === 'cancelled') {
              handleReturnToBogar();
            } else if (gatewayStatus === 'confirm_cancel') {
              handleReturnToPayment();
            } else {
              handleRequestCancel();
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`bogar-modal-card ${gatewayStatus === 'cancelled' || gatewayStatus === 'confirm_cancel' ? '' : 'bogar-modal-card--gateway-direct'}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: gatewayStatus === 'cancelled' || gatewayStatus === 'confirm_cancel' ? '450px' : '560px',
              width: '100%',
              padding: 0,
              background: gatewayStatus === 'cancelled' || gatewayStatus === 'confirm_cancel' ? 'transparent' : '#1B140F',
              boxShadow: gatewayStatus === 'cancelled' || gatewayStatus === 'confirm_cancel' ? 'none' : '0 12px 40px rgba(0,0,0,0.6)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {/* 1. STATE: PAYING / READY - DIRECT DEFAULT PAYMENT GATEWAY (PAYGLOCAL / DHARANI HERBALS IFRAME) */}
            {(gatewayStatus === 'ready' || gatewayStatus === 'paying' || gatewayStatus === 'opened' || gatewayStatus === 'checking') && (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                <div className="bogar-gateway-top-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LotusLogo size={24} color="#D4B675" />
                    <div>
                      <div style={{ color: '#FAF7F2', fontWeight: '700', fontSize: '0.92rem', lineHeight: '1.2' }}>
                        Dharani Herbals Payment Gateway
                      </div>
                      <div style={{ color: '#D4B675', fontSize: '0.78rem', fontWeight: '600' }}>
                        ₹{gatewayModalData.amount.toFixed(2)} • Txn: {gatewayModalData.merchantTxnId}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="bogar-gateway-top-bar__cancel-btn"
                      onClick={handleRequestCancel}
                    >
                      <X size={15} />
                      <span>Cancel Payment</span>
                    </button>
                  </div>
                </div>

                <div className="bogar-gateway-iframe-wrapper">
                  <iframe
                    src={gatewayModalData.redirectUrl}
                    title="Dharani Herbals Payment Gateway"
                    className="bogar-gateway-iframe"
                    allow="payment *; clipboard-write *"
                    sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                  />
                </div>
              </div>
            )}

            <div
              className={gatewayStatus === 'cancelled' || gatewayStatus === 'confirm_cancel' ? '' : 'bogar-modal-card__body bogar-payment-modal-body'}
              style={{
                display: (gatewayStatus === 'ready' || gatewayStatus === 'paying' || gatewayStatus === 'opened' || gatewayStatus === 'checking') ? 'none' : 'block',
              }}
            >
              <div className="bogar-payment-gateway-summary">
                {/* 2. STATE: CONFIRM CANCEL (JUST CONFIRM CANCEL, ZERO SURVEY QUESTIONS) */}
                {gatewayStatus === 'confirm_cancel' && (
                  <div className="bogar-cancelled-card" style={{ maxWidth: '420px' }}>
                    <div className="bogar-cancelled-icon" style={{ background: '#FF9800' }}>
                      !
                    </div>
                    <h2 className="bogar-cancelled-title" style={{ fontSize: '1.45rem', marginBottom: '8px' }}>
                      Confirm Cancellation
                    </h2>
                    <p className="bogar-cancelled-desc" style={{ marginBottom: '24px' }}>
                      Are you sure you want to cancel the payment?
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        type="button"
                        className="bogar-cancelled-btn"
                        style={{ background: '#E63946', boxShadow: '0 4px 12px rgba(230, 57, 70, 0.35)' }}
                        onClick={handleConfirmCancel}
                      >
                        Confirm Cancel
                      </button>

                      <button
                        type="button"
                        style={{
                          background: '#F8F9FA',
                          border: '1px solid #D1D5DB',
                          color: '#374151',
                          padding: '12px 18px',
                          borderRadius: '10px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                        }}
                        onClick={handleReturnToPayment}
                      >
                        Return to Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. STATE: PAYMENT CANCELLED (EXACT REPLICA OF REFERENCE IMAGE 2, RETURNS ONLY TO BOGAR) */}
                {gatewayStatus === 'cancelled' && (
                  <div className="bogar-cancelled-card">
                    <div className="bogar-cancelled-icon">!</div>
                    <h2 className="bogar-cancelled-title">Payment Cancelled</h2>
                    <p className="bogar-cancelled-desc">
                      You have cancelled the transaction. No charges were made.
                    </p>

                    <div className="bogar-cancelled-details">
                      <div className="bogar-cancelled-row">
                        <span className="bogar-cancelled-row__label">Amount</span>
                        <span className="bogar-cancelled-row__val">₹ {gatewayModalData.amount.toFixed(2)}</span>
                      </div>
                      <div className="bogar-cancelled-row">
                        <span className="bogar-cancelled-row__label">Transaction ID</span>
                        <span className="bogar-cancelled-row__val">{gatewayModalData.merchantTxnId}</span>
                      </div>
                      {gatewayModalData.gid && (
                        <div className="bogar-cancelled-row">
                          <span className="bogar-cancelled-row__label">Gateway ID</span>
                          <span className="bogar-cancelled-row__val">{gatewayModalData.gid}</span>
                        </div>
                      )}
                      <div className="bogar-cancelled-row">
                        <span className="bogar-cancelled-row__label">Status</span>
                        <span className="bogar-cancelled-row__val bogar-cancelled-status">CUSTOMER_CANCELLED</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="bogar-cancelled-btn"
                      onClick={handleReturnToBogar}
                    >
                      Return to Bogar Website
                    </button>

                    <div className="bogar-cancelled-timer">
                      Redirecting you automatically in {cancelCountdown} seconds...
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        style={{
                          background: 'transparent',
                          border: '1px solid #D4B675',
                          color: '#8B6A3F',
                          borderRadius: '8px',
                          padding: '7px 16px',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onClick={handleSwitchToCodFromGateway}
                      >
                        <Truck size={14} />
                        <span>Place Order via Cash on Delivery</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. STATE: PAYMENT SUCCESS */}
                {gatewayStatus === 'success' && (
                  <div className="bogar-gateway-status-panel bogar-gateway-status-panel--success">
                    <div className="bogar-gateway-pulse-icon bogar-gateway-pulse-icon--success">
                      <CheckCircle2 size={38} />
                    </div>
                    <h4 className="bogar-gateway-status-title bogar-gateway-status-title--success">
                      Payment Success!
                    </h4>
                    <p className="bogar-gateway-status-desc">
                      Your payment of <strong>₹{gatewayModalData.amount.toFixed(2)}</strong> has been verified. Creating your verified order now...
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#2E7D32', fontFamily: 'monospace' }}>
                      Txn ID: {gatewayModalData.merchantTxnId}
                    </span>

                    <div className="bogar-gateway-btn-row">
                      <button
                        type="button"
                        className="bogar-btn-book bogar-btn-book--full"
                        onClick={handleGatewaySuccess}
                      >
                        <span>View Confirmed Order →</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
