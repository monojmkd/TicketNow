# Event Booking System

A Node.js backend for managing event bookings with user authentication and role-based access control.

## Features

- User registration and authentication
- Event creation and management
- Booking system
- Role-based access control (user/admin)
- Event-driven architecture

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env` file:
   ```
   MONGO_URI=mongodb://localhost:27017/event-booking
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```
4. Start MongoDB
5. Run the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login

### Events

- GET /api/events
- GET /api/events/:id
- POST /api/events (auth required)
- PUT /api/events/:id (auth required, owner only)
- DELETE /api/events/:id (auth required, owner only)

### Bookings

- GET /api/bookings (auth required)
- GET /api/bookings/:id (auth required, owner only)
- POST /api/bookings (auth required)
- PUT /api/bookings/:id/cancel (auth required, owner only)

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
