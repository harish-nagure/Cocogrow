# CocoGrow

CocoGrow is a MERN gardening e-commerce application with a database-driven Smart Mix engine and a functional admin console.

## Stack
- React + Vite + JSX
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs

## Features
- Customer registration/login
- Product catalogue, search, filtering and sorting
- Product details and cart
- Smart Mix: environment → category → plant → quantity → calculated custom mix
- Persistent CustomMix documents
- Checkout and COD/online-payment-ready order flow
- Customer order history and order details
- Customer profile/address management
- Admin dashboard
- Product, plant, ingredient and mix-rule CRUD
- Ingredient inventory management
- Order status management
- User activation/deactivation
- MongoDB aggregation reports

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Set `MONGO_URI` in `backend/.env` to your MongoDB Atlas URI or local MongoDB database.

Development admin:
- Email: `admin@cocogrow.com`
- Password: `Admin@123`

Change this password for any non-demo deployment.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Default API URL is `http://localhost:5000/api`.

## Smart Mix flow
Admin creates Plants, Ingredients and Mix Rules. A Mix Rule must total exactly 100%. Customers select an environment, category, plant and quantity. The backend calculates the formula, saves a `CustomMix` document and returns its `customMixId`. Checkout sends only product/custom-mix IDs and quantities; the backend retrieves authoritative prices and validates inventory.

The current formulas are demonstration formulations and should be validated by a qualified horticultural professional before commercial use.

## Notes
Order creation uses MongoDB transactions when the deployment supports them. MongoDB Atlas is recommended for production checkout/inventory consistency.
