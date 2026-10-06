# OpsAI — AI-Powered Incident & Operations Platform

OpsAI is a modern, microservices-based platform designed to streamline incident management, system operations, and team collaboration. Powered by AI and real-time event processing, it helps engineering and operations teams detect, track, and resolve incidents faster.

## 🚀 Key Features

- **Incident Management**: End-to-end incident tracking, resolution workflows, and post-mortems.
- **AI-Powered Insights**: AI integration for root cause analysis, automated triage, and intelligent suggestions.
- **Real-Time Notifications**: Instant alerts and updates via multiple channels.
- **Role-Based Access Control (RBAC)**: Secure access management with fine-grained permissions for users and teams.
- **Event Simulation**: Built-in event simulator for testing and training.
- **Comprehensive Auditing**: Full audit trails for security and compliance.

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Ant Design (antd)
- **Animations**: Framer Motion

### Backend (Microservices)
- **Framework**: Java / Spring Boot
- **Services**:
  - `ai-service`
  - `api-gateway`
  - `audit-service`
  - `auth-service`
  - `event-simulator`
  - `incident-service`
  - `notification-service`
  - `team-service`

### Data & Infrastructure
- **Database**: PostgreSQL (Isolated databases per microservice: `opsai_auth`, `opsai_teams`, `opsai_incident`, etc.)
- **Message Broker**: Apache Kafka (v4.0.1)
- **Caching**: Redis (v7)
- **Containerization**: Docker & Docker Compose

## 📂 Project Structure

```
ops-ai/
├── backend/                  # Java/Spring Boot Microservices
│   ├── ai-service/
│   ├── api-gateway/
│   ├── audit-service/
│   ├── auth-service/
│   ├── event-simulator/
│   ├── incident-service/
│   ├── notification-service/
│   └── team-service/
├── frontend/                 # React + Vite Frontend Application
├── docker-compose.yml        # Docker configuration for Redis & Kafka
├── schema.sql                # Complete PostgreSQL Database Schema
└── docx/                     # Documentation and notes
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Java 17+ (for backend services)
- Maven
- Docker & Docker Compose
- PostgreSQL (or run via Docker)

### 1. Database Setup (Local PostgreSQL)
Ensure your local PostgreSQL server is running on port `5432`.
Run `schema.sql` to create all 7 microservice databases (`opsai_auth`, `opsai_teams`, `opsai_incident`, etc.):
```bash
# Using psql on Windows (or execute schema.sql in pgAdmin / DBeaver)
psql -U postgres -f schema.sql
```

### 2. Start Supporting Infrastructure (Redis & Kafka)
Start Redis and Kafka message broker in Docker:
```bash
docker compose up -d
```

### 3. Run Backend Microservices

#### Option A: Run Entire Backend in Docker
Runs all 8 microservices containerized (automatically connects to your local PostgreSQL via `host.docker.internal:5432`):
```bash
docker compose --profile backend up -d --build
```
Or to run a specific service (e.g., auth-service):
```bash
docker compose --profile backend up auth-service -d --build
```

#### Option B: Run Locally via Maven (IDE)
Navigate to any microservice directory and start it:
```bash
cd backend/api-gateway
./mvnw spring-boot:run
```

### 4. Run the Frontend
Navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The frontend will now run at `http://localhost:5173`.

---

## 📖 Detailed Operations & Command Guide
For complete Kafka, Redis, PostgreSQL, log tailing, container healthchecks, and troubleshooting commands, see:
👉 **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)**

## 📄 License
[MIT License](LICENSE) (or specify your license here)
