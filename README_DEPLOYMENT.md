# ShopHub - E-Commerce Platform

A modern, fully functional e-commerce website built with Node.js, Express, and vanilla JavaScript.

## Features ✨

- **Product Catalog**: Browse 22+ products across Electronics, Clothing, and Footwear
- **User Authentication**: Secure JWT-based login and registration
- **Shopping Cart**: Add/remove products with persistent localStorage
- **Checkout System**: Complete order processing with shipping details
- **Order Management**: Track your orders in the profile dashboard
- **Admin Panel**: Manage products and view all orders (admin only)
- **Responsive Design**: Beautiful minimalist UI that works on all devices
- **Real Product Images**: High-quality product photos with accurate INR pricing

## Tech Stack 🛠️

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: File-based JSON storage
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Deployment**: Ready for Heroku/Railway/Render

## Installation 📦

```bash
# Clone the repository
git clone https://github.com/saptak69/Shophub.git
cd Shophub

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Seed database with products
npm run seed

# Start the server
npm start
```

Visit `http://localhost:5000` in your browser.

## API Endpoints 🔌

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)
- `PUT /api/orders/:id` - Update order status (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)

## Environment Variables 🔐

```
PORT=5000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_here
```

## Project Structure 📁

```
Shophub/
├── public/
│   ├── index.html              # Homepage with carousel
│   ├── products.html           # Products page
│   ├── cart.html               # Shopping cart
│   ├── checkout.html           # Checkout page
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── profile.html            # User profile
│   ├── admin.html              # Admin dashboard
│   ├── css/
│   │   ├── styles.css          # Main styles
│   │   └── admin.css           # Admin page styles
│   └── js/
│       ├── auth.js             # Authentication logic
│       ├── homepage.js         # Homepage carousel
│       ├── products.js         # Products display
│       ├── cart.js             # Cart management
│       ├── checkout.js         # Checkout logic
│       ├── profile.js          # Profile page
│       └── admin.js            # Admin panel
├── models/
│   ├── User.js                 # User data model
│   ├── Product.js              # Product data model
│   └── Order.js                # Order data model
├── routes/
│   ├── auth.js                 # Authentication routes
│   ├── products.js             # Product routes
│   └── orders.js               # Order routes
├── middleware/
│   └── auth.js                 # JWT verification
├── data/
│   ├── users.json              # User data storage
│   ├── products.json           # Product data storage
│   └── orders.json             # Order data storage
├── server.js                   # Main Express server
├── package.json                # Dependencies
├── .env                        # Environment variables
└── README.md                   # This file
```

## Default Admin Account 👨‍💼

After seeding, you can login with:
- **Email**: admin@shophub.com
- **Password**: admin123

## Features Demo 🎬

1. **Browse Products**: Visit the products page to see all items
2. **Add to Cart**: Click "Add to Cart" button on any product
3. **Checkout**: Go to cart and complete the checkout process
4. **Track Orders**: Login to profile to see order history
5. **Admin Dashboard**: Login as admin to manage products and orders

## Deployment 🚀

### Option 1: Deploy to Railway (Recommended)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 2: Deploy to Render
1. Connect GitHub repository
2. Create new Web Service
3. Build command: `npm install`
4. Start command: `npm start`

### Option 3: Deploy to Heroku
```bash
heroku login
heroku create
git push heroku main
```

## Future Enhancements 🔮

- [ ] Real payment gateway integration (Stripe/PayPal)
- [ ] Email notifications for orders
- [ ] Product reviews and ratings
- [ ] Advanced search and filtering
- [ ] Wishlist feature
- [ ] Order tracking with status updates
- [ ] Analytics dashboard
- [ ] Social media login
- [ ] Multiple language support

## License 📄

MIT License - feel free to use this project for learning or commercial purposes.

## Contact 💬

For questions or suggestions, reach out at dev@shophub.com

---

**Made with ❤️ for modern e-commerce**
