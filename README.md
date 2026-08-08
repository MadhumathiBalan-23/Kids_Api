# Kids_Api — TinyTots Kids Mart REST API Server (SQLite & Prisma ORM)

<p align="center">
  <b>Modular, High-Performance Node.js & Express RESTful API Server powered by SQLite and Prisma ORM</b>
</p>

---

## 📁 Architectural Overview & Directory Structure

```text
MarketAppAPI/
│
├── prisma/
│   ├── schema.prisma                # SQLite schema (User, Category, Product, Banner, Cart, Order, Notification)
│   ├── seed.js                      # Database seeder with kids wear catalog
│   └── dev.db                       # Local SQLite database file
│
├── src/
│   ├── config/
│   │      db.js                     # PrismaClient database connection & utilities
│   │      jwt.js                    # JWT configuration, sign & verify helpers
│   │
│   ├── controllers/
│   │      auth.controller.js        # User authentication & token generation
│   │      category.controller.js    # Kids department categories handlers
│   │      banner.controller.js      # Promotional carousel banners handlers
│   │      product.controller.js     # Catalog search, filter & flash deals handlers
│   │      cart.controller.js        # Cart calculation & promo code validation
│   │      order.controller.js       # Order creation & order history handlers
│   │      profile.controller.js     # User profile, avatars & Sparks loyalty points
│   │      notification.controller.js# Alerts, notifications & read status
│   │
│   ├── routes/
│   │      auth.routes.js            # /api/auth/*
│   │      category.routes.js        # /api/categories/*
│   │      banner.routes.js          # /api/banners/*
│   │      product.routes.js         # /api/products/*
│   │      cart.routes.js            # /api/cart/*
│   │      order.routes.js           # /api/orders/*
│   │      profile.routes.js         # /api/profile/*
│   │      notification.routes.js    # /api/notifications/*
│   │
│   ├── middleware/
│   │      auth.js                   # JWT authentication & role-based access control
│   │      upload.js                 # Multer image upload & validation middleware
│   │      errorHandler.js           # Global centralized error handler
│   │      logger.js                 # HTTP request logger
│   │
│   ├── models/
│   │      User.js                   # User schema & database operations
│   │      Category.js               # Category schema & queries
│   │      Product.js                # Product schema, search & filter queries
│   │      Banner.js                 # Promotional banner schema
│   │      Cart.js                   # Cart state & persistence
│   │      Order.js                  # Order processing schema
│   │      Notification.js           # Notification & alert schema
│   │      data.js                   # High-quality seed data
│   │
│   ├── services/
│   │      auth.service.js           # Auth business logic
│   │      order.service.js          # Order processing & total computation
│   │      cart.service.js           # Cart coupon calculations & discounts
│   │      notification.service.js   # Notification delivery logic
│   │
│   ├── utils/
│   │      apiResponse.js            # Standardized JSON response formatting
│   │      generateToken.js          # Token generator helper
│   │
│   ├── app.js                       # Express app configuration & middleware pipeline
│   └── server.js                    # HTTP listener entrypoint
│
├── uploads/                         # Directory for uploaded product images & avatars
├── package.json
└── .env
```

---

## 📡 Complete REST API Documentation

### 1. 🔐 Authentication (`/api/auth`)

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer account | No |
| `POST` | `/api/auth/login` | Login and receive JWT access token | No |
| `GET` | `/api/auth/me` | Get current authenticated user profile | **Yes (Bearer JWT)** |

**Register Request Body:**
```json
{
  "name": "Madhumathi",
  "email": "madhu@example.com",
  "password": "Password123!",
  "pincode": "641001",
  "phone": "+91 98765 43210"
}
```

---

### 2. 🗂️ Categories (`/api/categories`)

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Get all kids categories (Girls, Boys, Toys, etc.) | No |
| `GET` | `/api/categories/:id` | Get details for single category | No |
| `POST` | `/api/categories` | Create new category | **Yes (Admin)** |

---

### 3. 🎠 Promotional Banners (`/api/banners`)

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/banners` | Get active promotional hero banners | No |
| `POST` | `/api/banners` | Create banner with optional image upload | **Yes (Admin)** |

---

### 4. 👗 Products & Search (`/api/products`)

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Get products (Supports `?category=`, `?search=`, `?isDealOfDay=`) | No |
| `GET` | `/api/products/deals/today` | Get Deals of the Day / Flash offers | No |
| `GET` | `/api/products/:id` | Get single product specifications & details | No |
| `POST` | `/api/products` | Create product with image upload (`upload.single('image')`) | **Yes (Admin)** |

---

### 5. 🛒 Shopping Cart (`/api/cart`)

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/cart/calculate` | Compute real-time subtotal, coupons & discounts | No |
| `GET` | `/api/cart` | Get persisted user cart | Optional |
| `POST` | `/api/cart/update` | Update cart items list | Optional |
| `DELETE` | `/api/cart/clear` | Empty user cart | Optional |

**Calculate Cart Request Body:**
```json
{
  "items": [
    { "productId": "p1", "quantity": 2 },
    { "productId": "p3", "quantity": 1 }
  ],
  "promoCode": "KIDS50"
}
```

---

### 6. 📦 Orders (`/api/orders`)

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Place order (guest or authenticated) | Optional |
| `GET` | `/api/orders/my-orders` | Fetch logged-in user order history | **Yes (Bearer JWT)** |
| `GET` | `/api/orders/:id` | Get tracking details for an order | Optional |
| `GET` | `/api/orders` | View all customer orders | **Yes (Admin)** |
| `PATCH` | `/api/orders/:id/status`| Update order status | **Yes (Admin)** |

---

### 7. 👤 User Profile & VIP Sparks (`/api/profile`)

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Get user account info | **Yes (Bearer JWT)** |
| `PUT` | `/api/profile` | Update profile / upload avatar (`upload.single('avatar')`) | **Yes (Bearer JWT)** |
| `GET` | `/api/profile/sparks` | Get TinyTots VIP Sparks balance & club tier | **Yes (Bearer JWT)** |

---

### 8. 🔔 Notifications (`/api/notifications`)

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Fetch user notification alerts & offers | Optional |
| `PATCH`| `/api/notifications/:id/read` | Mark alert as read | Optional |

---

## 🚀 How to Run the Server

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (with nodemon auto-restart):
npm run dev

# 3. Run in production mode:
npm start
```
