# Riya E-Commerce UI — Frontend Architecture & Build Plan

## 1. Project Overview

**Frontend:** Next.js + TypeScript  
**Styling:** Tailwind CSS  
**Component library:** shadcn/ui  
**Backend:** Existing Riya NestJS common backend  
**Database:** Supabase via NestJS  
**Deployment:** Netlify

The storefront must work on **desktop, tablet, and mobile**.

Visual direction from the supplied references:

- Sunflower-focused identity
- Warm, natural, slightly retro aesthetic
- White/cream base
- Riya red brand accent
- Yellow/sunflower elements
- Product photography and 3D/product imagery
- Simple, practical e-commerce UX

Primary screens:

1. **Riya Home** — supplied first reference
2. **Riya Shop** — supplied second reference
3. **Checkout** — supplied third reference

---

# 2. Design Principle

Use sunflower artwork as a **visual layer**, not as the entire UI.

Use it for:

- Hero decoration
- Section backgrounds
- Edge decorations
- Footer decoration
- Small floating elements
- Category accents

Keep actual content readable.

The target feeling is:

> **Traditional + natural + modern e-commerce**

---

# 3. Main Routes

```text
/
 /shop
 /shop/[slug]
 /cart
 /checkout
 /order/[orderNumber]
 /track-order
 /about
 /contact
```

Initial required routes:

```text
/
 /shop
 /shop/[slug]
 /cart
 /checkout
 /order/[orderNumber]
```

---

# 4. Responsive Navbar

The navbar exists on **desktop and mobile**.

## Desktop

```text
SHOP       HOME        RIYA LOGO       ABOUT CONTACT
```

Optional actions:

```text
Search
Cart
Account
```

## Mobile

```text
┌──────────────────────────────────┐
│ ☰     RIYA LOGO          🛒      │
└──────────────────────────────────┘
```

Opening the menu:

```text
HOME
SHOP
ABOUT
CONTACT
ACCOUNT
```

Requirements:

- Minimum ~44px touch targets
- Responsive layout
- Smooth menu animation
- Cart remains accessible
- No desktop-only navigation

---

# 5. Recommended Folder Structure

```text
riya-ecom-ui/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   │
│   ├── shop/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── cart/
│   │   └── page.tsx
│   │
│   ├── checkout/
│   │   └── page.tsx
│   │
│   ├── order/
│   │   └── [orderNumber]/
│   │       └── page.tsx
│   │
│   ├── track-order/
│   │   └── page.tsx
│   │
│   ├── about/
│   │   └── page.tsx
│   │
│   └── contact/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── Footer.tsx
│   │   └── PageContainer.tsx
│   │
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── HeroDecoration.tsx
│   │   ├── BestSellers.tsx
│   │   ├── ProductPreviewCard.tsx
│   │   ├── AboutPreview.tsx
│   │   ├── BrandStatement.tsx
│   │   └── HomeContact.tsx
│   │
│   ├── shop/
│   │   ├── ShopHeader.tsx
│   │   ├── ShopToolbar.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductSort.tsx
│   │   └── ShopDecoration.tsx
│   │
│   ├── products/
│   │   ├── ProductGallery.tsx
│   │   ├── ProductInfo.tsx
│   │   ├── VariantSelector.tsx
│   │   ├── QuantitySelector.tsx
│   │   ├── StockStatus.tsx
│   │   └── AddToCartButton.tsx
│   │
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   ├── EmptyCart.tsx
│   │   └── CartIcon.tsx
│   │
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── OrderSummary.tsx
│   │   ├── ShippingForm.tsx
│   │   ├── PaymentMethod.tsx
│   │   └── CheckoutButton.tsx
│   │
│   ├── orders/
│   │   ├── OrderConfirmation.tsx
│   │   ├── OrderStatus.tsx
│   │   ├── OrderTimeline.tsx
│   │   └── OrderSummary.tsx
│   │
│   ├── about/
│   │   └── AboutContent.tsx
│   │
│   ├── contact/
│   │   ├── ContactDetails.tsx
│   │   └── ContactMap.tsx
│   │
│   ├── decorations/
│   │   ├── Sunflower.tsx
│   │   ├── SunflowerBackground.tsx
│   │   ├── FloatingSunflower.tsx
│   │   └── FloralDivider.tsx
│   │
│   └── ui/
│       └── shadcn components
│
├── features/
│   └── cart/
│       ├── cart.store.ts
│       ├── cart.types.ts
│       └── cart.utils.ts
│
├── services/
│   ├── products.service.ts
│   ├── categories.service.ts
│   ├── orders.service.ts
│   ├── contact.service.ts
│   └── settings.service.ts
│
├── hooks/
│   ├── useCart.ts
│   ├── useProducts.ts
│   ├── useProduct.ts
│   └── useContactSettings.ts
│
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── constants.ts
│
├── types/
│   ├── product.ts
│   ├── category.ts
│   ├── cart.ts
│   ├── order.ts
│   ├── contact.ts
│   └── api.ts
│
├── public/
│   ├── logo/
│   │   └── riya-logo.png
│   ├── images/
│   │   ├── hero/
│   │   ├── products/
│   │   ├── about/
│   │   └── decorations/
│   └── icons/
│
├── .env.local
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

# 6. Home Page

The Home page follows the supplied first reference.

```text
Navbar
  ↓
Hero
  ↓
Best Sellers
  ↓
About Riya
  ↓
Brand Statement
  ↓
Footer / Contact
```

## Hero

Desktop:

```text
Left:
Pure goodness,
made for every kitchen.

[ Shop now ]

Right:
Product / 3D image
```

Decorative sunflower artwork sits around the edges.

Mobile:

```text
Heading
CTA
Product image
Sunflower decorations
```

Suggested copy:

```text
Pure goodness,
made for every kitchen.
```

CTA:

```text
Shop now
```

CTA navigates to:

```text
/shop
```

---

# 7. Best Sellers

Desktop:

```text
BEST SELLERS

┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Product │ │ Product │ │ Product │ │ Product │
│ Image   │ │ Image   │ │ Image   │ │ Image   │
│ Explore │ │ Explore │ │ Explore │ │ Explore │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

Mobile should use horizontal scrolling:

```text
┌─────────┐ ┌─────────┐ →
│ Product │ │ Product │
└─────────┘ └─────────┘
```

Do not shrink cards until they become unusable.

Home products should come from the backend's product API.

---

# 8. Home Product Preview Card

Keep Home cards simpler than Shop cards.

```text
┌────────────────────┐
│    PRODUCT IMAGE   │
├────────────────────┤
│ Gingelly Oil       │
│ 1L                 │
│                    │
│ [ Explore ]        │
└────────────────────┘
```

Click:

```text
/shop/[slug]
```

---

# 9. About Preview

Desktop:

```text
┌─────────────────────┬────────────────────┐
│ About Riya          │                    │
│                     │      IMAGE         │
│ Text                │                    │
└─────────────────────┴────────────────────┘
```

Mobile:

```text
About Riya
IMAGE
Text
```

The Home section links to:

```text
/about
```

About content itself remains static in frontend code.

---

# 10. Brand Statement

Suggested:

```text
Made for everyday cooking

Gingelly, groundnut, coconut and sunflower
oils with clear sizes, pricing and quick checkout.
```

Keep this section simple.

---

# 11. Footer

Use the sunflower-heavy visual style from the supplied references.

Display:

```text
CONTACT US

Instagram
WhatsApp
Location
```

Contact values come from:

```text
contact_settings
```

The footer is reusable across all pages.

---

# 12. Shop Page

Structure:

```text
Navbar

SHOP

Search

Filter / Sort

Product Grid

Footer
```

Desktop:

```text
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Product │ │ Product │ │ Product │ │ Product │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

Tablet:

```text
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Product │ │ Product │ │ Product │
└─────────┘ └─────────┘ └─────────┘
```

Mobile:

```text
┌─────────┐ ┌─────────┐
│ Product │ │ Product │
└─────────┘ └─────────┘
```

Use CSS Grid.

---

# 13. Shop Product Card

Include:

- Product image
- Product name
- Category
- Variant
- Price
- Sale price if available
- Stock
- Variant selector
- Add to Cart

Example:

```text
┌────────────────────────┐
│      PRODUCT IMAGE     │
├────────────────────────┤
│ Gingelly Oil           │
│ Cold Pressed           │
│ ₹350                   │
│                        │
│ [200ml] [500ml] [1L]   │
│                        │
│ [ ADD TO CART ]        │
└────────────────────────┘
```

---

# 14. Product Search

Search supports:

```text
Product name
Category
```

Example:

```text
GET /products?search=gingelly
```

Debounce search by approximately:

```text
250–400ms
```

Do not make an API request for every keystroke.

---

# 15. Product Filtering

Initial filter:

```text
Category
```

Do not build unnecessary filters yet.

Future options can include:

```text
Price
Size
Availability
```

---

# 16. Product Details

Route:

```text
/shop/[slug]
```

Structure:

```text
Navbar

Product Gallery
Product Information
Variant Selector
Quantity Selector
Stock
Add to Cart

Description
Ingredients
Weight

Related Products

Footer
```

Variant controls determine:

```text
price
sale_price
stock
sku
```

The backend remains the authority for actual pricing and stock.

---

# 17. Image Strategy

## Local brand assets

```text
public/
├── logo/
└── images/decorations/
```

Use for:

- Riya logo
- Sunflower PNGs
- Static decorative artwork
- Static hero art if required

## Product images

Use Supabase Storage.

Product records contain:

```text
thumbnail_url
images[]
```

The frontend should not assume product images live inside the frontend repository.

---

# 18. Sunflower Components

Create reusable components:

```text
components/decorations/
```

Examples:

```tsx
<Sunflower />
<SunflowerBackground />
<FloatingSunflower />
<FloralDivider />
```

Use absolute positioning for decorations where appropriate.

Do not duplicate large blocks of decorative CSS across pages.

---

# 19. 3D / Product Imagery

The supplied references use product/3D-style imagery.

For the initial build, prefer:

```text
High-quality PNG/WebP
+
CSS transforms
+
subtle motion
```

Do not make the application dependent on WebGL.

If real 3D is introduced later:

```text
components/3d/
```

Possible future tools:

```text
Three.js
React Three Fiber
```

but they are not required for V1.

---

# 20. Animation

Keep animation subtle.

Good uses:

```text
Mobile menu
Product hover
Cart drawer
Button interaction
Hero image movement
Sunflower floating
Section entrance
```

Avoid:

```text
Excessive parallax
Large continuous spinning
Slow transitions that block shopping
Animations that hurt readability
```

Prefer CSS transitions/keyframes first.

---

# 21. Color Tokens

Starting palette based on the supplied visual references:

```text
Riya Red       #E30613
Sunflower      #F4C542
Warm Cream     #F7F2DF
Soft Background #FAF9F5
Dark Text      #171717
```

Treat these as starting design tokens.

The exact final palette can be refined during UI implementation.

---

# 22. Typography

Use a clean, readable sans-serif.

Hierarchy:

```text
Hero heading
  ↓
Section heading
  ↓
Product title
  ↓
Body
  ↓
Metadata
```

The retro personality should mainly come from:

- Imagery
- Layout
- Color
- Sunflower decoration

rather than decorative fonts that reduce readability.

---

# 23. Responsive Strategy

Build **mobile-first**.

Suggested breakpoints:

```text
< 640px      Mobile
640–1024px   Tablet
1024px+      Desktop
```

The mobile design is not simply a shrunken desktop layout.

The supplied mobile reference should guide:

- Navigation
- Product grid
- Checkout
- Decorative placement
- Spacing

---

# 24. Mobile Shop

Recommended:

```text
Navbar
  ↓
SHOP
  ↓
Search + Filter
  ↓
2-column Product Grid
  ↓
Footer
```

Product cards must remain usable at small widths.

---

# 25. Mobile Checkout

One-column layout:

```text
Navbar

Order Summary

Customer Information

Full Name
Phone
Email

Delivery Address

Address
City
District
State
Pincode

Payment
COD

[ PLACE ORDER ]

Footer
```

The checkout button should be prominent and touch-friendly.

---

# 26. Cart Architecture

Cart is local.

Do NOT create a cart table in Supabase.

Use:

```text
React state
+
localStorage
```

Flow:

```text
Product
 ↓
Add to Cart
 ↓
React Cart State
 ↓
localStorage
 ↓
Cart Drawer / Cart Page
 ↓
Checkout
```

Cart survives refreshes.

---

# 27. Cart Type

Example:

```ts
type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  image: string;
  price: number;
  quantity: number;
};
```

The backend is the authority when creating an order.

---

# 28. Cart Hook

`useCart.ts` should expose:

```ts
addItem()
removeItem()
updateQuantity()
clearCart()
getItemCount()
getSubtotal()
```

Do not implement cart business logic independently in multiple components.

---

# 29. Checkout

Route:

```text
/checkout
```

Customer information:

```text
Full Name
Phone
Email
```

Shipping:

```text
Address
City
District
State
Pincode
```

Payment:

```text
Cash on Delivery
```

No payment gateway is required for this version.

---

# 30. Order Creation

The frontend sends only the necessary order inputs:

```text
productId
variantId
quantity
customer details
shipping address
```

The backend must:

1. Validate products
2. Validate variants
3. Check active status
4. Check stock
5. Read current prices
6. Calculate item totals
7. Calculate subtotal
8. Calculate shipping
9. Create order
10. Create order items
11. Reduce stock
12. Create initial status history

The frontend must NOT be trusted for:

```text
price
sale price
stock
subtotal
total
```

---

# 31. Order Flow

```text
User
 ↓
Local Cart
 ↓
Checkout Form
 ↓
NestJS
 ├── Validate
 ├── Check stock
 ├── Read current price
 ├── Calculate total
 ├── Create order
 ├── Create items
 ├── Reduce stock
 └── Create status history
 ↓
Supabase
 ↓
Order Confirmation
```

---

# 32. Order Status

Supported statuses:

```text
PENDING
CONFIRMED
PROCESSING
PACKED
SHIPPED
DELIVERED
CANCELLED
```

Display as a timeline:

```text
✓ Order placed
│
✓ Confirmed
│
✓ Processing
│
○ Packed
│
○ Shipped
│
○ Delivered
```

Cancelled:

```text
Order placed
     │
     └── Cancelled
```

---

# 33. Customer Cancellation

Customer can cancel an order only when the backend considers the current status cancellable.

The frontend should not directly decide whether cancellation is valid.

Request:

```text
POST /orders/:id/cancel
```

or whatever exact endpoint is defined by the NestJS API contract.

---

# 34. Order Confirmation

Route:

```text
/order/[orderNumber]
```

Display:

```text
Order confirmed!

Order Number:
RIYA-12345

Payment:
Cash on Delivery

Delivery Address:
...

Items:
...

Total:
₹XXX
```

Actions:

```text
Continue Shopping
Track Order
```

---

# 35. API Architecture

The frontend communicates only with NestJS.

```text
Next.js UI
     │
     │ REST
     ▼
NestJS Backend
     │
     │ Supabase JS
     ▼
Supabase
```

Do not directly manipulate Supabase tables from the storefront.

---

# 36. API Client

Create:

```text
lib/api.ts
```

Responsibilities:

- Base URL
- HTTP requests
- JSON parsing
- Error handling
- Common response handling

Environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Production:

```env
NEXT_PUBLIC_API_URL=https://your-riya-backend.onrender.com/api
```

---

# 37. API Response Format

Backend uses:

```json
{
  "success": true,
  "data": {},
  "message": "Product fetched successfully"
}
```

Frontend services should use this consistent response structure.

---

# 38. Services

`products.service.ts`

```text
getProducts()
getProduct(slug)
searchProducts()
getProductsByCategory()
```

`categories.service.ts`

```text
getCategories()
```

`orders.service.ts`

```text
createOrder()
getOrder()
cancelOrder()
```

`contact.service.ts`

```text
getContactSettings()
```

---

# 39. Types

Example variant:

```ts
type ProductVariant = {
  id: string;
  name: string;
  size: number;
  unit: string;
  sku: string;
  price: number;
  sale_price: number | null;
  stock: number;
  is_active: boolean;
};
```

Example product:

```ts
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  weight: string | null;
  ingredients: string | null;
  thumbnail_url: string | null;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  variants: ProductVariant[];
};
```

---

# 40. Data Fetching

Prefer Next.js Server Components for read-only pages where practical.

Use Client Components only where interaction is needed.

Client components include:

```text
Navbar menu
Search
Filters
Variant selector
Quantity selector
Cart
Checkout form
```

---

# 41. Home Page Component Tree

```text
Home
│
├── Navbar
│
├── main
│   ├── Hero
│   │   ├── HeroDecoration
│   │   ├── HeroContent
│   │   └── HeroProduct
│   │
│   ├── BestSellers
│   │   └── ProductPreviewCard
│   │
│   ├── AboutPreview
│   │   ├── AboutContent
│   │   └── AboutImage
│   │
│   └── BrandStatement
│
└── Footer
```

---

# 42. Shop Component Tree

```text
Shop
│
├── Navbar
│
├── main
│   ├── ShopHeader
│   ├── ShopToolbar
│   │   ├── SearchBar
│   │   ├── ProductFilters
│   │   └── ProductSort
│   │
│   └── ProductGrid
│       └── ProductCard
│
└── Footer
```

---

# 43. Checkout Component Tree

```text
Checkout
│
├── Navbar
│
├── main
│   ├── OrderSummary
│   │   └── CartItem
│   │
│   └── CheckoutForm
│       ├── CustomerInformation
│       ├── ShippingForm
│       ├── PaymentMethod
│       └── CheckoutButton
│
└── Footer
```

---

# 44. Loading States

Create reusable:

```text
ProductSkeleton
ShopSkeleton
OrderSkeleton
ContactSkeleton
```

Never leave API-driven pages completely blank while loading.

---

# 45. Error States

Example:

```text
We couldn't load the products.

Please try again.

[ Retry ]
```

Checkout:

```text
We couldn't place your order.

Your cart has not been cleared.

[ Try Again ]
```

Never clear the cart when order creation fails.

---

# 46. Empty States

Shop:

```text
No products found.

Try another search or category.
```

Cart:

```text
Your cart is empty.

[ Start Shopping ]
```

---

# 47. Contact

Contact data comes from:

```text
contact_settings
```

Display:

```text
Business Name
Phone
Email
WhatsApp
Address
Google Maps
Instagram
Facebook
Business Hours
```

No contact form is required.

---

# 48. Home Data Strategy

Static:

```text
Hero copy
About copy
Brand statement
Page structure
Decorative imagery
```

Dynamic:

```text
Products
Contact information
```

This keeps the page simple while allowing the client to update important business data.

---

# 49. Authentication

Customer accounts are supported, but guest checkout remains available.

Do not make authentication a requirement for normal shopping.

The account system can later expose:

```text
Order history
Profile
Saved information
```

---

# 50. Guest Checkout

```text
Browse
 ↓
Add to Cart
 ↓
Checkout
 ↓
Customer details
 ↓
Place COD order
 ↓
Order number
```

No account required.

---

# 51. Track Order

Route:

```text
/track-order
```

Display:

```text
Order Number
```

Potentially require phone as an additional verification value depending on the backend implementation.

Show:

```text
Order status
Items
Total
Shipping address
Status history
```

Do not expose arbitrary customer orders through an insecure public lookup.

---

# 52. Performance

Priorities:

1. Optimized images
2. Small JS bundle
3. Server-render static content where possible
4. Avoid unnecessary Client Components
5. Debounced search
6. Pagination if product count grows
7. Lazy-load non-critical images
8. Avoid huge background images

---

# 53. Accessibility

Required:

- Alt text for product images
- Keyboard navigation
- Visible focus states
- Semantic buttons
- Semantic links
- Accessible mobile menu
- Accessible cart drawer
- Proper form labels
- Form error messages

Never use a `<div>` as a fake button.

---

# 54. SEO

Initial metadata:

```text
Title:
Riya — Pure Goodness for Every Kitchen

Description:
Quality cooking oils made for everyday kitchens.
```

Product pages should eventually use product-specific metadata.

---

# 55. Avoid Overengineering

This is a small client demo.

Do NOT add:

```text
Redux
GraphQL
Microservices
Redis
Kafka
ElasticSearch
Separate cart backend
Separate product service
Separate order service
Complex caching infrastructure
Payment infrastructure
Notification infrastructure
```

Architecture:

```text
Next.js
   ↓
NestJS
   ↓
Supabase
```

---

# 56. Development Order

## Phase 1 — Foundation

```text
1. Next.js setup
2. Tailwind
3. shadcn/ui
4. Global styles
5. Fonts
6. Riya logo
7. Design tokens
8. Responsive layout
```

## Phase 2 — Layout

```text
9. Navbar
10. Mobile navbar
11. Footer
12. Page container
```

## Phase 3 — Home

```text
13. Hero
14. Sunflower decorations
15. Best sellers
16. Product preview card
17. About preview
18. Brand statement
19. Footer/contact
```

## Phase 4 — Shop

```text
20. Shop header
21. Search
22. Filters
23. Product grid
24. Product card
25. Product API
26. Loading states
27. Empty/error states
```

## Phase 5 — Product

```text
28. Product details
29. Gallery
30. Variants
31. Quantity
32. Stock
33. Add to cart
```

## Phase 6 — Cart

```text
34. Cart state
35. localStorage
36. Cart drawer
37. Cart page
38. Cart summary
```

## Phase 7 — Checkout

```text
39. Checkout form
40. Customer information
41. Shipping address
42. COD
43. Order creation
44. Validation
45. Confirmation page
```

## Phase 8 — Orders

```text
46. Order details
47. Order timeline
48. Track order
49. Cancel order
```

## Phase 9 — Polish

```text
50. Responsive testing
51. Animation
52. Accessibility
53. SEO
54. Image optimization
55. Error handling
56. Deployment
```

---

# 57. First Components to Build

Start with:

```text
components/layout/Navbar.tsx
components/layout/MobileMenu.tsx
components/layout/Footer.tsx

components/home/Hero.tsx
components/home/BestSellers.tsx
components/home/ProductPreviewCard.tsx
components/home/AboutPreview.tsx
components/home/BrandStatement.tsx

components/decorations/Sunflower.tsx
components/decorations/SunflowerBackground.tsx
```

Do not build checkout before the storefront foundation and Home/Shop layouts are stable.

---

# 58. Definition of Done — Home

- [ ] Desktop navbar works
- [ ] Mobile navbar works
- [ ] Riya logo integrated
- [ ] Hero responsive
- [ ] Sunflower decorations work on desktop
- [ ] Decorations do not break mobile
- [ ] Hero CTA opens Shop
- [ ] Best sellers load from backend
- [ ] Product cards work
- [ ] About section responsive
- [ ] Footer works
- [ ] Contact data can come from backend
- [ ] No horizontal overflow on mobile
- [ ] Looks correct at laptop width
- [ ] Looks correct at phone width

---

# 59. Definition of Done — Shop

- [ ] Products load from NestJS
- [ ] Product cards display correctly
- [ ] Search works
- [ ] Category filtering works
- [ ] Variant selection works
- [ ] Stock status works
- [ ] Add to Cart works
- [ ] Mobile two-column grid works
- [ ] Desktop grid works
- [ ] Loading state exists
- [ ] Empty state exists
- [ ] Error state exists

---

# 60. Definition of Done — Checkout

- [ ] Cart loads
- [ ] Customer details can be entered
- [ ] Address can be entered
- [ ] COD displayed
- [ ] Backend validates order
- [ ] Stock is checked
- [ ] Order is created
- [ ] Cart clears only after successful order
- [ ] Order number is displayed
- [ ] Order status is displayed

---

# 61. Final Architecture

```text
                    RIYA STOREFRONT
                         │
              ┌──────────┴──────────┐
              │                     │
        Next.js UI              Local Cart
              │                 localStorage
              │
              │ REST API
              ▼
        NestJS Backend
              │
       ┌──────┴───────┐
       │              │
   Supabase DB    Supabase Auth
       │
       └────── Supabase Storage
```

Dashboard uses the same backend:

```text
Riya Dashboard
      │
      │ REST API
      ▼
Riya NestJS Backend
      │
      ▼
Supabase
```

---

# 62. Core Rule

Before adding a library, service, or architectural layer, ask:

> **Does this solve an actual problem in this demo?**

If not, do not add it.

Target:

```text
Beautiful UI
+
Responsive UX
+
Real product data
+
Real cart
+
Real checkout
+
Real orders
+
Dashboard integration
```

without unnecessary infrastructure.
