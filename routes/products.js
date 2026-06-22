const express = require('express');
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validate, createProductSchema, updateProductSchema } = require('../middleware/validate');

const router = express.Router();

// GET /api/products - Get all products (public)
router.get('/', getProducts);

// GET /api/products/:id - Get single product details (public)
router.get('/:id', getProductById);

// POST /api/products - Create a new product (admin only, validates schema)
router.post('/', authMiddleware, adminMiddleware, validate(createProductSchema), createProduct);

// PUT /api/products/:id - Update product details (admin only, validates schema)
router.put('/:id', authMiddleware, adminMiddleware, validate(updateProductSchema), updateProduct);

// DELETE /api/products/:id - Delete a product (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
