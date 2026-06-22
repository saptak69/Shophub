const express = require('express');
const { 
  createOrder, 
  getMyOrders, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder 
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validate, createOrderSchema, updateOrderStatusSchema } = require('../middleware/validate');

const router = express.Router();

// POST /api/orders - Create a new customer order (User session required, validates schema)
router.post('/', authMiddleware, validate(createOrderSchema), createOrder);

// GET /api/orders/my-orders - Fetch purchase logs for the active user session
router.get('/my-orders', authMiddleware, getMyOrders);

// GET /api/orders - Extract all store transaction logs (Admin authorization required)
router.get('/', authMiddleware, adminMiddleware, getAllOrders);

// GET /api/orders/:id - Retrieve order details by database identifier
router.get('/:id', authMiddleware, getOrderById);

// PUT /api/orders/:id - Modify transaction status state (Admin authorization required, validates schema)
router.put('/:id', authMiddleware, adminMiddleware, validate(updateOrderStatusSchema), updateOrderStatus);

// DELETE /api/orders/:id - Remove order records from the store log (Admin authorization required)
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder);

module.exports = router;
