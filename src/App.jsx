import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useBogar } from './context/BogarContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CollectionSection from './components/CollectionSection';
import WorldOfBogarSection from './components/WorldOfBogarSection';
import AboutBogarSection from './components/AboutBogarSection';
import CategoryPageView from './components/CategoryPageView';
import SpecialPoojaBookingView from './components/SpecialPoojaBookingView';
import SpecialPoojaTicketView from './components/SpecialPoojaTicketView';
import ProductOrderDetailsView from './components/ProductOrderDetailsView';
import MyBookingsOrdersView from './components/MyBookingsOrdersView';
import CartView from './components/CartView';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';
import PoojaBookingModal from './components/PoojaBookingModal';
import KnowMoreModal from './components/KnowMoreModal';
import ViewAllPageView from './components/ViewAllPageView';
import FoodPageView from './components/FoodPageView';
import HairPageView from './components/HairPageView';
import HealthPageView from './components/HealthPageView';
import SkinPageView from './components/SkinPageView';
import BabyPageView from './components/BabyPageView';
import VideoSection from './components/VideoSection';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import './App.css';

function App() {
  const {
    currentUser,
    cart,
    pendingAction,
    setPendingAction,
    addToCart,
    createProductOrder,
    activeTicket,
    setActiveTicket,
    activeOrder,
    setActiveOrder,
  } = useBogar();

  const [activePage, setActivePage] = useState('home');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isKnowMoreOpen, setIsKnowMoreOpen] = useState(false);
  const [selectedPoojaForModal, setSelectedPoojaForModal] = useState('Special Bogar Pooja');
  const [toastNotification, setToastNotification] = useState(null);

  // Sync state with URL hash & ensure DEFAULT on initial load is always 'home'
  useEffect(() => {
    const validPages = [
      'home',
      'poojas',
      'tea-food',
      'thuni',
      'chains',
      'login',
      'signup',
      'cart',
      'book-pooja',
      'pooja-ticket',
      'product-orders',
      'my-records',
      'view-all',
      'food',
      'hair',
      'health-wellness',
      'skin',
      'baby',
    ];

    // On initial app open / load: Always default to 'home'
    // If URL has #cart, #my-records, or stale hash from previous visit, clear it so user lands on Homepage
    const initialHash = window.location.hash.replace('#', '');
    if (!initialHash || initialHash === 'cart' || initialHash === 'my-records' || initialHash === 'home') {
      setActivePage('home');
      if (window.location.hash) {
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (_) {}
      }
    } else if (initialHash === 'beverages') {
      setActivePage('tea-food');
    } else if (validPages.includes(initialHash)) {
      setActivePage(initialHash);
    } else {
      setActivePage('home');
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === 'home') {
        setActivePage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'beverages') {
        setActivePage('tea-food');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (validPages.includes(hash)) {
        setActivePage(hash);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setActivePage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showToast = (msg, action = null) => {
    setToastNotification({
      message: msg,
      action,
    });
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    if (pageId === 'home') {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (_) {
        window.location.hash = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = pageId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. BUY NOW Handler (Section 14)
  const handleBuyNow = (product) => {
    if (!currentUser) {
      setPendingAction({
        type: 'buy_now',
        payload: { product, quantity: 1 },
      });
      handleNavigate('login');
      return;
    }

    const res = createProductOrder({
      product,
      quantity: 1,
      phone: currentUser.phone,
      email: currentUser.email,
    });

    if (res.success) {
      setActiveOrder(res.order);
      handleNavigate('product-orders');
    }
  };

  // 2. ADD TO CART Handler (Login Required + Preserves Product & Quantity)
  const handleAddToCart = (product, quantity = 1) => {
    const qty =
      typeof quantity === 'number' && quantity > 0
        ? quantity
        : typeof product?.quantity === 'number' && product.quantity > 0
        ? product.quantity
        : 1;

    // Check whether the user is authenticated/logged in
    if (!currentUser) {
      // DO NOT add the product to the cart yet.
      // Navigate directly to the EXISTING Login / Sign Up page.
      // Preserve product, product ID, quantity and any cart data.
      setPendingAction({
        type: 'add_to_cart',
        payload: {
          product,
          productId: product?.id,
          quantity: qty,
        },
      });
      handleNavigate('login');
      return;
    }

    addToCart(product, qty);
    showToast(`Added "${product.name}" (Qty: ${qty}) to your sacred cart.`, {
      label: 'View Cart →',
      onClick: () => handleNavigate('cart'),
    });
  };

  // 3. Login / Signup Success Callback
  const handleLoginSuccess = (user) => {
    if (pendingAction) {
      if (pendingAction.type === 'buy_now') {
        const prod = pendingAction.payload.product;
        const res = createProductOrder({
          product: prod,
          quantity: pendingAction.payload.quantity || 1,
          phone: user.phone,
          email: user.email,
        });
        setPendingAction(null);
        if (res.success) {
          setActiveOrder(res.order);
          handleNavigate('product-orders');
          return;
        }
      } else if (pendingAction.type === 'add_to_cart') {
        // Automatically add the originally selected product and preserved quantity
        const prod = pendingAction.payload.product;
        const qty = pendingAction.payload.quantity || 1;
        addToCart(prod, qty);
        setPendingAction(null);
        showToast(`Added "${prod.name}" (Qty: ${qty}) to your sacred cart.`);
        // Return/continue to the cart flow
        handleNavigate('cart');
        return;
      } else if (pendingAction.type === 'confirm_pooja') {
        handleNavigate('book-pooja');
        return;
      } else if (pendingAction.type === 'cart_checkout') {
        handleNavigate('cart');
        return;
      }
    }
    handleNavigate('home');
  };

  const handleBookingSuccess = (booking) => {
    setActiveTicket(booking);
    handleNavigate('pooja-ticket');
  };

  const handleOpenBookingModal = (poojaName = 'Special Bogar Pooja') => {
    setSelectedPoojaForModal(poojaName);
    setIsBookingModalOpen(true);
  };

  const handleExploreClick = () => {
    if (activePage !== 'home') {
      handleNavigate('home');
      setTimeout(() => {
        const el = document.getElementById('collections');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById('collections');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bogar-app">
      {/* Toast Notification with Clear "View Cart" Option */}
      {toastNotification && (
        <div className="bogar-toast bogar-toast--with-action" role="status">
          <span className="bogar-toast__msg">{toastNotification.message}</span>
          {toastNotification.action && (
            <button
              type="button"
              className="bogar-toast__action-btn"
              onClick={toastNotification.action.onClick}
            >
              {toastNotification.action.label}
            </button>
          )}
        </div>
      )}

      {/* Top Navbar: BOGAR, Home, Poojas, Tea & Food, Thuni, Chains, Book Special Pooja */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenBooking={() => handleOpenBookingModal('Special Bogar Pooja')}
      />

      {/* Main Content Router */}
      <main id="main-content">
        <ErrorBoundary onReset={() => handleNavigate('home')}>
        {/* HOMEPAGE: 1. Hero, 2. Collections, 3. Special Pooja, 4. About Bogar */}
        {activePage === 'home' && (
          <>
            {/* 1. Hero Section (NO View Cart button inside Hero) */}
            <Hero onExploreClick={handleExploreClick} />

            {/* 2. Explore Our Collections (4 Cards) */}
            <CollectionSection onSelectCategory={handleNavigate} />

            {/* 3. The World of Bogar Heritage Section */}
            <WorldOfBogarSection />

            {/* 4. About BOGAR / A Legacy of Wisdom */}
            <AboutBogarSection onKnowMore={() => setIsKnowMoreOpen(true)} />

            {/* 5. Sacred Video Section: Divine Essence & Tradition */}
            <VideoSection />
          </>
        )}

        {/* DEDICATED STATIC CATEGORY PAGES */}
        {(activePage === 'poojas' ||
          activePage === 'tea-food' ||
          activePage === 'thuni' ||
          activePage === 'chains') && (
          <CategoryPageView
            categoryId={activePage}
            onBack={() => handleNavigate('home')}
            onBookPooja={handleOpenBookingModal}
            onBuyNow={handleBuyNow}
            onAddToCart={handleAddToCart}
            onSelectCategory={handleNavigate}
          />
        )}

        {/* VIEW ALL COLLECTIONS ROUTE */}
        {activePage === 'view-all' && (
          <ViewAllPageView
            onBack={() => handleNavigate('home')}
            onSelectCategory={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* FOOD PRODUCTS ROUTE */}
        {activePage === 'food' && (
          <FoodPageView
            onBack={() => handleNavigate('view-all')}
            onAddToCart={handleAddToCart}
            onSelectCategory={handleNavigate}
          />
        )}

        {/* HAIR PRODUCTS ROUTE */}
        {activePage === 'hair' && (
          <HairPageView
            onBack={() => handleNavigate('view-all')}
            onAddToCart={handleAddToCart}
            onSelectCategory={handleNavigate}
          />
        )}

        {/* HEALTH & WELLNESS PRODUCTS ROUTE */}
        {activePage === 'health-wellness' && (
          <HealthPageView
            onBack={() => handleNavigate('view-all')}
            onAddToCart={handleAddToCart}
            onSelectCategory={handleNavigate}
          />
        )}

        {/* SKIN PRODUCTS ROUTE */}
        {activePage === 'skin' && (
          <SkinPageView
            onBack={() => handleNavigate('view-all')}
            onAddToCart={handleAddToCart}
            onSelectCategory={handleNavigate}
          />
        )}

        {/* BABY PRODUCTS ROUTE */}
        {activePage === 'baby' && (
          <BabyPageView
            onBack={() => handleNavigate('view-all')}
            onAddToCart={handleAddToCart}
            onSelectCategory={handleNavigate}
          />
        )}

        {/* SPECIAL POOJA BOOKING ROUTE */}
        {activePage === 'book-pooja' && (
          <SpecialPoojaBookingView
            initialPoojaName={selectedPoojaForModal}
            onNavigate={handleNavigate}
            onBookingSuccess={handleBookingSuccess}
          />
        )}

        {/* SPECIAL POOJA TICKET ROUTE (Separate receipt with NO price) */}
        {activePage === 'pooja-ticket' && (
          <SpecialPoojaTicketView
            ticket={activeTicket}
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        )}

        {/* PRODUCT ORDER DETAILS ROUTE (Separate receipt with NO price) */}
        {activePage === 'product-orders' && (
          <ProductOrderDetailsView
            order={activeOrder}
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        )}

        {/* UNIFIED CART + MY ORDERS SINGLE PAGE */}
        {(activePage === 'cart' || activePage === 'my-records') && (
          <CartView
            initialTab={activePage === 'my-records' ? 'orders' : 'cart'}
            onNavigate={handleNavigate}
            onOrderSuccess={(order) => {
              setActiveOrder(order);
            }}
          />
        )}

        {/* LOGIN ROUTE */}
        {activePage === 'login' && (
          <LoginView
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* SIGNUP ROUTE */}
        {activePage === 'signup' && (
          <SignupView
            onNavigate={handleNavigate}
            onSignupSuccess={handleLoginSuccess}
          />
        )}
        </ErrorBoundary>
      </main>


      {/* 8. Footer (About, Contact, Collections, Devotee Access) */}
      <Footer
        onNavigate={handleNavigate}
        onBookPooja={() => handleOpenBookingModal('Special Bogar Pooja')}
        onKnowMore={() => setIsKnowMoreOpen(true)}
        isAuthPage={activePage === 'login' || activePage === 'signup'}
      />

      {/* Special Pooja Booking Modal */}
      <PoojaBookingModal
        isOpen={isBookingModalOpen}
        initialPoojaName={selectedPoojaForModal}
        onClose={() => setIsBookingModalOpen(false)}
        onNavigate={handleNavigate}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Editorial Know More Modal */}
      <KnowMoreModal
        isOpen={isKnowMoreOpen}
        onClose={() => setIsKnowMoreOpen(false)}
      />
    </div>
  );
}

export default App;
