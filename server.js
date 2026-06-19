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

// Environment Validation
function validateEnv() {
  const missingEnvVars = [];
  if (!mongoUri) missingEnvVars.push('MONGO_URI or MONGODB_URI');
  if (!process.env.JWT_SECRET) missingEnvVars.push('JWT_SECRET');
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
}

// Database Connection
async function connectToDatabase() {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
  });
  console.log('Connected to MongoDB Atlas');
}

// Health Check
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
      if (!product) return res.status(404).json({ message: 'Product not found' });
      
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

// ============== HARD RESET / SEED DATA ==============
app.get('/api/seed', async (req, res) => {
  try {
    const streetwearDrops = [
      { name: "CYBER-TOKYO HEAVY TEE", description: "240 GSM heavyweight cotton. Drop shoulder fit. Features a high-density back print.", price: 1299, stock: 50, category: "Anime", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop" },
      { name: "ARACHNID OVERSIZED WEAVE", description: "Boxy fit. Subtle web-like distressing across the hem and sleeves.", price: 1499, stock: 35, category: "Anime", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop" },
      { name: "MECHA-01 DROP HOODIE", description: "Pitch black, acid-washed french terry. Distorted mecha unit graphic.", price: 2499, stock: 25, category: "Anime", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" },
      { name: "Y2K GLITCH-ART ZIP-UP", description: "Faded vintage black full-zip. Features brutalist typography down the sleeves.", price: 2199, stock: 30, category: "Graphic", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop" },
      { name: "DISTORTED REALITY KNIT", description: "Chunky, distressed mohair blend sweater. Woven static graphic.", price: 2999, stock: 15, category: "Graphic", image: "https://images.unsplash.com/photo-1578919039148-1b1d6d6c9e2f?q=80&w=600&auto=format&fit=crop" },
      { name: "WEAPON-X COMPRESSION SHIRT", description: "Skin-tight tactical base layer. Aggressive contrast stitching.", price: 899, stock: 60, category: "Graphic", image: "https://images.unsplash.com/photo-1617391761001-35b80a2b85e0?q=80&w=600&auto=format&fit=crop" },
      { name: "OLD-MONEY SUBVERTED POLO", description: "A classic silhouette utterly destroyed. Frayed collars and distressed hems.", price: 1899, stock: 40, category: "Limited", image: "https://images.unsplash.com/photo-1586363104862-3a5e222ee513?q=80&w=600&auto=format&fit=crop" },
      { name: "MIDNIGHT TACTICAL CARGOS", description: "Parachute-style nylon cargos with articulated knees. Six pockets.", price: 2799, stock: 20, category: "Limited", image: "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?q=80&w=600&auto=format&fit=crop" },
      { name: "TITANIUM MESH RUNNERS", description: "Chunky, aggressive silhouette on a stacked EVA sole.", price: 4499, stock: 12, category: "Limited", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop" }
    ];

    await Product.deleteMany({});
    const created = await Product.insertMany(streetwearDrops);

    res.json({
      success: true,
      message: 'THE CORPORATE DB HAS BEEN NUKED. STREETWEAR CATALOG SECURED.',
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
    app.listen(PORT, () => console.log(`[SYSTEM] Server running on port ${PORT}`));
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();