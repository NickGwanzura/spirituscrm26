# Spiritus CRM

A modern CRM system for creative agencies with AI-powered features.

## Features

- **Authentication**: JWT-based auth with secure password hashing
- **Database**: PostgreSQL via Neon for persistent data storage
- **Clients Management**: Track clients, companies, and contact info
- **Project Management**: Manage projects with status tracking and progress
- **Invoicing**: Create and track invoices with payment status
- **Hosting**: Monitor recurring hosting packages
- **SOP Library**: Document standard operating procedures
- **Contracts**: Generate and store legal contracts
- **Onboarding**: Track client onboarding workflows
- **AI Integration**: Powered by Google Gemini for proposals, SOPs, and contracts

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env` and update with your values:

```bash
# The .env file is already configured with your Neon DB connection
# Just update the JWT_SECRET and GEMINI_API_KEY for production
```

### 3. Run the Backend Server

```bash
npm run server
```

The API will be available at `http://localhost:3001/api`

### 4. Run the Frontend (in a new terminal)

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run server` | Start Express API server (backend) |
| `npm run server:dev` | Start backend with hot reload |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |

## Default Login

After starting the server, create an account by clicking "Sign up" on the login page.

## Database Schema

The following tables are automatically created on first run:

- `users` - System users with authentication
- `clients` - Client records
- `projects` - Project data linked to clients
- `invoices` - Invoice records
- `hosting_packages` - Recurring hosting subscriptions
- `sops` - Standard operating procedures
- `contracts` - Generated contracts
- `onboarding_workflows` - Client onboarding trackers
- `quotes` - Quote/proposal records

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resources (all require Bearer token)
- `GET/POST /api/clients`
- `GET/POST/PUT/DELETE /api/projects`
- `GET/POST/PUT/DELETE /api/invoices`
- `GET/POST/PUT/DELETE /api/sops`
- `GET/POST/PUT/DELETE /api/contracts`
- `GET/POST/PUT/DELETE /api/onboarding`
- `GET/POST /api/hosting`
- `GET/DELETE /api/users`
- `GET /api/dashboard` - Dashboard statistics

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `VITE_API_URL` | API URL for frontend |
| `GEMINI_API_KEY` | Google Gemini API key |

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT + bcryptjs
- **AI**: Google Gemini API
