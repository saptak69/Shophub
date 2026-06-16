const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

// Models & Middleware
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const sampleProducts = require('./data/sampleProducts');

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

function validateEnv() {
  const missingEnvVars = [];

  if (!mongoUri) {
    missingEnvVars.push('MONGO_URI or MONGODB_URI');
  }

  if (!process.env.JWT_SECRET) {
    missingEnvVars.push('JWT_SECRET');
  }

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
}

async function seedProductsIfEmpty() {
  const productCount = await Product.countDocuments();

  if (productCount > 0) {
    console.log(`Product catalog already contains ${productCount} item(s)`);
    return;
  }

  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} sample products because the catalog was empty`);
}

async function connectToDatabase() {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
  });

  console.log('Connected to MongoDB Atlas');
  await seedProductsIfEmpty();
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
    res.status(500).json({
      success: false,
      status: 'error',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      message: error.message
    });
  }
});

// ============== AUTH ROUTES ==============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ============== PRODUCT ROUTES (Delegated) ==============
app.use('/api/products', require('./routes/products'));

// ============== ORDERS ROUTES ==============
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

// ============== SEED DATA ==============
app.get('/api/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    const created = await Product.insertMany(sampleProducts);

    res.json({
      success: true,
      message: 'Sample products secured in MongoDB',
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
