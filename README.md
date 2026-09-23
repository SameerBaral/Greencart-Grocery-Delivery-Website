# 🛒 GreenCart - Modern E-Commerce Grocery Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://reactjs.org/)
[![Author](https://img.shields.io/badge/Author-Sameer%20Baral-blue.svg)](https://github.com/SameerBaral)

**GreenCart** is a full-featured, responsive, full-stack grocery shopping application built using the **MERN (MongoDB, Express, React, Node.js)** stack. It offers an intuitive online shopping experience for users along with an integrated Seller Dashboard for inventory management, real-time product updates, and order fulfillment.

---

## ✨ Key Features

### 👤 User Features
- 🔐 **Authentication & Authorization**: Secure signup, login, and JWT token-based auth state persistence.
- 🛍️ **Dynamic Product Catalog**: Browse groceries across multiple categories (Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks).
- 🔍 **Real-time Search & Filtering**: Instantly search items or filter products by specific categories.
- 🛒 **Cart Management**: Add items, update quantities, dynamic tax and total calculations, and seamless cart state synchronization.
- 📍 **Address Book**: Save and manage delivery addresses.
- 💳 **Multiple Payment Options**:
  - **Online Payment**: Integrated with **Stripe Checkout** (Instant session verification).
  - **Cash on Delivery (COD)**: Quick one-click order placement.
- 📦 **Order Tracking**: View order history, status updates, total amounts, and item details under "My Orders".

### 🏪 Seller / Admin Dashboard
- 📊 **Dashboard Overview**: Access seller portal with dedicated auth credentials.
- ➕ **Product Management**: Add new products with image uploading via **Cloudinary**, category tags, and pricing.
- 📋 **Order Management**: Monitor customer orders, payment status (Paid / Pending), delivery details, and order progress.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Icons & Assets**: Custom SVG assets & React Hot Toast for UI notifications
- **HTTP Client**: Axios (with global interceptors & credentials)

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcrypt Password Hashing
- **Cloud Media Storage**: Cloudinary SDK (for product images)
- **Payment Processing**: Stripe Node SDK (Checkout Sessions & Verification)

---

## 📁 Folder Structure

```text
greencart-grocery-mern-website/
├── client/                 # Frontend React Application
│   ├── public/             # Static Assets
│   └── src/
│       ├── assets/         # App icons, banners, and default product images
│       ├── components/     # UI Components (Navbar, Footer, Modals, Banners)
│       ├── context/        # AppContext for global state management
│       ├── pages/          # Application Pages (Home, Cart, MyOrders, Admin/Seller)
│       ├── App.jsx         # Routes setup
│       └── main.jsx        # Entry point
│
└── server/                 # Backend Node.js Express API
    ├── configs/            # Database (MongoDB) & Cloudinary setup
    ├── controllers/        # Business logic handlers (User, Product, Cart, Order)
    ├── middlewares/        # JWT Authentication middlewares (User & Seller)
    ├── models/             # Mongoose schemas (User, Product, Order, Address)
    ├── routes/             # Express API routes
    └── server.js           # Main Express server file
```

---

## 🚀 Quick Start & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or above)
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas Cluster)
- [Cloudinary Account](https://cloudinary.com/) (For product image management)
- [Stripe Account](https://stripe.com/) (For test/live payment processing)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SameerBaral/Greencart-Grocery-Delivery-Website.git
   cd Greencart-Grocery-Delivery-Website
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   ```
   Create a `.env` file inside `client/`:
   ```env
   VITE_CURRENCY = "₹"
   VITE_BACKEND_URL = "http://localhost:4000"
   ```

3. **Backend Setup**
   ```bash
   cd ../server
   npm install
   ```
   Create a `.env` file inside `server/`:
   ```env
   PORT = 4000
   MONGO_URI = your_mongodb_connection_string
   JWT_SECRET = your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name
   CLOUDINARY_API_KEY = your_cloudinary_api_key
   CLOUDINARY_API_SECRET = your_cloudinary_api_secret
   STRIPE_SECRET_KEY = your_stripe_secret_key
   SELLER_EMAIL = seller@example.com
   SELLER_PASSWORD = seller12345
   ```

4. **Run Locally**
   - **Backend**: `cd server && npm run dev` (Runs on `http://localhost:4000`)
   - **Frontend**: `cd client && npm run dev` (Runs on `http://localhost:5173`)

---

## 👤 Author

Developed with ❤️ by **[Sameer Baral](https://github.com/SameerBaral)**

- GitHub: [@SameerBaral](https://github.com/SameerBaral)
- LinkedIn: [Sameer Baral](https://linkedin.com/in/sameerbaral)
