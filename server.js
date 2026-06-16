const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Models & Middleware
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');

// Middleware Setup
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || '*' : '*',
  credentials: true
}));
app.use(express.static('public'));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ============== AUTH ROUTES ==============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, message: 'Registration successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ============== PRODUCT ROUTES (Delegated) ==============
app.use('/api/products', require('./routes/products'));

// ============== ORDERS ROUTES ==============
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'Order must contain items' });

    let totalPrice = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
      totalPrice += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({ userId: req.user.id, items: orderItems, totalPrice, shippingAddress, paymentMethod });
    await order.save();
    res.status(201).json({ success: true, message: 'Order created', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/orders/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    const enrichedOrders = orders.map(order => ({
      ...order.toObject(),
      userName: order.userId ? order.userId.name : 'Unknown'
    }));
    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============== SEED DATA ==============
app.get('/api/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    
    const sampleProducts = [
      { name: 'MacBook Pro 14"', description: 'Powerful laptop for professionals', price: 1999000, stock: 15, category: 'Electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop' },
      { name: 'iPhone 15 Pro', description: 'Latest flagship smartphone with A17 chip', price: 129900, stock: 30, category: 'Electronics', image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=300&h=300&fit=crop' },
      { name: 'AirPods Pro', description: 'Premium wireless earbuds with active noise cancellation', price: 24900, stock: 50, category: 'Electronics', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop' },
      { name: 'iPad Air', description: '11-inch tablet with M1 chip', price: 79900, stock: 20, category: 'Electronics', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop' },
      { name: 'Samsung 4K Monitor', description: '32-inch 4K display monitor', price: 59900, stock: 10, category: 'Electronics', image: 'https://images.unsplash.com/photo-1587829191301-26ae2ff8e14f?w=300&h=300&fit=crop' },
      { name: 'Sony WH-1000XM5', description: 'Premium noise-cancelling headphones', price: 39900, stock: 25, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop' },
      { name: 'Gaming PC RTX 4070', description: 'High-performance gaming desktop', price: 229900, stock: 8, category: 'Electronics', image: 'https://images.unsplash.com/photo-1587829191301-26ae2ff8e14f?w=300&h=300&fit=crop' },
      { name: 'Canon EOS R6', description: 'Professional mirrorless camera', price: 249900, stock: 5, category: 'Electronics', image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=300&h=300&fit=crop' },
      { name: 'Premium Cotton T-Shirt', description: '100% organic cotton, comfortable fit', price: 1299, stock: 100, category: 'Clothing', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop' },
      { name: 'Designer Jeans', description: 'Premium denim with perfect fit', price: 3499, stock: 60, category: 'Clothing', image: 'https://images.unsplash.com/photo-1542272604-787c62e4beeb?w=300&h=300&fit=crop' },
      { name: 'Winter Jacket', description: 'Warm and stylish winter coat', price: 7999, stock: 40, category: 'Clothing', image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=300&h=300&fit=crop' },
      { name: 'Elegant Dress', description: 'Perfect for any occasion', price: 5999, stock: 35, category: 'Clothing', image: 'https://images.unsplash.com/photo-1595777712802-0de286fade1d?w=300&h=300&fit=crop' },
      { name: 'Casual Polo Shirt', description: 'Comfortable everyday wear', price: 1999, stock: 80, category: 'Clothing', image: 'https://images.unsplash.com/photo-1577307180446-a12d700bd7b7?w=300&h=300&fit=crop' },
      { name: 'Wool Sweater', description: 'Cozy wool blend sweater', price: 3999, stock: 45, category: 'Clothing', image: 'https://images.unsplash.com/photo-1578919039148-1b1d6d6c9e2f?w=300&h=300&fit=crop' },
      { name: 'Sports Leggings', description: 'High-waist athletic leggings', price: 2499, stock: 70, category: 'Clothing', image: 'https://images.unsplash.com/photo-1599082868235-41ae52255fa1?w=300&h=300&fit=crop' },
      { name: 'Premium Running Shoes', description: 'Professional grade running footwear', price: 8999, stock: 50, category: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop' },
      { name: 'Leather Sneakers', description: 'Casual and stylish sneakers', price: 4999, stock: 55, category: 'Footwear', image: 'https://images.unsplash.com/photo-1549298881-cdbe2c607bee?w=300&h=300&fit=crop' },
      { name: 'Formal Dress Shoes', description: 'Elegant shoes for formal events', price: 6999, stock: 30, category: 'Footwear', image: 'https://images.unsplash.com/photo-1487992214488-7f8a5ce14b23?w=300&h=300&fit=crop' },
      { name: 'Comfortable Loafers', description: 'Perfect for everyday casual wear', price: 3999, stock: 40, category: 'Footwear', image: 'https://images.unsplash.com/photo-1533563905206-e1e9ad35b889?w=300&h=300&fit=crop' },
      { name: 'Waterproof Boots', description: 'All-weather protection boots', price: 7499, stock: 25, category: 'Footwear', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop' },
      { name: 'Summer Sandals', description: 'Light and comfortable sandals', price: 1499, stock: 90, category: 'Footwear', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop' },
      { name: 'Basketball Shoes', description: 'High-performance court shoes', price: 9999, stock: 35, category: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop' }
    ];

    const created = await Product.insertMany(sampleProducts);
    res.json({ success: true, message: 'Sample products secured in MongoDB', count: created.length });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));