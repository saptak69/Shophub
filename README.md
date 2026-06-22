# Mangrove - E-Commerce Website

A fully functional e-commerce website built with **Node.js**, **Express**, **MongoDB**, and vanilla **JavaScript**.

## Features

✅ **Product Management** - Browse and filter products  
✅ **Shopping Cart** - Add/remove items, adjust quantities  
✅ **User Authentication** - Register, login, and manage accounts  
✅ **Checkout System** - Complete order processing with shipping  
✅ **Admin Panel** - Manage products and orders  
✅ **Order History** - Track customer orders  
✅ **Responsive Design** - Mobile-friendly interface  

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing

## Project Structure

```
ecommerce/
├── models/
│   ├── User.js          # User schema
│   ├── Product.js       # Product schema
│   └── Order.js         # Order schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── products.js      # Product CRUD routes
│   └── orders.js        # Order management routes
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── public/
│   ├── index.html       # Home page
│   ├── products.html    # Products listing
│   ├── cart.html        # Shopping cart
│   ├── checkout.html    # Checkout form
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── admin.html       # Admin panel
│   ├── profile.html     # User profile & orders
│   ├── css/
│   │   ├── styles.css   # Main styles
│   │   └── admin.css    # Admin panel styles
│   └── js/
│       ├── auth.js      # Authentication helper
│       ├── products.js  # Products page logic
│       ├── cart.js      # Cart functionality
│       ├── checkout.js  # Checkout logic
│       ├── login.js     # Login page
│       ├── register.js  # Registration page
│       ├── admin.js     # Admin panel logic
│       └── profile.js   # User profile logic
├── server.js            # Main server file
├── .env                 # Environment variables
└── package.json         # Dependencies

```

## Installation & Setup

### 1. Prerequisites

- **Node.js** (v14+)
- **MongoDB** (local or cloud)
- A text editor (VS Code, etc.)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Edit the `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

**For MongoDB Cloud (Atlas):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
```

### 4. Start the Server

```bash
npm start
```

The server will run on `http://localhost:5000`

### 5. Access the Website

Open your browser and go to: **http://localhost:5000**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin only)

### Sample Data
- `GET /api/seed` - Populate database with sample products

## Usage Guide

### 1. Create Sample Data

Navigate to: `http://localhost:5000/api/seed`

This will add sample products to the database.

### 2. User Registration & Login

- Click "Login" in navbar
- Click "Register here" to create account
- Use registered credentials to login

### 3. Browse Products

- Go to "Products" page
- Filter by category
- Click "Add to Cart" to purchase

### 4. Shopping Cart

- Click "Cart" in navbar
- Adjust quantities or remove items
- Click "Proceed to Checkout"

### 5. Checkout

- Fill shipping address
- Select payment method
- Click "Place Order"
- View orders in "Profile"

### 6. Admin Panel

**Note:** Create an admin account manually by:

1. Register as normal user
2. Connect to MongoDB directly and update user:
   ```javascript
   db.users.updateOne(
     { email: "your_email@example.com" },
     { $set: { role: "admin" } }
   )
   ```
3. Logout and login again
4. Access "Admin Panel" from navbar

**Admin Features:**
- Add/edit/delete products
- Manage order statuses
- View all customer orders

## Features Breakdown

### 🛍️ Shopping
- **Product Listing**: Browse all available products
- **Category Filter**: Filter products by category
- **Product Details**: View price, stock, and description
- **Add to Cart**: Store items in browser localStorage

### 🛒 Cart Management
- **View Cart**: See all items with quantities
- **Edit Quantity**: Increase/decrease item count
- **Remove Items**: Delete products from cart
- **Calculate Total**: Auto-calculate subtotal and total

### 💳 Checkout
- **Shipping Address**: Enter delivery details
- **Payment Methods**: Credit card, Debit card, PayPal
- **Order Summary**: Review items before purchasing
- **Stock Management**: Automatic inventory update

### 👤 User Accounts
- **Register**: Create new account with email
- **Login**: Secure authentication with JWT
- **Profile**: View account info and order history
- **Order Tracking**: Monitor order status

### 👨‍💼 Admin Dashboard
- **Add Products**: Create new items with details
- **Edit Products**: Update price, stock, description
- **Delete Products**: Remove items from catalog
- **Manage Orders**: Update order status
- **View Analytics**: See all customer orders

## Security Features

✅ Password hashing with bcryptjs  
✅ JWT token-based authentication  
✅ Role-based access control (Admin/Customer)  
✅ Protected API routes  
✅ CORS enabled  

## Troubleshooting

### MongoDB Connection Error
```
Check if MongoDB is running:
- Windows: mongod.exe
- Mac: brew services start mongodb-community
- Cloud: Verify connection string
```

### CORS Error
```
Ensure API_URL in JavaScript files matches your backend:
const API_URL = 'http://localhost:5000/api';
```

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### Sample Data Not Loading
```
Visit: http://localhost:5000/api/seed
Check console for errors
```

## Future Enhancements

- 💰 Real payment gateway integration (Stripe, PayPal)
- 📧 Email notifications for orders
- ⭐ Product reviews and ratings
- 🔍 Advanced search functionality
- 📱 Mobile app version
- 🎨 Dark mode theme
- 🔐 Two-factor authentication
- 📊 Analytics dashboard

## License

MIT License - Feel free to use this project for learning or commercial purposes.

## Support

For issues or questions, create an issue in the repository or check the documentation above.

---

**Happy Shopping! 🛒**
