# DevOps Microservices Pipeline

A complete DevOps pipeline for microservices using Docker, Kubernetes, Jenkins, and GitHub. This project demonstrates modern microservices architecture with automated CI/CD, containerization, orchestration, and monitoring.

## Project Structure

```
├── services/                    # Microservices
│   ├── user-service/           # User management service
│   └── order-service/          # Order management service
├── shared/                     # Shared utilities and libraries
│   └── utils/                  # Common utilities package
├── .kiro/                      # Kiro specifications and configurations
│   └── specs/                  # Feature specifications
└── package.json                # Root package.json for workspace management
```

## Services

### User Service (Port 3001)
- **Endpoints:**
  - `GET /api/users` - Get all users
  - `GET /api/users/:id` - Get user by ID
  - `POST /api/users` - Create new user
  - `PUT /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user
  - `GET /health` - Health check
  - `GET /health/ready` - Readiness probe
  - `GET /health/live` - Liveness probe

### Order Service (Port 3002)
- **Endpoints:**
  - `GET /api/orders` - Get all orders (supports ?userId filter)
  - `GET /api/orders/:id` - Get order by ID
  - `POST /api/orders` - Create new order
  - `PUT /api/orders/:id` - Update order status
  - `DELETE /api/orders/:id` - Cancel order
  - `GET /health` - Health check
  - `GET /health/ready` - Readiness probe
  - `GET /health/live` - Liveness probe

## Getting Started

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Install dependencies for all services:
```bash
npm install --workspaces
```

### Running Services

#### Development Mode
```bash
# Run all services in development mode
npm run dev

# Or run individual services
cd services/user-service && npm run dev
cd services/order-service && npm run dev
```

#### Production Mode
```bash
# Build all services
npm run build

# Start all services
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests for specific service
cd services/user-service && npm test
```

### Linting

```bash
# Lint all services
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Configuration

Each service has an `.env.example` file. Copy these to `.env` files and configure as needed:

```bash
# For user-service
cp services/user-service/.env.example services/user-service/.env

# For order-service
cp services/order-service/.env.example services/order-service/.env
```

## API Examples

### User Service Examples

```bash
# Get all users
curl http://localhost:3001/api/users

# Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get user by ID
curl http://localhost:3001/api/users/1

# Update user
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated"}'

# Health check
curl http://localhost:3001/health
```

### Order Service Examples

```bash
# Get all orders
curl http://localhost:3002/api/orders

# Get orders for specific user
curl http://localhost:3002/api/orders?userId=1

# Create an order
curl -X POST http://localhost:3002/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "items": [
      {
        "productId": "p1",
        "name": "Product 1",
        "quantity": 2,
        "price": 29.99
      }
    ]
  }'

# Update order status
curl -X PUT http://localhost:3002/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Health check
curl http://localhost:3002/health
```

## Shared Utilities

The `shared/utils` package provides common functionality:

- **Logger**: Winston-based logging with different levels
- **Validators**: Common validation schemas and functions
- **Response Helpers**: Standardized API response formats
- **Error Handlers**: Custom error classes and global error handling

## Testing Strategy

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Focus on business logic validation

### Integration Tests
- Test complete API workflows
- Test service interactions
- Validate end-to-end functionality

### Test Coverage
- Aim for >80% code coverage
- Include edge cases and error scenarios
- Test both success and failure paths

## Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Testing**: Write unit and integration tests
3. **Code Quality**: Run linting and fix issues
4. **Pull Request**: Create PR with tests and documentation
5. **Review**: Code review and approval process
6. **Merge**: Merge to main branch
7. **Deployment**: Automated deployment via CI/CD pipeline

## Architecture Principles

- **Microservices**: Each service has a single responsibility
- **API-First**: RESTful APIs with consistent response formats
- **Health Checks**: Comprehensive health monitoring
- **Error Handling**: Graceful error handling and logging
- **Validation**: Input validation and sanitization
- **Security**: Security best practices and middleware
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear API documentation and examples

## Next Steps

This project serves as the foundation for implementing:

1. **Docker Containerization** - Multi-stage Dockerfiles
2. **Kubernetes Deployment** - Helm charts and manifests
3. **CI/CD Pipeline** - Jenkins automation
4. **Monitoring Stack** - Prometheus and Grafana
5. **Logging Stack** - ELK stack implementation
6. **Security Scanning** - Container and dependency scanning
7. **Database Integration** - PostgreSQL and Redis
8. **Service Mesh** - Istio for advanced traffic management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.