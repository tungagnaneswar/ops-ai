# OpsAI — Docker & Operations Command Guide

Complete command reference for orchestrating, maintaining, and debugging OpsAI with Docker, PostgreSQL, Redis, Kafka, and the 8 Spring Boot microservices.

---

## 📋 Service Architecture & Port Reference

| Service Name | Where It Runs | Port (Host : Container) | Healthcheck Endpoint | Profile |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | **Local Machine (Native)** | `5432` | `pg_isready -U postgres` | *Native Host Service* |
| **Redis** | Docker | `6379:6379` | `redis-cli ping` | *default* (infra) |
| **Kafka** | Docker | `9092:9092` | Broker API script | *default* (infra) |
| **API Gateway** | Docker | `8080:8080` | `http://localhost:8080/actuator/health` | `backend`, `all` |
| **Auth Service** | Docker | `8081:8081` | `http://localhost:8081/actuator/health` | `backend`, `all` |
| **Incident Service** | Docker | `8082:8082` | `http://localhost:8082/actuator/health` | `backend`, `all` |
| **Team Service** | Docker | `8083:8083` | `http://localhost:8083/actuator/health` | `backend`, `all` |
| **Notification Service** | Docker | `8084:8084` | `http://localhost:8084/actuator/health` | `backend`, `all` |
| **Audit Service** | Docker | `8085:8085` | `http://localhost:8085/actuator/health` | `backend`, `all` |
| **AI Service** | Docker | `8086:8086` | `http://localhost:8086/actuator/health` | `backend`, `all` |
| **Event Simulator** | Docker | `8087:8087` | `http://localhost:8087/actuator/health` | `backend`, `all` |

---

## ⚙️ Centralized Configuration (`.env`)

All configurations (database host, ports, passwords, Kafka broker, JWT secrets) are defined in **one master file** at the project root: **`.env`** (template: `.env.example`).

* If you need to change your local PostgreSQL password, change `DB_PASSWORD=...` in `.env`.
* If you run PostgreSQL on a different port, change `DB_PORT=...` in `.env`.
* **Docker Compose automatically reads `.env`** and injects these values into all microservices. You never need to edit individual service configurations!

---

## 🚀 1. Everyday Development Workflows

### Mode A: Lightweight Development (Recommended for daily IDE coding)
Starts only Redis and Kafka in Docker while using your native local PostgreSQL. Keeps your machine fast and cool while coding in your IDE (IntelliJ / VS Code):
```bash
# 1. Start Redis and Kafka
docker compose up -d

# 2. Check status
docker compose ps
```

Then run your active microservice locally with Maven:
```bash
cd backend/auth-service
./mvnw spring-boot:run
```

---

### Mode B: Full Stack in Docker
Runs Redis, Kafka, and **all 8 backend microservices** containerized (automatically connecting to your local PostgreSQL via `host.docker.internal:5432`):
```bash
# Start full backend stack (builds Docker images if needed)
docker compose --profile backend up -d --build

# View status of all running containers
docker compose --profile backend ps
```

---

### Mode C: Run Only One Microservice in Docker
If you want to test a single microservice (e.g. `auth-service`) in Docker alongside the infra:
```bash
docker compose --profile backend up auth-service -d --build
```

---

## 🗄️ 2. PostgreSQL & Database Commands (Local PostgreSQL)

PostgreSQL runs directly on your Windows host machine (`localhost:5432`). When microservices run inside Docker, they automatically route to your host PostgreSQL via `host.docker.internal:5432`.

### Apply Database Schema to Local PostgreSQL
Open PowerShell or Command Prompt in the project root:
```bash
# Execute schema.sql to create all 7 databases and tables
psql -U postgres -f schema.sql
```
*(Or open and run `schema.sql` directly inside **pgAdmin**, **DBeaver**, or **DataGrip**).*

### Connect to Local PostgreSQL Shell (psql)
```bash
psql -U postgres
```

### Essential `psql` Commands inside the shell:
```sql
-- 1. List all 7 databases
\l

-- 2. Connect to a specific service database
\c opsai_auth
\c opsai_incident
\c opsai_teams

-- 3. List all tables in current database
\dt

-- 4. Describe a specific table structure
\d users;
\d incidents;

-- 5. Query data
SELECT id, username, email, status FROM users;
SELECT id, title, severity, status FROM incidents;

-- 6. Exit psql
\q
```

### Connect directly to a specific database from terminal:
```bash
# Direct access to auth database
psql -U postgres -d opsai_auth

# Direct access to incident database
psql -U postgres -d opsai_incident
```

### Connect via GUI (pgAdmin / DBeaver / DataGrip):
* **Host**: `localhost`
* **Port**: `5432`
* **Username**: `postgres`
* **Password**: `postgres` (or your local postgres password)
* **Databases**: `opsai_auth`, `opsai_incident`, `opsai_teams`, `opsai_notification`, `opsai_audit`, `opsai_ai`, `opsai_event`

---

## 📨 3. Apache Kafka Commands

### Check Broker Connectivity
```bash
docker exec -it ops-ai-kafka /opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### List Topics
```bash
docker exec -it ops-ai-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
```

### Create a Topic Manually
```bash
docker exec -it ops-ai-kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --create --topic incident-events \
  --partitions 3 \
  --replication-factor 1
```

### Tail / Consume Messages in Real Time
```bash
docker exec -it ops-ai-kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic incident-events \
  --from-beginning
```

### Produce a Test Message
```bash
docker exec -it ops-ai-kafka /opt/kafka/bin/kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic incident-events
```

---

## ⚡ 4. Redis Commands

### Ping Redis
```bash
docker exec -it ops-ai-redis redis-cli ping
# Response: PONG
```

### Interactive Redis CLI
```bash
docker exec -it ops-ai-redis redis-cli
```

Inside Redis CLI:
```redis
# View all stored keys
KEYS *

# Monitor all Redis commands in real-time
MONITOR

# Check memory stats
INFO memory

# Exit
QUIT
```

---

## 🪵 5. Viewing Logs & Debugging

### Follow logs for a specific service:
```bash
# API Gateway logs
docker compose logs -f api-gateway

# Auth Service logs
docker compose logs -f auth-service

# Incident Service logs
docker compose logs -f incident-service

# Redis logs
docker compose logs -f redis

# Kafka logs
docker compose logs -f kafka
```

### Follow logs of all backend services simultaneously:
```bash
docker compose --profile backend logs -f
```

### Follow logs with a line limit (last 100 lines):
```bash
docker compose logs -f --tail=100 auth-service
```

---

## 🩺 6. Health Checks & Verification

Verify each service is healthy and responding:

```bash
# API Gateway (8080)
curl http://localhost:8080/actuator/health

# Auth Service (8081)
curl http://localhost:8081/actuator/health

# Incident Service (8082)
curl http://localhost:8082/actuator/health

# Team Service (8083)
curl http://localhost:8083/actuator/health

# Notification Service (8084)
curl http://localhost:8084/actuator/health

# Audit Service (8085)
curl http://localhost:8085/actuator/health

# AI Service (8086)
curl http://localhost:8086/actuator/health

# Event Simulator (8087)
curl http://localhost:8087/actuator/health
```

Expected response for each:
```json
{"status":"UP"}
```

---

## 🔄 7. Rebuilding & Restarting Services

When you make changes to Java code in a service:

### Rebuild and restart only that modified service:
```bash
docker compose --profile backend up -d --build auth-service
```

### Restart a service without rebuilding:
```bash
docker compose restart auth-service
```

### Shell into a running container:
```bash
docker exec -it ops-ai-auth-service sh
```

---

## 🛑 8. Stopping & Teardown

### Stop all containers (keeps database & Kafka data safe):
```bash
docker compose --profile backend down
```

### Stop only infrastructure:
```bash
docker compose down
```

### Factory Reset (Stop containers AND delete all database/Kafka volumes):
> ⚠️ **Warning:** This deletes all stored database records and starts completely fresh on next launch.
```bash
docker compose --profile backend down -v
```

### Prune old Docker build cache & dangling images:
```bash
docker image prune -f
```
