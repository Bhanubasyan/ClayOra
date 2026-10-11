# 🏺 ClayOra - Handmade Pottery Marketplace

<h1 align="center">
🏺 ClayOra
</h1>

<h3 align="center">
Crafting Traditions • Connecting Artisans • Delivering Handmade Excellence
</h3>

<p align="center">

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>

<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>

<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>

<img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white"/>

<img src="https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge"/>

<img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge"/>

</p>

## Hyperlocal festival marketplace

Clayora now supports admin-configured geographic delivery zones and reusable seasonal campaigns. The first supported storefront route is `/festival/navratri`; its banner, dates, zones, categories, products, sellers, and offers come from MongoDB and disappear automatically when the campaign is inactive or outside its date window.

Every campaign is a central sale record. Administrators can keep a sale available everywhere or enable **location-based sale** and assign any number of delivery zones. This supports combinations such as Navratri in Delhi/Noida and Diwali in Dehradun without creating new source-code pages. Location selection and zone validation are mandatory only for campaigns configured as location-based.

### Local launch workflow

1. Start MongoDB and the existing backend/frontend applications.
2. Sign in as an administrator and open **Festival Campaign Management** on `/admin`.
3. Create `Clayora Noida Zone 1` with the administrator-approved center coordinates, radius, fee, minimum order, ETA, and COD policy. The center is never hardcoded.
4. Create or activate `Sharad Navratri 2026` (October 11–20, 2026, `Asia/Kolkata`) and select the zone.
5. Sellers save their store map pin and request zone and campaign access from Seller Profile.
6. The administrator approves both requests.
7. Sellers add real products, ingredients, declared vrat suitability, stock, festival category, applicable zone, and optional seasonal price. Existing product approval still applies.
8. Customers select a GPS/map-pin location. The server rechecks the zone, seller coverage, stock, totals, payment policy, and minimum order at checkout.

The MVP intentionally keeps one seller per order. Adding an item from another seller returns a clear error and does not replace the cart.

### Optional development-only seed

The seed creates only an **inactive** zone and campaign/category configuration. It never creates sellers, products, prices, reviews, customers, or orders. Coordinates must be supplied explicitly:

```env
DEMO_SEED=true
DEMO_ZONE_LATITUDE=your_admin_approved_latitude
DEMO_ZONE_LONGITUDE=your_admin_approved_longitude
```

```bash
cd backend/server
npm run seed:festival-demo
```

### Added API surface

- `GET /api/delivery-zones`, `POST /api/delivery-zones/check`, `POST /api/delivery-zones/notify`
- Admin-protected `POST /api/delivery-zones`, `PATCH /api/delivery-zones/:id`
- `GET /api/festivals/active`, `GET /api/festivals/:slug`
- Admin campaign CRUD/analytics and seller participation review under `/api/festivals/admin`
- Seller store pin and zone requests under `/api/seller`
- Existing `GET /api/products` accepts `festival`, `festivalCategory`, and `zoneId`

### Verification

```bash
cd backend/server
npm test

cd ../../../frontend
npm run build
```

The backend tests cover coordinate validation and a 3 km boundary calculation. Checkout also uses conditional atomic stock deductions with rollback of partial reservations; cancellation restores inventory only when that order actually reserved it.

---

# 🌐 Live 

<p align="center">

## 🚀 **[👉 Live Website](https://clayora.onrender.com/)**

</p>

---

# 📸 Project Preview

<p align="center">

<img src="screenshots/home.png" width="90%">

</p>

---

# ✨ About ClayOra

ClayOra is a modern full-stack marketplace built to empower local artisans by providing a digital platform for selling handmade pottery and wooden crafts.

The platform enables customers to discover authentic handcrafted products while giving sellers powerful tools to manage their business.

---

# 🚀 Key Features

## 👤 Customer

* 🏺 Browse Handmade Products
* 🔍 Smart Product Search
* 🏷 Category & Tag Filtering
* ❤️ Beautiful Product Details
* 🛒 Shopping Cart
* 💳 Secure Checkout
* 📱 Fully Responsive Design

---

## 🛍 Seller

* Seller Dashboard
* Add Products
* Upload Images
* Product Tags
* Product Management
* Order Management
* Inventory Control

---

## 👨‍💻 Admin

* Product Approval
* User Management
* Seller Management
* Marketplace Monitoring
* Product Moderation

---

# 🛠 Tech Stack

## Frontend

* React.js
* React Router DOM
* Axios
* CSS3
* React Icons

---

## Backend

* Node.js
* Express.js
* JWT Authentication
* Multer
* Cloudinary

---

## Database

* MongoDB Atlas
* Mongoose

---

# 📂 Project Structure

```text
ClayOra
│
├── frontend
│   ├── src
│   │
│   ├── pages
│   ├── components
│   ├── assets
│   ├── services
│   └── App.js
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   └── server.js
│
└── README.md
```

---

# 🏆 Features Overview

| Module            | Status |
| ----------------- | :----: |
| Authentication    |    ✅   |
| JWT Login         |    ✅   |
| Seller Dashboard  |    ✅   |
| Admin Dashboard   |    ✅   |
| Product Approval  |    ✅   |
| Product Tags      |    ✅   |
| Category Filter   |    ✅   |
| Cart              |    ✅   |
| Checkout          |    ✅   |
| Product Search    |    ✅   |
| Cloudinary Upload |    ✅   |
| MongoDB Atlas     |    ✅   |

---

# 📷 Screenshots

## 🏠 Home Page

<img src="screenshots/home.png">

---

## 🛍 Product Details

<img src="screenshots/product.png">

---

## 👤 Seller Dashboard

<img src="screenshots/seller.png">

---

## 👨‍💻 Admin Dashboard

<img src="screenshots/admin.png">

---

# ⚙ Installation

### Clone Repository

```bash
git clone https://github.com/Bhanubasyan/ClayOra
```

---

### Frontend

```bash
cd frontend
npm install
npm start
```

---

### Backend

```bash
cd backend
npm install
npm start
```

---

# 🔐 Environment Variables

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

# Email (Brevo API - works on Render Free)
CLIENT_URL=http://localhost:3000
BREVO_API_KEY=your_brevo_api_key
# The sender email must be verified in Brevo.
EMAIL_FROM=ClayOra <your-verified-email@example.com>
```

---

# 🌟 Upcoming Features

* ❤️ Wishlist
* ⭐ Product Reviews
* 💳 Razorpay Payment Gateway
* 📦 Order Tracking
* 🔔 Notifications
* 🤖 AI Product Recommendation
* 📈 Seller Analytics
* 🌍 Multi Language Support
* 📱 Progressive Web App
* 📊 Sales Dashboard

---

# 🚀 Why ClayOra?

✅ Modern MERN Stack Architecture

✅ Secure JWT Authentication

✅ Cloud Image Storage

✅ Responsive UI

✅ Scalable Backend

✅ Role Based Access Control

✅ Real Marketplace Workflow

---

# 👨‍💻 Developer

## **Bhanu**

🎓 B.Tech CSE Student

🌐 Portfolio: https://bhanubasyan.github.io/My-Portfolio/

💼 LinkedIn: https://www.linkedin.com/in/bhanu-b82596253/

📧 Email: bhanubasyan@gmail.com

🐙 GitHub: https://github.com/Bhanubasyan

---

# 🤝 Contributing

Contributions are always welcome.

1. Fork the repository

2. Create a new branch

3. Commit your changes

4. Push your branch

5. Open a Pull Request

---

# ⭐ Support

If you like this project...

⭐ Star this repository

🍴 Fork it

💬 Share your feedback

---

<p align="center">

# ❤️ Made with Love using React, Node.js, Express & MongoDB ❤️

### ⭐ Don't forget to Star this Repository ⭐

</p>
