const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const frontendURL = process.env.FRONTEND_URL || '';

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const sampleProducts = require('./data/sampleProducts');

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildCORSOptions() {
  const allowedOrigins = frontendURL
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: false
  };
}

app.use(express.json());
app.use(cors(buildCORSOptions()));
app.use(express.static('public'));

app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

function validateEnv() {
  const missingEnvVars = [];
  if (!mongoUri) missingEnvVars.push('MONGO_URI or MONGODB_URI');
  if (!process.env.JWT_SECRET) missingEnvVars.push('JWT_SECRET');

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
}

async function connectToDatabase() {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
  });

  console.log('Connected to MongoDB Atlas');
  await syncCatalogProducts();
}

async function syncCatalogProducts() {
  const operations = sampleProducts.map((product) => ({
    updateOne: {
      filter: { name: product.name },
      update: { $set: product },
      upsert: true
    }
  }));

  await Product.bulkWrite(operations);
  console.log(`Synced ${sampleProducts.length} catalog products`);
}

app.get('/api/health', async (req, res) => {
  try {
    const productCount = mongoose.connection.readyState === 1 ? await Product.countDocuments() : null;
    res.json({
      success: true,
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      products: productCount
    });
  } catch (error) {
    res.status(500).json({ success: false, status: 'error', message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password?.trim();

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error while registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error while logging in' });
  }
});

app.use('/api/products', require('./routes/products'));

app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

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

    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      totalPrice,
      shippingAddress,
      paymentMethod
    });

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
    const enrichedOrders = orders.map((order) => ({
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
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    const created = await Product.insertMany(sampleProducts);

    res.json({
      success: true,
      message: 'Catalog seeded successfully.',
      count: created.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    validateEnv();
    await connectToDatabase();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
