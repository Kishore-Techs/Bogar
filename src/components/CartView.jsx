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
} from 'lucide-react';
import LotusLogo from './LotusLogo';
import { getInitialImageBg } from '../config/imageBgHelper';
import { paymentService } from '../services/paymentService';

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
    addToCart,
  } = useBogar();

  const [activeTab, setActiveTab] = useState(initialTab); // 'cart' or 'orders'
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [devoteeName, setDevoteeName] = useState(currentUser?.name || currentUser?.fullName || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelNotice, setCancelNotice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gateway'); // 'gateway' | 'cod'
  const [gatewayModalData, setGatewayModalData] = useState(null);
  const [gatewayError, setGatewayError] = useState('');
  const [selectedCartItemId, setSelectedCartItemId] = useState(null); // ID of specific item opened for dispatch

  // Find the specific active item selected by devotee
  const activeCartItem = useMemo(() => {
    if (!selectedCartItemId) return null;
    return cart.find((c) => c.product.id === selectedCartItemId) || null;
  }, [cart, selectedCartItemId]);

  const activeItemPrice = activeCartItem ? parseFloat(activeCartItem.product.price) || 0 : 0;
  const activeItemQuantity = activeCartItem ? activeCartItem.quantity : 1;
  const activeItemTotal = activeItemPrice * activeItemQuantity;

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
        setSelectedOrderForDetails((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
      }
      setTimeout(() => setCancelNotice(''), 4500);
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

  // Filter ONLY current user's actual purchased orders
  const userOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const userEmail = (currentUser?.email || email || '').toLowerCase().trim();
    const userPhone = (currentUser?.phone || phone || '').trim();
    if (!userEmail && !userPhone) return [];
    return orders.filter((o) => {
      const oEmail = (o.email || '').toLowerCase().trim();
      const oPhone = (o.phone || '').trim();
      return (userEmail && oEmail === userEmail) || (userPhone && oPhone === userPhone);
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
    const checkoutName = domName || devoteeName || currentUser?.name || currentUser?.fullName || '';
    const checkoutPhone = domPhone || phone || currentUser?.phone || '';
    const checkoutAddress = domAddress || deliveryAddress || currentUser?.address || '';
    const checkoutEmail = email || currentUser?.email || '';

    if (!currentUser && !checkoutPhone) {
      setPendingAction({ type: 'cart_checkout' });
      onNavigate('login');
      return;
    }

    if (!checkoutAddress.trim()) {
      alert('Please enter your delivery address.');
      return;
    }

    setGatewayError('');
    setIsProcessing(true);

    if (paymentMethod === 'gateway') {
      // Connect to Dharani Herbals / Vandanmart Payment Gateway API for this item
      const payRes = await paymentService.createPaymentOrder({
        amount: activeItemTotal,
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
          amount: activeItemTotal,
          customerName: checkoutName,
          customerPhone: checkoutPhone,
          customerEmail: checkoutEmail,
          deliveryAddress: checkoutAddress,
          gateway: payRes.gateway,
          targetProduct: activeCartItem.product,
          targetQuantity: activeCartItem.quantity,
        });
      } else {
        setGatewayError(payRes.message || 'Payment Gateway temporary error. You can also select Cash on Delivery.');
      }
    } else {
      // Cash on Delivery for this specific product only
      const res = createProductOrder({
        product: activeCartItem.product,
        quantity: activeCartItem.quantity,
        phone: checkoutPhone,
        email: checkoutEmail,
        devoteeName: checkoutName,
        deliveryAddress: checkoutAddress,
        paymentMethod: 'Cash on Delivery',
        transactionId: 'COD-' + Date.now().toString(36).toUpperCase(),
      });
      setIsProcessing(false);

      if (res.success) {
        removeFromCart(activeCartItem.product.id);
        if (checkoutPhone) setPhone(checkoutPhone);
        if (checkoutName) setDevoteeName(checkoutName);
        if (checkoutAddress) setDeliveryAddress(checkoutAddress);
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

  const handleGatewaySuccess = () => {
    if (!gatewayModalData) return;
    const targetProd = gatewayModalData.targetProduct || activeCartItem?.product;
    const targetQty = gatewayModalData.targetQuantity || activeCartItem?.quantity || 1;

    const res = createProductOrder({
      product: targetProd,
      quantity: targetQty,
      phone: gatewayModalData.customerPhone,
      email: gatewayModalData.customerEmail,
      devoteeName: gatewayModalData.customerName,
      deliveryAddress: gatewayModalData.deliveryAddress,
      paymentMethod: 'PayGlocal / Online Gateway (Paid)',
      transactionId: gatewayModalData.merchantTxnId,
    });

    if (targetProd?.id) {
      removeFromCart(targetProd.id);
    }

    setGatewayModalData(null);

    if (res.success) {
      if (gatewayModalData.customerPhone) setPhone(gatewayModalData.customerPhone);
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
                          <span>Temple Dispatch & Delivery</span>
                          <span className="bogar-summary-highlight">Included</span>
                        </div>
                        <div className="bogar-summary-divider" />
                        <div className="bogar-summary-row bogar-summary-row--total">
                          <strong>Total Amount</strong>
                          <strong className="bogar-summary-total-amt">
                            ₹{activeItemTotal.toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      <form onSubmit={handleCheckout} className="bogar-cart-summary__form">
                        <div className="bogar-form-group">
                          <label htmlFor="cart-devotee-name">Name</label>
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
                          <label htmlFor="cart-address">Delivery Address</label>
                          <textarea
                            id="cart-address"
                            name="cart-address"
                            required
                            rows={3}
                            placeholder="Door No, Street Name, Area, City, Pincode"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="bogar-form-input bogar-form-textarea"
                            style={{ minHeight: '80px', resize: 'vertical' }}
                          />
                        </div>

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
                                  : `Proceed to Payment Gateway • ₹${activeItemTotal.toFixed(2)}`}
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              <span>
                                {isProcessing
                                  ? 'Processing Order...'
                                  : `Place Order (Cash on Delivery) • ₹${activeItemTotal.toFixed(2)}`}
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

                          <button
                            type="button"
                            className={`bogar-btn-order-action ${order.status === 'Cancelled' ? 'bogar-btn-order-action--cancelled' : 'bogar-btn-order-action--cancel'}`}
                            onClick={() => handleCancelOrder(order.orderId)}
                            disabled={order.status === 'Cancelled'}
                            aria-label={`Cancel Order for ${order.orderId}`}
                          >
                            <XCircle size={15} />
                            <span>{order.status === 'Cancelled' ? 'Cancelled' : 'Cancel Order'}</span>
                          </button>
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
                  <div className="bogar-order-status-badge">
                    <CheckCircle2 size={14} />
                    <span>{selectedOrderForDetails.status || 'Confirmed'}</span>
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

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Dispatch Status:</span>
                  <strong className="bogar-order-row__val bogar-order-row__val--confirmed">
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
          onClick={() => setGatewayModalData(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bogar-modal-card bogar-modal-card--payment"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px' }}
          >
            <div className="bogar-modal-card__header">
              <div className="bogar-modal-card__brand">
                <LotusLogo size={28} color="#D4B675" />
                <div>
                  <h3 className="bogar-modal-card__title">
                    Dharani Herbals Payment Gateway
                  </h3>
                  <p className="bogar-modal-card__tagline">
                    SECURE 256-BIT ENCRYPTED TRANSACTION
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="bogar-modal-card__close"
                onClick={() => setGatewayModalData(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bogar-modal-card__body bogar-payment-modal-body">
              <div className="bogar-payment-gateway-summary">
                <div className="bogar-payment-amount-box">
                  <span className="bogar-payment-amount-box__label">Amount Payable</span>
                  <strong className="bogar-payment-amount-box__val">
                    ₹{gatewayModalData.amount.toFixed(2)}
                  </strong>
                  <span className="bogar-payment-amount-box__txn">
                    Merchant Txn ID: {gatewayModalData.merchantTxnId}
                  </span>
                </div>

                <div className="bogar-payment-methods-grid">
                  <div className="bogar-payment-badge-pill">
                    <ShieldCheck size={14} color="#D4B675" />
                    <span>UPI: GPay, PhonePe, Paytm, BHIM</span>
                  </div>
                  <div className="bogar-payment-badge-pill">
                    <CreditCard size={14} color="#D4B675" />
                    <span>Cards: Visa, RuPay, MasterCard</span>
                  </div>
                  <div className="bogar-payment-badge-pill">
                    <CheckCircle2 size={14} color="#D4B675" />
                    <span>Net Banking (All Indian Banks)</span>
                  </div>
                </div>

                <p className="bogar-payment-note">
                  Live payment gateway link generated by <strong>api.codingboss.in/vandanmart/</strong>. Click below to proceed to the secure payment gateway.
                </p>

                {gatewayModalData.redirectUrl && (
                  <a
                    href={gatewayModalData.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bogar-btn-book bogar-btn-book--full"
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                    }}
                    onClick={() => {
                      handleGatewaySuccess();
                    }}
                  >
                    <ExternalLink size={17} />
                    <span>Open Payment Gateway (Pay ₹{gatewayModalData.amount.toFixed(2)})</span>
                  </a>
                )}

                <button
                  type="button"
                  className="bogar-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
                  onClick={() => setGatewayModalData(null)}
                >
                  <span>Cancel / Change Payment Method</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
