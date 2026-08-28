# Riya Common Backend --- Master Implementation Plan

## 0. Purpose

This document is the **source of truth for the Riya demo e-commerce
backend**.

The backend is intentionally small, cheap, fast, and practical. It is a
modular NestJS REST API backed by Supabase. It serves two separate
Next.js applications:

-   `riya-ecom-ui` --- customer-facing e-commerce website
-   `riya-dashboard` --- client/admin dashboard
-   `riya-backend` --- common NestJS backend

The project is a **demo for a client**, not a production marketplace
with real-scale traffic.

### Core principle

Do not introduce infrastructure unless the project actually needs it.

Do **not** add:

-   Microservices
-   Redis
-   Kafka
-   RabbitMQ
-   Elasticsearch
-   Kubernetes
-   Complex queues
-   Complex event-driven architecture
-   Multiple databases
-   Unnecessary third-party services

Use one NestJS application and one Supabase project.

------------------------------------------------------------------------

# 1. Repository Structure

``` text
riya-ecom/
│
├── riya-ecom-ui/          # Next.js customer storefront
│
├── riya-dashboard/        # Next.js admin/dashboard
│
└── riya-backend/          # NestJS common backend
```

The backend must be independent of either frontend.

Both frontends communicate with the same REST API.

``` text
                         ┌─────────────────────┐
                         │      Supabase       │
                         │                     │
                         │ PostgreSQL          │
                         │ Auth                │
                         │ Storage             │
                         └──────────┬──────────┘
                                    │
                                    │
                         ┌──────────▼──────────┐
                         │     riya-backend    │
                         │       NestJS        │
                         │                     │
                         │ REST API            │
                         │ Business logic      │
                         │ Validation           │
                         │ JWT authentication  │
                         │ Admin authorization │
                         └─────────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼─────────┐         ┌─────────▼─────────┐
          │  riya-ecom-ui     │         │  riya-dashboard   │
          │     Next.js       │         │     Next.js       │
          └───────────────────┘         └───────────────────┘
```

------------------------------------------------------------------------

# 2. Technology Stack

## Backend

-   NestJS
-   TypeScript
-   REST API
-   Supabase JS client
-   PostgreSQL through Supabase
-   Supabase Auth
-   Supabase Storage
-   JWT authentication
-   HTTP cookies for authentication
-   Swagger/OpenAPI
-   DTO validation
-   Jest / Nest testing tools

## Frontends

The backend must not depend on frontend implementation details.

The frontends are:

-   Next.js
-   `riya-ecom-ui`
-   `riya-dashboard`

## Deployment

``` text
riya-ecom-ui    → Netlify
riya-dashboard  → Netlify
riya-backend    → Render or Railway
Database        → Supabase
Storage         → Supabase Storage
Authentication  → Supabase Auth
```

------------------------------------------------------------------------

# 3. Important Scope Decisions

## This is a demo

Optimize for:

1.  Simplicity
2.  Development speed
3.  Low cost
4.  Clear architecture
5.  Easy future modification

Do not optimize prematurely for millions of users.

------------------------------------------------------------------------

# 4. Authentication

Customer accounts are required.

Guest checkout is also required.

Supabase Auth is used for authentication.

The backend should validate authenticated requests using JWTs.

Authentication flow:

``` text
Customer
   │
   ▼
Supabase Auth
   │
   ▼
JWT
   │
   ▼
Frontend stores authentication using secure cookies
   │
   ▼
NestJS receives request
   │
   ▼
JWT validation
   │
   ▼
Authorized request
```

There is no need to build a custom password authentication system.

Supabase Auth handles:

-   Sign up
-   Sign in
-   Sign out
-   Password reset if required later

The backend handles:

-   Authorization
-   Customer/admin access rules
-   Protected resources

------------------------------------------------------------------------

# 5. Roles

Keep roles simple.

``` text
CUSTOMER
ADMIN
```

Do not add STAFF, SUPER_ADMIN, MODERATOR, etc. unless the client later
requires them.

The dashboard is an admin application.

------------------------------------------------------------------------

# 6. Cart Architecture

The cart is intentionally **not stored in Supabase**.

Use frontend state and localStorage.

``` text
Browser
   │
   ▼
React state
   │
   ▼
localStorage
```

The cart should contain only identifiers and quantities.

Example:

``` json
{
  "items": [
    {
      "variantId": "uuid",
      "quantity": 2
    }
  ]
}
```

Do not trust frontend prices.

At checkout:

``` text
Frontend Cart
     │
     ▼
POST /api/v1/orders
     │
     ▼
NestJS
     │
     ├── Validate product variant
     ├── Validate stock
     ├── Retrieve current price
     ├── Calculate subtotal
     ├── Calculate shipping
     ├── Calculate total
     └── Create order
           │
           ▼
       Supabase
```

------------------------------------------------------------------------

# 7. Guest Checkout

Guest checkout is required.

A customer does not need an account to place an order.

Guest checkout collects:

``` text
customer_name
phone
email
address_line
city
district
state
pincode
```

The order must store the shipping/customer information as a snapshot.

This prevents an old order from changing if a customer later changes
their profile.

Registered customers can also place orders.

------------------------------------------------------------------------

# 8. Database Architecture

The database should remain small.

Required tables:

``` text
profiles
categories
products
product_variants
orders
order_items
order_status_history
contact_settings
store_settings
```

Optional/derived dashboard queries can be generated directly from
orders.

No cart tables are required.

No coupon tables are required.

No notification tables are required.

No payment transaction system is required for V1 because the payment
method is COD.

------------------------------------------------------------------------

# 9. Database Schema

## 9.1 profiles

Used to store application-level user information.

``` text
profiles
---------
id
user_id
name
phone
role
created_at
updated_at
```

`user_id` corresponds to the Supabase Auth user.

Role:

``` text
CUSTOMER
ADMIN
```

------------------------------------------------------------------------

## 9.2 categories

Categories are admin-editable.

``` text
categories
----------
id
name
slug
description
image_url
is_active
created_at
updated_at
```

Examples:

``` text
Groundnut Oil
Gingelly Oil
Coconut Oil
Sunflower Oil
```

The dashboard can:

-   Create
-   Edit
-   Delete
-   Enable/disable

categories.

------------------------------------------------------------------------

# 10. Products

``` text
products
--------
id
name
slug
description
short_description
category_id
weight
ingredients
thumbnail_url
images
is_featured
is_active
created_at
updated_at
```

Required product fields:

-   Name
-   Slug
-   Description
-   Short description
-   Category
-   Weight
-   Ingredients
-   Thumbnail
-   Images
-   Featured flag
-   Active flag

`images` can be represented as an array of Supabase Storage URLs.

Example:

``` json
[
  "https://.../product-front.jpg",
  "https://.../product-back.jpg"
]
```

Product images are stored in Supabase Storage.

The backend stores their URLs.

------------------------------------------------------------------------

# 11. Product Variants

Oil products have multiple sizes.

Do not create separate products for every size.

Example:

``` text
Gingelly Oil
│
├── 200ml
├── 500ml
├── 1L
├── 3L
├── 5L
└── 15L
```

Database:

``` text
product_variants
----------------
id
product_id
name
size
unit
sku
price
sale_price
stock
is_active
created_at
updated_at
```

Example:

``` text
product:
Gingelly Oil

variants:
200ml → ₹90
500ml → ₹210
1L    → ₹390
3L    → ₹1050
5L    → ₹1650
15L   → ₹4200
```

Each variant has independent stock.

------------------------------------------------------------------------

# 12. Inventory

Stock is tracked at the variant level.

Example:

``` text
Gingelly Oil / 1L
stock = 42
```

When an order is successfully created:

``` text
stock = stock - ordered_quantity
```

Stock must be validated server-side.

Never trust stock information from the frontend.

The dashboard can:

-   View stock
-   Edit stock
-   Enable/disable variants

------------------------------------------------------------------------

# 13. Orders

``` text
orders
------
id
order_number
user_id
customer_name
customer_phone
customer_email
shipping_address
city
district
state
pincode
subtotal
shipping_fee
total
payment_method
payment_status
status
created_at
updated_at
```

For this project:

``` text
payment_method = COD
payment_status = PENDING
```

Payment integration is intentionally excluded from V1.

The database should still have the fields so online payment can be added
later.

------------------------------------------------------------------------

# 14. Order Items

``` text
order_items
-----------
id
order_id
product_id
variant_id
product_name
variant_name
quantity
unit_price
total_price
created_at
```

Important:

Store the product name and unit price at order time.

Do not rely on the current product price when displaying historical
orders.

Example:

``` text
Order created:
Gingelly Oil 1L = ₹390

Product later changes:
Gingelly Oil 1L = ₹450

Old order must still show:
₹390
```

------------------------------------------------------------------------

# 15. Order Status

Order status should be explicit.

``` text
PENDING
CONFIRMED
PROCESSING
PACKED
SHIPPED
DELIVERED
CANCELLED
```

This is intentionally more detailed because the dashboard should clearly
reflect order progress.

Recommended lifecycle:

``` text
PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
PACKED
   ↓
SHIPPED
   ↓
DELIVERED
```

Cancellation:

``` text
PENDING → CANCELLED
CONFIRMED → CANCELLED
```

Once an order is:

``` text
PROCESSING
PACKED
SHIPPED
DELIVERED
```

the customer cannot cancel it through the normal customer API.

Admin can manage exceptional cases.

------------------------------------------------------------------------

# 16. Order Status History

Every status update should create a history record.

``` text
order_status_history
--------------------
id
order_id
status
note
updated_by
created_at
```

Example:

``` text
Order #RIYA-1023

10:20
PENDING
Order placed

10:45
CONFIRMED
Order confirmed by admin

14:00
PROCESSING
Order is being prepared

Next day
PACKED
Package prepared

Next day
SHIPPED
Order handed to delivery
```

This is shown in the dashboard.

The customer can also see the current order status and optionally its
history.

------------------------------------------------------------------------

# 17. Shipping

Use simple shipping.

No location-based shipping engine.

Store configurable settings:

``` text
shipping_fee
free_shipping_threshold
```

Example:

``` text
Order < ₹999
→ ₹50 shipping

Order >= ₹999
→ Free shipping
```

These values are configurable through `store_settings`.

------------------------------------------------------------------------

# 18. Store Settings

``` text
store_settings
--------------
id
store_name
currency
shipping_fee
free_shipping_threshold
support_phone
support_email
updated_at
```

The dashboard can edit these settings.

The e-commerce frontend can retrieve them through:

``` http
GET /api/v1/settings
```

------------------------------------------------------------------------

# 19. Contact Settings

The contact page is editable through Supabase.

No contact form is required.

``` text
contact_settings
----------------
id
business_name
phone
email
whatsapp
address
google_maps_url
instagram_url
facebook_url
business_hours
updated_at
```

Public:

``` http
GET /api/v1/content/contact
```

Admin:

``` http
PATCH /api/v1/admin/content/contact
```

The frontend does not hardcode these values.

------------------------------------------------------------------------

# 20. Homepage

The homepage is intentionally static.

Do not build a CMS/page builder.

The following remain in frontend code:

-   Hero
-   About section
-   Homepage layout
-   Static marketing copy

Product information should still come from the backend.

This keeps the demo simple and fast.

------------------------------------------------------------------------

# 21. API Design

Use REST.

Base URL:

``` text
/api/v1
```

Example:

``` text
GET /api/v1/products
```

------------------------------------------------------------------------

# 22. Public Product APIs

## List products

``` http
GET /api/v1/products
```

Supported query parameters:

``` text
search
category
page
limit
sort
```

Example:

``` http
GET /api/v1/products?search=gingelly
```

``` http
GET /api/v1/products?category=gingelly-oil
```

``` http
GET /api/v1/products?page=1&limit=20
```

Search must support:

-   Product name
-   Category

Do not implement full-text search infrastructure.

Use PostgreSQL queries suitable for this small demo.

------------------------------------------------------------------------

## Get product

``` http
GET /api/v1/products/:id
```

------------------------------------------------------------------------

## Get categories

``` http
GET /api/v1/categories
```

------------------------------------------------------------------------

# 23. Customer Order APIs

## Create order

``` http
POST /api/v1/orders
```

Request:

``` json
{
  "items": [
    {
      "variantId": "uuid",
      "quantity": 2
    }
  ],
  "customer": {
    "name": "Customer Name",
    "phone": "9876543210",
    "email": "customer@example.com"
  },
  "shippingAddress": {
    "addressLine": "Example address",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "pincode": "641001"
  }
}
```

The server calculates:

``` text
product prices
subtotal
shipping
total
```

The frontend must not send a trusted total.

------------------------------------------------------------------------

## Get customer's orders

``` http
GET /api/v1/orders
```

Requires authenticated customer.

------------------------------------------------------------------------

## Get order

``` http
GET /api/v1/orders/:id
```

Customer can only access their own order.

------------------------------------------------------------------------

## Cancel order

``` http
PATCH /api/v1/orders/:id/cancel
```

Allowed only for cancellable statuses.

------------------------------------------------------------------------

# 24. Admin Product APIs

``` http
GET    /api/v1/admin/products
POST   /api/v1/admin/products
GET    /api/v1/admin/products/:id
PATCH  /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id
```

Admin capabilities:

-   Create
-   Edit
-   Delete
-   Enable/disable
-   Manage variants
-   Manage stock
-   Assign category
-   Upload image URLs
-   Set featured products

------------------------------------------------------------------------

# 25. Admin Category APIs

``` http
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
PATCH  /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id
```

------------------------------------------------------------------------

# 26. Admin Order APIs

``` http
GET   /api/v1/admin/orders
GET   /api/v1/admin/orders/:id
PATCH /api/v1/admin/orders/:id/status
```

Query support:

``` text
status
search
page
limit
```

Admin can:

-   View
-   Filter
-   Search
-   Update status
-   View customer
-   View address
-   View items
-   View total
-   View status history

------------------------------------------------------------------------

# 27. Admin Customer APIs

``` http
GET /api/v1/admin/customers
GET /api/v1/admin/customers/:id
GET /api/v1/admin/customers/:id/orders
```

Dashboard only needs basic customer viewing.

Do not build a complex CRM.

------------------------------------------------------------------------

# 28. Admin Contact APIs

``` http
GET   /api/v1/admin/content/contact
PATCH /api/v1/admin/content/contact
```

------------------------------------------------------------------------

# 29. Admin Settings APIs

``` http
GET   /api/v1/admin/settings
PATCH /api/v1/admin/settings
```

------------------------------------------------------------------------

# 30. Dashboard Analytics

Only simple sales analytics are required.

Provide:

``` http
GET /api/v1/admin/dashboard/stats
```

Response can contain:

``` json
{
  "success": true,
  "data": {
    "totalOrders": 120,
    "totalSales": 48250,
    "pendingOrders": 8,
    "deliveredOrders": 91
  },
  "message": "Dashboard statistics fetched successfully"
}
```

For the graph, provide sales grouped by date.

Example:

``` json
{
  "date": "2026-08-15",
  "sales": 4200
}
```

No advanced analytics.

No analytics warehouse.

No external analytics service.

------------------------------------------------------------------------

# 31. API Response Standard

All API responses should follow:

``` json
{
  "success": true,
  "data": {},
  "message": "Product fetched successfully"
}
```

Errors:

``` json
{
  "success": false,
  "data": null,
  "message": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

Do not expose internal database errors directly to clients.

------------------------------------------------------------------------

# 32. Backend Folder Structure

The NestJS backend should follow a modular architecture.

``` text
riya-backend/
│
├── src/
│   │
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── configuration.ts
│   │   └── env.validation.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── constants/
│   │   └── types/
│   │
│   ├── database/
│   │   ├── database.module.ts
│   │   └── supabase.service.ts
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   └── dto/
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   └── types/
│   │
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── dto/
│   │   └── types/
│   │
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── dto/
│   │   └── types/
│   │
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── dto/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── content/
│   │   ├── content.module.ts
│   │   ├── content.controller.ts
│   │   ├── content.service.ts
│   │   └── dto/
│   │
│   ├── settings/
│   │   ├── settings.module.ts
│   │   ├── settings.controller.ts
│   │   ├── settings.service.ts
│   │   └── dto/
│   │
│   ├── admin/
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── guards/
│   │
│   └── dashboard/
│       ├── dashboard.module.ts
│       ├── dashboard.controller.ts
│       └── dashboard.service.ts
│
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_products.sql
│   │   ├── 003_orders.sql
│   │   └── 004_content.sql
│   │
│   └── seed/
│       └── development.sql
│
├── test/
│
├── .env
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

Do not create every file before it is needed. The AI should implement
modules incrementally.

------------------------------------------------------------------------

# 33. Module Responsibilities

## DatabaseModule

Responsible for:

-   Supabase client
-   Database access configuration
-   Storage client access where necessary

Do not create multiple Supabase clients throughout the application.

------------------------------------------------------------------------

## AuthModule

Responsible for:

-   JWT validation
-   Authentication helpers
-   Current-user extraction
-   Cookie-based authentication
-   Auth guards

Supabase Auth remains the identity provider.

------------------------------------------------------------------------

## UsersModule

Responsible for:

-   Customer profile
-   Role
-   Customer lookup
-   Admin customer viewing

------------------------------------------------------------------------

## ProductsModule

Responsible for:

-   Product listing
-   Product details
-   Search
-   Filtering
-   Product variants
-   Stock
-   Product CRUD

------------------------------------------------------------------------

## CategoriesModule

Responsible for:

-   Categories
-   Category filtering
-   Admin category CRUD

------------------------------------------------------------------------

## OrdersModule

Responsible for:

-   Checkout
-   Order creation
-   Price calculation
-   Shipping calculation
-   Stock validation
-   Stock decrement
-   Order retrieval
-   Cancellation
-   Order status updates
-   Order history

This is the most important business module.

------------------------------------------------------------------------

## ContentModule

Responsible for:

-   Contact settings

Homepage marketing content remains static in frontend code.

------------------------------------------------------------------------

## SettingsModule

Responsible for:

-   Store settings
-   Shipping settings
-   Store contact/support settings where appropriate

------------------------------------------------------------------------

## DashboardModule

Responsible for:

-   Sales statistics
-   Dashboard summary
-   Sales graph data

------------------------------------------------------------------------

# 34. Order Creation Logic

This flow must be implemented carefully.

``` text
POST /orders
      │
      ▼
Validate request DTO
      │
      ▼
Identify user if authenticated
      │
      ▼
Validate customer/shipping details
      │
      ▼
Fetch all requested variants
      │
      ▼
Check all variants exist
      │
      ▼
Check all variants are active
      │
      ▼
Check stock
      │
      ▼
Read current prices from database
      │
      ▼
Calculate subtotal
      │
      ▼
Calculate shipping
      │
      ▼
Calculate final total
      │
      ▼
Create order
      │
      ▼
Create order items
      │
      ▼
Decrease stock
      │
      ▼
Create initial status history
      │
      ▼
Return order
```

The server is authoritative.

------------------------------------------------------------------------

# 35. Order Price Calculation

Never calculate final order totals exclusively in the frontend.

Frontend can show an estimate.

Backend calculates:

``` text
subtotal = sum(item.quantity × current_variant_price)

shipping =
  subtotal >= free_shipping_threshold
    ? 0
    : shipping_fee

total = subtotal + shipping
```

No discount logic exists in V1.

------------------------------------------------------------------------

# 36. Stock Safety

At minimum, validate stock immediately before creating an order.

The backend must reject:

``` text
requested quantity > available stock
```

Example:

``` json
{
  "success": false,
  "data": null,
  "message": "Insufficient stock for Gingelly Oil 1L",
  "code": "INSUFFICIENT_STOCK"
}
```

For this demo, do not introduce a reservation system.

If the project later becomes a real high-volume store, stock
locking/transaction strategy can be strengthened.

------------------------------------------------------------------------

# 37. Customer Order Security

Customers must only access their own orders.

For:

``` http
GET /orders/:id
```

the backend must verify:

``` text
order.user_id == authenticated_user.id
```

For guest orders, use a safe order lookup strategy. Do not expose
arbitrary order data simply because someone knows a sequential ID.

------------------------------------------------------------------------

# 38. Admin Authorization

Admin endpoints must require:

``` text
Authenticated JWT
+
ADMIN role
```

Example:

``` text
GET /admin/orders
```

must reject:

-   unauthenticated users
-   normal customers

------------------------------------------------------------------------

# 39. IDs

Use simple generated IDs.

UUIDs are acceptable for database relationships, but there is no need to
create an elaborate public ID system.

Orders should additionally have a human-readable:

``` text
order_number
```

Example:

``` text
RIYA-10001
RIYA-10002
RIYA-10003
```

This is what the dashboard should primarily display.

------------------------------------------------------------------------

# 40. Supabase Storage

Product images are stored in Supabase Storage.

Recommended bucket:

``` text
product-images
```

The dashboard can upload an image.

The resulting public/signed URL is saved to:

``` text
products.thumbnail_url
products.images
```

The backend must not store image binaries in PostgreSQL.

------------------------------------------------------------------------

# 41. Environment Variables

Create:

``` env
NODE_ENV=development
PORT=3001

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

FRONTEND_URL=
DASHBOARD_URL=

COOKIE_SECRET=
JWT_SECRET=
```

### Required credentials from the project owner

From Supabase:

``` text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

The service role key is backend-only.

It must never be exposed to either Next.js frontend.

The final implementation should use `.env.example` with blank
placeholders.

Never commit `.env`.

------------------------------------------------------------------------

# 42. CORS

Allow only:

``` text
FRONTEND_URL
DASHBOARD_URL
```

during deployment.

Development can allow the local Next.js URLs.

Do not use unrestricted:

``` text
origin: "*"
```

for authenticated production endpoints.

------------------------------------------------------------------------

# 43. Validation

Use NestJS global validation.

All request DTOs must validate:

-   Required fields
-   Types
-   Strings
-   Numbers
-   Quantity limits
-   Email format
-   Pincode format
-   Enum values
-   UUID/id format where applicable

Reject unknown/invalid input where practical.

------------------------------------------------------------------------

# 44. Error Handling

Use centralized NestJS exception handling.

Common error codes:

``` text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
PRODUCT_NOT_FOUND
CATEGORY_NOT_FOUND
VARIANT_NOT_FOUND
INSUFFICIENT_STOCK
ORDER_NOT_FOUND
ORDER_CANNOT_BE_CANCELLED
INVALID_ORDER_STATUS
```

Do not expose stack traces to the frontend.

------------------------------------------------------------------------

# 45. Swagger

Enable Swagger.

Development endpoint:

``` text
/api/docs
```

Document:

-   Auth
-   Products
-   Categories
-   Orders
-   Admin
-   Dashboard
-   Content
-   Settings

Each endpoint should document:

-   Request
-   Response
-   Query parameters
-   Authentication requirements
-   Possible errors

Swagger is part of the development workflow.

------------------------------------------------------------------------

# 46. Testing

Do not chase 100% test coverage.

Test important business logic.

Minimum tests:

## Products

-   Product listing
-   Search
-   Category filtering
-   Product retrieval

## Orders

-   Valid order creation
-   Invalid variant
-   Insufficient stock
-   Price calculated server-side
-   Shipping calculation
-   Stock reduction
-   Cancellation
-   Invalid status transition

## Authorization

-   Customer cannot access another customer's order
-   Customer cannot access admin endpoints
-   Admin can access admin endpoints

## Dashboard

-   Statistics endpoint returns correct values

------------------------------------------------------------------------

# 47. Seed Data

Create simple development data.

Example products:

``` text
Gingelly Oil
Groundnut Oil
Coconut Oil
Sunflower Oil
```

Each should have variants such as:

``` text
200ml
500ml
1L
3L
5L
15L
```

Use realistic but clearly demo-oriented prices.

Seed categories.

Seed products.

Seed variants.

Seed store settings.

Seed contact settings.

Do not seed real customer information.

------------------------------------------------------------------------

# 48. Product Search

For V1:

``` text
search product name
search category
```

Example:

``` http
GET /api/v1/products?search=gingelly
```

Use PostgreSQL queries.

Do not add Elasticsearch or another search service.

------------------------------------------------------------------------

# 49. Pagination

Product lists and admin orders should be paginated.

Example:

``` http
GET /api/v1/products?page=1&limit=20
```

Response:

``` json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "Products fetched successfully"
}
```

------------------------------------------------------------------------

# 50. Database Indexes

Add only useful indexes.

Products:

``` text
category_id
slug
is_active
```

Product variants:

``` text
product_id
sku
is_active
```

Orders:

``` text
user_id
status
created_at
order_number
```

Order items:

``` text
order_id
product_id
variant_id
```

Do not add indexes everywhere.

------------------------------------------------------------------------

# 51. Static vs Dynamic Content

## Static frontend content

Keep in Next.js:

-   Homepage marketing copy
-   About Us
-   Hero layout
-   UI
-   Brand storytelling
-   Static sections

## Dynamic backend content

Keep in Supabase:

-   Products
-   Product variants
-   Categories
-   Stock
-   Orders
-   Customers
-   Contact information
-   Store settings

This keeps the demo simple.

------------------------------------------------------------------------

# 52. Full Customer Flow

``` text
Customer visits website
        │
        ▼
GET /products
        │
        ▼
Browse products
        │
        ▼
Search/filter
        │
        ▼
Select product
        │
        ▼
Select variant
        │
        ▼
Add to local cart
        │
        ▼
Checkout
        │
        ├── Guest
        │
        └── Logged-in customer
        │
        ▼
Enter shipping details
        │
        ▼
POST /orders
        │
        ▼
NestJS validates
        │
        ▼
Order created
        │
        ▼
COD
        │
        ▼
PENDING
        │
        ▼
Customer receives order confirmation
```

------------------------------------------------------------------------

# 53. Full Admin Flow

``` text
Admin signs in
      │
      ▼
Dashboard
      │
      ├── View sales graph
      │
      ├── View orders
      │
      ├── Search orders
      │
      ├── Filter orders
      │
      ├── Open order
      │
      ├── View customer
      │
      ├── View address
      │
      ├── View items
      │
      ├── Update status
      │
      ├── View status history
      │
      ├── Manage products
      │
      ├── Manage variants
      │
      ├── Manage stock
      │
      ├── Manage categories
      │
      ├── Edit contact information
      │
      └── Edit store settings
```

------------------------------------------------------------------------

# 54. Implementation Order

The AI must not build everything at once.

Implement in this order.

## Phase 1 --- NestJS foundation

1.  Create NestJS application
2.  Configure TypeScript
3.  Configure environment variables
4.  Configure Supabase client
5.  Configure CORS
6.  Configure global validation
7.  Configure API prefix `/api/v1`
8.  Configure centralized errors
9.  Configure Swagger
10. Create health endpoint

------------------------------------------------------------------------

## Phase 2 --- Database

1.  Create migration structure
2.  Create profiles
3.  Create categories
4.  Create products
5.  Create product_variants
6.  Create orders
7.  Create order_items
8.  Create order_status_history
9.  Create contact_settings
10. Create store_settings
11. Add indexes
12. Add seed data

------------------------------------------------------------------------

## Phase 3 --- Authentication

1.  Configure Supabase Auth integration
2.  JWT validation
3.  Cookie handling
4.  Auth guard
5.  Current user decorator/helper
6.  Role guard
7.  Customer/admin authorization

------------------------------------------------------------------------

## Phase 4 --- Product APIs

1.  Categories
2.  Product list
3.  Product search
4.  Product filtering
5.  Product details
6.  Pagination
7.  Admin product CRUD
8.  Product variants
9.  Stock management

------------------------------------------------------------------------

## Phase 5 --- Orders

1.  Create order DTO
2.  Validate cart items
3.  Fetch current prices
4.  Validate stock
5.  Calculate subtotal
6.  Calculate shipping
7.  Calculate total
8.  Create order
9.  Create order items
10. Reduce stock
11. Create status history
12. Customer order retrieval
13. Customer cancellation
14. Admin order retrieval
15. Admin filtering/search
16. Admin status update

------------------------------------------------------------------------

## Phase 6 --- Content and Settings

1.  Contact API
2.  Admin contact editing
3.  Store settings
4.  Admin store settings editing

------------------------------------------------------------------------

## Phase 7 --- Dashboard

1.  Sales statistics
2.  Sales graph
3.  Customer count
4.  Order count
5.  Pending order count
6.  Delivered order count

Keep analytics simple.

------------------------------------------------------------------------

## Phase 8 --- Storage

1.  Configure Supabase Storage
2.  Product image upload support
3.  Store image URLs
4.  Admin product image management

------------------------------------------------------------------------

## Phase 9 --- Testing

1.  Product tests
2.  Order tests
3.  Stock tests
4.  Authorization tests
5.  Dashboard statistics tests

------------------------------------------------------------------------

## Phase 10 --- Deployment

1.  Configure production environment
2.  Deploy NestJS to Render/Railway
3.  Configure Supabase production project
4.  Configure CORS
5.  Configure frontend URLs
6.  Verify Swagger
7.  Verify product APIs
8.  Verify order creation
9.  Verify admin APIs
10. Verify dashboard statistics

------------------------------------------------------------------------

# 55. Coding Rules for AI

The AI implementing this document must follow these rules.

## Rule 1

Do not introduce unnecessary infrastructure.

If a feature can be implemented with NestJS + Supabase, do that.

------------------------------------------------------------------------

## Rule 2

Do not use microservices.

This is a modular monolith.

------------------------------------------------------------------------

## Rule 3

Do not add Redis unless explicitly requested.

------------------------------------------------------------------------

## Rule 4

Do not add Prisma unless explicitly requested.

Use Supabase JS client.

------------------------------------------------------------------------

## Rule 5

Do not expose the Supabase service-role key.

It is backend-only.

------------------------------------------------------------------------

## Rule 6

Never trust frontend pricing.

Always fetch prices from the database.

------------------------------------------------------------------------

## Rule 7

Never trust frontend stock.

Always validate stock in NestJS.

------------------------------------------------------------------------

## Rule 8

Never allow customers to update arbitrary orders.

Always verify ownership.

------------------------------------------------------------------------

## Rule 9

Keep business logic in services.

Controllers should be thin.

------------------------------------------------------------------------

## Rule 10

Use DTOs for request validation.

Do not accept arbitrary request objects.

------------------------------------------------------------------------

## Rule 11

Use enums for order statuses and roles.

Do not use arbitrary strings throughout the application.

------------------------------------------------------------------------

## Rule 12

Use database migrations.

Do not rely on manually clicking tables into existence without a
reproducible schema.

------------------------------------------------------------------------

## Rule 13

Keep frontend responsibilities in the frontend.

Do not put UI-specific logic in NestJS.

------------------------------------------------------------------------

## Rule 14

Do not create unused abstractions.

Only create modules/files when they solve an actual requirement.

------------------------------------------------------------------------

## Rule 15

Do not over-engineer the demo.

Prefer the simplest correct implementation.

------------------------------------------------------------------------

# 56. Definition of Done

The backend is considered complete when:

### Foundation

-   [ ] NestJS starts successfully
-   [ ] Environment variables validate
-   [ ] Supabase connection works
-   [ ] `/api/v1/health` works
-   [ ] Swagger works

### Database

-   [ ] All required tables exist
-   [ ] Relationships work
-   [ ] Indexes exist
-   [ ] Seed data works
-   [ ] Migrations can recreate the database

### Auth

-   [ ] Customer authentication works
-   [ ] Admin authentication works
-   [ ] JWT validation works
-   [ ] Cookies work
-   [ ] Role authorization works

### Products

-   [ ] Product listing works
-   [ ] Search works
-   [ ] Category filtering works
-   [ ] Product details work
-   [ ] Variants work
-   [ ] Stock works
-   [ ] Admin CRUD works

### Orders

-   [ ] Guest checkout works
-   [ ] Customer checkout works
-   [ ] Server calculates prices
-   [ ] Server calculates shipping
-   [ ] Stock is validated
-   [ ] Stock is reduced
-   [ ] Order is created
-   [ ] Order items are created
-   [ ] Status history is created
-   [ ] Customer can view orders
-   [ ] Customer can cancel eligible orders
-   [ ] Admin can view orders
-   [ ] Admin can search/filter orders
-   [ ] Admin can update status
-   [ ] Dashboard sees status history

### Settings

-   [ ] Contact settings work
-   [ ] Store settings work
-   [ ] Admin can update settings

### Dashboard

-   [ ] Sales statistics work
-   [ ] Sales graph data works
-   [ ] Customer count works
-   [ ] Order counts work

### Storage

-   [ ] Product image upload works
-   [ ] Product image URLs are stored

### Quality

-   [ ] Validation works
-   [ ] Errors are standardized
-   [ ] Important tests pass
-   [ ] No secrets are committed
-   [ ] Production CORS is configured
-   [ ] API documentation is available

------------------------------------------------------------------------

# 57. Suggested API Summary

``` text
PUBLIC
GET    /api/v1/products
GET    /api/v1/products/:id
GET    /api/v1/categories
GET    /api/v1/settings
GET    /api/v1/content/contact

CUSTOMER
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:id
PATCH  /api/v1/orders/:id/cancel

ADMIN
GET    /api/v1/admin/dashboard/stats

GET    /api/v1/admin/products
POST   /api/v1/admin/products
GET    /api/v1/admin/products/:id
PATCH  /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id

GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
PATCH  /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id

GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/:id
PATCH  /api/v1/admin/orders/:id/status

GET    /api/v1/admin/customers
GET    /api/v1/admin/customers/:id
GET    /api/v1/admin/customers/:id/orders

GET    /api/v1/admin/content/contact
PATCH  /api/v1/admin/content/contact

GET    /api/v1/admin/settings
PATCH  /api/v1/admin/settings
```

------------------------------------------------------------------------

# 58. Final Architecture

The final system should remain this simple:

``` text
                       RIYA ECOM
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    Ecom UI           Dashboard UI      Supabase
    Next.js             Next.js          Auth/DB/
          │                │              Storage
          │                │                ▲
          └───────┬────────┘                │
                  │                         │
                  ▼                         │
             REST API                      │
                  │                         │
                  ▼                         │
             NestJS Backend ────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
    Products    Orders    Content
        │         │         │
        └─────────┼─────────┘
                  │
               Supabase
```

The backend is a **single modular NestJS application**.

The database is a **single Supabase PostgreSQL database**.

The cart lives in the browser.

Orders live in Supabase.

Images live in Supabase Storage.

Authentication is handled by Supabase Auth.

The dashboard and storefront consume the same API.

This is the intended architecture for the Riya demo.
