# Ravion AI

A full-stack AI-powered chat application that supports **text generation** and **AI image generation**, with a community gallery for sharing creations.

## Features

- **AI Text Chat** — Conversational AI powered by Google Gemini 2.0 Flash
- **AI Image Generation** — Generate images from text prompts via ImageKit AI
- **Community Gallery** — Publish and browse AI-generated images shared by users
- **Authentication** — Email/password registration and Google OAuth via Firebase
- **Credit System** — Users receive credits for AI interactions (1 for text, 2 for images)
- **Chat Management** — Create, switch between, and delete conversation threads
- **Dark Mode** — Built-in dark theme support
- **Markdown & Code Highlighting** — AI responses render with full markdown and syntax highlighting

## Tech Stack

### Frontend
- React 19 + React Router
- Vite (Rolldown)
- Tailwind CSS
- Firebase Authentication
- Axios

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- Google Gemini API (via OpenAI SDK)
- ImageKit (image generation & storage)
- JWT authentication
- bcrypt password hashing

## Project Structure

```
RavionAi/
├── client/                 # React frontend
│   ├── src/
│   │   ├── assets/         # Icons, images, styles
│   │   ├── components/     # ChatBox, Message, Sidebar
│   │   ├── context/        # Global app state (AppContext)
│   │   └── pages/          # Login, Credits, Community
│   ├── vercel.json         # Frontend deployment config
│   └── package.json
├── server/                 # Express backend
│   ├── configs/            # DB, ImageKit, Gemini setup
│   ├── controllers/        # Route handlers
│   ├── middlewares/        # JWT auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── server.js           # Entry point
│   ├── vercel.json         # Backend deployment config
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key
- ImageKit account
- Firebase project (for Google OAuth)

### 1. Clone the repo

```bash
git clone https://github.com/jitinnailwal/RavionAi.git
cd RavionAi
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Start the server:

```bash
npm run server
```

The backend runs on `http://localhost:3000`.

### 3. Set up the frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_SERVER_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/user/register` | Register a new user | No |
| POST | `/api/user/login` | Login | No |
| GET | `/api/user/data` | Get user profile | Yes |
| GET | `/api/user/published-images` | Get community images | No |
| GET | `/api/chat/create` | Create a new chat | Yes |
| GET | `/api/chat/get` | Get all user chats | Yes |
| POST | `/api/chat/delete` | Delete a chat | Yes |
| POST | `/api/message/text` | Send text prompt | Yes |
| POST | `/api/message/image` | Generate an image | Yes |
| POST | `/api/credits/purchase` | Purchase credits | Yes |

## Deployment

Both frontend and backend are configured for **Vercel** deployment.

**Backend** — Import the repo on Vercel with root directory set to `server`, add the environment variables, and deploy.

**Frontend** — Import the same repo with root directory set to `client`, set `VITE_SERVER_URL` to the deployed backend URL, and deploy.

## License

This project is for educational and personal use.
