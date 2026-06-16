# ShopHub - Deployment Guide 🚀

## Quick Start: Deploy to Railway (Free & Easy)

Railway is the easiest way to deploy ShopHub. It's free, fast, and requires minimal configuration.

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start Project" 
3. Login with GitHub

### Step 2: Deploy from GitHub
1. Click "Deploy from GitHub"
2. Select `saptak69/Shophub` repository
3. Click "Deploy"

Railway will automatically:
- Detect Node.js project
- Install dependencies
- Set up the server
- Generate a live URL

### Step 3: Access Your Live Store
Your site will be live at: `https://shophub-[random].railway.app`

---

## Alternative: Deploy to Render (Also Free)

### Step 1: Sign Up
1. Go to [render.com](https://render.com)
2. Connect GitHub account

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Select `saptak69/Shophub` 
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Click "Create Web Service"

### Step 3: Wait for Deployment
- Build takes ~2-3 minutes
- Access at: `https://shophub-[random].onrender.com`

---

## Alternative: Deploy to Heroku (Paid, But Popular)

### Step 1: Install Heroku CLI
```bash
# Windows
choco install heroku-cli

# Or download from heroku.com/windows
```

### Step 2: Login & Deploy
```bash
heroku login
cd f:\projects\Ecommerce
heroku create shophub-[yourname]
git push heroku main
```

### Step 3: Your Site is Live!
- Access at: `https://shophub-[yourname].herokuapp.com`

---

## Setting Environment Variables ⚙️

### For Railway:
1. Go to Variables tab
2. Add:
   ```
   NODE_ENV=production
   JWT_SECRET=your_secret_key_here_make_it_random
   PORT=5000
   ```

### For Render:
1. Go to Environment tab
2. Add same variables

### For Heroku:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key_here
```

---

## Database & Data Storage 📊

Currently uses file-based JSON storage (works great for small projects).

### For Production Upgrade (Future):
To scale beyond 1000 users, consider upgrading to:
1. **MongoDB Atlas** (free tier available)
2. **Firebase Realtime Database**
3. **PostgreSQL with Railway/Render**

### Current Storage:
- Users: `data/users.json`
- Products: `data/products.json`
- Orders: `data/orders.json`

---

## Custom Domain 🌐

### Railway Custom Domain:
1. Go to Settings → Custom Domains
2. Add your domain (e.g., shophub.com)
3. Point DNS CNAME to Railway's URL

### Render Custom Domain:
1. Go to Settings → Custom Domain
2. Add domain and configure DNS

---

## Monitoring & Logs 📋

### Railway:
- View real-time logs in Dashboard
- Monitor CPU, Memory usage

### Render:
- Check Logs in Dashboard
- View deployment history

### Check Health:
```bash
curl https://your-deployed-url/api/health
# Should return: {"status":"OK","message":"Server is running"}
```

---

## Admin Access 👨‍💼

Default admin account (change after login):
- **Email**: admin@shophub.com
- **Password**: admin123

### To Create New Admin:
1. Register a normal account
2. Modify `data/users.json` directly (change `"role": "user"` to `"role": "admin"`)
3. Restart the server

---

## Testing the Live Store ✅

### Test User Registration:
1. Go to Login page
2. Click "Register"
3. Create account with: `test@email.com` / `password123`

### Test Shopping Flow:
1. Browse products
2. Add items to cart
3. Checkout with shipping info
4. View order in profile

### Test Admin Panel:
1. Login with admin account
2. Go to Admin page
3. View all orders
4. Manage products

---

## Performance Tips ⚡

1. **Cache products**: Server caches in memory
2. **Minimize images**: Using Unsplash CDN (fast globally)
3. **Enable GZIP**: Automatically enabled on Railway/Render
4. **Use CDN**: Add Cloudflare for free CDN

---

## Troubleshooting 🔧

### Site Not Loading?
```bash
# Check if server is running
curl https://your-deployed-url/api/health
```

### 500 Errors?
- Check logs in Dashboard
- Verify environment variables are set
- Ensure JWT_SECRET is configured

### Can't Login?
- Check if users.json exists (it's created on first run)
- Try registering new account
- Check browser console for errors

### Products Not Showing?
- Visit `/api/seed` endpoint to load sample products
- Check if products.json is populated

---

## Next Steps After Deployment 🎯

1. ✅ **Custom Domain**: Add your domain
2. ✅ **SSL Certificate**: Automatic on Railway/Render
3. ✅ **Database Migration**: Upgrade to MongoDB/PostgreSQL
4. ✅ **Payment Gateway**: Add Stripe integration
5. ✅ **Email Service**: Send order confirmations
6. ✅ **Analytics**: Add Google Analytics

---

## Support & Resources 📚

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [Express.js Guide](https://expressjs.com)

---

**Your ShopHub store is now live! 🎉**
