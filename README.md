# TicketNow — Event Booking System

A full-stack event booking platform supporting two user roles — **Organizers** who create and manage events, and **Customers** who browse and book tickets. Built with Node.js + Express on the backend and React + Vite on the frontend.

🌐 **Live:** [https://ticketnow-eta.vercel.app/](https://ticketnow-eta.vercel.app/)
🔧 **API:** [ticketnow-m4r3.onrender.com](https://ticketnow-m4r3.onrender.com)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Background Tasks](#background-tasks)
- [Design Decisions](#design-decisions)

---

## Features

### Organizer

- Register and log in as an organizer
- Create and edit events with title, description, date, location, ticket count, price, and cover image
- Cover images are uploaded to **Cloudinary** via the backend — no browser-to-storage direct calls
- View a dashboard with stats — tickets sold, capacity, estimated revenue
- Customers with active bookings are automatically notified when an event is updated

### Customer

- Browse and **search** all events without signing in
- Search by **event title** or filter by **location** — both debounced, work independently or together
- Register and log in to book tickets
- Quantity selector with live total price calculation
- View booking history grouped by confirmed and cancelled

### General

- JWT-based stateless authentication
- Role-based access control on every protected route
- Atomic ticket booking — race conditions handled via database-level row locking
- Event images stored in **Cloudinary** (served via CDN, never pauses)
- Async background notifications via an in-memory job queue

---

## Tech Stack

### Backend

| Layer           | Choice                                     |
| --------------- | ------------------------------------------ |
| Runtime         | Node.js                                    |
| Framework       | Express                                    |
| ORM             | Sequelize                                  |
| Database        | PostgreSQL (Neon)                          |
| Auth            | JWT (jsonwebtoken + bcryptjs)              |
| File storage    | Cloudinary (via multer-storage-cloudinary) |
| Background jobs | Custom in-memory queue (EventEmitter)      |

### Frontend

| Layer      | Choice                                         |
| ---------- | ---------------------------------------------- |
| Framework  | React 18                                       |
| Build tool | Vite                                           |
| Routing    | React Router v6                                |
| Styling    | Pure CSS (custom design system, no UI library) |

---

## Project Structure

```
event-booking-system/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js          Cloudinary SDK + multer storage config
│   │   └── db.js                  Sequelize + Neon connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── booking.controller.js
│   │   └── event.controller.js    CRUD + title/location search
│   ├── events/
│   │   ├── eventBus.js
│   │   ├── eventTypes.js
│   │   └── listeners.js           Bridges eventBus → notification queue
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── role.middleware.js
│   │   └── upload.middleware.js   Cloudinary upload + old image cleanup
│   ├── models/
│   │   ├── booking.model.js
│   │   ├── event.model.js         Includes price (cents) and imageUrl
│   │   ├── index.js
│   │   └── user.model.js
│   ├── queues/
│   │   └── notification.queue.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── booking.routes.js
│   │   └── event.routes.js        uploadImage middleware on POST and PUT
│   ├── workers/
│   │   └── notification.worker.js
│   ├── app.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/
        │   ├── auth.js
        │   ├── bookings.js
        │   ├── client.js          fetch wrapper — handles both JSON and FormData
        │   ├── events.js          getEvents accepts search + location params
        │   └── upload.js          buildEventFormData() helper
        ├── components/
        │   ├── EventCard.jsx
        │   ├── EventFormModal.jsx  Sends multipart/form-data, image preview
        │   ├── Modal.jsx
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx
        └── pages/
            ├── EventsPage.jsx      Title search + location filter
            ├── LoginPage.jsx
            ├── MyBookingsPage.jsx
            ├── OrganizerDashboard.jsx
            └── RegisterPage.jsx
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free) for the database
- A [Cloudinary](https://cloudinary.com) account (free) for image storage

### 1. Clone the repo

```bash
git clone https://github.com/monojmkd/event-booking-system.git
cd event-booking-system
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables below)
node server.js
```

Backend runs on `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
DATABASE_URL=postgres://user:password@host:5432/database
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get your Cloudinary credentials from [cloudinary.com](https://cloudinary.com) → Dashboard.

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

> Supabase environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are no longer used and should be removed.

---

## API Reference

### Auth

| Method | Endpoint         | Auth | Body                          |
| ------ | ---------------- | ---- | ----------------------------- |
| POST   | `/auth/register` | —    | `name, email, password, role` |
| POST   | `/auth/login`    | —    | `email, password`             |

### Events

| Method | Endpoint      | Auth | Role            | Notes                                                                        |
| ------ | ------------- | ---- | --------------- | ---------------------------------------------------------------------------- |
| GET    | `/events`     | —    | Public          | Supports `?search=` and `?location=` query params                            |
| POST   | `/events`     | ✓    | organizer       | `multipart/form-data` — includes optional `image` field                      |
| PUT    | `/events/:id` | ✓    | organizer (own) | `multipart/form-data` — replaces old image on Cloudinary if new one uploaded |

#### Search query params

```
GET /events?search=music&location=berlin&page=1&limit=10
```

| Param      | Type   | Description                                |
| ---------- | ------ | ------------------------------------------ |
| `search`   | string | Case-insensitive partial match on title    |
| `location` | string | Case-insensitive partial match on location |
| `page`     | number | Page number (default 1)                    |
| `limit`    | number | Results per page (default 10, max 100)     |

### Bookings

| Method | Endpoint    | Auth | Role     |
| ------ | ----------- | ---- | -------- |
| POST   | `/bookings` | ✓    | customer |
| GET    | `/bookings` | ✓    | customer |

---

## Background Tasks

The backend uses a custom in-memory job queue (no Redis required) built on Node's `EventEmitter`. Two background tasks run asynchronously after their triggering HTTP response is already sent.

### Task 1 — Booking Confirmation

Triggered when a customer successfully books tickets. Logs a confirmation "email" to the console with the customer name, event title, and ticket count.

### Task 2 — Event Update Notification

Triggered when an organizer updates an event. Queries all customers with confirmed bookings for that event and logs a notification "email" for each one.

---

## Design Decisions

### Image storage moved from Supabase to Cloudinary

Supabase free tier pauses after 7 days of inactivity, making all stored images unavailable until the project is manually resumed. Cloudinary's free tier has no inactivity pause and serves images via a global CDN.

Images are uploaded through the backend rather than directly from the browser. This keeps Cloudinary API credentials server-side only and lets the backend enforce authentication — only logged-in organizers can upload images.

When an organizer replaces an event image, the old Cloudinary asset is deleted automatically (`deleteOldImage` in `upload.middleware.js`) to avoid accumulating orphaned files.

```
Organizer selects image in EventFormModal
        ↓
Frontend builds multipart/form-data (fields + image)
        ↓
POST /events  (Content-Type: multipart/form-data)
        ↓
uploadImage middleware streams file to Cloudinary
        ↓
req.file.path = "https://res.cloudinary.com/..."
        ↓
Controller saves URL to Neon (Events.imageUrl)
        ↓
Frontend renders <img src={url}> — always loads
```

### Price stored in cents

All monetary values are stored as integers representing cents (e.g. `4999` = $49.99). This avoids floating-point precision issues with currency arithmetic. The frontend converts to dollars for display and back to cents before sending to the API.

### Title and location search

`GET /events` accepts optional `?search=` (matches event title) and `?location=` (matches location) query parameters. Both use PostgreSQL `ILIKE` for case-insensitive partial matching and can be combined. The frontend debounces both inputs at 400ms so the API is not called on every keystroke.

### Atomic bookings via database transaction

The availability check and ticket decrement are wrapped in a single Sequelize transaction with a pessimistic row lock (`{ lock: true }`). This prevents two concurrent requests from double-booking the last seat — the second request waits at the database level until the first commits, then reads the updated count.

### JWT is stateless

Sessions are not stored server-side. The token contains `{ id, email, role, name }` and is verified on every request. Server restarts don't log users out and the API scales horizontally without a shared session store. Tokens expire after 7 days.

### Role checks are two-layered

- `role.middleware.js` guards routes by role category (organizer vs customer)
- Controllers enforce resource ownership (e.g. an organizer can only edit their own events)

This keeps route files declarative and keeps ownership logic close to the data.

### In-memory job queue

The notification queue is a simple EventEmitter-based FIFO queue with no external dependencies. Jobs are processed one at a time so handlers never race each other. The trade-off is that pending jobs are lost on server restart — acceptable here since notifications are best-effort.

---

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any changes you wish to make.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.

---

Connect with Me — [LinkedIn](https://www.linkedin.com/in/monoj-kumar-das-019340a9/)
