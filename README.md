# Emirates SDET Case Study

## 🎯 Overview

This project demonstrates a microservices architecture with Frontend, API Gateway, and Backend services.

## 🏗️ Architecture

```
┌─────────────────┐                    ┌─────────────────┐
│   Frontend      │                    │    Backend      │
│   (HTML/JS)     │───────────────────►│   (Node.js)     │
│                 │                    │                 │
│ - User Interface│                    │ - Business Logic│
│ - Direct API    │                    │ - Data Manager  │
└─────────────────┘                    └─────────────────┘
                                              ▲
                                              │
┌─────────────────┐    ┌─────────────────┐    │
│ External        │    │  API Gateway    │    │
│ Consumers       │───►│   (Spring Boot) │────┘
│                 │    │                 │
│ - Third-party   │    │ - Request Router│
│ - Mobile Apps   │    │ - Load Balancer │
└─────────────────┘    └─────────────────┘
```

### Service Components

- **Frontend**: HTML5/JavaScript web interface for internal team use (connects directly to Backend)
- **API Gateway**: Spring Boot service that routes external requests to backend
- **Backend**: Node.js service that manages application data
- **External Consumers**: Third-party systems consuming the API Gateway
- **Frontend Node.js Test Harness (Pact)**: Node.js test environment living under `frontend/` that plays two roles:
  - Acts as the Frontend consumer for the Backend (consumer-driven contracts)
  - Simulates a third-party External Consumer for the API Gateway

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Java 17+
- Maven 3.6+

### Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd emirates-studyCase
   ```

2. **Start All Services**
   ```bash
   ./start.sh
   ```

3. **Access Services**
   - Frontend: http://localhost:8000
   - Backend: http://localhost:3000
   - API Gateway: http://localhost:8080

## 🔧 API Endpoints

### Backend API (Port 3000)
```
GET  /health                    - Health check
GET  /api/apps                  - Get all applications
GET  /api/apps/search           - Search applications
GET  /api/apps/:appName         - Get specific application
PUT  /api/apps/:appName         - Update application
DELETE /api/apps/:appName       - Delete application
```

### API Gateway (Port 8080)
```
GET  /health                    - Gateway health check
GET  /                          - Gateway information
GET  /api/apps                  - Forward to backend
GET  /api/apps/search           - Forward to backend
GET  /api/apps/:appName         - Forward to backend
```

## 🧪 Contract Testing

Below are the three contract testing flows with exact commands.

- **General notes**:
  - The Node.js test environment under `frontend/` is a dedicated test harness (Jest + Pact). It does not start a UI; it runs as a Node.js service to produce Pact contracts. It acts as a real Frontend consumer for the Backend and as a simulated third‑party external consumer for the API Gateway.
  - Backend provider verifications hit `http://localhost:3000`. Ensure Backend is running for any provider verification.
  - External consumer tests call the real API Gateway at `http://localhost:8080`. Ensure API Gateway is running for those consumer tests.
  - Pact files are generated under the paths listed at the end of this section.

### 1) Backend Node.js → API Gateway (Consumer Test)
- Location: API Gateway consumer tests (Java) and Backend provider verification (Node.js)
- Commands:
  - Run in `api-gateway` (consumer):
    ```bash
    mvn test -Dtest=BackendConsumerPactTest
    ```
  - Run in `backend` (provider verification):
    ```bash
    npm run test:pact:apigw
    ```
- Prereq for provider verification: Backend running at `:3000`

### 2) Frontend → Backend Node.js (Consumer Test)
- Location: Frontend consumer tests (Node.js) and Backend provider verification (Node.js)
- Commands:
  - Run in `frontend` (consumer):
    ```bash
    npm run test:consumer:backend
    ```
  - Run in `backend` (provider verification):
    ```bash
    npm run test:pact:frontend
    ```
- Prereq for provider verification: Backend running at `:3000`

### 3) External Consumers → API Gateway (Consumer Test)
- Location: Frontend external consumer tests (Node.js) and API Gateway provider verification (Java)
- Commands:
  - Run in `frontend` (consumer):
    ```bash
    npm run test:external:api-gateway
    ```
    This uses the Node.js test harness under `frontend/` to simulate a third‑party consumer against the real API Gateway.
    Requires API Gateway running at `:8080` (use `./start.sh` or `mvn spring-boot:run` in `api-gateway`).
  - Run in `api-gateway` (provider verification):
    ```bash
    mvn test -Dtest=ExternalConsumerProviderTest
    ```
    Starts API Gateway on a random port via SpringBootTest. Requires Backend running at `:3000`.

### Pact file locations
- API Gateway ←→ Backend (from Java consumer test):
  - `api-gateway/target/pacts/api-gateway-backend-provider.json`
- Frontend ←→ Backend (from Node.js consumer test):
  - `frontend/pacts/frontend-consumer-backend-provider.json`
- External Consumer ←→ API Gateway (from Node.js consumer test):
  - `frontend/pacts/external-consumer-api-gateway-provider.json`

## 🛠️ Technology Stack

- **Frontend**: HTML5, JavaScript
- **API Gateway**: Spring Boot, WebFlux
- **Backend**: Node.js, Express
- **Build Tools**: Maven, npm

## 📚 Additional Resources

- **API Documentation**: http://localhost:8080/webjars/swagger-ui/index.html
- **Backend Docs**: http://localhost:3000/api-docs
- **Health Checks**: 
  - Backend: http://localhost:3000/health
  - Gateway: http://localhost:8080/health

## 🤝 Contributing

1. Follow the microservices architecture
2. Ensure all services are running
3. Test API endpoints
4. Update documentation for API changes

## 📄 License

This project is part of the Emirates SDET Case Study.

---

**Built with ❤️ for demonstrating microservices architecture** 