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

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/uploads', require('./routes/uploads'));


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

// Wildcard route to serve React app for non-API frontend routes
app.get('/*splat', (req, res) => {
  const path = require('path');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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