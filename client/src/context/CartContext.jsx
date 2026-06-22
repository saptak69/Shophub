import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = (message) => {
    setToast({ message, visible: true });
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3000);
  };

  // Sync state helper
  const normalizeDbCart = (dbCart) => {
    if (!dbCart || !dbCart.items) return [];
    return dbCart.items.map(item => {
      const p = item.productId || {};
      return {
        productId: p._id || p.id || '',
        name: p.name || 'Unknown Item',
        price: p.price || 0,
        image: p.image || '',
        quantity: item.quantity,
        stock: p.stock ?? 99
      };
    });
  };

  // Fetch cart on mount or auth state change
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      if (token) {
        try {
          const response = await fetch('/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setCartItems(normalizeDbCart(data));
          }
        } catch (error) {
          console.error('Error fetching db cart:', error);
        }
      } else {
        const local = localStorage.getItem('cart');
        setCartItems(local ? JSON.parse(local) : []);
      }
      setLoading(false);
    };

    fetchCart();
  }, [token]);

  // Sync local cart to db cart on login
  useEffect(() => {
    const syncCart = async () => {
      if (token && localStorage.getItem('cart')) {
        try {
          const localItems = JSON.parse(localStorage.getItem('cart') || '[]');
          for (const item of localItems) {
            await fetch('/api/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                productId: item.productId,
                quantity: item.quantity
              })
            });
          }
          // After sync, clear local storage cart and fetch latest
          localStorage.removeItem('cart');
          const response = await fetch('/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setCartItems(normalizeDbCart(data));
            showToast('SESSION SECURED • CART SYNCHRONIZED');
          }
        } catch (error) {
          console.error('Failed to sync local cart to db:', error);
        }
      }
    };
    syncCart();
  }, [token]);

  const addToCart = async (product) => {
    const prodId = product.id || product._id || product.productId;
    
    if (token) {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: prodId, quantity: 1 })
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(normalizeDbCart(data));
          showToast(`${product.name.toUpperCase()} LOCKED IN BAG`);
          return true;
        } else {
          const err = await response.json();
          throw new Error(err.message || 'Failed to add to cart');
        }
      } catch (error) {
        console.error(error);
        showToast(`ERROR: ${error.message.toUpperCase()}`);
        return false;
      }
    } else {
      // Local cart
      const updated = [...cartItems];
      const existing = updated.find(item => item.productId === prodId);
      if (existing) {
        existing.quantity += 1;
      } else {
        updated.push({
          productId: prodId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          stock: product.stock ?? 99
        });
      }
      setCartItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      showToast(`${product.name.toUpperCase()} CACHED IN LOCAL BAG`);
      return true;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }

    const item = cartItems.find(i => i.productId === productId);
    const name = item ? item.name : 'ITEM';

    if (token) {
      try {
        const response = await fetch(`/api/cart/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(normalizeDbCart(data));
          showToast(`${name.toUpperCase()} QUANTITY UPDATED`);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      const updated = cartItems.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      );
      setCartItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      showToast(`${name.toUpperCase()} QUANTITY UPDATED`);
    }
  };

  const removeFromCart = async (productId) => {
    const item = cartItems.find(i => i.productId === productId);
    const name = item ? item.name : 'ITEM';

    if (token) {
      try {
        const response = await fetch(`/api/cart/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(normalizeDbCart(data));
          showToast(`${name.toUpperCase()} DELETED FROM BAG`);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      const updated = cartItems.filter(item => item.productId !== productId);
      setCartItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      showToast(`${name.toUpperCase()} DELETED FROM BAG`);
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setCartItems([]);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      toast,
      showToast,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartCount,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
