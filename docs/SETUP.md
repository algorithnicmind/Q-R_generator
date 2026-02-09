# 🚀 Setup Guide

Step-by-step guide to set up the Smart QR Generator project locally.

---

## Prerequisites

Before starting, ensure you have:

| Requirement | Version | Check Command      |
| ----------- | ------- | ------------------ |
| Node.js     | 18+     | `node --version`   |
| npm         | 9+      | `npm --version`    |
| MongoDB     | 6.0+    | `mongod --version` |
| Git         | Latest  | `git --version`    |

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Q-R_generator.git
cd Q-R_generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/qr_generator

# Application
BASE_URL=http://localhost:3000
```

### 4. Start MongoDB

**Windows:**

```bash
net start MongoDB
```

**macOS/Linux:**

```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

**Using Docker:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

### 5. Run the Application

**Development mode (with hot reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

### 6. Verify Installation

Open your browser and visit:

- Frontend: `http://localhost:3000`
- API Health: `http://localhost:3000/api/health`

### 7. Configure Cloudinary (For File Uploads)

To enable Video and Document QR codes, you need a free Cloudinary account.

1.  Sign up at [cloudinary.com](https://cloudinary.com/) (Free Tier).
2.  Get your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
3.  Add them to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Environment Variables Reference

| Variable      | Required | Default     | Description               |
| ------------- | -------- | ----------- | ------------------------- |
| `PORT`        | No       | 3000        | Server port               |
| `NODE_ENV`    | No       | development | Environment mode          |
| `MONGODB_URI` | Yes      | -           | MongoDB connection string |
| `BASE_URL`    | Yes      | -           | Public URL for QR codes   |

---

## Project Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm start`     | Start production server                  |
| `npm run dev`   | Start development server with hot reload |
| `npm test`      | Run test suite                           |
| `npm run lint`  | Run ESLint                               |
| `npm run build` | Build for production                     |

---

## Using MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Update `.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/qr_generator
```

---

## Docker Setup (Optional)

### Using Docker Compose

```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/qr_generator
      - BASE_URL=http://localhost:3000
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

Run:

```bash
docker-compose up -d
```

---

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Ensure MongoDB is running

### Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Solution:** Change PORT in .env or stop the other process

### Module Not Found

```
Error: Cannot find module 'xxx'
```

**Solution:** Run `npm install` again

---

## Next Steps

1. Read [API Documentation](./API.md)
2. Understand [Architecture](./ARCHITECTURE.md)
3. Check [Database Schema](./DATABASE.md)
