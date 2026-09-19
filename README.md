# YogiTrack

A MERN-stack (MongoDB, Express, React, Node.js) web application for tracking yoga practice.

## Project structure

```
YogiTrack/
├── client/    React app (Vite)
├── server/    Express API + Mongoose models
├── Procfile   Heroku process definition
└── package.json   Root scripts that orchestrate client + server
```

## Prerequisites

- Node.js 24.x and npm
- A MongoDB Atlas cluster (free tier is fine) — get a connection string from https://cloud.mongodb.com
- A Heroku account (Eco Dyno plan, ~$5/mo) for deployment
- Git and a GitHub repo for source control

## Local development setup

1. Install dependencies for both apps:
   ```bash
   npm run install:all
   ```
2. Create `server/.env` from the example and fill in your MongoDB Atlas connection string:
   ```bash
   cp server/.env.example server/.env
   ```
3. Run both client and server together:
   ```bash
   npm run dev
   ```
   - Client (Vite): http://localhost:5173
   - Server (Express API): http://localhost:5000
   - The client dev server proxies `/api/*` requests to the Express server.
4. Visit http://localhost:5173 — it should show "API + DB connected" once `MONGODB_URI` is set correctly.

## Deployment (Heroku)

The app is structured as a single Heroku app: Express serves the built React static files in production.

```bash
heroku create yogitrack
heroku config:set MONGODB_URI="<your Atlas connection string>"
heroku config:set NODE_ENV=production
git push heroku main
```

Heroku runs `heroku-postbuild` (installs both apps' dependencies and builds the client), then starts the app via the `Procfile` (`npm start`, which runs the Express server).

## Scripts (root package.json)

| Script | Description |
| --- | --- |
| `npm run dev` | Run client + server concurrently for local development |
| `npm run install:all` | Install dependencies for both client and server |
| `npm run build` | Build the production client bundle |
| `npm start` | Start the Express server (serves the built client in production) |
