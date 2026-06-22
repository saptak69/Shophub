const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Middleware/Helper to ensure user has a cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
};

const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name price image stock');
    res.json(populatedCart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching cart', error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Verify product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock for this product' });
    }

    const cart = await getOrCreateCart(req.user.id);
    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.productId', 'name price image stock');
    res.json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error adding to cart', error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    // Verify product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock for this product' });
    }

    const cart = await getOrCreateCart(req.user.id);
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      
      const updatedCart = await Cart.findById(cart._id).populate('items.productId', 'name price image stock');
      res.json(updatedCart);
    } else {
      res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ success: false, message: 'Server error updating cart', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user.id);

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.productId', 'name price image stock');
    res.json(updatedCart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error removing item from cart', error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    res.json({ success: true, message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error clearing cart', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
