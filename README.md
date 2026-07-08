# InterviewIQ

A real-time technical interview platform with live video calling, collaborative code editor, AI-powered code feedback, and session management.

## Features

- **Video Calling** — Live video sessions powered by LiveKit
- **Collaborative Code Editor** — Real-time code sync via Socket.IO with Monaco Editor
- **Multi-language Support** — JavaScript (client-side), Python, Java, C++ (JDoodle + Wandbox fallback)
- **Test Cases** — Structured test runner with pass/fail results per problem
- **AI Code Review** — Gemini-powered feedback on correctness, complexity, and code quality
- **Session Management** — Create, schedule, lock, and end interview sessions
- **Invite Links** — Share room links with interviewees and co-interviewers
- **Real-time Notifications** — Socket.IO notifications when a session is created
- **Interviewer Feedback** — Star rating + comments saved per session
- **Session History** — Past sessions with AI feedback and interviewer notes stored in MongoDB

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- Tailwind CSS v4 + shadcn/ui (`@base-ui/react`)
- Monaco Editor
- LiveKit Components React
- Socket.IO Client
- Sonner (toast notifications)

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO
- LiveKit Server SDK
- Google Gemini API (`gemini-1.5-flash`)
- JDoodle API + Wandbox (fallback)
- JWT (access + refresh token auth)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- LiveKit account
- JDoodle account
- Google AI Studio account (Gemini API key)

### Clone the repo

```bash
git clone https://github.com/mrsumitr/InterviewIQ.git
cd InterviewIQ
```

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5001
NODE_ENV=development
DB_URL=your_mongodb_uri
CLIENT_URL=http://localhost:3000
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
JDOODLE_CLIENT_ID=your_jdoodle_id
JDOODLE_CLIENT_SECRET=your_jdoodle_secret
GEMINI_API_KEY=your_gemini_key
```

Seed the problems database:

```bash
npm run seed:problems
```

Start the backend:

```bash
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Video | LiveKit Cloud |

**Vercel env vars:**
```
NEXT_PUBLIC_API_URL    = https://your-render-url.onrender.com/api
NEXT_PUBLIC_SOCKET_URL = https://your-render-url.onrender.com
```

**Render env vars:**
```
NODE_ENV      = production
CLIENT_URL    = https://your-vercel-url.vercel.app
DB_URL        = your_mongodb_uri
(+ all other secrets from .env)
```

## Project Structure

```
InterviewIQ/
├── backend/
│   ├── src/
│   │   ├── controllers/    # auth, interview, livekit, aiFeedback, codeExecution
│   │   ├── models/         # User, Interview, Problem
│   │   ├── routes/         # Express route definitions
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── lib/            # DB, socket, env config
│   │   └── scripts/        # Problem seeder
│   └── package.json
└── frontend/
    ├── app/
    │   ├── dashboard/      # Session management
    │   ├── room/[roomId]/  # Interview room
    │   ├── problems/       # Problem library
    │   └── layout.tsx
    ├── components/         # UI components
    ├── context/            # Auth context
    └── lib/                # API client, socket client
```

## License

MIT
