# Admin Dashboard + API

## Overview
This repo contains a protected Admin Dashboard frontend and a JWT-secured REST API backend. The dashboard manages authors, posts, and admin accounts, with role-based access and soft-delete behavior.

## Folder Structure
- `client` - React dashboard (Vite + TypeScript + Tailwind + framer-motion)
- `server` - Express API (TypeScript + MongoDB)

## Run Locally
### Backend (server)
1. `cd server`
2. `npm install`
3. Create `.env` using `server/.env` (or copy `server/.env.example` if present) and set:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `PORT`
4. `npm run dev`

### Frontend (client)
1. `cd client`
2. `npm install`
3. Create `.env` and set:
   - `VITE_API_URL` (e.g. `http://localhost:5000`)
4. `npm run dev`

## Auth Flow
- Register and login return a JWT token.
- The client stores the token in localStorage and sends it as `Authorization: Bearer <token>` on protected routes.

## Roles
- `super_admin`
  - Can list admins.
  - Can deactivate admins.
  - Can change admin roles.
- `admin`
  - Can manage authors and posts.
  - Cannot access admin management endpoints.

## Postman Collection
- `server/postman-result.json`

## Soft Delete Notes
- Users and other entities are soft-deleted by setting `isActive=false` (and `deletedAt` when applicable).
- List endpoints default to active records only.
