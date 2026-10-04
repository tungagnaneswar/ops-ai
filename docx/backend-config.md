# Backend Configuration Documentation

**OpsAI — AI-Powered Incident & Operations Platform**
The project is designed to manage the complete incident lifecycle — from detecting and classifying incidents to assigning teams, sending notifications, investigating issues, generating AI-powered summaries, resolving incidents, and maintaining audit records.

## 1. Microservices Setup & Ports

The backend architecture consists of several microservices, each running on a distinct port. Ensure that all microservices and databases run in their respective isolated Docker containers.

**Infrastructure Services:**
- **Database (PostgreSQL)**: Port `5432` - Main relational database
- **Redis**: Port `6379` - In-memory data store / caching
- **Kafka**: Port `9092` - Message broker / event streaming

**Backend Services:**
- **api-gateway**: Port `8080` - Gateway service to route external requests
- **auth-service**: Port `8081` - Authentication and authorization service
- **incident-service**: Port `8082` - Service for incident management
- **team-service**: Port `8083` - Service for team management
- **notification-service**: Port `8084` - Service for handling notifications
- **audit-service**: Port `8085` - Service for audit logging
- **ai-service**: Port `8086` - Service for AI functionalities
- **event-simulator**: Port `8087` - Service for event simulation

## 2. Testing Authentication

**Test Login Workflow:**
1. Send a login request with valid credentials to the `auth-service`.
2. **Generate new token**: Receive the authentication token from the response.
3. **Use the token**: Include the token in the `Authorization` header (e.g., `Bearer <token>`) for subsequent requests to access protected routes.
