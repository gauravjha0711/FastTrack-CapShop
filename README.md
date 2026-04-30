# CapShop - Microservices ECommerce Application - Made by Gaurav Kumar

CapShop is a full-stack microservices-based eCommerce web application built with React, ASP.NET Core Web API, Ocelot API Gateway, SQL Server, and EF Core Code First.

The application supports two major roles:

- Customer
- Admin

Customers can browse products, manage cart, complete checkout, place orders, and track order history.

Admins can manage products, update stock, monitor orders, update order status, and view dashboard reports.

---

## Tech Stack

### Frontend
- React
- React Router DOM
- Axios
- Bootstrap / React-Bootstrap

### Backend
- ASP.NET Core Web API
- Ocelot API Gateway
- Entity Framework Core Code First
- SQL Server
- JWT Authentication

---

## Project Structure

```bash
FastTrack-CapShop/
│
├── frontend/
│   └── capshop-client/
│
├── backend/
│   ├── gateways/
│   │   └── CapShop.Gateway/
│   │
│   └── services/
│       ├── CapShop.AuthService/
│       ├── CapShop.CatalogService/
│       ├── CapShop.OrderService/
│       ├── CapShop.PaymentService/
│       └── CapShop.AdminService/
│
└── CapShop.sln
```

---

## 💳 Payment Integration (Razorpay)

CapShop uses **Razorpay** for payment processing with support for:
- 💳 **Card Payments** (Debit/Credit)
- 📱 **UPI Payments** (VPA, QR Code, Intent)
- 🏦 **Net Banking**
- 💵 **Cash on Delivery (COD)**

### Test Mode Configuration

The application is configured for **Razorpay Test Mode** for safe development and testing.

**Test Credentials:**
```
Key ID: rzp_test_SjIcmIwNFAUVLb
Key Secret: eJTIHEkJv4pHBOKYP2zIFVGf
```

### Quick Test Payment

**Test Card (Success):**
```
Card: 5267 3181 8797 5449
CVV: 123
Expiry: 12/26
```

**Test UPI (Success):**
```
VPA: success@razorpay
```

### 📚 Payment Documentation

For detailed payment testing instructions, refer to:
- **[Payment Testing Guide](RAZORPAY_TEST_GUIDE.md)** - Complete testing guide in Hinglish
- **[Dashboard Setup Guide](RAZORPAY_DASHBOARD_SETUP.md)** - Razorpay dashboard configuration
- **[Quick Reference](PAYMENT_TESTING_QUICK_REFERENCE.md)** - Quick copy-paste test data
- **[Fix Summary](PAYMENT_FIX_SUMMARY.md)** - Technical implementation details

---