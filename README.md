# Arcade AI - AI-Powered Retro Games

Welcome to Arcade AI, a modern gaming platform that combines classic arcade games with cutting-edge AI technology. This monorepo contains everything needed to run the complete platform locally or deploy to production.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- (Optional) OpenAI-compatible API endpoint for AI features

### Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo-url>
   cd arcade-ai
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy the environment templates and fill in your values:
   
   ```bash
   # Frontend environment
   cp apps/frontend/.env.local.template apps/frontend/.env.local
   
   # Backend environment  
   cp apps/backend/.env.local.template apps/backend/.env.local
   ```

3. **Set up Supabase**
   
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from the API settings
   - Update the `.env.local` files with your Supabase credentials
   - Run the database migration:
     ```bash
     # Apply the schema to your Supabase project
     # Copy the contents of supabase/migrations/create_initial_schema.sql
     # and run it in your Supabase SQL editor
     ```

4. **Start Development Servers**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🏗️ Architecture

### Monorepo Structure

```
arcade-ai/
├── apps/
│   ├── frontend/          # Next.js 14 frontend application
│   └── backend/           # Next.js API backend with serverless functions
├── packages/
│   └── games/             # Shared Phaser.js game modules
├── supabase/
│   └── migrations/        # Database schema and migrations
└── .github/workflows/     # CI/CD automation
```

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, TypeScript, Supabase
- **Games**: Phaser 3 with pixel-perfect rendering
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 🎮 Games

The platform includes three classic arcade games enhanced with AI:

### 1. AI Snake (`packages/games/src/snake/`)
- Classic snake gameplay with smooth controls
- AI-powered difficulty adjustment
- Score tracking and leaderboards

### 2. Neural Tetris (`packages/games/src/tetris/`)
- Traditional tetris mechanics
- AI piece prediction hints
- Advanced scoring system

### 3. Cosmic Defender (`packages/games/src/space-shooter/`)
- Space shooter with dynamic enemies
- AI-generated enemy patterns
- Progressive difficulty scaling

## 🗄️ Database Schema

### Core Tables

- **`games`**: Game metadata and configuration
- **`versions`**: Game code snapshots and iterations  
- **`scores`**: Player scores and leaderboard data
- **`auth.users`**: User authentication (managed by Supabase)

### Security

All tables use Row Level Security (RLS) with policies for:
- Public read access to games and leaderboards
- Authenticated user access to personal data
- Creator access to their own game versions

## 🚢 Deployment

### Automatic Deployment

The project includes GitHub Actions workflows for:
- Automated testing and linting
- Building frontend and backend
- Deploying to Vercel on main branch pushes

### Manual Deployment

#### Frontend (Vercel)
```bash
cd apps/frontend
vercel --prod
```

#### Backend (Vercel Functions)
```bash
cd apps/backend  
vercel --prod
```

### Environment Variables for Production

Set these in your Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_BASE=your_ai_endpoint
OPENAI_API_KEY=your_ai_api_key
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start all apps in development mode
npm run build           # Build all apps for production
npm run start           # Start all apps in production mode

# Code Quality
npm run lint            # Run ESLint across all packages
npm run type-check      # Run TypeScript compiler checks
npm run test            # Run test suites

# Utilities
npm run clean           # Clean build artifacts
npm run format          # Format code with Prettier
```

### Adding New Games

1. Create a new game directory in `packages/games/src/`
2. Implement your game class extending Phaser.Scene
3. Export the game from `packages/games/src/index.ts`
4. Add the game to the frontend game grid
5. Create database entries for the new game

### Working with the Shared Games Package

The `@arcade-ai/games` package contains all Phaser game implementations:

```typescript
import { SnakeGame, createSnakeGame } from '@arcade-ai/games'

// Use in your frontend components
const gameConfig = createGameConfig('game-container')
const game = createSnakeGame(gameConfig)
```

## 🧪 Testing

### Game Testing
- Phaser games include built-in smoke tests
- Manual testing protocols for each game
- Performance benchmarking for 60fps gameplay

### API Testing
- Integration tests for all backend endpoints
- Database connection and query testing
- Authentication flow validation

## 📚 API Documentation

### Health Check
- `GET /api/health` - Service health status

### Games API
- `GET /api/games` - List all available games
- `POST /api/games` - Create a new game (authenticated)

### Scores API  
- `GET /api/scores?game_id=<id>&limit=10` - Get leaderboard
- `POST /api/scores` - Submit a new score (authenticated)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
- Check the GitHub Issues tab
- Review the documentation in each package
- Ensure your Supabase configuration is correct
- Verify all environment variables are set

---

Built with ❤️ using modern web technologies and classic gaming nostalgia.