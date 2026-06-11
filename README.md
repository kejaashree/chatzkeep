# ChatzKeep — Healthcare Recruitment Messaging Platform

A full-stack MERN + Socket.io real-time messaging platform for healthcare recruitment.

---

## 🗂 Project Structure

```
chatzkeep/
├── backend/        Express.js REST API + Socket.io
└── frontend/       Next.js 14 application
```

---

## ⚙️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind  |
| Backend    | Express.js, Node.js               |
| Database   | MongoDB (Atlas)                   |
| Realtime   | Socket.io                         |
| Auth       | JWT + bcrypt                      |
| Files      | Multer                            |

---

## 🚀 Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/chatzkeep.git
cd chatzkeep
```

### 2. Backend setup
```bash
cd backend
npm install

# Copy env template and fill in your values
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/chatzkeep
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
NODE_ENV=development
```

```bash
npm run dev      # starts on :5000
```

### 3. Frontend setup
```bash
cd ../frontend
npm install

cp .env.example .env.local
```

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

```bash
npm run dev      # starts on :3000
```

Open **http://localhost:3000** — you're live!

---

## 📱 Screens

| Screen | Route |
|--------|-------|
| Login | `/login` |
| Register (multi-step) | `/register` |
| Messages / Chat | `/messages` |
| Settings / Profile | `/settings` |

---

## 🌐 Deployment

### Backend → Render.com (Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
5. Add Environment Variables (same as `.env`)
6. Deploy → copy the URL (e.g. `https://chatzkeep-api.onrender.com`)

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Settings:
   - **Root directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://chatzkeep-api.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://chatzkeep-api.onrender.com
   ```
5. Deploy → your app is live!

### MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://cloud.mongodb.com)
2. Create free M0 cluster
3. Database Access → Add user with password
4. Network Access → Allow `0.0.0.0/0` (all IPs)
5. Connect → copy connection string into `MONGO_URI`

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (JWT) |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | All conversations |
| GET | `/api/messages/:convId` | Messages in conversation |
| POST | `/api/messages` | Send message |
| POST | `/api/messages/conversation/start` | Start conversation |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?q=` | Search users |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/:id` | Get user by ID |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file (message attachment) |
| POST | `/api/upload/avatar` | Upload profile picture |

---

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user:join` | Client → Server | User comes online |
| `message:send` | Client → Server | Send message |
| `message:receive` | Server → Client | Receive message |
| `message:typing` | Client → Server | Typing indicator |
| `message:stopTyping` | Client → Server | Stop typing |
| `users:online` | Server → Client | Online users list |
| `notification:new` | Server → Client | New notification |
