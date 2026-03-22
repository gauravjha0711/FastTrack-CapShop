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
│       └── CapShop.AdminService/
│
└── CapShop.sln