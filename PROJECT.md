# PLAN.md — Infinite Boat System (Capstone Project)

## Project Overview

A full-stack web application for a Philippine-based boat building company. Customers can browse boats, customize via a 3D configurator, place orders with installment/full-payment options, submit payment proofs, and track build progress. Administrators manage orders, payments, inventory, sales, and generate AI video progress reports.

---

## Tech Stack (Original)

| Layer       | Technology                                       |
|-------------|--------------------------------------------------|
| Frontend    | Vanilla HTML5, CSS3, JavaScript (ES Modules)     |
| Backend     | Node.js + Express 5.x (static file server only)  |
| Database    | Firebase Firestore (NoSQL)                       |
| Auth        | Firebase Auth (email/password + Google OAuth)    |
| Storage     | Firebase Storage + localStorage (base64 DataURLs)|
| Styling     | Custom CSS, Poppins font, Font Awesome 6.5       |
| State       | localStorage (primary), Firestore (profiles)     |
| 3D Viewer   | HTML5 Canvas (planned/incomplete)                |

---

## Pages & Routes

### Public (Pre-Login)
| Page          | Route           | Purpose |
|---------------|-----------------|---------|
| Landing       | `/index.html`   | Boat carousel, gallery, testimonials, "Why Choose Us" |
| Registration  | `/registration.html` | Sign-up with email/password or Google |
| Login         | `/login.html`   | Sign-in, redirects admin vs customer |

### Customer Pages (Post-Login)
| Page                  | Route              | Purpose |
|-----------------------|--------------------|---------|
| Customer Dashboard    | `/home.html`       | Active projects, build progress, available boats |
| Order Form            | `/order.html`      | Select boat, payment method, customer info, valid ID |
| Payment               | `/payment.html`    | 3-phase payment with proof upload |
| Profile               | `/profile.html`    | Avatar, name, password change |
| 3D Boat Configurator  | `/boatcust.html`   | Customize length, width, engine, seats, color, LED (Canvas-based) |

### Admin Pages
| Page                  | Route                 | Status     |
|-----------------------|-----------------------|------------|
| Admin Dashboard       | `/dashboard.html`     | Functional |
| Order Management      | `/dashorder.html`     | Functional |
| Payment Management    | `/dashpayment.html`   | Functional (demo data) |
| Customer Management   | `/dashcustomer.html`  | Skeleton only |
| Sales Dashboard       | `/dashsales.html`     | Skeleton only |
| Inventory Management  | `/dashinventory.html` | Skeleton only |
| Analytics             | `/dashanalytics.html` | Skeleton only |
| AI Video Report       | `/aivideo.html`       | Concept page |

---

## Firestore Database Schema

Collection: `users`
```
users/{uid} {
  uid: string,
  fullname: string,
  email: string,
  role: "customer" | "admin",
  profileImage: string (URL),
  createdAt: timestamp,
  // payment fields
  totalPayment: number,
  remainingBalance: number,
  paymentPhase: number (0-3),
  // project fields
  activeProject: boolean,
  boatName: string,
  projectStatus: string,
  projectProgress: number (0-100),
  projectPhase: string,
  // order fields
  orderStatus: "Pending" | "Approved" | "Rejected" | "Completed",
  approved: boolean,
  verified: boolean
}
```

> Note: In the original, most operational data (orders, payments) is stored in **localStorage**, not Firestore. See notes below.

---

## localStorage Data Structures (Key-Value)

```
userId          -> Firebase UID string
customerName    -> User's display name
customerEmail   -> User's email
customerImage   -> Profile image (base64 DataURL or URL)
role            -> "admin" | "user"
selectedBoat    -> { name, price, buildTime, downpayment, image }
boatOrders      -> [ OrderObject, ... ]
clientBoatStatus -> Single OrderObject (synced to customer view)
currentOrder    -> OrderObject
dashboardPayments -> [ PaymentObject, ... ]
```

**OrderObject shape:**
```js
{
  id, boatName, boatImage, customerName, email, phone, address,
  price, paymentMethod ("Full" | "Installment"), downpayment,
  remainingBalance, buildTime, status ("Pending" | "Approved" | "Completed" | "Rejected"),
  progress (0-100), validId (base64), orderDate, approvedDate,
  projectPhase ("Hull Construction" | "Engine Assembly" | "Interior Installation" | "Painting & Finishing"),
  paymentStep (0-3)
}
```

**PaymentObject shape:**
```js
{
  id, boatImage, boatName, bankName, accountName, accountNumber,
  paymentPhase ("Downpayment" | "Mid-Construction" | "Full Billing" | "Fully Paid"),
  amount, referenceNumber, dateSubmitted, paymentProof (base64),
  status ("Pending" | "Approved" | "Rejected")
}
```

---

## Authentication Flow

1. Registration → Firebase Auth (`createUserWithEmailAndPassword`) → Firestore `users/{uid}` → redirect to login
2. Login → Firebase Auth (`signInWithEmailAndPassword` or Google popup) → store user info in localStorage
3. Admin detection: hardcoded check for `admin1@gmail.com` → redirect to `/dashboard.html`
4. Regular users → redirect to `/home.html`
5. Profile page → `onAuthStateChanged` guard; update Firestore + Auth profile

---

## Boat Models & Pricing

| Boat         | Price       | Build Time | Downpayment (30%) |
|--------------|-------------|------------|-------------------|
| Fishing Boat | ₱650,000   | 3 months   | ₱195,000          |
| Passenger Boat | ₱850,000 | 3 months   | ₱255,000          |
| Speed Boat   | ₱1,200,000 | 3 months   | ₱360,000          |
| Work Boat    | ₱950,000   | 4 months   | ₱285,000          |

---

## Payment Phases (Installment)

| Phase | %     | Label             |
|-------|-------|-------------------|
| 1     | 30%   | Downpayment       |
| 2     | 40%   | Mid-Construction  |
| 3     | 30%   | Full Billing      |

Accepted banks/wallets: BDO, BPI, Metrobank, UnionBank, GCash, Maya

---

## Build Progress Mapping

| Progress % | Phase                      |
|------------|----------------------------|
| 10-25%     | Hull Construction          |
| 25-45%     | Engine Assembly            |
| 45-70%     | Interior Installation      |
| 70-100%    | Painting & Finishing       |

Timeline: Order Submitted → Approved → Construction → Delivery

---

## Key Architecture Notes (for replication)

1. **localStorage as primary data store** — Orders, payments, and app state live in browser localStorage. Firestore only holds user profiles. This means admin and customer must be on the same device for data to sync. **For a real system, move all operational data to the database.**

2. **Minimal backend** — Express serves static files only. All business logic is client-side Firebase SDK calls. No REST API endpoints exist.

3. **CDN Firebase modules** — No bundler/webpack. Firebase SDK loaded via `<script type="module">` from `https://www.gstatic.com/firebasejs/12.3.0/`.

4. **No payment gateway** — Payment is a manual proof-of-upload flow. No Stripe/PayPal/GCash API integration.

5. **Image handling** — Profile pics, payment proofs, and valid IDs stored as base64 DataURLs in localStorage (~5-10MB limit).

6. **Admin detection** — Hardcoded email check (`admin1@gmail.com`), not role-based from database.

7. **Incomplete admin pages** — Customers, Sales, Inventory, Analytics pages have HTML but empty JS files.

8. **3D configurator JS is empty** — `boatcust.html` has canvas + UI but `boatcust.js` has no 3D rendering logic.

9. **No logout** — Pages use `window.location.href` redirects but never call `firebase.auth().signOut()`.

10. **XSS consideration** — Uses `innerHTML` for rendering; sanitize user input if extended.

---

## Suggested Improvements When Rebuilding

- Replace localStorage with a real database (Firestore, PostgreSQL, MongoDB, etc.)
- Add proper REST API or GraphQL backend
- Integrate real payment gateway (GCash, PayPal, Stripe)
- Implement proper role-based access control from DB
- Add real-time sync (Firestore onSnapshot, WebSockets)
- Complete 3D configurator (Three.js instead of raw Canvas)
- Add build tooling (Vite, webpack, or Next.js)
- Implement proper logout with Firebase `signOut()`
- Add form validation on both client and server
- Make fully responsive for mobile
- Add unit/E2E tests
- Migrate from vanilla JS to React/Vue/Angular + TypeScript
