# Jenkins Microservices Pipeline

> This project uses Jenkins to automatically build and deploy a microservices application. Each service is packaged with Docker, orchestrated with Kubernetes, and updated automatically whenever code changes. The process is fully automated with custom scripts for building, security scanning, pushing, and deploying services, ensuring faster and more reliable development, testing, and deployment.

---

### Situation
Multiple microservices (Node.js backends + React frontend) must be built, tested, scanned, versioned, containerized, and deployed to Kubernetes reliably whenever code changes. Manual steps are time-consuming and error-prone. :contentReference[oaicite:1]{index=1}

### Task
Design and implement a **pipeline as code** (Jenkinsfile) that:
- Builds and tests all services in parallel where possible
- Performs **security scanning** for images
- Tags and pushes images to a registry
- Deploys to **Kubernetes** with health checks, load balancing, and **HPA**
- Triggers automatically on code changes and only rebuilds what changed :contentReference.

### Action
- **Pipeline as Code (Jenkinsfile)** with multi-stage flow: *checkout → install → test → build → scan → push → deploy*, plus branch policy (deploy from `master`).  
- **Docker**: multi-stage Dockerfiles, non-root user, healthcheck; registry tagging with semantic version + Git SHA.  
- **Security**: integrate **Trivy** to block critical vulnerabilities.  
- **Kubernetes**: manifests for Deployments/Services/ConfigMaps, probes, load balancing, and **Horizontal Pod Autoscaler**.  
- **Automation scripts** in `/scripts` to standardize build/push/deploy routines.  

### Result
- **One-click CI/CD** from commit to Kubernetes deployment.  
- **Faster feedback loops** via parallel testing and smart rebuilds.  
- **Higher reliability & security** with automated tests and image scanning.  
- **Scalability** through HPA and multi-replica configs.

---

## Pipeline
<p align="center">
  <img src="https://i.postimg.cc/zBVc3t0Z/a.png" alt="App Diagram"/>
</p>

## Deploy Result
<p align="center">
  <img src="https://i.postimg.cc/SRbfqDPG/b.png" alt="App Diagram"/>
</p>



## 🏗️ Project Architecture

```
├── services/                    # Microservices applications
│   ├── user-service/           # User management API
│   ├── order-service/          # Order processing API
│   └── frontend/               # React web application
├── shared/                     # Common utilities and libraries
│   └── utils/                  # Shared utility functions
├── k8s/                        # Kubernetes deployment manifests
├── scripts/                    # Automation and deployment scripts
└── docker-compose.yml          # Local development orchestration
```

## 🚀 Implementation Progress

<details>
<summary><strong>✅ Phase 1: Application Development</strong></summary>

### Microservices Architecture
- **User Service** (Node.js + Express)
  - RESTful API for user management
  - CRUD operations with validation
  - Health monitoring endpoints
  - Unit and integration testing
- **Order Service** (Node.js + Express)  
  - Order processing and management
  - Service-to-service communication
  - Business logic validation
  - Comprehensive test coverage
- **Frontend Application** (React)
  - Modern SPA with React Router
  - API integration with backend services
  - Responsive UI components
  - State management with React Query

### Shared Infrastructure
- **Common Utilities Package**
  - Centralized logging with Winston
  - Input validation schemas
  - Standardized response helpers
  - Error handling middleware
- **Testing Framework**
  - Jest for unit testing
  - Supertest for API testing
  - Integration test suites
  - Code coverage reporting

</details>

<details>
<summary><strong>✅ Phase 2: Containerization & Build Pipeline</strong></summary>

### Docker Implementation
- **Multi-stage Dockerfiles**
  - Optimized build processes
  - Security best practices
  - Non-root user implementation
  - Health check integration
- **Container Orchestration**
  - Docker Compose for local development
  - Service networking configuration
  - Volume management
  - Environment variable handling

### Build Automation
- **Image Building Scripts**
  - Semantic versioning strategy
  - Git commit hash tagging
  - Automated build processes
  - Cross-platform compatibility
- **Security Scanning**
  - Trivy vulnerability assessment
  - Automated security reporting
  - Build pipeline integration
  - Critical vulnerability blocking
- **Registry Management**
  - Docker Hub integration
  - Image tagging strategies
  - Push automation scripts
  - Multi-environment support

</details>

<details>
<summary><strong>✅ Phase 3: Kubernetes Orchestration</strong></summary>

### Container Orchestration
- **Kubernetes Manifests**
  - Deployment configurations
  - Service definitions
  - ConfigMap management
  - Resource allocation
- **High Availability Setup**
  - Multi-replica deployments
  - Load balancing configuration
  - Health check probes
  - Auto-restart policies
- **Networking & Ingress**
  - Service mesh configuration
  - External traffic routing
  - SSL/TLS termination
  - Path-based routing

### Scalability Features
- **Horizontal Pod Autoscaling**
  - CPU-based scaling policies
  - Memory utilization monitoring
  - Custom metrics integration
  - Automatic scale-up/down
- **Resource Management**
  - CPU and memory limits
  - Quality of Service classes
  - Node affinity rules
  - Resource quotas

</details>

<details>
<summary><strong>✅ Phase 4: Jenkins CI/CD Pipeline</strong></summary>

### Jenkins Setup
- **Docker-based Jenkins** with local agent support
- **Pipeline as Code** using Jenkinsfile
- **Multi-stage pipeline** with parallel execution
- **Branch-based deployment** (master branch only)

### Pipeline Stages
- **📥 Checkout**: Clone code from GitHub repository
- **📦 Install Dependencies**: npm install for all services
- **🧪 Run Tests**: Parallel testing for all microservices
- **🐳 Build Images**: Smart building based on code changes
- **🔒 Security Scan**: Trivy vulnerability scanning
- **📤 Push Images**: Docker Hub registry integration
- **🚀 Deploy**: Kubernetes deployment automation

### Automation Features
- **Auto-trigger** on code changes (Poll SCM)
- **Smart building** - only build when code changes
- **Script integration** - uses existing build/deploy scripts
- **Error handling** - continues pipeline on non-critical failures

</details>

<details>
<summary><strong>🔄 Phase 5: Monitoring & Observability (Planned)</strong></summary>

### Metrics & Monitoring
- Prometheus metrics collection
- Grafana dashboard setup
- Alert manager configuration
- Custom business metrics

### Logging & Tracing
- Centralized logging with ELK stack
- Distributed tracing
- Log aggregation and analysis
- Performance monitoring

</details>



