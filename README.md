# Gelid War

A real-time multiplayer snowball battle game built with Phaser.js and Node.js.

## Tech Stack

- **Frontend:** Phaser.js, TypeScript, Socket.IO Client
- **Backend:** Node.js, Socket.IO, Express (HTTP server)
- **Database:** In-memory (no persistence)

## How to Play

- **G** - Pick up snowballs (max 5)
- **Left Click** - Move to tile (uses A* pathfinding to find closest route)
- **Right Click** - Throw snowball at yellow highlighted tile
- **Revive** - Press button when dead (3 second delay)

## Installation

```bash
# Install dependencies
npm install
cd server && npm install

# Copy environment files
cp .env.default .env
cp server/.env.default server/.env

# Development
npm run dev:all

# Production build
npm run build
```

## Configuration

Edit `.env` files to configure:

- **Frontend:** `VITE_BACKEND_URL` - Backend server URL
- **Backend:** `PORT` - Server port (default: 3000)

## Deployment

### Frontend
Build and serve the `dist/` folder with any static file server.

### Backend
```bash
cd server
npm run build
npm start
```

Runs on port 3000 by default.

## Game Features

- Real-time multiplayer with WebSockets
- A* pathfinding for realistic movement
- Isometric grid-based combat
- Score tracking and player elimination
- 3-second revive system

## Development

- `npm run dev:all` - Start both frontend and backend
- `npm run dev:frontend` - Frontend only
- `npm run dev:backend` - Backend only
