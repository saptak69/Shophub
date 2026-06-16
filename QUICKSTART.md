# 🚀 Quick Start Guide - ShopHub E-Commerce

## ⚡ Get Started in 3 Steps

### Step 1: Install MongoDB (if not already installed)

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Run installer and follow prompts
3. Start MongoDB: `mongod`

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install -y mongodb-server
sudo service mongod start
```

**Or Use MongoDB Cloud (Atlas):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Copy connection string
4. Update `MONGO_URI` in `.env`

---

### Step 2: Start the Server

```bash
# Navigate to project directory
cd f:\projects\Ecommerce

# Start the server
npm start
```

You should see:
```
MongoDB connected
Server running on port 5000
```

---

### Step 3: Load Sample Data & Browse

1. **Load Sample Products**: Visit
   ```
   http://localhost:5000/api/seed
   ```
   You should see: `{"message":"Sample products added"}`

2. **Open Website**: Go to
   ```
   http://localhost:5000
   ```

3. **Register Account**: Click "Login" → "Register here"

4. **Explore Features**:
   - Browse products
   - Add to cart
   - Checkout

---

## 🎯 Test User Account

You can quickly test without registration:

### Create Admin User (Advanced)

1. Open MongoDB Compass or mongo shell
2. Connect to: `mongodb://localhost:27017/ecommerce`
3. Run this command:
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$abc...",  // Use bcryptjs to hash password
  role: "admin"
})
```

Or use this quick script:

```javascript
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecommerce');

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log('Admin created! Login with admin@test.com / admin123');
  process.exit();
}

createAdmin();
```

Run it:
```bash
node -e "const script = require('./create-admin'); script();"
```

---

## 📱 Website Features to Test

### 1. **Home Page** (`/`)
- Hero banner
- Feature highlights
- Navigation menu

### 2. **Products Page** (`/products.html`)
- Browse all products
- Filter by category
- Add items to cart

### 3. **Shopping Cart** (`/cart.html`)
- View items
- Change quantities
- See total price

### 4. **Checkout** (`/checkout.html`)
- Enter shipping address
- Select payment method
- Place order

### 5. **User Profile** (`/profile.html`)
- View account info
- See order history
- Track order status

### 6. **Admin Panel** (`/admin.html`) - Admin Only
- Add new products
- Edit product details
- Delete products
- Manage orders
- Update order status

### 7. **Authentication**
- Register new account (`/register.html`)
- Login with credentials (`/login.html`)
- Logout from navbar

---

## 🔧 Environment Variables

Create `.env` file (already done):

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/ecommerce

# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# JWT Secret (change in production!)
JWT_SECRET=your_secret_key_change_this_in_production

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

---

## 📊 Sample Data

When you visit `/api/seed`, these products are added:

1. **Laptop** - $999 (Electronics)
2. **Phone** - $699 (Electronics)
3. **Headphones** - $199 (Electronics)
4. **T-Shirt** - $29 (Clothing)
5. **Jeans** - $59 (Clothing)
6. **Sneakers** - $79 (Footwear)

---

## 🚀 API Endpoints for Testing

Use Postman or cURL to test:

### Register User
```bash
POST http://localhost:5000/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response includes JWT token.

### Get All Products
```bash
GET http://localhost:5000/api/products
```

### Create Order (Requires Auth Token)
```bash
POST http://localhost:5000/api/orders
Authorization: Bearer {token_from_login}
{
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

---

## ❌ Common Issues

### "Cannot find module 'mongodb'"
```bash
npm install
```

### "Port 5000 already in use"
Change PORT in `.env`:
```env
PORT=5001
```

### "MongoDB connection error"
Make sure MongoDB is running:
```bash
mongod
```

Or check connection string in `.env`

### "CORS error when accessing from frontend"
Frontend and backend must be on same machine. If not, update CORS in `server.js`:
```javascript
app.use(cors({
  origin: 'http://your-frontend-url.com'
}));
```

---

## 📈 Next Steps

1. ✅ Test all features
2. ✅ Create test account
3. ✅ Make sample purchases
4. ✅ Try admin panel
5. ✅ Check order management
6. ✅ Customize styling
7. ✅ Add payment gateway (Stripe/PayPal)
8. ✅ Deploy to production

---

## 📞 Need Help?

1. Check MongoDB connection
2. Verify `.env` variables
3. Check browser console for errors
4. Check terminal for server errors
5. Ensure port 5000 is not blocked

---

**Enjoy your e-commerce website! 🎉**
