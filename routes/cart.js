const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');
const { validate, cartItemAddSchema, cartItemUpdateSchema } = require('../middleware/validate');

const router = express.Router();

// GET /api/cart - Fetch active user session's cart
router.get('/', authMiddleware, getCart);

// POST /api/cart - Add item to cart (validates schema)
router.post('/', authMiddleware, validate(cartItemAddSchema), addToCart);

// PUT /api/cart/:productId - Update item quantity in cart (validates schema)
router.put('/:productId', authMiddleware, validate(cartItemUpdateSchema), updateCartItem);

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', authMiddleware, removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', authMiddleware, clearCart);

module.exports = router;