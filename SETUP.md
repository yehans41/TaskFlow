# TaskFlow Setup Guide

## Quick Start (Local Development)

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development without Docker)
- .NET 8 SDK (for local development without Docker)
- MySQL 8.0+ (if running without Docker)
- Redis (if running without Docker)

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <your-repo-url>
cd TaskFlow
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start all services:
```bash
docker-compose up
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Gateway API: http://localhost:4000
   - Core API: http://localhost:5000

5. Create your first account:
   - Navigate to http://localhost:3000/register
   - Fill in your details
   - Start creating workspaces and boards!

### Manual Setup (Without Docker)

#### 1. Set up MySQL

```bash
mysql -u root -p
CREATE DATABASE taskflow;
CREATE USER 'taskflow_user'@'localhost' IDENTIFIED BY 'taskflow_pass';
GRANT ALL PRIVILEGES ON taskflow.* TO 'taskflow_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Set up Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis
```

#### 3. Start Core API (.NET)

```bash
cd core/src/TaskFlow.Core.Api
dotnet restore
dotnet ef database update  # Run migrations
dotnet run
```

#### 4. Start Gateway (Node.js)

```bash
cd gateway
npm install
npm run dev
```

#### 5. Start Client (React)

```bash
cd client
npm install
npm start
```

## Project Structure

```
TaskFlow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   ├── Dockerfile
│   └── package.json
│
├── gateway/               # Node.js API Gateway
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── index.js      # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── core/                 # .NET Core API
│   ├── src/
│   │   └── TaskFlow.Core.Api/
│   │       ├── Controllers/    # API controllers
│   │       ├── Models/         # Data models
│   │       ├── Services/       # Business logic
│   │       ├── Repositories/   # Data access
│   │       └── Data/          # DbContext
│   ├── tests/
│   │   └── TaskFlow.Core.Tests/
│   ├── Dockerfile
│   └── TaskFlow.Core.sln
│
├── infra/                # Infrastructure configuration
│   ├── aws/             # AWS deployment files
│   └── DEPLOYMENT.md    # Deployment guide
│
├── .github/
│   └── workflows/       # CI/CD pipelines
│
├── docker-compose.yml   # Local development setup
└── README.md
```

## Running Tests

### Gateway Tests
```bash
cd gateway
npm test
```

### Core API Tests
```bash
cd core
dotnet test
```

### Run all tests with coverage
```bash
# Gateway
cd gateway && npm test -- --coverage

# Core API
cd core && dotnet test --collect:"XPlat Code Coverage"
```

## API Documentation

### Authentication Endpoints

#### Register
```bash
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```bash
GET http://localhost:4000/api/auth/me
Authorization: Bearer <your-token>
```

### Task Management Endpoints

All task endpoints require authentication via Bearer token.

#### Workspaces
```bash
# Get all workspaces
GET http://localhost:4000/api/tasks/workspaces

# Create workspace
POST http://localhost:4000/api/tasks/workspaces
{
  "name": "My Workspace",
  "description": "Project workspace"
}

# Update workspace
PUT http://localhost:4000/api/tasks/workspaces/:id
{
  "name": "Updated Workspace"
}

# Delete workspace
DELETE http://localhost:4000/api/tasks/workspaces/:id
```

#### Boards
```bash
# Get workspace boards
GET http://localhost:4000/api/tasks/workspaces/:workspaceId/boards

# Create board
POST http://localhost:4000/api/tasks/workspaces/:workspaceId/boards
{
  "name": "Sprint Planning",
  "description": "Q1 2024 Sprint"
}

# Get board details
GET http://localhost:4000/api/tasks/boards/:id

# Update board
PUT http://localhost:4000/api/tasks/boards/:id

# Delete board
DELETE http://localhost:4000/api/tasks/boards/:id
```

#### Lists
```bash
# Get board lists
GET http://localhost:4000/api/tasks/boards/:boardId/lists

# Create list
POST http://localhost:4000/api/tasks/boards/:boardId/lists
{
  "name": "To Do",
  "position": 0
}
```

#### Cards
```bash
# Get list cards
GET http://localhost:4000/api/tasks/lists/:listId/cards

# Create card
POST http://localhost:4000/api/tasks/lists/:listId/cards
{
  "title": "Implement user authentication",
  "description": "Add JWT-based auth",
  "priority": "high",
  "position": 0
}

# Update card
PUT http://localhost:4000/api/tasks/cards/:id

# Delete card
DELETE http://localhost:4000/api/tasks/cards/:id
```

## Environment Variables

### Gateway (.env)
```
NODE_ENV=development
PORT=4000
CORE_API_URL=http://localhost:5000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
```

### Core API (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=taskflow;User=taskflow_user;Password=taskflow_pass;"
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  }
}
```

### Client (.env)
```
REACT_APP_GATEWAY_URL=http://localhost:4000
```

## Troubleshooting

### Docker Issues

**Services won't start:**
```bash
docker-compose down -v
docker-compose up --build
```

**Database connection errors:**
- Ensure MySQL container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs mysql`

### Port conflicts:
```bash
# Check if ports are already in use
lsof -i :3000  # Client
lsof -i :4000  # Gateway
lsof -i :5000  # Core API
lsof -i :3306  # MySQL
lsof -i :6379  # Redis
```

### Database Migration Issues

```bash
cd core/src/TaskFlow.Core.Api
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Development Tips

1. **Hot Reload**: All services support hot reload in development mode
2. **Database Inspection**: Use MySQL Workbench or DBeaver to inspect the database
3. **Redis Inspection**: Use Redis Commander or redis-cli
4. **API Testing**: Import the Postman collection (if provided) or use the Swagger UI at http://localhost:5000/swagger

## Next Steps

1. Explore the codebase
2. Create your first workspace and board
3. Review the deployment guide in [infra/DEPLOYMENT.md](infra/DEPLOYMENT.md)
4. Set up CI/CD with GitHub Actions
5. Deploy to AWS following the deployment guide

## Support

For issues and questions:
- Check existing GitHub issues
- Create a new issue with detailed information
- Include logs and error messages
