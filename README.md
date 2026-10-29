# NoteMate — AI-Powered Notes App

NoteMate is a sleek, responsive, and minimalist note-taking application powered by **React 18 + Vite**, **Node.js + Express**, **Supabase (Auth & PostgreSQL)**, and **Google Gemini 3.5 Flash** for intelligent note summarization and automatic tagging.

---

## Features

- 🔐 **Supabase Authentication**: Secure email & password signup, login, and session persistence.
- 🛡️ **Row-Level Security (RLS)**: Strictly protected data where users can only view, create, edit, and delete their own notes.
- ⚡ **Real-Time Client-Side Search**: Instantly filter your notes by title, content, or tags.
- 🤖 **AI Summarize with Gemini**: Generates 2–3 sentence executive summaries and exactly 3 lowercase tags with structured JSON output.
- 📱 **Modern Responsive UI**: Built with Tailwind CSS, featuring loading spinners, error banners, and clean mobile-friendly layouts.
- 🚀 **Production-Ready**: Configured for continuous deployment on **Render** (Server) and **Vercel** (Client).

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS v3, `@supabase/supabase-js` v2, Lucide React.
- **Backend**: Node.js 20+, Express 4 (ES modules), `@google/genai`, `@supabase/supabase-js` v2, Zod, Helmet, CORS, Express Rate Limit, pg.
- **Database**: Supabase PostgreSQL with pgcrypto, automatic timestamp triggers, and Row Level Security (RLS).
- **AI**: Google Gemini (`gemini-3.5-flash`) via the official `@google/genai` SDK with strict JSON schema enforcement.

---

## Project Structure

```
notemate/
├── .gitignore
├── README.md
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── server/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── scripts/
│   │   └── migrate.js
│   └── src/
│       ├── index.js
│       ├── lib/
│       │   ├── env.js
│       │   ├── gemini.js
│       │   └── supabase.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── validate.js
│       └── routes/
│           ├── health.js
│           └── notes.js
└── client/
    ├── .env.example
    ├── .env
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── lib/
        │   ├── api.js
        │   └── supabase.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── ErrorBanner.jsx
        │   ├── Navbar.jsx
        │   ├── NoteCard.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── Spinner.jsx
        │   └── TagChip.jsx
        └── pages/
            ├── Login.jsx
            ├── NoteEditor.jsx
            ├── NotesList.jsx
            └── Signup.jsx
```

---

## Local Development Setup

### 1. Prerequisites
- **Node.js 20+** installed.
- A **Supabase** account and project ([supabase.com](https://supabase.com)).
- A **Google Gemini API Key** ([aistudio.google.com](https://aistudio.google.com)).

---

### 2. Configure Environment Variables

#### Server Environment (`server/.env`)
Copy `server/.env.example` to `server/.env` and fill in the values:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_DB_URL=postgresql://postgres.your-project-ref:YOUR_DB_PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres
```

> **Note**: `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` exist strictly on the backend and are never sent to the client.

#### Client Environment (`client/.env`)
Copy `client/.env.example` to `client/.env` and fill in the values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:5000
```

---

### 3. Run Database Migrations

You can run the migration script directly using the CLI:

```powershell
cd server
npm.cmd run migrate
```

*Or manually:*
1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`.
3. Click **Run**.

---

### 4. Install Dependencies & Run

Open two terminal windows:

#### Terminal 1 — Backend Server
```powershell
cd server
npm.cmd install
npm.cmd run dev
```
The server will start at `http://localhost:5000`. You can verify health at `http://localhost:5000/api/health`.

#### Terminal 2 — Frontend Client
```powershell
cd client
npm.cmd install
npm.cmd run dev
```
The client will start at `http://localhost:5173`. Open your browser to start taking notes!

---

## Deployment Guide

### Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New Web Service**.
2. Connect your Git repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-app.vercel.app` (your frontend Vercel URL)
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `GEMINI_MODEL`: `gemini-3.5-flash`
   - `SUPABASE_URL`: `https://your-project-ref.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_key`

---

### Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
2. Select your Git repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the following **Environment Variables**:
   - `VITE_SUPABASE_URL`: `https://your-project-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your_supabase_anon_key`
   - `VITE_API_BASE_URL`: `https://your-backend-name.onrender.com` (your Render backend URL)
5. Deploy! Vercel uses `client/vercel.json` to handle client-side routing rewrites smoothly.

