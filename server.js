const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// File-based storage
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const usersFile = path.join(dataDir, 'users.json');
const productsFile = path.join(dataDir, 'products.json');
const ordersFile = path.join(dataDir, 'orders.json');

// Initialize files if they don't exist
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));
if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, JSON.stringify([]));
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, JSON.stringify([]));

// Helper functions
const readFile = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeFile = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// ============== AUTH ROUTES ==============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const users = readFile(usersFile);
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(user);
    writeFile(usersFile, users);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const users = readFile(usersFile);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ============== PRODUCTS ROUTES ==============
app.get('/api/products', (req, res) => {
  try {
    const products = readFile(productsFile);
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const products = readFile(productsFile);
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const products = readFile(productsFile);
    const product = {
      id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category,
      image: image || 'https://via.placeholder.com/300',
      createdAt: new Date().toISOString()
    };

    products.push(product);
    writeFile(productsFile, products);
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/products/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const products = readFile(productsFile);
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    products[index] = { ...products[index], ...req.body, id: products[index].id };
    writeFile(productsFile, products);
    res.json({ success: true, message: 'Product updated', product: products[index] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/products/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    let products = readFile(productsFile);
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    products.splice(index, 1);
    writeFile(productsFile, products);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ============== ORDERS ROUTES ==============
app.post('/api/orders', authMiddleware, (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }

    const products = readFile(productsFile);
    let totalPrice = 0;
    const orderItems = [];

    for (let item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });

      totalPrice += product.price * item.quantity;
      product.stock -= item.quantity;
    }

    writeFile(productsFile, products);

    const orders = readFile(ordersFile);
    const order = {
      id: Date.now().toString(),
      userId: req.user.id,
      items: orderItems,
      totalPrice,
      status: 'pending',
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    orders.push(order);
    writeFile(ordersFile, orders);
    res.status(201).json({ success: true, message: 'Order created', order });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/orders/my-orders', authMiddleware, (req, res) => {
  try {
    const orders = readFile(ordersFile);
    const userOrders = orders.filter(o => o.userId === req.user.id);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const orders = readFile(ordersFile);
    const users = readFile(usersFile);

    const enrichedOrders = orders.map(order => ({
      ...order,
      userName: users.find(u => u.id === order.userId)?.name || 'Unknown'
    }));

    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders/:id', authMiddleware, (req, res) => {
  try {
    const orders = readFile(ordersFile);
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/orders/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const orders = readFile(ordersFile);
    const index = orders.findIndex(o => o.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    orders[index].status = status;
    writeFile(ordersFile, orders);
    res.json({ success: true, message: 'Order updated', order: orders[index] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/orders/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    let orders = readFile(ordersFile);
    const index = orders.findIndex(o => o.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    orders.splice(index, 1);
    writeFile(ordersFile, orders);
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============== SEED DATA ==============
app.get('/api/seed', (req, res) => {
  try {
    const products = [
      // Electronics - Real INR Prices
      { id: '1', name: 'MacBook Pro 14"', description: 'Powerful laptop for professionals', price: 1999000, stock: 15, category: 'Electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop' },
      { id: '2', name: 'iPhone 15 Pro', description: 'Latest flagship smartphone with A17 chip', price: 129900, stock: 30, category: 'Electronics', image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=300&h=300&fit=crop' },
      { id: '3', name: 'AirPods Pro', description: 'Premium wireless earbuds with active noise cancellation', price: 24900, stock: 50, category: 'Electronics', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop' },
      { id: '4', name: 'iPad Air', description: '11-inch tablet with M1 chip', price: 79900, stock: 20, category: 'Electronics', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop' },
      { id: '5', name: 'Samsung 4K Monitor', description: '32-inch 4K display monitor', price: 59900, stock: 10, category: 'Electronics', image: 'https://images.unsplash.com/photo-1587829191301-26ae2ff8e14f?w=300&h=300&fit=crop' },
      { id: '6', name: 'Sony WH-1000XM5', description: 'Premium noise-cancelling headphones', price: 39900, stock: 25, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop' },
      { id: '7', name: 'Gaming PC RTX 4070', description: 'High-performance gaming desktop', price: 229900, stock: 8, category: 'Electronics', image: 'https://images.unsplash.com/photo-1587829191301-26ae2ff8e14f?w=300&h=300&fit=crop' },
      { id: '8', name: 'Canon EOS R6', description: 'Professional mirrorless camera', price: 249900, stock: 5, category: 'Electronics', image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=300&h=300&fit=crop' },
      
      // Clothing - Real INR Prices
      { id: '9', name: 'Premium Cotton T-Shirt', description: '100% organic cotton, comfortable fit', price: 1299, stock: 100, category: 'Clothing', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop' },
      { id: '10', name: 'Designer Jeans', description: 'Premium denim with perfect fit', price: 3499, stock: 60, category: 'Clothing', image: 'https://images.unsplash.com/photo-1542272604-787c62e4beeb?w=300&h=300&fit=crop' },
      { id: '11', name: 'Winter Jacket', description: 'Warm and stylish winter coat', price: 7999, stock: 40, category: 'Clothing', image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=300&h=300&fit=crop' },
      { id: '12', name: 'Elegant Dress', description: 'Perfect for any occasion', price: 5999, stock: 35, category: 'Clothing', image: 'https://images.unsplash.com/photo-1595777712802-0de286fade1d?w=300&h=300&fit=crop' },
      { id: '13', name: 'Casual Polo Shirt', description: 'Comfortable everyday wear', price: 1999, stock: 80, category: 'Clothing', image: 'https://images.unsplash.com/photo-1577307180446-a12d700bd7b7?w=300&h=300&fit=crop' },
      { id: '14', name: 'Wool Sweater', description: 'Cozy wool blend sweater', price: 3999, stock: 45, category: 'Clothing', image: 'https://images.unsplash.com/photo-1578919039148-1b1d6d6c9e2f?w=300&h=300&fit=crop' },
      { id: '15', name: 'Sports Leggings', description: 'High-waist athletic leggings', price: 2499, stock: 70, category: 'Clothing', image: 'https://images.unsplash.com/photo-1599082868235-41ae52255fa1?w=300&h=300&fit=crop' },
      
      // Footwear - Real INR Prices
      { id: '16', name: 'Premium Running Shoes', description: 'Professional grade running footwear', price: 8999, stock: 50, category: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop' },
      { id: '17', name: 'Leather Sneakers', description: 'Casual and stylish sneakers', price: 4999, stock: 55, category: 'Footwear', image: 'https://images.unsplash.com/photo-1549298881-cdbe2c607bee?w=300&h=300&fit=crop' },
      { id: '18', name: 'Formal Dress Shoes', description: 'Elegant shoes for formal events', price: 6999, stock: 30, category: 'Footwear', image: 'https://images.unsplash.com/photo-1487992214488-7f8a5ce14b23?w=300&h=300&fit=crop' },
      { id: '19', name: 'Comfortable Loafers', description: 'Perfect for everyday casual wear', price: 3999, stock: 40, category: 'Footwear', image: 'https://images.unsplash.com/photo-1533563905206-e1e9ad35b889?w=300&h=300&fit=crop' },
      { id: '20', name: 'Waterproof Boots', description: 'All-weather protection boots', price: 7499, stock: 25, category: 'Footwear', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop' },
      { id: '21', name: 'Summer Sandals', description: 'Light and comfortable sandals', price: 1499, stock: 90, category: 'Footwear', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop' },
      { id: '22', name: 'Basketball Shoes', description: 'High-performance court shoes', price: 9999, stock: 35, category: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop' }
    ];

    writeFile(productsFile, products);
    res.json({ success: true, message: 'Sample products added', count: products.length });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
});

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${dataDir}`);
});
