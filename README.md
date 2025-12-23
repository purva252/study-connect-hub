# Study Connect Hub

A collaborative study platform for students and teachers.

## Project Structure

```
study-connect-hub/
├── frontend/          # Vite + React + Tailwind CSS frontend
├── backend/           # Express + TypeScript backend API
└── README.md
```

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd study-connect-hub

# Install dependencies for both frontend and backend
npm run install:all
```

### Development

```sh
# Run both frontend and backend concurrently
npm run dev

# Or run them separately:
npm run dev:frontend  # Frontend on http://localhost:8080
npm run dev:backend   # Backend on http://localhost:5000
```

### Building for Production

```sh
# Build both frontend and backend
npm run build

# Or build separately:
npm run build:frontend
npm run build:backend

# Start the production backend server
npm run start:backend
```

## Technologies

### Frontend
- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn-ui
- React Router
- Framer Motion

### Backend
- Express.js
- TypeScript
- CORS
- dotenv

## Deployment

Deploy this project using your preferred cloud provider or static hosting service (e.g., Vercel, Netlify, GitHub Pages for frontend, and Heroku, Railway, or Render for backend).

## Custom Domain

To connect a domain, follow your hosting provider's instructions for custom domains.
