# DyeInk

A free, modern blog platform with custom domain support. Built with Go, React, TypeScript, and MongoDB.

## Features

- 📝 Create, edit, and delete blog posts
- 🎨 Beautiful dark theme with animated gradient background
- 🌐 Custom domain support with DNS verification
- 🔐 Secure JWT authentication
- 📱 Fully responsive design
- ⚡ Fast and lightweight
- 🍃 MongoDB for flexible, scalable data storage

## Tech Stack

- **Backend**: Go, Gin, MongoDB Driver
- **Frontend**: React, TypeScript, Vite, Zustand
- **Database**: MongoDB
- **Background**: Three.js shader-based animated gradients

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- MongoDB 7+

### Quick Start with Docker

```bash
docker-compose up -d mongodb
```

This starts MongoDB on port 27017.

### Manual Setup

#### MongoDB

Install MongoDB locally or use Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

#### Backend

```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

Backend runs on http://localhost:8080

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Server port |
| MONGO_URI | mongodb://localhost:27017 | MongoDB connection string |
| DATABASE_NAME | dyeink | MongoDB database name |
| JWT_SECRET | (random) | Secret key for JWT signing |
| JWT_EXPIRY_HOURS | 24 | Token expiry in hours |
| UPLOAD_DIR | ./uploads | Directory for uploaded files |
| ALLOWED_ORIGINS | http://localhost:5173 | CORS allowed origins |

## API Endpoints

### Public

- `GET /api/posts` - List published posts
- `GET /api/posts/:slug` - Get post by slug
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Protected (Admin)

- `GET /api/admin/posts` - List all posts
- `POST /api/admin/posts` - Create post
- `PUT /api/admin/posts/:id` - Update post
- `DELETE /api/admin/posts/:id` - Delete post
- `GET /api/admin/domains` - List domains
- `POST /api/admin/domains` - Add domain
- `POST /api/admin/domains/:id/verify` - Verify domain
- `POST /api/admin/upload` - Upload image

## License

MIT
