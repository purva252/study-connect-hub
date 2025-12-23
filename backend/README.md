# Backend

Express + TypeScript backend API for Study Connect Hub.

## API Endpoints

- `GET /` - API welcome message
- `GET /api/health` - Health check endpoint

## Development

```sh
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
PORT=5000
NODE_ENV=development
```

## Tech Stack

- Express.js
- TypeScript
- CORS
- dotenv
