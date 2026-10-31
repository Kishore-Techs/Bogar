import React, { createContext, useContext, useState, useEffect } from 'react';

const BogarContext = createContext(null);

export function BogarProvider({ children }) {
  // 1. Current Authenticated User (saved in localStorage for persistence)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bogar_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Pending Action when redirected to Login (e.g. Buy Now, Add to Cart, Confirm Pooja)
  const [pendingAction, setPendingAction] = useState(() => {
    try {
      const saved = sessionStorage.getItem('bogar_pending_action');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 3. User Cart (Associated with authenticated user)
  const [cart, setCart] = useState(() => {
    try {
      const savedUser = localStorage.getItem('bogar_current_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const userKey = `bogar_cart_${user.email.toLowerCase()}`;
        const saved = localStorage.getItem(userKey) || localStorage.getItem('bogar_cart');
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // 4. Special Pooja Bookings
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('bogar_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Product Orders (NO PRICE ANYWHERE)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('bogar_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Currently active Ticket or Order being viewed
  const [activeTicket, setActiveTicket] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  // Sync to storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bogar_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bogar_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const userToSave = currentUser || JSON.parse(localStorage.getItem('bogar_current_user') || 'null');
    if (userToSave?.email) {
      const userKey = `bogar_cart_${userToSave.email.toLowerCase()}`;
      localStorage.setItem(userKey, JSON.stringify(cart));
      localStorage.setItem('bogar_cart', JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  useEffect(() => {
    localStorage.setItem('bogar_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('bogar_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (pendingAction) {
      sessionStorage.setItem('bogar_pending_action', JSON.stringify(pendingAction));
    } else {
      sessionStorage.removeItem('bogar_pending_action');
    }
  }, [pendingAction]);

  // Auth Functions
  const login = (email, _password) => {
    // Registered users lookup
    const users = JSON.parse(localStorage.getItem('bogar_registered_users') || '[]');
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    const userObj = existing
      ? { name: existing.fullName || existing.name, email: existing.email, phone: existing.phone }
      : { name: email.split('@')[0], email, phone: '' };

    setCurrentUser(userObj);

    // Load this specific user's cart
    try {
      const userKey = `bogar_cart_${userObj.email.toLowerCase()}`;
      const savedCart = localStorage.getItem(userKey);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    }

    return userObj;
  };

  const signup = ({ fullName, email, phone, password }) => {
    const users = JSON.parse(localStorage.getItem('bogar_registered_users') || '[]');
    const newUser = { fullName, email, phone, password };
    users.push(newUser);
    localStorage.setItem('bogar_registered_users', JSON.stringify(users));

    const userObj = { name: fullName, email, phone };
    setCurrentUser(userObj);

    // Initial cart for newly registered user
    try {
      const userKey = `bogar_cart_${userObj.email.toLowerCase()}`;
      const savedCart = localStorage.getItem(userKey);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } catch {
      setCart([]);
    }

    return userObj;
  };

  const loginWithPhone = ({ name, phone, user_id, email, role, apiUser }) => {
    const cleanPhone = (phone || '').trim();
    const cleanName = (name || '').trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '').slice(-10);

    const users = JSON.parse(localStorage.getItem('bogar_registered_users') || '[]');
    let existingIndex = users.findIndex(
      (u) => u.phone && u.phone.replace(/\D/g, '').slice(-10) === phoneDigits
    );

    let userObj;
    if (existingIndex > -1) {
      if (cleanName) {
        users[existingIndex].fullName = cleanName;
        users[existingIndex].name = cleanName;
      }
      if (user_id) users[existingIndex].id = user_id;
      if (email) users[existingIndex].email = email;
      if (role) users[existingIndex].role = role;
      if (apiUser) users[existingIndex].apiUser = apiUser;

      userObj = {
        id: user_id || users[existingIndex].id,
        name: users[existingIndex].fullName || users[existingIndex].name || cleanName,
        fullName: users[existingIndex].fullName || users[existingIndex].name || cleanName,
        phone: users[existingIndex].phone || cleanPhone,
        email: email || users[existingIndex].email || `${phoneDigits}@bogar.temple`,
        role: role || users[existingIndex].role || 'customer',
        apiUser: apiUser || users[existingIndex].apiUser || null,
      };
      users[existingIndex] = userObj;
      localStorage.setItem('bogar_registered_users', JSON.stringify(users));
    } else {
      userObj = {
        id: user_id || Date.now(),
        name: cleanName,
        fullName: cleanName,
        phone: cleanPhone,
        email: email || `${phoneDigits}@bogar.temple`,
        role: role || 'customer',
        apiUser: apiUser || null,
      };
      users.push(userObj);
      localStorage.setItem('bogar_registered_users', JSON.stringify(users));
    }

    setCurrentUser(userObj);

    // Load user's cart (keyed by phone or fallback to bogar_cart)
    try {
      const userKey = `bogar_cart_${phoneDigits}`;
      const savedCart = localStorage.getItem(userKey) || localStorage.getItem('bogar_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    }

    return userObj;
  };

  const logout = () => {
    setCurrentUser(null);
    setPendingAction(null);
    setCart([]);
    localStorage.removeItem('bogar_cart');
  };

  // Cart Functions (NO PRICE)
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { id: 'cart_' + Date.now(), product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Check Slot Availability
  const isSlotAvailable = (date, timeSlot) => {
    if (!date || !timeSlot) return true;
    const match = bookings.find(
      (b) => b.date === date && b.timeSlot === timeSlot && b.status === 'Confirmed'
    );
    return !match;
  };

  // Create Pooja Booking
  const createBooking = ({ poojaName, devoteeName, phone, email, date, timeSlot }) => {
    if (!isSlotAvailable(date, timeSlot)) {
      return { success: false, error: 'The selected date and time slot is already booked. Please choose another available slot.' };
    }

    const ticketId = 'BOGAR-TKT-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking = {
      ticketId,
      poojaName,
      devoteeName,
      phone,
      email,
      date,
      timeSlot,
      status: 'Confirmed',
      bookedAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setActiveTicket(newBooking);
    return { success: true, booking: newBooking };
  };

  // Create Product Order (Buy Now or Cart)
  const createProductOrder = ({ product, quantity = 1, phone, email }) => {
    const orderId = 'BOGAR-ORD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      orderId,
      productName: product.name,
      product,
      quantity,
      orderDate: new Date().toISOString().split('T')[0],
      phone: phone || currentUser?.phone || '',
      email: email || currentUser?.email || '',
      status: 'Confirmed',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    return { success: true, order: newOrder };
  };

  const cancelOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.orderId === orderId ? { ...ord, status: 'Cancelled' } : ord
      )
    );
    return { success: true };
  };

  const checkoutCart = ({ phone, email }) => {
    if (cart.length === 0) return { success: false, error: 'Your cart is empty.' };

    const newOrders = cart.map((item, idx) => ({
      orderId: 'BOGAR-ORD-' + (Math.floor(100000 + Math.random() * 900000) + idx),
      productName: item.product.name,
      product: item.product,
      quantity: item.quantity,
      orderDate: new Date().toISOString().split('T')[0],
      phone: phone || currentUser?.phone || '',
      email: email || currentUser?.email || '',
      status: 'Confirmed',
    }));

    setOrders((prev) => [...newOrders, ...prev]);
    setActiveOrder(newOrders[0]);
    clearCart();
    return { success: true, orders: newOrders };
  };

  return (
    <BogarContext.Provider
      value={{
        currentUser,
        login,
        loginWithPhone,
        signup,
        logout,
        pendingAction,
        setPendingAction,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        bookings,
        isSlotAvailable,
        createBooking,
        orders,
        cancelOrder,
        createProductOrder,
        checkoutCart,
        activeTicket,
        setActiveTicket,
        activeOrder,
        setActiveOrder,
      }}
    >
      {children}
    </BogarContext.Provider>
  );
}

export function useBogar() {
  const context = useContext(BogarContext);
  if (!context) {
    throw new Error('useBogar must be used within a BogarProvider');
  }
  return context;
}
