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
- Create, edit events with title, description, date, location, ticket count, price, and cover image
- View a dashboard with stats — tickets sold, capacity, estimated revenue
- Customers with active bookings are automatically notified when an event is updated

### Customer

- Browse all events without signing in
- Register and log in to book tickets
- Quantity selector with live total price calculation
- View booking history grouped by confirmed and cancelled
- Receive real-time toast notifications when a booked event is updated

### General

- JWT-based stateless authentication
- Role-based access control on every protected route
- Atomic ticket booking — race conditions handled via database-level row locking
- Event images uploaded directly to Supabase Storage (bypasses the backend)
- Async background notifications via an in-memory job queue

---

## Tech Stack

### Backend

| Layer           | Choice                                |
| --------------- | ------------------------------------- |
| Runtime         | Node.js                               |
| Framework       | Express                               |
| ORM             | Sequelize                             |
| Database        | PostgreSQL (Neon)                     |
| Auth            | JWT (jsonwebtoken + bcryptjs)         |
| Background jobs | Custom in-memory queue (EventEmitter) |

### Frontend

| Layer        | Choice                                         |
| ------------ | ---------------------------------------------- |
| Framework    | React 18                                       |
| Build tool   | Vite                                           |
| Routing      | React Router v6                                |
| File storage | Supabase Storage (direct browser upload)       |
| Styling      | Pure CSS (custom design system, no UI library) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- - A [Neon](https://neon.tech) account (free) for the database

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
# Fill in your .env values
npm run dev
```

Frontend runs on `http://localhost:5173`

## Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
DATABASE_URL=postgres://user:password@host:5432/database
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
```

### Auth

| Method | Endpoint         | Auth | Body                          |
| ------ | ---------------- | ---- | ----------------------------- |
| POST   | `/auth/register` | —    | `name, email, password, role` |
| POST   | `/auth/login`    | —    | `email, password`             |

### Events

| Method | Endpoint      | Auth | Role            |
| ------ | ------------- | ---- | --------------- |
| GET    | `/events`     | —    | Public          |
| POST   | `/events`     | ✓    | organizer       |
| PUT    | `/events/:id` | ✓    | organizer (own) |

## Background Tasks

The backend uses a custom in-memory job queue (no Redis required) built on Node's `EventEmitter`. Two background tasks are implemented:

### Task 1 — Booking Confirmation

Triggered when a customer successfully books tickets.

### Task 2 — Event Update Notification

Triggered when an organizer updates an event.Notifies all customers with confirmed bookings.

## Design Decisions

### Atomic bookings via database transaction

The availability check and ticket decrement are wrapped in a single Sequelize transaction with a pessimistic row lock (`{ lock: true }`). This prevents two concurrent requests from double-booking the last seat — the second request waits until the first commits, then reads the updated count.

### JWT is stateless

Sessions are not stored server-side. The token contains `{ id, email, role, name }` and is verified on every request. This means server restarts don't log users out and the API can scale horizontally without a shared session store. Tokens expire after 7 days.

### Price stored in cents

All monetary values are stored as integers representing cents (e.g. `4999` = $49.99). This avoids floating-point precision issues with currency arithmetic.

### Image upload bypasses the backend

Event images are uploaded directly from the browser to Neon Storage. The backend only stores the resulting URL string. This keeps the Express server stateless and avoids piping large files through Node.

### In-memory job queue

The notification queue is a simple EventEmitter-based FIFO queue with no external dependencies. Jobs are processed one at a time so handlers never race. The trade-off is that pending jobs are lost on server restart — acceptable for this use case since notifications are best-effort.

### Role checks are two-layered

- `role.middleware.js` guards routes by role category (organizer vs customer)
- Controllers enforce resource ownership (e.g. organizer can only edit their own events)

This keeps route files declarative and keeps ownership logic close to the data.

---

Organizer uploads image
↓
Browser sends file directly to Supabase Storage
↓
Supabase stores the file, returns a public URL
↓
Frontend sends that URL string to your Express backend
↓
Backend saves the URL string into Neon (Events.imageUrl column)
↓
Frontend reads the URL from Neon and renders `<img src={url}/>`

Supabase acts purely as a file host — like AWS S3 or Cloudinary. The actual database record in Neon only ever holds a plain text URL string.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any changes you wish to make.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.
Connect with Me
LinkedIn (https://www.linkedin.com/in/monoj-kumar-das-019340a9/)

```

```
