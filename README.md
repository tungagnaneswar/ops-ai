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

### 1. Start Infrastructure (Redis & Kafka)
Start the required message broker and caching services:
```bash
docker-compose up -d
```

### 2. Database Setup
Execute the `schema.sql` script to create the necessary databases and tables.
> **Note:** PostgreSQL does not support `USE database;`. You must create the databases first as a superuser, then connect to each database individually to run its respective schema section as detailed in the SQL file.

### 3. Run the Backend Services
Navigate to each microservice directory and start it using Maven:
```bash
cd backend/api-gateway
./mvnw spring-boot:run
```
*(Repeat for other necessary services)*

### 4. Run the Frontend
Navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The frontend should now be running at `http://localhost:5173` (or the port specified by Vite).

## 📄 License
[MIT License](LICENSE) (or specify your license here)
