# Blog Platform REST API (Admin-Managed) 

Production-ready REST API built with Node.js, Express, TypeScript, and MongoDB Atlas.  
An admin-authenticated system that manages Users, Authors, and Posts.  
Posts are linked to Authors using MongoDB ObjectId references.

---

## Features

- JWT Authentication (Register & Login)
- Role-based access (admin only)
- Soft Delete for Posts, Authors, and Users
- Full CRUD for Authors and Posts
- Filtering, sorting, pagination
- Search using q
- Zod request validation
- Centralized error handling

---

## Tech Stack

Node.js • Express • TypeScript • MongoDB (Mongoose)  
JWT • bcrypt • Zod

---

## System Roles

### User (Admin)

System account that logs in and manages everything.  
Receives JWT token and must send it with requests.

### Author

Blog writer profile.  
Does not log in. Used as reference in posts.

### Post

Blog article created by admin and linked to an author.

---

## Authentication

### Register

POST http://localhost:5000/api/auth/register

### Login

POST http://localhost:5000/api/auth/login

Login returns a JWT token.  
All protected requests must include:

Authorization: Bearer YOUR_TOKEN

---

## Soft Delete Rules

| Resource | Behavior |
|----------|----------|
| Posts | Marked status: deleted + deletedAt |
| Authors | Marked deleted (cannot delete if posts still exist) |
| Users | Deactivated (isActive: false) |

Deleted items do not appear in GET results.

---

## Main API Endpoints

### Health

GET http://localhost:5000/health

---

### Users (Admin)

GET http://localhost:5000/api/users  
PATCH http://localhost:5000/api/users/:id

---

### Authors

POST http://localhost:5000/api/authors  
GET http://localhost:5000/api/authors  
GET http://localhost:5000/api/authors/:id  
PATCH http://localhost:5000/api/authors/:id  
DELETE http://localhost:5000/api/authors/:id  

---

### Posts

POST http://localhost:5000/api/posts  
GET http://localhost:5000/api/posts  
GET http://localhost:5000/api/posts/:id  
PATCH http://localhost:5000/api/posts/:id  
DELETE http://localhost:5000/api/posts/:id  
GET http://localhost:5000/api/posts/author/:authorId  

---

## Query Examples

GET /api/posts?page=1&limit=5  
GET /api/posts?status=published  
GET /api/posts?tag=node  
GET /api/posts?sort=createdAt&order=desc  
GET /api/posts?q=express  
GET /api/authors?q=john  

---

## Run Locally

### 1. Install

npm install

### 2. Create .env

PORT=5000  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret  
JWT_EXPIRES_IN=7d  
NODE_ENV=development  

### 3. Start Server

npm run dev

---

## Server runs at

http://localhost:5000

---

## Notes

Admin dashboard backend (not public blog API)  

All protected routes require JWT  

Soft delete prevents permanent data loss
