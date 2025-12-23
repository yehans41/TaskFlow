# TaskFlow

A cloud-native task management platform built with React, Node.js, and .NET - A Trello-style collaborative workspace for teams.

## Features

- **Multi-tier Architecture**: Scalable microservices design with API Gateway pattern
- **JWT Authentication**: Secure user authentication and authorization
- **Hierarchical Task Management**: Workspaces → Boards → Lists → Cards
- **Real-time Caching**: Redis-powered performance optimization
- **Background Processing**: Asynchronous job queue capabilities
- **Production Ready**: Comprehensive unit tests, CI/CD pipeline, AWS deployment
- **Container Native**: Full Docker support for local development and production

## Architecture

```
┌─────────────┐
│   React     │  Port 3000 - Frontend UI
│   Client    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Node.js   │  Port 4000 - API Gateway
│   Gateway   │  • JWT Authentication
└──────┬──────┘  • Request Routing
       │         • Rate Limiting
       ↓
┌─────────────┐
│   .NET 8    │  Port 5000 - Core Business Logic
│   Core API  │  • Task CRUD Operations
└──────┬──────┘  • MySQL Persistence
       │         • Redis Caching
       ↓
┌─────────────────────────┐
│  MySQL    │    Redis    │
│  Database │    Cache    │
└─────────────────────────┘
```

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for HTTP requests
- Context API for state management

### Backend - Gateway
- Node.js 18 with Express
- JWT for authentication
- bcrypt for password hashing
- Redis for session/cache management
- Helmet for security headers

### Backend - Core API
- .NET 8 / C# 12
- Entity Framework Core 8
- MySQL 8.0 with Pomelo driver
- StackExchange.Redis
- xUnit for testing with Moq

### Infrastructure
- Docker & Docker Compose
- GitHub Actions CI/CD
- AWS ECS Fargate
- AWS RDS (MySQL)
- AWS ElastiCache (Redis)
- CloudFormation for IaC

## Quick Start

```bash
# Clone and start all services
git clone https://github.com/yehans41/TaskFlow.git
cd TaskFlow
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Gateway API: http://localhost:4000
# Core API: http://localhost:5000
```

For detailed setup instructions, see [SETUP.md](SETUP.md).

## Project Structure

```
TaskFlow/
├── client/               # React Frontend
├── gateway/              # Node.js API Gateway
├── core/                 # .NET Core API
├── infra/                # AWS deployment configs
├── .github/workflows/    # CI/CD pipelines
└── docker-compose.yml
```

## Key Features Implemented

✅ JWT-based authentication with secure password hashing
✅ MySQL persistence with Entity Framework Core
✅ Redis caching for performance optimization
✅ Repository pattern with service layer architecture
✅ Comprehensive unit tests (xUnit + Moq)
✅ Docker containerization for all services
✅ GitHub Actions CI/CD pipeline
✅ AWS ECS deployment configuration
✅ CloudFormation infrastructure as code

## Testing

```bash
# Gateway tests
cd gateway && npm test

# Core API tests with coverage
cd core && dotnet test --collect:"XPlat Code Coverage"
```

## Deployment

See [infra/DEPLOYMENT.md](infra/DEPLOYMENT.md) for AWS deployment instructions.

The CI/CD pipeline automatically:
- Runs tests on pull requests
- Builds and pushes Docker images on merge to main
- Deploys to AWS ECS Fargate

## Documentation

- **[SETUP.md](SETUP.md)** - Local development setup and API documentation
- **[infra/DEPLOYMENT.md](infra/DEPLOYMENT.md)** - AWS deployment guide

## License

MIT License
